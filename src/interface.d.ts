import { BoundingBox, Preferences } from "./types/types";

export interface IElectronAPI {
  isDev: () => Promise<boolean>;
  getCaptureId: () => Promise<string | null>;
  getNormalizedBoundingBox: () => Promise<BoundingBox | null>;
  getBitmapHsv: () => Promise<{
    data: Uint8ClampedArray | null;
    width: number;
    height: number;
  }>;
  getDesktopSources: (
    opts: Electron.SourcesOptions,
  ) => Promise<DesktopSource[]>;

  loadPreferences: () => Promise<Preferences>;
  savePreferences: (preferences: Preferences) => Promise<void>;

  setBitmap: (
    bitmap: Uint8ClampedArray<ArrayBufferLike>,
    width: number,
    height: number,
    target_width: number,
    target_height: number,
  ) => Promise<void>;
  setCaptureId: (id: string) => Promise<void>;
  setNormalizedBoundingBox: (boundingBox: BoundingBox | null) => Promise<void>;
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
}
