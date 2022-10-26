import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  build: {
    outDir: "build"
  },
  server: {
    strictPort: true,
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001"
      },

      "/socket.io": {
        //Express/socket.io server runs at 3001
        target: "ws://localhost:3001",
        ws: true
      }
    }
  }
});
