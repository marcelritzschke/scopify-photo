import { BoundingBox } from "./types/types";

export interface IElectronAPI {
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

  interface WorkerData {
    addonPath: string;
    bitmap: Uint8ClampedArray<SharedArrayBuffer>;
    result: Uint8ClampedArray<SharedArrayBuffer>;
  }
}
