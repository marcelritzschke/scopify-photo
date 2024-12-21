import React, { useEffect, useRef } from "react";

const VideoPlayer: React.FC<{ mediaStream: MediaStream }> = ({
  mediaStream,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
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
