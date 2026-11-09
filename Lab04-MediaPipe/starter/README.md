# Lab 04 — MediaPipe hand interaction

Build two camera-based interactions in a local browser app. In Task 1 you turn hand landmarks into a pinch-and-drag control. In Task 2 you turn recognized gestures into actions on the same shapes.

This folder is the student starter. It already includes the camera, both MediaPipe task pipelines, local models/WASM, responsive UI, shared canvas, and safe placeholder behavior. Landmark drawing and hand-driven canvas motion are intentionally left for you to implement. You work only in the two files under `src/student/`.

## Learning outcomes

By the end of this 90-minute lab, you should be able to:

- run MediaPipe Vision Tasks on webcam frames in JavaScript;
- read structured landmark and gesture results safely;
- map normalized image coordinates into canvas coordinates;
- implement a small interaction state machine for pinch start, hold, and release;
- trigger application actions from gesture changes and confidence thresholds;
- explain the coordinate and output differences between a Hand Landmarker and a Gesture Recognizer.

## Prerequisites

- Node.js 20.19 or newer and npm;
- a modern Chrome, Edge, Firefox, or Safari browser with WebAssembly support;
- a laptop webcam (primary path) or an attached USB camera;
- VS Code or another text editor;
- familiarity with JavaScript modules, arrays/objects, HTML canvas, and 2D/3D coordinates.

## Setup

Open a terminal in `Lab04-MediaPipe` and run:

```powershell
npm install
npm run setup:assets
npm run dev
```

Open the local URL printed by Vite, normally <http://localhost:5173>. Choose **Start camera** and allow camera access when the browser asks.

`npm install` needs internet access the first time to install Vite and `@mediapipe/tasks-vision`. `npm run setup:assets` also needs internet once to download the two official model files. After that, the app loads its JavaScript, WASM, and models locally; it does not need a runtime CDN.

To stop the development server, focus its terminal and press `Ctrl+C`. The **Stop camera** button stops the camera tracks without stopping Vite.

Before class, an instructor can prepare an offline copy by running both setup commands and preserving `node_modules/`, `public/wasm/`, and `public/models/`.

## Project map

```text
starter/
├── index.html                         Vite entry page
├── package.json                       pinned dependencies and scripts
├── package-lock.json                  exact dependency tree
├── public/
│   ├── models/                        local .task model bundles
│   └── wasm/                          local MediaPipe WebAssembly runtime
├── scripts/
│   ├── copy-wasm.mjs                  copies WASM after npm install
│   ├── download-models.mjs            downloads the official task models
│   └── check-project.mjs              checks required assets and TODOs
└── src/
    ├── main.js                        camera loop, UI, and task switching
    ├── config.js                      thresholds, landmark indices, asset paths
    ├── styles.css                     responsive classroom UI
    ├── shared/                        camera, vision, drawing, coordinates, shapes
    └── student/
        ├── task1-hand-landmarker.js   EDIT THIS for Task 1
        └── task2-gesture-recognizer.js EDIT THIS for Task 2
```

The completed instructor project is kept separately in the neighboring `../solution/` folder and is not imported or exposed by this starter.

## How the application works

Each animation frame with a new video timestamp is sent to the active MediaPipe task in `VIDEO` mode:

- **Hand Landmarker** calls `detectForVideo(video, timestamp)` and returns structured hand landmarks, world landmarks, and handedness.
- **Gesture Recognizer** calls `recognizeForVideo(video, timestamp)` and returns gesture categories and scores as well as landmarks, world landmarks, and handedness.

Both calls run synchronously in the browser. The starter avoids processing the same decoded video frame twice. For a larger production app, move inference to a Web Worker to prevent main-thread stalls.

Image landmarks use normalized image coordinates: `x` and `y` are usually in the range 0–1 relative to the camera image. The helper multiplies those values by the canvas dimensions. Because this app mirrors the preview, it also maps `x` to `1 - x` for the cursor and hit testing.

Hand Landmarker `worldLandmarks` are metric coordinates centered on the hand. They are **hand-relative**, not room-scale XR coordinates, and they do not represent a tracked pose in your physical room.

The tasks answer different questions. Hand Landmarker gives hand geometry; your code derives a pinch from fingertip distance. Gesture Recognizer includes a classifier and tells you which supported hand pose is most likely. Its built-in categories include `Closed_Fist`, `Open_Palm`, `Pointing_Up`, `Thumb_Down`, `Thumb_Up`, `Victory`, and `ILoveYou`. `ILoveYou` is the ASL “I love you” hand sign—not a two-hand heart gesture. “Metal horns” and a two-hand heart are not built-in categories.

## Task 1 — Hand Landmarker

Select **Task 1: Hand Landmarker**. The starter displays the camera and reports whether a hand is detected, but it deliberately does not draw a skeleton or move a canvas cursor yet. Open `src/student/task1-hand-landmarker.js` and complete the numbered `TODO(student)` comments:

1. Safely select one detected hand from `result.landmarks`.
2. Read thumb tip landmark 4 and index fingertip landmark 8.
3. Map the index fingertip to canvas coordinates with mirrored-preview handling.
4. Map the thumb, calculate the fingertip distance in canvas pixels, and compare it with `CONFIG.pinchThresholdPx`.
5. Distinguish pinch start, continued pinch, and release with `wasPinching`.
6. On pinch start, use `hitTestShape` and select only an unlocked shape under the point.
7. While the pinch continues, move the selected shape with `moveShape`.
8. On release or tracking loss, clear the selection and state safely.
9. Call `app.drawOverlay(result.landmarks, "landmarker")` from `drawHandLandmarkerOverlay`. Inspect `src/shared/overlay.js` and explain how its mirrored drawing stays aligned with the video.

Expected result: the skeleton remains aligned with your mirrored hand; the canvas cursor follows your index finger; pinching over a shape picks it up; holding the pinch moves it; opening the pinch releases it. Pinching empty space does not select anything.

## Task 2 — Gesture Recognizer

Switch to **Task 2: Gesture Recognizer**. It uses the same camera, shape array, canvas, coordinate helper, and status strip. Open `src/student/task2-gesture-recognizer.js` and complete its numbered TODOs:

1. Safely read the first hand's top category and confidence score.
2. Display both values with `app.setGesture(category, confidence)`.
3. Act only at or above `CONFIG.gestureConfidenceThreshold`.
4. Implement exactly this mapping:
   - `Pointing_Up`: highlight the shape under the index fingertip;
   - `Thumb_Up`: lock the highlighted shape in place;
   - `Victory`: cycle the highlighted shape's color;
   - `Open_Palm`: release or clear the current selection.
5. Compare with `previousGesture` so an action occurs when the gesture changes, not every frame.
6. Clear gesture and selection state when tracking is lost.
7. Reuse the recognizer's landmark 8 for fingertip position and hit testing.

Expected result: the category and confidence update; low-confidence poses do nothing; pointing highlights one shape; a thumbs-up locks it; changing to Victory changes its color once; an open palm clears the highlight.

Tip: to repeat the same action, briefly change to a different pose and then show the action gesture again. The “gesture changed” rule prevents a color from cycling on every camera frame.

## Configuration

Use `src/config.js` to tune:

- `pinchThresholdPx` if pinching is too sensitive or difficult;
- `gestureConfidenceThreshold` if recognized poses are unstable;
- `mirrored` only if you also preserve the same convention for video, overlay, cursor, and hit testing.

## Troubleshooting

**Camera permission is missing or denied**

Use the camera icon in the browser address bar, allow this localhost site, then reload. Close Teams, Zoom, or another application if it exclusively owns the camera. Camera access works on `localhost`; do not open `index.html` directly from disk.

**The preview is black**

Wait a moment after permission, try **Stop camera** then **Start camera**, and verify the correct camera is enabled in operating-system privacy settings. Try another Chromium-based browser if the device driver behaves differently.

**No hand is detected**

Use even front lighting, keep your entire hand in frame, face the palm toward the camera, and remove a visually busy background if possible. Start around 50–100 cm from the camera. Detection is less reliable with severe motion blur or occlusion.

**A model fails to load**

Run `npm run setup:assets` again and confirm both `.task` files exist in `public/models/`. Run `npm install` again if `public/wasm/` is missing. Then restart Vite. Do not use a remote CDN URL as a workaround; the lab is designed to run with local assets.

**Performance is slow**

Close camera-heavy apps and unused tabs, use good lighting, and test Chrome or Edge with hardware acceleration enabled. The browser task calls are synchronous. A production extension could use a Web Worker, but that is outside this lab.

**The overlay or cursor drifts**

Do not add independent CSS transforms to only the video or overlay. The video and overlay share one positioned stage, and mirror handling is applied consistently. Reload after resizing if browser zoom has produced an unusual layout state.

**The laptop camera does not work**

Laptop webcam is the primary lab path. As an optional fallback, run Vite with `npm run dev -- --host`, open the shown network URL on a phone connected to the same network, and satisfy the browser's secure-context requirements (mobile camera access generally requires HTTPS). Instructor help may be needed for a local HTTPS certificate.

## Validation and production preview

```powershell
npm run check
npm run build
npm run preview
```

The check verifies that local assets, student files, and explicit TODO markers exist. The build confirms that Vite can bundle the student project.

## Official documentation and attribution

- [Hand Landmarker for Web](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js)
- [Gesture Recognizer for Web](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer/web_js)
- [Gesture Recognizer overview and supported labels](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer)
- [MediaPipe Tasks web setup](https://developers.google.com/edge/mediapipe/solutions/setup_web)

The project uses `@mediapipe/tasks-vision`, distributed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), and official Google MediaPipe task model bundles downloaded by `scripts/download-models.mjs`. Consult the linked model pages/model cards and the MediaPipe repository for their current notices. Camera frames are processed on device by this application; the project code does not upload them.
