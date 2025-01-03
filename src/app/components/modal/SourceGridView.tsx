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
    <div className="mt-2 grid h-96 grid-cols-1 gap-4 overflow-auto px-4 sm:grid-cols-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
      {sources.map((source, idx) => {
        return (
          <div key={idx}>
            <div className="h-32 w-full overflow-hidden rounded-md bg-white/10">
              <img
                src={source.thumbnail}
                className="h-full w-full object-contain hover:border"
                onClick={() => onSelected(source.id)}
              ></img>
            </div>
            <span className="text-sm/6 text-white">{source.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default SourceGridView;
