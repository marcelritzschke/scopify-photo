import VideoPlayer from "./VideoPlay";
import { useEffect, useRef, useState } from "react";
import { throttle } from "lodash";
import {
  drawBoundingBox,
  getDraggingLocation,
  setNewBoundingBox,
} from "./../../../lib/cropping"; //TODO add global entry point for lib folder
import { BoundingBox } from "types/types";

interface VideoSelectionCropParams {
  stream: MediaStream;
}

const VideoSelectionCrop: React.FC<VideoSelectionCropParams> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ offsetX: 0, offsetY: 0 });
  const [boundingBox, setBoundingBox] = useState({
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const video = videoRef.current!;
    const updateCanvasSizeEvent = () => {
      updateCanvasSize(video.offsetWidth, video.offsetHeight);
    };

    // Set event listeners
    window.addEventListener("resize", updateCanvasSizeEvent);

    return () => {
      // Cleanup event listeners
      window.removeEventListener("resize", updateCanvasSizeEvent);
    };
  }, [stream]);

  const updateCanvasSize = (width: number, height: number) => {
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    setBoundingBox({
      startX: 0,
      startY: 0,
      width: width,
      height: height,
    });
  };

  useEffect(() => {
    if (boundingBox) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
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
          console.log(
            videoRef.current.offsetWidth,
            videoRef.current.offsetHeight,
          );
        }
      };
    }
  }, [videoRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
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

    if (dragging === "full") console.log("full");

    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (dragging === "move") {
      setBoundingBox((prev: BoundingBox) => ({
        ...prev,
        startX: mouseX - dragOffset.offsetX,
        startY: mouseY - dragOffset.offsetY,
      }));
    } else {
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
        );
      });
    }
  }, 33); //TODO: check if throttle is working

  const handleMouseUp = () => {
    setDragging(null);
  };

  return (
    <div
      style={{ position: "relative", userSelect: "none" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <VideoPlayer mediaStream={stream} videoRef={videoRef} />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
        onMouseDown={handleMouseDown}
      />
      {boundingBox && (
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
