import * as THREE from 'three';

export function addTargetProxy(exhibit) {
  const proxy = new THREE.Mesh(new THREE.BoxGeometry(1.25,1.55,1.25),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  proxy.position.y=.55; proxy.name=`${exhibit.userData.name}-interaction-bounds`; proxy.userData.interactionHelper=true; exhibit.add(proxy); return proxy;
}
export const studentTargeting={padding:.18,addTargetProxy};
