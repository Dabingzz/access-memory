import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { analyzeRoadMedia } from './road-analyzer.js';
import { createDemoState, getSceneData, profiles, scenes } from './data.js';
import { FirstPersonExplorer } from './first-person-explorer.js';
import { getPreferencesFromUI, planAccessibleRoute } from './route-planner.js';
import { renderTopologyMap, SceneOverlay } from './scene-overlay.js';
import { addSkyEnvironment } from './sky-environment.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const requestedScene = new URLSearchParams(location.search).get('scene');
const activeScene = getSceneData(requestedScene);
const nodes = activeScene.nodes;
const facilities = activeScene.facilities;
const firstPersonAvailable = activeScene.exploration?.enabled !== false;
const state = createDemoState(activeScene.id);
const home = {
  position: new THREE.Vector3(...activeScene.home.position),
  target: new THREE.Vector3(...activeScene.home.target)
};
let overlay;
let toastTimer;
let selectedMedia = null;
let modeTransitionToken = 0;
let panelWasCollapsed = false;

const viewer = window.accessMemoryViewer = new GaussianSplats3D.Viewer({
  rootElement: $('#viewer-host'),
  cameraUp: [0, -1, 0],
  initialCameraPosition: home.position.toArray(),
  initialCameraLookAt: home.target.toArray(),
  sphericalHarmonicsDegree: 0,
  sharedMemoryForWorkers: false,
  renderMode: GaussianSplats3D.RenderMode.Always,
  sceneRevealMode: GaussianSplats3D.SceneRevealMode.Instant
});
addSkyEnvironment(viewer);
const explorer = new FirstPersonExplorer(viewer, activeScene, updateExploreUI);

function initializeControls() {
  $('#scene-data-label').textContent = activeScene.dataLabel;
  $('#roam-toggle').disabled = true;
  $('#roam-toggle').title = firstPersonAvailable ? '进入沿路第一视角' : '该场景近景重建密度不足，请使用快捷观察';
  scenes.forEach(scene => {
    $('#scene-select').add(new Option(scene.label, scene.id, scene.id === activeScene.id, scene.id === activeScene.id));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = scene.id === activeScene.id ? 'is-active' : '';
    button.innerHTML = `<b>${scene.number}</b><span>${scene.short}</span>`;
    button.setAttribute('aria-current', scene.id === activeScene.id ? 'page' : 'false');
    button.addEventListener('click', () => switchScene(scene.id));
    $('#scene-switcher').appendChild(button);
  });
  Object.values(nodes).filter(item => item.selectable).forEach(item => {
    $('#origin').add(new Option(item.label, item.id, item.id === state.origin, item.id === state.origin));
    $('#destination').add(new Option(item.label, item.id, item.id === state.destination, item.id === state.destination));
  });
  $('#origin').value = state.origin;
  $('#destination').value = state.destination;
  activeScene.viewpoints.forEach(viewpoint => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.viewpoint = viewpoint.key;
    button.innerHTML = `<kbd>${viewpoint.key}</kbd><span>${viewpoint.label}</span>`;
    button.addEventListener('click', () => focusViewpoint(viewpoint));
    $('#viewpoint-buttons').appendChild(button);
  });
  renderExplorationStops();

  $('#scene-select').addEventListener('change', event => switchScene(event.target.value));
  $('#reset-view').addEventListener('click', () => applyHome(true));
  $('#fullscreen').addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  $('#preference-toggle').addEventListener('click', () => { $('#preferences').hidden = !$('#preferences').hidden; });
  $('#plan-route').addEventListener('click', () => planRoute({ announce: true }));
  $('#origin').addEventListener('change', event => { state.origin = event.target.value; planRoute(); });
  $('#destination').addEventListener('change', event => { state.destination = event.target.value; planRoute(); });
  $$('.preferences input').forEach(input => input.addEventListener('change', () => planRoute()));
  $$('.profile-tabs button').forEach(button => button.addEventListener('click', () => selectProfile(button)));
  $$('.view-switch button').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  $('#care-toggle').addEventListener('click', toggleCareMode);
  $('#voice-toggle').addEventListener('click', toggleVoice);
  $('#start-navigation').addEventListener('click', startNavigation);
  $('#navigation-next').addEventListener('click', advanceNavigation);
  $$('.tool-rail button').forEach(button => button.addEventListener('click', () => openDrawer(button.dataset.tool)));
  $('#close-drawer').addEventListener('click', closeDrawer);
  $('#panel-toggle').addEventListener('click', toggleNavigationPanel);
  $('#roam-toggle').addEventListener('click', toggleFirstPersonMode);
  initializeKeyboardMovement();
  initializePointerLook();
}

function switchScene(sceneId) {
  if (sceneId === activeScene.id) return;
  const url = new URL(location.href); url.searchParams.set('scene', sceneId); location.href = url;
}

function selectProfile(button) {
  state.profile = button.dataset.profile;
  $$('.profile-tabs button').forEach(item => {
    const selected = item === button;
    item.classList.toggle('is-active', selected);
    item.setAttribute('aria-checked', String(selected));
  });
  planRoute({ announce: true });
}

async function applyHome(animated = false) {
  if (state.roamActive) {
    await exitFirstPersonMode({ returnHome: animated });
    return;
  }
  if (animated && overlay) overlay.flyTo(home.position.toArray(), home.target.toArray());
  else {
    viewer.camera.position.copy(home.position);
    viewer.controls.target.copy(home.target);
    viewer.camera.lookAt(home.target);
    viewer.controls.update();
  }
  setActiveViewpoint(null);
}

async function focusViewpoint(viewpoint) {
  if (state.roamActive) await exitFirstPersonMode({ returnHome: false });
  setView('3d');
  overlay?.focusViewpoint(viewpoint);
  setActiveViewpoint(viewpoint.key);
  showToast(`已定位：${viewpoint.label}`);
}

async function focusNode(nodeId) {
  if (state.roamActive) {
    if (!explorer.hasStop(nodeId)) {
      showToast('该地点不在当前第一视角探索道路上');
      return;
    }
    if (state.navigationActive) {
      await navigateToIndex(state.currentRoute.nodes.indexOf(nodeId));
      return;
    }
    const stop = explorer.stops.find(item => item.nodeId === nodeId);
    await explorer.walkTo(nodeId);
    showToast(`已沿道路到达：${stop.label}`);
    return;
  }
  setView('3d');
  overlay?.focusNode(nodeId);
  setActiveViewpoint(null);
  showToast(`已定位：${nodes[nodeId].label}`);
}

function setActiveViewpoint(key) {
  $$('[data-viewpoint]').forEach(button => button.classList.toggle('is-active', button.dataset.viewpoint === key));
}

function setView(view) {
  const is2d = view === '2d';
  $('#map-2d').classList.toggle('is-active', is2d);
  $('#map-2d').setAttribute('aria-hidden', String(!is2d));
  $('#poi-layer').style.visibility = is2d ? 'hidden' : 'visible';
  $$('.view-switch button').forEach(button => button.classList.toggle('is-active', button.dataset.view === view));
  if (is2d && state.roamActive) exitFirstPersonMode();
}

function planRoute({ announce = false, reroute = false } = {}) {
  const route = planAccessibleRoute({
    edges: state.edges, nodes, origin: state.origin, destination: state.destination,
    profileId: state.profile, preferences: getPreferencesFromUI()
  });
  if (!route) {
    state.currentRoute = null;
    $('#route-result').hidden = true;
    overlay?.render(state.edges, null);
    renderTopologyMap($('#topology-map'), state.edges, null, nodes, activeScene.short);
    showToast('当前通行条件下没有可达路线');
    return null;
  }
  state.currentRoute = route;
  renderRoute(route, reroute);
  overlay?.render(state.edges, route);
  renderTopologyMap($('#topology-map'), state.edges, route, nodes, activeScene.short);
  if (announce) speak(`已为${profiles[state.profile].label}用户规划路线，全程${route.length}米，预计${route.minutes}分钟。`);
  return route;
}

function renderRoute(route, reroute) {
  $('#route-result').hidden = false;
  $('#route-label').textContent = reroute ? '已自动改道' : `${profiles[state.profile].label}推荐路线`;
  $('#route-distance').textContent = `${route.length} m`;
  $('#route-eta').textContent = route.minutes;
  $('#route-tags').innerHTML = route.tags.map(tag => `<span class="${tag.warn ? 'warn' : ''}">${tag.text}</span>`).join('');
  $('#route-steps').innerHTML = route.steps.map(step => `<li>${step.instruction}<small>${step.distance}</small></li>`).join('');
  $('#last-meter-text').textContent = route.lastMeter;
}

async function startNavigation(event) {
  if (state.navigationActive) {
    await stopNavigation();
    return;
  }
  if (!state.currentRoute) planRoute();
  if (!state.currentRoute || !state.currentRoute.steps.length) return;
  const route = state.currentRoute;
  explorer.configurePath(route.nodes, route.nodes[0], buildNavigationStops(route));
  state.navigationActive = true;
  state.navigationIndex = 0;
  state.navigationMoving = false;
  renderExplorationStops();
  event.currentTarget.dataset.active = 'true';
  event.currentTarget.textContent = '导航中 · 点击结束';
  state.voiceEnabled = true;
  $('#voice-toggle').setAttribute('aria-pressed', 'true');
  const entered = await enterFirstPersonMode({ allowUnavailable: true });
  if (!entered || !state.navigationActive) {
    resetNavigationSession();
    return;
  }
  updateNavigationUI();
  const first = route.steps[0];
  speak(`导航开始，当前位置${nodes[route.nodes[0]].short}。${first.instruction}，继续前行${first.distance}。`);
  showToast(`已切换到导航起点：${nodes[route.nodes[0]].short}`);
}

function buildNavigationStops(route) {
  return route.nodes.map((nodeId, index) => {
    const roadStatus = route.edges[index - 1]?.status;
    return {
      nodeId,
      label: nodes[nodeId].short,
      status: roadStatus === 'CAUTION' || roadStatus === 'UNKNOWN' ? 'caution' : 'open',
      detail: index === 0 ? '导航起点' : `${route.steps[index - 1].instruction} · ${route.steps[index - 1].distance}`
    };
  });
}

async function advanceNavigation() {
  if (!state.navigationActive || state.navigationMoving) return;
  await navigateToIndex(state.navigationIndex + 1);
}

async function navigateToIndex(index) {
  const route = state.currentRoute;
  if (state.navigationMoving || !route || index < 0 || index >= route.nodes.length || index === state.navigationIndex) return;
  state.navigationMoving = true;
  const nextButton = $('#navigation-next');
  nextButton.disabled = true;
  $('#navigation-next-label').textContent = `前往${nodes[route.nodes[index]].short}…`;
  const arrived = await explorer.walkTo(route.nodes[index]);
  state.navigationMoving = false;
  if (!arrived || !state.navigationActive) {
    updateNavigationUI();
    return;
  }
  state.navigationIndex = index;
  updateNavigationUI();
  const current = nodes[route.nodes[index]];
  if (index === route.nodes.length - 1) {
    speak(`已到达${current.label}。${route.lastMeter}`);
    showToast(`已到达终点：${current.short}`);
    return;
  }
  const nextStep = route.steps[index];
  speak(`已到达${current.short}。${nextStep.instruction}，继续前行${nextStep.distance}。`);
  showToast(`已到达${current.short}，可继续前往下一节点`);
}

function updateNavigationUI() {
  if (!state.navigationActive || !state.currentRoute) return;
  const route = state.currentRoute;
  const index = state.navigationIndex;
  const current = nodes[route.nodes[index]];
  const finished = index >= route.nodes.length - 1;
  $('#explore-current').textContent = current.short;
  $('#explore-detail').textContent = finished
    ? `已到达 · ${route.lastMeter}`
    : `节点 ${index + 1}/${route.nodes.length} · 下一段 ${route.steps[index].distance}`;
  $$('[data-explore-node]').forEach(button => {
    button.classList.toggle('is-active', button.dataset.exploreNode === route.nodes[index]);
  });
  const nextButton = $('#navigation-next');
  nextButton.hidden = false;
  nextButton.disabled = finished || state.navigationMoving;
  nextButton.classList.toggle('is-complete', finished);
  $('#navigation-next-label').textContent = finished ? '已到达终点' : `前往${nodes[route.nodes[index + 1]].short}`;
}

function resetNavigationSession() {
  state.navigationActive = false;
  state.navigationIndex = 0;
  state.navigationMoving = false;
  const startButton = $('#start-navigation');
  startButton.dataset.active = 'false';
  startButton.textContent = '开始导航与语音指引';
  const nextButton = $('#navigation-next');
  nextButton.hidden = true;
  nextButton.disabled = false;
  nextButton.classList.remove('is-complete');
}

async function stopNavigation() {
  resetNavigationSession();
  window.speechSynthesis?.cancel();
  if (state.roamActive) await exitFirstPersonMode();
  else {
    explorer.resetPath();
    renderExplorationStops();
  }
  showToast('导航已结束');
}

function toggleCareMode(event) {
  const enabled = !document.body.classList.contains('care-mode');
  document.body.classList.toggle('care-mode', enabled);
  event.currentTarget.setAttribute('aria-pressed', String(enabled));
  showToast(enabled ? '已开启大字高对比关怀模式' : '已关闭关怀模式');
}

function toggleVoice(event) {
  state.voiceEnabled = !state.voiceEnabled;
  event.currentTarget.setAttribute('aria-pressed', String(state.voiceEnabled));
  event.currentTarget.title = state.voiceEnabled ? '关闭语音播报' : '开启语音播报';
  if (state.voiceEnabled) speak(`语音播报已开启。当前场景为${activeScene.label}。`);
  else window.speechSynthesis?.cancel();
}

function toggleNavigationPanel() {
  const collapsed = $('#app').classList.toggle('panel-collapsed');
  $('#panel-toggle').textContent = collapsed ? '›' : '‹';
  $('#panel-toggle').title = collapsed ? '展开路线面板' : '收起路线面板';
}

function renderExplorationStops() {
  $('#explore-stops').innerHTML = explorer.stops.map(stop => `
    <button type="button" data-explore-node="${stop.nodeId}" data-status="${stop.status}" title="${stop.detail}">
      <i></i><span>${stop.label}</span>
    </button>`).join('');
  $$('[data-explore-node]').forEach(button => button.addEventListener('click', async () => {
    const stop = explorer.stops.find(item => item.nodeId === button.dataset.exploreNode);
    if (state.navigationActive) {
      await navigateToIndex(state.currentRoute.nodes.indexOf(stop.nodeId));
    } else {
      await explorer.walkTo(stop.nodeId);
      showToast(`已沿道路到达：${stop.label}`);
    }
  }));
}

function updateExploreUI(snapshot, arrivedStop = null) {
  $('#explore-progress').style.width = `${Math.round(snapshot.progress * 100)}%`;
  if (state.navigationActive) return;
  const stop = arrivedStop || snapshot.nearestStop;
  if (stop) {
    $('#explore-current').textContent = stop.label;
    $('#explore-detail').textContent = stop.detail;
  }
  $$('[data-explore-node]').forEach(button => {
    button.classList.toggle('is-active', button.dataset.exploreNode === stop?.nodeId);
  });
}

function setFirstPersonUI(active) {
  $('#app').classList.toggle('roam-mode', active);
  $('#app').classList.toggle('first-person-mode', active);
  $('#roam-toggle').disabled = active ? false : !firstPersonAvailable;
  $('#roam-toggle').setAttribute('aria-pressed', String(active));
  $('#roam-toggle').textContent = active ? '退出第一视角' : '第一视角';
  $('#roam-hud').setAttribute('aria-hidden', String(!active));
  $('#crosshair').setAttribute('aria-hidden', String(!active));
  $('#explore-route').setAttribute('aria-hidden', String(!active));
  $('#control-hint').textContent = active ? '第一视角 · 沿已核验道路探索' : 'WASD 移动 · 鼠标观察';
}

async function enterFirstPersonMode({ allowUnavailable = false } = {}) {
  if (!firstPersonAvailable && !allowUnavailable) { showToast('该场景请使用快捷观察，第一视角已用于两条清晰室外道路'); return false; }
  if (!overlay) return false;
  const token = ++modeTransitionToken;
  setView('3d');
  closeDrawer();
  if (!state.roamActive) {
    panelWasCollapsed = $('#app').classList.contains('panel-collapsed');
    state.roamActive = true;
    setFirstPersonUI(true);
    $('#app').classList.add('panel-collapsed');
    $('#panel-toggle').textContent = '›';
  } else {
    explorer.deactivate();
  }
  viewer.controls.enabled = false;
  viewer.splatMesh.setSplatScale(activeScene.exploration.splatScale || activeScene.splatScale || 1);
  overlay.setExplorationMode(true, explorer.stops);
  const pose = explorer.startPose();
  updateExploreUI(explorer.snapshot());
  await overlay.flyTo(pose.position.toArray(), pose.target.toArray(), 1350);
  if (token !== modeTransitionToken || !state.roamActive) return false;
  explorer.activate();
  if (!state.navigationActive) showToast(`已进入${activeScene.exploration.label}`);
  return true;
}

async function exitFirstPersonMode({ returnHome = true } = {}) {
  if (!state.roamActive) return;
  const token = ++modeTransitionToken;
  if (state.navigationActive) resetNavigationSession();
  state.roamActive = false;
  explorer.deactivate();
  explorer.resetPath();
  renderExplorationStops();
  if (document.pointerLockElement) document.exitPointerLock();
  setFirstPersonUI(false);
  overlay?.setExplorationMode(false);
  viewer.splatMesh.setSplatScale(activeScene.splatScale || 1);
  viewer.controls.enabled = false;
  if (returnHome && overlay) await overlay.flyTo(home.position.toArray(), home.target.toArray(), 1350);
  if (token !== modeTransitionToken) return;
  viewer.controls.enabled = true;
  if (!panelWasCollapsed) $('#app').classList.remove('panel-collapsed');
  $('#panel-toggle').textContent = $('#app').classList.contains('panel-collapsed') ? '›' : '‹';
}

function toggleFirstPersonMode() {
  if (state.roamActive) {
    if (state.navigationActive) stopNavigation();
    else exitFirstPersonMode();
  } else {
    explorer.resetPath();
    renderExplorationStops();
    enterFirstPersonMode();
  }
}

function initializePointerLook() {
  viewer.renderer.domElement.addEventListener('click', () => {
    if (state.roamActive && document.pointerLockElement !== viewer.renderer.domElement) viewer.renderer.domElement.requestPointerLock();
  });
  document.addEventListener('mousemove', event => {
    if (!state.roamActive || document.pointerLockElement !== viewer.renderer.domElement) return;
    explorer.look(event.movementX, event.movementY);
  });
}

function openDrawer(tool) {
  const metadata = {
    facilities: ['ACCESSIBLE FACILITIES', '当前场景可达设施'],
    analyze: ['GO ULTRA / VISION AI', '出行影像分析'],
    report: ['COMMUNITY UPDATE', '上报道路情况'],
    inspection: ['SCENE INSPECTION', '无障碍风险巡检']
  };
  $('#drawer-kicker').textContent = metadata[tool][0]; $('#drawer-title').textContent = metadata[tool][1];
  $$('.tool-rail button').forEach(button => button.classList.toggle('is-active', button.dataset.tool === tool));
  if (tool === 'facilities') renderFacilities();
  if (tool === 'analyze') renderAnalyzer();
  if (tool === 'report') renderReport();
  if (tool === 'inspection') renderInspection();
  $('#tool-drawer').classList.add('is-open'); $('#tool-drawer').setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  $('#tool-drawer').classList.remove('is-open'); $('#tool-drawer').setAttribute('aria-hidden', 'true');
  $$('.tool-rail button').forEach(button => button.classList.remove('is-active'));
}

function routeTo(nodeId) {
  return planAccessibleRoute({
    edges: state.edges, nodes, origin: state.origin, destination: nodeId,
    profileId: state.profile, preferences: getPreferencesFromUI()
  });
}

function renderFacilities() {
  const results = facilities.map(item => ({ ...item, route: routeTo(item.nodeId) }));
  const reachable = results.filter(item => item.route && item.status !== 'BLOCKED').length;
  $('#drawer-content').innerHTML = `<div class="facility-summary"><b>${reachable}</b><span>处设施从当前起点可达 · 共识别 ${facilities.length} 处</span></div><div class="facility-list">${results.map(item => {
    const target = nodes[item.nodeId];
    const stateText = !item.route ? '当前不可达' : item.status === 'UNKNOWN' ? '待核验' : `${item.route.length} m 可达`;
    return `<article class="facility-item ${item.status === 'UNKNOWN' ? 'is-unknown' : ''}"><span class="facility-icon">${item.type}</span><div><strong>${target.label}</strong><small>${stateText} · ${item.detail}</small></div><button type="button" data-focus="${item.nodeId}">定位</button></article>`;
  }).join('')}</div>`;
  $$('[data-focus]').forEach(button => button.addEventListener('click', () => { focusNode(button.dataset.focus); closeDrawer(); }));
}

function renderAnalyzer() {
  const sourceName = escapeHtml(selectedMedia?.name || `GX_0923_${activeScene.number}.mp4`);
  $('#drawer-content').innerHTML = `<div class="capture-source"><span>GO ULTRA / 最近同步</span><strong>${sourceName}</strong><small>${activeScene.analysis.place} · 00:18</small></div><div class="media-frame"><div class="scan-line"></div><span>${activeScene.short}第一人称关键帧</span><b>10:26:08</b></div><div class="analysis-progress" id="analysis-progress" hidden><span id="analysis-stage">准备分析</span><b id="analysis-percent">0%</b><i><em id="analysis-bar"></em></i></div><div class="analysis-result" id="analysis-result" hidden></div><input id="media-input" type="file" accept="image/*,video/*" hidden><button class="drawer-primary" id="run-analysis" type="button">分析这段出行影像</button><button class="drawer-secondary" id="choose-media" type="button">选择其他图片或视频</button>`;
  $('#choose-media').addEventListener('click', () => $('#media-input').click());
  $('#media-input').addEventListener('change', event => { selectedMedia = event.target.files[0]; if (selectedMedia) renderAnalyzer(); });
  $('#run-analysis').addEventListener('click', runAnalysis);
  if (state.analysisResult) showAnalysisResult(state.analysisResult);
}

async function runAnalysis() {
  $('#analysis-progress').hidden = false; $('#run-analysis').disabled = true; $('#run-analysis').textContent = 'AI 正在分析';
  const result = await analyzeRoadMedia(selectedMedia, state.profile, activeScene.analysis, stage => {
    $('#analysis-stage').textContent = stage.label; $('#analysis-percent').textContent = `${stage.percent}%`; $('#analysis-bar').style.width = `${stage.percent}%`;
  });
  state.analysisResult = result;
  showAnalysisResult(result);
  applyRoadAnalysis(result);
}

function showAnalysisResult(result) {
  const element = $('#analysis-result'); if (!element) return;
  element.hidden = false; element.innerHTML = `<b>暂不可通行 · 置信度 ${Math.round(result.confidence * 100)}%</b><span>${result.reason}</span>`;
  if ($('#run-analysis')) { $('#run-analysis').disabled = true; $('#run-analysis').textContent = '已更新道路状态'; }
}

function applyRoadAnalysis(result) {
  const road = state.edges.find(item => item.id === result.edgeId);
  if (!road) return;
  road.status = result.status; road.updatedAt = result.observedAt; road.source = result.source; road.reason = result.reason;
  state.analyzed = true;
  if (!state.risks.some(item => item.id === `risk-ai-${activeScene.id}`)) state.risks.unshift({ id: `risk-ai-${activeScene.id}`, edgeId: result.edgeId, level: 'HIGH', place: result.place, issue: result.reason, time: result.observedAt, source: result.source });
  updateRiskCount(); overlay?.render(state.edges, state.currentRoute);
  renderTopologyMap($('#topology-map'), state.edges, state.currentRoute, nodes, activeScene.short);
  $('#data-time').textContent = '10:26 更新';
  showRoadAlert('检测到新的通行障碍', `${result.place}已更新为阻断，正在计算替代路线。`);
  speak(`注意，${result.place}检测到新的通行障碍，原路线已失效，正在为您重新规划。`);
  setTimeout(() => {
    const route = planRoute({ reroute: true });
    if (!route) return;
    showRoadAlert('已自动切换路线', `新路线 ${route.length} 米，全程无台阶，已避开${result.place}。`);
    speak(`已完成改道。新路线全程${route.length}米，已避开阻断路段。`);
  }, 750);
}

function renderReport() {
  const options = state.edges.map(item => `<option value="${item.id}">${item.label}</option>`).join('');
  $('#drawer-content').innerHTML = `<form class="report-form" id="report-form"><label>问题位置<select id="report-road">${options}</select></label><label>通行情况<select id="report-status"><option value="BLOCKED">无法通行</option><option value="CAUTION">有障碍但可通行</option><option value="OPEN">已经恢复通行</option></select></label><label>现场描述<textarea id="report-note" rows="3" placeholder="例如：坡道被车辆占用"></textarea></label><label class="upload-row" for="report-media"><span>添加现场证据</span><b id="report-file-name">照片或视频</b><input id="report-media" type="file" accept="image/*,video/*" hidden></label><button class="drawer-primary" type="submit">提交并更新地图</button></form>`;
  $('#report-media').addEventListener('change', event => { $('#report-file-name').textContent = event.target.files[0]?.name || '照片或视频'; });
  $('#report-form').addEventListener('submit', event => {
    event.preventDefault();
    const edgeId = $('#report-road').value; const status = $('#report-status').value;
    const note = $('#report-note').value.trim() || '用户反馈现场通行状态变化';
    const road = state.edges.find(item => item.id === edgeId);
    road.status = status; road.reason = note; road.updatedAt = '刚刚'; road.source = '用户主动上报';
    if (status !== 'OPEN') state.risks.unshift({ id: `report-${Date.now()}`, edgeId, level: status === 'BLOCKED' ? 'HIGH' : 'MEDIUM', place: road.label, issue: note, time: '刚刚', source: '用户主动上报' });
    updateRiskCount(); planRoute({ reroute: true }); closeDrawer(); showToast('上报成功，当前场景路网已更新');
  });
}

function renderInspection() {
  const high = state.risks.filter(item => item.level === 'HIGH').length;
  $('#drawer-content').innerHTML = `<div class="inspection-metrics"><div><b>${state.risks.length}</b><span>当前风险</span></div><div><b>${high}</b><span>高优先级</span></div><div><b>${facilities.length}</b><span>设施点位</span></div></div><div class="risk-list">${state.risks.map(item => `<article class="risk-item"><header><b>${item.place}</b><span class="risk-level ${item.level.toLowerCase()}">${item.level}</span></header><p>${item.issue}</p><small>${item.time} · ${item.source}</small></article>`).join('')}</div><button class="drawer-secondary" id="export-report" type="button">导出本场景巡检摘要</button>`;
  $('#export-report').addEventListener('click', exportInspection);
}

function exportInspection() {
  const content = [`AccessMemory ${activeScene.label}无障碍巡检摘要`, '生成时间：2026-09-23', '', ...state.risks.map((item, index) => `${index + 1}. [${item.level}] ${item.place}\n${item.issue}\n${item.time} · ${item.source}`)].join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  link.download = `AccessMemory-${activeScene.short}-巡检摘要.txt`; link.click(); URL.revokeObjectURL(link.href);
  showToast('本场景巡检摘要已导出');
}

function initializeKeyboardMovement() {
  const pressed = new Set();
  const movementKeys = ['w', 'a', 's', 'd', 'q', 'e', 'shift'];
  addEventListener('keydown', event => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    const key = event.key.toLowerCase();
    if (movementKeys.includes(key)) { pressed.add(key); event.preventDefault(); }
    if (/^[1-4]$/.test(key)) focusViewpoint(activeScene.viewpoints[Number(key) - 1]);
    if (key === 'r') applyHome(true);
    if (key === 'm') toggleFirstPersonMode();
  });
  addEventListener('keyup', event => pressed.delete(event.key.toLowerCase()));
  addEventListener('blur', () => pressed.clear());
  const forward = new THREE.Vector3(); const right = new THREE.Vector3(); const movement = new THREE.Vector3(); const up = new THREE.Vector3(0, -1, 0);
  let previous = performance.now();
  const tick = now => {
    const delta = Math.min(0.05, (now - previous) / 1000); previous = now;
    if (pressed.size && viewer.camera && viewer.controls) {
      if (state.roamActive) {
        const forwardInput = Number(pressed.has('w')) - Number(pressed.has('s'));
        const sidewaysInput = Number(pressed.has('d')) - Number(pressed.has('a'));
        explorer.move(forwardInput, sidewaysInput, delta, pressed.has('shift'));
        requestAnimationFrame(tick);
        return;
      }
      viewer.camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
      right.crossVectors(forward, up).normalize(); movement.set(0, 0, 0);
      if (pressed.has('w')) movement.add(forward); if (pressed.has('s')) movement.sub(forward);
      if (pressed.has('d')) movement.add(right); if (pressed.has('a')) movement.sub(right);
      if (pressed.has('e')) movement.add(up); if (pressed.has('q')) movement.sub(up);
      if (movement.lengthSq()) {
        overlay?.cancelCameraAnimation();
        const speed = activeScene.movementSpeed * (pressed.has('shift') ? 3 : 1) * delta * 60;
        movement.normalize().multiplyScalar(speed);
        viewer.camera.position.add(movement); viewer.controls.target.add(movement);
        viewer.controls.update();
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function updateRiskCount() { $('#risk-count').textContent = state.risks.length; }
function showRoadAlert(title, message) {
  $('#alert-title').textContent = title; $('#alert-message').textContent = message; $('#road-alert').hidden = false;
  clearTimeout(showRoadAlert.timer); showRoadAlert.timer = setTimeout(() => { $('#road-alert').hidden = true; }, 4200);
}
function showToast(message) {
  $('#toast').textContent = message; $('#toast').classList.add('is-visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 2400);
}
function speak(text) {
  if (!state.voiceEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN'; utterance.rate = 0.94; window.speechSynthesis.speak(utterance);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

async function loadScene() {
  try {
    await viewer.addSplatScene(encodeURI(activeScene.file), { progressiveLoad: false, showLoadingUI: false });
    viewer.splatMesh.setSplatScale(activeScene.splatScale || 1);
    viewer.renderer.setClearColor(0x91c9e8, 1); applyHome(); viewer.start();
    viewer.controls.enableDamping = true;
    viewer.controls.dampingFactor = 0.08;
    viewer.controls.rotateSpeed = 0.55;
    viewer.controls.zoomSpeed = 0.7;
    overlay = new SceneOverlay(viewer, $('#poi-layer'), activeScene, focusNode);
    overlay.configure(); planRoute(); updateRiskCount();
    $('#roam-toggle').disabled = !firstPersonAvailable;
    setTimeout(() => $('#loading').classList.add('is-hidden'), 350);
  } catch (error) {
    console.error(error); $('#loading-message').textContent = '场景载入失败，请从仓库根目录启动本地服务器';
  }
}

initializeControls();
renderTopologyMap($('#topology-map'), state.edges, null, nodes, activeScene.short);
loadScene();
