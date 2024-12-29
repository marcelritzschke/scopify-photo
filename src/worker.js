const path = require("path");
const { parentPort, workerData } = require("worker_threads");
const addon = require(workerData.addonPath);

parentPort.on("message", (msg) => {
  const bitmapGlobal = msg;

  if (bitmapGlobal) {
    const hsvData = new Uint8ClampedArray(addon.rgbToHsv(bitmapGlobal.buffer));
    parentPort.postMessage(hsvData);
  }
});
