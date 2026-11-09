import { FilesetResolver, GestureRecognizer, HandLandmarker } from "@mediapipe/tasks-vision";
import { CONFIG } from "../config.js";

let filesetPromise;
let handLandmarkerPromise;
let gestureRecognizerPromise;

function getFileset() {
  filesetPromise ??= FilesetResolver.forVisionTasks(CONFIG.wasmPath);
  return filesetPromise;
}

export async function getHandLandmarker() {
  handLandmarkerPromise ??= HandLandmarker.createFromOptions(await getFileset(), {
    baseOptions: { modelAssetPath: CONFIG.modelPaths.handLandmarker, delegate: "GPU" },
    runningMode: "VIDEO",
    numHands: CONFIG.maxHands,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  return handLandmarkerPromise;
}

export async function getGestureRecognizer() {
  gestureRecognizerPromise ??= GestureRecognizer.createFromOptions(await getFileset(), {
    baseOptions: { modelAssetPath: CONFIG.modelPaths.gestureRecognizer, delegate: "GPU" },
    runningMode: "VIDEO",
    numHands: CONFIG.maxHands,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  return gestureRecognizerPromise;
}
