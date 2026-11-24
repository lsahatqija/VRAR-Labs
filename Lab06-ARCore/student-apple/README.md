# Lab 06 — Native ARKit Spatial Measurement

Build a native Swift app that estimates the 3D distance between two points on an ARKit-detected surface. This is the Apple-device equivalent of `Lab06-ARCore/student`. The starter already owns camera permission, the AR session, camera rendering, plane visualization, threading, UI, and SceneKit drawing. Your job is to connect ARKit camera transforms, raycasts, anchors, and coordinate-space math.

## Learning outcomes

After this 90-minute lab you should be able to:

- read a device transform as a translation and quaternion;
- distinguish screen, camera, and AR world coordinates;
- perform a center-screen raycast against detected plane geometry;
- create, use, and remove ARKit anchors safely;
- calculate Euclidean distance from two current world-space positions; and
- explain why tracking quality changes a spatial measurement.

The finished interaction matches the Android lab: scan a surface, aim until the reticle becomes valid, tap point 1, aim and tap point 2, then inspect the two markers, line, and distance. **Reset** removes the anchors and starts over.

## Prepare before class

- A Mac with a current Xcode installation.
- An Apple ID selected in Xcode under **Settings > Accounts**.
- An ARKit-capable iPhone or iPad running iOS/iPadOS 15 or later.
- A USB cable, or wireless device debugging configured in Xcode.

ARKit world tracking is unavailable in the iOS Simulator. You must run this lab on a physical device.

## Open, build, and run

1. On a Mac, open `ARMeasurement.xcodeproj` in this folder.
2. Select the **ARMeasurement** target, open **Signing & Capabilities**, and choose your personal or university development team. Change the bundle identifier if Xcode reports that it is already taken.
3. Connect and unlock an ARKit-capable iPhone or iPad, choose it as the run destination, and press **Run**.
4. If prompted on the device, enable Developer Mode and trust the developer certificate.
5. Grant camera permission, then move slowly while pointing at a textured floor, desk, or wall until planes appear.

Repository maintainers can run `./verify-project.ps1` in PowerShell to check the plist, Xcode file references, and student TODO structure. A real compile still requires Xcode on macOS.

## Expected starter behavior

Before you complete any TODO, the app compiles and launches, shows the live camera, visualizes detected planes and feature points, reports tracking status, and displays its controls. The pose and distance remain `—`; the reticle remains neutral; taps show a TODO 3 hint. This is intentional—no placeholder is presented as a real AR raycast or measurement.

All numbered tasks are in:

`ARMeasurement/ViewController.swift`

### TODO 1 — `updateCameraPose(_:)`

When tracking is normal, read `frame.camera.transform`. Its fourth column contains the x/y/z translation. Create `simd_quatf` from the transform, format the translation and quaternion x/y/z/w components, and call `publishPose(text)`. Otherwise publish `nil`. Quaternion components describe one rotation together; they are not separate Euler angles.

### TODO 2 — `findCenterPlaneHit(_:)`

Use the center of the actual `sceneView.bounds` with `sceneView.raycastQuery(from:allowing:alignment:)`. Allow `.existingPlaneGeometry` with `.any` alignment, execute the query through `sceneView.session.raycast(_:)`, and return the first result's `worldTransform`. Publish whether the reticle is valid. Do not create an anchor for the transient reticle.

### TODO 3 — `selectCurrentHit(_:)`

Ignore a nil transform and additional taps after `measurementAnchorCount` reaches two. For a valid current transform, create `ARAnchor(name: "measurement-point", transform: transform)`, add it to the session, call `storeMeasurementAnchor(_:)`, and update the instruction. The state sequence is:

`0 points → select point 1 → 1 point → select point 2 → 2 points → Reset → 0 points`

Reset removes every measurement anchor from the AR session. The Reset button is outside the AR view, so it cannot also create a selection.

### TODO 4 — `updateDistanceAndLine(_:)` and `distanceMeters(_:_:)`

With exactly two current anchor nodes, read both `simdWorldPosition` values in this renderer update. Implement the pure function using `sqrt(dx² + dy² + dz²)`, publish `formattedDistance(result)`, and call the supplied `drawLine(from:to:)`. Otherwise publish no measurement and hide the line. Do not cache positions from different frames as endpoints.

## Test procedure

On a physical device, scan a textured surface, confirm the status says **surface found**, select two points around a known short reference, walk slightly sideways to verify visuals remain fixed, temporarily cover the camera to observe tracking loss, then Reset and confirm all visuals clear.

## Task 5 — experiment

Measure the same reference three times on a real device.

| Environment | Reference length | Trial 1 | Trial 2 | Trial 3 | Mean | Notes on tracking |
|---|---:|---:|---:|---:|---:|---|
| iPhone/iPad | | | | | | |

Questions:

1. Which coordinate space contains each anchor transform, and why can the camera move without changing the intended endpoint?
2. Why should both anchor-node positions be read during the same renderer update?
3. What changes when ARKit refines its world estimate?
4. Why does a quaternion need four components, and why should you not interpret x/y/z as pitch/yaw/roll?
5. Which surfaces or motions produced the least stable results?

## Troubleshooting

- **No signing team:** select the target's **Signing & Capabilities** tab and choose your Apple ID team.
- **Bundle identifier unavailable:** replace `edu.vrar.labs.ARMeasurementStudent` with a unique reverse-domain identifier.
- **Camera denied:** open the device's **Settings > Privacy & Security > Camera** and enable the app.
- **Unsupported destination:** use a physical ARKit-capable iPhone or iPad; Simulator is not supported.
- **No planes:** use a bright, textured surface; move slowly in a shallow arc; avoid blank, reflective, or transparent areas.
- **Tracking limited:** slow down, restore lighting/texture, uncover the camera, and revisit a previously scanned area.
- **Build warns about SceneKit deprecation:** expected. This teaching project uses `ARSCNView` because it maps closely to the Android renderer and keeps the four AR concepts visible. For a new production app, prefer RealityKit.

## Optional extensions (not required)

- Show a live preview distance from point 1 to the current valid raycast.
- Derive a phone-orientation indicator from the camera quaternion.

## Sources and attribution

This project is an original Apple-platform counterpart to the repository's ARCore lab. It follows Apple's ARKit documentation for world tracking, plane visualization, raycasting, and anchors:

- <https://developer.apple.com/documentation/arkit/arworldtrackingconfiguration>
- <https://developer.apple.com/documentation/arkit/tracking-and-visualizing-planes>
- <https://developer.apple.com/documentation/arkit/arscnview/raycastquery(from:allowing:alignment:)>
- <https://developer.apple.com/documentation/arkit/aranchor>

SceneKit is deprecated in current Apple SDKs; its use here is a deliberate instructional compatibility choice, not a recommendation for a new production architecture.
