import { useContext, useEffect, useRef, useState } from "react";
import VideoPlayer from "./VideoPlay";
import VectorScope from "./VectorScope";
import { AppContext } from "@/app/AppContext";
import { VideoSelectionModalState } from "@/types/enums";
import { getMediaStream } from "@/lib/utils";

interface VideoPreviewProps {
  stream: MediaStream | null;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ stream }) => {
  const videoRef = useRef(null);

  return (
    <>
      {stream && (
        <>
          <VideoPlayer mediaStream={stream} videoRef={videoRef} />
          <VectorScope />
        </>
      )}
    </>
  );
};

export default VideoPreview;
