import { AppContext } from "@/app/AppContext";
import { useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";
// @ts-ignore
import { vertex, fragment } from "@/lib/shader/huering.glsl.js";

const VectorScope: React.FC = () => {
  const { bitmap, fontSize, navBarHeight } = useContext(AppContext);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(
    window.innerHeight - navBarHeight,
  );
  const [hsvGrid, setHsvGrid] = useState<Uint8ClampedArray>();
  const [hsvGridWidth, setHsvGridWidth] = useState<number>();
  const [hsvGridHeight, setHsvGridHeight] = useState<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasCosyRef = useRef<HTMLCanvasElement>(null);
  const canvasShaderRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight - navBarHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (bitmap) {
      const fetchImageDataFromMain = async () => {
        await convertImageBitmapToHsv(bitmap);
      };
      fetchImageDataFromMain();

      console.log("windowWidth", windowWidth);
      console.log("hsvWidth", hsvGridWidth);

      if (hsvGrid && hsvGridWidth && hsvGridHeight) {
        compileShader(1.02 * hsvGridWidth, 1.02 * hsvGridHeight); // We make it a little bigger since the circle outer edge is smoothed out
        drawCoordinateSystem(hsvGridWidth, hsvGridHeight, 0);

        const canvas: HTMLCanvasElement = canvasRef.current;
        // const canvasForScaling = document.createElement("canvas");

        const ctx = canvas.getContext("2d");
        // const ctxForScaling = canvasForScaling.getContext("2d");
        if (!ctx) {
          console.error("Failed to get CanvasRef context");
        }

        canvas.width = hsvGridWidth;
        canvas.height = hsvGridHeight;
        const img = ctx.createImageData(canvas.width, canvas.height);
        img.data.set(hsvGrid);
        ctx.putImageData(img, 0, 0);

        // compensate the bigger shader
        document.getElementById("canvasCosy").style.left =
          Math.floor(0.01 * hsvGridWidth).toString() + "px";
        document.getElementById("canvasCosy").style.top =
          Math.floor(0.01 * hsvGridWidth).toString() + "px";
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

    window.electronAPI.setBitmap(
      data,
      bitmap.width,
      bitmap.height,
      Math.min(
        512,
        Math.min(windowWidth, windowHeight) -
          2 * 0.5 * fontSize -
          0.02 * windowWidth,
      ),
      Math.min(
        512,
        Math.min(windowWidth, windowHeight) -
          2 * 0.5 * fontSize -
          0.02 * windowWidth,
      ),
    );

    const hsvGridStruct = await window.electronAPI.getBitmapHsv();
    setHsvGrid(hsvGridStruct.data);
    setHsvGridWidth(hsvGridStruct.width);
    setHsvGridHeight(hsvGridStruct.height);
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

    console.log("drawCosy", width, height, radius, centerX, centerY);

    // Draw grid circles
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      if (i == 4) break;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (i / 4) * radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw lines for color directions
    const drawColorLine = (color: string, angle: number) => {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const colors = ["blue", "cyan", "green", "yellow", "red", "magenta"];
    const angleStep = (2 * Math.PI) / colors.length;
    colors.forEach((color, i) => {
      const angle = i * angleStep;
      drawColorLine(color, angle);
    });

    // Draw skin tone
    drawColorLine("white", ((240 - 11) * Math.PI) / 180);
  };

  const compileShader = (width: number, height: number) => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
    );
    camera.position.z = 1;

    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.RawShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    const ico = new THREE.Mesh(geometry, material);
    scene.add(ico);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasShaderRef.current,
    });
    renderer.setSize(width, height);

    const render = () => {
      renderer.render(scene, camera);

      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
    requestAnimationFrame(render);
  };

  return (
    <div className="relative -z-20">
      <canvas ref={canvasShaderRef} />
      <div id="canvasCosy" className="absolute inset-0 -z-10">
        <canvas ref={canvasCosyRef} />
        <div className="absolute inset-0 -z-0">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default VectorScope;
