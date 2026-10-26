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

Replace the starter loop with three explicit additions. Put each group above a pedestal and apply a small rotation or scale. Inspect `src/exhibits.js`: each exhibit is a `THREE.Group` containing several meshes.

**Check:** the vessel, building, and sculpture sit separately on the three pedestals. Moving a group moves all of its child meshes.

### TODO 2 — Use the XR-compatible animation loop

Replace the desktop `requestAnimationFrame` helper with the renderer API that schedules frames for both flat-screen and XR presentation.

**Check:** the desktop preview still animates and resizes. There must be only one active render loop.

### TODO 3 — Enable WebXR and add the entry button

Import Three.js's `VRButton`, enable XR on the renderer, and append the button it creates. Use the pinned Three.js add-on import path already demonstrated by `OrbitControls`.

**Check:** an Enter VR button appears when the browser supports immersive VR; otherwise it displays a useful availability message. Desktop rendering must remain intact.

### TODO 4 — Add a controller

Request controller index `0` from `renderer.xr`, add it to the scene, and register `onControllerSelect` for its `select` event.

**Check:** no console errors occur when entering VR and the handler runs when the primary trigger is pressed.

### TODO 5 — Show a controller ray

Create a line from the controller origin along its local negative Z axis. Make it long enough to reach the exhibits and add it as a child of the controller.

**Check:** a visible ray follows the Quest controller as it moves.

### TODO 6 — Raycast recursively

In `onControllerSelect`, obtain the controller's world rotation and position, update `raycaster.ray`, then test `exhibits` recursively. Use the first intersection. Because the hit object is a child mesh, walk up its `.parent` chain until `userData.isExhibit` is true.

**Check:** pointing at the body, roof, door, knot, or base resolves to the correct whole exhibit. Empty space does nothing.

### TODO 7 — Show one selection

Restore the old selection to scale `1, 1, 1`, store the new group, enlarge it slightly, and update both the in-world panel and desktop readout using the group's `userData`.

**Check:** only the newest selection is enlarged; the previous exhibit returns to normal. Its title and description appear on the panel inside VR.

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
