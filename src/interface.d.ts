export interface IElectronAPI {
  getCaptureId: () => Promise<string | null>;
  getBitmapHsv: () => Promise<Uint8ClampedArray | null>;
  getDesktopSources: (
    opts: Electron.SourcesOptions,
  ) => Promise<DesktopSource[]>;
  setBitmap: (bitmap: Uint8ClampedArray<ArrayBufferLike>) => Promise<void>;
  setCaptureId: (id: string) => Promise<void>;
  terminateImageConvert: () => Promise<void>;
  triggerImageConvert: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  createAboutWindow: () => Promise<void>;
  reloadMainWindow: () => Promise<void>;
  forceReloadMainWindow: () => Promise<void>;
  toggleDevToolsMainWindow: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }

  interface WorkerData {
    addonPath: string;
    bitmap: Uint8ClampedArray<SharedArrayBuffer>;
    result: Uint8ClampedArray<SharedArrayBuffer>;
  }
}
