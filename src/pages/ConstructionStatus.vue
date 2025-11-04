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
            <n-scrollbar style="max-height: 300px" trigger="none">
              <li
                v-for="a in assets"
                :key="a.id"
                :class="{ selected: wall.isSelected(a.id) }"
                @click="selectAsset(a)">
                {{ a.name }}
              </li>
            </n-scrollbar>
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
import { computed, onMounted, ref, watch } from "vue";
import { NButton, NScrollbar, useMessage, useThemeVars } from "naive-ui";
import { useWallStore } from "../stores/wall";
import { listAssets, type AssetInfo } from "../services/api";
import {
  openOrReuseMonitor,
  postUpdateToMonitor,
  attachCloseChildOnUnload,
} from "../utils/monitorBridge";

const message = useMessage();
const themeVars = useThemeVars();

// state: map and assets
const wall = useWallStore();
const assets = ref<AssetInfo[]>([]);

// MapLibre style: GSI Pale map style
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

// store references to markers so we can toggle picked state
const markerEls: Record<string, HTMLElement> = {};

// computed: number of selected assets
const selectedCount = computed(() => wall.selected.length);

// computed: plain clone of selected items (to avoid reactive proxies)
const selectedPlain = computed(() =>
  wall.selected.map((a) => ({ id: a.id, name: a.name }))
);

// compute the payload to send to the monitor
const selectedPayload = computed(() => ({
  items: selectedPlain.value,
  count: selectedPlain.value.length,
  timestamp: Date.now(),
}));

/**
 * Toggle selection for an asset. Works for both sidebar and marker clicks.
 */
function selectAsset(a: AssetInfo) {
  const already = wall.isSelected(a.id);
  if (!already && selectedCount.value >= 9) {
    console.warn("Upper limit reached: you can select up to 9 items.");
    return;
  }
  wall.toggleAsset({ id: a.id, name: a.name });
  const el = markerEls[a.id];
  if (el) {
    el.classList.toggle("picked", wall.isSelected(a.id));
  }
}

/**
 * Open the monitor wall or reuse an existing one, then immediately send current selection.
 */
function goMonitor() {
  const url = new URL("/wall", location.origin).toString();
  const child = openOrReuseMonitor(url);
  if (!child) {
    message.error(
      "The browser blocked the popup. Please allow pop-ups for this site and try again."
    );
    return;
  }
  try {
    postUpdateToMonitor(selectedPayload.value);
  } catch (e) {
    console.error("Failed to post initial payload:", e);
  }
}

// initialize the map and markers
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

// whenever the selection payload changes, send an update to the monitor window
watch(selectedPayload, (payload) => {
  try {
    postUpdateToMonitor(payload);
  } catch (e) {
    console.error("Failed to post update payload:", e);
  }
});
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

/* asset list styles */
.asset-list {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.asset-list li {
  padding: 6px 8px;
  cursor: pointer;
  user-select: none;
}

.asset-list li:hover {
  /* Use theme var to highlight on hover */
  background: v-bind("themeVars.hoverColor");
}

.asset-list li.selected {
  background-color: rgba(24, 160, 88, 0.1);
  font-weight: bold;
  color: v-bind("themeVars.primaryColor");
}
</style>
