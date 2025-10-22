export async function fetchAssetFromIField(assetId: string) {
  // TODO: implement actual iField API call to fetch asset details
  return { assetId, name: "placeholder" };
}

export async function mapIFieldToStreams(assetId: string) {
  // TODO: implement mapping of iField response to { title, hls, webrtc }
  return { title: "placeholder", hls: null, webrtc: null };
}
