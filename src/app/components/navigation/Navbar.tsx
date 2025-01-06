import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { faWindowMinimize } from "@fortawesome/free-solid-svg-icons/faWindowMinimize";
import { faWindowMaximize } from "@fortawesome/free-solid-svg-icons/faWindowMaximize";
import MenuBar from "./MenuBar";

export default function () {
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
        <div className="titlebar-menu z-10 mb-1 ml-1 mt-1 text-left text-white/75">
          <MenuBar />
        </div>
        <div className="invisible">Placeholder</div>
        <div className="titlebar-menu z-10 grid grid-cols-3 items-center text-right text-white/75">
          <div
            className="flex h-full w-full justify-center p-0 hover:bg-gray-500/50"
            onClick={minimizeWindow}
          >
            <FontAwesomeIcon icon={faWindowMinimize} className="mx-2 my-auto" />
          </div>
          <div
            className="flex h-full w-full justify-center p-0 hover:bg-gray-500/50"
            onClick={maximizeWindow}
          >
            <FontAwesomeIcon icon={faWindowMaximize} className="mx-2 my-auto" />
          </div>
          <div
            className="flex h-full w-full justify-center p-0 hover:bg-gray-500/50"
            onClick={closeWindow}
          >
            <FontAwesomeIcon icon={faXmark} className="mx-2 my-auto" />
          </div>
        </div>
        <div className="absolute inset-0 my-1 hidden w-full text-center text-white/75 sm:inline-block">
          Photo.Scopify
        </div>
      </div>
    </>
  );
}
