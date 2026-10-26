import * as THREE from 'three';

export function createGallery() {
  const gallery = new THREE.Group();
  gallery.name = 'gallery';

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 18),
    new THREE.MeshStandardMaterial({ color: 0xbcc7c3, roughness: 0.96 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = 2;
  floor.receiveShadow = true;
  gallery.add(floor);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xe9ece7, roughness: 1 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(12, 4.2, 0.18), wallMaterial);
  backWall.position.set(0, 2.1, -4.6);
  const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.2, 9.2), wallMaterial);
  sideWall.position.set(-5.9, 2.1, 0);
  gallery.add(backWall, sideWall);

  const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f4ef, roughness: 0.8 });
  [-2.3, 0, 2.3].forEach((x) => {
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1, 1.05), pedestalMaterial);
    pedestal.position.set(x, 0.5, -1.75);
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    gallery.add(pedestal);
  });

  return gallery;
}

export function addGalleryLighting(scene) {
  scene.add(new THREE.HemisphereLight(0xe7f2ef, 0x3c4643, 1.65));
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(2.5, 5.5, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
}

export function createInfoPanel() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), material);
  panel.position.set(0, 2.75, -4.43);

  function draw(name = 'Choose an exhibit', description = 'Aim with the controller and press select.') {
    context.fillStyle = '#17201f';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#78d8c7';
    context.fillRect(48, 42, 8, 172);
    context.fillStyle = '#ffffff';
    context.font = '600 48px Arial';
    context.fillText(name, 88, 96);
    context.fillStyle = '#c4d0cd';
    context.font = '30px Arial';
    context.fillText(description, 88, 157, 860);
    texture.needsUpdate = true;
  }

  draw();
  panel.userData.update = draw;
  return panel;
}
