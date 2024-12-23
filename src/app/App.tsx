import { useState } from "react";
import Navbar from "./components/navigation/Navbar";
import VideoPreview from "./components/Video/VideoPreview";

export default function App() {
  const [isSelectInputOpen, setIsSelectInputOpen] = useState<boolean>(false);

  return (
    <>
      <div>
        <Navbar setIsSelectInputOpen={setIsSelectInputOpen} />
      </div>
      <div className="mt-2">
        <VideoPreview
          isSelectInputOpen={isSelectInputOpen}
          setIsSelectInputOpen={setIsSelectInputOpen}
        />
      </div>
    </>
  );
}
