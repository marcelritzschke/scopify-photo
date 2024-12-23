export interface IElectronAPI {
  getDesktopSources: (
    opts: Electron.SourcesOptions,
  ) => Promise<DesktopSource[]>;
  convertrRgbToHsv: (
    rgb: Uint8ClampedArray<ArrayBufferLike>,
  ) => Promise<Float32Array>;
  setCaptureId: (id: string) => Promise<void>;
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
}
