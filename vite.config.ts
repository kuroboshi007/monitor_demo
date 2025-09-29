import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5173",
        changeOrigin: true,
        // 这里直接走前端 mock（见 services/api.ts），若有真实后端改成对应地址
        // 也可以注释掉此处 proxy，改用真实服务
      },
    },
  },
});
