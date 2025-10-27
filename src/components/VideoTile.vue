<template>
  <div class="video-tile">
    <template v-if="videoSrc">
      <video
        :src="videoSrc"
        controls
        autoplay
        muted
        playsinline
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #000;
        "></video>
    </template>
    <template v-else>
      <div class="no-stream">No stream available</div>
    </template>
  </div>
</template>

<script setup lang="ts" name="VideoTile">
import { computed } from "vue";
interface Props {
  source: {
    id: string;
    title: string;
    hls?:
      | string
      | { url480?: string; url720?: string; url1080?: string }
      | null;
    webrtc?: { room: string; token: string } | null;
    replicateId?: string;
  };
}

const props = defineProps<Props>();

const videoSrc = computed(() => {
  const hls = props.source.hls;
  if (!hls) return undefined;
  if (typeof hls === "string") return hls;
  return hls.url720 || hls.url480 || hls.url1080;
});
</script>

<style scoped>
.video-tile {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
}
.no-stream {
  padding: 8px;
  text-align: center;
  color: #ccc;
  font-size: 12px;
}
</style>
