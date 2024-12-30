import { useEffect, useRef, useState } from "react";
import Navbar from "@/app/components/navigation/Navbar";
import VideoPreview from "@/app/components/video/VideoPreview";
import { AppContext } from "./AppContext";
import { VideoSelectionModalState } from "@/types/enums";
import VideoSelectionModal from "@/app/components/modal/VideoSelectionModal";
import { getMediaStream } from "@/lib/utils";

export default function App() {
  const isDev = process.env.NODE_ENV !== "production" ? true : false;
  const [appState, setAppState] = useState<VideoSelectionModalState>(
    VideoSelectionModalState.Closed,
  );
  const [stream, setStream] = useState<MediaStream>(null);
  const [imageCapture, setImageCapture] = useState<ImageCapture>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap>();
  const [interval, setCaptureInterval] = useState<NodeJS.Timeout>();

  const requestAppStateTransition = async (
    newState: VideoSelectionModalState,
  ) => {
    isDev && console.log(`Switching App State from ${appState} to ${newState}`);

    switch (newState) {
      case VideoSelectionModalState.Selecting:
        setStream(null);
        setBitmap(null);
        clearInterval(interval);
        await window.electronAPI.terminateImageConvert();
        break;
      case VideoSelectionModalState.Cropping:
        const streamLocal = await getMediaStream();
        setStream(streamLocal);
        setImageCapture(new ImageCapture(streamLocal.getVideoTracks()[0]));
        break;
      case VideoSelectionModalState.Closed:
        setImageCaptureInterval();
        await window.electronAPI.triggerImageConvert();
        break;
    }

    setAppState(newState);
  };

  const setImageCaptureInterval = () => {
    if (imageCapture) {
      const captureInterval = setInterval(async () => {
        try {
          const bitmap: ImageBitmap = await imageCapture.grabFrame();
          setBitmap(bitmap);
        } catch (error) {
          console.error("Error capturing bitmap:", error);
        }
      }, 100);
      setCaptureInterval(captureInterval);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isDev: isDev,
        appState: appState,
        requestAppStateTransition: requestAppStateTransition,
        bitmap: bitmap,
      }}
    >
      <Navbar />
      <div className="mt-7">
        {appState === VideoSelectionModalState.Closed && (
          <VideoPreview stream={stream} />
        )}

        {appState !== VideoSelectionModalState.Closed && (
          <VideoSelectionModal stream={stream} />
        )}
      </div>
    </AppContext.Provider>
  );
}
