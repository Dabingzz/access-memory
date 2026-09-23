const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

// Keep this interface stable when the mock is replaced with a real VLM endpoint.
export async function analyzeRoadMedia(file, profileId, context, onProgress = () => {}) {
  const stages = [
    { percent: 18, label: '提取关键帧', delay: 360 },
    { percent: 46, label: '定位无障碍通行区域', delay: 430 },
    { percent: 74, label: '识别围挡与道路障碍', delay: 460 },
    { percent: 100, label: '融合近期道路记录', delay: 390 }
  ];
  for (const stage of stages) {
    await wait(stage.delay);
    onProgress(stage);
  }
  return {
    edgeId: context.edgeId,
    status: 'BLOCKED',
    confidence: 0.96,
    reason: context.reason,
    riskLevel: 'HIGH',
    evidence: file?.name || 'GX_0922_1724.mp4',
    source: 'GO Ultra 出行影像',
    profileId,
    observedAt: '今天 10:26',
    place: context.place
  };
}
