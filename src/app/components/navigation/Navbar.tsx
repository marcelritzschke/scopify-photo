import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { faWindowMinimize } from "@fortawesome/free-solid-svg-icons/faWindowMinimize";
import { faWindowMaximize } from "@fortawesome/free-solid-svg-icons/faWindowMaximize";
import { useContext } from "react";
import { AppContext } from "@/app/AppContext";
import MenuBar from "./MenuBar";

export default function () {
  const {
    isDev,
    appState,
    requestAppStateTransition: requestAppStateTransition,
  } = useContext(AppContext);

  const closeWindow = () => {
    window.close();
  };

  const minimizeWindow = () => {
    window.electronAPI.minimizeWindow();
  };

  const maximizeWindow = () => {
    window.electronAPI.maximizeWindow();
  };

  return (
    <>
      <div className="titlebar fixed left-0 top-0 flex w-full justify-between border-b border-slate-700 bg-gray-800 p-0">
        <div className="titlebar-menu mb-1 ml-1 mt-1 text-left text-white/75">
          <MenuBar />
        </div>
        <div className="mb-1 ml-3 mt-1 hidden text-center text-white/75 sm:inline-block">
          Vector Scope Live
        </div>
        <div className="titlebar-menu grid grid-cols-3 items-center gap-x-3 text-right text-white/75">
          <FontAwesomeIcon
            icon={faWindowMinimize}
            className="m-auto mb-1 ml-3 mt-1 cursor-pointer"
            onClick={minimizeWindow}
          />
          <FontAwesomeIcon
            icon={faWindowMaximize}
            className="m-auto mb-1 mt-1 cursor-pointer"
            onClick={maximizeWindow}
          />
          <FontAwesomeIcon
            icon={faXmark}
            className="m-auto mb-1 mr-3 mt-1 cursor-pointer"
            onClick={closeWindow}
          />
        </div>
      </div>
    </>
  );
}
