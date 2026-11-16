export function transition(state, action, context = {}) {
  if (action === 'reset') return 'browsing';
  if (state === 'browsing' && action === 'primary' && context.exhibit) return 'information';
  if (state === 'browsing' && action === 'secondary') return 'teleport';
  if (state === 'information' && action === 'secondary') return 'browsing';
  if (state === 'teleport' && action === 'secondary') return 'browsing';
  if (state === 'teleport' && action === 'primary' && context.validDestination) return 'browsing';
  return state;
}

// Intersections must be sorted nearest first. Objects in front block objects behind them.
export function firstTarget(intersections) {
  for (const hit of intersections) {
    let node = hit.object;
    while (node) {
      if (node.userData.isExhibit || node.userData.worldAction) return node;
      if (node.userData.blocksSelection) return null;
      node = node.parent;
    }
  }
  return null;
}
