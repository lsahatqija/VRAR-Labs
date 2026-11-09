import { CONFIG, LANDMARK } from "../config.js";
import { landmarkToCanvas } from "../shared/coordinates.js";
import { hitTestShape, moveShape } from "../shared/shapes.js";

let wasPinching = false;

export function processHandLandmarkerResult(result, app) {
  // TODO(student) 1: Read result.landmarks and safely choose one detected hand.
  const hand = result.landmarks?.[0] ?? null;
  if (!hand) {
    // TODO(student) 8: On tracking loss, clear the selected shape and pinch state safely.
    app.shapeState.selectedId = null;
    wasPinching = false;
    app.setHandDetected(false);
    return null;
  }
  app.setHandDetected(true);

  // TODO(student) 2: Read landmark 4 (thumb tip) and landmark 8 (index fingertip).
  const thumbTip = hand[LANDMARK.THUMB_TIP];
  const indexTip = hand[LANDMARK.INDEX_TIP];

  // TODO(student) 3: Map the index fingertip to canvas pixels and account for the mirrored preview.
  const point = landmarkToCanvas(indexTip, app.canvas, CONFIG.mirrored);

  // TODO(student) 4: Map the thumb tip, measure thumb-to-index distance in pixels, and compare it with CONFIG.pinchThresholdPx.
  const thumbPoint = landmarkToCanvas(thumbTip, app.canvas, CONFIG.mirrored);
  const pinchDistance = Number.POSITIVE_INFINITY; // Replace with Math.hypot(...).
  const isPinching = false; // Replace with a threshold comparison.

  // TODO(student) 5: Distinguish pinch start, continued pinch, and pinch release using wasPinching.
  // TODO(student) 6: On pinch start, select only an unlocked shape under the pinch point with hitTestShape(...).
  // TODO(student) 7: During a continued pinch, move the selected shape with moveShape(...).
  // TODO(student) 8: On pinch release, clear selectedId safely.
  void pinchDistance;
  void isPinching;
  void hitTestShape;
  void moveShape;
  wasPinching = isPinching;

  return { ...point, active: isPinching };
}

// TODO(student) 9 is in the shared drawHandOverlay helper: inspect how it mirrors the
// overlay using the video canvas dimensions so landmarks stay aligned while resizing.
