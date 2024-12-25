import { useState } from "react";
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

  const requestAppStateTransition = async (
    newState: VideoSelectionModalState,
  ) => {
    console.log(`Switching App State from ${appState} to ${newState}`);

    switch (newState) {
      case VideoSelectionModalState.Selecting:
        setStream(null);
        break;
      case VideoSelectionModalState.Cropping:
        setStream(await getMediaStream());
        break;
    }

    setAppState(newState);
  };

  return (
    <AppContext.Provider
      value={{
        isDev: isDev,
        appState: appState,
        requestAppStateTransition: requestAppStateTransition,
      }}
    >
      <Navbar />
      <div className="mt-2">
        <VideoPreview />
      </div>

      {appState !== VideoSelectionModalState.Closed && (
        <VideoSelectionModal stream={stream} />
      )}
    </AppContext.Provider>
  );
}
