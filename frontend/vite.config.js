// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-is"],
  },
  resolve: {
    alias: {
      // explicitly point "react-is" to the installed package entry
      "react-is": path.resolve(__dirname, "node_modules/react-is/index.js"),
    },
  },
});
