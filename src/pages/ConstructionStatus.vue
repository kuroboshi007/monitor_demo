<template>
  <div class="page">
    <div class="map_box">
      <div class="_map_main">
        <!-- 2D地図表示 -->
        <div id="map" class="map"></div>
      </div>
      <div class="_map_sidebar" :width="400">
        <h3>Select up to 9 assets to monitor</h3>
        /
        <p>Click markers on the map to select/deselect assets.</p>
        <p>Then click the button below to open the monitoring wall.</p>
      </div>
    </div>
    <div class="toolbar">
      <div class="picked">
        Selected {{ wall.selectedCount }}
        <ul>
          <li v-for="p in wall.selected" :key="p.id">{{ p.name }}</li>
        </ul>
      </div>
      <button :disabled="wall.selectedCount === 0" @click="goWall">
        Go to the Monitor
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useWallStore } from "../stores/wall";
import { listAssets, getStreamsByAssetId } from "../services/api";
import {
  openOrReuseMonitor,
  postUpdateToMonitor,
  attachCloseChildOnUnload,
} from "../utils/monitorBridge";
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NSpace,
} from "naive-ui";

const router = useRouter();
const wall = useWallStore();

// 要发给监控墙的数据（按你的实际字段调整）
const selectedPayload = computed(() => ({
  items: wall.selected, // e.g. [{ id, name, streamUrl, ... }]
  count: wall.selectedCount,
  timestamp: Date.now(),
}));

function goMonitor() {
  // 用绝对 URL，确保同源
  const url = new URL("/wall", location.origin).toString();

  const child = openOrReuseMonitor(url);
  if (!child) {
    // 被拦截就提示允许弹窗
    window.alert("浏览器拦截了弹窗，请允许本站弹出窗口后再试一次。");
    return;
  }
  // 无论首次还是再次，都推送最新数据
  postUpdateToMonitor(selectedPayload.value);
}

onMounted(() => {
  // 主窗关闭则关掉监控窗
  attachCloseChildOnUnload();
});
onMounted(async () => {
  const map = new maplibregl.Map({
    container: "map",
    style: import.meta.env.VITE_MAP_STYLE,
    center: [139.7671, 35.6812],
    zoom: 11,
  });
  const assets = await listAssets();
  for (const a of assets) {
    const el = document.createElement("div");
    el.className = "jr-marker";
    if (wall.isSelected(a.id)) el.classList.add("picked");
    new maplibregl.Marker({ element: el })
      .setLngLat([a.lng, a.lat])
      .setPopup(new maplibregl.Popup().setText(a.name))
      .addTo(map);
    el.addEventListener("click", () => {
      const already = wall.isSelected(a.id);
      if (!already && wall.selectedCount >= 9) {
        console.warn(
          "The upper limit has been reached: up to 9 options can be selected"
        );
        return;
      }
      wall.toggleAsset({ id: a.id, name: a.name });
      el.classList.toggle("picked", wall.isSelected(a.id));
    });
  }
});

async function goWall() {
  await wall.ensureStreams(getStreamsByAssetId);
  router.push("/wall");
}
</script>

<style>
.page {
  position: relative;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.page_container {
  padding: 24px;
}
.map_box {
  flex: 1;
  display: flex;
  height: 100%;
  overflow: hidden;
}
._map_main {
  flex: 1;
  position: relative;
}

._map_sidebar {
  width: 400px;
  padding: 16px;
  box-sizing: border-box;
  background: #fff;
  border-left: 1px solid #ddd;
}

.map {
  position: absolute;
  inset: 0;
}
.toolbar {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 280px;
}
.picked {
  font-size: 12px;
  color: #333;
  margin-bottom: 8px;
  max-height: 180px;
  overflow: auto;
}
.picked ul {
  margin: 6px 0 0 18px;
  padding: 0;
}
button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
