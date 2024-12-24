import { createContext } from "react";

export const AppContext = createContext<{ isDev: boolean }>({ isDev: false });
