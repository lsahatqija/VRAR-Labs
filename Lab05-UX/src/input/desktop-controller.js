import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { SIMULATOR } from '../config/simulator.js';
import { constrainPose } from '../math/pose-helpers.js';

export function createDesktopController({ camera, renderer, scene, onAction }) {
  const frame = new THREE.Group(); camera.add(frame); scene.add(camera);
  const controller = new THREE.Group(); frame.add(controller);
  const grip = new THREE.Group(); controller.add(grip);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.045,.14,5,10),new THREE.MeshStandardMaterial({color:0xe5efed,roughness:.5})); body.rotation.x=Math.PI/2; body.position.z=-.04; controller.add(body);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.075,.012,8,24),new THREE.MeshBasicMaterial({color:0x78d8c7})); ring.position.z=-.13; controller.add(ring);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-1)]),new THREE.LineBasicMaterial({color:0x78d8c7})); line.scale.z=10; controller.add(line);
  const gizmo = new TransformControls(camera,renderer.domElement); gizmo.attach(controller); gizmo.setMode('translate'); gizmo.setSpace('local'); gizmo.setSize(.7); scene.add(gizmo.getHelper());
  const neutralQuaternion = new THREE.Quaternion(); let constraining=false; let enabled=true;
  function reset(){ controller.position.fromArray(SIMULATOR.neutralPosition); controller.quaternion.identity(); controller.updateMatrixWorld(true); }
  function constrain(){ if(constraining)return; constraining=true; constrainPose(controller.position,controller.quaternion,neutralQuaternion); controller.updateMatrixWorld(true); constraining=false; }
  gizmo.addEventListener('objectChange',constrain);
  let dragging=false; gizmo.addEventListener('dragging-changed',(event)=>{ dragging=event.value; });
  const buttons=document.querySelector('#action-buttons');
  function updateButtons(){
    if(!enabled)return; const p=controller.getWorldPosition(new THREE.Vector3()).project(camera);
    const x=THREE.MathUtils.clamp((p.x*.5+.5)*innerWidth,110,innerWidth-110); const y=THREE.MathUtils.clamp((-p.y*.5+.5)*innerHeight-45,150,innerHeight-70);
    buttons.style.left=`${x}px`; buttons.style.top=`${y}px`;
  }
  function press(action,event){ event.preventDefault(); event.stopPropagation(); if(enabled)onAction(action); }
  for(const id of ['primary','secondary']) document.querySelector(`#${id}`).addEventListener('pointerdown',(event)=>press(id,event));
  document.querySelector('#translate').onclick=()=>gizmo.setMode('translate'); document.querySelector('#rotate').onclick=()=>gizmo.setMode('rotate'); document.querySelector('#reset-controller').onclick=reset;
  addEventListener('keydown',(event)=>{ if(!enabled||event.repeat)return; if(event.code==='KeyT')gizmo.setMode('translate'); if(event.code==='KeyR')gizmo.setMode('rotate'); });
  function setEnabled(value){ enabled=value; controller.visible=value; gizmo.enabled=value; gizmo.visible=value; buttons.hidden=!value; document.querySelector('#simulator').hidden=!value; if(!value)dragging=false; }
  reset();
  return { node:controller, grip, gizmo, updateButtons, setEnabled, reset, get enabled(){return enabled;}, get dragging(){return dragging;} };
}
