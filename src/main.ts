import {
  app,
  BrowserWindow,
  desktopCapturer,
  globalShortcut,
  ipcMain,
  session,
} from "electron";
import path from "path";
import started from "electron-squirrel-startup";
import createAboutWindow from "./about";
import { Worker } from "worker_threads";
import { BoundingBox } from "./types/types";

const isDev = !app.isPackaged;
const isMac = process.platform === "darwin";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let worker: Worker;
let mainWindow: BrowserWindow;
let captureId: string | null;
let bitmapHsvGlobal: Uint8ClampedArray;
let bitmapWidth: number;
let bitmapHeight: number;
let normalizedBoundingBox: BoundingBox;

const handleSetCaptureId = (
  _: Electron.IpcMainInvokeEvent,
  id: string | null,
) => {
  captureId = id;
};

const handleSetBitmap = (
  _: Electron.IpcMainInvokeEvent,
  bitmap: Uint8ClampedArray<ArrayBufferLike>,
  width: number,
  height: number,
  target_width: number,
  target_height: number,
) => {
  worker.postMessage({
    bitmap: bitmap,
    width: width,
    height: height,
    target_width: target_width,
    target_height: target_height,
    bbox_startX: (normalizedBoundingBox?.startX ?? 0) * width,
    bbox_startY: (normalizedBoundingBox?.startY ?? 0) * height,
    bbox_width: (normalizedBoundingBox?.width ?? 1) * width,
    bbox_height: (normalizedBoundingBox?.height ?? 1) * height,
  });
};

const triggerImageConvert = async () => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const addonPath = path.join(
      __dirname,
      "../../build/Release/imageconvert.node",
    );
    const pathToWorker = path.join(__dirname, "../../src/worker.js");
    worker = new Worker(pathToWorker, {
      workerData: { addonPath: addonPath },
    });
  } else {
    const addonPath = path.join(process.resourcesPath, "imageconvert.node");
    const pathToWorker = path.join(process.resourcesPath, "worker.js");
    worker = new Worker(pathToWorker, {
      workerData: { addonPath: addonPath },
    });
  }

  worker.on("message", (result) => {
    bitmapHsvGlobal = result.data;
    bitmapWidth = result.width;
    bitmapHeight = result.height;
  });
  worker.on("error", (msg) => {
    console.log(msg);
  });
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: "ScopifyPhoto",
    frame: false,
    width: isDev ? 550 : 300,
    minWidth: 276,
    minHeight: 276,
    height: 330,
    backgroundColor: "black",
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  session.defaultSession.setDisplayMediaRequestHandler(
    (request, callback) => {
      desktopCapturer
        .getSources({ types: ["screen", "window"] })
        .then((sources) => {
          let chosenSource = undefined;
          sources.forEach((source) => {
            if (source.id === captureId) {
              chosenSource = source;
            }
          });
          callback({ video: chosenSource, audio: "loopback" });
        });
      // If true, use the system picker if available.
      // Note: this is currently experimental. If the system picker
      // is available, it will be used and the media request handler
      // will not be invoked.
    },
    { useSystemPicker: true },
  );

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  ipcMain.on("set-captureid", handleSetCaptureId);
  ipcMain.on("imageconvert:set-bitmap", handleSetBitmap);
  ipcMain.on("title-bar:minimize-window", () => {
    BrowserWindow.getFocusedWindow().minimize();
  });
  ipcMain.on("title-bar:maximize-window", () => {
    BrowserWindow.getFocusedWindow().maximize();
  });
  ipcMain.on("title-bar:create-about-window", () => {
    createAboutWindow();
  });
  ipcMain.on("title-bar:reload", () => {
    mainWindow.webContents.reloadIgnoringCache();
  });
  ipcMain.on("title-bar:force-reload", () => {
    mainWindow.webContents.reload();
  });
  ipcMain.on("title-bar:toggle-dev-tools", () => {
    mainWindow.webContents.toggleDevTools();
  });
  ipcMain.on("imageconvert:trigger", triggerImageConvert);
  ipcMain.on("imageconvert:terminate", () => {
    worker && worker.terminate();
  });
  ipcMain.on("set-boundingbox", (_, boundingBox: BoundingBox) => {
    normalizedBoundingBox = boundingBox;
  });

  ipcMain.handle("is-dev", () => {
    return isDev;
  });
  ipcMain.handle("get-boundingbox", () => {
    return normalizedBoundingBox;
  });
  ipcMain.handle("video:getCaptureId", () => {
    return captureId;
  });
  ipcMain.handle(
    "desktopcapturer:getSources",
    async (event, opts: Electron.SourcesOptions) => {
      const sources: Electron.DesktopCapturerSource[] =
        await desktopCapturer.getSources(opts);
      return sources.map((source) => {
        return {
          appIcon: source.appIcon?.toDataURL(),
          display_id: source.display_id,
          id: source.id,
          name: source.name,
          thumbnail: source.thumbnail?.toDataURL(),
        };
      });
    },
  );
  ipcMain.handle("imageconvert:getHsv", async () => {
    return { data: bitmapHsvGlobal, width: bitmapWidth, height: bitmapHeight };
  });

  globalShortcut.register("CommandOrControl+W", () => {
    BrowserWindow.getFocusedWindow().close();
  });
  if (isDev) {
    globalShortcut.register("CommandOrControl+R", () => {
      BrowserWindow.getFocusedWindow().webContents.reload();
    });
    globalShortcut.register("CommandOrControl+Shift+R", () => {
      BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
    });
    globalShortcut.register("CommandOrControl+Shift+I", () => {
      BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
    });
  }

  createWindow();
});

app.on("quit", () => {
  mainWindow = null;
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
