# Lab 02 — Browser-based VR: Build a Virtual Exhibition

**Duration:** 90 minutes. **Work:** pairs, changing driver halfway through.
**Tools:** HTML, JavaScript, A-Frame 1.8.0, browser developer tools, and optionally a WebXR-compatible headset browser.

## Goal and finished result

Build a small virtual exhibition with three objects on pedestals, a readable label for each, and an interaction that selects an object and displays information. Test the same scene on desktop and, when available, inside a headset. Explain world coordinates, camera position, metre-based scale, stereoscopic viewing, and the differences between a desktop 3D scene and immersive VR.

Use primitive shapes rather than imported models: a cube, sphere, and cylinder. No account, backend, model download, marker, or camera feed is needed for the core task. The supplied scene deliberately uses only A-Frame plus its built-in text font, which may require network access on first load.

The default selection method is **head-direction dwell**: keep the centre reticle on an object for 1.2 seconds. On desktop, simulate this by dragging the view. This is commonly called gaze interaction, but it does not track pupils or require eye-tracking hardware. Optional controller rays and a mouse-pointer alternative are included.

## Learning outcomes

By the end, students should be able to:

- Place objects in a 3D coordinate system and distinguish local from world coordinates.
- Use dimensions in metres and calculate where an object's bottom touches a pedestal.
- Explain the camera rig and why headset tracking supplies the user's view in immersive mode.
- Attach reusable JavaScript behaviour to an A-Frame entity.
- Use a raycaster and cursor to select only designated objects.
- Identify the contributions of A-Frame, Three.js, WebGL, and WebXR.
- Explain stereo views, head tracking, and why a mouse-controlled perspective image is not equivalent to immersive VR.

## Instructor preparation — before the 90 minutes

1. Give students this guide and `starter/index.html`. Keep `solution/index.html` as a recovery example or reference after the exercise.
2. Ensure each computer has an editor and a modern WebGL-capable browser. VS Code with Live Server is convenient; Python's HTTP server is an alternative.
3. Confirm that `https://aframe.io/releases/1.8.0/aframe.min.js` loads on the classroom network. Pin this version for everyone. Check that text renders too; font assets can also be blocked.
4. Prepare a trusted HTTPS route for student pages if testing headsets. A preconfigured static host or an institution-managed HTTPS server avoids spending the lab on certificates. Use a full-page URL rather than an embedded preview.
5. Pre-test one page in the actual headset browser and confirm that it offers `immersive-vr`, enters a session, and selects an exhibit. Availability depends on the device, browser, runtime, and configuration; having a headset is not by itself sufficient.
6. Plan short headset rotations while other pairs complete desktop observations. A seated or stationary standing test is enough. Keep a clear area; stop if a student feels discomfort. Artificial locomotion is disabled in immersive mode in the supplied scaffold.

**Important:** `http://localhost:8000` is suitable for local desktop development. In a headset, `localhost` means the headset itself. `http://192.168.x.x:8000` may display the scene but does not normally satisfy WebXR's secure-context requirement. Use trusted HTTPS for the headset; do not make disabling browser security a classroom setup step.

## Suggested timing

| Minutes | Activity | Checkpoint |
|---|---|---|
| 0–8 | Explain the stack and demonstrate the exhibition | Students know what each layer contributes |
| 8–18 | Start the project and serve it locally | Floor, wall, title, and reticle appear |
| 18–35 | Build three exhibits and solve placement | Shapes sit on pedestals |
| 35–43 | Add labels and check readability | Three labels are legible |
| 43–58 | Implement selection and information | All three objects can be selected |
| 58–70 | Coordinate, camera, scale, and Three.js experiments | Predictions and observations recorded |
| 70–83 | Headset testing or desktop comparison activity | Test status and evidence recorded |
| 83–90 | Review and submit | Project and short observation sheet |

## Step 1 — Understand the technology stack

| Technology | Job in this lab |
|---|---|
| HTML | Describes the scene with elements such as `<a-box>` |
| JavaScript | Implements selection, information updates, and visit counting |
| A-Frame | Provides entities, components, controls, and scene setup |
| Three.js | Provides the underlying scene graph, meshes, materials, cameras, and renderer |
| WebGL | Browser graphics API used to render the 3D scene |
| WebXR | Connects an immersive session to headset poses, eye views, and supported input sources |

A-Frame uses Three.js underneath. WebXR supplies XR session and device data; it is not a replacement for the rendering library. A-Frame already manages the render loop, so do not create another renderer or import a separate Three.js build in this exercise.

Connection to the previous AR lab: both tasks place virtual geometry in a coordinate system. Previously, marker tracking related virtual content to a physical marker seen by a camera. Here, you author a virtual world; in immersive mode the browser/runtime relates the headset's tracked pose to that world. The scene does not need a marker or a real camera background.

## Step 2 — Start and run the project

1. Copy `starter/index.html` into a new folder called `lab02-exhibition`.
2. Open the folder in your editor. Keep the filename `index.html`.
3. Either use **Open with Live Server**, or open a terminal in that folder and run:

   ```bash
   python -m http.server 8000
   ```

   On Windows, `py -m http.server 8000` may be the available command; on Linux/macOS, use `python3` if necessary.
4. Open `http://localhost:8000` in your browser. Do not rely on double-clicking the file as your test route.
5. Open developer tools. Check the Console for errors and Network for failed resources.
6. Drag on the scene to look around. Use W/A/S/D to move the rig on the horizontal plane. In this simple scaffold those keys follow the world's axes rather than the camera's current yaw. Reload to return to the starting position.

The starter includes a floor, wall, a one-metre reference bar, an information panel, a camera rig, the centre reticle, controller rays, and desktop-navigation behaviour. Your tasks are to build the exhibits and implement their behaviour.

**Checkpoint:** the scene renders; you can look around; you can identify the floor and information panel. There are no exhibits yet.

## Step 3 — Build the three exhibits

The coordinate convention is right-handed. From the starting view, +X is right, +Y is up, and -Z is forward into the scene. Positions become relative to the parent when an element is nested. A-Frame uses metres for spatial dimensions and degrees for rotation.

Create each display as a parent entity. Add the following cube group inside `<a-scene>`, at the starter's exhibit placeholder:

```html
<a-entity id="cube-group" position="-1.6 0 -3.5">
  <a-box position="0 0.55 0"
         width="0.95" height="1.1" depth="0.95"
         color="#F1F3F5"></a-box>

  <a-box id="cube" class="clickable"
         position="0 1.4 0"
         width="0.6" height="0.6" depth="0.6"
         color="#3A80D2"
         exhibit="title: Cube; description: Each edge is 0.6 metres.">
  </a-box>
</a-entity>
```

Before adding the other groups, work out the cube's world position. With no parent rotation or scaling, add parent and child positions: `(-1.6, 0, -3.5) + (0, 1.4, 0) = (-1.6, 1.4, -3.5)`.

Use this plan to build the sphere and cylinder groups. Give every selectable shape a unique ID, `class="clickable"`, and an `exhibit` attribute containing its title and description. Duplicate the pedestal into each group.

| Exhibit | Group/world base position | Shape local centre | Dimensions |
|---|---|---|---|
| Cube | `-1.6 0 -3.5` | `0 1.4 0` | Width, height, depth: `0.6` |
| Sphere | `0 0 -3.5` | `0 1.45 0` | Radius: `0.35` |
| Cylinder | `1.6 0 -3.5` | `0 1.45 0` | Radius: `0.3`; height: `0.7` |

For the sphere use `<a-sphere>`; for the cylinder use `<a-cylinder>`. Choose a different colour for each.

**Solve the placement:** the pedestal's centre is at 0.55 m and its height is 1.1 m, so its top is at `0.55 + 1.1 / 2 = 1.1 m`. The cube's bottom is `1.4 - 0.6 / 2 = 1.1 m`. The sphere's bottom is `1.45 - 0.35 = 1.1 m`. The cylinder's bottom is `1.45 - 0.7 / 2 = 1.1 m`.

**Checkpoint:** all three shapes rest on pedestals instead of intersecting them or floating. They are separated and visible from the starting area.

## Step 4 — Add readable labels

Put this inside the cube group; adapt its text in the other two groups:

```html
<a-plane position="0 0.72 0.49"
         width="1.25" height="0.45" color="#172B42"></a-plane>
<a-text value="CUBE\n60 cm edges"
        position="0 0.72 0.5"
        align="center" width="1.6" color="#FFFFFF"></a-text>
```

The label faces the starting viewing area. Its text sits 0.01 m in front of the backing plane to avoid surfaces competing at the same depth. For the sphere write “70 cm diameter”; for the cylinder write “70 cm tall”.

These are world-space labels: moving the camera changes their appearance, and they stay beside their exhibits. The centre reticle is a child of the camera, so it follows the user's view. Ordinary HTML outside the scene is not automatically visible in immersive VR; use scene text for essential information.

**Checkpoint:** read all three labels from the starting area and from a slightly closer desktop viewpoint. Fix text size and contrast before adding detail.

## Step 5 — Implement selection in JavaScript

The supplied reticle has:

```html
cursor="rayOrigin: entity; fuse: true; fuseTimeout: 1200"
raycaster="objects: .clickable; far: 10"
```

The ray extends in the reticle's forward direction. The raycaster finds intersections with `.clickable` objects up to 10 m away. The cursor converts a 1.2-second dwell into a `click` event. Using `.clickable` keeps the floor, labels, and pedestals out of the selection set. For this lab those nonselectable surfaces also do not block the selection ray.

Add this component inside the existing script, at its Step 5 placeholder, before the scene HTML is parsed:

```javascript
AFRAME.registerComponent('exhibit', {
  schema: {
    title: {type: 'string'},
    description: {type: 'string'}
  },
  init: function () {
    this.originalColor = this.el.getAttribute('material').color;
    this.onClick = () => {
      const scene = this.el.sceneEl;
      scene.querySelectorAll('[exhibit]').forEach(el => {
        el.setAttribute('material', 'color',
          el.components.exhibit.originalColor);
      });
      this.el.setAttribute('material', 'color', '#FFDA6A');
      scene.querySelector('#info-title')
        .setAttribute('text', 'value', this.data.title);
      scene.querySelector('#info-description')
        .setAttribute('text', 'value', this.data.description);
      this.el.dataset.visited = 'true';
      const count = scene.querySelectorAll(
        '[exhibit][data-visited="true"]').length;
      scene.querySelector('#progress').setAttribute(
        'text', 'value', `Exhibits explored: ${count}/3`);
    };
    this.el.addEventListener('click', this.onClick);
  },
  remove: function () {
    this.el.removeEventListener('click', this.onClick);
  }
});
```

`schema` defines per-exhibit data. `init` runs when the component is attached. `this.el` is the object carrying the component. The callback updates scene text and materials. `remove` unregisters the listener if the component is removed.

Drag the view until the reticle rests on the cube, then hold still. Repeat for the sphere and cylinder. Aim at actual shapes, not labels. The selected object turns yellow; the information changes; the unique visit count reaches 3/3. Selecting the same object again must not raise the count beyond three.

**Checkpoint:** each object displays its own title and description, previous selection colours reset, and labels/floor do not trigger exhibit actions.

### Mouse-pointer alternative

If desktop students prefer point-and-click, replace the reticle's cursor attribute with `cursor="rayOrigin: mouse; fuse: false"` and set its `visible="false"`. Keep the raycaster. Click an exhibit instead of dwelling. Set the camera to `look-controls="mouseEnabled: false"` so clicking does not also drag the view; use the fixed starting view and W/A/S/D for this variant. Restore the original reticle and look-controls before a head-direction headset test. Use one method at a time when comparing inputs.

The provided `laser-controls` entities offer controller pointing and trigger selection on supported devices. They use the same `.clickable` raycast filter and the same exhibit component. Controller models are disabled to avoid an extra model download. Head-direction dwell remains the required fallback.

## Step 6 — Solve the spatial problems and inspect Three.js

Make each temporary change separately, record a prediction and observation, and restore the baseline afterward.

| Experiment | Change | Observation to explain |
|---|---|---|
| Forward/backward | Cube group Z: `-3.5` to `+3.5` | It moves behind the initial view, rather than disappearing from the world |
| Local/world | Cube child X: `0` to `0.4` | Only the cube shifts; its world X is now `-1.2` |
| Group transform | Cube group X: `-1.6` to `-2` | Shape, pedestal, and label move together |
| Camera height | Desktop camera Y: `1.6` to `0.8` | The viewpoint is lower; exhibit dimensions are unchanged |
| Real-world scale | Cube dimensions: `0.6` to `0.06` | Cube becomes 6 cm across; keep it on the pedestal by changing local centre Y to `1.13` |
| Distance | Move rig from `0 0 0` to `0 0 -1` | Shapes appear larger because they are closer; their dimensions stay unchanged |

The simple coordinate addition works only without parent rotation/scaling. General world transforms also include those operations.

After the scene has loaded, use the Console:

```javascript
const cube = document.querySelector('#cube');
cube.object3D;                       // Three.js Object3D
cube.getObject3D('mesh');             // Underlying renderable Mesh
cube.object3D.position;              // Local position
const world = new AFRAME.THREE.Vector3();
cube.object3D.getWorldPosition(world);
world;                              // World position
```

`AFRAME.THREE` exposes the Three.js copy used by A-Frame. The HTML element is the authoring interface; `object3D` is its underlying scene-graph object. Notice that the cube's local X is zero while its world X is -1.6 at baseline. Change the parent and query again.

Optional inspection: press **Ctrl+Alt+I** (macOS: **Control+Option+I**) to open A-Frame's inspector. It can help visualize transforms; it may load extra resources, so Console inspection is the fallback. Make lasting changes in the HTML and reload rather than depending on unsaved inspector edits.

## Step 7 — Desktop and immersive VR comparison

### Desktop test — required for everyone

1. Reload to restore the start pose.
2. Confirm all three exhibits and labels are visible.
3. Select each object and verify its information.
4. Select one object again and confirm the counter remains 3/3.
5. Move forward and sideways. Describe perspective size changes and motion parallax.
6. Confirm there are no JavaScript errors.

### Headset test — where available

1. Put the student's page on the instructor's prepared HTTPS route. Wait for deployment to finish; open the exact full-page URL in the headset browser.
2. Click A-Frame's VR-entry control and accept the required permission prompts. This user action starts the immersive session.
3. Look around. Confirm the world stays fixed as the view changes.
4. While stationary or within the cleared area, lean slightly sideways and forward. Observe viewpoint translation and parallax if positional tracking is supported.
5. Select each object with head-direction dwell. If controllers are available, also point a controller ray and use its trigger.
6. Judge object scale against the one-metre reference and your own sense of body size. Check whether labels are comfortably readable.
7. Observe binocular viewing of a near object and a farther surface. Each eye receives a view from a different eye position; the brain uses their disparity as a depth cue. A desktop perspective image also has depth cues, but ordinary monitor viewing does not provide those headset eye views.
8. Exit VR and record device/browser, success, and observations. Avoid artificial movement for this introductory headset test.

The rig is at floor level and the desktop camera starts at 1.6 m. In immersive VR, the tracked pose supplies camera position/orientation relative to the selected reference space. Do not add another fixed 1.6 m rig elevation, which can lift the virtual user too high. The runtime supplies per-eye view/projection parameters; do not implement stereo by manually duplicating the desktop camera or guessing eye separation.

| Aspect | Desktop scene | Immersive VR session |
|---|---|---|
| Display | Perspective image on a monitor | Runtime supplies eye views to the headset |
| Looking | Mouse-drag simulated rotation | Tracked head rotation |
| Position | Scripted rig movement with keys | Tracked pose, with positional tracking where supported |
| Apparent scale | Influenced strongly by distance and monitor view | Metre-based world related to tracked physical space |
| Interaction | Simulated head-direction dwell or mouse ray | Head-direction dwell or supported controller/input ray |
| Session | Ordinary page rendering | Explicit immersive session with browser permissions |

Showing the page full-screen is not proof of immersive VR. Rendering a desktop scene successfully is not proof that a headset session works.

### If no headset is available

Complete the desktop test, the spatial experiments, and the comparison table. Observe parallax using W/A/S/D and distinguish it from binocular disparity. Mark **Headset test: not performed — no compatible headset available**. Write two predictions about immersive behaviour, explicitly marked as predictions. A headset demo viewed on a monitor or a development emulator can explain the flow, but it does not validate comfort, perceived scale, stereo perception, or physical tracking.

### Optional capability check

Run in the Console:

```javascript
window.isSecureContext;
navigator.xr;
if (navigator.xr) {
  navigator.xr.isSessionSupported('immersive-vr')
    .then(supported => console.log('immersive-vr:', supported))
    .catch(error => console.error(error));
}
```

Support returning `true` indicates the session type is available; entering it still requires user action and permissions. Support returning `false` does not prevent ordinary desktop 3D rendering.

## Troubleshooting

| Symptom | Check/fix |
|---|---|
| Blank page | Confirm the A-Frame script loads and inspect the first Console error |
| Shapes behind you | Check Z sign; initial forward is -Z |
| Shape floats/sinks | Calculate bottom height from centre minus half-height/radius |
| Only one shape responds | Confirm class, component attribute, and unique IDs on each shape |
| No selection | Aim at shape; check `.clickable`, ray range, dwell time, and component registration |
| Wrong description | Check per-object `exhibit` data and shared information-panel IDs |
| Label flickers | Separate text from its backing plane along Z |
| Text missing | Check font/resource requests and avoid unsupported glyphs in this introductory project |
| Desktop keys pass through objects | Expected: this scaffold has no collision/physics system |
| HTTP page renders but VR fails | Use a trusted HTTPS headset URL; LAN HTTP is not localhost |
| VR control absent/session rejected | Check secure context, WebXR capability, permissions, device runtime, and full-page URL |
| User appears too high in VR | Keep rig Y at zero; check reference-space/floor setup and avoid adding eye height twice |
| Mouse variant fails in headset | Restore entity-origin dwell; a desktop mouse ray is not head-direction input |

## Submission and review

Submit `index.html`, one desktop screenshot, and a short observation sheet containing:

1. World position and dimensions of all three exhibits.
2. Results of at least three temporary spatial experiments.
3. One local-versus-world position example from Three.js inspection.
4. Two desktop-versus-immersive differences, including stereoscopic viewing.
5. Headset test status: device/browser and result, or an explicit not-tested statement.
6. Explanation of how selection works: ray origin, eligible targets, dwell/trigger, event, response.

Review checklist: three objects on pedestals; three readable labels; reusable component; all three respond; one current highlight; correct information; unique count stays within 0–3; metre-based scale explained; desktop test complete; immersive test status honest.

Optional extensions after the required work: add a fourth exhibit (update the counter's denominator), change dwell duration and compare accidental selections, or add subtle hover feedback. Avoid imported models, physics, teleportation, and multiplayer until the core learning outcomes are complete.

## Documentation

- A-Frame installation: https://aframe.io/docs/1.8.0/introduction/installation.html
- A-Frame basic scene: https://aframe.io/docs/1.8.0/guides/building-a-basic-scene.html
- A-Frame interaction guide: https://aframe.io/docs/1.8.0/introduction/interactions-and-controllers.html
- Cursor reference: https://aframe.io/docs/1.7.0/components/cursor.html
- Camera and rig reference: https://aframe.io/docs/1.7.0/components/camera.html
- Three.js access: https://aframe.io/docs/1.7.0/introduction/developing-with-threejs.html
- WebXR: https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API
- WebXR security: https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API/Permissions_and_security

The 1.7 references above document the component APIs consulted while preparing this lab; the supplied script is pinned to 1.8.0. Consult the matching current documentation when extending the project.
