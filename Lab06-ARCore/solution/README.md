# Lab 06 — Native ARCore Spatial Measurement

Build a native Kotlin app that estimates the 3D distance between two points on an ARCore-detected surface. The starter already owns Android permissions, the AR session, camera rendering, plane visualization, threading, UI, and low-level OpenGL. Your job is to connect ARCore poses, hit tests, anchors, and coordinate-space math.

## Learning outcomes

After this 90-minute lab you should be able to:

- read a device pose as a translation and quaternion;
- distinguish screen, camera, and AR world coordinates;
- perform a center-screen plane hit test;
- create, use, and detach ARCore anchors safely;
- calculate Euclidean distance from two current world-space poses; and
- explain why tracking quality changes a spatial measurement.

The finished interaction is: scan a surface, aim until the reticle becomes valid, tap point 1, aim and tap point 2, then inspect the two markers, line, and distance. **Reset** detaches the anchors and starts over.

## Prepare before class

- Android Studio with JDK 17 and Android SDK Platform 37 installed.
- A USB cable and, preferably, a device from the [ARCore supported devices list](https://developers.google.com/ar/devices).
- Google Play Services for AR installed or updated on the phone.
- This project downloaded before the lab; Gradle must download dependencies once.

The project pins Gradle 9.5.0, Android Gradle Plugin 9.3.0 (with built-in Kotlin support), ARCore SDK 1.56.0, minimum Android API 24, and compile/target API 37.

## Open, build, and run

1. In Android Studio choose **Open** and select the `Lab06-ARCore/solution` folder (not the repository root).
2. Let Gradle sync. Install Android SDK Platform 37 if prompted. Do not add `local.properties` to Git.
3. Select a prepared phone or AR-capable emulator and click **Run app**.
4. Grant camera permission. If prompted, install/update Google Play Services for AR.
5. Move slowly and point at a textured floor, desk, or wall until planes appear.

From a terminal, a configured machine can use `gradlew.bat assembleDebug` on Windows or `./gradlew assembleDebug` on macOS/Linux.

### Physical device setup

On the phone, enable Developer options (tap **Build number** seven times), enable **USB debugging**, connect USB, accept the computer’s debugging key, and confirm `adb devices` lists the phone. An AR Required app only runs on compatible devices. Camera permission and current Google Play Services for AR are both required.

### Android Emulator alternative

An ordinary emulator image is not automatically ARCore-capable. Follow Google’s current [ARCore emulator guide](https://developers.google.com/ar/develop/java/emulator):

1. In SDK Manager install Android Emulator and an **x86/x86_64 Google APIs** system image, API 27 or newer.
2. Create a Phone AVD. In Advanced settings set the back camera to **VirtualScene**. Do not use an ARM image for this workflow.
3. Start the AVD. Download the x86 emulator APK matching the lab’s ARCore release from the [ARCore SDK releases](https://github.com/google-ar/arcore-android-sdk/releases) and install it, for example `adb install -r Google_Play_Services_for_AR_1.56.0_x86_for_emulator.apk`.
4. Run the app. Hold **Shift** and use **W/A/S/D** (plus **Q/E**) to move through the virtual scene; hold Shift and move the mouse to rotate. Release Shift, aim the center reticle at a detected tabletop/floor, and click the AR view to select.

Emulator tracking is synthetic and useful for code checks, not accuracy claims. The official guide currently restricts this ARCore emulator workflow to x86/x86_64 images.

## Expected starter behavior

Before you complete any TODO, the app compiles and launches, shows the live camera, visualizes detected planes, reports tracking status, and displays its controls. The pose and distance remain `—`; the reticle remains in its neutral state; taps show a TODO 3 hint. This is intentional—no placeholder is presented as a real AR hit or measurement.

All numbered tasks are in:

`app/src/main/java/com/google/ar/core/examples/kotlin/helloar/HelloArRenderer.kt`

### TODO 1 — `updateCameraPose(camera)`

When tracking is active, read `camera.pose.translation` and `camera.pose.rotationQuaternion`, format their x/y/z and x/y/z/w components, and call `activity.view.publishPose(text)`. Otherwise publish `null`. Quaternion components describe one rotation together; they are not separate Euler angles.

### TODO 2 — `findCenterPlaneHit(frame, camera)`

Use half of the actual `surfaceView` width and height with `Frame.hitTest(x, y)`. Keep the first hit whose trackable is a `TRACKING` `Plane` and for which `plane.isPoseInPolygon(hit.hitPose)` is true. Publish whether the reticle is valid and return that `HitResult`. The display geometry has already been updated. Do not create an anchor for the transient reticle.

### TODO 3 — `selectCurrentHit(hit)`

Ignore a null hit and additional taps after two selections. For a valid current-frame hit, call `hit.createAnchor()`, add it to `anchors`, and update the instruction. The state sequence is:

`0 points → select point 1 → 1 point → select point 2 → 2 points → Reset → 0 points`

Reset events are handled on the render thread; `clearMeasurement()` detaches every anchor. The Reset button is outside the AR surface, so it cannot also create a selection.

### TODO 4 — `updateDistanceAndLine(render, poses)` and `distanceMeters(a, b)`

With exactly two currently tracking anchor poses, read both translations in this frame. Implement the pure function with `sqrt(dx² + dy² + dz²)`, publish `formattedDistance(result)`, and call the supplied `drawLine(render, a, b)`. If either anchor is not tracking, publish no measurement. Do not keep translations from different frames as endpoints.

## Test procedure

**Device:** scan a textured surface, confirm status says surface found, select two points around a known short reference, walk slightly sideways to verify visuals remain fixed, temporarily cover the camera to observe tracking loss, then Reset and confirm all visuals clear.

**Emulator:** enter the Virtual Scene, move until a plane is detected, select two visibly distinct locations, rotate/move the virtual camera, and Reset. Treat the result as a functional check only.

## Task 5 — experiment

Measure the same reference three times on a real device and, if available, three times in the emulator.

| Environment | Reference length | Trial 1 | Trial 2 | Trial 3 | Mean | Notes on tracking |
|---|---:|---:|---:|---:|---:|---|
| Real device | | | | | | |
| Emulator | N/A unless independently verified | | | | | |

Questions:

1. Which coordinate space contains each anchor translation, and why can the camera move without changing the intended endpoint?
2. Why must both anchor poses be read after the same `Session.update()`?
3. What changes when ARCore refines its world estimate?
4. Why does a quaternion need four components, and why should you not interpret x/y/z as pitch/yaw/roll?
5. Which surfaces or motions produced the least stable results?

## Troubleshooting

- **Permission denied:** reopen app settings and grant Camera. If “Don’t ask again” was selected, the app opens the settings route.
- **Unsupported device:** verify the model on the supported-device list. The app is AR Required and cannot substitute fake tracking.
- **Install/update prompt:** install current Google Play Services for AR, then return to the app.
- **No planes:** use a bright, textured surface; move slowly in a shallow arc; avoid blank or reflective areas.
- **Tracking paused:** slow down, restore lighting/texture, uncover the camera, and revisit a previously scanned area.
- **Emulator camera failure:** use x86/x86_64, set Camera Back to VirtualScene, and install the matching x86 AR services APK.
- **Gradle sync failure:** verify JDK 17, API 37, network access to Google/Maven Central, and retry sync. Delete neither the wrapper nor its checksum settings.

## Optional extensions (not required)

- Show a live preview distance from point 1 to the current valid hit.
- Derive a phone-orientation indicator from the camera quaternion.

## Sources and attribution

Session lifecycle and rendering infrastructure are adapted from Google’s `hello_ar_kotlin` sample in ARCore SDK 1.56.0. Google sample-derived source and assets retain Apache-2.0 headers; see [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md). Relevant official references: [Android quickstart](https://developers.google.com/ar/develop/java/quickstart), [enable ARCore](https://developers.google.com/ar/develop/java/enable-arcore), [hit testing](https://developers.google.com/ar/develop/hit-test/developer-guide), [Pose API](https://developers.google.com/ar/reference/java/com/google/ar/core/Pose), and [Anchor API](https://developers.google.com/ar/reference/java/com/google/ar/core/Anchor).
