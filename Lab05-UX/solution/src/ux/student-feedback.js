export function feedbackFor(state) {
  if (state === 'selected') return { scale: 1.12, emissive: 0x176f63 };
  if (state === 'hover') return { scale: 1.06, emissive: 0x6b4b12 };
  return { scale: 1, emissive: 0x000000 };
}
