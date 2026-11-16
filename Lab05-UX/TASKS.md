# Student tasks

Keep task IDs in commits and test notes. The starter is functional before every TODO.

## TODO-UX-01 — Interaction feedback

- **Current behavior:** hover and selection differ only slightly; cleanup restores the baseline.
- **Desired behavior:** clearly distinct idle, hover, selected appearances with selected taking priority.
- **Lecture concept:** visibility of system status and feedback.
- **Entry point:** `src/ux/student-feedback.js` → `feedbackFor`.
- **Technical hints:** combine color, outline, scale, or motion; make priority deterministic.
- **Desktop check:** aim across all exhibits, select one, move away, reset; no stale styling.
- **Headset check:** repeat with the target-ray controller at comfortable reach.
- **Fallback:** subtle working emissive and scale changes remain.

## TODO-UX-02 — Selection accuracy

- **Current behavior:** visible geometry is targeted; a grey obstruction correctly blocks its ray.
- **Desired behavior:** forgiving bounds and resolution without including simulator/UI helpers.
- **Lecture concept:** Fitts's law, affordance, and error prevention.
- **Entry point:** `src/ux/student-targeting.js` and `interaction/targeting.js`.
- **Technical hints:** invisible hit volumes may be exhibit children; preserve nearest-hit blocking.
- **Desktop check:** select each edge; the grey obstruction still blocks.
- **Headset check:** repeat at two distances without selecting through walls or UI.
- **Fallback:** all three visible meshes are selectable.

## TODO-UX-03 — Controller panel

- **Current behavior:** information opens on a readable, inconvenient fixed wall panel.
- **Desired behavior:** `grip → follower → panel`, smooth in world space, readable offset/layout.
- **Lecture concept:** spatial UI legibility, proprioception, and motion smoothing.
- **Entry point:** `src/ux/student-panel.js` → `updateControllerPanel`; `math/pose-helpers.js`.
- **Technical hints:** attach on active-controller changes; compute world target from grip × offset; smooth with `1-exp(-lambda*dt)`; convert back to parent local. Snap on panel open, mode/controller change, teleport, reset, and tracking return. Keep scale 1.
- **Desktop check:** open, move/rotate controller, suspend/resume tab, close with Secondary.
- **Headset check:** panel follows grip, remains readable, hides on tracking loss, and needs no self-raycast.
- **Fallback:** fixed wall panel works.

## TODO-UX-04 — Cancellation and recovery

- **Current behavior:** Secondary closes/cancels and reset works; cleanup is basic.
- **Desired behavior:** contextual cancellation, complete cleanup, one transition per activation.
- **Lecture concept:** user control, recovery, and mode errors.
- **Entry point:** `src/ux/student-recovery.js`; `main.js` → `act`, `resetExperience`.
- **Technical hints:** centralize cleanup at transition boundaries; never reprocess a press in the new state.
- **Desktop check:** cancel panel/teleport repeatedly; reset from every state.
- **Headset check:** repeat with squeeze; world reset remains reachable.
- **Fallback:** working Secondary behavior and emergency reset remain.

## TODO-UX-05 — Teleport feedback

- **Current behavior:** ring color indicates validity and desktop HUD gives text.
- **Desired behavior:** preview, confirmation/cancellation instructions, and non-color valid/invalid cues.
- **Lecture concept:** feedforward, accessibility, and constraints.
- **Entry point:** `src/ux/student-teleport.js` → `decorateTeleportPreview`.
- **Technical hints:** add shape/icon/text; preserve `destination.valid` validation.
- **Desktop check:** preview both floor types, cancel, confirm only valid floor.
- **Headset check:** in-world instructions and outcomes remain distinguishable without color.
- **Fallback:** validation, colored ring, confirmation, cancellation work.

## TODO-UX-06 — Task-based onboarding

- **Current behavior:** static instructions can be skipped or replayed.
- **Desired behavior:** progress through aim, successful selection, and successful close with mode-specific wording.
- **Lecture concept:** progressive disclosure and learning by doing.
- **Entry point:** `src/ux/student-onboarding.js`; `main.js` → `showInstructions`, `act`.
- **Technical hints:** advance on logged success; preserve skip/replay; provide in-world XR text.
- **Desktop check:** complete, skip, replay, reset.
- **Headset check:** essential text remains visible and uses select/squeeze wording.
- **Fallback:** static instructions and world replay control remain.

## TASK-UX-07 — Usability comparison

Run baseline and student with the worksheet. Preserve baseline, counterbalance order, keep input mode constant, and export logs. No implementation TODO.

## TASK-UX-08 — Evidence-driven revision

Choose one observed issue, state evidence, make one justified student-module change, and retest the same task and input mode.
