import { CONFIG, LANDMARK } from "../config.js";
import { landmarkToCanvas } from "../shared/coordinates.js";
import { hitTestShape, moveShape } from "../shared/shapes.js";

let wasPinching = false;

export function processHandLandmarkerResult(result, app) {
  const hand = result.landmarks?.[0] ?? null;
  if (!hand) {
    app.shapeState.selectedId = null;
    wasPinching = false;
    app.setHandDetected(false);
    return null;
  }

  app.setHandDetected(true);
  const thumbPoint = landmarkToCanvas(hand[LANDMARK.THUMB_TIP], app.canvas, CONFIG.mirrored);
  const indexPoint = landmarkToCanvas(hand[LANDMARK.INDEX_TIP], app.canvas, CONFIG.mirrored);
  const pinchDistance = Math.hypot(thumbPoint.x - indexPoint.x, thumbPoint.y - indexPoint.y);
  const isPinching = pinchDistance < CONFIG.pinchThresholdPx;

  if (isPinching && !wasPinching) {
    const hit = hitTestShape(app.shapeState.shapes, indexPoint);
    app.shapeState.selectedId = hit?.locked ? null : hit?.id ?? null;
  } else if (isPinching && app.shapeState.selectedId) {
    const selected = app.shapeState.shapes.find((shape) => shape.id === app.shapeState.selectedId);
    moveShape(selected, indexPoint, app.canvas.width, app.canvas.height);
  } else if (!isPinching && wasPinching) {
    app.shapeState.selectedId = null;
  }

  wasPinching = isPinching;
  return { ...indexPoint, active: isPinching };
}
