import { Menu, MenuButton, MenuItems, MenuSeparator } from "@headlessui/react";
import MenuItemComponent from "./MenuItemComponent";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/app/AppContext";
import { VideoSelectionModalState } from "@/types/enums";
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SubMenu } from "@/types/types";
import SubMenuComponent from "./SubMenuComponent";

const MenuBar = () => {
  const { isDev, requestAppStateTransition, setIsPreferencesOpen } =
    useContext(AppContext);
  const [isSubOpen, setIsSubOpen] = useState<number>(-1);

  useEffect(() => {
    const handleWindowClick = (e: PointerEvent) => {
      if (!e.target.closest(".collapsed-menu-items")) {
        setIsSubOpen(-1);
      }
    };

    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);

  const openVideoSelection = () => {
    requestAppStateTransition(VideoSelectionModalState.Selecting);
  };

  const items: SubMenu[] = [
    {
      label: "File",
      width: "w-40",
      submenu: [
        {
          type: "button",
          label: "Select Input",
          callback: openVideoSelection,
        },
        {
          type: "button",
          label: "Preferences",
          callback: () => setIsPreferencesOpen(true),
        },
        {
          type: "button",
          label: "Exit",
          shortcut: "Ctrl+W",
          callback: window.close,
        },
      ],
    },
    {
      label: "Help",
      width: "w-24",
      submenu: [
        {
          type: "button",
          label: "About",
          callback: window.electronAPI.createAboutWindow,
        },
      ],
    },
  ];

  if (isDev) {
    items.push({
      label: "Developer",
      width: "w-64",
      submenu: [
        {
          type: "button",
          label: "Reload",
          shortcut: "Ctrl+R",
          callback: window.electronAPI.reloadMainWindow,
        },
        {
          type: "button",
          label: "Force Reload",
          shortcut: "Ctrl+Shift+R",
          callback: window.electronAPI.forceReloadMainWindow,
        },
        {
          type: "separator",
        },
        {
          type: "button",
          label: "Toggle Developer Tools",
          shortcut: "Ctrl+Shift+I",
          callback: window.electronAPI.toggleDevToolsMainWindow,
        },
      ],
    });
  }

  return (
    <>
      <div className="md:hidden">
        <Menu>
          <MenuButton className="rounded-md bg-gray-800 px-2 focus:outline-none data-[hover]:bg-gray-700 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
            <FontAwesomeIcon icon={faBars} />
          </MenuButton>
          <MenuItems
            transition
            anchor="bottom start"
            className={`collapsed-menu-items w-28 origin-top-right rounded-md border border-slate-700 bg-gray-800 p-1 text-white/75 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0`}
          >
            {items.map((item, index) => {
              return (
                <div key={index}>
                  <SubMenuComponent
                    width={item.width}
                    isOpen={isSubOpen === index}
                    items={item.submenu}
                  />
                  <MenuItemComponent
                    label={item.label}
                    shortcut=">"
                    callback={(e) => {
                      e.preventDefault();
                      setIsSubOpen(index);
                    }}
                  />
                </div>
              );
            })}
          </MenuItems>
        </Menu>
      </div>

      <div className="hidden md:inline-block">
        {items.map((item, index) => {
          return (
            <span key={index}>
              <Menu>
                <MenuButton className="rounded-md bg-gray-800 px-2 focus:outline-none data-[hover]:bg-gray-700 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
                  {item.label}
                </MenuButton>
                <MenuItems
                  transition
                  anchor="bottom start"
                  className={`${item.width ?? ""} origin-top-right rounded-md border border-slate-700 bg-gray-800 p-1 text-white/75 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0`}
                >
                  {item.submenu.map((subitem, index) => {
                    if (subitem.type === "separator") {
                      return (
                        <div key={index}>
                          <MenuSeparator className="my-1 h-px bg-slate-700" />
                        </div>
                      );
                    }
                    return (
                      <div key={index}>
                        <MenuItemComponent
                          label={subitem.label}
                          shortcut={subitem.shortcut}
                          callback={subitem.callback}
                        />
                      </div>
                    );
                  })}
                </MenuItems>
              </Menu>
            </span>
          );
        })}
      </div>
    </>
  );
};

export default MenuBar;
