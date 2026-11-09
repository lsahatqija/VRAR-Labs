const PALETTE = ["#ff5b45", "#ffca3a", "#20c997", "#36a2ff", "#f875d1"];

export function createShapeState() {
  return {
    selectedId: null,
    highlightedId: null,
    shapes: [
      { id: "coral-circle", type: "circle", x: 115, y: 115, radius: 47, colorIndex: 0, locked: false },
      { id: "sun-square", type: "rect", x: 255, y: 70, width: 102, height: 102, colorIndex: 1, locked: false },
      { id: "mint-circle", type: "circle", x: 475, y: 125, radius: 58, colorIndex: 2, locked: false },
      { id: "blue-rectangle", type: "rect", x: 155, y: 285, width: 145, height: 82, colorIndex: 3, locked: false },
      { id: "pink-square", type: "rect", x: 420, y: 270, width: 95, height: 95, colorIndex: 4, locked: false },
    ],
  };
}

export function hitTestShape(shapes, point) {
  return [...shapes].reverse().find((shape) => {
    if (shape.type === "circle") return Math.hypot(point.x - shape.x, point.y - shape.y) <= shape.radius;
    return point.x >= shape.x && point.x <= shape.x + shape.width && point.y >= shape.y && point.y <= shape.y + shape.height;
  }) ?? null;
}

export function moveShape(shape, point, width, height) {
  if (!shape || shape.locked) return;
  if (shape.type === "circle") {
    shape.x = Math.max(shape.radius, Math.min(width - shape.radius, point.x));
    shape.y = Math.max(shape.radius, Math.min(height - shape.radius, point.y));
  } else {
    shape.x = Math.max(0, Math.min(width - shape.width, point.x - shape.width / 2));
    shape.y = Math.max(0, Math.min(height - shape.height, point.y - shape.height / 2));
  }
}

export function cycleShapeColor(shape) {
  if (shape) shape.colorIndex = (shape.colorIndex + 1) % PALETTE.length;
}

export function drawShapes(context, state, cursor) {
  const { width, height } = context.canvas;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#f2f6f7";
  context.fillRect(0, 0, width, height);

  for (const shape of state.shapes) {
    context.beginPath();
    if (shape.type === "circle") context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
    else context.roundRect(shape.x, shape.y, shape.width, shape.height, 8);
    context.fillStyle = PALETTE[shape.colorIndex];
    context.fill();

    if (shape.id === state.highlightedId || shape.id === state.selectedId) {
      context.lineWidth = 7;
      context.strokeStyle = "#071b26";
      context.stroke();
    }
    if (shape.locked) {
      context.fillStyle = "#071b26";
      context.font = "700 14px system-ui";
      context.fillText("LOCKED", shape.type === "circle" ? shape.x - 29 : shape.x + 14, shape.type === "circle" ? shape.y + 5 : shape.y + 25);
    }
  }

  if (cursor) {
    context.beginPath();
    context.arc(cursor.x, cursor.y, 10, 0, Math.PI * 2);
    context.fillStyle = cursor.active ? "#071b26" : "#ffffff";
    context.fill();
    context.lineWidth = 4;
    context.strokeStyle = "#071b26";
    context.stroke();
  }
}
