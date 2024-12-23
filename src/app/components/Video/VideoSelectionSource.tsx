import { DesktopSource } from "types/types";

interface VideoSelectionSourceParams {
  onSelected: (id: string) => void;
  sources: DesktopSource[];
}

const VideoSelectionSource: React.FC<VideoSelectionSourceParams> = ({
  onSelected,
  sources,
}) => {
  return (
    <div className="mt-4 grid h-96 grid-cols-2 gap-4 overflow-auto [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
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

export default VideoSelectionSource;
