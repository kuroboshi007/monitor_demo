<template>
  <div class="topbar">
    <button @click="wall.setMode(1)">1</button>
    <button @click="wall.setMode(4)">4</button>
    <button @click="wall.setMode(9)">9</button>
    <span class="hint">Selected：{{ wall.selectedCount }}</span>
  </div>
  <div class="grid" :style="{ gridTemplateColumns: `repeat(${wall.gridCols}, 1fr)` }">
    <!-- 已有的可见 Tile -->
    <div
      v-for="t in wall.visibleTiles"
      :key="t.id"
      class="tile-wrap"
      @dblclick="wall.focus(t.id)">
      <div class="title">{{ t.title }}</div>
      <VideoTile :source="t" />
    </div>
    <!-- 占位补齐（让 4→9 后也有满 9 格的感觉） -->
    <div
      v-for="i in wall.placeholdersCount"
      :key="'ph' + i"
      class="placeholder">
      (Empty) Add back to the map
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWallStore } from '../stores/wall';
import VideoTile from '../components/VideoTile.vue';
const wall = useWallStore();
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}
.hint {
  color: #666;
  margin-left: 8px;
}
.grid {
  display: grid;
  gap: 1px;
  height: calc(100vh - 48px);
}
.tile-wrap {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  outline: 1px dashed #ddd;
  background: #000;
}
.title {
  position: absolute;
  z-index: 2;
  top: 6px;
  left: 6px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
}
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #bbb;
  color: #777;
  background: repeating-linear-gradient(
    45deg,
    #fafafa,
    #fafafa 10px,
    #f3f3f3 10px,
    #f3f3f3 20px
  );
}
</style>