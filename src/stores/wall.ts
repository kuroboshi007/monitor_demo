import { defineStore } from 'pinia';

export type Asset = { id: string; name: string };

export type Tile = {
  id: string;
  title: string;
  // HLS can be a simple string or a resolution map; all accepted.
  hls?: string | { url480?: string; url720?: string; url1080?: string } | null;
  webrtc?: { room: string; token: string } | null;
};

type State = {
  mode: 1 | 4 | 9;
  selected: Asset[]; // Ordered list of selected points (max 9)
  streams: Record<string, Tile>; // Cached stream info for each asset
};

export const useWallStore = defineStore('wall', {
  state: (): State => ({
    mode: 4,
    selected: [],
    streams: {}
  }),

  getters: {
    // grid column count
    gridCols: (s): 1 | 2 | 3 => (s.mode === 9 ? 3 : s.mode === 4 ? 2 : 1),
    // selected item count
    selectedCount: (s): number => s.selected.length,
    // merge selected and streams into a playable tile list (no clipping)
    tiles: (s): Tile[] =>
      s.selected.map((a) => {
        const st = s.streams[a.id];
        // choose a single HLS URL (prefer 720p fallback to 480 then 1080)
        const hls =
          typeof st?.hls === 'string'
            ? st?.hls
            : st?.hls?.url720 ?? st?.hls?.url480 ?? st?.hls?.url1080;
        return {
          id: a.id,
          title: st?.title ?? a.name,
          hls,
          webrtc: st?.webrtc ?? null
        };
      }),
    // tiles visible based on the current layout
    visibleTiles(): Tile[] {
      const limit = this.mode === 9 ? 9 : this.mode === 4 ? 4 : 1;
      return this.tiles.slice(0, limit);
    },
    // number of placeholder blocks needed to fill out the layout
    placeholdersCount(): number {
      const limit = this.mode === 9 ? 9 : this.mode === 4 ? 4 : 1;
      return Math.max(0, limit - this.visibleTiles.length);
    },
    // check if an asset is selected (used in ConstructionStatus.vue)
    isSelected: (s) => (id: string) => s.selected.some((x) => x.id === id)
  },

  actions: {
    // change the layout mode (1, 4, 9)
    setMode(m: 1 | 4 | 9) {
      this.mode = m;
    },
    // toggle selection of a point (max 9)
    toggleAsset(a: Asset) {
      const i = this.selected.findIndex((x) => x.id === a.id);
      if (i >= 0) {
        this.selected.splice(i, 1);
      } else if (this.selected.length < 9) {
        this.selected.push(a);
      }
    },
    // remove a selected point manually
    removeAsset(id: string) {
      const i = this.selected.findIndex((x) => x.id === id);
      if (i >= 0) this.selected.splice(i, 1);
    },
    // clear all selections
    clearSelected() {
      this.selected = [];
    },
    // cache stream info for an asset
    setStreamFor(id: string, tile: Tile) {
      this.streams[id] = { ...tile, id };
    },
    // ensure streams are loaded for all selected items using the provided loader
    async ensureStreams(loader: (id: string) => Promise<any>) {
      for (const a of this.selected) {
        if (!this.streams[a.id]) {
          const s = await loader(a.id);
          this.setStreamFor(a.id, {
            id: a.id,
            title: s?.title ?? a.name,
            hls: s?.hls ?? null,
            webrtc: s?.webrtc ?? null
          });
        }
      }
    },
    // double-click to focus a tile: move it to the first slot and switch to single mode
    focus(id: string) {
      this.mode = 1;
      const idx = this.selected.findIndex((x) => x.id === id);
      if (idx > 0) {
        const [it] = this.selected.splice(idx, 1);
        this.selected.unshift(it);
      }
    }
  },

  // enable persistence if pinia-plugin-persistedstate is installed
  persist: true
});