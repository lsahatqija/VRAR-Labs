import { DrawingUtils, GestureRecognizer, HandLandmarker } from "@mediapipe/tasks-vision";

export function drawHandOverlay(context, landmarks, taskName, mirrored) {
  const { width, height } = context.canvas;
  context.clearRect(0, 0, width, height);
  if (!landmarks?.length) return;

  context.save();
  if (mirrored) {
    context.translate(width, 0);
    context.scale(-1, 1);
  }
  const drawing = new DrawingUtils(context);
  const connections = taskName === "gesture" ? GestureRecognizer.HAND_CONNECTIONS : HandLandmarker.HAND_CONNECTIONS;
  for (const hand of landmarks) {
    drawing.drawConnectors(hand, connections, { color: "#20c997", lineWidth: 4 });
    drawing.drawLandmarks(hand, { color: "#ffca3a", fillColor: "#071b26", lineWidth: 2, radius: 4 });
  }
  context.restore();
}
