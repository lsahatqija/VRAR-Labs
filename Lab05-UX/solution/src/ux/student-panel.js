import * as THREE from 'three';
import { targetWorldPose, worldToLocalPose, updateSmoothing } from '../math/pose-helpers.js';

export const panelOffsetPosition=new THREE.Vector3(-.58,.42,-.22);
export const panelOffsetQuaternion=new THREE.Quaternion().setFromEuler(new THREE.Euler(-.18,.12,0));

export function updateControllerPanel({ parent, follower, state, deltaTime, discontinuityToken }) {
  const target=targetWorldPose(parent,panelOffsetPosition,panelOffsetQuaternion);
  updateSmoothing(state,target,deltaTime,10,discontinuityToken);
  const local=worldToLocalPose(parent,state.position,state.quaternion);
  follower.position.copy(local.position); follower.quaternion.copy(local.quaternion);
}

export function attachPanel(parent,follower,panel,smoothingState,discontinuityToken){parent.add(follower);if(panel.parent!==follower)follower.add(panel);panel.position.set(0,0,0);panel.quaternion.identity();panel.scale.setScalar(1);smoothingState.position=null;smoothingState.token=discontinuityToken-1;}
