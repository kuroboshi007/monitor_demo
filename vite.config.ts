import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Vite 配置，可根据需要扩展
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
  },
});
