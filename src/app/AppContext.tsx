import { VideoSelectionModalState } from "@/types/enums";
import { createContext } from "react";

export const AppContext = createContext<{
  isDev: boolean;
  appState: VideoSelectionModalState;
  requestAppStateTransition: (newState: VideoSelectionModalState) => void;
  bitmap: ImageBitmap;
}>({
  isDev: false,
  appState: VideoSelectionModalState.Closed,
  requestAppStateTransition: (_) => {},
  bitmap: null,
});
