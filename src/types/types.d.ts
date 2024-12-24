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
