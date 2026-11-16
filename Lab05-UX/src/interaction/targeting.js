import * as THREE from 'three';
import { firstTarget } from './state-machine.js';

const rotation = new THREE.Matrix4();
export function rayFromPose(node, raycaster) {
  node.updateWorldMatrix(true, false);
  rotation.extractRotation(node.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(node.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(rotation).normalize();
}

export function resolveExhibit(raycaster, targets) {
  return firstTarget(raycaster.intersectObjects(targets, true));
}

export function teleportHit(raycaster, surfaces) {
  const hit = raycaster.intersectObjects(surfaces, false)[0];
  return hit ? { point: hit.point, valid: hit.object.userData.teleportable === true } : null;
}
