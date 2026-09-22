import * as THREE from 'three';
import { facilities, nodes, ROAD_STATUS } from './data.js';

const statusColor = {
  [ROAD_STATUS.OPEN]: 0x35c98a,
  [ROAD_STATUS.CAUTION]: 0xf0b429,
  [ROAD_STATUS.BLOCKED]: 0xe44941,
  [ROAD_STATUS.UNKNOWN]: 0xa7aaa2
};

export class SceneOverlay {
  constructor(viewer, poiLayer) {
    this.viewer = viewer;
    this.poiLayer = poiLayer;
    this.group = new THREE.Group();
    this.group.name = 'accessmemory-overlays';
    this.labels = [];
    this.center = new THREE.Vector3();
    this.radius = 100;
    this.animationFrame = null;
    viewer.threeScene.add(this.group);
  }

  configure(center, radius) {
    this.center.copy(center);
    this.radius = Math.max(radius, 12);
    this.createPoiLabels();
    this.startProjectionLoop();
  }

  worldPoint(nodeId) {
    const node = nodes[nodeId];
    return new THREE.Vector3(
      this.center.x + node.x * this.radius * 1.42,
      this.center.y - this.radius * 0.12,
      this.center.z + node.z * this.radius * 1.42
    );
  }

  render(edges, route) {
    this.clearMeshes();
    edges.forEach(edge => {
      const material = new THREE.MeshBasicMaterial({
        color: statusColor[edge.status], transparent: true,
        opacity: edge.status === ROAD_STATUS.BLOCKED ? 0.95 : 0.34,
        depthTest: false, depthWrite: false
      });
      const mesh = this.makeTube([this.worldPoint(edge.from), this.worldPoint(edge.to)], this.radius * 0.006, material);
      mesh.renderOrder = 900;
      mesh.userData.edgeId = edge.id;
      this.group.add(mesh);
    });
    if (!route) return;
    const points = route.nodes.map(id => this.worldPoint(id));
    const halo = this.makeTube(points, this.radius * 0.015, new THREE.MeshBasicMaterial({ color: 0x101713, transparent: true, opacity: 0.7, depthTest: false, depthWrite: false }));
    const line = this.makeTube(points, this.radius * 0.008, new THREE.MeshBasicMaterial({ color: 0x27dff5, depthTest: false, depthWrite: false }));
    halo.renderOrder = 910; line.renderOrder = 911;
    this.group.add(halo, line);
    const cursor = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius * 0.024, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false })
    );
    cursor.position.copy(points[0]); cursor.renderOrder = 920; cursor.userData.routeCursor = true;
    this.group.add(cursor);
  }

  makeTube(points, width, material) {
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
    return new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(10, points.length * 12), width, 7, false), material);
  }

  clearMeshes() {
    [...this.group.children].forEach(child => {
      child.geometry?.dispose();
      child.material?.dispose();
      this.group.remove(child);
    });
  }

  createPoiLabels() {
    this.poiLayer.innerHTML = '';
    this.labels = facilities.map(facility => {
      const element = document.createElement('div');
      element.className = 'poi-label';
      element.innerHTML = `<i></i><span>${nodes[facility.nodeId].short}</span>`;
      this.poiLayer.appendChild(element);
      return { nodeId: facility.nodeId, element };
    });
  }

  startProjectionLoop() {
    cancelAnimationFrame(this.animationFrame);
    const update = () => {
      const camera = this.viewer.camera;
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.labels.forEach(label => {
        const point = this.worldPoint(label.nodeId).project(camera);
        const visible = point.z > -1 && point.z < 1;
        label.element.style.display = visible ? 'flex' : 'none';
        label.element.style.left = `${(point.x * 0.5 + 0.5) * width}px`;
        label.element.style.top = `${(-point.y * 0.5 + 0.5) * height}px`;
      });
      this.animationFrame = requestAnimationFrame(update);
    };
    update();
  }

  focusNode(nodeId) {
    const target = this.worldPoint(nodeId);
    const camera = this.viewer.camera;
    const offset = camera.position.clone().sub(this.viewer.controls.target).normalize().multiplyScalar(this.radius * 0.52);
    const startPosition = camera.position.clone();
    const startTarget = this.viewer.controls.target.clone();
    const endPosition = target.clone().add(offset);
    const started = performance.now();
    const animate = now => {
      const progress = Math.min(1, (now - started) / 650);
      const eased = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(startPosition, endPosition, eased);
      this.viewer.controls.target.lerpVectors(startTarget, target, eased);
      this.viewer.controls.update();
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
}

export function renderTopologyMap(svg, edges, route) {
  const point = id => ({ x: 500 + nodes[id].x * 780, y: 350 + nodes[id].z * 620 });
  const routeIds = new Set(route?.edges.map(item => item.id) || []);
  const colors = { OPEN: '#7b8078', CAUTION: '#d29a1f', BLOCKED: '#d63b35', UNKNOWN: '#a8aaa4' };
  const edgeMarkup = edges.map(edge => {
    const from = point(edge.from); const to = point(edge.to);
    return `<g class="map-edge"><line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${colors[edge.status]}" stroke-width="${edge.status === 'BLOCKED' ? 12 : 7}" stroke-dasharray="${edge.status === 'UNKNOWN' ? '12 10' : ''}"/><title>${edge.label} · ${edge.status}</title></g>`;
  }).join('');
  const routeMarkup = edges.filter(edge => routeIds.has(edge.id)).map(edge => {
    const from = point(edge.from); const to = point(edge.to);
    return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#1c1d1a" stroke-width="22" stroke-linecap="round"/><line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#25d9f2" stroke-width="11" stroke-linecap="round"/>`;
  }).join('');
  const nodeMarkup = Object.values(nodes).map(node => {
    const pos = point(node.id); const key = ['entrance', 'venue', 'restroom', 'elevator', 'ramp'].includes(node.id);
    return `<g><circle cx="${pos.x}" cy="${pos.y}" r="${key ? 12 : 7}" fill="${key ? '#171815' : '#f4f3ed'}" stroke="#171815" stroke-width="3"/><text x="${pos.x + 15}" y="${pos.y - 12}" fill="#252621" font-size="${key ? 17 : 13}" font-weight="${key ? 700 : 500}">${node.short}</text></g>`;
  }).join('');
  svg.innerHTML = `<rect width="1000" height="700" fill="#e9e8e1"/><path d="M55 130H945M55 560H945" stroke="#d0d0c8" stroke-width="1"/><path d="M160 80V620M820 80V620" stroke="#d0d0c8" stroke-width="1"/><text x="58" y="74" fill="#555850" font-size="13" letter-spacing="2">NANJING · QIXIA ACCESSIBLE NETWORK</text><text x="942" y="74" text-anchor="end" fill="#777a72" font-size="12">实时路况 / ${edges.length} 路段</text>${edgeMarkup}${routeMarkup}${nodeMarkup}`;
}
