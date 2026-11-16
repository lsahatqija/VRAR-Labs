# Instructor notes

## Timing and mapping

- 0–10 min: run both conditions and simulator calibration.
- 10–20: TODO-UX-01 feedback (`student-feedback.js`).
- 20–30: TODO-UX-02 targeting (`student-targeting.js`).
- 30–50: TODO-UX-03 panel (`student-panel.js`, pose helpers).
- 50–60: TODO-UX-04 recovery (`student-recovery.js`).
- 60–70: TODO-UX-05 teleport (`student-teleport.js`).
- 70–78: TODO-UX-06 onboarding (`student-onboarding.js`).
- 78–87: TASK-UX-07 comparison and export.
- 87–90: TASK-UX-08 revision plan or small change.

The baseline intentionally uses subtle feedback, visible-mesh targets, a fixed panel, basic cancellation, a color-first teleport ring, and static onboarding. All are usable before modification. Stable input/XR infrastructure is shared; student changes enter only through `src/ux`. The three exhibit facts are explicit and locally generated.

## Verification record

`npm test` covers translation bounds, shortest-quaternion 90° limit, one transition per action, obstruction order, pose round trips, time-based smoothing, and discontinuity reset. `npm run build` verifies imports and bundling. Browser verification and its date/results are appended here when performed.

## Known limitations

No physical headset/profile is assumed. `select` and `squeeze` are standard WebXR events; controllers without grip/squeeze show a recovery explanation. Local HTTPS requires a certificate trusted by the headset. Physical comfort, controller profiles, tracking loss, and LAN certificate trust require real-hardware verification.
