import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main_window: resolve(__dirname, "index.html"),
        modal_window: resolve(__dirname, "about.html"),
      },
    },
  },
});
