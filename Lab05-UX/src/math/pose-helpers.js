import * as THREE from 'three';

export const simulatorDefaults = Object.freeze({
  position: [0.30, -0.25, -0.80],
  min: [-0.60, -0.55, -1.30],
  max: [0.60, 0.35, -0.40],
  maxAngle: Math.PI / 2,
});

export function constrainPose(position, quaternion, neutral = new THREE.Quaternion()) {
  position.clamp(new THREE.Vector3(...simulatorDefaults.min), new THREE.Vector3(...simulatorDefaults.max));
  const relative = neutral.clone().invert().multiply(quaternion).normalize();
  if (relative.w < 0) relative.set(-relative.x, -relative.y, -relative.z, -relative.w);
  const angle = 2 * Math.acos(THREE.MathUtils.clamp(relative.w, -1, 1));
  if (angle > simulatorDefaults.maxAngle) {
    relative.identity().slerp(neutral.clone().invert().multiply(quaternion).normalize(), simulatorDefaults.maxAngle / angle);
    quaternion.copy(neutral).multiply(relative).normalize();
  }
}

export function targetWorldPose(parent, offsetPosition, offsetQuaternion) {
  parent.updateWorldMatrix(true, false);
  const position = parent.localToWorld(offsetPosition.clone());
  const quaternion = parent.getWorldQuaternion(new THREE.Quaternion()).multiply(offsetQuaternion);
  return { position, quaternion };
}

export function worldToLocalPose(parent, position, quaternion) {
  parent.updateWorldMatrix(true, false);
  return {
    position: parent.worldToLocal(position.clone()),
    quaternion: parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(quaternion),
  };
}

export function resetSmoothing(state, target, token) {
  state.position = target.position.clone();
  state.quaternion = target.quaternion.clone();
  state.token = token;
}

export function updateSmoothing(state, target, deltaTime, lambda, token) {
  if (!state.position || state.token !== token) resetSmoothing(state, target, token);
  const alpha = 1 - Math.exp(-lambda * Math.max(0, Math.min(deltaTime, 0.1)));
  state.position.lerp(target.position, alpha);
  state.quaternion.slerp(target.quaternion, alpha);
  return state;
}
