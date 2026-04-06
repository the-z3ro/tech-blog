---
title: "Canvas 03 : Gravity, Input and the Feel of Things"
date: 2026-04-15T00:00:00+05:30
draft: false
tags: ["canvas", "javascript", "web", "game", "physics"]
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 3
hiddenInHomeList: false
description: "Part 3 of the HTML Canvas series. We add continuous physics, gravity and procedural obstacles, then build a fully playable Flappy Bird. Also covers game states and the art of making things feel right."
cover:
  image: ""
  alt: ""
  caption: ""
---

<!--
  NOTE FOR HUGO SETUP:
  This post uses inline HTML. Make sure unsafe rendering is enabled in hugo.yaml.
-->

<style>
.cv-post {
  --cv-green: #86efac; --cv-cyan: #5eead4;
  --cv-amber: #fbbf24; --cv-red:  #fca5a5;
}
.cv-puzzle {
  background: rgba(251,191,36,.04); border: 1px solid rgba(251,191,36,.2);
  border-left: 3px solid #fbbf24; border-radius: 6px; padding: 20px 24px; margin: 32px 0;
}
.cv-puzzle-label {
  font-family: 'JetBrains Mono',monospace; font-size: .68rem;
  letter-spacing: .14em; text-transform: uppercase; color: #fbbf24; margin-bottom: 12px;
}
.cv-puzzle p, .cv-puzzle li { color: #c4a855; font-size: .94rem; }
.cv-puzzle strong { color: #fbbf24; }
.cv-puzzle code { background: rgba(251,191,36,.08); border: 1px solid rgba(251,191,36,.2); padding: 1px 6px; border-radius: 3px; font-size: .85em; }
.cv-checkpoint {
  background: rgba(134,239,172,.03); border: 1px solid rgba(134,239,172,.18);
  border-left: 3px solid #86efac; border-radius: 6px; padding: 20px 24px; margin: 32px 0;
}
.cv-cp-label { font-family: 'JetBrains Mono',monospace; font-size: .68rem; letter-spacing: .14em; text-transform: uppercase; color: #86efac; margin-bottom: 14px; }
.cv-checkpoint ul { list-style: none; padding: 0; margin: 0; }
.cv-checkpoint ul li { display: flex; align-items: flex-start; gap: 10px; font-size: .9rem; color: #8aad8e; margin-bottom: 8px; cursor: pointer; }
.cv-cb { width: 15px; height: 15px; border: 1px solid #2a4a2e; border-radius: 2px; flex-shrink: 0; margin-top: 2px; background: #0d110c; display: flex; align-items: center; justify-content: center; transition: all .15s; font-size: 9px; font-weight: bold; color: transparent; }
.cv-cb.done { background: #86efac; border-color: #86efac; color: #0d110c; }
.cv-note { background: rgba(94,234,212,.04); border: 1px solid rgba(94,234,212,.18); border-left: 3px solid #5eead4; border-radius: 6px; padding: 16px 22px; margin: 24px 0; font-size: .93rem; color: #78b8b0; }
.cv-note strong { color: #5eead4; }
.cv-note code { background: rgba(94,234,212,.08); padding: 1px 6px; border-radius: 3px; font-size: .85em; }
.cv-project { background: rgba(134,239,172,.02); border: 1px solid rgba(134,239,172,.12); border-radius: 8px; padding: 24px 28px; margin: 36px 0; }
.cv-project-header { font-family: 'JetBrains Mono',monospace; font-size: .7rem; letter-spacing: .16em; text-transform: uppercase; color: #86efac; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(134,239,172,.1); }
.cv-project p { color: #9ab89e; font-size: .94rem; }
.cv-next { background: rgba(18,22,16,.7); border: 1px solid rgba(134,239,172,.12); border-radius: 8px; padding: 22px 26px; margin: 40px 0 0 0; text-align: center; }
.cv-next p { color: #788571; font-size: .9rem; margin: 0; }
.cv-next strong { color: #86efac; }
</style>

<div class="cv-post">

Snake moved in discrete steps on a grid. Clean, predictable, easy to reason about. What we're building now is different. Flappy Bird is continuous -- the bird is constantly falling, velocity accumulates, and the pipes come at you from the right with no fixed grid to think in.

This is where things start to feel like a real game.

---

## Velocity and acceleration

In Part 2 we briefly mentioned that objects have a position and a velocity. Let's be more precise about what that means in code.

Position is where the object is right now. Velocity is how fast position changes per frame. Acceleration is how fast velocity changes per frame.

```js
// the three variables that describe any moving object
let y = 200; // current position
let vy = 0; // velocity (pixels per second, or per frame)
let ay = 0.5; // acceleration (gravity pulling down)

// each frame:
vy += ay; // gravity pulls velocity downward
y += vy; // velocity moves position
```

That's it. That's gravity in three lines. Every frame, `vy` gets a little more positive (more downward), so the bird falls faster and faster. When you press jump, you just set `vy` to a negative number -- upward velocity that gravity then decelerates back to zero.

Run this in your head for a few frames:

| Frame | vy before | ay added | vy after | y change |
| ----- | --------- | -------- | -------- | -------- |
| 1     | 0         | +0.5     | 0.5      | +0.5     |
| 2     | 0.5       | +0.5     | 1.0      | +1.0     |
| 3     | 1.0       | +0.5     | 1.5      | +1.5     |
| jump  | 1.5       | reset    | -8       | -8       |
| after | -8        | +0.5     | -7.5     | -7.5     |

That acceleration-to-zero-to-positive arc is what gives jump mechanics their feel. Flappy Bird's jump is abrupt and short. Mario's is floatier. The numbers are different but the math is the same.

---

## Game states

Our Snake game had a simple `gameOver` boolean. For Flappy Bird we need something slightly more structured. The game has three distinct states:

- **IDLE**: the start screen, bird bobs gently, waiting for input
- **PLAYING**: the game is running, pipes come, physics active
- **DEAD**: the bird hit something, brief freeze, then show score and restart prompt

Using a string or an enum-style object keeps things readable:

```js
const STATE = {
  IDLE: "idle",
  PLAYING: "playing",
  DEAD: "dead",
};

let gameState = STATE.IDLE;
```

Then in your loop:

```js
function update(dt) {
  if (gameState === STATE.PLAYING) {
    updateBird(dt);
    updatePipes(dt);
    checkCollisions();
  }
  if (gameState === STATE.IDLE) {
    updateIdleAnimation(dt);
  }
}
```

This is much cleaner than a pile of booleans. And it scales -- if you add a pause screen or a countdown, it's just another state.

---

## Procedural pipe generation

Flappy Bird's pipes are infinite and random. You don't pre-place them -- you generate them as the game scrolls.

The approach: keep a list of pipes, add a new one every N pixels of scroll, and remove pipes that have gone off the left edge.

```js
const pipes = [];
const PIPE_GAP = 140; // vertical space between top and bottom pipe
const PIPE_WIDTH = 52;
const PIPE_SPEED = 180; // pixels per second
const PIPE_SPAWN = 270; // horizontal distance between pipes

let distanceSinceLastPipe = 0;
```

Each pipe is an object with just `x` and `gapY` (the vertical center of the gap):

```js
function spawnPipe() {
  const gapY = 80 + Math.random() * (H - 200); // random gap center
  pipes.push({ x: W, gapY });
}

function updatePipes(dt) {
  distanceSinceLastPipe += PIPE_SPEED * dt;

  if (distanceSinceLastPipe >= PIPE_SPAWN) {
    spawnPipe();
    distanceSinceLastPipe = 0;
  }

  pipes.forEach((pipe) => (pipe.x -= PIPE_SPEED * dt));

  // remove pipes that went off screen
  while (pipes.length && pipes[0].x < -PIPE_WIDTH) {
    pipes.shift();
    score++;
  }
}
```

Removing from the front with `shift()` works because pipes always exit the screen in the order they were added.

---

<div class="cv-puzzle">
<div class="cv-puzzle-label">// puzzle 03 => before collision detection</div>
<p>Pause here and think through this: how would you detect if the bird (a small rectangle) has hit a pipe?</p>
<p>Each pipe has an <code>x</code> position and a <code>gapY</code> center. The gap has height <code>PIPE_GAP</code>. The top pipe goes from y=0 down to <code>gapY - PIPE_GAP/2</code>. The bottom pipe goes from <code>gapY + PIPE_GAP/2</code> down to the bottom of the screen.</p>
<p>The bird has an <code>x</code>, <code>y</code> and a radius. Write the collision condition as a boolean expression before reading on.</p>
<p>This is called <strong>AABB collision</strong> (axis-aligned bounding box) and it's used everywhere. Worth figuring out yourself.</p>
</div>

---

## Collision detection

The basic idea for rectangle vs rectangle: two rectangles are overlapping if and only if they overlap on both the X axis and the Y axis simultaneously.

For the bird (circle approximated as a small box) vs a pipe:

```js
function checkCollisions() {
  // floor and ceiling
  if (bird.y - bird.r < 0 || bird.y + bird.r > floorY) {
    die();
    return;
  }

  pipes.forEach((pipe) => {
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + PIPE_WIDTH;
    const gapTop = pipe.gapY - PIPE_GAP / 2;
    const gapBottom = pipe.gapY + PIPE_GAP / 2;

    // is the bird horizontally overlapping with this pipe?
    const horizontalOverlap =
      bird.x + bird.r > pipeLeft && bird.x - bird.r < pipeRight;

    if (!horizontalOverlap) return;

    // if horizontally overlapping, check if bird is outside the gap
    const hitTopPipe = bird.y - bird.r < gapTop;
    const hitBottomPipe = bird.y + bird.r > gapBottom;

    if (hitTopPipe || hitBottomPipe) {
      die();
    }
  });
}

function die() {
  gameState = STATE.DEAD;
  // add a little screen shake here later
}
```

---

## Building Flappy Bird

<div class="cv-project">
<div class="cv-project-header">// project 03 of 05 — flappy bird (complete)</div>
<p>Everything above snaps together now. Set up the constants, build the state machine, draw the pipes and bird, handle the one input. Let's go.</p>
</div>

### Full setup

```js
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const W = 360;
const H = 640;
canvas.width = W;
canvas.height = H;

const STATE = { IDLE: "idle", PLAYING: "playing", DEAD: "dead" };
let gameState = STATE.IDLE;

const GRAVITY = 1400; // px/s^2
const JUMP_VEL = -420; // px/s (negative = up)
const PIPE_SPEED = 180;
const PIPE_GAP = 150;
const PIPE_WIDTH = 54;
const PIPE_SPAWN = 280;
const FLOOR_Y = H - 80;

const bird = { x: 80, y: H / 2, vy: 0, r: 14 };
const pipes = [];
let score = 0;
let bestScore = parseInt(localStorage.getItem("flappy_best") || "0");
let distanceSinceLastPipe = PIPE_SPAWN;
let idleTime = 0;
```

Using real units (px/s, px/s^2) with delta time gives consistent behavior across frame rates.

### Drawing functions

```js
function drawBackground() {
  // sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
  sky.addColorStop(0, "#0a1628");
  sky.addColorStop(1, "#1a3a5c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, FLOOR_Y);

  // ground
  ctx.fillStyle = "#2d5a1b";
  ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);
  ctx.fillStyle = "#3d7a25";
  ctx.fillRect(0, FLOOR_Y, W, 8);
}

function drawPipes() {
  pipes.forEach((pipe) => {
    const gapTop = pipe.gapY - PIPE_GAP / 2;
    const gapBottom = pipe.gapY + PIPE_GAP / 2;

    // pipe color with a lighter edge
    ctx.fillStyle = "#4a9e2f";
    // top pipe body
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, gapTop);
    // top pipe cap
    ctx.fillStyle = "#5cb83a";
    ctx.fillRect(pipe.x - 4, gapTop - 20, PIPE_WIDTH + 8, 20);

    // bottom pipe
    ctx.fillStyle = "#4a9e2f";
    ctx.fillRect(pipe.x, gapBottom, PIPE_WIDTH, FLOOR_Y - gapBottom);
    ctx.fillStyle = "#5cb83a";
    ctx.fillRect(pipe.x - 4, gapBottom, PIPE_WIDTH + 8, 20);
  });
}

function drawBird() {
  const rotation = Math.max(-0.5, Math.min(bird.vy / 600, 1.2));

  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(rotation);

  // body
  ctx.beginPath();
  ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
  ctx.fillStyle = "#fbbf24";
  ctx.fill();
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 2;
  ctx.stroke();

  // eye
  ctx.beginPath();
  ctx.arc(6, -4, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(7, -4, 2, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();

  // beak
  ctx.beginPath();
  ctx.moveTo(10, 1);
  ctx.lineTo(18, 0);
  ctx.lineTo(10, 5);
  ctx.closePath();
  ctx.fillStyle = "#f97316";
  ctx.fill();

  ctx.restore();
}

function drawHUD() {
  if (gameState === STATE.PLAYING || gameState === STATE.DEAD) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 42px Space Grotesk";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(score, W / 2, 30);
  }

  if (gameState === STATE.IDLE) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 36px Space Grotesk";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FLAPPY BIRD", W / 2, H / 2 - 50);
    ctx.fillStyle = "#c8d1c1";
    ctx.font = "14px JetBrains Mono";
    ctx.fillText("tap or press space to start", W / 2, H / 2);
    ctx.fillStyle = "#788571";
    ctx.font = "12px JetBrains Mono";
    ctx.fillText(`best: ${bestScore}`, W / 2, H / 2 + 30);
  }

  if (gameState === STATE.DEAD) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold 32px Space Grotesk";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("OUCH", W / 2, H / 2 - 60);

    ctx.fillStyle = "#c8d1c1";
    ctx.font = "16px JetBrains Mono";
    ctx.fillText(`score:  ${score}`, W / 2, H / 2 - 20);
    ctx.fillText(`best:   ${bestScore}`, W / 2, H / 2 + 10);

    ctx.fillStyle = "#788571";
    ctx.font = "13px JetBrains Mono";
    ctx.fillText("tap or space to restart", W / 2, H / 2 + 50);
  }
}
```

The `ctx.save()` and `ctx.restore()` around the bird drawing is important -- `ctx.rotate()` affects everything drawn after it, on the whole canvas. `save()` snapshots the current transform state and `restore()` brings it back. Without them, every draw call after the bird would be rotated too.

### Update functions

```js
function updateBird(dt) {
  bird.vy += GRAVITY * dt;
  bird.y += bird.vy * dt;
}

function updatePipes(dt) {
  distanceSinceLastPipe += PIPE_SPEED * dt;
  if (distanceSinceLastPipe >= PIPE_SPAWN) {
    pipes.push({ x: W, gapY: 120 + Math.random() * (FLOOR_Y - 240) });
    distanceSinceLastPipe = 0;
  }
  pipes.forEach((p) => (p.x -= PIPE_SPEED * dt));
  while (pipes.length && pipes[0].x < -PIPE_WIDTH) {
    pipes.shift();
    score++;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("flappy_best", bestScore);
    }
  }
}

function checkCollisions() {
  if (bird.y + bird.r >= FLOOR_Y || bird.y - bird.r <= 0) {
    die();
    return;
  }
  pipes.forEach((p) => {
    const hor = bird.x + bird.r > p.x && bird.x - bird.r < p.x + PIPE_WIDTH;
    if (!hor) return;
    if (
      bird.y - bird.r < p.gapY - PIPE_GAP / 2 ||
      bird.y + bird.r > p.gapY + PIPE_GAP / 2
    )
      die();
  });
}

function die() {
  if (gameState !== STATE.PLAYING) return;
  gameState = STATE.DEAD;
}

function jump() {
  if (gameState === STATE.IDLE) {
    gameState = STATE.PLAYING;
    bird.vy = JUMP_VEL;
    return;
  }
  if (gameState === STATE.DEAD) {
    resetGame();
    return;
  }
  bird.vy = JUMP_VEL;
}

function resetGame() {
  bird.y = H / 2;
  bird.vy = 0;
  pipes.length = 0;
  score = 0;
  distanceSinceLastPipe = PIPE_SPAWN;
  gameState = STATE.PLAYING;
  bird.vy = JUMP_VEL;
}
```

### The loop and input

```js
let lastTime = 0;

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  if (gameState === STATE.PLAYING) {
    updateBird(dt);
    updatePipes(dt);
    checkCollisions();
  }

  if (gameState === STATE.IDLE) {
    // gentle hovering idle animation
    idleTime += dt;
    bird.y = H / 2 + Math.sin(idleTime * 2.5) * 8;
  }

  drawBackground();
  drawPipes();
  drawBird();
  drawHUD();

  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "ArrowUp") {
    e.preventDefault();
    jump();
  }
});
canvas.addEventListener("click", jump);
canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    jump();
  },
  { passive: false },
);

requestAnimationFrame(loop);
```

### Tuning the feel

Here's the thing about Flappy Bird: it's famously brutal. The original game has very specific numbers that make it feel that particular way. Your numbers will probably feel slightly different -- and that's fine, they're yours.

Some things to mess with:

- `GRAVITY` lower (like 900) makes it floatier and forgiving
- `JUMP_VEL` more negative (like -500) makes jumps more powerful
- `PIPE_GAP` larger (like 200) makes it way easier
- `PIPE_SPEED` higher makes it more intense

Spend 10 minutes changing just these numbers. You'll get a feel for how each one changes the game. That's basically what game feel tuning is.

<div class="cv-note">
<strong>// on ctx.save / ctx.restore:</strong> these save and restore the entire canvas state -- transform, fillStyle, strokeStyle, lineWidth, everything. Use them whenever you need to apply a transform (translate, rotate, scale) for just one drawing operation. Always pair them -- an unmatched <code>save()</code> is a slow memory leak.
</div>

---

<div class="cv-checkpoint">
<div class="cv-cp-label">// checkpoint -- part 03</div>
<ul>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand velocity and acceleration (position += velocity, velocity += acceleration)</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can implement a game state machine with more than 2 states</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can generate infinite procedural obstacles</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can implement AABB collision detection</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I know how to use ctx.save() and ctx.restore() for isolated transforms</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I built a playable Flappy Bird and tuned the feel myself</span></li>
</ul>
</div>

---

<div class="cv-next">
<p><strong>// up next — Part 04: Pixels Are Just Numbers</strong></p>
<p>We've been drawing shapes and managing movement. In Part 4 we go deeper into what canvas actually stores -- raw pixel data. We'll cover <code>drawImage</code>, sprite sheets, and <code>getImageData</code> which lets you read and modify individual pixels. The project is the full Pac-Man game with actual ghost AI, a tile map and proper collision.</p>
</div>

</div>
