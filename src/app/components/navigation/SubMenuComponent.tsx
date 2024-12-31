import { Item } from "@/types/types";
import MenuItemComponent from "./MenuItemComponent";

const SubMenuComponent: React.FC<{
  isOpen: boolean;
  width: string;
  items: Item[];
}> = ({ isOpen, width, items }) => {
  return (
    <div
      className={
        !isOpen
          ? "hidden"
          : "" +
            `${width} absolute left-[6.75rem] rounded-md border border-slate-700 bg-gray-800 text-white/75 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0`
      }
    >
      {items.map((item, index) => {
        return (
          <div key={index}>
            <MenuItemComponent
              label={item.label}
              shortcut={item.shortcut}
              callback={item.callback}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SubMenuComponent;
