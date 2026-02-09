// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
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
