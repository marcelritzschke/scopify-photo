import { useContext, useEffect, useRef, useState } from "react";
import VideoPlayer from "./VideoPlay";
import VectorScope from "./VectorScope";
import { AppContext } from "@/app/AppContext";
import { VideoSelectionModalState } from "@/types/enums";
import { getMediaStream } from "@/lib/utils";

const VideoPreview: React.FC = () => {
  const { appState } = useContext(AppContext);

  const [stream, setStream] = useState<MediaStream | null>();
  const [bitmap, setBitmap] = useState<ImageBitmap>();
  const [interval, setCaptureInterval] = useState<NodeJS.Timeout>();

  const videoRef = useRef(null);

  useEffect(() => {
    const triggerImageCapture = async () => {
      const captureId = await window.electronAPI.getCaptureId();
      console.log(captureId);

      if (captureId && appState === VideoSelectionModalState.Closed) {
        console.log("fetch stream");
        const stream = await getMediaStream();
        if (stream) {
          console.log(stream);
          const videoTrack: MediaStreamTrack = stream.getVideoTracks()[0];
          // TODO: find types for ImageCapture
          // @ts-ignore
          const imageCapture = new ImageCapture(videoTrack);
          const captureInterval = setInterval(async () => {
            try {
              // Capture a frame (returns a Bitmap)
              const bitmap = await imageCapture.grabFrame();
              console.log("Captured Bitmap:", bitmap);

              setBitmap(bitmap);

              //   // Optionally draw the bitmap to a canvas
              //   const canvas = document.createElement("canvas");
              //   const ctx = canvas.getContext("2d");
              //   canvas.width = bitmap.width;
              //   canvas.height = bitmap.height;
              //   ctx.drawImage(bitmap, 0, 0);

              //   // Do something with the canvas or bitmap here (e.g., save, display)
              //   // Example: Convert to data URL and display in an image element
              //   const imgElement = document.createElement("img");
              //   imgElement.src = canvas.toDataURL();
              //   document.body.appendChild(imgElement); // Append to document (optional)
            } catch (error) {
              console.error("Error capturing bitmap:", error);
            }
          }, 1000);
          setCaptureInterval(captureInterval);
        }
        setStream(stream);
      } else {
        clearInterval(interval);
        setStream(null);
      }
    };
    triggerImageCapture();
  }, [appState]);

  return (
    <>
      {stream && (
        <>
          <VideoPlayer mediaStream={stream} videoRef={videoRef} />
          <VectorScope bitmap={bitmap} />
        </>
      )}
    </>
  );
};

export default VideoPreview;
