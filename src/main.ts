import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  Menu,
  session,
} from "electron";
import path from "path";
import started from "electron-squirrel-startup";
import createAboutWindow from "./about";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow;
let captureId: string;

const handleSetCaptureId = (event: Electron.IpcMainInvokeEvent, id: string) => {
  captureId = id;
};

const triggerImageGrab = (
  event: Electron.IpcMainInvokeEvent,
  stream: MediaStream,
) => {
  console.log("here in main", event, stream);

  navigator.mediaDevices
    .getDisplayMedia({
      audio: false,
      video: {
        width: 320,
        height: 240,
        frameRate: 30,
      },
    })
    .then((stream) => {
      console.log(stream);
    })
    .catch((e) => console.log(e));

  // const videoTrack: MediaStreamTrack = stream.getVideoTracks()[0];
  // const imageCapture = new ImageCapture(videoTrack);
  // const captureInterval = setInterval(async () => {
  //   try {
  //     // Capture a frame (returns a Bitmap)
  //     const bitmap = await imageCapture.grabFrame();
  //     console.log("Captured Bitmap:", bitmap);

  //     //   // Optionally draw the bitmap to a canvas
  //     //   const canvas = document.createElement("canvas");
  //     //   const ctx = canvas.getContext("2d");
  //     //   canvas.width = bitmap.width;
  //     //   canvas.height = bitmap.height;
  //     //   ctx.drawImage(bitmap, 0, 0);

  //     //   // Do something with the canvas or bitmap here (e.g., save, display)
  //     //   // Example: Convert to data URL and display in an image element
  //     //   const imgElement = document.createElement("img");
  //     //   imgElement.src = canvas.toDataURL();
  //     //   document.body.appendChild(imgElement); // Append to document (optional)
  //   } catch (error) {
  //     console.error("Error capturing bitmap:", error);
  //   }
  // }, 1000);
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: "Vector Scope Live",
    width: isDev ? 1000 : 800,
    height: 600,
    backgroundColor: "black",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  session.defaultSession.setDisplayMediaRequestHandler(
    (request, callback) => {
      desktopCapturer.getSources({ types: ["window"] }).then((sources) => {
        let chosenSource = sources[0];
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
  ipcMain.on("trigger-image-grab", triggerImageGrab);

  createWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

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
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ label: "About", click: createAboutWindow }],
        },
      ]
    : []),
  { role: "fileMenu" },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
] as Electron.MenuItem[];
