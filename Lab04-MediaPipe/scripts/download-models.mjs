import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const models = [
  {
    name: "hand_landmarker.task",
    url: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  },
  {
    name: "gesture_recognizer.task",
    url: "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
  },
];

const destination = resolve("public/models");
await mkdir(destination, { recursive: true });

for (const model of models) {
  console.log(`Downloading ${model.name}…`);
  const response = await fetch(model.url);
  if (!response.ok) throw new Error(`${model.name}: HTTP ${response.status}`);
  await writeFile(resolve(destination, model.name), Buffer.from(await response.arrayBuffer()));
}

console.log("MediaPipe models are ready in public/models.");
