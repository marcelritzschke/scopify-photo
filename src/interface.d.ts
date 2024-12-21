export interface DesktopSource {
  appIcon: string;
  display_id: string;
  id: string;
  name: string;
  thumbnail: string;
}

export interface IElectronAPI {
  getDesktopSources: (
    opts: Electron.SourcesOptions,
  ) => Promise<DesktopSource[]>;
  setCaptureId: (id: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
