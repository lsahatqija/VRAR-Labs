# Generated lab resource

This folder contains a complete teaching package for **Three.js and WebXR: Programming an Interactive VR Scene**.

- `student/` — runnable starter, student README, and all original sample exhibits.
- `instructor/` — completed reference implementation, answer guide, and device checklist.
- `threejs-webxr-lab-student.zip` — generated student distribution; it intentionally excludes `instructor/` and dependency folders.

Run the starter:

```powershell
cd student
npm install
npm run dev
```

Run it for a Quest 2 over local HTTPS:

```powershell
npm run dev:https
```

Build checks:

```powershell
cd student
npm run build
cd ..\instructor\solution
npm install
npm run build
```

The three exhibits are generated entirely with Three.js primitives. No third-party model or image assets are used.
