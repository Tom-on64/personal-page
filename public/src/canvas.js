/** @type {HTMLCanvasElement} */

const canvas = document.getElementById("animation");
const ctx = canvas.getContext("2d");

let particles = [];

const randomC = () => {
  return Math.floor(Math.random() * 255);
};

const randomPos = () => {
  return Math.floor(Math.random() * canvas.width);
};

const toHex = (col) => {
  const r = col[0].toString(16).padEnd(2, "0");
  const g = col[1].toString(16).padEnd(2, "0");
  const b = col[2].toString(16).padEnd(2, "0");
  return `#${r}${g}${b}`;
};

class Particle {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.color = [randomC(), randomC(), randomC()];
    this.gravity = 0.1;
  }

  update(x, y) {
    this.grav();
    this.move(x, y);
    this.draw();
  }

  grav() {
    this.x += this.vx;
    this.y += this.vy;
  }

  move(x, y) {
    if (this.x < x) this.vx += this.gravity;
    if (this.x > x) this.vx -= this.gravity;
    if (this.y < y) this.vy += this.gravity;
    if (this.y > y) this.vy -= this.gravity;
  }

  draw() {
    ctx.fillStyle = toHex(this.color);
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
}

const setup = () => {
  canvas.width = 360;
  canvas.height = 360;
};

export const start = () => {
  setup();

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < Math.floor(Math.random() * 25); i++) {
    particles.push(
      new Particle(randomPos(), randomPos(), Math.random(), Math.random())
    );
  }

  update();
};

const update = () => {
  ctx.fillStyle = "#00000009"
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => p.update(canvas.width / 2, canvas.height / 2));

  requestAnimationFrame(update);
};

document.getElementById("restart").onclick = () => {
  setup();
  
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  particles = [];
  for (let i = 0; i < Math.floor(Math.random() * 25); i++) {
    particles.push(
      new Particle(randomPos(), randomPos(), Math.random(), Math.random())
    );
  }
}

start();
