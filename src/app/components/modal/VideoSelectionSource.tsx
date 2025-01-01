import { DesktopSource } from "@/types/types";
import Spinner from "@/app/components/Spinner";
import { useEffect, useState } from "react";
import { fetchDesktopSources } from "@/lib/utils";

interface VideoSelectionSourceParams {
  onSelected: (id: string) => void;
}

const VideoSelectionSource: React.FC<VideoSelectionSourceParams> = ({
  onSelected,
}) => {
  const [sources, setSources] = useState<DesktopSource[]>([]);

  useEffect(() => {
    const fetchDesktopSourcesWrapper = async () => {
      return await fetchDesktopSources();
    };
    fetchDesktopSourcesWrapper().then((result) => {
      setSources(result);
    });
  }, []);

  if (sources.length) {
    return (
      <div className="mt-4 grid h-96 grid-cols-2 gap-4 overflow-auto px-4 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:w-2">
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
  }

  return (
    <div className="my-7 flex justify-center">
      <Spinner className="h-8 w-8 animate-spin fill-slate-700 text-gray-200 dark:text-gray-600" />
    </div>
  );
};

export default VideoSelectionSource;
