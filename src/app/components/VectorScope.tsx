import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface HsvData {
  h: number; // Hue
  s: number; // Saturation
  v: number; // Value
}

const VectorScope: React.FC<{ bitmap: ImageBitmap | null }> = ({ bitmap }) => {
  const [hsvData, setHsvData] = useState<HsvData[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (bitmap) {
      const startTime = performance.now();
      convertImageBitmapToHsv(bitmap);

      const mid1Time = performance.now();
      d3.select(svgRef.current).select("g").remove();

      const mid2Time = performance.now();
      draw(bitmap, 400, 400, 20);

      console.log("Converting time = %d", mid1Time - startTime);
      console.log("Clean svg time = %d", mid2Time - mid1Time);
      console.log("Draw svg time = %d", performance.now() - mid2Time);
      console.log("Total time = %d", performance.now() - startTime);
    }
  }, [bitmap]);

  const convertImageBitmapToHsv = (bitmap: ImageBitmap) => {
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

    const hsvData: HsvData[] = [];
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]; // Red
      const g = data[i + 1]; // Green
      const b = data[i + 2]; // Blue

      const { h, s, v } = rgbToHsv(r, g, b);

      hsvData.push({ h, s, v });
    }

    setHsvData(hsvData);
  };

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    let v = max;

    if (delta !== 0) {
      s = delta / max;
      if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }
      h *= 60;
      if (h < 0) {
        h += 360;
      }
    }

    return { h, s, v };
  };

  const draw = (
    bitmap: ImageBitmap,
    width: number,
    height: number,
    margin: number,
  ) => {
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`); // center the chart

    const grid = svg.append("g").attr("class", "grid");
    for (let i = 1; i <= 5; i++) {
      grid
        .append("circle")
        .attr("r", (i / 5) * radius)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);
    }

    const colors = ["red", "green", "blue", "cyan", "magenta", "yellow"];
    const angleStep = (2 * Math.PI) / colors.length;

    colors.forEach((color, i) => {
      const angle = i * angleStep;
      svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", radius * Math.cos(angle))
        .attr("y2", radius * Math.sin(angle))
        .attr("stroke", color)
        .attr("stroke-width", 2);
    });

    hsvData.forEach((pixel, idx) => {
      if (idx % 100 === 0) {
        const angle = (pixel.h / 360) * (2 * Math.PI);
        const radiusScale = pixel.s * radius;
        svg
          .append("circle")
          .attr("cx", radiusScale * Math.cos(angle))
          .attr("cy", radiusScale * Math.sin(angle))
          .attr("r", 0.5)
          // .attr('fill', `rgb(${r}, ${g}, ${b})`)
          .attr("fill", `white`)
          .attr("stroke", "none");
      }
    });
  };

  return (
    <div>
      <svg ref={svgRef}></svg>
      {bitmap && (
        <>
          {/* <h2>Original Image</h2>
          <img src={URL.createObjectURL(bitmap)} alt="Original" /> */}

          <h2>HSV Data (first 10 pixels)</h2>
          <ul>
            {hsvData.slice(0, 10).map((pixel, index) => (
              <li key={index}>
                H: {pixel.h.toFixed(2)}, S: {pixel.s.toFixed(2)}, V:{" "}
                {pixel.v.toFixed(2)}
              </li>
            ))}
          </ul>
        </>
      )}
      {!bitmap && <p>No image to convert.</p>}
    </div>
  );
};

export default VectorScope;
