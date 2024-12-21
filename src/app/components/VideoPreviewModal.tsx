import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { DesktopSource } from "src/interface";

interface VideoPreviewModalParams {
  setIsOpen: (value: boolean) => void;
  setCaptureId: (value: string) => void;
  sources: DesktopSource[];
}

const VideoPreviewModal: React.FC<VideoPreviewModalParams> = ({
  setIsOpen,
  setCaptureId,
  sources,
}) => {
  const close = () => {
    setIsOpen(false);
  };

  const onSelected = (id: string) => {
    setCaptureId(id);
    close();
  };

  return (
    <Dialog
      open={true}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={close}
    >
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
            <div className="mt-4 grid grid-cols-2 gap-4">
              {sources.map((source, idx) => {
                return (
                  <div key={idx}>
                    <div className="h-40 w-full overflow-hidden rounded-md bg-white/10">
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
            <div className="mt-4">
              <Button
                className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/7 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
                onClick={close}
              >
                Got it, thanks!
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default VideoPreviewModal;
