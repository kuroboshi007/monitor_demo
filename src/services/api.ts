// Provide demonstration API functions; in real projects, replace with real API calls.

// Type definition for a construction asset (work site).
export interface AssetInfo {
  id: string;
  name: string;
  lng: number;
  lat: number;
}

/**
 * Simulated API that returns a list of selectable assets on the map.
 * In a real implementation this would fetch from a backend.
 */
export async function listAssets(): Promise<AssetInfo[]> {
  // The original repo hard‑codes a set of 12 construction sites in Tokyo.
  // We return them here unchanged.
  return [
    { id: "a1", name: "東京工事A", lng: 139.7671, lat: 35.6812 },
    { id: "a2", name: "東京工事B", lng: 139.77, lat: 35.69 },
    { id: "a3", name: "上野工事A", lng: 139.777254, lat: 35.713768 },
    { id: "a4", name: "上野工事B", lng: 139.777254, lat: 35.713768 },
    { id: "a5", name: "渋谷工事", lng: 139.701636, lat: 35.658034 },
    { id: "a6", name: "新宿工事", lng: 139.700258, lat: 35.690921 },
    { id: "a7", name: "池袋工事", lng: 139.7109, lat: 35.729503 },
    { id: "a8", name: "神田工事", lng: 139.7706, lat: 35.6917 },
    { id: "a9", name: "御茶ノ水工事", lng: 139.76523, lat: 35.69973 },
    { id: "a10", name: "有楽町工事", lng: 139.763328, lat: 35.675069 },
    { id: "a11", name: "浜松町工事", lng: 139.75764, lat: 35.65539 },
    { id: "a12", name: "錦糸町工事", lng: 139.813, lat: 35.6961 },
  ];
}

import streams from "../assets/mock/streams.json";

const assetToCamera: Record<string, string> = {
  a1: "CAM_TOKYO",
  a2: "CAM_UENO",
  a3: "CAM_SHINAGAWA",
  a4: "CAM_SHIBUYA",
  a5: "CAM_SHINJUKU",
  a6: "CAM_AKIHABARA",
  a7: "CAM_IKEBUKURO",
  a8: "CAM_KANDA",
  a9: "CAM_OCHANOMIZU",
  a10: "CAM_YURAKUCHO",
  a11: "CAM_HAMAMATSU",
  a12: "CAM_KINSHICHO",
};

/**
 * Given an asset id, return the corresponding stream information.
 * The returned object includes a title and HLS/RTC details.  If no mapping
 * exists for the given id, a fallback with null streams is provided.
 */
export async function getStreamsByAssetId(id: string): Promise<any> {
  const camKey = assetToCamera[id];
  if (camKey && (streams as any)[camKey]) {
    // Clone the stream information to avoid mutating the imported data.
    const { title, hls, webrtc } = (streams as any)[camKey];
    return {
      title,
      hls,
      webrtc,
    };
  }
  // Fallback: return a placeholder with the id as title and no streams.
  return {
    title: `Stream ${id}`,
    hls: null,
    webrtc: null,
  };
}
