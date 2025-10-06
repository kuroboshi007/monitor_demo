import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// Vite 配置，可根据需要扩展
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "src/assets"),
    },
  },
});
