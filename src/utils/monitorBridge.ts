// src/utils/monitorBridge.ts
// 负责：打开/复用监控窗口、发送更新、随主窗关闭而关闭子窗

const WINDOW_NAME = "MonitorWindow";
const WINDOW_FEATURES = "width=1280,height=800,noopener,noreferrer";

// 把引用挂在 window 上，避免热更新或组件卸载导致丢失
declare global {
  interface Window {
    __monitorWindow?: Window | null;
    __monitorChannel?: BroadcastChannel;
  }
}

// 保证单例 BroadcastChannel（可选，用于双向/兜底同步）
function getChannel() {
  if (!window.__monitorChannel) {
    window.__monitorChannel = new BroadcastChannel("monitor_sync");
  }
  return window.__monitorChannel;
}

export function openOrReuseMonitor(url: string) {
  // 已存在且未被用户手动关掉 → 复用并聚焦
  if (window.__monitorWindow && !window.__monitorWindow.closed) {
    try {
      window.__monitorWindow.focus();
      return window.__monitorWindow;
    } catch {
      // ignore
    }
  }
  // 打开新窗口
  const w = window.open(url, WINDOW_NAME, WINDOW_FEATURES);
  window.__monitorWindow = w ?? null;
  return w;
}

// 主窗给子窗发送更新（postMessage）
export function postUpdateToMonitor(payload: unknown) {
  const child = window.__monitorWindow;
  if (child && !child.closed) {
    child.postMessage(
      { type: "update", data: payload },
      window.location.origin
    );
  }
  // 兜底用频道广播（子窗也会监听）
  getChannel().postMessage({ type: "update", data: payload });
}

// 主窗关闭时，主动关闭子窗
export function attachCloseChildOnUnload() {
  const handler = () => {
    if (window.__monitorWindow && !window.__monitorWindow.closed) {
      try {
        window.__monitorWindow.close();
      } catch {
        // 某些浏览器可能拦截，忽略
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

// 供子窗使用：统一监听更新
export function listenMonitorUpdates(onUpdate: (data: any) => void) {
  const origin = window.location.origin;

  const onMsg = (evt: MessageEvent) => {
    if (evt.origin !== origin) return;
    const { type, data } = evt.data || {};
    if (type === "update") onUpdate(data);
  };
  window.addEventListener("message", onMsg);

  // 频道兜底
  const ch = getChannel();
  const onCh = (evt: MessageEvent) => {
    const { type, data } = evt.data || {};
    if (type === "update") onUpdate(data);
  };
  ch.addEventListener("message", onCh as any);

  // 返回卸载函数
  return () => {
    window.removeEventListener("message", onMsg);
    ch.removeEventListener("message", onCh as any);
  };
}