import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        widget: "src/main.jsx",
        embed: "src/embed.jsx",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name].[ext]",
      },
    },
    minify: "esbuild",
    target: "es2017",
    cssCodeSplit: true,
  },
  css: {
    preprocessorOptions: {
      css: {
        additionalData: "",
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
