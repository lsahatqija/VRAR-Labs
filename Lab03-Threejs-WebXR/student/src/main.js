import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// TODO 3 will also import VRButton from three/addons/webxr/VRButton.js.
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
container.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.25, -1.4);
controls.enableDamping = true;

const gallery = createGallery();
scene.add(gallery);
addGalleryLighting(scene);

const infoPanel = createInfoPanel();
gallery.add(infoPanel);
const exhibits = createExhibits();

// TODO 1 — Scene graph and transforms
// The starter layout keeps the page useful before the exercise. Replace this loop with
// three explicit scene-graph additions and choose a position, rotation, and scale for
// each group. The pedestal centres are x = -2.3, 0, 2.3; y = 1; z = -1.75.
exhibits.forEach((exhibit, index) => {
  exhibit.position.set((index - 1) * 2.3, 1, -1.75);
  gallery.add(exhibit);
});

// TODO 4 — Get the first XR controller and add it to the scene.
// TODO 5 — Add a visible line to that controller so the ray can be seen in VR.

const raycaster = new THREE.Raycaster();
const rotationMatrix = new THREE.Matrix4();
let selectedExhibit = null;

function selectExhibit(exhibit) {
  // TODO 7 — Restore the previous group's scale, enlarge the new group, and update
  // both infoPanel.userData.update(...) and selectionReadout.textContent.
  selectedExhibit = exhibit;
}

function onControllerSelect() {
  // TODO 6 — Build a ray from the controller's world transform. Call
  // raycaster.intersectObjects(exhibits, true) so child meshes are included, then
  // walk from the nearest hit.object to its parent exhibit group and select it.
  console.info('Controller select is ready for your raycasting code.', { raycaster, rotationMatrix, selectedExhibit });
}

function resizeRenderer() {
  const { clientWidth, clientHeight } = container;
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.fov = clientWidth < 600 ? 50 : 65;
  camera.updateProjectionMatrix();
}

function render() {
  resizeRenderer();
  controls.update();
  renderer.render(scene, camera);
}

// TODO 2 — Replace this desktop-only helper with renderer.setAnimationLoop(render).
function startDesktopLoop(callback) {
  function frame() {
    callback();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
startDesktopLoop(render);

// TODO 3 — Set renderer.xr.enabled and append VRButton.createButton(renderer).
// Keep the normal HTML instructions for desktop, but remember: the canvas info panel
// is the information surface that remains visible inside the headset.

window.addEventListener('resize', resizeRenderer);
status.textContent = 'Desktop preview ready · begin with TODO 1';

// Optional development aid: mouse picking. It is deliberately not implemented here,
// because it must never replace controller selection for the assessed XR task.
void onControllerSelect;
void selectExhibit;
