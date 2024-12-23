import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config
export default defineConfig({
  server: {
    host: "0.0.0.0",
  },
  build: {
    rollupOptions: {
      input: {
        main_window: resolve(__dirname, "index.html"),
        about_window: resolve(__dirname, "about.html"),
      },
    },
  },
});
