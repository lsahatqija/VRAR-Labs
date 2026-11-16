import * as THREE from 'three';
import { targetWorldPose, worldToLocalPose, updateSmoothing } from '../math/pose-helpers.js';

export const panelOffsetPosition = new THREE.Vector3(0.22, 0.26, -0.12); // TODO-UX-03: tune offset, size, and text layout.
export const panelOffsetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.2, 0, 0));

export function updateControllerPanel({ parent, follower, state, deltaTime, discontinuityToken }) {
  const target=targetWorldPose(parent,panelOffsetPosition,panelOffsetQuaternion);
  updateSmoothing(state,target,deltaTime,10,discontinuityToken);
  const local=worldToLocalPose(parent,state.position,state.quaternion);
  follower.position.copy(local.position); follower.quaternion.copy(local.quaternion);
}

// TODO-UX-03: attach follower under the active grip and call updateControllerPanel each frame.
