export const ROAD_STATUS = Object.freeze({
  OPEN: 'OPEN', CAUTION: 'CAUTION', BLOCKED: 'BLOCKED', UNKNOWN: 'UNKNOWN'
});

export const scenes = [
  { id: 'entrance', label: '园区入口与景观步道', file: '/1现代建筑园区入口与景观步道.splat' },
  { id: 'corridor', label: '新中式酒店走廊', file: '/2新中式酒店走廊(1).splat' },
  { id: 'courtyard', label: '酒店内庭与连接空间', file: '/3.splat' },
  { id: 'lakeside', label: '湖畔度假区入口与园林', file: '/4湖畔度假区入口与园林.splat' }
];

export const profiles = {
  wheelchair: { label: '轮椅', speed: 70, blocks: ['steps'], cautionFactor: 1.35, steepFactor: 1.8 },
  lowVision: { label: '低视力', speed: 76, blocks: [], cautionFactor: 1.25, complexityFactor: 1.2 },
  blind: { label: '全盲', speed: 62, blocks: [], cautionFactor: 1.45, complexityFactor: 1.45 }
};

export const nodes = {
  entrance: { id: 'entrance', label: '园区无障碍入口', short: '入口', x: -0.43, z: 0.26, type: 'entrance', selectable: true },
  a: { id: 'a', label: '景观路口 A', short: '道路 A', x: -0.22, z: 0.11, type: 'junction' },
  b: { id: 'b', label: '西侧通道 B', short: '道路 B', x: 0.02, z: 0.01, type: 'road' },
  c: { id: 'c', label: '湖边路口 C', short: '道路 C', x: -0.02, z: -0.20, type: 'junction' },
  d: { id: 'd', label: '会场东路 D', short: '道路 D', x: 0.20, z: -0.31, type: 'junction' },
  venue: { id: 'venue', label: '主会场无障碍入口', short: '主会场', x: 0.36, z: -0.27, type: 'destination', selectable: true },
  restroom: { id: 'restroom', label: '无障碍卫生间', short: '无障碍卫生间', x: 0.14, z: 0.22, type: 'restroom', selectable: true },
  elevator: { id: 'elevator', label: '酒店垂直电梯', short: '垂直电梯', x: 0.33, z: 0.09, type: 'elevator', selectable: true },
  ramp: { id: 'ramp', label: '西侧缓坡入口', short: '缓坡入口', x: -0.33, z: -0.08, type: 'ramp', selectable: true },
  steps: { id: 'steps', label: '中庭台阶', short: '中庭台阶', x: 0.13, z: 0.28, type: 'steps' }
};

const edge = (id, from, to, length, label, status = ROAD_STATUS.OPEN, tags = []) => ({
  id, from, to, length, label, status, tags, updatedAt: '今天 16:58', source: '园区核验'
});

export const baseEdges = [
  edge('entrance-a', 'entrance', 'a', 110, '入口景观路', ROAD_STATUS.OPEN, ['ramp', 'wide']),
  edge('a-b', 'a', 'b', 130, '道路 B · 西侧通道', ROAD_STATUS.OPEN, ['wide']),
  edge('b-venue', 'b', 'venue', 160, '会场西侧通道', ROAD_STATUS.OPEN, ['smooth']),
  edge('a-c', 'a', 'c', 150, '道路 C · 湖边缓坡', ROAD_STATUS.OPEN, ['ramp', 'wide']),
  edge('c-d', 'c', 'd', 140, '道路 D · 湖边连接路', ROAD_STATUS.CAUTION, ['rough']),
  edge('d-venue', 'd', 'venue', 120, '会场东侧入口', ROAD_STATUS.OPEN, ['ramp']),
  edge('a-steps', 'a', 'steps', 80, '中庭近路', ROAD_STATUS.OPEN, ['steps']),
  edge('steps-venue', 'steps', 'venue', 170, '中庭台阶通道', ROAD_STATUS.OPEN, ['steps', 'complex']),
  edge('b-restroom', 'b', 'restroom', 90, '卫生间连廊', ROAD_STATUS.OPEN, ['smooth']),
  edge('restroom-elevator', 'restroom', 'elevator', 80, '酒店室内连廊', ROAD_STATUS.OPEN, ['indoor']),
  edge('elevator-venue', 'elevator', 'venue', 130, '电梯至会场通道', ROAD_STATUS.UNKNOWN, ['indoor']),
  edge('entrance-ramp', 'entrance', 'ramp', 70, '西侧缓坡', ROAD_STATUS.OPEN, ['ramp']),
  edge('ramp-c', 'ramp', 'c', 145, '园林辅路', ROAD_STATUS.OPEN, ['narrow'])
];

export const facilities = [
  { nodeId: 'restroom', type: '厕', distance: '260 m', detail: '全程无台阶 · 门宽 92 cm' },
  { nodeId: 'elevator', type: '梯', distance: '340 m', detail: '轿厢 140 × 160 cm · 正常运行' },
  { nodeId: 'ramp', type: '坡', distance: '70 m', detail: '坡度 1:14 · 双侧扶手' },
  { nodeId: 'venue', type: '门', distance: '400 m', detail: '自动门 · 左侧低位按钮' }
];

export const initialRisks = [
  { id: 'risk-rough', edgeId: 'c-d', level: 'MEDIUM', place: '湖边连接路', issue: '局部路面不平，轮椅建议低速通过', time: '今天 15:42', source: '用户影像' },
  { id: 'risk-unknown', edgeId: 'elevator-venue', level: 'MEDIUM', place: '酒店东连廊', issue: '超过 24 小时未采集最新路况', time: '昨天 17:10', source: '系统巡检' }
];

export function createDemoState() {
  return {
    edges: baseEdges.map(item => ({ ...item, tags: [...item.tags] })),
    risks: initialRisks.map(item => ({ ...item })),
    profile: 'wheelchair',
    origin: 'entrance',
    destination: 'venue',
    currentRoute: null,
    voiceEnabled: false,
    analyzed: false
  };
}
