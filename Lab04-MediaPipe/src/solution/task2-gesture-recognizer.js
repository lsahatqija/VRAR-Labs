import { CONFIG, LANDMARK } from "../config.js";
import { landmarkToCanvas } from "../shared/coordinates.js";
import { cycleShapeColor, hitTestShape } from "../shared/shapes.js";

let previousGesture = null;

export function processGestureRecognizerResult(result, app) {
  const hand = result.landmarks?.[0] ?? null;
  if (!hand) {
    previousGesture = null;
    app.shapeState.highlightedId = null;
    app.shapeState.selectedId = null;
    app.setHandDetected(false);
    app.setGesture("—", 0);
    return null;
  }

  app.setHandDetected(true);
  const topGesture = result.gestures?.[0]?.[0] ?? null;
  const category = topGesture?.categoryName ?? "—";
  const confidence = topGesture?.score ?? 0;
  app.setGesture(category, confidence);

  const point = landmarkToCanvas(hand[LANDMARK.INDEX_TIP], app.canvas, CONFIG.mirrored);
  const acceptedGesture = confidence >= CONFIG.gestureConfidenceThreshold ? category : null;

  if (acceptedGesture && acceptedGesture !== previousGesture) {
    const highlighted = app.shapeState.shapes.find((shape) => shape.id === app.shapeState.highlightedId);
    if (acceptedGesture === "Pointing_Up") {
      app.shapeState.highlightedId = hitTestShape(app.shapeState.shapes, point)?.id ?? null;
    } else if (acceptedGesture === "Thumb_Up" && highlighted) {
      highlighted.locked = true;
    } else if (acceptedGesture === "Victory" && highlighted) {
      cycleShapeColor(highlighted);
    } else if (acceptedGesture === "Open_Palm") {
      app.shapeState.highlightedId = null;
      app.shapeState.selectedId = null;
    }
  }

  previousGesture = acceptedGesture;
  return { ...point, active: Boolean(app.shapeState.highlightedId) };
}
