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
              <n-button type="info" ghost :disabled="!isCheckBox"
                >全選択</n-button
              >
              <n-button type="info" ghost :disabled="!isCheckBox"
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
                  :class="{ selected: wall.isSelected(a.id) }"
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
              <div class="user_tb">
                <div class="_company_name">東京工事A班</div>
                <n-table :single-line="false" size="small">
                  <thead>
                    <tr>
                      <th>属性</th>
                      <th>ユーザー</th>
                      <th>GNSS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><i class="user_status leader"></i></td>
                      <td>責任者 太郎</td>
                      <td>
                        <span class="battery_full">
                          <n-icon size="24" :color="themeVars.primaryColor">
                            <BatteryFull />
                          </n-icon>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><i class="user_status worker"></i></td>
                      <td>作業員 次郎</td>
                      <td>
                        <span class="battery_full">
                          <n-icon size="24" :color="themeVars.primaryColor">
                            <BatteryFull />
                          </n-icon>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><i class="user_status watcher"></i></td>
                      <td>見張 太郎</td>
                      <td>
                        <span class="battery_half">
                          <n-icon size="24" :color="themeVars.warningColor">
                            <BatteryHalf />
                          </n-icon>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </n-table>
              </div>
              <div class="user_tb">
                <div class="_company_name">東京工事B班</div>
                <n-table :single-line="false" size="small">
                  <thead>
                    <tr>
                      <th>属性</th>
                      <th>ユーザー</th>
                      <th>GNSS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><i class="user_status leader"></i></td>
                      <td>責任者 太郎</td>
                      <td>
                        <span class="battery_full">
                          <n-icon size="24" :color="themeVars.primaryColor">
                            <BatteryFull />
                          </n-icon>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><i class="user_status worker"></i></td>
                      <td>作業員 次郎</td>
                      <td>
                        <span class="battery_full">
                          <n-icon size="24" :color="themeVars.primaryColor">
                            <BatteryFull />
                          </n-icon>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><i class="user_status worker"></i></td>
                      <td>作業員 三郎</td>
                      <td>
                        <span class="battery_full">
                          <n-icon size="24" :color="themeVars.primaryColor">
                            <BatteryFull />
                          </n-icon>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><i class="user_status worker"></i></td>
                      <td>作業員 四郎</td>
                      <td>
                        <span class="battery_half">
                          <n-icon size="24" :color="themeVars.warningColor">
                            <BatteryHalf />
                          </n-icon>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><i class="user_status worker"></i></td>
                      <td>作業員 五郎</td>
                      <td>
                        <span class="battery_low">
                          <n-icon size="24" :color="themeVars.errorColor">
                            <BatteryLow />
                          </n-icon>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><i class="user_status watcher"></i></td>
                      <td>見張 太郎</td>
                      <td>
                        <span class="battery_half">
                          <n-icon size="24" :color="themeVars.warningColor">
                            <BatteryHalf />
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
import { listAssets, type AssetInfo } from "../services/api";
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
    /* max-height: 5
    overflow-y: auto; */

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
  }
  .leader {
    background-color: v-bind("themeVars.infoColor");
  }
  .worker {
    background-color: v-bind("themeVars.primaryColor");
  }
  .watcher {
    background-color: v-bind("themeVars.warningColor");
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
}

.maplibregl-popup-content {
  color: #000;
}
</style>
