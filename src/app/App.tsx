import { useState } from "react";
import Navbar from "./components/navigation/Navbar";
import VideoPreview from "./components/video/VideoPreview";
import { AppContext } from "./AppContext";

export default function App() {
  const isDev = process.env.NODE_ENV !== "production" ? true : false;
  const [isSelectInputOpen, setIsSelectInputOpen] = useState<boolean>(false);

  return (
    <AppContext.Provider value={{ isDev: isDev }}>
      <div>
        <Navbar setIsSelectInputOpen={setIsSelectInputOpen} />
      </div>
      <div className="mt-2">
        <VideoPreview
          isSelectInputOpen={isSelectInputOpen}
          setIsSelectInputOpen={setIsSelectInputOpen}
        />
      </div>
    </AppContext.Provider>
  );
}
