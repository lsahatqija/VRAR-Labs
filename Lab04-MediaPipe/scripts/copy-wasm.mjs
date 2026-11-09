import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("node_modules/@mediapipe/tasks-vision/wasm");
const destination = resolve("public/wasm");

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true, force: true });
console.log("Copied MediaPipe WASM assets to public/wasm.");
