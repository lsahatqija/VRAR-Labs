# Instructor answer guide

The completed code is in `solution/src/main.js`. This map is deliberately outside the student ZIP.

1. **Scene graph and transforms** — `placements` stores a position, Y rotation, and uniform scale for each exhibit. The loop applies these values to the parent `THREE.Group`, records the individual `restingScale`, and adds it to `gallery`. The stronger reference rotations/scales make this step visible without changing the pedestal layout.
2. **XR render loop** — `renderer.setAnimationLoop(render)` replaces the window-level `requestAnimationFrame` helper. Three.js continues scheduling desktop frames but switches to the active `XRSession` frame source during immersive presentation. Only one loop may remain.
3. **Enable WebXR** — import `VRButton` from `three/addons/webxr/VRButton.js`, set `renderer.xr.enabled = true`, and append `VRButton.createButton(renderer)`. On desktop, either the entry button or its availability message is the visible proof that this step ran.
4. **Controller** — `renderer.xr.getController(0)` returns the target-ray space for the first input source. Add it to the scene and connect `select` to `onControllerSelect`. It has a transform but no visible model. Outside XR, `syncDesktopController` gives that same object a camera-relative pose and the `E` key dispatches the same event for testing.
5. **Visible ray** — a `THREE.Line` runs from local `(0, 0, 0)` toward local `(0, 0, -1)` and is scaled to ten metres. Parenting it to the controller makes it inherit either the simulated desktop pose or the real XR pose.
6. **Recursive raycast** — update the controller world matrix, copy its world position into the ray origin, and rotate local negative Z into the world-space ray direction. `intersectObjects(exhibits, true)` includes child meshes and returns hits nearest-first. `findExhibitAncestor` climbs from the nearest mesh to the group marked with `userData.isExhibit`. The desktop `E` key exercises this exact path.
7. **Selection feedback** — ignore a repeated selection, restore the previous group's recorded `restingScale`, enlarge the new group to 112% of its own resting scale, and update both the canvas-texture panel and desktop readout from the exhibit's `userData`.

The desktop simulator deliberately supplies input only; it does not contain an alternative mouse raycaster. It calls `controller.updateMatrix()` after setting the simulated pose because Three.js disables automatic matrix updates on WebXR target-ray spaces. This keeps the no-headset test representative of the assessed controller code. It cannot replace final headset checks for stereo rendering, tracking, input mappings, or session lifecycle.

Discussion points: A-Frame supplied entity/component declarations, resize behavior, the WebXR loop, session entry UI, controller abstractions, and raycaster components. Direct Three.js makes each responsibility visible and offers lower-level control over state and rendering.
