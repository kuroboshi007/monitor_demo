<template>
  <div class="video-tile">
    <template v-if="videoSrc">
      <!-- Use a native HTML5 video element to play the HLS stream.  Most modern
           browsers support M3U8 directly.  Muted autoplay is used to
           prevent the browser from blocking playback. -->
      <video
        :src="videoSrc"
        controls
        autoplay
        muted
        playsinline
        style="width: 100%; height: 100%; object-fit: cover; background: #000"
      ></video>
    </template>
    <template v-else>
      <div class="no-stream">No stream available</div>
    </template>
  </div>
</template>

<script setup lang="ts" name="VideoTile">
import { computed } from "vue";
// Component props definition.  A tile carries an id, title and optional
// stream information.  When hls is a string it represents a single URL;
// when it is an object it contains multiple resolutions.
interface Props {
  source: {
    id: string;
    title: string;
    hls?:
      | string
      | { url480?: string; url720?: string; url1080?: string }
      | null;
    webrtc?: { room: string; token: string } | null;
  };
}

const props = defineProps<Props>();

// Compute a single video URL based on the provided HLS field.  Prefer
// 720p if available, otherwise fall back to 480p or 1080p.  If hls is
// already a string, return it directly.  If no URL is available,
// return undefined so that the component shows a placeholder.
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