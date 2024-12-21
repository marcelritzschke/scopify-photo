import { Button } from "@headlessui/react";
import { useEffect, useState } from "react";
import VideoPreviewModal from "./VideoPreviewModal";
import { DesktopSource } from "src/interface";
import VideoPlayer from "./VideoPlay";
import VectorScope from "./VectorScope";

const VideoPreview: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sources, setSources] = useState<DesktopSource[]>([]);
  const [stream, setStream] = useState<MediaStream>();
  const [captureId, setCaptureId] = useState<string>();
  const [interval, setCaptureInterval] = useState<NodeJS.Timeout>();
  const [bitmap, setBitmap] = useState<ImageBitmap>();

  const open = async () => {
    const sources: DesktopSource[] = await window.electronAPI.getDesktopSources(
      {
        types: ["screen", "window"],
        fetchWindowIcons: false,
        thumbnailSize: { width: 320, height: 240 },
      },
    );

    setSources(sources);
    setIsOpen(true);
  };

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
    if (captureId) {
      window.electronAPI.setCaptureId(captureId);

      clearInterval(interval);

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
    }
  }, [captureId]);

  if (isOpen) {
    return (
      <VideoPreviewModal
        setIsOpen={setIsOpen}
        setCaptureId={setCaptureId}
        sources={sources}
      />
    );
  }

  return (
    <>
      <Button
        onClick={open}
        className="rounded-sm bg-white/50 px-4 py-2 text-sm font-medium text-white focus:outline-none data-[hover]:bg-white/30 data-[focus]:outline-1 data-[focus]:outline-white"
      >
        Select Video Source
      </Button>
      <VideoPlayer mediaStream={stream} />
      <VectorScope bitmap={bitmap} />
    </>
  );
};

export default VideoPreview;
