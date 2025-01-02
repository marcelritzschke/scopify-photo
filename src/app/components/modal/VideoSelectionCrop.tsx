import VideoPlayer from "../video/VideoPlay";
import { useContext, useEffect, useRef, useState } from "react";
import { throttle } from "lodash";
import {
  drawBoundingBox,
  getDraggingLocation,
  setNewBoundingBox,
} from "@/lib/cropping";
import { BoundingBox, DragOffset } from "@/types/types";
import { AppContext } from "@/app/AppContext";
import Spinner from "@/app/components/Spinner";

interface VideoSelectionCropProps {
  stream: MediaStream | null;
}

const VideoSelectionCrop: React.FC<VideoSelectionCropProps> = ({ stream }) => {
  const { isDev, bitmap } = useContext(AppContext);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<DragOffset>({
    offsetX: 0,
    offsetY: 0,
  });
  const [boundingBox, setBoundingBox] = useState<BoundingBox>({
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (stream) {
      const video = videoRef.current ?? null;
      const updateCanvasSizeEvent = () => {
        updateCanvasSize(video.offsetWidth, video.offsetHeight);
      };
      // Set event listeners
      window.addEventListener("resize", updateCanvasSizeEvent);

      return () => {
        // Cleanup event listeners
        window.removeEventListener("resize", updateCanvasSizeEvent);
      };
    }
  }, [stream]);

  const updateCanvasSize = async (width: number, height: number) => {
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const normalizedBoundingBox =
      await window.electronAPI.getNormalizedBoundingBox();
    if (normalizedBoundingBox) {
      setBoundingBox({
        startX: normalizedBoundingBox.startX * width,
        startY: normalizedBoundingBox.startY * height,
        width: normalizedBoundingBox.width * width,
        height: normalizedBoundingBox.height * height,
      });
    } else {
      setBoundingBox({
        startX: 0,
        startY: 0,
        width: width,
        height: height,
      });
    }
  };

  useEffect(() => {
    if (boundingBox) {
      const canvas = canvasRef.current ?? null;
      const ctx = canvas.getContext("2d") ?? null;
      drawBoundingBox(ctx, canvas.width, canvas.height, boundingBox);
    }
  }, [boundingBox]);

  useEffect(() => {
    if (videoRef.current) {
      // Set canvas size once media stream dimension are received
      videoRef.current.onloadedmetadata = () => {
        if (canvasRef.current && videoRef.current) {
          updateCanvasSize(
            videoRef.current.offsetWidth,
            videoRef.current.offsetHeight,
          );
        }
      };
    }
  }, [videoRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current ?? null;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dragging = getDraggingLocation(mouseX, mouseY, boundingBox);
    if (dragging === "move") {
      setDragOffset({
        offsetX: mouseX - boundingBox.startX,
        offsetY: mouseY - boundingBox.startY,
      });
    }
    setDragging(dragging);
  };

  const handleMouseMove = throttle((e: React.MouseEvent) => {
    if (!dragging) return;

    const canvas = canvasRef.current ?? null;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setBoundingBox((prev) => {
      const newBox = { ...prev };
      return setNewBoundingBox(
        dragging,
        newBox,
        prev,
        mouseX,
        mouseY,
        rect.width,
        rect.height,
        dragOffset,
        //TODO: update dragoffset within the function if we hit the limits of canvas to avoid sluggish movement
      );
    });
  }, 33); //TODO: check if throttle is working

  const handleMouseUp = () => {
    setDragging(null);
    const canvas = canvasRef.current ?? null;
    const normalizedBoundingBox: BoundingBox = {
      startX: boundingBox.startX / canvas.width,
      startY: boundingBox.startY / canvas.height,
      width: boundingBox.width / canvas.width,
      height: boundingBox.height / canvas.height,
    };

    window.electronAPI.setNormalizedBoundingBox(normalizedBoundingBox);
  };

  return (
    <div
      className="mx-4 mt-4"
      style={{ position: "relative", userSelect: "none" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {!stream && (
        <div className="my-7 flex justify-center">
          <Spinner className="h-8 w-8 animate-spin fill-slate-700 text-gray-200 dark:text-gray-600" />
        </div>
      )}

      <VideoPlayer mediaStream={stream} videoRef={videoRef} />
      <canvas
        hidden={!stream}
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
        onMouseDown={handleMouseDown}
      />

      {isDev && boundingBox && (
        <div className="text-white">
          <p>Selection:</p>
          <ul>
            <li>Start X: {boundingBox.startX.toFixed(2)}</li>
            <li>Start Y: {boundingBox.startY.toFixed(2)}</li>
            <li>Width: {boundingBox.width.toFixed(2)}</li>
            <li>Height: {boundingBox.height.toFixed(2)}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VideoSelectionCrop;
