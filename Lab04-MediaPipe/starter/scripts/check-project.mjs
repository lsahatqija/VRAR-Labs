import { access, readFile } from "node:fs/promises";

const required = [
  "public/models/hand_landmarker.task",
  "public/models/gesture_recognizer.task",
  "public/wasm/vision_wasm_internal.wasm",
  "src/student/task1-hand-landmarker.js",
  "src/student/task2-gesture-recognizer.js",
];

for (const path of required) await access(path);
const studentFiles = await Promise.all(required.slice(3).map((path) => readFile(path, "utf8")));
const todoCount = studentFiles.join("\n").match(/TODO\(student\)/g)?.length ?? 0;
if (todoCount < 16) throw new Error(`Expected at least 16 student TODO markers; found ${todoCount}.`);
console.log(`Starter check passed: ${required.length} required files and ${todoCount} student TODO markers.`);
