import * as THREE from 'three';

const smootherStep = value => value * value * value * (value * (value * 6 - 15) + 10);

export class FirstPersonExplorer {
  constructor(viewer, sceneData, onUpdate = () => {}) {
    this.viewer = viewer;
    this.nodes = sceneData.nodes;
    this.config = sceneData.exploration;
    this.onUpdate = onUpdate;
    this.up = new THREE.Vector3(0, -1, 0);
    this.lateral = 0;
    this.headingOffset = 0;
    this.pitch = 0;
    this.animationToken = 0;
    this.active = false;

    const points = this.config.path.map(id => {
      const point = new THREE.Vector3(...this.nodes[id].position);
      point.y -= this.config.eyeHeight;
      return point;
    });
    this.curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    this.length = this.curve.getLength();
    this.stationDistances = this.buildStationDistances(points);
    this.distance = this.stationDistances.get(this.config.startNodeId) ?? 0;
    this.stops = this.config.stops.map(stop => ({
      ...stop,
      distance: this.stationDistances.get(stop.anchorNodeId || stop.nodeId) ?? 0
    }));
  }

  buildStationDistances(points) {
    const straightLengths = [0];
    for (let index = 1; index < points.length; index += 1) {
      straightLengths[index] = straightLengths[index - 1] + points[index - 1].distanceTo(points[index]);
    }
    const total = straightLengths.at(-1) || 1;
    return new Map(this.config.path.map((id, index) => [id, (straightLengths[index] / total) * this.length]));
  }

  hasStop(nodeId) {
    return this.stops.some(stop => stop.nodeId === nodeId);
  }

  startPose() {
    this.distance = this.stationDistances.get(this.config.startNodeId) ?? 0;
    this.lateral = 0;
    this.headingOffset = 0;
    this.pitch = 0;
    return this.poseAt(this.distance);
  }

  poseAt(distance = this.distance) {
    const progress = THREE.MathUtils.clamp(distance / this.length, 0, 1);
    const position = this.curve.getPointAt(progress);
    const tangent = this.curve.getTangentAt(THREE.MathUtils.clamp(progress, 0.001, 0.999)).normalize();
    const right = new THREE.Vector3().crossVectors(tangent, this.up).normalize();
    position.addScaledVector(right, this.lateral);
    const baseYaw = Math.atan2(tangent.x, tangent.z);
    const yaw = baseYaw + this.headingOffset;
    const direction = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(this.pitch),
      -Math.sin(this.pitch),
      Math.cos(yaw) * Math.cos(this.pitch)
    );
    return { position, target: position.clone().add(direction.multiplyScalar(12)) };
  }

  activate() {
    this.active = true;
    this.applyPose();
  }

  deactivate() {
    this.active = false;
    this.cancelAutoWalk();
  }

  applyPose() {
    const pose = this.poseAt();
    this.viewer.camera.position.copy(pose.position);
    this.viewer.controls.target.copy(pose.target);
    this.viewer.camera.lookAt(pose.target);
    this.emitUpdate();
  }

  move(forward, sideways, delta, boosted = false) {
    if (!this.active || (!forward && !sideways)) return;
    this.cancelAutoWalk();
    const multiplier = boosted ? 2.1 : 1;
    this.distance = THREE.MathUtils.clamp(
      this.distance + forward * this.config.walkSpeed * multiplier * delta,
      0,
      this.length
    );
    this.lateral = THREE.MathUtils.clamp(
      this.lateral + sideways * this.config.walkSpeed * 0.45 * delta,
      -this.config.lateralLimit,
      this.config.lateralLimit
    );
    this.applyPose();
  }

  look(movementX, movementY) {
    if (!this.active) return;
    this.cancelAutoWalk();
    this.headingOffset -= movementX * 0.0022;
    this.pitch = THREE.MathUtils.clamp(this.pitch - movementY * 0.0022, -1.05, 1.05);
    this.applyPose();
  }

  walkTo(nodeId) {
    const stop = this.stops.find(item => item.nodeId === nodeId);
    if (!stop) return Promise.resolve(false);
    const token = ++this.animationToken;
    const startDistance = this.distance;
    const startLateral = this.lateral;
    const startHeading = this.headingOffset;
    const startPitch = this.pitch;
    const distance = Math.abs(stop.distance - startDistance);
    const duration = THREE.MathUtils.clamp(distance * 42, 900, 4200);
    const started = performance.now();
    let lastFrame = 0;

    return new Promise(resolve => {
      const animate = now => {
        if (token !== this.animationToken || !this.active) { resolve(false); return; }
        if (now - lastFrame < 32) { requestAnimationFrame(animate); return; }
        lastFrame = now;
        const progress = Math.min(1, (now - started) / duration);
        const eased = smootherStep(progress);
        this.distance = THREE.MathUtils.lerp(startDistance, stop.distance, eased);
        this.lateral = THREE.MathUtils.lerp(startLateral, 0, eased);
        this.headingOffset = THREE.MathUtils.lerp(startHeading, 0, eased);
        this.pitch = THREE.MathUtils.lerp(startPitch, 0, eased);
        this.applyPose();
        if (progress < 1) requestAnimationFrame(animate);
        else { this.onUpdate(this.snapshot(), stop); resolve(true); }
      };
      requestAnimationFrame(animate);
    });
  }

  cancelAutoWalk() {
    this.animationToken += 1;
  }

  nearestStop() {
    return this.stops.reduce((nearest, stop) => (
      !nearest || Math.abs(stop.distance - this.distance) < Math.abs(nearest.distance - this.distance) ? stop : nearest
    ), null);
  }

  snapshot() {
    return {
      progress: this.length ? this.distance / this.length : 0,
      nearestStop: this.nearestStop()
    };
  }

  emitUpdate() {
    this.onUpdate(this.snapshot());
  }
}
