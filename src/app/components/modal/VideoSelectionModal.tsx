import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import VideoSelectionSource from "@/app/components/modal/VideoSelectionSource";
import { useContext, useState } from "react";
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

  const close = () => {
    requestAppStateTransition(VideoSelectionModalState.Closed);
  };

  const onSelected = async (id: string) => {
    await window.electronAPI.setCaptureId(id);
    requestAppStateTransition(VideoSelectionModalState.Cropping);
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
