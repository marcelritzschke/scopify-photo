export interface DesktopSource {
  appIcon: string;
  display_id: string;
  id: string;
  name: string;
  thumbnail: string;
}

export interface BoundingBox {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

export interface DragOffset {
  offsetX: number;
  offsetY: number;
}

export interface SubMenu {
  label: string;
  width: string;
  submenu: Item[];
}

export interface Item {
  type: string;
  label?: string;
  shortcut?: string;
  callback?: () => void;
  submenu?: Item[];
}

export interface Preferences {
  skinColorLine: number;
  alwaysOnTop: boolean;
  blurVectorScope: boolean;
}
