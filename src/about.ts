import { BrowserWindow } from "electron";
import path from "path";

const createAboutWindow = () => {
  const aboutWindow = new BrowserWindow({
    title: "About - ScopifyPhoto",
    width: 300,
    height: 300,
    backgroundColor: "black",
    autoHideMenuBar: true,
    resizable: false,
    alwaysOnTop: true,
  });

  // and load the about.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    aboutWindow.loadURL(
      path.join(MAIN_WINDOW_VITE_DEV_SERVER_URL, "about.html"),
    );
  } else {
    aboutWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/about.html`),
    );
  }
};

export default createAboutWindow;
