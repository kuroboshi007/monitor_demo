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
    { id: 'a1', name: 'Asset 1', lng: 139.7671, lat: 35.6812 },
    { id: 'a2', name: 'Asset 2', lng: 139.7700, lat: 35.6900 }
  ];
}

// 根据 assetId 返回流信息，这里只是示例
export async function getStreamsByAssetId(id: string): Promise<any> {
  return {
    title: `Stream ${id}`,
    hls: null,
    webrtc: null
  };
}