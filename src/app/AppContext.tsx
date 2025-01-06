import { VideoSelectionModalState } from "@/types/enums";
import { createContext } from "react";

export const AppContext = createContext<{
  isDev: boolean;
  appState: VideoSelectionModalState;
  requestAppStateTransition: (newState: VideoSelectionModalState) => void;
  bitmap: ImageBitmap;
  fontSize: number;
  navBarHeight: number;
}>({
  isDev: false,
  appState: VideoSelectionModalState.Closed,
  requestAppStateTransition: null,
  bitmap: null,
  fontSize: 16,
  navBarHeight: 29,
});
