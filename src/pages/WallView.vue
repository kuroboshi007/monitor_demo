<template>
  <div class="topbar">
    <!-- Buttons to switch layout: 1, 4, or 9 grid cells -->
    <button @click="wall.setMode(1)">1</button>
    <button @click="wall.setMode(4)">4</button>
    <button @click="wall.setMode(9)">9</button>
    <span class="hint">Selected: {{ selectedCount }}</span>
  </div>
  <div
    class="grid"
    :style="{ gridTemplateColumns: `repeat(${wall.gridCols}, 1fr)` }">
    <!-- Render selected video tiles -->
    <div
      v-for="t in wall.visibleTiles"
      :key="t.id"
      class="tile-wrap"
      @dblclick="wall.focus(t.id)">
      <div class="title">{{ t.title }}</div>
      <VideoTile :source="t" />
    </div>
    <!-- Fill remaining slots with placeholders -->
    <div
      v-for="i in wall.placeholdersCount"
      :key="'ph' + i"
      class="placeholder">
      (Empty) Add back to the map
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from "vue";
import { listenMonitorUpdates } from "../utils/monitorBridge";
import { useWallStore } from "../stores/wall";
import { getStreamsByAssetId } from "../services/api";
import VideoTile from "../components/VideoTile.vue";

// Use Pinia store to manage selected items and streams
const wall = useWallStore();

// compute current selection count from the store
const selectedCount = computed(() => wall.selected.length);

/**
 * Handle updates sent from the main (map) window.  The data should
 * include an array of items with id and name.  We clear the current
 * selection and reselect each item, then load streams for any newly
 * selected items.
 */
function handleUpdate(data: any) {
  if (!data) return;
  const items = Array.isArray(data.items) ? data.items : [];
  wall.clearSelected();
  for (const it of items) {
    wall.toggleAsset({ id: it.id, name: it.name });
  }
  // fetch stream info for selected items
  wall.ensureStreams(getStreamsByAssetId);
}

let stop: null | (() => void) = null;

onMounted(() => {
  // start listening for updates
  stop = listenMonitorUpdates(handleUpdate);
});

onBeforeUnmount(() => {
  // clean up listeners when this component is destroyed
  stop?.();
});
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
  gap: 5px;
  height: calc(100% - 48px);
}
.tile-wrap {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  outline: 1px solid #ddd;
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
  border: 1px solid #ddd;
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