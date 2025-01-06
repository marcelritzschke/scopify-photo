import { useState } from "react";
import Navbar from "@/app/components/navigation/Navbar";
import { AppContext } from "@/app/AppContext";
import { VideoSelectionModalState } from "@/types/enums";
import VideoSelectionModal from "@/app/components/modal/VideoSelectionModal";
import { getMediaStream } from "@/lib/utils";
import OffCanvasVideoCrop from "@/app/components/OffCanvasVideoCrop";
import VectorScope from "@/app/components/scope/VectorScope";

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
      case VideoSelectionModalState.Selecting: {
        setAppState(newState);

        setStream(null);
        setBitmap(null);
        clearInterval(interval);
        await window.electronAPI.setNormalizedBoundingBox(null);
        await window.electronAPI.terminateImageConvert();
        break;
      }
      case VideoSelectionModalState.Cropping: {
        setAppState(newState);

        const streamLocal = await getMediaStream();
        setStream(streamLocal);
        setImageCapture(new ImageCapture(streamLocal.getVideoTracks()[0]));
        break;
      }
      case VideoSelectionModalState.Closed: {
        setAppState(newState);

        setImageCaptureInterval();
        await window.electronAPI.triggerImageConvert();
        break;
      }
      case VideoSelectionModalState.Cancelled: {
        setStream(null);
        setBitmap(null);
        clearInterval(interval);
        await window.electronAPI.setNormalizedBoundingBox(null);
        await window.electronAPI.terminateImageConvert();

        setAppState(VideoSelectionModalState.Closed);
        break;
      }
    }
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
        fontSize: parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        ),
        navBarHeight: 29,
      }}
    >
      <Navbar />
      <div className="m-2 mt-[calc(29px+0.5rem)]">
        {appState === VideoSelectionModalState.Closed && (
          <>
            <OffCanvasVideoCrop stream={stream} />
            <VectorScope />
          </>
        )}
        {appState !== VideoSelectionModalState.Closed && (
          <VideoSelectionModal stream={stream} />
        )}
      </div>
    </AppContext.Provider>
  );
}
