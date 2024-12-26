import { DesktopSource } from "@/types/types";

export const fetchDesktopSources = async (): Promise<DesktopSource[]> => {
  const sources: DesktopSource[] = await window.electronAPI.getDesktopSources({
    types: ["screen", "window"],
    fetchWindowIcons: false,
    thumbnailSize: { width: 320, height: 240 },
  });
  return sources;
};

export const getMediaStream = async (): Promise<MediaStream> => {
  const stream: MediaStream = await navigator.mediaDevices
    .getDisplayMedia({
      audio: false,
      video: {
        frameRate: 30,
      },
    })
    .catch((e): null => {
      console.error(e);
      return null;
    });
  return stream;
};
