import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  profiles,
  ROAD_STATUS,
  sceneCatalog
} from '../gs_campus/demo/js/accessmemory/data.js';
import { planAccessibleRoute } from '../gs_campus/demo/js/accessmemory/route-planner.js';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultPreferences = {
  avoidSteps: true,
  avoidSteep: true,
  preferStable: true
};

const totals = {
  scenes: sceneCatalog.length,
  nodes: 0,
  edges: 0,
  facilities: 0,
  risks: 0,
  viewpoints: 0
};

const sceneResults = sceneCatalog.map(scene => {
  const modelPath = resolve(repositoryRoot, scene.file.replace(/^\/+/, ''));
  assert.equal(existsSync(modelPath), true, `Missing scene model: ${scene.file}`);

  const nodeIds = new Set(Object.keys(scene.nodes));
  assert.ok(nodeIds.size >= 10, `${scene.id} must expose at least 10 places`);
  assert.ok(scene.facilities.length >= 8, `${scene.id} must expose at least 8 facilities`);
  assert.equal(scene.viewpoints.length, 4, `${scene.id} must expose 4 viewpoints`);

  for (const edge of scene.edges) {
    assert.equal(nodeIds.has(edge.from), true, `${edge.id} has an invalid start node`);
    assert.equal(nodeIds.has(edge.to), true, `${edge.id} has an invalid end node`);
  }

  for (const profileId of Object.keys(profiles)) {
    const route = planAccessibleRoute({
      edges: scene.edges,
      nodes: scene.nodes,
      origin: scene.defaultRoute[0],
      destination: scene.defaultRoute[1],
      profileId,
      preferences: defaultPreferences
    });
    assert.ok(route, `${scene.id} has no route for ${profileId}`);
    assert.equal(
      route.edges.some(edge => edge.status === ROAD_STATUS.BLOCKED),
      false,
      `${scene.id} route contains a blocked edge`
    );
  }

  totals.nodes += nodeIds.size;
  totals.edges += scene.edges.length;
  totals.facilities += scene.facilities.length;
  totals.risks += scene.risks.length;
  totals.viewpoints += scene.viewpoints.length;

  return {
    id: scene.id,
    modelBytes: statSync(modelPath).size,
    nodes: nodeIds.size,
    edges: scene.edges.length,
    facilities: scene.facilities.length,
    risks: scene.risks.length,
    viewpoints: scene.viewpoints.length
  };
});

assert.deepEqual(totals, {
  scenes: 4,
  nodes: 43,
  edges: 47,
  facilities: 32,
  risks: 8,
  viewpoints: 16
});

const entrance = sceneCatalog.find(scene => scene.id === 'entrance');
assert.ok(entrance);

const planEntrance = (edges, profileId = 'wheelchair', preferences = defaultPreferences) => (
  planAccessibleRoute({
    edges,
    nodes: entrance.nodes,
    origin: 'gate',
    destination: 'main',
    profileId,
    preferences
  })
);

const initialRoute = planEntrance(entrance.edges);
assert.ok(initialRoute);
assert.equal(initialRoute.length, 400);
assert.deepEqual(initialRoute.nodes, ['gate', 'dropoff', 'garden', 'fork', 'main']);
assert.equal(initialRoute.edges.some(edge => edge.tags.includes('steps')), false);

const updatedEdges = entrance.edges.map(edge => (
  edge.id === 'fork-main' ? { ...edge, status: ROAD_STATUS.BLOCKED } : { ...edge }
));
const rerouted = planEntrance(updatedEdges);
assert.ok(rerouted);
assert.equal(rerouted.length, 520);
assert.deepEqual(rerouted.nodes, ['gate', 'dropoff', 'garden', 'rest', 'ramp', 'service', 'main']);
assert.equal(rerouted.edges.some(edge => edge.id === 'fork-main'), false);

const lowVisionShortcut = planEntrance(entrance.edges, 'lowVision', {
  ...defaultPreferences,
  avoidSteps: false
});
assert.ok(lowVisionShortcut);
assert.equal(lowVisionShortcut.length, 360);
assert.equal(lowVisionShortcut.edges.some(edge => edge.tags.includes('steps')), true);

const wheelchairStillAvoidsSteps = planEntrance(entrance.edges, 'wheelchair', {
  ...defaultPreferences,
  avoidSteps: false
});
assert.ok(wheelchairStillAvoidsSteps);
assert.equal(wheelchairStillAvoidsSteps.length, 400);
assert.equal(wheelchairStillAvoidsSteps.edges.some(edge => edge.tags.includes('steps')), false);

console.log(JSON.stringify({
  status: 'PASS',
  totals,
  scenes: sceneResults,
  routes: {
    wheelchairDefault: {
      length: initialRoute.length,
      nodes: initialRoute.nodes
    },
    wheelchairAfterBlock: {
      length: rerouted.length,
      nodes: rerouted.nodes
    },
    lowVisionStepsAllowed: {
      length: lowVisionShortcut.length,
      nodes: lowVisionShortcut.nodes
    }
  }
}, null, 2));
