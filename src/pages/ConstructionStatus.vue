<template>
  <div class="page">
    <div class="map_box">
      <!-- Main map area -->
      <div class="_map_main">
        <!-- 2D map container -->
        <div id="map" class="map"></div>
      </div>
      <!-- Sidebar: selectable construction sites and user lists -->
      <div class="_map_sidebar" :width="400">
        <!-- Show current selection count and controls -->
        <div class="point_list">
          <h3>工事拠点({{ assets.length }})</h3>
          <n-input-group class="_search">
            <n-input :style="{ width: '75%' }" placeholder="工事名で検索" />
            <n-button type="primary">
              <template #icon>
                <NIcon>
                  <Search />
                </NIcon>
              </template>
            </n-button>
          </n-input-group>
          <div class="is-checkbox">
            <div class="_switch">
              複数現場を選択: <n-switch v-model:value="isCheckBox" />
            </div>
            <div class="_button">
              <n-button
                type="info"
                ghost
                :disabled="!isCheckBox"
                @click="selectAllAssets"
                >全選択</n-button
              >
              <n-button
                type="info"
                ghost
                :disabled="!isCheckBox"
                @click="deselectAllAssets"
                >全解除</n-button
              >
            </div>
          </div>
          <div class="select_list">
            <ul class="asset_list">
              <n-scrollbar style="max-height: 400px" trigger="none">
                <li
                  v-for="a in assets"
                  :key="a.id"
                  :class="{
                    selected: wall.isSelected(a.id),
                    last_selected:
                      wall.isSelected(a.id) && lastSelectedId === a.id,
                  }"
                  @click="selectAsset(a)">
                  {{ a.name }}
                </li>
              </n-scrollbar>
            </ul>
          </div>
          <!-- Open the monitor wall in a new window -->
          <div class="go_monitor">
            <n-button :disabled="selectedCount === 0" @click="goMonitor"
              >映像を表示</n-button
            >
          </div>
        </div>
        <div class="user_list">
          <h3>ユーザー</h3>
          <n-input-group class="_search">
            <n-input :style="{ width: '75%' }" placeholder="ユーザー名で検索" />
            <n-button type="primary">
              <template #icon>
                <NIcon>
                  <Search />
                </NIcon>
              </template>
            </n-button>
          </n-input-group>
          <div class="user_tb_list">
            <n-scrollbar style="max-height: 500px" trigger="none">
              <!-- Dynamically render a user table for each selected asset -->
              <div
                v-for="asset in selectedPlain"
                :key="asset.id"
                class="user_tb">
                <!-- Display the asset (work site) name as the section header -->
                <div class="_company_name">{{ asset.name }}</div>
                <n-table :single-line="false" size="small">
                  <thead>
                    <tr>
                      <th>属性</th>
                      <th>ユーザー</th>
                      <th>GNSS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- For each user associated with this asset, render a row -->
                    <tr
                      v-for="user in assetUsers[asset.id] || []"
                      :key="user.id">
                      <td>
                        <i class="user_status" :class="user.role"></i>
                      </td>
                      <td>{{ user.name }}</td>
                      <td>
                        <!-- Show the appropriate battery icon and colour based on GNSS status -->
                        <span
                          v-if="user.gnss === 'battery_full'"
                          class="battery_full">
                          <n-icon size="24" :color="themeVars.primaryColor">
                            <BatteryFull />
                          </n-icon>
                        </span>
                        <span
                          v-else-if="user.gnss === 'battery_half'"
                          class="battery_half">
                          <n-icon size="24" :color="themeVars.warningColor">
                            <BatteryHalf />
                          </n-icon>
                        </span>
                        <span v-else class="battery_low">
                          <n-icon size="24" :color="themeVars.errorColor">
                            <BatteryLow />
                          </n-icon>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </n-table>
              </div>
            </n-scrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { computed, onMounted, ref, watch } from "vue";
import {
  NButton,
  NScrollbar,
  NTable,
  NIcon,
  NInput,
  NInputGroup,
  NSwitch,
  useMessage,
  useThemeVars,
} from "naive-ui";
import { useWallStore } from "../stores/wall";
import {
  listAssets,
  getUsersByAssetId,
  type AssetInfo,
  type UserInfo,
} from "../services/api";
import {
  openOrReuseMonitor,
  postUpdateToMonitor,
  attachCloseChildOnUnload,
} from "../utils/monitorBridge";
import { BatteryHalf, BatteryLow, BatteryFull, Search } from "@vicons/carbon";

const message = useMessage();
const themeVars = useThemeVars();

// state: map and assets
const wall = useWallStore();
const assets = ref<AssetInfo[]>([]);
const isCheckBox = ref(false);
const assetUsers = ref<Record<string, UserInfo[]>>({});
const roleNames: Record<UserInfo["role"], string> = {
  leader: "責任者",
  worker: "作業員",
  watcher: "見張",
};

// track the ID of the last selected asset for highlighting and map centering
const lastSelectedId = ref<string | null>(null);
let map: any;
const userMarkers: Record<string, any[]> = {};

// Zoom threshold to switch between showing all users vs. only leaders
const zoomThreshold = 13;

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
  lastSelectedId: lastSelectedId.value,
  timestamp: Date.now(),
}));

// Select or deselect a single asset when clicked in the list
async function selectAsset(a: AssetInfo) {
  const wasSelected = wall.isSelected(a.id);
  if (!isCheckBox.value) {
    const current = [...wall.selected];
    for (const s of current) {
      if (s.id !== a.id) {
        wall.toggleAsset({ id: s.id, name: s.name });
        // remove cached users for deselected assets
        delete assetUsers.value[s.id];
      }
    }
  }
  // Toggle the clicked asset
  wall.toggleAsset({ id: a.id, name: a.name });
  if (!wasSelected) {
    // Asset was newly selected: load its users and set as last selected
    try {
      assetUsers.value[a.id] = await getUsersByAssetId(a.id);
    } catch (e) {
      console.error(`Failed to load users for asset ${a.id}:`, e);
      assetUsers.value[a.id] = [];
    }
    lastSelectedId.value = a.id;
  } else {
    // Asset was deselected: remove user list
    delete assetUsers.value[a.id];
    // If there are still selected assets, update lastSelectedId to the last one
    if (wall.selected.length > 0) {
      const last = wall.selected[wall.selected.length - 1];
      lastSelectedId.value = last.id;
    } else {
      lastSelectedId.value = null;
    }
  }
  // After updating selection, recenter map on the last selected asset and update user markers
  if (map) {
    if (lastSelectedId.value) {
      const target = assets.value.find((x) => x.id === lastSelectedId.value);
      if (target) {
        // Center the map around the newly selected asset without changing the zoom level
        map.easeTo({ center: [target.lng, target.lat] });
      }
    }
    updateUserMarkers();
  }
}

// Select all assets in the list.  This is used by the "select all" button
async function selectAllAssets() {
  // Iterate over all assets
  for (const a of assets.value) {
    if (!wall.isSelected(a.id)) {
      wall.toggleAsset({ id: a.id, name: a.name });
    }
    // Load or refresh users for each asset
    try {
      assetUsers.value[a.id] = await getUsersByAssetId(a.id);
    } catch (e) {
      console.error(`Failed to load users for asset ${a.id}:`, e);
      assetUsers.value[a.id] = [];
    }
  }
  // Set the last selected to the final asset in the list
  if (assets.value.length > 0) {
    lastSelectedId.value = assets.value[assets.value.length - 1].id;
  } else {
    lastSelectedId.value = null;
  }

  // Recenter the map on the last selected asset and update user markers
  if (map) {
    if (lastSelectedId.value) {
      const target = assets.value.find((x) => x.id === lastSelectedId.value);
      if (target) {
        map.easeTo({ center: [target.lng, target.lat] });
      }
    }
    updateUserMarkers();
  }
  message.info("複数選択を完了しました");
}

// Deselect all selected assets.  This is used by the "deselect all" button
function deselectAllAssets() {
  const current = [...wall.selected];
  for (const s of current) {
    wall.toggleAsset({ id: s.id, name: s.name });
    delete assetUsers.value[s.id];
  }
  lastSelectedId.value = null;
  // After clearing all selections, remove any existing user markers
  if (map) {
    updateUserMarkers();
  }
  message.info("複数選択を解除しました");
}

// Update user markers on the map based on the current selection and zoom level.
function updateUserMarkers() {
  if (!map) return;
  // Remove all existing user markers
  for (const key in userMarkers) {
    for (const m of userMarkers[key]) {
      m.remove();
    }
    delete userMarkers[key];
  }
  // Only display markers for the last selected asset
  if (!lastSelectedId.value) return;
  const assetId = lastSelectedId.value;
  const users = assetUsers.value[assetId] || [];
  const asset = assets.value.find((a) => a.id === assetId);
  if (!asset) return;
  userMarkers[assetId] = [];
  // Determine whether to display all users or only leaders based on zoom
  const currentZoom = map.getZoom();
  const showAll = currentZoom >= zoomThreshold;
  let visibleUsers: UserInfo[] = users;
  if (!showAll) {
    visibleUsers = users.filter((u) => u.role === "leader");
  }
  for (const user of visibleUsers) {
    const el = document.createElement("div");
    el.classList.add("user-marker");
    el.classList.add(user.role);
    // Determine popup content: show user name on hover when zoomed in, otherwise show asset name
    const popupText = showAll ? user.name : asset.name;
    const popup = new maplibregl.Popup({ offset: 15 }).setText(popupText);
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([user.lng, user.lat])
      .setPopup(popup)
      .addTo(map);
    userMarkers[assetId].push(marker);
  }
}

// Open or reuse the monitor window and send the current selection payload.
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

// initialize the map
onMounted(async () => {
  attachCloseChildOnUnload();
  map = new maplibregl.Map({
    container: "map",
    style: gsiPaleStyle,
    center: [139.7671, 35.6812],
    zoom: 13,
  });
  // Load asset list
  assets.value = await listAssets();
  map.on("load", () => {
    updateUserMarkers();
  });
  map.on("zoomend", () => {
    updateUserMarkers();
  });
});

// whenever the selection payload changes, send an update to the monitor window
watch(selectedPayload, (payload) => {
  try {
    postUpdateToMonitor(payload);
  } catch (e) {
    console.error("Failed to post update payload:", e);
  }
});

// when multi-select mode is turned off, clear all selections
watch(isCheckBox, (val, oldVal) => {
  console.log("isCheckBox changed:", oldVal, "=>", val);
  if (!val && oldVal) {
    deselectAllAssets();
    console.log("deselectAllAssets called");
    lastSelectedId.value = null;
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
  width: 500px;
  padding: 16px;
  display: flex;
  flex-direction: row;
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

.point_list,
.user_list {
  padding: 0 10px;
  box-sizing: border-box;

  ._search {
    margin: 0 0 15px;
  }
}

.point_list {
  width: 200px;

  .is-checkbox {
    margin: 15px 0;
  }

  ._switch {
    margin: 10px 0;
    text-align: center;
  }

  ._button {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, 1fr);
    box-sizing: border-box;
    padding: 5px 8px;
  }

  .go_monitor {
    margin-top: 15px;
    text-align: center;
  }
}

.user_list {
  flex: 1;
  .n-table {
    th {
      text-align: center;
    }

    td {
      &:has(.user_status, .n-icon) {
        text-align: center;
      }
    }
  }

  .user_tb_list {
    .user_tb {
      margin: 12px 0;
    }

    ._company_name {
      font-size: 16px;
      margin: 5px 0;
    }
  }

  .user_status {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    border: 2px solid #fff;
  }
}
/* asset list styles */
.asset_list {
  list-style: none;
  padding: 0;
  margin: 8px 0;

  li {
    padding: 6px 8px;
    cursor: pointer;
    user-select: none;
  }

  li:hover {
    /* Use theme var to highlight on hover */
    background: v-bind("themeVars.hoverColor");
  }

  li.selected {
    background-color: rgba(24, 160, 88, 0.1);
    font-weight: bold;
    color: v-bind("themeVars.primaryColor");
  }

  li.selected.last_selected {
    background-color: rgba(255, 193, 7, 0.1);
    font-weight: bold;
    color: v-bind("themeVars.warningColor");
  }
}

/* Marker element for users on the map */
.user-marker {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #fff;
}

/* Global role colours for user markers and status indicators */
.leader {
  background-color: v-bind("themeVars.infoColor");
}
.worker {
  background-color: v-bind("themeVars.primaryColor");
}
.watcher {
  background-color: v-bind("themeVars.warningColor");
}

.maplibregl-popup-content {
  color: #000;
}
</style>
