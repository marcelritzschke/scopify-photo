import { Menu, MenuButton, MenuItems, MenuSeparator } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { faWindowMinimize } from "@fortawesome/free-solid-svg-icons/faWindowMinimize";
import { faWindowMaximize } from "@fortawesome/free-solid-svg-icons/faWindowMaximize";
import MenuItemComponent from "./MenuItemComponent";
import { useContext } from "react";
import { AppContext } from "@/app/AppContext";

interface Props {
  setIsSelectInputOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ({ setIsSelectInputOpen }: Props) {
  const { isDev } = useContext(AppContext);

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
          <Menu>
            <MenuButton className="rounded-md bg-gray-800 px-2 focus:outline-none data-[hover]:bg-gray-700 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
              File
            </MenuButton>
            <MenuItems
              transition
              anchor="bottom start"
              className="w-48 origin-top-right rounded-md border border-slate-700 bg-gray-800 p-1 text-white/75 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              <MenuItemComponent
                text="Select Input"
                callback={() => setIsSelectInputOpen(true)}
              />
              <MenuItemComponent
                text="Exit"
                shortcut="Ctrl+W"
                callback={window.close}
              />
            </MenuItems>
          </Menu>
          <Menu>
            <MenuButton className="rounded-md bg-gray-800 px-2 focus:outline-none data-[hover]:bg-gray-700 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
              Help
            </MenuButton>
            <MenuItems
              transition
              anchor="bottom start"
              className="w-32 origin-top-right rounded-md border border-slate-700 bg-gray-800 p-1 text-white/75 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              <MenuItemComponent
                text="About"
                callback={window.electronAPI.createAboutWindow}
              />
            </MenuItems>
          </Menu>

          {isDev && (
            <Menu>
              <MenuButton className="rounded-md bg-gray-800 px-2 focus:outline-none data-[hover]:bg-gray-700 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
                Developer
              </MenuButton>
              <MenuItems
                transition
                anchor="bottom start"
                className="w-72 origin-top-right rounded-md border border-slate-700 bg-gray-800 p-1 text-white/75 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
              >
                <MenuItemComponent
                  text="Reload"
                  shortcut="Ctrl+R"
                  callback={window.electronAPI.reloadMainWindow}
                />
                <MenuItemComponent
                  text="Force Reload"
                  shortcut="Ctrl+Shift+R"
                  callback={window.electronAPI.forceReloadMainWindow}
                />
                <MenuSeparator className="my-1 h-px bg-slate-700" />
                <MenuItemComponent
                  text="Toggle Developer Tools"
                  shortcut="Ctrl+Shift+I"
                  callback={window.electronAPI.toggleDevToolsMainWindow}
                />
              </MenuItems>
            </Menu>
          )}
        </div>
        <div className="mb-1 ml-3 mt-1 text-center text-white/75">
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
