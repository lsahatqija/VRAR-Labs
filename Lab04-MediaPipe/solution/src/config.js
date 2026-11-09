export const CONFIG = Object.freeze({
  mirrored: true,
  maxHands: 1,
  pinchThresholdPx: 46,
  gestureConfidenceThreshold: 0.65,
  modelPaths: {
    handLandmarker: "/models/hand_landmarker.task",
    gestureRecognizer: "/models/gesture_recognizer.task",
  },
  wasmPath: "/wasm",
});

export const LANDMARK = Object.freeze({ WRIST: 0, THUMB_TIP: 4, INDEX_TIP: 8 });
