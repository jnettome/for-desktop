import { contextBridge, ipcRenderer } from "electron";

let config: DesktopConfig;

ipcRenderer.on("config", (_, data) => (config = data));

contextBridge.exposeInMainWorld("desktopConfig", {
  get: () => config,
  set: (config: DesktopConfig) => ipcRenderer.send("config", config),
  getAutostart() {
    return ipcRenderer.invoke("getAutostart") as Promise<boolean>;
  },
  setAutostart(value: boolean) {
    return ipcRenderer.invoke("setAutostart", value) as Promise<boolean>;
  },
  getInstanceSetup() {
    return ipcRenderer.invoke("getInstanceSetup") as Promise<{
      serverUrl: string;
      officialUrl: string;
      firstLaunch: boolean;
    }>;
  },
  applyServerUrl(url: string) {
    return ipcRenderer.invoke("applyServerUrl", url) as Promise<
      { ok: true; url: string } | { ok: false; error: string }
    >;
  },
  cancelInstanceSetup() {
    return ipcRenderer.invoke("cancelInstanceSetup") as Promise<
      { ok: true } | { ok: false; error: string }
    >;
  },
});
