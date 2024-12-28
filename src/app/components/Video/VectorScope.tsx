import { AppContext } from "@/app/AppContext";
import { useContext, useEffect, useRef, useState } from "react";

// const VectorScope: React.FC<{ bitmap: ImageBitmap | null }> = ({ bitmap }) => {
const VectorScope: React.FC = () => {
  const { bitmap } = useContext(AppContext);
  const [hsvData, setHsvData] = useState<Uint8ClampedArray>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (bitmap) {
      const startTime = performance.now();
      const fetchImageDataFromMain = async () => {
        await convertImageBitmapToHsv(bitmap);
      };
      fetchImageDataFromMain();

      const mid1Time = performance.now();

      if (hsvData) {
        const canvas: HTMLCanvasElement = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("Failed to get CanvasRef context");
        }
        canvas.width = 512;
        canvas.height = 512;
        const img = ctx.createImageData(512, 512);
        img.data.set(hsvData);
        ctx.putImageData(img, 0, 0);
      }

      console.log("Converting time = %d", mid1Time - startTime);
      console.log("Total time = %d", performance.now() - startTime);
    }
  }, [bitmap]);

  const convertImageBitmapToHsv = async (
    bitmap: ImageBitmap,
  ): Promise<Uint8ClampedArray> => {
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

    const hsvPixels: Uint8ClampedArray =
      await window.electronAPI.convertrRgbToHsv(data);

    setHsvData(hsvPixels);
    return hsvPixels;
  };

  const draw = (
    bitmap: ImageBitmap,
    width: number,
    height: number,
    margin: number,
  ) => {
    const canvas: HTMLCanvasElement = canvasRef.current;
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
    const colors = ["red", "green", "blue", "cyan", "magenta", "yellow"];
    const angleStep = (2 * Math.PI) / colors.length;

    colors.forEach((color, i) => {
      const angle = i * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw data points (replace hsvData with your actual data)
    const getCoordinates = (
      data: Float32Array,
      idx: number,
    ): { x: number; y: number } => {
      const h = data[idx];
      const s = data[idx + 1];
      // const v = data[idx + 2];

      const angle = (h / 360) * (2 * Math.PI);
      const radiusScale = s * radius;
      const x = centerX + radiusScale * Math.cos(angle);
      const y = centerY + radiusScale * Math.sin(angle);

      return { x: x, y: y };
    };

    const { x: xStart, y: yStart } = getCoordinates(hsvData, 0);
    ctx.beginPath();
    ctx.lineTo(xStart, yStart);

    ctx.strokeStyle = "white";
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1.0;
    for (let idx = 3; idx < hsvData.length; idx += 3) {
      const { x, y } = getCoordinates(hsvData, idx);
      // ctx.beginPath();
      // ctx.arc(x, y, 10, 0, 2 * Math.PI);
      // ctx.stroke();
      ctx.lineTo(x, y); // Add point to the polyline
    }
    ctx.stroke(); // Draw the polyline once
  };

  return (
    <div>
      <canvas ref={canvasRef} className="border"></canvas>
    </div>
  );
};

export default VectorScope;
