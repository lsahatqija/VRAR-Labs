import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { constrainPose, simulatorDefaults, targetWorldPose, worldToLocalPose, updateSmoothing } from '../src/math/pose-helpers.js';
import { transition, firstTarget } from '../src/interaction/state-machine.js';

test('simulator bounds and total quaternion angle', () => {
  for (let i = 0; i < 1000; i++) {
    const p = new THREE.Vector3(5, -4, 3);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random()*6, Math.random()*6, Math.random()*6));
    constrainPose(p, q);
    assert.ok(p.x <= simulatorDefaults.max[0] && p.y >= simulatorDefaults.min[1] && p.z <= simulatorDefaults.max[2]);
    assert.ok(q.angleTo(new THREE.Quaternion()) <= Math.PI / 2 + 1e-7);
  }
});

test('one edge makes one transition', () => {
  assert.equal(transition('information', 'secondary'), 'browsing');
  assert.equal(transition('teleport', 'primary', { validDestination: false }), 'teleport');
  assert.equal(transition('browsing', 'primary', { exhibit: true }), 'information');
});

test('nearest obstruction blocks a target', () => {
  const obstacle = new THREE.Object3D(); obstacle.userData.blocksSelection = true;
  const exhibit = new THREE.Object3D(); exhibit.userData.isExhibit = true;
  assert.equal(firstTarget([{object: obstacle}, {object: exhibit}]), null);
  assert.equal(firstTarget([{object: exhibit}, {object: obstacle}]), exhibit);
});

test('world pose converts back to local pose', () => {
  const parent = new THREE.Object3D(); parent.position.set(1,2,3); parent.rotation.set(.2,.4,.1);
  const p = new THREE.Vector3(.2,.3,-.4); const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(.1,.2,.3));
  const world = targetWorldPose(parent, p, q); const local = worldToLocalPose(parent, world.position, world.quaternion);
  assert.ok(local.position.distanceTo(p) < 1e-9); assert.ok(local.quaternion.angleTo(q) < 1e-7);
});

test('smoothing is time independent and discontinuities snap', () => {
  const target = {position: new THREE.Vector3(1,0,0), quaternion: new THREE.Quaternion()};
  const a = {}, b = {}; const origin = {position: new THREE.Vector3(), quaternion: new THREE.Quaternion()};
  updateSmoothing(a, origin, 0, 4, 1); updateSmoothing(b, origin, 0, 4, 1);
  updateSmoothing(a, target, .1, 4, 1);
  for (let i=0;i<10;i++) updateSmoothing(b, target, .01, 4, 1);
  assert.ok(a.position.distanceTo(b.position) < 1e-9);
  updateSmoothing(a, target, .01, 4, 2); assert.ok(a.position.distanceTo(target.position) < 1e-9);
});
