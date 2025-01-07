const { parentPort, workerData } = require("worker_threads");
const addon = require(workerData.addonPath);

parentPort.on("message", (msg) => {
  if (msg.type === "rgbToHsv") {
    if (msg.args.bitmap) {
      const hsvData = new Uint8ClampedArray(
        addon.rgbToHsv(
          msg.args.bitmap.buffer,
          msg.args.width,
          msg.args.height,
          msg.args.target_width,
          msg.args.target_height,
          msg.args.bbox_startX,
          msg.args.bbox_startY,
          msg.args.bbox_width,
          msg.args.bbox_height,
          msg.args.use_blur,
        ),
      );
      parentPort.postMessage({
        data: hsvData,
        width: msg.args.target_width,
        height: msg.args.target_height,
      });
    }
  }

  if (msg.type === "updatePreferences") {
    addon.updatePreferences(msg.args.use_blur);
  }
});
