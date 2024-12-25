import React, { useEffect } from "react";

const VideoPlayer: React.FC<{
  mediaStream: MediaStream;
  videoRef: React.RefObject<HTMLVideoElement>;
}> = ({ mediaStream, videoRef }) => {
  useEffect(() => {
    if (videoRef.current) {
      if (mediaStream) {
        videoRef.current.srcObject = mediaStream;
      } else {
        videoRef.current.srcObject = null;
      }
    }

    // Clean up when the component unmounts
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [mediaStream]);

  return <video ref={videoRef} autoPlay playsInline />;
};

export default VideoPlayer;
