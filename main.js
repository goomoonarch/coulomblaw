const canvas = document.getElementById("coulombCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 800;

let charges = [
  { x: 100, y: 100, charge: -1, movable: false, inDipole: false },
  { x: 700, y: 100, charge: 1, movable: false, inDipole: false },
  { x: 100, y: 700, charge: -1, movable: false, inDipole: false },
  { x: 700, y: 700, charge: 1, movable: true, inDipole: false },
];

const k = 1.1e7;
const minDistance = 35;

function drawCharges() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  charges.forEach(charge => {
    ctx.beginPath();
    ctx.arc(charge.x, charge.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = charge.charge > 0 ? 'red' : 'blue';
    ctx.fill();
  });
}


let isDragging = false;
let draggedCharge = null;

canvas.addEventListener("mousedown", (event) => {
  charges.forEach((charge) => {
    if (charge.movable) {
      const distance = Math.sqrt(
        (event.offsetX - charge.x) ** 2 + (event.offsetY - charge.y) ** 2
      );
      if (distance < 20) {
        isDragging = true;
        draggedCharge = charge;
        charge.inDipole = false;
      }
    }
  });
});

canvas.addEventListener("mousemove", (event) => {
  if (isDragging && draggedCharge) {
    draggedCharge.x = event.offsetX;
    draggedCharge.y = event.offsetY;
    drawCharges();
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  draggedCharge = null;
  charges.forEach((charge) => {
    if (charge.movable) {
      updateForces();
    }
  });
});

function updateForces() {
  charges.forEach((charge) => {
    if (charge.movable && !isDragging) {
      if (!charge.inDipole) {
        let forces = calculateForces(charge);
        updatePosition(charge, forces);
      }
    }
  });
  drawCharges();
  requestAnimationFrame(updateForces);
}

function calculateForces(charge) {
  let fx = 0,
    fy = 0;
  charges.forEach((other) => {
    if (other !== charge && !charge.inDipole) {
      let dx = other.x - charge.x;
      let dy = other.y - charge.y;
      let r = Math.sqrt(dx * dx + dy * dy);
      if (r < minDistance && charge.charge * other.charge < 0) {
        charge.inDipole = true;
        charge.x = other.x - (minDistance + 5) * (dx / r);
        charge.y = other.y - (minDistance + 5) * (dy / r);
        return;
      }
      let forceMagnitude = (k * charge.charge * other.charge) / (r * r);
      fx += forceMagnitude * (dx / r);
      fy += forceMagnitude * (dy / r);
    }
  });
  return { fx, fy };
}

function updatePosition(charge, forces) {
  if (!charge.inDipole) {
    charge.x += forces.fx * -0.01;
    charge.y += forces.fy * -0.01;
  }
}

drawCharges();
requestAnimationFrame(updateForces);
