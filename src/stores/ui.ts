import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    darkMode: false
  }),
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
    }
  },
  // 支持持久化存储（需安装 pinia-plugin-persistedstate 插件）
  persist: true
});