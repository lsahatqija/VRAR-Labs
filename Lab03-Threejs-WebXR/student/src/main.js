import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// TODO 3: import { VRButton } from 'three/addons/webxr/VRButton.js'.
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

// TODO 1 — Apply transforms to exhibit groups
// createExhibits() returns three THREE.Group objects. Replace this starter loop with a
// placements array containing a position, Y rotation, and uniform scale for each group.
// Apply those values to the group—not to its child meshes—then add the group to gallery.
// Save the initial scale in exhibit.userData.restingScale; TODO 7 needs it to undo a
// selection without erasing this layout. Pedestal centres: x = -2.3, 0, 2.3;
// y = 1; z = -1.75. Use noticeably different rotations/scales so the result is easy
// to compare on desktop while keeping every object centred above its pedestal.
exhibits.forEach((exhibit, index) => {
  exhibit.position.set((index - 1) * 2.3, 1, -1.75);
  gallery.add(exhibit);
});

let controller = null;

// TODO 4 — Create the primary target-ray controller
// Assign renderer.xr.getController(0) to controller, add it to scene, and register
// onControllerSelect for its "select" event. getController(0) is a transform space for
// the first XR input source; it is not a rendered controller model. The supplied desktop
// simulator also uses this object: after TODO 4, aiming at the centre reticle and pressing
// E should call the same event handler even when no headset is connected.

// TODO 5 — Make the target ray visible
// Create BufferGeometry with points (0, 0, 0) and (0, 0, -1), use it in a THREE.Line,
// stretch the line to 10 metres with scale.z, and add it to controller. As a child, it
// inherits the controller's world pose. On desktop it should appear from the lower-right
// camera position and converge on the centre reticle; in XR it follows the real controller.

const raycaster = new THREE.Raycaster();
const rotationMatrix = new THREE.Matrix4();
let selectedExhibit = null;

function selectExhibit(exhibit) {
  // TODO 7 — Show exactly one active selection
  // Return immediately if exhibit is already selected. Otherwise restore the old
  // selection with its userData.restingScale, store this exhibit, and set its scale to
  // restingScale * 1.12. Finally pass its userData.name and userData.description to
  // infoPanel.userData.update(...), and put its name in selectionReadout.textContent.
  // Press E in the desktop preview to see the scale, canvas panel, and HTML label change.
  selectedExhibit = exhibit;
}

function onControllerSelect() {
  // TODO 6 — Convert the controller pose into a recursive raycast
  // First update controller.matrixWorld. Extract its world rotation into rotationMatrix,
  // copy its world position into raycaster.ray.origin, and transform local (0, 0, -1)
  // by that rotation to produce a normalized world-space direction. Then call
  // raycaster.intersectObjects(exhibits, true): true includes each group's child meshes.
  // If a hit exists, start at intersections[0].object and follow .parent until an object
  // with userData.isExhibit is found; pass that group to selectExhibit(...). Empty space
  // must do nothing. The E-key simulator exercises this exact code path on desktop.
  console.info('Controller select is ready for your raycasting code.', { raycaster, rotationMatrix, selectedExhibit });
}

// Desktop-only controller pose simulator. Do not replace it with mouse raycasting: using
// the same controller object and "select" event means TODOs 4–7 are tested end to end.
const desktopControllerOrigin = new THREE.Vector3();
const desktopAimPoint = new THREE.Vector3();
const desktopAimDirection = new THREE.Vector3();
const controllerForward = new THREE.Vector3(0, 0, -1);

function syncDesktopController() {
  if (!controller || renderer.xr.isPresenting) return;

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
  // WebXR target-ray spaces use matrixAutoUpdate = false because an XRSession normally
  // writes their matrices directly. The simulator must rebuild the local matrix itself.
  controller.updateMatrix();
  controller.visible = true;
  container.classList.add('desktop-controller-ready');
}

window.addEventListener('keydown', (event) => {
  if (event.code !== 'KeyE' || event.repeat || renderer.xr.isPresenting || !controller) return;
  controller.dispatchEvent({ type: 'select' });
});

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
  syncDesktopController();
  renderer.render(scene, camera);
}

// TODO 2 — Give frame scheduling to the WebXR-aware renderer
// Delete startDesktopLoop and its call, then call renderer.setAnimationLoop(render) once.
// requestAnimationFrame uses the browser window's display; setAnimationLoop switches to
// the headset's XRSession frames while presenting and continues to work on desktop.
// There must never be two active loops. Desktop orbiting/resizing should look unchanged.
function startDesktopLoop(callback) {
  function frame() {
    callback();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
startDesktopLoop(render);

// TODO 3 — Enable XR and expose session entry
// Add the VRButton import at the top, set renderer.xr.enabled = true immediately after
// creating/configuring the renderer, and append VRButton.createButton(renderer) to body.
// The helper displays ENTER VR when immersive-vr is available and an explanatory message
// otherwise. The button/message is the desktop-visible check for this TODO. Keep the DOM
// instructions for desktop; only the canvas-texture info panel is visible in the headset.

window.addEventListener('resize', resizeRenderer);
status.textContent = 'Desktop preview ready · begin with TODO 1';

// The desktop simulator is a development aid, not a separate assessed interaction.
// A real XR session supplies the controller pose and trigger event automatically.
void onControllerSelect;
void selectExhibit;
