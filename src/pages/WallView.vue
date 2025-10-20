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
    <!-- 渲染选中的视频格子 -->
    <div
      v-for="t in wall.visibleTiles"
      :key="t.id"
      class="tile-wrap"
      @dblclick="wall.focus(t.id)">
      <div class="title">{{ t.title }}</div>
      <VideoTile :source="t" />
    </div>
    <!-- 用占位块填满布局 -->
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

// 使用 Pinia 存储管理选中项和视频流
const wall = useWallStore();

// compute the currently selected item count based on the store
const selectedCount = computed(() => wall.selected.length);

// 处理来自主控窗口的更新消息：根据传入的数据更新已选资产并加载流信息
function handleUpdate(data: any) {
  if (!data) return;
  const items = Array.isArray(data.items) ? data.items : [];
  // 清空当前选项并根据接收到的列表重新选择
  wall.clearSelected();
  for (const it of items) {
    wall.toggleAsset({ id: it.id, name: it.name });
  }
  // 拉取流信息以填充视频格子
  wall.ensureStreams(getStreamsByAssetId);
}

let stop: null | (() => void) = null;

onMounted(() => {
  stop = listenMonitorUpdates(handleUpdate);
});

onBeforeUnmount(() => {
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
