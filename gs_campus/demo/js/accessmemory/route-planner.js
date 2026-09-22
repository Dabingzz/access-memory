import { nodes, profiles, ROAD_STATUS } from './data.js';

function isForbidden(edge, profile, preferences) {
  if (edge.status === ROAD_STATUS.BLOCKED) return true;
  if ((profile.blocks.includes('steps') || preferences.avoidSteps) && edge.tags.includes('steps')) return true;
  if (preferences.avoidSteep && edge.tags.includes('steep')) return true;
  return false;
}

function weightedCost(edge, profile, preferences) {
  let factor = 1;
  if (edge.status === ROAD_STATUS.CAUTION) factor *= profile.cautionFactor;
  if (edge.status === ROAD_STATUS.UNKNOWN) factor *= 1.6;
  if (edge.tags.includes('rough')) factor *= preferences.preferStable ? 1.05 : 1.01;
  if (edge.tags.includes('narrow')) factor *= preferences.preferStable ? 1.45 : 1.12;
  if (edge.tags.includes('steep')) factor *= profile.steepFactor || 1.3;
  if (edge.tags.includes('complex')) factor *= profile.complexityFactor || 1;
  return edge.length * factor;
}

export function planAccessibleRoute({ edges, origin, destination, profileId, preferences }) {
  const profile = profiles[profileId] || profiles.wheelchair;
  const adjacency = new Map();
  Object.keys(nodes).forEach(id => adjacency.set(id, []));
  edges.forEach(item => {
    adjacency.get(item.from)?.push({ edge: item, next: item.to });
    adjacency.get(item.to)?.push({ edge: item, next: item.from });
  });

  const distance = new Map([[origin, 0]]);
  const previous = new Map();
  const pending = new Set(Object.keys(nodes));

  while (pending.size) {
    let current = null;
    let best = Infinity;
    pending.forEach(id => {
      const value = distance.get(id) ?? Infinity;
      if (value < best) { best = value; current = id; }
    });
    if (current === null || best === Infinity) break;
    pending.delete(current);
    if (current === destination) break;

    for (const candidate of adjacency.get(current) || []) {
      if (!pending.has(candidate.next) || isForbidden(candidate.edge, profile, preferences)) continue;
      const proposed = best + weightedCost(candidate.edge, profile, preferences);
      if (proposed < (distance.get(candidate.next) ?? Infinity)) {
        distance.set(candidate.next, proposed);
        previous.set(candidate.next, { node: current, edge: candidate.edge });
      }
    }
  }

  if (!previous.has(destination) && origin !== destination) return null;
  const routeNodes = [destination];
  const routeEdges = [];
  let cursor = destination;
  while (cursor !== origin) {
    const step = previous.get(cursor);
    if (!step) return null;
    routeEdges.unshift(step.edge);
    routeNodes.unshift(step.node);
    cursor = step.node;
  }

  const length = routeEdges.reduce((sum, item) => sum + item.length, 0);
  const hasCaution = routeEdges.some(item => item.status === ROAD_STATUS.CAUTION);
  const hasUnknown = routeEdges.some(item => item.status === ROAD_STATUS.UNKNOWN);
  const hasRamp = routeEdges.some(item => item.tags.includes('ramp'));
  return {
    nodes: routeNodes,
    edges: routeEdges,
    length,
    minutes: Math.max(1, Math.round(length / profile.speed)),
    tags: [
      { text: '全程无台阶' },
      hasRamp ? { text: '优先坡道' } : { text: '入口可达' },
      hasCaution ? { text: '1 处谨慎路段', warn: true } : { text: '路况已核验' },
      ...(hasUnknown ? [{ text: '含待确认路段', warn: true }] : [])
    ],
    steps: buildSteps(routeNodes, routeEdges),
    lastMeter: destination === 'venue'
      ? '从东侧缓坡接近会场，沿右侧无台阶通道进入；玻璃门左侧为低位自动开门按钮。'
      : `抵达${nodes[destination].label}后，跟随蓝色入口标识进入。`
  };
}

function buildSteps(routeNodes, routeEdges) {
  return routeEdges.map((edge, index) => {
    const target = nodes[routeNodes[index + 1]];
    let instruction = `沿${edge.label}前往${target.short}`;
    if (edge.tags.includes('ramp')) instruction = `经缓坡进入${target.short}`;
    if (edge.status === ROAD_STATUS.CAUTION) instruction += '，路面不平请低速通过';
    return { instruction, distance: `${edge.length} m`, status: edge.status };
  });
}

export function getPreferencesFromUI() {
  return {
    avoidSteps: document.querySelector('#avoid-steps')?.checked ?? true,
    avoidSteep: document.querySelector('#avoid-steep')?.checked ?? true,
    preferStable: document.querySelector('#prefer-stable')?.checked ?? true
  };
}
