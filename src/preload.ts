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
});
