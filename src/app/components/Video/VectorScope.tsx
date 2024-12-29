import { AppContext } from "@/app/AppContext";
import { useContext, useEffect, useRef, useState } from "react";

// const VectorScope: React.FC<{ bitmap: ImageBitmap | null }> = ({ bitmap }) => {
const VectorScope: React.FC = () => {
  const { bitmap } = useContext(AppContext);
  const [hsvData, setHsvData] = useState<Uint8ClampedArray>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasCosyRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (bitmap) {
      drawCoordinateSystem(256, 256, 0);

      const fetchImageDataFromMain = async () => {
        await convertImageBitmapToHsv(bitmap);
      };
      fetchImageDataFromMain();

      if (hsvData) {
        const canvas: HTMLCanvasElement = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("Failed to get CanvasRef context");
        }
        canvas.width = 256;
        canvas.height = 256;
        const img = ctx.createImageData(256, 256);
        img.data.set(hsvData);
        ctx.putImageData(img, 0, 0);
      }
    }
  }, [bitmap]);

  const convertImageBitmapToHsv = async (
    bitmap: ImageBitmap,
  ): Promise<void> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get Canvas context");
    }

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    ctx.drawImage(bitmap, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data; // RGBA pixel data

    // const hsvPixels: Uint8ClampedArray =
    //   await window.electronAPI.convertrRgbToHsv(data);

    window.electronAPI.setBitmap(data);

    const hsvPixels = await window.electronAPI.getBitmapHsv();
    setHsvData(hsvPixels);
    // return hsvPixels;
  };

  const drawCoordinateSystem = (
    width: number,
    height: number,
    margin: number,
  ) => {
    const canvas: HTMLCanvasElement = canvasCosyRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get CanvasRef context");
    }

    canvas.width = width;
    canvas.height = height;

    const radius = Math.min(width, height) / 2 - margin;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid circles
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (i / 5) * radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw lines for color directions
    const colors = ["blue", "cyan", "green", "yellow", "red", "magenta"];
    const angleStep = (2 * Math.PI) / colors.length;

    colors.forEach((color, i) => {
      const angle = i * angleStep; // + (240.0 * Math.PI) / 180.0
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
  };

  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      <canvas
        ref={canvasCosyRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      ></canvas>
    </div>
  );
};

export default VectorScope;
