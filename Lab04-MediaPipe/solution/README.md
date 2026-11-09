# Lab 04 — MediaPipe hand interaction: solution

This is the self-contained instructor solution for Lab 04. It contains the completed pinch interaction and gesture mapping, with no student TODO files.

## Run the solution

Open a terminal in this `solution` folder:

```powershell
npm install
npm run setup:assets
npm run dev
```

Open the local URL printed by Vite, normally <http://localhost:5173>, select a task, and grant camera permission. The model and WASM files are served locally.

## Completed behavior

Task 1 safely reads thumb tip landmark 4 and index fingertip landmark 8, maps mirrored coordinates into canvas pixels, implements pinch start/hold/release, hit-tests shapes, moves unlocked selections, and cleans up on tracking loss.

Task 2 reads and displays the top category and confidence, applies the configured threshold, acts only on gesture changes, reuses the fingertip landmark for hit testing, and implements:

- `Pointing_Up`: highlight the shape under the fingertip.
- `Thumb_Up`: lock the highlighted shape.
- `Victory`: cycle the highlighted shape's color.
- `Open_Palm`: clear the current highlight or selection.

`ILoveYou` is the ASL “I love you” hand sign, not a two-hand heart gesture. “Metal horns” and a two-hand heart are not built-in categories.

## Structure

```text
solution/
├── index.html
├── package.json
├── package-lock.json
├── public/
│   ├── models/
│   └── wasm/
├── scripts/
└── src/
    ├── main.js
    ├── config.js
    ├── styles.css
    ├── shared/
    └── solution/
        ├── task1-hand-landmarker.js
        └── task2-gesture-recognizer.js
```

Validate it with:

```powershell
npm run check
npm run build
npm run preview
```

Official references:

- [Hand Landmarker for Web](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js)
- [Gesture Recognizer for Web](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer/web_js)
- [Gesture Recognizer overview](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer)

The project uses `@mediapipe/tasks-vision` under Apache License 2.0 and official Google MediaPipe task model bundles.
