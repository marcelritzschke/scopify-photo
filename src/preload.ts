// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getCaptureId: () => ipcRenderer.invoke("video:getCaptureId"),
  getBitmapHsv: () => ipcRenderer.invoke("imageconvert:getHsv"),
  getDesktopSources: (opts: Electron.SourcesOptions) =>
    ipcRenderer.invoke("desktopcapturer:getSources", opts),
  setBitmap: (
    bitmap: Uint8ClampedArray<ArrayBufferLike>,
    width: number,
    height: number,
    target_width: number,
    target_height: number,
  ) =>
    ipcRenderer.send(
      "imageconvert:set-bitmap",
      bitmap,
      width,
      height,
      target_width,
      target_height,
    ),
  terminateImageConvert: () => ipcRenderer.send("imageconvert:terminate"),
  triggerImageConvert: () => ipcRenderer.send("imageconvert:trigger"),
  setCaptureId: (id: string) => ipcRenderer.send("set-captureid", id),
  minimizeWindow: () => ipcRenderer.send("title-bar:minimize-window"),
  maximizeWindow: () => ipcRenderer.send("title-bar:maximize-window"),
  createAboutWindow: () => ipcRenderer.send("title-bar:create-about-window"),
  reloadMainWindow: () => ipcRenderer.send("title-bar:reload"),
  forceReloadMainWindow: () => ipcRenderer.send("title-bar:force-reload"),
  toggleDevToolsMainWindow: () =>
    ipcRenderer.send("title-bar:toggle-dev-tools"),
});
