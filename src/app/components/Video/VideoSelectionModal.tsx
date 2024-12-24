import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { DesktopSource } from "@/types/types";
import VideoSelectionSource from "./VideoSelectionSource";
import { useState } from "react";
import VideoSelectionCrop from "./VideoSelectionCrop";

interface VideoSelectionModalParams {
  setIsOpen: (value: boolean) => void;
  setCaptureId: (value: string) => void;
  sources: DesktopSource[];
  stream: MediaStream;
}

const VideoSelectionModal: React.FC<VideoSelectionModalParams> = ({
  setIsOpen,
  setCaptureId,
  sources,
  stream,
}) => {
  const [currentActiveId, setCurrentActiveId] = useState<string>();

  const close = () => {
    setIsOpen(false);
  };

  const onSelected = (id: string) => {
    setCaptureId(id);
    setCurrentActiveId(id);
  };

  const MainView: React.FC = () => {
    if (!currentActiveId) {
      return <VideoSelectionSource onSelected={onSelected} sources={sources} />;
    }
    return <VideoSelectionCrop stream={stream} />;
  };

  return (
    <Dialog
      open={true}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={close}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="data-[closed]:transform-[scale(95%)] w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:opacity-0"
          >
            <DialogTitle
              as="h3"
              className="text-center text-xl font-medium text-white"
            >
              Screen Capture
            </DialogTitle>
            <p className="mt-2 text-center text-sm/6 text-white/75">
              Select the screen or application which will be live captured.
            </p>
            <MainView />
            <div className="mt-4 flex items-center justify-end border-t border-gray-700">
              <div
                className="mt-2 cursor-pointer text-white/75 hover:underline"
                onClick={close}
              >
                Cancel
              </div>
              <Button
                disabled
                className="ml-2 mt-2 inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-white focus:outline-none"
              >
                Next
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default VideoSelectionModal;
