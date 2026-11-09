import { CONFIG } from "../config.js";
import { cycleShapeColor, hitTestShape } from "../shared/shapes.js";

let previousGesture = null;

export function processGestureRecognizerResult(result, app) {
  const hasHand = Boolean(result.landmarks?.length);
  if (!hasHand) {
    // TODO(student) 6: Clear previousGesture, highlightedId, selectedId and the status when tracking is lost.
    previousGesture = null;
    app.shapeState.highlightedId = null;
    app.setHandDetected(false);
    app.setGesture("—", 0);
    return null;
  }
  app.setHandDetected(true);

  // TODO(student) 1: Safely read the first hand's top gesture category and score.
  const topGesture = null;
  const category = "—"; // Replace with topGesture.categoryName.
  const confidence = 0; // Replace with topGesture.score.

  // TODO(student) 2: Send the real category and confidence to app.setGesture(...).
  app.setGesture(category, confidence);

  // TODO(student) 7: Reuse result.landmarks and map landmark 8 to the shared canvas.
  const point = null;

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
  void point;
  // The untouched starter deliberately returns no canvas cursor or hand-driven motion.
  return null;
}
