import * as THREE from 'three';

const ceramic = new THREE.MeshStandardMaterial({ color: 0xb55d3b, roughness: 0.78 });
const stone = new THREE.MeshStandardMaterial({ color: 0xd0c7b8, roughness: 0.9 });
const bronze = new THREE.MeshStandardMaterial({ color: 0x41766c, metalness: 0.42, roughness: 0.48 });

function markAsExhibit(group, name, description) {
  group.userData = { isExhibit: true, name, description };
  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return group;
}

export function createVessel() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 20), ceramic);
  body.scale.y = 1.18;
  body.position.y = 0.5;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.34, 24), ceramic);
  neck.position.y = 0.94;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 10, 28), ceramic);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.12;
  group.add(body, neck, rim);
  return markAsExhibit(group, 'Artifact vessel', 'A ceramic form built from sphere, cylinder, and torus meshes.');
}

export function createBuilding() {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.62, 0.68), stone);
  base.position.y = 0.31;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.38, 4), new THREE.MeshStandardMaterial({ color: 0x263f3b, roughness: 0.75 }));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 0.81;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.035), new THREE.MeshStandardMaterial({ color: 0x69513e, roughness: 0.9 }));
  door.position.set(0, 0.2, 0.357);
  group.add(base, roof, door);
  return markAsExhibit(group, 'Miniature archive', 'A small building whose roof, walls, and door form one group.');
}

export function createSculpture() {
  const group = new THREE.Group();
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.3, 0.095, 90, 14, 2, 3), bronze);
  knot.position.y = 0.55;
  knot.rotation.set(0.2, 0.3, -0.15);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.31, 0.16, 24), new THREE.MeshStandardMaterial({ color: 0x252827, roughness: 0.82 }));
  foot.position.y = 0.08;
  group.add(knot, foot);
  return markAsExhibit(group, 'Continuous form', 'A bronze-like torus knot mounted on a dark stone base.');
}

export function createExhibits() {
  return [createVessel(), createBuilding(), createSculpture()];
}
