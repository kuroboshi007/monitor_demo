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
  // support persisted state if pinia-plugin-persistedstate is installed
  persist: true
});