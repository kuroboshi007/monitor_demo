import { defineStore } from 'pinia';

// UI store that tracks UI‑level state such as dark mode.  This store
// supports persistence if the pinia‑plugin‑persistedstate plugin is
// installed in the application.
export const useUIStore = defineStore('ui', {
  state: () => ({
    darkMode: false,
  }),
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
    },
  },
  // persist state across sessions (optional)
  persist: true,
});