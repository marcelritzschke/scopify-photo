import { MenuItem } from "@headlessui/react";

const MenuItemComponent: React.FC<{
  text: string;
  shortcut?: string;
  callback?: () => void;
}> = ({ text, shortcut, callback }) => {
  return (
    <MenuItem>
      <button
        onClick={callback}
        className="group flex w-full items-center gap-2 rounded-md px-3 py-1.5 data-[focus]:bg-white/10"
      >
        {text}
        <span className="ml-auto text-white/50 group-data-[focus]:inline">
          {shortcut ?? ""}
        </span>
      </button>
    </MenuItem>
  );
};

export default MenuItemComponent;
