export function createEventLog(condition) {
  const trialId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const started = performance.now();
  const events = [];
  function log(type, detail = {}) {
    events.push({ trialId, condition, elapsedMs: Math.round(performance.now() - started), type, ...detail });
  }
  function exportJson() {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `vr-ux-${trialId}.json` });
    link.click(); URL.revokeObjectURL(link.href);
  }
  log('trial-start');
  return { log, exportJson, events, trialId };
}
