import { CONFIG, LANDMARK } from "../config.js";
import { landmarkToCanvas } from "../shared/coordinates.js";
import { cycleShapeColor, hitTestShape } from "../shared/shapes.js";

let previousGesture = null;

export function processGestureRecognizerResult(result, app) {
  const hand = result.landmarks?.[0] ?? null;
  if (!hand) {
    // TODO(student) 6: Clear previousGesture, highlightedId, selectedId and the status when tracking is lost.
    previousGesture = null;
    app.shapeState.highlightedId = null;
    app.setHandDetected(false);
    app.setGesture("—", 0);
    return null;
  }
  app.setHandDetected(true);

  // TODO(student) 1: Safely read the first hand's top gesture category and score.
  const topGesture = result.gestures?.[0]?.[0] ?? null;
  const category = "—"; // Replace with topGesture.categoryName.
  const confidence = 0; // Replace with topGesture.score.

  // TODO(student) 2: Send the real category and confidence to app.setGesture(...).
  app.setGesture(category, confidence);

  // TODO(student) 7: Reuse result.landmarks and map landmark 8 to the shared canvas.
  const point = landmarkToCanvas(hand[LANDMARK.INDEX_TIP], app.canvas, CONFIG.mirrored);

  // TODO(student) 3: Ignore gestures below CONFIG.gestureConfidenceThreshold.
  const acceptedGesture = null;

  // TODO(student) 5: Act only when acceptedGesture changes, not on every video frame.
  if (acceptedGesture && acceptedGesture !== previousGesture) {
    // TODO(student) 4: Implement the fixed mapping:
    // Pointing_Up -> highlight the shape under point using hitTestShape(...).
    // Thumb_Up -> lock the highlighted shape.
    // Victory -> cycle the highlighted shape's color with cycleShapeColor(...).
    // Open_Palm -> clear the current highlight/selection.
    void hitTestShape;
    void cycleShapeColor;
  }

  previousGesture = acceptedGesture;
  void topGesture;
  return { ...point, active: Boolean(app.shapeState.highlightedId) };
}
