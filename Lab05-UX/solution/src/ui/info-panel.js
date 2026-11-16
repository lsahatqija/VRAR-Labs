import * as THREE from 'three';

function wrap(context, text, width) {
  const lines = []; let line = '';
  for (const word of text.split(' ')) {
    const test = `${line} ${word}`.trim();
    if (context.measureText(test).width > width && line) { lines.push(line); line = word; } else line = test;
  }
  lines.push(line); return lines;
}

export function createInfoPanel() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 420;
  const context = canvas.getContext('2d'); const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(.95, .39), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
  panel.position.set(0, 2.75, -4.42); panel.visible = false; panel.userData.blocksSelection = false;
  panel.userData.show = ({ name, description }) => {
    context.fillStyle='#17201f'; context.fillRect(0,0,1024,420); context.fillStyle='#78d8c7'; context.fillRect(42,42,9,336);
    context.fillStyle='white'; context.font='bold 54px system-ui'; context.fillText(name,82,105);
    context.fillStyle='#d2ddda'; context.font='34px system-ui'; wrap(context, description, 850).forEach((line,i)=>context.fillText(line,82,175+i*48));
    context.fillStyle='#78d8c7'; context.font='28px system-ui'; context.fillText('Secondary: close',82,370); texture.needsUpdate=true; panel.visible=true;
  };
  panel.userData.hide = () => { panel.visible=false; };
  return panel;
}
