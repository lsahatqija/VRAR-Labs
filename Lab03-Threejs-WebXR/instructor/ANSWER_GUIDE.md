# Instructor answer guide

The completed code is in `solution/src/main.js`. This map is deliberately outside the student ZIP.

1. **Scene graph and transforms** — `placements` stores a position, rotation, and scale for each exhibit. The loop applies them to each group, stores its resting scale, and adds it to `gallery`.
2. **XR render loop** — `renderer.setAnimationLoop(render)` replaces the desktop-only `requestAnimationFrame` helper. Three.js then supplies frames for both desktop and XR sessions.
3. **Enable WebXR** — import `VRButton` from `three/addons/webxr/VRButton.js`, set `renderer.xr.enabled = true`, and append `VRButton.createButton(renderer)`.
4. **Controller** — `renderer.xr.getController(0)` returns the target-ray space for the first input source. It is added to the scene and its `select` event calls `onControllerSelect`.
5. **Visible ray** — a `THREE.Line` runs from local `(0, 0, 0)` toward local `(0, 0, -1)` and is scaled to six metres. Adding it to the controller makes it inherit the controller transform.
6. **Recursive raycast** — copy the controller world position and rotation into `raycaster.ray`, then call `intersectObjects(exhibits, true)`. The results are nearest-first. `findExhibitAncestor` climbs from the child mesh to the marked group.
7. **Selection feedback** — restore the previous group's recorded resting scale, enlarge the new group by 12%, and update both the canvas-texture information panel and desktop status.

Discussion points: A-Frame supplied entity/component declarations, resize behavior, the WebXR loop, session entry UI, controller abstractions, and raycaster components. Direct Three.js makes each responsibility visible and offers lower-level control over state and rendering.
