# Desktop and Quest 2 verification checklist

## Desktop

- [ ] `npm install` completes with the pinned lockfile.
- [ ] `npm run build` completes without warnings or errors.
- [ ] `npm run dev` shows the gallery, floor, walls, three pedestals, and three exhibits.
- [ ] Orbit drag, wheel zoom, resize, lighting, and shadows behave normally.
- [ ] The in-world information panel is legible and no console errors occur.
- [ ] The reference solution shows the WebXR availability button/message.
- [ ] A centre reticle, desktop controller ray, and keyboard hint are visible.
- [ ] Orbiting keeps the simulated ray converging on the centre reticle.
- [ ] Pressing `E` over each exhibit exercises the controller handler, recursive raycast, scale feedback, in-world panel, and HTML readout.
- [ ] Pressing `E` over empty space leaves the current selection unchanged.

## Quest 2

- [ ] Computer and headset use the same non-guest Wi-Fi network.
- [ ] `npm run dev:https` prints a reachable LAN HTTPS URL.
- [ ] Quest Browser can continue past the local-only certificate warning.
- [ ] Enter VR starts an immersive session and stereo rendering is stable.
- [ ] A mint controller ray follows the primary controller and reaches all exhibits.
- [ ] Pressing the primary select input chooses the nearest aimed-at child mesh.
- [ ] Selecting a new exhibit restores the previous scale.
- [ ] The selected title and description are readable on the in-world panel.
- [ ] Ending the XR session returns to a correctly sized desktop canvas.

Record the Quest Browser/OS version and any institution-network restrictions alongside the checklist. Physical headset behavior cannot be fully proven by a desktop browser alone.
