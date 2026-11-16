import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import './style.css';
import { createExhibition } from './scene/exhibition.js';
import { createInfoPanel } from './ui/info-panel.js';
import { createDesktopController } from './input/desktop-controller.js';
import { createDesktopCamera } from './input/desktop-camera.js';
import { createXrControllers } from './input/xr-controller.js';
import { createInputRouter } from './input/input-router.js';
import { rayFromPose, resolveExhibit, teleportHit } from './interaction/targeting.js';
import { transition } from './interaction/state-machine.js';
import { createEventLog } from './telemetry/event-log.js';
import { baselineUx } from './baseline/config.js';
import { studentUx } from './ux/student-config.js';

const condition=new URLSearchParams(location.search).get('condition')==='baseline'?'baseline':'student';
const ux=condition==='baseline'?baselineUx:studentUx; document.querySelector('#condition').textContent=`Condition: ${condition.toUpperCase()}`;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x0e1615); scene.fog=new THREE.Fog(0x0e1615,10,22);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.05,100); camera.position.set(0,1.65,5.2);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.xr.enabled=true;document.querySelector('#scene').append(renderer.domElement);document.body.append(VRButton.createButton(renderer));
const exhibition=createExhibition(scene); const infoPanel=createInfoPanel();exhibition.gallery.add(infoPanel);
const logger=createEventLog(condition); const router=createInputRouter(); const raycaster=new THREE.Raycaster();raycaster.far=20;const trialTarget=new URLSearchParams(location.search).get('target')||'Artifact vessel';
let state='browsing',selected=null,hovered=null,destination=null,immersive=false,discontinuity=0;
const marker=new THREE.Mesh(new THREE.RingGeometry(.18,.28,32),new THREE.MeshBasicMaterial({color:0x4fd4bc,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);

function applyAppearance(){
  exhibition.exhibits.filter(e=>e.userData.isExhibit).forEach(exhibit=>{
    const visual=exhibit===selected?'selected':exhibit===hovered?'hover':'idle';
    const style=ux.feedbackFor?ux.feedbackFor(visual):{scale:visual==='selected'?ux.selectedScale:visual==='hover'?1.02:1,emissive:visual==='idle'?0:ux.hoverEmissive};
    exhibit.scale.setScalar(style.scale);exhibit.traverse(child=>{if(child.material?.emissive)child.material.emissive.setHex(style.emissive)});
  });
}
function setState(next,detail={}){const previous=state;state=next;document.querySelector('#state').textContent=`State: ${state}`;logger.log('state-change',{previous,next,...detail});}
function showInstructions(value=true){document.querySelector('#instructions').hidden=!value;logger.log(value?'onboarding-replay':'onboarding-skip');}
function resetExperience(){state='browsing';selected=null;hovered=null;destination=null;infoPanel.userData.hide();marker.visible=false;camera.position.set(0,1.65,5.2);camera.quaternion.identity();desktop.reset();discontinuity++;applyAppearance();setState('browsing',{reason:'reset'});logger.log('full-reset');}
function currentTarget(){if(!router.input.tracking||!router.input.pointingPose)return null;rayFromPose(router.input.pointingPose,raycaster);return resolveExhibit(raycaster,[exhibition.gallery]);}
function act(action){
  if(!router.input.tracking)return; const target=currentTarget();
  if(target?.userData.worldAction&&action==='primary'){target.userData.worldAction==='reset'?resetExperience():showInstructions(true);return;}
  if(state==='browsing'&&action==='primary'&&target?.userData.isExhibit){selected=target;infoPanel.userData.show(target.userData);setState(transition(state,action,{exhibit:true}),{exhibit:target.userData.name});logger.log(target.userData.name===trialTarget?'correct-selection':'wrong-selection',{exhibit:target.userData.name,target:trialTarget});logger.log('panel-opened',{exhibit:target.userData.name});}
  else if(state==='browsing'&&action==='secondary'){setState(transition(state,action));logger.log('teleport-preview');}
  else if(state==='information'&&action==='secondary'){infoPanel.userData.hide();setState(transition(state,action));logger.log('panel-closed');if(selected?.userData.name===trialTarget)logger.log('task-completion',{task:'find-exhibit-fact'});}
  else if(state==='teleport'&&action==='secondary'){marker.visible=false;destination=null;setState(transition(state,action));logger.log('teleport-cancelled');}
  else if(state==='teleport'&&action==='primary'&&destination?.valid){camera.position.x=destination.point.x;camera.position.z=destination.point.z;marker.visible=false;setState(transition(state,action,{validDestination:true}));discontinuity++;logger.log('teleport-completed',{x:+destination.point.x.toFixed(2),z:+destination.point.z.toFixed(2)});}
  applyAppearance();
}
const desktop=createDesktopController({camera,renderer,scene,onAction:act});router.setDesktop(desktop);
const cameraControls=createDesktopCamera(camera,renderer.domElement,()=>desktop.dragging||immersive);
const xr=createXrControllers(renderer,scene,act,()=>{if(immersive){router.setImmersive(xr);discontinuity++;if(xr.active&&!xr.hasSecondary())document.querySelector('#hint').textContent='This controller has no grip/squeeze input. Use the world reset control to recover.';}});
renderer.xr.addEventListener('sessionstart',()=>{immersive=true;document.body.classList.add('immersive');desktop.setEnabled(false);cameraControls.cancel();router.setImmersive(xr);marker.visible=false;logger.log('input-mode-change',{mode:'immersive'});discontinuity++;});
renderer.xr.addEventListener('sessionend',()=>{immersive=false;document.body.classList.remove('immersive');xr.clear();desktop.setEnabled(true);desktop.reset();router.setDesktop(desktop);logger.log('input-mode-change',{mode:'desktop'});discontinuity++;});
document.querySelector('#reset').onclick=resetExperience;document.querySelector('#replay').onclick=()=>showInstructions(true);document.querySelector('#skip-onboarding').onclick=()=>showInstructions(false);document.querySelector('#export').onclick=logger.exportJson;
document.addEventListener('visibilitychange',()=>{if(document.hidden)logger.log('trial-interrupted',{reason:'document-hidden'});});logger.log('input-mode-change',{mode:'desktop'});
addEventListener('keydown',(event)=>{if(event.code==='Escape')resetExperience();});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const clock=new THREE.Clock();setState('browsing');
renderer.setAnimationLoop(()=>{
  const delta=Math.min(clock.getDelta(),.1);cameraControls.update(delta,!immersive);desktop.updateButtons();
  if(router.input.tracking&&router.input.pointingPose){rayFromPose(router.input.pointingPose,raycaster);if(state==='browsing'){const next=resolveExhibit(raycaster,[exhibition.gallery]);const nextHover=next?.userData.isExhibit?next:null;if(nextHover!==hovered&&nextHover)logger.log('target-entry',{exhibit:nextHover.userData.name});hovered=nextHover;applyAppearance();}if(state==='teleport'){destination=teleportHit(raycaster,exhibition.teleportSurfaces);marker.visible=!!destination;if(destination){marker.position.copy(destination.point);marker.position.y+=.02;marker.material.color.setHex(destination.valid?0x4fd4bc:0xe85d6a);document.querySelector('#hint').textContent=destination.valid?'Primary: confirm · Secondary: cancel':'Invalid destination · Secondary: cancel';}}}
  renderer.render(scene,camera);
});
