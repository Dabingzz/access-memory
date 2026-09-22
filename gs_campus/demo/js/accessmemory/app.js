import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { analyzeRoadMedia } from './road-analyzer.js';
import { createDemoState, facilities, nodes, profiles, scenes } from './data.js';
import { getPreferencesFromUI, planAccessibleRoute } from './route-planner.js';
import { renderTopologyMap, SceneOverlay } from './scene-overlay.js';

const state = createDemoState();
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const params = new URLSearchParams(location.search);
const activeScene = scenes.find(item => item.id === params.get('scene')) || scenes[0];
const home = { position: new THREE.Vector3(180, -110, 180), target: new THREE.Vector3(), radius: 100 };
let overlay;
let toastTimer;
let selectedMedia = null;

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

function initializeControls() {
  scenes.forEach(scene => $('#scene-select').add(new Option(scene.label, scene.id, scene.id === activeScene.id, scene.id === activeScene.id)));
  const selectable = Object.values(nodes).filter(node => node.selectable);
  selectable.forEach(node => {
    $('#origin').add(new Option(node.label, node.id, node.id === state.origin, node.id === state.origin));
    $('#destination').add(new Option(node.label, node.id, node.id === state.destination, node.id === state.destination));
  });
  $('#origin').value = state.origin;
  $('#destination').value = state.destination;

  $('#scene-select').addEventListener('change', event => {
    const url = new URL(location.href); url.searchParams.set('scene', event.target.value); location.href = url;
  });
  $('#reset-view').addEventListener('click', applyHome);
  $('#fullscreen').addEventListener('click', () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  $('#preference-toggle').addEventListener('click', () => { $('#preferences').hidden = !$('#preferences').hidden; });
  $('#plan-route').addEventListener('click', () => planRoute({ announce: true }));
  $('#origin').addEventListener('change', event => { state.origin = event.target.value; planRoute(); });
  $('#destination').addEventListener('change', event => { state.destination = event.target.value; planRoute(); });
  $$('.preferences input').forEach(input => input.addEventListener('change', () => planRoute()));

  $$('.profile-tabs button').forEach(button => button.addEventListener('click', () => {
    state.profile = button.dataset.profile;
    $$('.profile-tabs button').forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-checked', String(selected));
    });
    planRoute({ announce: true });
  }));

  $$('.view-switch button').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  $('#care-toggle').addEventListener('click', event => {
    const enabled = !document.body.classList.contains('care-mode');
    document.body.classList.toggle('care-mode', enabled);
    event.currentTarget.setAttribute('aria-pressed', String(enabled));
    showToast(enabled ? '已开启大字高对比关怀模式' : '已关闭关怀模式');
  });
  $('#voice-toggle').addEventListener('click', event => {
    state.voiceEnabled = !state.voiceEnabled;
    event.currentTarget.setAttribute('aria-pressed', String(state.voiceEnabled));
    event.currentTarget.title = state.voiceEnabled ? '关闭语音播报' : '开启语音播报';
    if (state.voiceEnabled) speak('语音播报已开启。当前为栖霞园区无障碍地图。');
    else window.speechSynthesis?.cancel();
  });
  $('#start-navigation').addEventListener('click', startNavigation);
  $$('.tool-rail button').forEach(button => button.addEventListener('click', () => openDrawer(button.dataset.tool)));
  $('#close-drawer').addEventListener('click', closeDrawer);
  initializeKeyboardMovement();
}

function applyHome() {
  viewer.camera.position.copy(home.position);
  viewer.controls.target.copy(home.target);
  viewer.camera.lookAt(home.target);
  viewer.controls.update();
}

function setView(view) {
  const is2d = view === '2d';
  $('#map-2d').classList.toggle('is-active', is2d);
  $('#map-2d').setAttribute('aria-hidden', String(!is2d));
  $('#poi-layer').style.visibility = is2d ? 'hidden' : 'visible';
  $$('.view-switch button').forEach(button => button.classList.toggle('is-active', button.dataset.view === view));
}

function planRoute({ announce = false, reroute = false } = {}) {
  const route = planAccessibleRoute({
    edges: state.edges, origin: state.origin, destination: state.destination,
    profileId: state.profile, preferences: getPreferencesFromUI()
  });
  if (!route) { showToast('当前通行条件下没有可达路线'); return; }
  state.currentRoute = route;
  renderRoute(route, reroute);
  overlay?.render(state.edges, route);
  renderTopologyMap($('#topology-map'), state.edges, route);
  if (announce) speak(`已为${profiles[state.profile].label}用户规划路线，全程${route.length}米，预计${route.minutes}分钟。`);
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

function startNavigation(event) {
  if (!state.currentRoute) planRoute();
  const active = event.currentTarget.dataset.active === 'true';
  event.currentTarget.dataset.active = String(!active);
  event.currentTarget.textContent = active ? '开始导航与语音指引' : '导航中 · 点击结束';
  if (!active) {
    state.voiceEnabled = true;
    $('#voice-toggle').setAttribute('aria-pressed', 'true');
    const first = state.currentRoute.steps[0];
    speak(`导航开始。${first.instruction}，继续前行${first.distance}。`);
    showToast('导航已开始，已启用语音指引');
  } else {
    window.speechSynthesis?.cancel(); showToast('导航已结束');
  }
}

function openDrawer(tool) {
  const metadata = {
    facilities: ['ACCESSIBLE FACILITIES', '附近可达设施'],
    analyze: ['GO ULTRA / VISION AI', '出行影像分析'],
    report: ['COMMUNITY UPDATE', '上报道路情况'],
    inspection: ['PARK INSPECTION', '无障碍风险巡检']
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

function renderFacilities() {
  $('#drawer-content').innerHTML = `<div class="facility-summary"><b>${facilities.length}</b><span>处设施当前可达</span></div><div class="facility-list">${facilities.map(item => `<article class="facility-item"><span class="facility-icon">${item.type}</span><div><strong>${nodes[item.nodeId].label}</strong><small>${item.distance} · ${item.detail}</small></div><button type="button" data-focus="${item.nodeId}">查看</button></article>`).join('')}</div>`;
  $$('[data-focus]').forEach(button => button.addEventListener('click', () => {
    setView('3d'); overlay?.focusNode(button.dataset.focus); closeDrawer(); showToast(`已定位：${nodes[button.dataset.focus].label}`);
  }));
}

function renderAnalyzer() {
  $('#drawer-content').innerHTML = `<div class="capture-source"><span>GO ULTRA / 最近同步</span><strong>${selectedMedia?.name || 'GX_0922_1724.mp4'}</strong><small>西侧景观通道 · 00:18</small></div><div class="media-frame"><div class="scan-line"></div><span>第一人称影像关键帧</span><b>17:24:08</b></div><div class="analysis-progress" id="analysis-progress" hidden><span id="analysis-stage">准备分析</span><b id="analysis-percent">0%</b><i><em id="analysis-bar"></em></i></div><div class="analysis-result" id="analysis-result" hidden></div><input id="media-input" type="file" accept="image/*,video/*" hidden><button class="drawer-primary" id="run-analysis" type="button">分析这段出行影像</button><button class="drawer-secondary" id="choose-media" type="button">选择其他图片或视频</button>`;
  $('#choose-media').addEventListener('click', () => $('#media-input').click());
  $('#media-input').addEventListener('change', event => { selectedMedia = event.target.files[0]; if (selectedMedia) renderAnalyzer(); });
  $('#run-analysis').addEventListener('click', runAnalysis);
  if (state.analyzed) showAnalysisResult({ confidence: .96, reason: '检测到施工围挡占据主要轮椅通行区域' });
}

async function runAnalysis() {
  $('#analysis-progress').hidden = false; $('#run-analysis').disabled = true; $('#run-analysis').textContent = 'AI 正在分析';
  const result = await analyzeRoadMedia(selectedMedia, state.profile, stage => {
    $('#analysis-stage').textContent = stage.label; $('#analysis-percent').textContent = `${stage.percent}%`; $('#analysis-bar').style.width = `${stage.percent}%`;
  });
  showAnalysisResult(result);
  applyRoadAnalysis(result);
}

function showAnalysisResult(result) {
  const element = $('#analysis-result'); if (!element) return;
  element.hidden = false; element.innerHTML = `<b>暂不可通行 · 置信度 ${Math.round(result.confidence * 100)}%</b><span>${result.reason}</span>`;
  if ($('#run-analysis')) { $('#run-analysis').disabled = true; $('#run-analysis').textContent = '已更新道路状态'; }
}

function applyRoadAnalysis(result) {
  const road = state.edges.find(edge => edge.id === result.edgeId);
  road.status = result.status; road.updatedAt = result.observedAt; road.source = result.source; road.reason = result.reason;
  state.analyzed = true;
  if (!state.risks.some(risk => risk.id === 'risk-ai-block')) state.risks.unshift({ id: 'risk-ai-block', edgeId: result.edgeId, level: 'HIGH', place: '道路 B · 西侧通道', issue: result.reason, time: result.observedAt, source: result.source });
  updateRiskCount(); overlay?.render(state.edges, state.currentRoute); renderTopologyMap($('#topology-map'), state.edges, state.currentRoute);
  $('#data-time').textContent = '17:24 更新';
  showRoadAlert('检测到施工围挡', '道路 B 已更新为阻断，正在计算可通行替代路线。');
  speak('注意，前方道路检测到施工围挡，原路线已失效，正在为您重新规划。');
  setTimeout(() => {
    planRoute({ reroute: true });
    showRoadAlert('已自动切换路线', '新路线 520 米，经道路 C、道路 D 绕行，全程无台阶。');
    speak('已完成改道。新路线全程五百二十米，经湖边缓坡和会场东侧入口。');
  }, 750);
}

function renderReport() {
  $('#drawer-content').innerHTML = `<form class="report-form" id="report-form"><label>问题位置<select id="report-road"><option value="a-b">道路 B · 西侧通道</option><option value="c-d">湖边连接路</option><option value="d-venue">会场东侧入口</option></select></label><label>通行情况<select id="report-status"><option value="BLOCKED">无法通行</option><option value="CAUTION">有障碍但可通行</option><option value="OPEN">已经恢复通行</option></select></label><label>现场描述<textarea id="report-note" rows="3" placeholder="例如：坡道被车辆占用"></textarea></label><label class="upload-row" for="report-media"><span>添加现场证据</span><b id="report-file-name">照片或视频</b><input id="report-media" type="file" accept="image/*,video/*" hidden></label><button class="drawer-primary" type="submit">提交并更新地图</button></form>`;
  $('#report-media').addEventListener('change', event => { $('#report-file-name').textContent = event.target.files[0]?.name || '照片或视频'; });
  $('#report-form').addEventListener('submit', event => {
    event.preventDefault();
    const edgeId = $('#report-road').value; const status = $('#report-status').value; const note = $('#report-note').value.trim() || '用户反馈现场通行状态变化';
    const road = state.edges.find(edge => edge.id === edgeId); road.status = status; road.reason = note; road.updatedAt = '刚刚'; road.source = '用户主动上报';
    if (status !== 'OPEN') state.risks.unshift({ id: `report-${Date.now()}`, edgeId, level: status === 'BLOCKED' ? 'HIGH' : 'MEDIUM', place: road.label, issue: note, time: '刚刚', source: '用户主动上报' });
    updateRiskCount(); planRoute({ reroute: true }); closeDrawer(); showToast('上报成功，地图与后续路线已更新');
  });
}

function renderInspection() {
  const high = state.risks.filter(risk => risk.level === 'HIGH').length;
  $('#drawer-content').innerHTML = `<div class="inspection-metrics"><div><b>${state.risks.length}</b><span>当前风险</span></div><div><b>${high}</b><span>高优先级</span></div><div><b>92%</b><span>道路已核验</span></div></div><div class="risk-list">${state.risks.map(risk => `<article class="risk-item"><header><b>${risk.place}</b><span class="risk-level ${risk.level.toLowerCase()}">${risk.level}</span></header><p>${risk.issue}</p><small>${risk.time} · ${risk.source}</small></article>`).join('')}</div><button class="drawer-secondary" id="export-report" type="button">导出本次巡检摘要</button>`;
  $('#export-report').addEventListener('click', exportInspection);
}

function exportInspection() {
  const content = ['AccessMemory 栖霞园区无障碍巡检摘要', '生成时间：2026-09-22', '', ...state.risks.map((risk, index) => `${index + 1}. [${risk.level}] ${risk.place}\n${risk.issue}\n${risk.time} · ${risk.source}`)].join('\n');
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' })); link.download = 'AccessMemory-栖霞园区巡检摘要.txt'; link.click(); URL.revokeObjectURL(link.href); showToast('巡检摘要已导出');
}

function updateRiskCount() { $('#risk-count').textContent = state.risks.length; }
function showRoadAlert(title, message) {
  $('#alert-title').textContent = title; $('#alert-message').textContent = message; $('#road-alert').hidden = false;
  clearTimeout(showRoadAlert.timer); showRoadAlert.timer = setTimeout(() => { $('#road-alert').hidden = true; }, 4200);
}
function showToast(message) { $('#toast').textContent = message; $('#toast').classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 2400); }
function speak(text) { if (!state.voiceEnabled || !('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'zh-CN'; utterance.rate = .94; window.speechSynthesis.speak(utterance); }

function initializeKeyboardMovement() {
  const pressed = new Set();
  addEventListener('keydown', event => { if (!/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) && ['w','a','s','d'].includes(event.key.toLowerCase())) pressed.add(event.key.toLowerCase()); });
  addEventListener('keyup', event => pressed.delete(event.key.toLowerCase()));
  const forward = new THREE.Vector3(); const right = new THREE.Vector3(); const movement = new THREE.Vector3(); const up = new THREE.Vector3(0, -1, 0);
  const tick = () => {
    if (pressed.size && viewer.camera && viewer.controls) {
      viewer.camera.getWorldDirection(forward); forward.y = 0; forward.normalize(); right.crossVectors(forward, up).normalize(); movement.set(0, 0, 0);
      if (pressed.has('w')) movement.add(forward); if (pressed.has('s')) movement.sub(forward); if (pressed.has('d')) movement.add(right); if (pressed.has('a')) movement.sub(right);
      if (movement.lengthSq()) { movement.normalize().multiplyScalar(home.radius * .006); viewer.camera.position.add(movement); viewer.controls.target.add(movement); viewer.controls.update(); }
    }
    requestAnimationFrame(tick);
  }; tick();
}

async function loadScene() {
  try {
    await viewer.addSplatScene(encodeURI(activeScene.file), { progressiveLoad: false, showLoadingUI: false });
    const center = viewer.splatMesh.calculatedSceneCenter;
    const radius = Math.max(24, viewer.splatMesh.maxSplatDistanceFromSceneCenter);
    home.radius = radius; home.target.copy(center); home.position.set(center.x + radius * 1.38, center.y - radius * .84, center.z + radius * 1.38);
    viewer.renderer.setClearColor(0x161817, 1); applyHome(); viewer.start();
    overlay = new SceneOverlay(viewer, $('#poi-layer')); overlay.configure(center, radius);
    planRoute(); updateRiskCount();
    setTimeout(() => $('#loading').classList.add('is-hidden'), 350);
  } catch (error) {
    console.error(error); $('#loading-message').textContent = '场景载入失败，请从仓库根目录启动本地服务器';
  }
}

initializeControls();
renderTopologyMap($('#topology-map'), state.edges, null);
loadScene();
