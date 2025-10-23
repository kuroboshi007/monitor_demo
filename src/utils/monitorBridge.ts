// src/utils/monitorBridge.ts
// Responsible for opening/reusing the monitor window, sending updates,
// and closing the child window when the main window unloads.

const WINDOW_NAME = "MonitorWindow";
// We deliberately omit noopener/noreferrer to allow storing a reference
// to the child window and reusing it across button clicks. Without
// noopener the newly opened window remains accessible via __monitorWindow.
const WINDOW_FEATURES = "width=1280,height=800";

declare global {
  interface Window {
    __monitorWindow?: Window | null;
    __monitorChannel?: BroadcastChannel;
  }
}

// Store the most recently sent payload so that a new monitor window can
// request the latest state immediately.  When the parent page sends
// updates via postUpdateToMonitor, this value is updated.
let lastPayload: any = null;

// Flag to ensure we only attach the request‑update listener once.
let channelRequestHandlerAttached = false;

// Ensure a single BroadcastChannel instance.  The channel name must be
// consistent between the parent and child windows.
function getChannel() {
  if (!window.__monitorChannel) {
    window.__monitorChannel = new BroadcastChannel("monitor_sync");
  }
  const ch = window.__monitorChannel;
  // Attach a listener that responds to 'requestUpdate' messages by
  // re‑sending the last known payload. Only attach this listener once.
  if (!channelRequestHandlerAttached) {
    ch.addEventListener("message", (evt: MessageEvent) => {
      const { type } = (evt.data as any) || {};
      if (type === "requestUpdate" && lastPayload != null) {
        // When a monitor page asks for an update, send the cached payload
        // through the normal update mechanism. This will also update
        // lastPayload again, but with the same value.
        postUpdateToMonitor(lastPayload);
      }
    });
    channelRequestHandlerAttached = true;
  }
  return ch;
}

/**
 * Open the monitor window or reuse an existing one.  If the window
 * already exists and is not closed, it is focused and its location is
 * updated to the provided URL (ensuring navigation from other pages).
 * Otherwise a new window is opened.  The returned reference is also
 * stored on the global window object.
 */
export function openOrReuseMonitor(url: string) {
  if (window.__monitorWindow && !window.__monitorWindow.closed) {
    try {
      const child = window.__monitorWindow;
      child.focus();
      // Navigate the existing window if its current URL differs.
      // Some browsers will block if URL is the same; this check avoids unnecessary reloads.
      if (child.location.href !== url) {
        child.location.href = url;
      }
      return child;
    } catch {
      // If any error occurs (e.g. cross‑domain), fall back to opening a new window.
    }
  }
  const w = window.open(url, WINDOW_NAME, WINDOW_FEATURES);
  window.__monitorWindow = w ?? null;
  return w;
}

/**
 * Send an update payload to the monitor window.  The payload should be
 * a plain JSON object that can be cloned across the channel.  If the
 * monitor window exists, a postMessage is sent directly; regardless, a
 * BroadcastChannel message is also emitted as a fallback.
 */
export function postUpdateToMonitor(payload: unknown) {
  // Remember the payload so it can be sent to a newly opened monitor
  lastPayload = payload;
  const child = window.__monitorWindow;
  if (child && !child.closed) {
    try {
      child.postMessage({ type: "update", data: payload }, window.location.origin);
    } catch {
      // ignore failures: will rely on BroadcastChannel
    }
  }
  getChannel().postMessage({ type: "update", data: payload });
}

/**
 * Request the latest selection data from the parent page.  The parent
 * will respond by re‑emitting the last sent payload.  This should be
 * called by the monitor page on mount to ensure it has initial data.
 */
export function requestLatestUpdate() {
  getChannel().postMessage({ type: "requestUpdate" });
}

/**
 * Attach a handler that closes the monitor window when the main window
 * unloads (e.g. user closes the page or navigates away).  This helps
 * enforce a one‑to‑one relationship between the parent and child.
 */
export function attachCloseChildOnUnload() {
  const handler = () => {
    if (window.__monitorWindow && !window.__monitorWindow.closed) {
      try {
        window.__monitorWindow.close();
      } catch {
        /* ignore */
      }
    }
    try {
      window.__monitorChannel?.close();
    } catch {
      /* ignore */
    }
  };
  window.addEventListener("beforeunload", handler, { once: true });
}

/**
 * Listener for child windows: listens for messages on both postMessage
 * and BroadcastChannel and invokes the provided callback when an update
 * payload is received.  Returns a function to remove the listeners.
 */
export function listenMonitorUpdates(onUpdate: (data: any) => void) {
  const origin = window.location.origin;

  const onMsg = (evt: MessageEvent) => {
    if (evt.origin !== origin) return;
    const { type, data } = (evt.data as any) || {};
    if (type === "update") onUpdate(data);
  };
  window.addEventListener("message", onMsg);

  const ch = getChannel();
  const onCh = (evt: MessageEvent) => {
    const { type, data } = (evt.data as any) || {};
    if (type === "update") onUpdate(data);
  };
  ch.addEventListener("message", onCh as any);

  return () => {
    window.removeEventListener("message", onMsg);
    ch.removeEventListener("message", onCh as any);
  };
}