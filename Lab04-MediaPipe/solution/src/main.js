import "./styles.css";
import { CONFIG } from "./config.js";
import { startCamera, stopCamera } from "./shared/camera.js";
import { resizeCanvasToDisplaySize, syncOverlayToVideo } from "./shared/coordinates.js";
import { drawHandOverlay } from "./shared/overlay.js";
import { createShapeState, drawShapes } from "./shared/shapes.js";
import { getGestureRecognizer, getHandLandmarker } from "./shared/vision.js";
import { processHandLandmarkerResult } from "./solution/task1-hand-landmarker.js";
import { processGestureRecognizerResult } from "./solution/task2-gesture-recognizer.js";

document.querySelector("#app").innerHTML = `
  <header class="topbar">
    <div class="brand"><span class="brand-mark" aria-hidden="true"></span><span>Handspace</span></div>
    <div class="lab-title"><strong>Lab 04</strong><span>MediaPipe hand interaction</span></div>
    <span class="mode-label">Instructor solution</span>
  </header>
  <main>
    <section class="control-row" aria-labelledby="workspace-title">
      <div>
        <h1 id="workspace-title">Move shapes with your hand</h1>
        <p>Start the camera, choose a task, then hold one hand clearly in frame.</p>
      </div>
      <div class="controls">
        <label for="task-select">Active task</label>
        <select id="task-select">
          <option value="landmarker">Task 1: Hand Landmarker</option>
          <option value="gesture">Task 2: Gesture Recognizer</option>
        </select>
        <button id="camera-button" type="button">Start camera</button>
      </div>
    </section>

    <section class="workspace" aria-label="Camera and shape interaction workspace">
      <div class="camera-pane">
        <div class="pane-heading"><h2>Camera</h2><span>Mirrored preview</span></div>
        <div class="video-stage">
          <video id="webcam" autoplay muted playsinline aria-label="Live webcam preview"></video>
          <canvas id="overlay" aria-label="Detected hand landmark overlay"></canvas>
          <div id="camera-placeholder">Your camera preview will appear here.</div>
        </div>
      </div>
      <div class="canvas-pane">
        <div class="pane-heading"><h2>Shape field</h2><span>Pinch or gesture here</span></div>
        <canvas id="shape-canvas" width="640" height="420" aria-label="Interactive field with five colored shapes"></canvas>
      </div>
    </section>

    <section class="status-strip" aria-label="Application status" aria-live="polite">
      <div><span>Camera</span><strong id="camera-status">Off</strong></div>
      <div><span>Task</span><strong id="task-status">Hand Landmarker</strong></div>
      <div><span>Hand</span><strong id="hand-status">Not detected</strong></div>
      <div><span>Gesture</span><strong id="gesture-status">—</strong></div>
      <div><span>Confidence</span><strong id="confidence-status">—</strong></div>
    </section>

    <section class="help" aria-labelledby="help-title">
      <div><h2 id="help-title">Before you begin</h2><p>Your browser will ask for camera permission. Processing stays in this page; no image is uploaded by this project.</p></div>
      <div id="task-help"><strong>Task 1 control</strong><p>Bring your thumb and index fingertip together over a shape, move your hand, then release the pinch.</p></div>
      <div><strong>Need a reset?</strong><p>Stop and restart the camera. If permission was denied, use the camera icon in the address bar.</p></div>
    </section>
  </main>
`;

const elements = {
  video: document.querySelector("#webcam"),
  overlay: document.querySelector("#overlay"),
  canvas: document.querySelector("#shape-canvas"),
  cameraButton: document.querySelector("#camera-button"),
  taskSelect: document.querySelector("#task-select"),
  cameraStatus: document.querySelector("#camera-status"),
  taskStatus: document.querySelector("#task-status"),
  handStatus: document.querySelector("#hand-status"),
  gestureStatus: document.querySelector("#gesture-status"),
  confidenceStatus: document.querySelector("#confidence-status"),
  cameraPlaceholder: document.querySelector("#camera-placeholder"),
  videoStage: document.querySelector(".video-stage"),
  taskHelp: document.querySelector("#task-help"),
};

const shapeContext = elements.canvas.getContext("2d");
const overlayContext = elements.overlay.getContext("2d");
const shapeState = createShapeState();
let activeTask = "landmarker";
let stream = null;
let animationId = null;
let lastVideoTime = -1;
let cursor = null;

const appApi = {
  canvas: elements.canvas,
  shapeState,
  setHandDetected(detected) { elements.handStatus.textContent = detected ? "Detected" : "Not detected"; },
  setGesture(category, confidence) {
    elements.gestureStatus.textContent = category || "—";
    elements.confidenceStatus.textContent = category && category !== "—" ? `${Math.round(confidence * 100)}%` : "—";
  },
};

resizeCanvasToDisplaySize(elements.canvas);
drawShapes(shapeContext, shapeState, cursor);

async function renderFrame() {
  if (!stream) return;
  if (elements.video.readyState >= 2 && elements.video.currentTime !== lastVideoTime) {
    lastVideoTime = elements.video.currentTime;
    syncOverlayToVideo(elements.video, elements.overlay);
    const timestamp = performance.now();
    if (activeTask === "landmarker") {
      const result = (await getHandLandmarker()).detectForVideo(elements.video, timestamp);
      drawHandOverlay(overlayContext, result.landmarks, "landmarker", CONFIG.mirrored);
      cursor = processHandLandmarkerResult(result, appApi);
      appApi.setGesture("—", 0);
    } else {
      const result = (await getGestureRecognizer()).recognizeForVideo(elements.video, timestamp);
      drawHandOverlay(overlayContext, result.landmarks, "gesture", CONFIG.mirrored);
      cursor = processGestureRecognizerResult(result, appApi);
    }
    drawShapes(shapeContext, shapeState, cursor);
  }
  animationId = requestAnimationFrame(renderFrame);
}

async function turnCameraOn() {
  try {
    elements.cameraButton.disabled = true;
    elements.cameraStatus.textContent = "Starting…";
    stream = await startCamera(elements.video);
    elements.videoStage.style.aspectRatio = `${elements.video.videoWidth} / ${elements.video.videoHeight}`;
    elements.cameraPlaceholder.hidden = true;
    elements.cameraStatus.textContent = "On";
    elements.cameraButton.textContent = "Stop camera";
    elements.cameraButton.disabled = false;
    renderFrame();
  } catch (error) {
    elements.cameraStatus.textContent = "Unavailable";
    elements.cameraButton.disabled = false;
    elements.cameraPlaceholder.textContent = `Camera error: ${error.message}`;
  }
}

function turnCameraOff() {
  cancelAnimationFrame(animationId);
  stopCamera(elements.video);
  stream = null;
  lastVideoTime = -1;
  cursor = null;
  overlayContext.clearRect(0, 0, elements.overlay.width, elements.overlay.height);
  appApi.setHandDetected(false);
  appApi.setGesture("—", 0);
  elements.cameraPlaceholder.hidden = false;
  elements.cameraPlaceholder.textContent = "Your camera preview will appear here.";
  elements.cameraStatus.textContent = "Off";
  elements.cameraButton.textContent = "Start camera";
  drawShapes(shapeContext, shapeState, cursor);
}

elements.cameraButton.addEventListener("click", () => stream ? turnCameraOff() : turnCameraOn());
elements.taskSelect.addEventListener("change", async (event) => {
  activeTask = event.target.value;
  shapeState.selectedId = null;
  shapeState.highlightedId = null;
  appApi.setGesture("—", 0);
  const isGesture = activeTask === "gesture";
  elements.taskStatus.textContent = isGesture ? "Gesture Recognizer" : "Hand Landmarker";
  elements.taskHelp.innerHTML = isGesture
    ? "<strong>Task 2 controls</strong><p>Point to highlight, thumbs-up to lock, Victory to recolor, and open palm to clear.</p>"
    : "<strong>Task 1 control</strong><p>Bring your thumb and index fingertip together over a shape, move your hand, then release the pinch.</p>";
  elements.cameraStatus.textContent = stream ? "Loading model…" : "Off";
  if (stream) {
    try {
      if (isGesture) await getGestureRecognizer(); else await getHandLandmarker();
      elements.cameraStatus.textContent = "On";
    } catch (error) {
      elements.cameraStatus.textContent = "Model error";
      console.error(error);
    }
  }
});

window.addEventListener("beforeunload", turnCameraOff);
