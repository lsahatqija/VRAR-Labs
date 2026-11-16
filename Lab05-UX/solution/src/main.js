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
import { studentUx } from './ux/student-config.js';
import { attachPanel, updateControllerPanel } from './ux/student-panel.js';
import { afterTransition } from './ux/student-recovery.js';
import { createTeleportMarker, decorateTeleportPreview } from './ux/student-teleport.js';
import { createOnboarding } from './ux/student-onboarding.js';

const ux=studentUx;
document.querySelector('#condition').textContent='Condition: COMPLETED SOLUTION';
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x0e1615); scene.fog=new THREE.Fog(0x0e1615,10,22);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.05,100); camera.position.set(0,1.65,5.2);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; renderer.xr.enabled=true; document.querySelector('#scene').append(renderer.domElement); document.body.append(VRButton.createButton(renderer));
const exhibition=createExhibition(scene); exhibition.exhibits.filter(item=>item.userData.isExhibit).forEach(ux.targeting.addTargetProxy);
const infoPanel=createInfoPanel(); exhibition.gallery.add(infoPanel);
const marker=createTeleportMarker(); scene.add(marker);
const logger=createEventLog('solution'); const router=createInputRouter(); const raycaster=new THREE.Raycaster(); raycaster.far=20;
const trialTarget=new URLSearchParams(location.search).get('target')||'Artifact vessel';
const panelFollower=new THREE.Group(); panelFollower.name='information-panel-follower'; const smoothingState={};
let state='browsing',selected=null,hovered=null,destination=null,immersive=false,discontinuity=0,lastTracking=false;

const onboarding=createOnboarding(document.querySelector('#instructions'),exhibition.updateInstructions);
function applyAppearance(){exhibition.exhibits.filter(e=>e.userData.isExhibit).forEach(exhibit=>{const visual=exhibit===selected?'selected':exhibit===hovered?'hover':'idle';const style=ux.feedbackFor(visual);exhibit.scale.setScalar(style.scale);exhibit.traverse(child=>{if(child.material?.emissive)child.material.emissive.setHex(style.emissive)});});}
function cleanup(previous,next){afterTransition(previous,next,{marker,panel:infoPanel,clearDestination:()=>{destination=null;},clearHover:()=>{hovered=null;applyAppearance();},clearSelection:()=>{selected=null;applyAppearance();}});}
function setState(next,detail={}){const previous=state;state=next;cleanup(previous,next);document.querySelector('#state').textContent=`State: ${state}`;logger.log('state-change',{previous,next,...detail});if(next==='teleport')exhibition.updateInstructions('Point at a destination. Check means valid; X means blocked. Primary confirms, Secondary cancels.');}
function attachToActiveGrip(){if(!router.input.gripPose)return;discontinuity++;attachPanel(router.input.gripPose,panelFollower,infoPanel,smoothingState,discontinuity);if(state==='information'&&selected)infoPanel.userData.show(selected.userData);}
function resetExperience(){const previous=state;state='browsing';selected=null;hovered=null;destination=null;infoPanel.userData.hide();marker.visible=false;camera.position.set(0,1.65,5.2);camera.quaternion.identity();desktop.reset();discontinuity++;cleanup(previous,'browsing');applyAppearance();onboarding.replay();document.querySelector('#state').textContent='State: browsing';logger.log('full-reset');}
function currentTarget(){if(!router.input.tracking||!router.input.pointingPose)return null;rayFromPose(router.input.pointingPose,raycaster);return resolveExhibit(raycaster,[exhibition.gallery]);}
function act(action){
  if(!router.input.tracking)return; const target=currentTarget();
  if(target?.userData.worldAction&&action==='primary'){target.userData.worldAction==='reset'?resetExperience():onboarding.replay();return;}
  if(state==='browsing'&&action==='primary'&&target?.userData.isExhibit){selected=target;discontinuity++;infoPanel.userData.show(target.userData);setState(transition(state,action,{exhibit:true}),{exhibit:target.userData.name});onboarding.event('selection');logger.log(target.userData.name===trialTarget?'correct-selection':'wrong-selection',{exhibit:target.userData.name,target:trialTarget});logger.log('panel-opened',{exhibit:target.userData.name});}
  else if(state==='browsing'&&action==='secondary'){setState(transition(state,action));logger.log('teleport-preview');}
  else if(state==='information'&&action==='secondary'){const completedTarget=selected?.userData.name===trialTarget;setState(transition(state,action));onboarding.event('panel-closed');logger.log('panel-closed');if(completedTarget)logger.log('task-completion',{task:'find-exhibit-fact'});}
  else if(state==='teleport'&&action==='secondary'){setState(transition(state,action));onboarding.render();logger.log('teleport-cancelled');}
  else if(state==='teleport'&&action==='primary'&&destination?.valid){camera.position.x=destination.point.x;camera.position.z=destination.point.z;discontinuity++;setState(transition(state,action,{validDestination:true}));onboarding.render();logger.log('teleport-completed',{x:+destination.point.x.toFixed(2),z:+destination.point.z.toFixed(2)});}
  applyAppearance();
}

const desktop=createDesktopController({camera,renderer,scene,onAction:act}); router.setDesktop(desktop); attachToActiveGrip();
const cameraControls=createDesktopCamera(camera,renderer.domElement,()=>desktop.dragging||immersive);
const xr=createXrControllers(renderer,scene,act,()=>{if(!immersive)return;router.setImmersive(xr);discontinuity++;attachToActiveGrip();if(xr.active&&!xr.hasSecondary())document.querySelector('#hint').textContent='No squeeze input detected. Use the world Reset control for recovery.';});
renderer.xr.addEventListener('sessionstart',()=>{immersive=true;document.body.classList.add('immersive');desktop.setEnabled(false);cameraControls.cancel();router.setImmersive(xr);onboarding.setMode('immersive');marker.visible=false;logger.log('input-mode-change',{mode:'immersive'});discontinuity++;attachToActiveGrip();});
renderer.xr.addEventListener('sessionend',()=>{immersive=false;document.body.classList.remove('immersive');xr.clear();desktop.setEnabled(true);desktop.reset();router.setDesktop(desktop);onboarding.setMode('desktop');logger.log('input-mode-change',{mode:'desktop'});discontinuity++;attachToActiveGrip();});
document.querySelector('#reset').onclick=resetExperience; document.querySelector('#replay').onclick=()=>onboarding.replay(); document.querySelector('#skip-onboarding').onclick=()=>onboarding.skip(); document.querySelector('#export').onclick=logger.exportJson;
document.addEventListener('visibilitychange',()=>{if(document.hidden)logger.log('trial-interrupted',{reason:'document-hidden'});}); logger.log('input-mode-change',{mode:'desktop'});
addEventListener('keydown',event=>{if(event.code==='Escape')resetExperience();}); addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const clock=new THREE.Clock(); setState('browsing'); onboarding.render();
renderer.setAnimationLoop(()=>{
  const delta=Math.min(clock.getDelta(),.1); cameraControls.update(delta,!immersive); desktop.updateButtons();
  const tracking=router.input.tracking&&!!router.input.pointingPose&&!!router.input.gripPose;
  if(tracking&&!lastTracking){discontinuity++;attachToActiveGrip();} lastTracking=tracking;
  if(state==='information'){infoPanel.visible=tracking;if(tracking)updateControllerPanel({parent:router.input.gripPose,follower:panelFollower,state:smoothingState,deltaTime:delta,discontinuityToken:discontinuity});}
  if(router.input.tracking&&router.input.pointingPose){rayFromPose(router.input.pointingPose,raycaster);if(state==='browsing'){const next=resolveExhibit(raycaster,[exhibition.gallery]);const nextHover=next?.userData.isExhibit?next:null;if(nextHover!==hovered&&nextHover){logger.log('target-entry',{exhibit:nextHover.userData.name});onboarding.event('target-entry');}hovered=nextHover;applyAppearance();}if(state==='teleport'){destination=teleportHit(raycaster,exhibition.teleportSurfaces);decorateTeleportPreview(marker,destination);document.querySelector('#hint').textContent=destination?.valid?'✓ Valid · Primary confirm · Secondary cancel':'✕ Invalid · Secondary cancel';}}
  renderer.render(scene,camera);
});
