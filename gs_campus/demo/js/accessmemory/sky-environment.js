import * as THREE from 'three';

function seededRandom(seed = 923) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function drawCloud(context, x, y, scale, opacity) {
  const lobes = [
    [-86, 13, 78, 34], [-40, -4, 94, 48], [12, -18, 112, 59],
    [66, 2, 92, 45], [112, 18, 68, 31], [22, 20, 146, 42]
  ];
  context.save();
  context.globalAlpha = opacity;
  lobes.forEach(([offsetX, offsetY, radiusX, radiusY]) => {
    context.save();
    context.translate(x + offsetX * scale, y + offsetY * scale);
    context.scale(radiusX * scale, radiusY * scale);
    const gradient = context.createRadialGradient(0, -0.16, 0.08, 0, 0, 1);
    gradient.addColorStop(0, 'rgba(255,255,255,.98)');
    gradient.addColorStop(0.58, 'rgba(255,255,255,.78)');
    gradient.addColorStop(1, 'rgba(230,242,248,0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0, 0, 1, 0, Math.PI * 2);
    context.fill();
    context.restore();
  });
  context.restore();
}

function createSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  const sky = context.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#1977b7');
  sky.addColorStop(0.42, '#53a8d2');
  sky.addColorStop(0.5, '#8bc7df');
  sky.addColorStop(0.58, '#53a8d2');
  sky.addColorStop(1, '#1977b7');
  context.fillStyle = sky;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const random = seededRandom();
  for (let index = 0; index < 10; index += 1) {
    const x = random() * canvas.width;
    const y = 105 + random() * 300;
    const scale = 0.28 + random() * 0.38;
    const opacity = 0.24 + random() * 0.24;
    drawCloud(context, x, y, scale, opacity);
    drawCloud(context, x, canvas.height - y, scale, opacity * 0.88);
    if (x < 180) drawCloud(context, x + canvas.width, y, scale, opacity);
    if (x > canvas.width - 180) drawCloud(context, x - canvas.width, y, scale, opacity);
    if (x < 180) drawCloud(context, x + canvas.width, canvas.height - y, scale, opacity * 0.88);
    if (x > canvas.width - 180) drawCloud(context, x - canvas.width, canvas.height - y, scale, opacity * 0.88);
  }

  const haze = context.createLinearGradient(0, 420, 0, 604);
  haze.addColorStop(0, 'rgba(255,255,255,0)');
  haze.addColorStop(0.5, 'rgba(255,255,255,.1)');
  haze.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = haze;
  context.fillRect(0, 420, canvas.width, 184);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function addSkyEnvironment(viewer) {
  const texture = createSkyTexture();
  const maxAnisotropy = viewer.renderer.capabilities?.getMaxAnisotropy?.() || 1;
  texture.anisotropy = Math.min(4, maxAnisotropy);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    depthWrite: false,
    toneMapped: false
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 48, 32), material);
  sky.name = 'accessmemory-sky-environment';
  sky.rotation.x = Math.PI;
  sky.renderOrder = -1000;
  sky.frustumCulled = false;
  viewer.threeScene.add(sky);
  return sky;
}
