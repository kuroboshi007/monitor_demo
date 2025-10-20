<template>
  <div class="page">
    <div class="map_box">
      <!-- Main map area -->
      <div class="_map_main">
        <!-- 2D map container -->
        <div id="map" class="map"></div>
      </div>
      <!-- Sidebar: selectable construction sites -->
      <div class="_map_sidebar" :width="400">
        <!-- Show current selection count -->
        <h3>Selected {{ selectedCount }}</h3>
        <p>Select up to 9 assets to monitor</p>
        <p>
          Click a name below or a marker on the map to select/deselect assets.
        </p>
        <p>
          When finished, click the button below to open the monitoring wall.
        </p>
        <div class="select_list">
          <ul class="asset-list">
            <li
              v-for="a in assets"
              :key="a.id"
              :class="{ selected: wall.isSelected(a.id) }"
              @click="selectAsset(a)">
              {{ a.name }}
            </li>
          </ul>
        </div>
        <!-- Open the monitor wall in a new window -->
        <div>
          <n-button :disabled="selectedCount === 0" @click="goMonitor"
            >Go to the Monitor</n-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { computed, onMounted, ref, watch, h } from "vue";
import { NButton, NAlert, useThemeVars, useMessage } from "naive-ui";
import { useWallStore } from "../stores/wall";
import { listAssets, type AssetInfo } from "../services/api";
import {
  openOrReuseMonitor,
  postUpdateToMonitor,
  attachCloseChildOnUnload,
} from "../utils/monitorBridge";

const message = useMessage();
// theme vars
const themeVars = useThemeVars();

onMounted(() => {
  console.log("themeVars:", useThemeVars().value);
});

// Store: manage selection and layout information for the monitoring wall
const wall = useWallStore();

// map container
const assets = ref<AssetInfo[]>([]);

// MapLibre style: GSI Pale
const gsiPaleStyle = {
  version: 8,
  sources: {
    pale: {
      type: "raster",
      tiles: ["https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "国土地理院",
    },
  },
  layers: [
    {
      id: "pale",
      type: "raster",
      source: "pale",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

// Keep DOM refs of markers for quick style sync
const markerEls: Record<string, HTMLElement> = {};

// Compute the current selected count directly from the store
const selectedCount = computed(() => wall.selected.length);

// Create a plain clone of the selected items so they can be safely posted via postMessage
const selectedPlain = computed(() =>
  wall.selected.map((a) => ({ id: a.id, name: a.name }))
);

// Payload to send to the monitor wall (includes count and timestamp)
const selectedPayload = computed(() => ({
  items: selectedPlain.value,
  count: selectedPlain.value.length,
  timestamp: Date.now(),
}));

/**
 * Toggle selection for an asset.
 * Works for both sidebar clicks and map marker clicks.
 */
function selectAsset(a: AssetInfo) {
  // Check if already selected and enforce a maximum of 9 selections
  const already = wall.isSelected(a.id);
  if (!already && selectedCount.value >= 9) {
    console.warn("Upper limit reached: you can select up to 9 items.");
    return;
  }
  wall.toggleAsset({ id: a.id, name: a.name });
  // Sync marker styling if a marker exists
  const el = markerEls[a.id];
  if (el) {
    el.classList.toggle("picked", wall.isSelected(a.id));
  }
}

/**
 * Open (or reuse) the monitor window and push the latest selection immediately.
 */
function goMonitor() {
  const url = new URL("/wall", location.origin).toString();
  const child = openOrReuseMonitor(url);
  if (!child) {
    errorMsg(
      "The browser blocked the popup. Please allow pop-ups for this site and try again."
    );
    return;
  }
  try {
    // Send the current selection immediately to the monitor
    postUpdateToMonitor(selectedPayload.value);
  } catch (e) {
    console.error("Failed to post initial payload:", e);
  }
}

function errorMsg(msg: string) {
  message.error(msg);
}
// Init map & markers
onMounted(async () => {
  attachCloseChildOnUnload();
  const map = new maplibregl.Map({
    container: "map",
    style: gsiPaleStyle,
    center: [139.7671, 35.6812],
    zoom: 11,
  });
  assets.value = await listAssets();
  for (const a of assets.value) {
    const el = document.createElement("div");
    el.className = "jr-marker";
    if (wall.isSelected(a.id)) el.classList.add("picked");
    markerEls[a.id] = el;
    new maplibregl.Marker({ element: el })
      .setLngLat([a.lng, a.lat])
      .setPopup(new maplibregl.Popup().setText(a.name))
      .addTo(map);
    el.addEventListener("click", () => {
      selectAsset(a);
    });
  }
});

// Broadcast updates to the monitor whenever selection payload changes
watch(selectedPayload, (payload) => {
  try {
    postUpdateToMonitor(payload);
  } catch (e) {
    console.error("Failed to post update payload:", e);
  }
});

// 保留旧的 goWall 函数供兼容使用（例如在不支持弹窗的环境中直接跳转）
async function goWall() {
  await wall.ensureStreams(getStreamsByAssetId);
  window.location.href = "/wall";
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
  background: var(--n-color);
  /* border-left: 1px solid #ddd; */
  overflow-y: auto;
}

.map {
  position: absolute;
  inset: 0;
}

button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 资产列表样式 */
.asset-list {
  list-style: none;
  padding: 0;
  margin: 8px 0;
  max-height: 300px;
  overflow-y: auto;
}

.asset-list li {
  padding: 6px 8px;
  /* border-bottom: 1px solid #eee; */
  cursor: pointer;
  user-select: none;
}

.asset-list li:hover {
  background: v-bind("themeVars.hoverColor");
}

.asset-list li.selected {
  background-color: rgba(24, 160, 88, 0.1);
  font-weight: bold;
  /* color: var(--n-item-text-color-active-hover); */
  color: v-bind("themeVars.primaryColor");
}
</style>
