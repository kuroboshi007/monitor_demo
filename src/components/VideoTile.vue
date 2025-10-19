<template>
  <!-- 简易视频占位组件：实际项目中请替换为播放视频流的实现 -->
  <div class="video-tile">
    <p>Video stream for {{ source.id }}</p>
  </div>
</template>

<script setup lang="ts">
// 定义组件属性；source 中包含 id、title、hls/webrtc 等信息
interface Props {
  source: {
    id: string;
    title: string;
    hls?: string | { url480?: string; url720?: string; url1080?: string } | null;
    webrtc?: { room: string; token: string } | null;
  };
}
const props = defineProps<Props>();
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