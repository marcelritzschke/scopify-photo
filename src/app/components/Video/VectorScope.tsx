import { AppContext } from "@/app/AppContext";
import { useContext, useEffect, useRef, useState } from "react";

// const VectorScope: React.FC<{ bitmap: ImageBitmap | null }> = ({ bitmap }) => {
const VectorScope: React.FC = () => {
  const { bitmap } = useContext(AppContext);
  const [hsvData, setHsvData] = useState<Float32Array>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (bitmap) {
      const startTime = performance.now();
      const fetchImageDataFromMain = async () =>
        await convertImageBitmapToHsv(bitmap);
      fetchImageDataFromMain();

      const mid1Time = performance.now();
      // hsvData && d3.select(canvasRef.current).select("g").remove();

      const mid2Time = performance.now();
      hsvData && draw(bitmap, 400, 400, 20);

      console.log("Converting time = %d", mid1Time - startTime);
      console.log("Clean svg time = %d", mid2Time - mid1Time);
      console.log("Draw svg time = %d", performance.now() - mid2Time);
      console.log("Total time = %d", performance.now() - startTime);
    }
  }, [bitmap]);

  const convertImageBitmapToHsv = async (bitmap: ImageBitmap) => {
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

    const hsvPixels: Float32Array =
      await window.electronAPI.convertrRgbToHsv(data);

    setHsvData(hsvPixels);
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
    ctx.strokeStyle = "white";
    ctx.globalAlpha = 0.01;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let idx = 0; idx < hsvData.length; idx += 3) {
      const h = hsvData[idx];
      const s = hsvData[idx + 1];
      // const v = hsvData[idx + 2];

      const angle = (h / 360) * (2 * Math.PI);
      const radiusScale = s * radius;
      const x = centerX + radiusScale * Math.cos(angle);
      const y = centerY + radiusScale * Math.sin(angle);

      ctx.lineTo(x, y); // Add point to the polyline
    }
    ctx.stroke(); // Draw the polyline once

    // const svg = d3
    //   .select(canvasRef.current)
    //   .attr("width", width)
    //   .attr("height", height)
    //   .append("g")
    //   .attr("transform", `translate(${width / 2}, ${height / 2})`); // center the chart

    // const grid = svg.append("g").attr("class", "grid");
    // for (let i = 1; i <= 5; i++) {
    //   grid
    //     .append("circle")
    //     .attr("r", (i / 5) * radius)
    //     .attr("fill", "none")
    //     .attr("stroke", "#ccc")
    //     .attr("stroke-width", 1);
    // }

    // const colors = ["red", "green", "blue", "cyan", "magenta", "yellow"];
    // const angleStep = (2 * Math.PI) / colors.length;

    // colors.forEach((color, i) => {
    //   const angle = i * angleStep;
    //   svg
    //     .append("line")
    //     .attr("x1", 0)
    //     .attr("y1", 0)
    //     .attr("x2", radius * Math.cos(angle))
    //     .attr("y2", radius * Math.sin(angle))
    //     .attr("stroke", color)
    //     .attr("stroke-width", 2);
    // });

    // for (let idx = 0; idx < hsvData.length; idx += 3) {
    //   const h = hsvData[idx];
    //   const s = hsvData[idx + 1];
    //   const v = hsvData[idx + 2];

    //   const angle = (h / 360) * (2 * Math.PI);
    //   const radiusScale = s * radius;
    //   svg
    //     .append("circle")
    //     .attr("cx", radiusScale * Math.cos(angle))
    //     .attr("cy", radiusScale * Math.sin(angle))
    //     .attr("r", 0.5)
    //     // .attr('fill', `rgb(${r}, ${g}, ${b})`)
    //     .attr("fill", `white`)
    //     .attr("stroke", "none");
    // }
  };

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default VectorScope;
