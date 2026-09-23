export const ROAD_STATUS = Object.freeze({
  OPEN: 'OPEN', CAUTION: 'CAUTION', BLOCKED: 'BLOCKED', UNKNOWN: 'UNKNOWN'
});

export const profiles = {
  wheelchair: { label: '轮椅', speed: 70, blocks: ['steps'], cautionFactor: 1.35, steepFactor: 1.8 },
  lowVision: { label: '低视力', speed: 76, blocks: [], cautionFactor: 1.25, complexityFactor: 1.2 },
  blind: { label: '全盲', speed: 62, blocks: [], cautionFactor: 1.45, complexityFactor: 1.45 }
};

const node = (id, label, short, position, type, options = {}) => ({
  id, label, short, position, type, selectable: true, label3d: true, ...options
});

const edge = (id, from, to, length, label, status = ROAD_STATUS.OPEN, tags = []) => ({
  id, from, to, length, label, status, tags, updatedAt: '今天 09:40', source: 'X5 实景核验'
});

const entranceNodes = {
  gate: node('gate', '园区车行入口', '园区入口', [-47, -1.1, -22], 'entrance', { lastMeter: '沿入口右侧平缓路缘进入，注意与落客车辆保持距离。' }),
  dropoff: node('dropoff', '无台阶落客平台', '落客平台', [-37, -1.1, -8], 'dropoff'),
  parking: node('parking', '无障碍停车候选位', '停车候选位', [-45, -1.1, 10], 'parking', { verification: '待现场核验' }),
  garden: node('garden', '林荫景观步道', '景观步道', [-20, -1.1, 0], 'path'),
  fork: node('fork', '中央景观岔路', '中央岔路', [-5, -1.1, 5], 'junction'),
  rest: node('rest', '树荫休憩平台', '休憩平台', [-12, -1.1, -19], 'rest'),
  ramp: node('ramp', '主楼缓坡连接口', '缓坡入口', [10, -1.1, -10], 'ramp'),
  service: node('service', '主楼无台阶侧入口', '侧入口', [24, -1.1, -15], 'entrance'),
  main: node('main', '主楼正门入口', '主楼入口', [34, -1.1, 4], 'destination', { lastMeter: '从侧入口缓坡绕至门前平台；正门左侧路线含台阶，轮椅请继续使用右侧无台阶入口。' }),
  steps: node('steps', '主入口台阶观察点', '入口台阶', [9, -1.1, 15], 'steps', { selectable: false }),
  restroom: node('restroom', '无障碍卫生间方向', '卫生间方向', [28, -1.1, 13], 'restroom', { verification: '室内位置待核验' })
};

const entranceEdges = [
  edge('gate-dropoff', 'gate', 'dropoff', 70, '入口落客通道', ROAD_STATUS.OPEN, ['wide', 'smooth']),
  edge('dropoff-garden', 'dropoff', 'garden', 80, '林荫接驳路', ROAD_STATUS.OPEN, ['wide']),
  edge('garden-fork', 'garden', 'fork', 90, '景观主步道', ROAD_STATUS.OPEN, ['smooth']),
  edge('fork-main', 'fork', 'main', 160, '主楼正门通道', ROAD_STATUS.OPEN, ['wide']),
  edge('garden-rest', 'garden', 'rest', 110, '树荫慢行支路', ROAD_STATUS.OPEN, ['wide']),
  edge('rest-ramp', 'rest', 'ramp', 100, '休憩平台连接路', ROAD_STATUS.OPEN, ['ramp']),
  edge('ramp-service', 'ramp', 'service', 70, '主楼缓坡', ROAD_STATUS.OPEN, ['ramp', 'smooth']),
  edge('service-main', 'service', 'main', 90, '门前无台阶连廊', ROAD_STATUS.OPEN, ['smooth']),
  edge('dropoff-parking', 'dropoff', 'parking', 55, '停车区接驳线', ROAD_STATUS.UNKNOWN, ['wide']),
  edge('fork-steps', 'fork', 'steps', 55, '主入口近路', ROAD_STATUS.OPEN, ['steps']),
  edge('steps-main', 'steps', 'main', 65, '正门台阶', ROAD_STATUS.OPEN, ['steps']),
  edge('main-restroom', 'main', 'restroom', 45, '主楼大厅通道', ROAD_STATUS.UNKNOWN, ['indoor'])
];

const corridorNodes = {
  west: node('west', '走廊西侧入口', '西侧入口', [-105, -0.5, -3], 'entrance'),
  gardenDoor: node('gardenDoor', '庭院侧玻璃门', '庭院侧门', [-76, -0.5, -2], 'door'),
  restNook: node('restNook', '走廊休息凹间', '休息凹间', [-47, -0.5, 1], 'rest'),
  mid: node('mid', '新中式连廊中段', '连廊中段', [-22, -0.5, 3], 'path'),
  turn: node('turn', '转角通行节点', '转角节点', [-4, -0.5, 5], 'junction'),
  lounge: node('lounge', '公共休息厅', '休息厅', [13, -0.5, 8], 'rest'),
  threshold: node('threshold', '门槛高差观察点', '门槛高差', [19, -0.5, 14], 'barrier', { selectable: false }),
  service: node('service', '无台阶服务通道', '服务通道', [25, -0.5, -4], 'path'),
  restroom: node('restroom', '无障碍卫生间', '无障碍卫生间', [38, -0.5, 0], 'restroom'),
  elevator: node('elevator', '垂直电梯候梯区', '电梯候梯区', [40, -0.5, 9], 'elevator', { lastMeter: '到达候梯区后，低位呼梯按钮位于门框右侧；请避开转角处临时座椅。' }),
  guestWing: node('guestWing', '客房区无台阶入口', '客房区入口', [47, -0.5, 17], 'destination')
};

const corridorEdges = [
  edge('west-garden', 'west', 'gardenDoor', 42, '西段宽走廊', ROAD_STATUS.OPEN, ['indoor', 'wide']),
  edge('garden-rest', 'gardenDoor', 'restNook', 38, '庭院侧连廊', ROAD_STATUS.OPEN, ['indoor']),
  edge('rest-mid', 'restNook', 'mid', 34, '休息凹间通道', ROAD_STATUS.OPEN, ['indoor', 'smooth']),
  edge('mid-turn', 'mid', 'turn', 28, '连廊中段', ROAD_STATUS.OPEN, ['indoor']),
  edge('turn-lounge', 'turn', 'lounge', 44, '休息厅主通道', ROAD_STATUS.CAUTION, ['indoor', 'narrow']),
  edge('lounge-elevator', 'lounge', 'elevator', 44, '电梯前厅', ROAD_STATUS.OPEN, ['indoor', 'smooth']),
  edge('elevator-guest', 'elevator', 'guestWing', 24, '客房区连廊', ROAD_STATUS.OPEN, ['indoor']),
  edge('turn-service', 'turn', 'service', 30, '后勤无台阶通道', ROAD_STATUS.OPEN, ['indoor', 'wide']),
  edge('service-restroom', 'service', 'restroom', 18, '卫生间接驳通道', ROAD_STATUS.OPEN, ['indoor']),
  edge('restroom-elevator', 'restroom', 'elevator', 15, '卫生间至电梯', ROAD_STATUS.OPEN, ['indoor']),
  edge('lounge-threshold', 'lounge', 'threshold', 12, '客房近路门槛', ROAD_STATUS.CAUTION, ['threshold']),
  edge('threshold-guest', 'threshold', 'guestWing', 22, '门槛近路', ROAD_STATUS.CAUTION, ['threshold', 'complex'])
];

const courtyardNodes = {
  lobby: node('lobby', '酒店大堂连接口', '大堂连接口', [-34, -0.7, -15], 'entrance'),
  gallery: node('gallery', '内庭环廊西段', '环廊西段', [-24, -0.7, -5], 'path'),
  atrium: node('atrium', '内庭中央开阔区', '中央开阔区', [-5, -0.7, 1], 'junction'),
  seating: node('seating', '环形休息座区', '环形座区', [16, -0.7, 4], 'rest'),
  turning: node('turning', '轮椅转身空间', '转身空间', [2, -0.7, -12], 'facility'),
  glassDoor: node('glassDoor', '庭院玻璃门', '庭院玻璃门', [28, -0.7, 8], 'door'),
  eastHall: node('eastHall', '东侧无台阶连廊', '东侧连廊', [34, -0.7, -8], 'destination'),
  levelChange: node('levelChange', '地面高差观察点', '地面高差', [13, -0.7, -18], 'barrier', { selectable: false }),
  liftDirection: node('liftDirection', '电梯方向指引点', '电梯方向', [-8, -0.7, 12], 'elevator'),
  restroomDirection: node('restroomDirection', '无障碍卫生间方向', '卫生间方向', [20, -0.7, 12], 'restroom', { verification: '方向标识待复核' })
};

const courtyardEdges = [
  edge('lobby-gallery', 'lobby', 'gallery', 32, '大堂至内庭通道', ROAD_STATUS.OPEN, ['indoor', 'wide']),
  edge('gallery-atrium', 'gallery', 'atrium', 35, '内庭西环廊', ROAD_STATUS.OPEN, ['indoor']),
  edge('atrium-seating', 'atrium', 'seating', 31, '中央休息区通道', ROAD_STATUS.OPEN, ['indoor', 'smooth']),
  edge('seating-glass', 'seating', 'glassDoor', 24, '座区至玻璃门', ROAD_STATUS.CAUTION, ['indoor', 'narrow']),
  edge('glass-east', 'glassDoor', 'eastHall', 28, '东侧玻璃连廊', ROAD_STATUS.OPEN, ['indoor']),
  edge('atrium-turning', 'atrium', 'turning', 20, '中央开阔通道', ROAD_STATUS.OPEN, ['wide']),
  edge('turning-east', 'turning', 'eastHall', 45, '南侧无台阶通道', ROAD_STATUS.OPEN, ['wide', 'smooth']),
  edge('atrium-lift', 'atrium', 'liftDirection', 27, '电梯方向连廊', ROAD_STATUS.OPEN, ['indoor']),
  edge('seating-restroom', 'seating', 'restroomDirection', 18, '卫生间方向通道', ROAD_STATUS.UNKNOWN, ['indoor']),
  edge('turning-level', 'turning', 'levelChange', 17, '地面高差近路', ROAD_STATUS.CAUTION, ['threshold']),
  edge('level-east', 'levelChange', 'eastHall', 29, '高差连接段', ROAD_STATUS.CAUTION, ['threshold'])
];

const lakesideNodes = {
  hotel: node('hotel', '酒店侧园林入口', '酒店侧入口', [-58, -1, -28], 'entrance'),
  ramp: node('ramp', '园林缓坡接驳口', '园林缓坡', [-43, -1, -17], 'ramp'),
  gazebo: node('gazebo', '林下观景亭', '观景亭', [-34, -1, -7], 'rest'),
  bend: node('bend', '湖畔弯道节点', '湖畔弯道', [-16, -1, 4], 'junction'),
  shore: node('shore', '湖畔主步道', '湖畔步道', [4, -1, 13], 'path'),
  deck: node('deck', '亲水休憩平台', '休憩平台', [20, -1, 25], 'rest'),
  guardrail: node('guardrail', '临水护栏观察段', '临水护栏', [33, -1, 38], 'safety'),
  bridge: node('bridge', '园林小桥', '园林小桥', [11, -1, 48], 'bridge'),
  eastGate: node('eastGate', '度假区东入口', '东侧入口', [38, -1, 64], 'destination'),
  stonePath: node('stonePath', '石板园路风险点', '石板园路', [-2, -1, 34], 'barrier'),
  restPoint: node('restPoint', '树荫休息点', '树荫休息点', [-22, -1, 24], 'rest')
};

const lakesideEdges = [
  edge('hotel-ramp', 'hotel', 'ramp', 58, '酒店入口接驳路', ROAD_STATUS.OPEN, ['ramp']),
  edge('ramp-gazebo', 'ramp', 'gazebo', 42, '林下缓坡', ROAD_STATUS.OPEN, ['ramp', 'wide']),
  edge('gazebo-bend', 'gazebo', 'bend', 61, '观景亭步道', ROAD_STATUS.OPEN, ['smooth']),
  edge('bend-shore', 'bend', 'shore', 66, '湖畔主步道西段', ROAD_STATUS.OPEN, ['wide']),
  edge('shore-deck', 'shore', 'deck', 54, '湖畔主步道东段', ROAD_STATUS.OPEN, ['wide']),
  edge('deck-guardrail', 'deck', 'guardrail', 42, '临水护栏段', ROAD_STATUS.CAUTION, ['edge']),
  edge('guardrail-east', 'guardrail', 'eastGate', 73, '东入口连接路', ROAD_STATUS.OPEN, ['wide']),
  edge('bend-rest', 'bend', 'restPoint', 60, '树荫休息支路', ROAD_STATUS.OPEN, ['smooth']),
  edge('rest-stone', 'restPoint', 'stonePath', 70, '石板园路', ROAD_STATUS.CAUTION, ['rough']),
  edge('stone-bridge', 'stonePath', 'bridge', 60, '小桥西接路', ROAD_STATUS.CAUTION, ['narrow']),
  edge('bridge-east', 'bridge', 'eastGate', 75, '小桥东接路', ROAD_STATUS.OPEN, ['ramp']),
  edge('shore-stone', 'shore', 'stonePath', 44, '湖岸捷径', ROAD_STATUS.UNKNOWN, ['rough'])
];

const facility = (nodeId, type, detail, status = ROAD_STATUS.OPEN) => ({ nodeId, type, detail, status });
const risk = (id, edgeId, level, place, issue, source = 'X5 实景巡检') => ({ id, edgeId, level, place, issue, time: '今天 09:40', source });

export const sceneCatalog = [
  {
    id: 'entrance', number: '01', label: '园区入口与景观步道', short: '入口园区', file: '/1现代建筑园区入口与景观步道.splat',
    dataLabel: '入口园区 · 11 地点 / 12 路段', movementSpeed: 0.55, focusDistance: 18, splatScale: 0.65,
    home: { target: [-18, 0, -2], position: [34, -34, 52] }, defaultRoute: ['gate', 'main'], nodes: entranceNodes, edges: entranceEdges,
    viewpoints: [
      { key: '1', label: '景观步道', target: [-38, 0, -8], position: [-20, -14, 16], nodeId: 'garden' },
      { key: '2', label: '落客入口', target: [-38, 0, -9], position: [-13, -12, 14], nodeId: 'dropoff' },
      { key: '3', label: '主楼入口', target: [28, 0, 2], position: [50, -14, 25], nodeId: 'main' },
      { key: '4', label: '缓坡侧门', target: [13, 0, -12], position: [31, -11, 10], nodeId: 'ramp' }
    ],
    facilities: [facility('gate', '门', '入口右侧路缘平缓'), facility('dropoff', '落', '无台阶落客接驳'), facility('parking', 'P', '疑似无障碍停车位，待核验', ROAD_STATUS.UNKNOWN), facility('garden', '路', '连续平整景观步道'), facility('rest', '休', '树荫休憩空间'), facility('ramp', '坡', '主楼缓坡连接'), facility('service', '门', '无台阶侧入口'), facility('restroom', '厕', '室内方向待核验', ROAD_STATUS.UNKNOWN)],
    risks: [risk('entrance-steps', 'fork-steps', 'HIGH', '主入口台阶', '正门近路包含台阶，轮椅需绕行侧入口'), risk('parking-check', 'dropoff-parking', 'MEDIUM', '停车候选区', '停车标识与通道宽度需要现场复核')],
    analysis: { edgeId: 'fork-main', place: '主楼正门通道', reason: '检测到施工围挡占据主要轮椅通行区域' }
  },
  {
    id: 'corridor', number: '02', label: '新中式酒店走廊', short: '酒店连廊', file: '/2新中式酒店走廊(1).splat',
    dataLabel: '酒店连廊 · 11 地点 / 12 路段', movementSpeed: 0.38, focusDistance: 28, splatScale: 0.6,
    home: { target: [-32, 0, 3], position: [38, -38, 70] }, defaultRoute: ['west', 'elevator'], nodes: corridorNodes, edges: corridorEdges,
    viewpoints: [
      { key: '1', label: '西侧入口', target: [-93, 0, -2], position: [-51, -22, 38], nodeId: 'west' },
      { key: '2', label: '连廊中段', target: [-30, 0, 2], position: [12, -22, 42], nodeId: 'mid' },
      { key: '3', label: '休息厅', target: [10, 0, 7], position: [52, -22, 47], nodeId: 'lounge' },
      { key: '4', label: '电梯前厅', target: [39, 0, 8], position: [81, -22, 48], nodeId: 'elevator' }
    ],
    facilities: [facility('west', '门', '走廊西侧平层入口'), facility('gardenDoor', '门', '庭院侧玻璃门'), facility('restNook', '休', '走廊休息凹间'), facility('lounge', '休', '公共休息空间'), facility('service', '路', '无台阶服务通道'), facility('restroom', '厕', '无障碍卫生间'), facility('elevator', '梯', '垂直电梯候梯区'), facility('guestWing', '门', '客房区平层入口')],
    risks: [risk('corridor-narrow', 'turn-lounge', 'MEDIUM', '休息厅转角', '家具缩小有效通行宽度'), risk('threshold-risk', 'lounge-threshold', 'MEDIUM', '客房近路门槛', '门槛存在轻微高差，建议轮椅绕行服务通道')],
    analysis: { edgeId: 'turn-service', place: '无台阶服务通道', reason: '检测到保洁车辆占用主要轮椅通行区域' }
  },
  {
    id: 'courtyard', number: '03', label: '酒店内庭与连接空间', short: '酒店内庭', file: '/3.splat',
    dataLabel: '酒店内庭 · 10 地点 / 11 路段', movementSpeed: 0.34, focusDistance: 28, splatScale: 0.55,
    home: { target: [-2, 0, -3], position: [50, -35, 52] }, defaultRoute: ['lobby', 'eastHall'], nodes: courtyardNodes, edges: courtyardEdges,
    viewpoints: [
      { key: '1', label: '大堂接口', target: [-28, 0, -12], position: [12, -26, 28], nodeId: 'lobby' },
      { key: '2', label: '中央内庭', target: [-4, 0, 0], position: [38, -26, 42], nodeId: 'atrium' },
      { key: '3', label: '环形座区', target: [15, 0, 4], position: [57, -26, 46], nodeId: 'seating' },
      { key: '4', label: '东侧连廊', target: [30, 0, -7], position: [72, -26, 33], nodeId: 'eastHall' }
    ],
    facilities: [facility('lobby', '门', '大堂平层连接'), facility('gallery', '廊', '连续室内环廊'), facility('atrium', '转', '中央开阔通行区'), facility('seating', '休', '环形休息座区'), facility('turning', '转', '轮椅转身空间'), facility('glassDoor', '门', '庭院玻璃门'), facility('liftDirection', '梯', '电梯方向指引'), facility('restroomDirection', '厕', '方向标识待复核', ROAD_STATUS.UNKNOWN)],
    risks: [risk('glass-narrow', 'seating-glass', 'MEDIUM', '庭院玻璃门前', '座椅靠近通道，通行宽度偏窄'), risk('level-change', 'turning-level', 'MEDIUM', '南侧地面高差', '地面衔接存在可见高差')],
    analysis: { edgeId: 'atrium-turning', place: '中央开阔通道', reason: '检测到移动座椅占用轮椅转身与通行区域' }
  },
  {
    id: 'lakeside', number: '04', label: '湖畔度假区入口与园林', short: '湖畔园林', file: '/4湖畔度假区入口与园林.splat',
    dataLabel: '湖畔园林 · 11 地点 / 12 路段', movementSpeed: 0.58, focusDistance: 20, splatScale: 0.65,
    home: { target: [-5, 0, 13], position: [62, -38, 76] }, defaultRoute: ['hotel', 'eastGate'], nodes: lakesideNodes, edges: lakesideEdges,
    viewpoints: [
      { key: '1', label: '园林入口', target: [-48, 0, -22], position: [-24, -14, 4], nodeId: 'hotel' },
      { key: '2', label: '观景亭', target: [-34, 0, -7], position: [-14, -13, 17], nodeId: 'gazebo' },
      { key: '3', label: '湖畔步道', target: [3, 0, 15], position: [28, -14, 41], nodeId: 'shore' },
      { key: '4', label: '园林小桥', target: [12, 0, 48], position: [37, -14, 73], nodeId: 'bridge' }
    ],
    facilities: [facility('hotel', '门', '酒店侧园林入口'), facility('ramp', '坡', '园林缓坡接驳'), facility('gazebo', '休', '有顶观景休息点'), facility('shore', '路', '湖畔宽步道'), facility('deck', '休', '亲水休憩平台'), facility('guardrail', '护', '临水护栏连续段'), facility('bridge', '桥', '园林小桥连接'), facility('restPoint', '休', '树荫休息点')],
    risks: [risk('water-edge', 'deck-guardrail', 'MEDIUM', '临水护栏段', '临水路段建议低视力用户开启语音提醒'), risk('stone-road', 'rest-stone', 'MEDIUM', '石板园路', '拼缝较多，轮椅建议低速通过')],
    analysis: { edgeId: 'bend-shore', place: '湖畔主步道西段', reason: '检测到养护车辆临时占用湖畔主步道' }
  }
];

export const scenes = sceneCatalog.map(({ id, number, label, short, file }) => ({ id, number, label, short, file }));

export function getSceneData(sceneId) {
  return sceneCatalog.find(scene => scene.id === sceneId) || sceneCatalog[0];
}

export function createDemoState(sceneId) {
  const scene = getSceneData(sceneId);
  return {
    edges: scene.edges.map(item => ({ ...item, tags: [...item.tags] })),
    risks: scene.risks.map(item => ({ ...item })),
    profile: 'wheelchair', origin: scene.defaultRoute[0], destination: scene.defaultRoute[1],
    currentRoute: null, voiceEnabled: false, analyzed: false, roamActive: false
  };
}
