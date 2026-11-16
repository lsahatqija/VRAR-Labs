import * as THREE from 'three';
import { createGallery, addGalleryLighting } from '../gallery.js';
import { createExhibits } from '../exhibits.js';

export function createExhibition(scene) {
  const gallery = createGallery(); scene.add(gallery); addGalleryLighting(scene);
  const exhibits = createExhibits();
  const facts = [
    ['Artifact vessel', 'The vessel is assembled from exactly three primitive types: sphere, cylinder, and torus.'],
    ['Miniature archive', 'The archive has one brown door on its front wall.'],
    ['Continuous form', 'The sculpture uses a torus knot with parameters 2 and 3.'],
  ];
  const positions = [[-2.3,1,-1.75],[0,1,-1.75],[2.3,1,-1.75]];
  exhibits.forEach((exhibit,index)=>{ exhibit.position.fromArray(positions[index]); exhibit.userData.name=facts[index][0]; exhibit.userData.description=facts[index][1]; exhibit.userData.restingScale=1; gallery.add(exhibit); });
  const obstruction = new THREE.Mesh(new THREE.BoxGeometry(.55,1.2,.2), new THREE.MeshStandardMaterial({color:0x35413f}));
  obstruction.position.set(1.1,.6,-.9); obstruction.userData.blocksSelection=true; obstruction.name='selection-obstruction'; gallery.add(obstruction);
  const validFloor = gallery.children.find((item)=>item.geometry?.type==='PlaneGeometry'); validFloor.userData.teleportable=true;
  const invalid = new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.4), new THREE.MeshStandardMaterial({color:0x682d36,roughness:1}));
  invalid.rotation.x=-Math.PI/2; invalid.position.set(3.9,.012,2.5); invalid.userData.teleportable=false; gallery.add(invalid);
  const reset = new THREE.Mesh(new THREE.BoxGeometry(.8,.28,.12),new THREE.MeshBasicMaterial({color:0x3d9b8d})); reset.position.set(-4.9,1.3,-4.43); reset.userData.worldAction='reset'; reset.userData.name='Reset'; gallery.add(reset); exhibits.push(reset);
  const replay = reset.clone(); replay.position.y=.9; replay.userData={worldAction:'replay',name:'Replay'}; gallery.add(replay); exhibits.push(replay);
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#17201f';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#78d8c7';ctx.font='bold 42px system-ui';ctx.fillText('Primary: select / confirm',48,85);ctx.fillText('Secondary: teleport / close / cancel',48,145);ctx.fillStyle='white';ctx.font='28px system-ui';ctx.fillText('Left wall controls: reset and replay',48,205);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.8),new THREE.MeshBasicMaterial({map:texture}));sign.position.set(-3.7,2.7,-4.42);gallery.add(sign);
  return { gallery, exhibits, teleportSurfaces:[validFloor,invalid], obstruction };
}
