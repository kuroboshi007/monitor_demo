import { defineStore } from 'pinia';

export type Asset = { id: string; name: string };

export type Tile = {
  id: string;
  title: string;
  // HLS 可以是简单字符串或分档对象，这里都接受
  hls?: string | { url480?: string; url720?: string; url1080?: string } | null;
  webrtc?: { room: string; token: string } | null;
};

type State = {
  mode: 1 | 4 | 9;
  selected: Asset[]; // 已选的点（保持顺序，最多 9）
  streams: Record<string, Tile>; // 每个 assetId 的流信息缓存
};

export const useWallStore = defineStore('wall', {
  state: (): State => ({
    mode: 4,
    selected: [],
    streams: {}
  }),

  getters: {
    // 栅格列数
    gridCols: (s): 1 | 2 | 3 => (s.mode === 9 ? 3 : s.mode === 4 ? 2 : 1),
    // 已选数量
    selectedCount: (s): number => s.selected.length,
    // 根据 selected + streams 生成可播放的 tile 列表（不裁剪）
    tiles: (s): Tile[] =>
      s.selected.map((a) => {
        const st = s.streams[a.id];
        // 统一取一个可用的 HLS URL（demo 用 720 优先）
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
    // 受布局影响的“可见”tiles（渲染用）
    visibleTiles(): Tile[] {
      const limit = this.mode === 9 ? 9 : this.mode === 4 ? 4 : 1;
      return this.tiles.slice(0, limit);
    },
    // 补齐占位格子的数量（让 4→9 后看起来是完整九宫格）
    placeholdersCount(): number {
      const limit = this.mode === 9 ? 9 : this.mode === 4 ? 4 : 1;
      return Math.max(0, limit - this.visibleTiles.length);
    },
    // 判断是否已选（给 ConstructionStatus.vue 用）
    isSelected: (s) => (id: string) => s.selected.some((x) => x.id === id)
  },

  actions: {
    // 切换布局
    setMode(m: 1 | 4 | 9) {
      this.mode = m;
    },
    // 选择/取消选择点（最多 9）
    toggleAsset(a: Asset) {
      const i = this.selected.findIndex((x) => x.id === a.id);
      if (i >= 0) {
        this.selected.splice(i, 1);
      } else if (this.selected.length < 9) {
        this.selected.push(a);
      }
    },
    // 手动移除某个已选点
    removeAsset(id: string) {
      const i = this.selected.findIndex((x) => x.id === id);
      if (i >= 0) this.selected.splice(i, 1);
    },
    // 清空选择
    clearSelected() {
      this.selected = [];
    },
    // 写入某个点的流缓存
    setStreamFor(id: string, tile: Tile) {
      this.streams[id] = { ...tile, id };
    },
    // 为尚未缓存的选中项拉取流信息（传入 API 加载器）
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
    // 双击放大：把该项移到 selected 的第 1 位并切成单格
    focus(id: string) {
      this.mode = 1;
      const idx = this.selected.findIndex((x) => x.id === id);
      if (idx > 0) {
        const [it] = this.selected.splice(idx, 1);
        this.selected.unshift(it);
      }
    }
  },

  // 开启状态持久化（如果安装了 pinia-plugin-persistedstate）
  persist: true
});