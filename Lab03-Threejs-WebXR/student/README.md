# Three.js and WebXR: Programming an Interactive VR Scene

In this 90-minute lab, you will rebuild a small exhibition directly with JavaScript, Three.js, and WebXR. The starter already renders a desktop gallery, so every task begins from a visible, working scene.

## Learning outcomes

By the end, you can:

- organize meshes inside `THREE.Group` scene-graph hierarchies;
- apply position, rotation, and scale transforms;
- explain the camera, renderer, and animation loop;
- enable immersive WebXR in a Meta Quest 2 browser;
- attach a ray to a controller and raycast through child meshes;
- maintain a single selected exhibit with visible feedback;
- identify work that A-Frame previously handled for you.

Prerequisites: JavaScript modules, basic vector coordinates, npm, a recent desktop browser, and the earlier A-Frame exhibition lab. A Quest 2 is useful for the final check but is not required for the first tasks.

## Setup

Use Node.js 20.19+ or 22.12+.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Drag to orbit and scroll to zoom. Keep the browser console open while working.

Build a production bundle at any time with:

```powershell
npm run build
```

## Quest 2 over local HTTPS

WebXR requires a secure context. `localhost` is special on the computer, but a plain `http://192.168…` LAN address is **not** a secure context and should not be used for headset WebXR.

1. Connect the computer and Quest 2 to the same private Wi-Fi network. Guest Wi-Fi often blocks device-to-device traffic.
2. Find the computer's IPv4 address with `ipconfig`; use the active Wi-Fi adapter's address, such as `192.168.1.42`.
3. Start Vite with its local-development certificate:

   ```powershell
   npm run dev:https
   ```

4. In Quest Browser, open the **Network** URL Vite prints, for example `https://192.168.1.42:5173`.
5. The locally generated certificate is not publicly trusted. For this private lab server only, use the browser's advanced option to continue past the warning. Do not use this workaround for a deployed site.
6. After TODO 3, choose **Enter VR** and allow immersive-mode access.

If the headset cannot connect, keep Vite running, verify both devices are on the same subnet, try the URL on a phone connected to the same Wi-Fi, allow Node.js through the computer's private-network firewall, disable VPNs temporarily, and check that client isolation is off. If your institution blocks local traffic or certificate bypasses, use an approved HTTPS tunnel or deployed HTTPS host according to its policy.

## Files

- `index.html` — accessible lab shell and canvas mount point.
- `src/main.js` — numbered TODOs, scene setup, and interaction scaffold.
- `src/gallery.js` — room, lighting, pedestals, and the in-world information panel.
- `src/exhibits.js` — three original grouped exhibits made from primitives.
- `src/style.css` — responsive desktop/mobile lab shell.
- `vite.config.js` — LAN binding and HTTPS-only local certificate mode.

## Tasks

Work through the TODOs in `src/main.js` in order.

### TODO 1 — Arrange the exhibit groups

`createExhibits()` returns three `THREE.Group` objects. Each group contains the meshes that form one complete object, so transform the group rather than positioning its vessel parts, building parts, or sculpture parts separately.

Replace the starter loop with a `placements` array that gives every exhibit a position, Y rotation, and uniform scale. In the loop, read the matching placement, apply it with `position.fromArray(...)`, `rotation.set(...)`, and `scale.setScalar(...)`, then add the group to `gallery`. Save the chosen scale as `exhibit.userData.restingScale`; TODO 7 will use it to undo selection feedback without destroying this layout.

The pedestal centres are `[-2.3, 1, -1.75]`, `[0, 1, -1.75]`, and `[2.3, 1, -1.75]`. Choose noticeably different rotations and scales so the exercise has an obvious desktop result.

**Desktop check:** the three objects remain centred on separate pedestals, but their orientation and size now visibly differ. Inspecting or moving a group affects all of its child meshes together.

### TODO 2 — Use the XR-compatible animation loop

Delete `startDesktopLoop` and its call. Replace them with one call to `renderer.setAnimationLoop(render)`. A window-level `requestAnimationFrame` callback is appropriate for a normal monitor; during an immersive session the headset's `XRSession` must schedule frames. Three.js handles that switch through `setAnimationLoop`.

**Desktop check:** orbit damping and resizing still work exactly as before. This TODO is deliberately behavior-preserving on desktop; verify in the browser debugger that there is only one render path, not both loops running together.

### TODO 3 — Enable WebXR and add the entry button

Import `{ VRButton }` from `three/addons/webxr/VRButton.js`. Set `renderer.xr.enabled = true` when configuring the renderer, then append `VRButton.createButton(renderer)` to `document.body`. The helper checks WebXR support and owns the request/end-session UI.

**Desktop check:** a button or WebXR availability message appears at the bottom of the page. Desktop rendering must remain intact. A normal desktop browser may correctly report that VR is unsupported; the visible message still confirms that the helper was installed.

### TODO 4 — Add a controller

Assign `renderer.xr.getController(0)` to the supplied `controller` variable, add it to `scene`, and register `onControllerSelect` for its `select` event. This object represents the first input source's target-ray transform. It is not a controller model and contains no geometry by itself.

The starter includes a desktop simulator. When no XR session is active, it gives this same controller object a camera-relative pose; pressing `E` dispatches the same `select` event that a headset trigger would dispatch. Do not replace this with a separate mouse-picking implementation.

**Desktop check:** the centre reticle and “Press E” hint appear after the controller exists. Pressing `E` logs the starter handler message. **Headset check:** the same handler runs when the primary trigger is pressed.

### TODO 5 — Show a controller ray

Create a `THREE.BufferGeometry` from local points `(0, 0, 0)` and `(0, 0, -1)`. Combine it with a `THREE.LineBasicMaterial` in a `THREE.Line`, stretch the line to 10 metres with `scale.z`, and add it as a child of `controller`. Negative Z is the WebXR target-ray forward direction. Parenting is important: the line then inherits the controller's position and rotation automatically.

**Desktop check:** a mint ray appears from the simulated lower-right controller position and converges on the centre reticle while you orbit. **Headset check:** the same ray follows the Quest controller.

### TODO 6 — Raycast recursively

In `onControllerSelect`, call `controller.updateWorldMatrix(true, false)`. Extract the rotation from `controller.matrixWorld`, obtain the world position for `raycaster.ray.origin`, and transform local forward `(0, 0, -1)` by that rotation to produce a normalized world-space direction.

Call `raycaster.intersectObjects(exhibits, true)`. The second argument must be `true` because the visible geometry belongs to child meshes, while `exhibits` contains their parent groups. Results are nearest-first, so use index `0`. Starting at that hit's `.object`, walk up `.parent` references until `userData.isExhibit` identifies the complete exhibit group. Select that group; return without changing anything when there is no hit.

**Desktop check:** orbit until the reticle and ray cross an exhibit, then press `E`. The correct whole group reaches `selectExhibit`; aiming at empty space does nothing. This uses the same world-matrix and recursive-raycast code as XR.

### TODO 7 — Show one selection

If the requested exhibit is already selected, return so repeated input cannot keep enlarging it. Restore the previous selection with its saved `userData.restingScale`, store the new group, and enlarge it to `restingScale * 1.12`. Update the in-world canvas panel with `infoPanel.userData.update(name, description)` and set `selectionReadout.textContent` to the same exhibit's name.

**Desktop check:** pressing `E` visibly enlarges the aimed-at exhibit, changes the upper-right HTML readout, and redraws the in-world panel. Select a different object and confirm the first returns to its individual resting scale. **Headset check:** the same title, description, and scale feedback appear in VR.

## Desktop controller simulation

The simulator is intentionally small and remains outside the seven assessed TODOs. It only supplies a pose and keyboard event when `renderer.xr.isPresenting` is false. It calls `controller.updateMatrix()` explicitly because Three.js target-ray spaces have `matrixAutoUpdate` disabled—the active XR session normally writes that matrix. It does not implement a second selection algorithm:

1. Drag to orbit until the centre reticle covers an exhibit.
2. Confirm that the visible mint line points at the same place.
3. Press `E` to dispatch the controller's `select` event.
4. Use the console, scale change, readout, and in-world panel to verify TODOs 4–7 in stages.

A desktop browser still cannot validate stereo presentation, headset tracking, input-profile mappings, comfort, or the Quest Browser's HTTPS/session behavior. Complete the physical-device checklist before treating the XR implementation as verified.

## A-Frame comparison

Discuss with a partner:

- Which Three.js objects replace A-Frame's scene, camera, entities, and components?
- Which renderer, resize, loop, lighting, and shadow responsibilities did A-Frame hide?
- What extra steps are now required for the controller, ray visualization, recursive hit testing, and selection state?
- When would the lower-level control be worth the additional code?

## Reusing your earlier exhibits

Replace one factory in `src/exhibits.js` with your own locally available model or geometry. Return a `THREE.Group` and preserve the `userData.isExhibit`, `name`, and `description` fields. Keep all files inside this project. Asset preparation is outside this lab's assessed work.

## Troubleshooting

- **Blank scene:** check the console first. Confirm the renderer canvas is still appended, the camera remains near `(0, 2.15, 5.7)`, and the render loop calls `renderer.render(scene, camera)`.
- **Missing exhibit:** ensure its group was added to `gallery` or `scene`, is near a pedestal, has a non-zero scale, and is in front of the camera. A mesh may be inside a group several levels deep.
- **WebXR unsupported:** use Quest Browser through HTTPS. Desktop browsers without a connected headset may report that immersive VR is unavailable; this does not mean the scene is broken.
- **Quest cannot reach Vite:** use the computer's active LAN IPv4 address, keep `--host` enabled, check firewall/private-network permissions, avoid guest Wi-Fi and VPNs, and test from another device.
- **Controller ray missing:** add the controller to the scene, the line to the controller, and draw toward local `-Z`. Ensure the line is long enough and the material is visible against the room.
- **Raycast misses:** update the controller's world matrix, create the direction from its world rotation, pass `true` to `intersectObjects(exhibits, true)`, and use the nearest result at index `0`.
- **Selection changes only one part:** climb from `hit.object` to the ancestor with `userData.isExhibit`; scale that group, not the mesh.
