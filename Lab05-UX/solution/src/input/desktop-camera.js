import * as THREE from 'three';

export function createDesktopCamera(camera,domElement,isBlocked) {
  const keys=new Set(); let looking=false,lastX=0,lastY=0; const euler=new THREE.Euler(0,0,0,'YXZ');
  domElement.addEventListener('contextmenu',(event)=>event.preventDefault());
  domElement.addEventListener('pointerdown',(event)=>{ if(event.button===2&&!isBlocked()){looking=true;lastX=event.clientX;lastY=event.clientY;domElement.setPointerCapture(event.pointerId);} });
  domElement.addEventListener('pointermove',(event)=>{ if(!looking||isBlocked())return;euler.setFromQuaternion(camera.quaternion);euler.y-=(event.clientX-lastX)*.003;euler.x=THREE.MathUtils.clamp(euler.x-(event.clientY-lastY)*.003,-1.45,1.45);camera.quaternion.setFromEuler(euler);lastX=event.clientX;lastY=event.clientY; });
  const release=()=>{looking=false;keys.clear();}; addEventListener('pointerup',release); addEventListener('pointercancel',release); addEventListener('blur',release);
  addEventListener('keydown',(event)=>{if(['KeyW','KeyA','KeyS','KeyD'].includes(event.code))keys.add(event.code)}); addEventListener('keyup',(event)=>keys.delete(event.code));
  function update(delta,enabled){ if(!enabled||isBlocked())return; const speed=2.2*delta; const forward=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);forward.y=0;forward.normalize();const right=new THREE.Vector3().crossVectors(forward,camera.up).normalize();if(keys.has('KeyW'))camera.position.addScaledVector(forward,speed);if(keys.has('KeyS'))camera.position.addScaledVector(forward,-speed);if(keys.has('KeyD'))camera.position.addScaledVector(right,speed);if(keys.has('KeyA'))camera.position.addScaledVector(right,-speed);camera.position.x=THREE.MathUtils.clamp(camera.position.x,-5,5);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-3.5,6); }
  return { update, cancel:release };
}
