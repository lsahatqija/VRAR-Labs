import { access, readFile } from "node:fs/promises";

const required = [
  "public/models/hand_landmarker.task",
  "public/models/gesture_recognizer.task",
  "public/wasm/vision_wasm_internal.wasm",
  "src/solution/task1-hand-landmarker.js",
  "src/solution/task2-gesture-recognizer.js",
];

for (const path of required) await access(path);
const solutionFiles = await Promise.all(required.slice(3).map((path) => readFile(path, "utf8")));
const todoCount = solutionFiles.join("\n").match(/TODO\(student\)/g)?.length ?? 0;
if (todoCount !== 0) throw new Error(`The solution must not contain student TODO markers; found ${todoCount}.`);
console.log(`Solution check passed: ${required.length} required files and no student TODO markers.`);
