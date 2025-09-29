<template>
  <div class="tile">
    <video ref="vid" autoplay muted controls playsinline></video>
    <div class="badge" v-if="mode === 'hls'">HLS</div>
    <div class="badge" v-else>WebRTC</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import Hls from "hls.js";
// import { playWebRTC } from '../services/rtc' // 未来接入

const props = defineProps<{
  source: {
    id: string;
    title: string;
    hls?: string;
    webrtc?: { room: string; token: string };
  };
}>();
const vid = ref<HTMLVideoElement>();
let hls: Hls | null = null;
const mode = ref<"webrtc" | "hls">(props.source.webrtc ? "webrtc" : "hls");

onMounted(async () => {
  if (mode.value === "webrtc") {
    // const ok = await playWebRTC(props.source.webrtc!, vid.value!)
    // if (!ok) return playHls()
    // 先不启用 WebRTC，直接回退看效果：
    playHls();
  } else {
    playHls();
  }
});

function playHls() {
  if (!props.source.hls) {
    console.warn("No HLS URL for", props.source.id);
    return;
  }
  if (Hls.isSupported()) {
    hls?.destroy();
    hls = new Hls({ lowLatencyMode: true });
    hls.on(Hls.Events.MEDIA_ATTACHED, () =>
      console.log("HLS media attached", props.source.id)
    );
    hls.on(Hls.Events.MANIFEST_PARSED, () =>
      console.log("HLS manifest parsed", props.source.id)
    );
    hls.on(Hls.Events.ERROR, (e, data) => console.error("HLS error", data));
    hls.loadSource(props.source.hls);
    hls.attachMedia(vid.value!);
    // 某些环境下额外触发一次 play() 可避免卡住
    setTimeout(
      () =>
        vid.value?.play().catch((err) => console.warn("play() blocked", err)),
      0
    );
  } else {
    vid.value!.src = props.source.hls;
  }
}

onBeforeUnmount(() => {
  hls?.destroy();
});
</script>

<style scoped>
.tile {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.badge {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  border-radius: 6px;
}
</style>
