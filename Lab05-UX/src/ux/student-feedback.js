// TODO-UX-01 entry point: strengthen and clean up idle, hover, and selected visuals.
export function feedbackFor(state) {
  return state === 'selected' ? { scale: 1.06, emissive: 0x183e38 } : state === 'hover' ? { scale: 1.02, emissive: 0x12332e } : { scale: 1, emissive: 0x000000 };
}
