import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import VideoSelectionSource from "@/app/components/modal/VideoSelectionSource";
import { useContext } from "react";
import VideoSelectionCrop from "@/app/components/modal/VideoSelectionCrop";
import NextButton from "@/app/components/modal/NextButton";
import { VideoSelectionModalState } from "@/types/enums";
import BackButton from "@/app/components/modal/BackButton";
import { AppContext } from "@/app/AppContext";

interface VideoSelectionModalProps {
  stream: MediaStream | null;
}

const VideoSelectionModal: React.FC<VideoSelectionModalProps> = ({
  stream,
}) => {
  const { appState, requestAppStateTransition } = useContext(AppContext);

  const cancelled = () => {
    requestAppStateTransition(VideoSelectionModalState.Cancelled);
  };

  const onSelected = async (id: string) => {
    requestAppStateTransition(VideoSelectionModalState.Cropping);
    await window.electronAPI.setCaptureId(id);
  };

  const MainView: React.FC = () => {
    switch (appState) {
      case VideoSelectionModalState.Selecting:
        return <VideoSelectionSource onSelected={onSelected} />;
      case VideoSelectionModalState.Cropping:
        return <VideoSelectionCrop stream={stream} />;
      default:
        return (
          <div className="flex justify-center">
            Error: State not supported for rendering
          </div>
        );
    }
  };

  return (
    <Dialog
      open={true}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={cancelled}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-hidden">
        <div className="flex items-center justify-center p-4">
          <DialogPanel
            transition
            className="data-[closed]:transform-[scale(95%)] flex h-[calc(100vh-29px)] max-h-[512px] w-full max-w-md flex-col rounded-xl bg-white/10 py-2 backdrop-blur-2xl duration-300 ease-out data-[closed]:opacity-0"
          >
            <DialogTitle
              as="h3"
              className="px-1 text-center text-xl font-medium text-white"
            >
              Screen Capture
            </DialogTitle>
            <p className="mt-2 px-1 text-center text-sm/6 text-white/75">
              Select the application or screen that will be live captured.
            </p>
            <div className="flex-grow overflow-y-auto overflow-x-hidden">
              <MainView />
            </div>
            <div className="mr-2 flex items-center justify-end">
              <BackButton
                state={appState}
                transition={requestAppStateTransition}
              />
              <NextButton
                state={appState}
                transition={requestAppStateTransition}
              />
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default VideoSelectionModal;
