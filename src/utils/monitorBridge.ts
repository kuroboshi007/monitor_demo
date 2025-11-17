const WINDOW_NAME = "MonitorWindow";
const WINDOW_FEATURES = "width=1280,height=800";

declare global {
  interface Window {
    __monitorWindow?: Window | null;
    __monitorChannel?: BroadcastChannel;
  }
}

let lastPayload: any = null;

// Flag to ensure we only attach the request‑update listener once.
let channelRequestHandlerAttached = false;

// Get (and lazily create) the BroadcastChannel for monitor synchronization.
function getChannel() {
  if (!window.__monitorChannel) {
    window.__monitorChannel = new BroadcastChannel("monitor_sync");
  }
  const ch = window.__monitorChannel;
  if (!channelRequestHandlerAttached) {
    ch.addEventListener("message", (evt: MessageEvent) => {
      const { type } = (evt.data as any) || {};
      if (type === "requestUpdate" && lastPayload != null) {
        postUpdateToMonitor(lastPayload);
      }
    });
    channelRequestHandlerAttached = true;
  }
  return ch;
}

// Open the monitor window or reuse the existing one if still open.
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

// Post an update payload to the monitor window and via BroadcastChannel.
export function postUpdateToMonitor(payload: unknown) {
  lastPayload = payload;
  const child = window.__monitorWindow;
  if (child && !child.closed) {
    try {
      child.postMessage(
        { type: "update", data: payload },
        window.location.origin
      );
    } catch {
      // ignore failures: will rely on BroadcastChannel
    }
  }
  getChannel().postMessage({ type: "update", data: payload });
}

export function requestLatestUpdate() {
  getChannel().postMessage({ type: "requestUpdate" });
}

// Attach a listener to close the monitor window and channel on unload.
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

// Attach a listener to receive update messages from the monitor window.
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
