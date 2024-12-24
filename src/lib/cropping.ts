import { BoundingBox } from "@/types/types";

const handleSize = 10;
const cropAreaMinSize = 50;

export const drawBoundingBox = (
  ctx: CanvasRenderingContext2D | null,
  canvasWidth: number,
  canvasHeight: number,
  boundingBox: BoundingBox,
) => {
  if (!ctx) return;

  const { startX, startY, width, height } = boundingBox;

  // Clear the canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const compensationForGapBetweenBoxes = 0.5; //TODO: Can we find a better solution or prevent the issue in the first place?

  // Draw greyed-out areas outside the bounding box
  ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
  ctx.fillRect(0, 0, canvasWidth, startY + compensationForGapBetweenBoxes); // Top area
  ctx.fillRect(0, startY, startX, height); // Left area
  ctx.fillRect(startX + width, startY, canvasWidth - (startX + width), height); // Right area
  ctx.fillRect(
    0,
    startY + height - compensationForGapBetweenBoxes,
    canvasWidth,
    canvasHeight - (startY + height),
  ); // Bottom area

  // Draw the bounding box
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, width, height);

  // Draw drag handles (corners and edges)
  ctx.fillStyle = "white";

  // Top-left corner
  ctx.fillRect(
    startX - handleSize / 2,
    startY - handleSize / 2,
    handleSize,
    handleSize,
  );
  // Top-right corner
  ctx.fillRect(
    startX + width - handleSize / 2,
    startY - handleSize / 2,
    handleSize,
    handleSize,
  );
  // Bottom-left corner
  ctx.fillRect(
    startX - handleSize / 2,
    startY + height - handleSize / 2,
    handleSize,
    handleSize,
  );
  // Bottom-right corner
  ctx.fillRect(
    startX + width - handleSize / 2,
    startY + height - handleSize / 2,
    handleSize,
    handleSize,
  );
  // Middle handles (for edges)
  ctx.fillRect(
    startX + width / 2 - handleSize / 2,
    startY - handleSize / 2,
    handleSize,
    handleSize,
  ); // Top edge
  ctx.fillRect(
    startX + width / 2 - handleSize / 2,
    startY + height - handleSize / 2,
    handleSize,
    handleSize,
  ); // Bottom edge
  ctx.fillRect(
    startX - handleSize / 2,
    startY + height / 2 - handleSize / 2,
    handleSize,
    handleSize,
  ); // Left edge
  ctx.fillRect(
    startX + width - handleSize / 2,
    startY + height / 2 - handleSize / 2,
    handleSize,
    handleSize,
  ); // Right edge
};

export const getDraggingLocation = (
  mouseX: number,
  mouseY: number,
  boundingBox: BoundingBox,
): string | null => {
  const { startX, startY, width, height } = boundingBox;

  let draggingLocation = null;
  if (
    Math.abs(mouseX - startX) < handleSize &&
    Math.abs(mouseY - startY) < handleSize
  ) {
    draggingLocation = "top-left";
  } else if (
    Math.abs(mouseX - (startX + width)) < handleSize &&
    Math.abs(mouseY - startY) < handleSize
  ) {
    draggingLocation = "top-right";
  } else if (
    Math.abs(mouseX - startX) < handleSize &&
    Math.abs(mouseY - (startY + height)) < handleSize
  ) {
    draggingLocation = "bottom-left";
  } else if (
    Math.abs(mouseX - (startX + width)) < handleSize &&
    Math.abs(mouseY - (startY + height)) < handleSize
  ) {
    draggingLocation = "bottom-right";
  } else if (Math.abs(mouseY - startY) < handleSize) {
    //TODO: there is a bug that the handle goes along the whole canvas
    draggingLocation = "top";
  } else if (Math.abs(mouseY - (startY + height)) < handleSize) {
    //TODO: there is a bug that the handle goes along the whole canvas
    draggingLocation = "bottom";
  } else if (Math.abs(mouseX - startX) < handleSize) {
    //TODO: there is a bug that the handle goes along the whole canvas
    draggingLocation = "left";
  } else if (Math.abs(mouseX - (startX + width)) < handleSize) {
    //TODO: there is a bug that the handle goes along the whole canvas
    draggingLocation = "right";
  } else if (
    mouseX < startX + width &&
    mouseX > startX &&
    mouseY < startY + height &&
    mouseY > startY
  ) {
    draggingLocation = "move";
  } else {
    draggingLocation = null;
  }
  return draggingLocation;
};

export const setNewBoundingBox = (
  dragging: string,
  newBox: BoundingBox,
  prev: BoundingBox,
  mouseX: number,
  mouseY: number,
  canvasWidth: number,
  canvasHeight: number,
): BoundingBox => {
  switch (dragging) {
    case "top-left":
      newBox.startX = mouseX;
      newBox.startY = mouseY;
      newBox.width = prev.width - (mouseX - prev.startX);
      newBox.height = prev.height - (mouseY - prev.startY);
      break;
    case "top-right":
      newBox.startY = mouseY;
      newBox.width = mouseX - prev.startX;
      newBox.height = prev.height - (mouseY - prev.startY);
      break;
    case "bottom-left":
      newBox.startX = mouseX;
      newBox.width = prev.width - (mouseX - prev.startX);
      newBox.height = mouseY - prev.startY;
      break;
    case "bottom-right":
      newBox.width = mouseX - prev.startX;
      newBox.height = mouseY - prev.startY;
      break;
    case "top":
      newBox.startY = mouseY;
      newBox.height = prev.height - (mouseY - prev.startY);
      break;
    case "bottom":
      newBox.height = mouseY - prev.startY;
      break;
    case "left":
      newBox.startX = mouseX;
      newBox.width = prev.width - (mouseX - prev.startX);
      break;
    case "right":
      newBox.width = mouseX - prev.startX;
      break;
    default:
      break;
  }

  // Do not go out of canvas and below min size
  if (
    newBox.width < cropAreaMinSize ||
    newBox.height < cropAreaMinSize ||
    newBox.startX < 0 ||
    newBox.startY < 0 ||
    newBox.startX + newBox.width > canvasWidth ||
    newBox.startY + newBox.height > canvasHeight
  )
    return prev;

  return newBox;
};
