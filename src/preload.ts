// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getDesktopSources: (opts: Electron.SourcesOptions) =>
    ipcRenderer.invoke("desktopcapturer:getSources", opts),
  convertrRgbToHsv: (rgb: Uint8ClampedArray<ArrayBufferLike>) =>
    ipcRenderer.invoke("imageconvert:rgbToHsv", rgb),
  triggerImageGrab: (stream: MediaStream) =>
    ipcRenderer.send("trigger-image-grab", stream),
  setCaptureId: (id: string) => ipcRenderer.send("set-captureid", id),
  minimizeWindow: () => ipcRenderer.send("title-bar:minimize-window"),
  maximizeWindow: () => ipcRenderer.send("title-bar:maximize-window"),
  createAboutWindow: () => ipcRenderer.send("title-bar:create-about-window"),
  reloadMainWindow: () => ipcRenderer.send("title-bar:reload"),
  forceReloadMainWindow: () => ipcRenderer.send("title-bar:force-reload"),
  toggleDevToolsMainWindow: () =>
    ipcRenderer.send("title-bar:toggle-dev-tools"),
});
