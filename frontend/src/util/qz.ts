// src/util/qz.ts
// Loads QZ Tray's script once and connects to QZ Tray running on this computer.

// Same script source as the existing print screens.
export const QZ_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";

export interface QzEvent {
  printerName?: string;
  eventType?: string; // "PRINTER" | "JOB"
  statusText?: string; // e.g. "OK", "OFFLINE", "PAPER_OUT"
  severity?: string; // "INFO" | "WARN" | "ERROR" | "FATAL"
  message?: string;
}

export interface QzApi {
  websocket: { isActive(): boolean; connect(): Promise<void> };
  api?: { getVersion(): Promise<string> };
  printers: {
    find(query?: string): Promise<string[] | string>;
    getDefault(): Promise<string>;
    setPrinterCallbacks(callback: (event: QzEvent | QzEvent[]) => void): void;
    startListening(printers: string | string[] | null): Promise<void>;
    stopListening(): Promise<void>;
    getStatus(): Promise<unknown>;
  };
  configs: { create(printer: string): unknown };
  print(config: unknown, data: unknown[]): Promise<void>;
}

let loading: Promise<QzApi> | null = null;

export function loadQz(): Promise<QzApi> {
  if (window.qz) return Promise.resolve(window.qz as QzApi);
  if (loading) return loading;

  loading = new Promise<QzApi>((resolve, reject) => {
    const onLoad = () =>
      window.qz ? resolve(window.qz as QzApi) : reject(new Error("QZ Tray script did not load"));
    const onError = () => reject(new Error("Could not load the QZ Tray script"));

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${QZ_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return;
    }
    const script = document.createElement("script");
    script.src = QZ_SCRIPT_URL;
    script.onload = onLoad;
    script.onerror = onError;
    document.body.appendChild(script);
  });
  loading.catch(() => {
    loading = null; // allow a retry
  });
  return loading;
}

export async function connectQz(): Promise<QzApi> {
  const qz = await loadQz();
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }
  return qz;
}
