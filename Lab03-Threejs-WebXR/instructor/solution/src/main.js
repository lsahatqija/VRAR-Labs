import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import './style.css';
import { createExhibits } from './exhibits.js';
import { addGalleryLighting, createGallery, createInfoPanel } from './gallery.js';

const container = document.querySelector('#scene-container');
const status = document.querySelector('#status');
const selectionReadout = document.querySelector('#selection-readout');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1615);
scene.fog = new THREE.Fog(0x0e1615, 8, 18);

const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 100);
camera.position.set(0, 2.15, 5.7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.xr.enabled = true;
container.append(renderer.domElement);
document.body.append(VRButton.createButton(renderer));

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.25, -1.4);
controls.enableDamping = true;

const gallery = createGallery();
scene.add(gallery);
addGalleryLighting(scene);

const infoPanel = createInfoPanel();
gallery.add(infoPanel);

const exhibits = createExhibits();
const placements = [
  { position: [-2.3, 1, -1.75], rotation: [0, 0.42, 0], scale: 0.78 },
  { position: [0, 1, -1.75], rotation: [0, -0.3, 0], scale: 0.9 },
  { position: [2.3, 1, -1.75], rotation: [0, 0.55, 0], scale: 1.08 },
];

exhibits.forEach((exhibit, index) => {
  const placement = placements[index];
  exhibit.position.fromArray(placement.position);
  exhibit.rotation.set(...placement.rotation);
  exhibit.scale.setScalar(placement.scale);
  exhibit.userData.restingScale = placement.scale;
  gallery.add(exhibit);
});

let controller = renderer.xr.getController(0);
scene.add(controller);

const rayGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -1),
]);
const rayLine = new THREE.Line(
  rayGeometry,
  new THREE.LineBasicMaterial({ color: 0x78d8c7 }),
);
rayLine.name = 'controller-ray';
rayLine.scale.z = 10;
controller.add(rayLine);

const raycaster = new THREE.Raycaster();
raycaster.far = 10;
const rotationMatrix = new THREE.Matrix4();
let selectedExhibit = null;

function selectExhibit(exhibit) {
  if (selectedExhibit === exhibit) return;

  if (selectedExhibit) {
    selectedExhibit.scale.setScalar(selectedExhibit.userData.restingScale);
  }

  selectedExhibit = exhibit;
  const selectedScale = exhibit.userData.restingScale * 1.12;
  exhibit.scale.setScalar(selectedScale);
  infoPanel.userData.update(exhibit.userData.name, exhibit.userData.description);
  selectionReadout.textContent = exhibit.userData.name;
}

function findExhibitAncestor(object) {
  let candidate = object;
  while (candidate && !candidate.userData.isExhibit) candidate = candidate.parent;
  return candidate;
}

function onControllerSelect() {
  controller.updateWorldMatrix(true, false);
  rotationMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(rotationMatrix).normalize();

  const intersections = raycaster.intersectObjects(exhibits, true);
  if (intersections.length === 0) return;

  const exhibit = findExhibitAncestor(intersections[0].object);
  if (exhibit) selectExhibit(exhibit);
}

controller.addEventListener('select', onControllerSelect);

const desktopControllerOrigin = new THREE.Vector3();
const desktopAimPoint = new THREE.Vector3();
const desktopAimDirection = new THREE.Vector3();
const controllerForward = new THREE.Vector3(0, 0, -1);

function syncDesktopController() {
  if (renderer.xr.isPresenting) return;

  camera.getWorldPosition(desktopControllerOrigin);
  camera.getWorldDirection(desktopAimDirection);
  desktopAimPoint.copy(desktopControllerOrigin).addScaledVector(desktopAimDirection, 10);

  controller.position.copy(desktopControllerOrigin);
  controller.quaternion.copy(camera.quaternion);
  controller.translateX(0.32);
  controller.translateY(-0.24);
  controller.translateZ(-0.5);

  desktopAimDirection.copy(desktopAimPoint).sub(controller.position).normalize();
  controller.quaternion.setFromUnitVectors(controllerForward, desktopAimDirection);
  controller.updateMatrix();
  controller.visible = true;
  container.classList.add('desktop-controller-ready');
}

window.addEventListener('keydown', (event) => {
  if (event.code !== 'KeyE' || event.repeat || renderer.xr.isPresenting) return;
  controller.dispatchEvent({ type: 'select' });
});

function resizeRenderer() {
  const { clientWidth, clientHeight } = container;
  if (renderer.xr.isPresenting) return;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.fov = clientWidth < 600 ? 50 : 65;
  camera.updateProjectionMatrix();
}

function render() {
  resizeRenderer();
  controls.update();
  syncDesktopController();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(render);
window.addEventListener('resize', resizeRenderer);
status.textContent = 'Reference solution · XR ready';
