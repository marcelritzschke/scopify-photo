import { VideoSelectionModalState } from "@/types/enums";
import { createContext } from "react";

export const AppContext = createContext<{
  isDev: boolean;
  appState: VideoSelectionModalState;
  requestAppStateTransition: (newState: VideoSelectionModalState) => void;
  isPreferencesOpen: boolean;
  setIsPreferencesOpen: (newState: boolean) => void;
  bitmap: ImageBitmap;
  fontSize: number;
  navBarHeight: number;
}>({
  isDev: false,
  appState: VideoSelectionModalState.Closed,
  requestAppStateTransition: null,
  isPreferencesOpen: false,
  setIsPreferencesOpen: null,
  bitmap: null,
  fontSize: 16,
  navBarHeight: 29,
});
