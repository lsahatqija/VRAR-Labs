import * as THREE from 'three';

export function createXrControllers(renderer,scene,onAction,onActiveChanged) {
  const slots=[0,1].map((index)=>{
    const ray=renderer.xr.getController(index), grip=renderer.xr.getControllerGrip(index); scene.add(ray,grip);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-1)]),new THREE.LineBasicMaterial({color:0x78d8c7}));line.scale.z=10;ray.add(line);
    const slot={index,ray,grip,connected:false,handedness:'none',inputSource:null};
    ray.addEventListener('connected',(event)=>{slot.connected=true;slot.handedness=event.data.handedness||'none';slot.inputSource=event.data;choose();});
    ray.addEventListener('disconnected',()=>{slot.connected=false;slot.inputSource=null;choose();});
    ray.addEventListener('selectstart',()=>{if(active===slot)onAction('primary')});
    ray.addEventListener('squeezestart',()=>{if(active===slot)onAction('secondary')});
    return slot;
  });
  let active=null;
  function choose(){const next=slots.find(s=>s.connected&&s.handedness==='right')||slots.find(s=>s.connected)||null;if(next!==active){active=next;onActiveChanged(active)}}
  function clear(){slots.forEach(s=>{s.connected=false;s.inputSource=null});active=null;onActiveChanged(null)}
  return { slots, clear, get active(){return active}, get pointing(){return active?.ray??null}, get grip(){return active?.grip??null}, hasSecondary(){return !!active?.inputSource?.gripSpace} };
}
