# Lab 05: Improving User Experience in a VR Exhibition

**Status: incomplete development scaffold.** This is not yet the requested student lab and cannot be run as an application. Do not distribute it to students.

The procedural gallery and exhibits were copied from the completed Lab 03 reference solution. Initial pure helpers in `src/math/pose-helpers.js` cover simulator pose constraints and the proposed controller-panel transforms. `src/interaction/state-machine.js` contains a preliminary action transition function and nearest-obstruction selection rule. Run their checks after installing the pinned dependencies:

```powershell
npm ci
node --test test/core.test.js
```

Still required: application entry point, desktop simulator and TransformControls, shared input routing and XR session lifecycle, working exhibition interactions and teleportation, UX task modules and isolated baseline, telemetry and export, student and instructor documents, browser and headset verification, and distribution ZIP. The pure helpers have not been integrated into a running application.
