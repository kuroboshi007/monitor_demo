<template>
  <!-- simplified video tile component -->
  <div class="video-tile">
    <p>Video stream for {{ source.id }}</p>
  </div>
</template>

<script setup lang="ts" name="VideoTile">
// component props definition
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
// const props = defineProps<Props>();
defineProps<Props>();
</script>

<style scoped>
.video-tile {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
  font-size: 14px;
}
</style>
