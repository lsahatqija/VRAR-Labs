# Lab 05: Improving User Experience in a VR Exhibition

**Designing, Testing, and Refining Controller-Based Interactions**

This 90-minute starter reuses the procedural Three.js exhibition from Lab 03. It runs entirely on desktop and uses the same semantic actions in immersive WebXR. Open `?condition=student` for editable tasks or `?condition=baseline` for the unchanged comparison.

## Setup

```powershell
npm ci
npm run dev
```

Open `http://localhost:5173/?condition=student`. Run `npm run check` before submission.

## Desktop controls

- Drag the gizmo; choose **Translate** or **Rotate**. Translation stays in the configured camera-relative box and total rotation stays within 90° of neutral.
- Press floating **Primary** and **Secondary**. The exhibition ray comes from the controller, never the mouse.
- Right-drag empty canvas to look; use WASD to walk. Camera input pauses during gizmo dragging.
- **Reset controller** restores the simulator. **Reset experience** or Escape recovers the experience.

Primary selects an exhibit or confirms valid teleport. Secondary starts/cancels teleport or closes information according to state.

## Immersive WebXR

Use a secure context. `npm run dev:https` helps only after its certificate is trusted by computer and headset; an untrusted self-signed certificate may be rejected. A safer class workflow is deploying `dist/` from `npm run build` to an institution-approved HTTPS static host. From a headset use the computer's LAN IP shown by Vite, not `localhost`.

WebXR `select` maps to Primary and `squeeze` maps to Secondary. The right controller is preferred, otherwise the first tracked controller is used. The desktop simulator is disabled only while a real immersive session is active.

## Module map

`main.js` composes the app. `scene/` builds the room. `input/` owns desktop/XR adapters. `interaction/` owns semantic state and ray rules. `ui/` owns the panel. `math/pose-helpers.js` supplies tested panel math. `ux/` contains six student entry points. `baseline/config.js` isolates comparison behavior. `telemetry/` stores and exports JSON.

See [TASKS.md](TASKS.md), [TEST_WORKSHEET.md](TEST_WORKSHEET.md), and [INSTRUCTOR_NOTES.md](INSTRUCTOR_NOTES.md).

## Packaging and troubleshooting

Run `npm run package:student`; the ZIP appears at `Lab05-UX-student.zip` and excludes dependencies, build output, and instructor notes. If WebXR is unavailable, confirm HTTPS, headset browser support, and certificate trust. Desktop mode remains fully usable.
