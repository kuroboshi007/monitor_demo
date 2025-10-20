// 此处提供演示用的 API 函数，实际项目中请替换为真实接口调用

export interface AssetInfo {
  id: string;
  name: string;
  lng: number;
  lat: number;
}

// 模拟返回地图上的可选择资产列表
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

// 根据 assetId 返回流信息，这里只是示例
export async function getStreamsByAssetId(id: string): Promise<any> {
  return {
    title: `Stream ${id}`,
    hls: null,
    webrtc: null,
  };
}
