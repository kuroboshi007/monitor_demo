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
        <h3>Selected {{ selectedCount }}</h3>
        <p>Select up to 9 assets to monitor</p>
        <p>
          Click a name below or a marker on the map to select/deselect assets.
        </p>
        <p>
          When finished, click the button below to open the monitoring wall.
        </p>

        <ul class="asset-list">
          <li
            v-for="a in assets"
            :key="a.id"
            :class="{ selected: wall.isSelected(a.id) }"
            @click="selectAsset(a)">
            {{ a.name }}
          </li>
        </ul>

        <!-- Open the monitor wall in a new window -->
        <button :disabled="selectedCount === 0" @click="goMonitor">
          Go to the Monitor
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { computed, onMounted, ref, watch } from "vue";
import { useWallStore } from "../stores/wall";
import { listAssets, type AssetInfo } from "../services/api";
import {
  openOrReuseMonitor,
  postUpdateToMonitor,
  attachCloseChildOnUnload,
} from "../utils/monitorBridge";

// Store for wall layout and selection
const wall = useWallStore();

// Sidebar list data
const assets = ref<AssetInfo[]>([]);

// MapLibre style: GSI Pale (淡色地図)
const gsiPaleStyle = {
  version: 8,
  sources: {
    pale: {
      type: "raster",
      tiles: ["https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "GSI Japan",
    },
  },
  layers: [
    { id: "pale", type: "raster", source: "pale", minzoom: 0, maxzoom: 20 },
  ],
};

// Keep DOM refs of markers for quick style sync
const markerEls: Record<string, HTMLElement> = {};

// Use wall.selected directly to ensure reactivity is correct and instant
const selectedCount = computed(() => wall.selected.length);

// Build a plain (cloneable) payload for the monitor wall
const selectedPlain = computed(() =>
  wall.selected.map((a) => ({ id: a.id, name: a.name }))
);

const selectedPayload = computed(() => ({
  items: selectedPlain.value, // plain JSON array
  count: selectedPlain.value.length, // avoid reading reactive getters
  timestamp: Date.now(),
}));

/**
 * Toggle selection for an asset.
 * Works for both sidebar clicks and map marker clicks.
 */
function selectAsset(a: AssetInfo) {
  const already = wall.isSelected(a.id);
  if (!already && selectedCount.value >= 9) {
    console.warn("Upper limit reached: you can select up to 9 items.");
    return;
  }
  wall.toggleAsset({ id: a.id, name: a.name });

  // Sync marker style if exists
  const el = markerEls[a.id];
  if (el) el.classList.toggle("picked", wall.isSelected(a.id));
}

/**
 * Open (or reuse) the monitor window and push the latest selection immediately.
 */
function goMonitor() {
  const url = new URL("/wall", location.origin).toString();
  const child = openOrReuseMonitor(url);
  if (!child) {
    window.alert("Popup blocked. Please allow popups for this site and retry.");
    return;
  }
  try {
    postUpdateToMonitor(selectedPayload.value);
  } catch (e) {
    console.error("Failed to post initial payload:", e);
  }
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

    el.addEventListener("click", () => selectAsset(a));
  }
});

// Broadcast updates to the monitor whenever selection payload changes
watch(
  selectedPayload,
  (payload) => {
    try {
      // Payload is plain JSON now, BroadcastChannel can clone it
      postUpdateToMonitor(payload);
    } catch (e) {
      console.error("Failed to post update payload:", e);
    }
  }
  // No { deep: true } needed since selectedPayload is a computed snapshot
);
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
  background: #fff;
  border-left: 1px solid #ddd;
  overflow-y: auto;
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
  z-index: 10;
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

/* 资产列表样式 */
.asset-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  max-height: 300px;
  overflow-y: auto;
}

.asset-list li {
  padding: 6px 8px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  user-select: none;
}

.asset-list li:hover {
  background: #f9f9f9;
}

.asset-list li.selected {
  background: #e6f7ff;
  font-weight: bold;
}
</style>
