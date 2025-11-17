// Provide demonstration API functions; in real projects, replace with real API calls.

// Type definition for a construction asset (work site).
export interface AssetInfo {
  id: string;
  name: string;
  lng: number;
  lat: number;
}

// Type definition for a user associated with a work site.
export interface UserInfo {
  id: string;
  name: string;
  // Role within the construction site. leader = 責任者, worker = 作業員, watcher = 見張
  role: "leader" | "worker" | "watcher";
  // GNSS battery status. battery_full = 3, battery_half = 2, battery_low = 1
  gnss: "battery_full" | "battery_half" | "battery_low";
  lat: number;
  lng: number;
}

// Return the list of construction assets (work sites).
export async function listAssets(): Promise<AssetInfo[]> {
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

// Mapping from asset IDs to camera keys in the streams data.
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

// Return stream information for the given asset id.
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

// mock user data associated with each asset.
const assetUsers: Record<string, UserInfo[]> = {
  a1: [
    {
      id: "u1_a1",
      name: "責任者太郎",
      role: "leader",
      gnss: "battery_full",
      lat: 35.6812 + 0.0004,
      lng: 139.7671 + 0.0004,
    },
    {
      id: "u2_a1",
      name: "作業員次郎",
      role: "worker",
      gnss: "battery_half",
      lat: 35.6812 - 0.0008,
      lng: 139.7671 - 0.0008,
    },
    {
      id: "u3_a1",
      name: "見張三郎",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.6812 + 0.0007,
      lng: 139.7671 - 0.0007,
    },
    {
      id: "u4_a1",
      name: "作業員四郎",
      role: "worker",
      gnss: "battery_full",
      lat: 35.6812 + 0.001,
      lng: 139.7671 - 0.001,
    },
    {
      id: "u5_a1",
      name: "作業員五郎",
      role: "worker",
      gnss: "battery_full",
      lat: 35.6812 + 0.0011,
      lng: 139.7671 - 0.0011,
    },
  ],
  a2: [
    {
      id: "u1_a2",
      name: "山田花子",
      role: "leader",
      gnss: "battery_full",
      lat: 35.69 + 0.0008,
      lng: 139.77 + 0.0008,
    },
    {
      id: "u2_a2",
      name: "山田太郎",
      role: "worker",
      gnss: "battery_half",
      lat: 35.69 - 0.0008,
      lng: 139.77 - 0.0008,
    },
    {
      id: "u3_a2",
      name: "山田次郎",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.69 + 0.0009,
      lng: 139.77 - 0.0009,
    },
  ],
  a3: [
    {
      id: "u1_a3",
      name: "健",
      role: "leader",
      gnss: "battery_full",
      lat: 35.713768 + 0.0008,
      lng: 139.777254 + 0.0008,
    },
    {
      id: "u2_a3",
      name: "良",
      role: "worker",
      gnss: "battery_half",
      lat: 35.713768 - 0.0008,
      lng: 139.777254 - 0.0008,
    },
    {
      id: "u3_a3",
      name: "美咲",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.713768 + 0.0009,
      lng: 139.777254 - 0.0009,
    },
  ],
  a4: [
    {
      id: "u1_a4",
      name: "哲也",
      role: "leader",
      gnss: "battery_full",
      lat: 35.713768 + 0.0008,
      lng: 139.777254 + 0.0008,
    },
    {
      id: "u2_a4",
      name: "ゆうこ",
      role: "worker",
      gnss: "battery_half",
      lat: 35.713768 - 0.0008,
      lng: 139.777254 - 0.0008,
    },
    {
      id: "u3_a4",
      name: "健一",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.713768 + 0.0009,
      lng: 139.777254 - 0.0009,
    },
  ],
  a5: [
    {
      id: "u1_a5",
      name: "美咲",
      role: "leader",
      gnss: "battery_full",
      lat: 35.658034 + 0.0008,
      lng: 139.701636 + 0.0008,
    },
    {
      id: "u2_a5",
      name: "太郎",
      role: "worker",
      gnss: "battery_half",
      lat: 35.658034 - 0.0008,
      lng: 139.701636 - 0.0008,
    },
    {
      id: "u3_a5",
      name: "次郎",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.658034 + 0.0009,
      lng: 139.701636 - 0.0009,
    },
  ],
  a6: [
    {
      id: "u1_a6",
      name: "健",
      role: "leader",
      gnss: "battery_full",
      lat: 35.690921 + 0.0008,
      lng: 139.700258 + 0.0008,
    },
    {
      id: "u2_a6",
      name: "良",
      role: "worker",
      gnss: "battery_half",
      lat: 35.690921 - 0.0008,
      lng: 139.700258 - 0.0008,
    },
    {
      id: "u3_a6",
      name: "花子",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.690921 + 0.0009,
      lng: 139.700258 - 0.0009,
    },
  ],
  a7: [
    {
      id: "u1_a7",
      name: "健一",
      role: "leader",
      gnss: "battery_full",
      lat: 35.729503 + 0.0008,
      lng: 139.7109 + 0.0008,
    },
    {
      id: "u2_a7",
      name: "ゆうこ",
      role: "worker",
      gnss: "battery_half",
      lat: 35.729503 - 0.0008,
      lng: 139.7109 - 0.0008,
    },
    {
      id: "u3_a7",
      name: "太郎",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.729503 + 0.0009,
      lng: 139.7109 - 0.0009,
    },
  ],
  a8: [
    {
      id: "u1_a8",
      name: "良",
      role: "leader",
      gnss: "battery_full",
      lat: 35.6917 + 0.0008,
      lng: 139.7706 + 0.0008,
    },
    {
      id: "u2_a8",
      name: "三郎",
      role: "worker",
      gnss: "battery_half",
      lat: 35.6917 - 0.0008,
      lng: 139.7706 - 0.0008,
    },
    {
      id: "u3_a8",
      name: "ゆうこ",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.6917 + 0.0009,
      lng: 139.7706 - 0.0009,
    },
  ],
  a9: [
    {
      id: "u1_a9",
      name: "健",
      role: "leader",
      gnss: "battery_full",
      lat: 35.69973 + 0.0008,
      lng: 139.76523 + 0.0008,
    },
    {
      id: "u2_a9",
      name: "花子",
      role: "worker",
      gnss: "battery_half",
      lat: 35.69973 - 0.0008,
      lng: 139.76523 - 0.0008,
    },
    {
      id: "u3_a9",
      name: "良",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.69973 + 0.0009,
      lng: 139.76523 - 0.0009,
    },
  ],
  a10: [
    {
      id: "u1_a10",
      name: "健一",
      role: "leader",
      gnss: "battery_full",
      lat: 35.675069 + 0.0008,
      lng: 139.763328 + 0.0008,
    },
    {
      id: "u2_a10",
      name: "次郎",
      role: "worker",
      gnss: "battery_half",
      lat: 35.675069 - 0.0008,
      lng: 139.763328 - 0.0008,
    },
    {
      id: "u3_a10",
      name: "花子",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.675069 + 0.0009,
      lng: 139.763328 - 0.0009,
    },
  ],
  a11: [
    {
      id: "u1_a11",
      name: "ゆうこ",
      role: "leader",
      gnss: "battery_full",
      lat: 35.65539 + 0.0008,
      lng: 139.75764 + 0.0008,
    },
    {
      id: "u2_a11",
      name: "三郎",
      role: "worker",
      gnss: "battery_half",
      lat: 35.65539 - 0.0008,
      lng: 139.75764 - 0.0008,
    },
    {
      id: "u3_a11",
      name: "健",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.65539 + 0.0009,
      lng: 139.75764 - 0.0009,
    },
  ],
  a12: [
    {
      id: "u1_a12",
      name: "良",
      role: "leader",
      gnss: "battery_full",
      lat: 35.6961 + 0.0008,
      lng: 139.813 + 0.0008,
    },
    {
      id: "u2_a12",
      name: "健一",
      role: "worker",
      gnss: "battery_half",
      lat: 35.6961 - 0.0008,
      lng: 139.813 - 0.0008,
    },
    {
      id: "u3_a12",
      name: "ゆうこ",
      role: "watcher",
      gnss: "battery_low",
      lat: 35.6961 + 0.0009,
      lng: 139.813 - 0.0009,
    },
  ],
};

export async function getUsersByAssetId(assetId: string): Promise<UserInfo[]> {
  return assetUsers[assetId] ?? [];
}
