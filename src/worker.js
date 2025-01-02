const { parentPort, workerData } = require("worker_threads");
const addon = require(workerData.addonPath);

parentPort.on("message", (msg) => {
  const {
    bitmap,
    width,
    height,
    target_width,
    target_height,
    bbox_startX,
    bbox_startY,
    bbox_width,
    bbox_height,
  } = msg;

  if (bitmap) {
    const hsvData = new Uint8ClampedArray(
      addon.rgbToHsv(
        bitmap.buffer,
        width,
        height,
        target_width,
        target_height,
        bbox_startX,
        bbox_startY,
        bbox_width,
        bbox_height,
      ),
    );
    parentPort.postMessage({
      data: hsvData,
      width: target_width,
      height: target_height,
    });
  }
});
