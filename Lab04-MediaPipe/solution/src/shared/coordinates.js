export function landmarkToCanvas(landmark, canvas, mirrored) {
  const normalizedX = mirrored ? 1 - landmark.x : landmark.x;
  return { x: normalizedX * canvas.width, y: landmark.y * canvas.height };
}

export function resizeCanvasToDisplaySize(canvas, logicalWidth = 640, logicalHeight = 420) {
  if (canvas.width !== logicalWidth || canvas.height !== logicalHeight) {
    canvas.width = logicalWidth;
    canvas.height = logicalHeight;
  }
}

export function syncOverlayToVideo(video, overlay) {
  const width = video.videoWidth || 640;
  const height = video.videoHeight || 480;
  if (overlay.width !== width || overlay.height !== height) {
    overlay.width = width;
    overlay.height = height;
  }
}
