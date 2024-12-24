import { useEffect, useRef, useState } from "react";
import VideoSelectionModal from "../modal/VideoSelectionModal";
import { DesktopSource } from "@/types/types";
import VideoPlayer from "./VideoPlay";
import VectorScope from "./VectorScope";

interface Props {
  isSelectInputOpen: boolean;
  setIsSelectInputOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const VideoPreview: React.FC<Props> = ({
  isSelectInputOpen,
  setIsSelectInputOpen,
}) => {
  const [sources, setSources] = useState<DesktopSource[]>([]);
  const [stream, setStream] = useState<MediaStream | null>();
  const [captureId, setCaptureId] = useState<string | null>();
  const [hasValidSource, setHasValidSource] = useState<boolean>(false);
  const [bitmap, setBitmap] = useState<ImageBitmap>();
  const [interval, setCaptureInterval] = useState<NodeJS.Timeout>();

  const videoRef = useRef(null);

  useEffect(() => {
    if (isSelectInputOpen) {
      const fetchDesktopSources = async () => {
        const sources: DesktopSource[] =
          await window.electronAPI.getDesktopSources({
            types: ["screen", "window"],
            fetchWindowIcons: false,
            thumbnailSize: { width: 320, height: 240 },
          });
        setSources(sources);
      };
      fetchDesktopSources();
      setIsSelectInputOpen(true);
    }
  }, [isSelectInputOpen]);

  useEffect(() => {
    if (stream) {
      console.log(stream);
      const videoTrack: MediaStreamTrack = stream.getVideoTracks()[0];
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
    // window.electronAPI.triggerImageGrab(stream);
  }, [stream]);

  useEffect(() => {
    window.electronAPI.setCaptureId(captureId);

    if (captureId) {
      navigator.mediaDevices
        .getDisplayMedia({
          audio: false,
          video: {
            frameRate: 30,
          },
        })
        .then((stream) => {
          setStream(stream);
        })
        .catch((e) => console.log(e));
    } else {
      clearInterval(interval);
      setStream(null);
    }
  }, [captureId]);

  const validateSelectedSource = () => {
    if (captureId) {
      setHasValidSource(true);
    }
  };

  return (
    <>
      {isSelectInputOpen && (
        <VideoSelectionModal
          onFinished={validateSelectedSource}
          setIsOpen={setIsSelectInputOpen}
          setCaptureId={setCaptureId}
          sources={sources}
          stream={stream}
        />
      )}
      {hasValidSource && (
        <>
          <VideoPlayer mediaStream={stream} videoRef={videoRef} />
          <VectorScope bitmap={bitmap} />
        </>
      )}
    </>
  );
};

export default VideoPreview;
