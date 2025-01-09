import { DesktopSource } from "@/types/types";

interface SourceGridViewProps {
  sources: DesktopSource[];
  onSelected: (id: string) => void;
}

const SourceGridView: React.FC<SourceGridViewProps> = ({
  sources,
  onSelected,
}) => {
  return (
    <div className="mt-2 grid grid-cols-1 gap-4 px-4 sm:grid-cols-2">
      {sources.map((source, idx) => {
        return (
          <div key={idx}>
            <div className="h-32 w-full rounded-md bg-white/10 hover:border-2">
              <img
                src={source.thumbnail}
                className="h-full w-full object-contain"
                onClick={() => onSelected(source.id)}
              ></img>
            </div>
            <div className="w-full">
              <span className="block truncate text-sm/6 text-white">
                {source.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SourceGridView;
