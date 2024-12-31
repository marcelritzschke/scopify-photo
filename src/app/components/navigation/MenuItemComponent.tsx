import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MenuItem } from "@headlessui/react";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";

const MenuItemComponent: React.FC<{
  label: string;
  shortcut?: string;
  callback?: (e?: any) => void;
}> = ({ label, shortcut, callback }) => {
  return (
    <MenuItem>
      <button
        onClick={callback}
        className="group flex w-full items-center gap-2 rounded-md px-3 py-1.5 data-[focus]:bg-white/10"
      >
        {label}
        <span className="ml-auto text-white/50 group-data-[focus]:inline">
          {shortcut === ">" ? (
            <FontAwesomeIcon icon={faChevronRight} />
          ) : (
            (shortcut ?? "")
          )}
        </span>
      </button>
    </MenuItem>
  );
};

export default MenuItemComponent;
