<template>
  <div class="page">
    <div id="map" class="map"></div>
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
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWallStore } from '../stores/wall';
import { listAssets, getStreamsByAssetId } from '../services/api';

const router = useRouter();
const wall = useWallStore();

onMounted(async () => {
  const map = new maplibregl.Map({
    container: 'map',
    style: import.meta.env.VITE_MAP_STYLE,
    center: [139.7671, 35.6812],
    zoom: 11
  });
  const assets = await listAssets();
  for (const a of assets) {
    const el = document.createElement('div');
    el.className = 'jr-marker';
    if (wall.isSelected(a.id)) el.classList.add('picked');
    new maplibregl.Marker({ element: el })
      .setLngLat([a.lng, a.lat])
      .setPopup(new maplibregl.Popup().setText(a.name))
      .addTo(map);
    el.addEventListener('click', () => {
      const already = wall.isSelected(a.id);
      if (!already && wall.selectedCount >= 9) {
        console.warn('The upper limit has been reached: up to 9 options can be selected');
        return;
      }
      wall.toggleAsset({ id: a.id, name: a.name });
      el.classList.toggle('picked', wall.isSelected(a.id));
    });
  }
});

async function goWall() {
  await wall.ensureStreams(getStreamsByAssetId);
  router.push('/wall');
}
</script>

<style scoped>
.page {
  position: relative;
  height: 100vh;
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