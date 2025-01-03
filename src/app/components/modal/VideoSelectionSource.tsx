import { DesktopSource } from "@/types/types";
import Spinner from "@/app/components/Spinner";
import { useEffect, useState } from "react";
import { fetchDesktopSources } from "@/lib/utils";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import SourceGridView from "./SourceGridView";

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
    const appSources = sources.filter((source) => {
      return source.id.startsWith("window");
    });

    const screenSources = sources.filter((source) => {
      return source.id.startsWith("screen");
    });

    return (
      <TabGroup className="my-4">
        <TabList>
          <Tab className="ml-4 mr-1 rounded-full px-2 py-1 text-white data-[hover]:bg-white/5 data-[selected]:bg-white/10">
            Applications
          </Tab>
          <Tab className="ml-4 mr-4 rounded-full px-2 py-1 text-white data-[hover]:bg-white/5 data-[selected]:bg-white/10 sm:ml-1">
            Screens
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <SourceGridView sources={appSources} onSelected={onSelected} />
          </TabPanel>
          <TabPanel>
            <SourceGridView sources={screenSources} onSelected={onSelected} />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    );
  }

  return (
    <div className="my-7 flex justify-center">
      <Spinner className="h-8 w-8 animate-spin fill-slate-700 text-gray-200 dark:text-gray-600" />
    </div>
  );
};

export default VideoSelectionSource;
