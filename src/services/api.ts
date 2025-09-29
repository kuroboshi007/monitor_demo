import assets from "../../mock/assets.json";
import streams from "../../mock/streams.json";

export async function listAssets() {
  return assets as { id: string; name: string; lat: number; lng: number }[];
}

export async function getStreamsByAssetId(assetId: string) {
  const s = (streams as any)[assetId];
  // 结构示例：{ title:'东京站-东口', hls: { url480:'...', url720:'...', url1080:'...' }, webrtc: null }
  return s || { title: assetId, hls: null, webrtc: null };
}
