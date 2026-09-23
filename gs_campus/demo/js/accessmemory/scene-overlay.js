import * as THREE from 'three';
import { ROAD_STATUS } from './data.js';

const statusColor = {
  [ROAD_STATUS.OPEN]: 0x35c98a,
  [ROAD_STATUS.CAUTION]: 0xf0b429,
  [ROAD_STATUS.BLOCKED]: 0xe44941,
  [ROAD_STATUS.UNKNOWN]: 0xa7aaa2
};

export class SceneOverlay {
  constructor(viewer, poiLayer, sceneData, onPoiSelect) {
    this.viewer = viewer;
    this.poiLayer = poiLayer;
    this.sceneData = sceneData;
    this.nodes = sceneData.nodes;
    this.onPoiSelect = onPoiSelect;
    this.group = new THREE.Group();
    this.group.name = 'accessmemory-overlays';
    this.labels = [];
    this.animationFrame = null;
    viewer.threeScene.add(this.group);
  }

  configure() {
    this.createPoiLabels();
    this.startProjectionLoop();
  }

  worldPoint(nodeId) {
    return new THREE.Vector3(...this.nodes[nodeId].position);
  }

  render(edges, route) {
    this.clearMeshes();
    edges.filter(item => item.status !== ROAD_STATUS.OPEN).forEach(item => {
      const material = new THREE.MeshBasicMaterial({
        color: statusColor[item.status], transparent: true,
        opacity: item.status === ROAD_STATUS.BLOCKED ? 0.95 : 0.48,
        depthTest: false, depthWrite: false
      });
      const mesh = this.makeTube([this.worldPoint(item.from), this.worldPoint(item.to)], 0.14, material);
      mesh.renderOrder = 900;
      mesh.userData.edgeId = item.id;
      this.group.add(mesh);
    });
    if (!route || route.nodes.length < 2) return;
    const points = route.nodes.map(id => this.worldPoint(id));
    const halo = this.makeTube(points, 0.38, new THREE.MeshBasicMaterial({ color: 0x101713, transparent: true, opacity: 0.68, depthTest: false, depthWrite: false }));
    const line = this.makeTube(points, 0.22, new THREE.MeshBasicMaterial({ color: 0x27dff5, depthTest: false, depthWrite: false }));
    halo.renderOrder = 910; line.renderOrder = 911;
    this.group.add(halo, line);
    const cursor = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 18), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false }));
    cursor.position.copy(points[0]); cursor.renderOrder = 920; cursor.userData.routeCursor = true;
    this.group.add(cursor);
  }

  makeTube(points, width, material) {
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
    return new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(10, points.length * 12), width, 7, false), material);
  }

  clearMeshes() {
    [...this.group.children].forEach(child => {
      child.geometry?.dispose(); child.material?.dispose(); this.group.remove(child);
    });
  }

  createPoiLabels() {
    this.poiLayer.innerHTML = '';
    this.labels = Object.values(this.nodes).filter(item => item.label3d).map(item => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `poi-label poi-${item.type}`;
      element.innerHTML = `<i></i><span>${item.short}</span>`;
      element.title = `定位到${item.label}`;
      element.addEventListener('click', () => this.onPoiSelect?.(item.id));
      this.poiLayer.appendChild(element);
      return { nodeId: item.id, element };
    });
  }

  startProjectionLoop() {
    cancelAnimationFrame(this.animationFrame);
    const update = () => {
      const camera = this.viewer.camera;
      const width = window.innerWidth; const height = window.innerHeight;
      this.labels.forEach(label => {
        const point = this.worldPoint(label.nodeId).project(camera);
        const visible = point.z > -1 && point.z < 1 && Math.abs(point.x) < 1.04 && Math.abs(point.y) < 1.04;
        label.element.style.display = visible ? 'flex' : 'none';
        label.element.style.left = `${(point.x * 0.5 + 0.5) * width}px`;
        label.element.style.top = `${(-point.y * 0.5 + 0.5) * height}px`;
      });
      this.animationFrame = requestAnimationFrame(update);
    };
    update();
  }

  flyTo(position, target, duration = 720) {
    const camera = this.viewer.camera;
    const startPosition = camera.position.clone(); const startTarget = this.viewer.controls.target.clone();
    const endPosition = new THREE.Vector3(...position); const endTarget = new THREE.Vector3(...target);
    const started = performance.now();
    const animate = now => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(startPosition, endPosition, eased);
      this.viewer.controls.target.lerpVectors(startTarget, endTarget, eased);
      camera.lookAt(this.viewer.controls.target); this.viewer.controls.update();
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  focusNode(nodeId) {
    const target = this.worldPoint(nodeId);
    const direction = this.viewer.camera.position.clone().sub(this.viewer.controls.target).normalize();
    const position = target.clone().add(direction.multiplyScalar(this.sceneData.focusDistance));
    position.y = Math.min(position.y, target.y - this.sceneData.focusDistance * 0.45);
    this.flyTo(position.toArray(), target.toArray());
  }

  focusViewpoint(viewpoint) {
    this.flyTo(viewpoint.position, viewpoint.target);
  }
}

export function renderTopologyMap(svg, edges, route, nodes, sceneLabel) {
  const values = Object.values(nodes);
  const xs = values.map(item => item.position[0]); const zs = values.map(item => item.position[2]);
  const minX = Math.min(...xs); const maxX = Math.max(...xs); const minZ = Math.min(...zs); const maxZ = Math.max(...zs);
  const rangeX = Math.max(1, maxX - minX); const rangeZ = Math.max(1, maxZ - minZ);
  const point = id => ({
    x: 100 + ((nodes[id].position[0] - minX) / rangeX) * 800,
    y: 130 + ((nodes[id].position[2] - minZ) / rangeZ) * 460
  });
  const routeIds = new Set(route?.edges.map(item => item.id) || []);
  const colors = { OPEN: '#667069', CAUTION: '#d29a1f', BLOCKED: '#d63b35', UNKNOWN: '#a8aaa4' };
  const edgeMarkup = edges.map(item => {
    const from = point(item.from); const to = point(item.to);
    return `<g><line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${colors[item.status]}" stroke-width="${item.status === 'BLOCKED' ? 12 : 7}" stroke-dasharray="${item.status === 'UNKNOWN' ? '12 10' : ''}"/><title>${item.label} · ${item.status}</title></g>`;
  }).join('');
  const routeMarkup = edges.filter(item => routeIds.has(item.id)).map(item => {
    const from = point(item.from); const to = point(item.to);
    return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#1c1d1a" stroke-width="22" stroke-linecap="round"/><line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#25d9f2" stroke-width="11" stroke-linecap="round"/>`;
  }).join('');
  const important = new Set(['entrance', 'destination', 'elevator', 'restroom', 'ramp', 'rest']);
  const nodeMarkup = values.map(item => {
    const pos = point(item.id); const key = important.has(item.type);
    return `<g><circle cx="${pos.x}" cy="${pos.y}" r="${key ? 12 : 7}" fill="${key ? '#171815' : '#f4f3ed'}" stroke="#171815" stroke-width="3"/><text x="${pos.x + 14}" y="${pos.y - 11}" fill="#252621" font-size="${key ? 16 : 12}" font-weight="${key ? 700 : 500}">${item.short}</text></g>`;
  }).join('');
  svg.innerHTML = `<rect width="1000" height="700" rx="16" fill="#e9e8e1"/><path d="M55 130H945M55 590H945" stroke="#d0d0c8"/><path d="M100 85V625M900 85V625" stroke="#d0d0c8"/><text x="58" y="74" fill="#555850" font-size="13" letter-spacing="2">${sceneLabel.toUpperCase()} / ACCESSIBLE NETWORK</text><text x="942" y="74" text-anchor="end" fill="#777a72" font-size="12">${values.length} 地点 · ${edges.length} 路段</text>${edgeMarkup}${routeMarkup}${nodeMarkup}`;
}
