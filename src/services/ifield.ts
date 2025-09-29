export async function fetchAssetFromIField(assetId: string) {
  // TODO: 调用 iField 的资产 API，拿到摄像头/监控资源的元数据
  return { assetId, name: "placeholder" };
}

export async function mapIFieldToStreams(assetId: string) {
  // TODO: 把 iField 返回的监控信息映射成 { title, hls, webrtc }
  return { title: "placeholder", hls: null, webrtc: null };
}
