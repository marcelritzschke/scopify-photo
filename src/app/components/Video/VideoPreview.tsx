import { useContext, useEffect, useRef, useState } from "react";
import VideoPlayer from "./VideoPlay";
import VectorScope from "./VectorScope";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { Transition } from "@headlessui/react";

interface VideoPreviewProps {
  stream: MediaStream | null;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ stream }) => {
  const videoRef = useRef(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {stream && (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed left-0 top-1/2 z-50 -translate-y-1/2 rounded-r-md bg-slate-700/30 p-2 text-white shadow-lg"
          >
            {isOpen ? (
              <FontAwesomeIcon icon={faChevronLeft} />
            ) : (
              <FontAwesomeIcon icon={faChevronRight} />
            )}
          </button>
          <Transition
            show={isOpen}
            enter="transform transition-transform duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition-transform duration-300"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="fixed left-0 top-[29px] h-[calc(100vh-29px)] w-2/3 bg-black/95 shadow-md">
              <div className="m-0 items-center">
                <VideoPlayer mediaStream={stream} videoRef={videoRef} />
              </div>
            </div>
          </Transition>
          <VectorScope />
        </>
      )}
    </>
  );
};

export default VideoPreview;
