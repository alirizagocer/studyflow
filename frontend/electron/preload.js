/**
 * electron/preload.js
 * Güvenli köprü — contextIsolation=true ile renderer'a sadece
 * izin verilen API'ları expose eder. Node.js'e doğrudan erişim yok.
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("app:version"),
  openExternal: (url) => ipcRenderer.invoke("app:open-external", url),
  showNotification: (title, body) => ipcRenderer.invoke("notification:show", { title, body }),
  getCalendarUrl: (token) => ipcRenderer.invoke("calendar:get-url", token),
  isElectron: true,
});
