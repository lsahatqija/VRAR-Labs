import { CONFIG } from "../config.js";
import { hitTestShape, moveShape } from "../shared/shapes.js";

let wasPinching = false;

export function processHandLandmarkerResult(result, app) {
  // Keep the untouched starter safe and observable without completing the exercise:
  // it reports whether any hand exists, but it does not select landmarks or create a cursor.
  const hasHand = Boolean(result.landmarks?.length);
  app.setHandDetected(hasHand);

  if (!hasHand) {
    // TODO(student) 8: On tracking loss, clear the selected shape and pinch state safely.
    return null;
  }

  // TODO(student) 1: Read result.landmarks and safely choose one detected hand.
  const hand = null;

  // TODO(student) 2: Read landmark 4 (thumb tip) and landmark 8 (index fingertip).
  const thumbTip = null;
  const indexTip = null;

  // TODO(student) 3: Map the index fingertip to canvas pixels and account for the mirrored preview.
  const point = null;

  // TODO(student) 4: Map the thumb tip, measure thumb-to-index distance in pixels, and compare it with CONFIG.pinchThresholdPx.
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
  void hand;
  void thumbTip;
  void indexTip;
  void point;
  wasPinching = isPinching;

  // Until TODOs 2–4 are complete there is deliberately no canvas cursor.
  return null;
}

export function drawHandLandmarkerOverlay(result, app) {
  // TODO(student) 9: Draw result.landmarks with app.drawOverlay(..., "landmarker").
  // The helper mirrors the overlay using the video canvas dimensions so it stays aligned.
  // The untouched starter deliberately clears the overlay instead of drawing the skeleton.
  app.clearOverlay();
  void result;
}
