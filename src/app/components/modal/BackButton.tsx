import { VideoSelectionModalState } from "@/types/enums";
import { Button } from "@headlessui/react";

const BackButton: React.FC<{
  state: VideoSelectionModalState;
  transition: (newState: VideoSelectionModalState) => void;
}> = ({ state, transition }) => {
  let ret = <></>;
  switch (state) {
    case VideoSelectionModalState.Selecting:
      ret = (
        <div
          className="mt-2 cursor-pointer text-white/75 hover:underline"
          onClick={() => {
            transition(VideoSelectionModalState.Closed);
          }}
        >
          Cancel
        </div>
      );
      break;
    case VideoSelectionModalState.Cropping:
      ret = (
        <Button
          className="ml-2 mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-white focus:outline-none"
          onClick={() => {
            transition(VideoSelectionModalState.Selecting);
          }}
        >
          Back
        </Button>
      );
    default:
      break;
  }
  return ret;
};

export default BackButton;
