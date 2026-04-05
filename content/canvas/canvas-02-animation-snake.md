---
title: "Canvas 02 : Making Things Move"
date: 2026-04-12T00:00:00+05:30
draft: false
tags: ["canvas", "javascript", "web", "game"]
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 2
hiddenInHomeList: false
description: "Part 2 of the HTML Canvas series. We build the animation loop that powers every canvas game, understand state vs render separation, and finish with a fully playable Snake game."
cover:
  image: ""
  alt: ""
  caption: ""
---

<!--
  NOTE FOR HUGO SETUP:
  This post uses inline HTML. Make sure your hugo.yaml has:

  markup:
    goldmark:
      renderer:
        unsafe: true
-->

<style>
.cv-post {
  --cv-green:   #86efac;
  --cv-cyan:    #5eead4;
  --cv-amber:   #fbbf24;
  --cv-red:     #fca5a5;
  --cv-border:  rgba(134, 239, 172, 0.15);
}
.cv-puzzle {
  background: rgba(251, 191, 36, 0.04);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-left: 3px solid #fbbf24;
  border-radius: 6px;
  padding: 20px 24px;
  margin: 32px 0;
}
.cv-puzzle-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fbbf24;
  margin-bottom: 12px;
}
.cv-puzzle p, .cv-puzzle li { color: #c4a855; font-size: 0.94rem; }
.cv-puzzle strong { color: #fbbf24; }
.cv-puzzle code {
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.2);
  padding: 1px 6px; border-radius: 3px; font-size: 0.85em;
}
.cv-checkpoint {
  background: rgba(134, 239, 172, 0.03);
  border: 1px solid rgba(134, 239, 172, 0.18);
  border-left: 3px solid #86efac;
  border-radius: 6px;
  padding: 20px 24px;
  margin: 32px 0;
}
.cv-cp-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #86efac;
  margin-bottom: 14px;
}
.cv-checkpoint ul { list-style: none; padding: 0; margin: 0; }
.cv-checkpoint ul li {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 0.9rem; color: #8aad8e; margin-bottom: 8px; cursor: pointer;
}
.cv-cb {
  width: 15px; height: 15px;
  border: 1px solid #2a4a2e; border-radius: 2px; flex-shrink: 0;
  margin-top: 2px; background: #0d110c;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; font-size: 9px; font-weight: bold; color: transparent;
}
.cv-cb.done { background: #86efac; border-color: #86efac; color: #0d110c; }
.cv-note {
  background: rgba(94, 234, 212, 0.04);
  border: 1px solid rgba(94, 234, 212, 0.18);
  border-left: 3px solid #5eead4;
  border-radius: 6px;
  padding: 16px 22px; margin: 24px 0;
  font-size: 0.93rem; color: #78b8b0;
}
.cv-note strong { color: #5eead4; }
.cv-note code {
  background: rgba(94, 234, 212, 0.08);
  padding: 1px 6px; border-radius: 3px; font-size: 0.85em;
}
.cv-project {
  background: rgba(134, 239, 172, 0.02);
  border: 1px solid rgba(134, 239, 172, 0.12);
  border-radius: 8px; padding: 24px 28px; margin: 36px 0;
}
.cv-project-header {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: #86efac; margin-bottom: 16px; padding-bottom: 12px;
  border-bottom: 1px solid rgba(134, 239, 172, 0.1);
}
.cv-project p { color: #9ab89e; font-size: 0.94rem; }
.cv-next {
  background: rgba(18, 22, 16, 0.7);
  border: 1px solid rgba(134, 239, 172, 0.12);
  border-radius: 8px; padding: 22px 26px;
  margin: 40px 0 0 0; text-align: center;
}
.cv-next p { color: #788571; font-size: 0.9rem; margin: 0; }
.cv-next strong { color: #86efac; }
</style>

<div class="cv-post">

Last time we ended with a static Pac-Man frame. Looked fine. Did nothing. Every time you refreshed the page it was the same, frozen moment.

That's not a game. That's a painting.

The difference between a painting and a game is time. Things need to update. And for that, you need an animation loop.

---

## Why not setInterval

If you've done any JS, your first instinct for "run this repeatedly" is probably `setInterval`. It works, technically. But it has problems.

`setInterval` fires at a fixed time interval regardless of what the browser is doing. If the browser is busy, frames pile up. If the tab is hidden, it still runs, wasting CPU. And it's not tied to the display's refresh rate, so you get choppy animation even on fast machines.

`requestAnimationFrame` fixes all of this:

- fires just before the browser paints the next frame, so it's in sync with the display
- automatically pauses when the tab is hidden
- passes a timestamp to your callback so you can measure elapsed time
- runs at 60fps on most screens (or whatever the screen's native refresh is)

The pattern is simple:

```js
function loop(timestamp) {
  // update your game state
  // draw everything

  requestAnimationFrame(loop); // schedule the next frame
}

requestAnimationFrame(loop); // kick it off
```

Notice: `requestAnimationFrame(loop)` inside `loop` itself. Each frame schedules the next one. To stop the animation you just don't call it again.

---

## The clear, update, draw cycle

Every frame follows the same three steps, always in this order:

**1. Clear** -- erase everything from the previous frame.
**2. Update** -- move things, check collisions, advance game state.
**3. Draw** -- render everything in its new position.

If you skip the clear step, you get ghost trails -- the old positions stay visible behind the moving object. Sometimes that's an effect you want, but usually you want a clean slate each frame.

```js
function loop(timestamp) {
  // 1. clear
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // 2. update (we'll add real state here soon)
  x += vx;
  y += vy;

  // 3. draw
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#86efac";
  ctx.fill();

  requestAnimationFrame(loop);
}
```

Try that with a ball and give it some velocity (`vx = 2, vy = 1.5`). You'll see it move. Add some bounce logic when it hits the walls. That's literally the foundation of every canvas game.

---

## Delta time -- making speed frame-rate independent

Here's a problem you'll hit eventually: if you always move things by a fixed amount each frame, the game runs faster on a 120fps monitor than a 60fps one.

The fix is delta time. Instead of "move 2 pixels per frame", you say "move 200 pixels per second". Then each frame you multiply by how long that frame actually took.

```js
let lastTime = 0;

function loop(timestamp) {
  const dt = (timestamp - lastTime) / 1000; // seconds since last frame
  lastTime = timestamp;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  x += speed * dt; // speed is in pixels per second now
  y += speed * dt;

  // draw...

  requestAnimationFrame(loop);
}
```

`dt` at 60fps is roughly `0.016` (16ms in seconds). So `speed * dt` at 200px/s gives you about 3.3 pixels per frame. Same on 120fps, just at smaller steps. The object moves at the same real-world speed regardless.

For Snake we actually don't want continuous movement -- we want discrete steps on a grid. So we'll handle it differently. But for Flappy Bird in Part 3, delta time matters a lot.

<div class="cv-note">
<strong>// heads up:</strong> on the very first frame, <code>dt</code> can be huge because <code>lastTime</code> starts at 0. Guard against it: <code>const dt = Math.min((timestamp - lastTime) / 1000, 0.1)</code>. The <code>Math.min</code> caps it at 100ms so a single bad frame doesn't teleport your objects.
</div>

---

## State vs render -- why this matters

This sounds like architecture talk but it's actually practical.

The idea is: keep your game state (positions, scores, directions, lives) completely separate from your drawing code. Your update logic changes state. Your draw functions read state and paint it. They never mix.

Bad pattern:

```js
// mixing state mutation with drawing
ctx.fillRect(player.x++, player.y, 20, 20); // don't do this
```

Good pattern:

```js
// update
function update() {
  player.x += player.vx;
}

// draw
function draw() {
  ctx.fillRect(player.x, player.y, 20, 20);
}

function loop() {
  ctx.fillRect(0, 0, W, H);
  update();
  draw();
  requestAnimationFrame(loop);
}
```

Why does it matter? Because later when you add game over screens, pause menus, reset logic -- you'll want to be able to stop updating without stopping drawing (e.g. a frozen pause screen). If your state and rendering are tangled together, that becomes painful.

---

## Keyboard input

Canvas doesn't handle focus or input natively. You listen on `window` or `document`:

```js
const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  e.preventDefault(); // stops arrow keys from scrolling the page
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});
```

Then in your update function:

```js
function update() {
  if (keys["ArrowLeft"]) player.x -= 3;
  if (keys["ArrowRight"]) player.x += 3;
  if (keys["ArrowUp"]) player.y -= 3;
  if (keys["ArrowDown"]) player.y += 3;
}
```

The `keys` object approach handles multiple keys pressed at the same time naturally, which `keydown` events alone can't do cleanly.

---

<div class="cv-puzzle">
<div class="cv-puzzle-label">// puzzle 02 => before the snake build</div>
<p>Make a ball that bounces around the canvas. Start it somewhere in the middle with a velocity of <code>vx = 3, vy = 2</code>. When it hits a wall, reverse the relevant velocity component. Use <code>requestAnimationFrame</code>.</p>
<p>Once you have that working, add this: when you press Space, the ball changes to a random color. Use the <code>keys</code> pattern above but for one-off key presses (hint: keydown event, not the keys object).</p>
<p>Genuinely try this. It's not a filler exercise. The bounce math you work out here is the same logic that handles ball physics in Breakout, Pong, and a dozen other games.</p>
</div>

---

## Project: Snake

<div class="cv-project">
<div class="cv-project-header">// project 02 of 05 — snake (complete)</div>
<p>Snake is perfect for learning canvas because it forces you to think about grid-based game state, collision detection and a game loop -- all the fundamentals. And it's genuinely fun to play when you're done.</p>
</div>

We'll build it in stages. Don't skip ahead.

### Step 1: Grid system and constants

Snake lives on a grid. Set that up first:

```js
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const COLS = 20;
const ROWS = 20;
const CELL = 28; // pixels per cell

canvas.width = COLS * CELL;
canvas.height = ROWS * CELL + 40; // extra 40 for score bar

const W = canvas.width;
const H = canvas.height;
```

Working with a grid means every position is a `{x, y}` in grid coordinates (not pixels). You convert to pixels when drawing: `gridX * CELL`.

### Step 2: Game state

```js
let snake = [
  { x: 10, y: 10 }, // head
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

let direction = { x: 1, y: 0 }; // moving right
let nextDir = { x: 1, y: 0 }; // buffered input
let food = { x: 15, y: 10 };
let score = 0;
let gameOver = false;
let moveTimer = 0;
const MOVE_INTERVAL = 120; // ms between snake moves
```

Two directions: `direction` (current) and `nextDir` (buffered). The reason is that if the snake is moving right and you press down then right really fast, you don't want the snake to briefly go left. Buffering the input and applying it only once per move step prevents this.

### Step 3: Input

```js
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      if (direction.y !== 1) nextDir = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y !== -1) nextDir = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x !== 1) nextDir = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x !== -1) nextDir = { x: 1, y: 0 };
      break;
  }
  e.preventDefault();
});
```

The checks like `if (direction.y !== 1)` prevent reversing directly into yourself. If you're going up (`y: -1`), you can't go down (`y: 1`) -- that's the condition it checks.

### Step 4: The move function

```js
function moveSnake() {
  direction = nextDir;

  const head = snake[0];
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  // wall collision
  if (
    newHead.x < 0 ||
    newHead.x >= COLS ||
    newHead.y < 0 ||
    newHead.y >= ROWS
  ) {
    gameOver = true;
    return;
  }

  // self collision
  if (snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
    gameOver = true;
    return;
  }

  snake.unshift(newHead); // add new head

  // did we eat food?
  if (newHead.x === food.x && newHead.y === food.y) {
    score++;
    spawnFood();
    // don't pop the tail -- snake gets longer
  } else {
    snake.pop(); // remove tail to keep length constant
  }
}
```

The grow mechanic is clever: when you eat food, you skip the `pop()`. The tail just stays where it was, making the snake one segment longer. Simple but elegant.

### Step 5: Food spawning

```js
function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((seg) => seg.x === pos.x && seg.y === pos.y));

  food = pos;
}
```

The `do...while` loop keeps picking random positions until it finds one that isn't occupied by the snake. For a short snake this is basically instant, for a very long one it could get slow -- but that's a problem for another day.

### Step 6: Drawing

```js
function draw() {
  // background
  ctx.fillStyle = "#0d110c";
  ctx.fillRect(0, 0, W, H);

  // grid lines (subtle)
  ctx.strokeStyle = "rgba(134, 239, 172, 0.04)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, ROWS * CELL);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(COLS * CELL, y * CELL);
    ctx.stroke();
  }

  // food
  ctx.fillStyle = "#fca5a5";
  ctx.beginPath();
  ctx.arc(
    food.x * CELL + CELL / 2,
    food.y * CELL + CELL / 2,
    CELL / 2 - 4,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // snake body
  snake.forEach((seg, i) => {
    const alpha = 1 - (i / snake.length) * 0.6; // fade toward tail
    ctx.fillStyle =
      i === 0
        ? "#86efac" // head is bright
        : `rgba(134, 239, 172, ${alpha})`; // body fades

    const padding = i === 0 ? 2 : 3;
    ctx.fillRect(
      seg.x * CELL + padding,
      seg.y * CELL + padding,
      CELL - padding * 2,
      CELL - padding * 2,
    );
  });

  // score bar
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, ROWS * CELL, W, 40);
  ctx.fillStyle = "#86efac";
  ctx.font = "14px JetBrains Mono";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`SCORE  ${score}`, 12, ROWS * CELL + 20);
  ctx.textAlign = "right";
  ctx.fillText(`LENGTH  ${snake.length}`, W - 12, ROWS * CELL + 20);

  // game over overlay
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold 36px Space Grotesk";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", W / 2, H / 2 - 24);

    ctx.fillStyle = "#788571";
    ctx.font = "14px JetBrains Mono";
    ctx.fillText(`score: ${score}`, W / 2, H / 2 + 16);
    ctx.fillText("press R to restart", W / 2, H / 2 + 40);
  }
}
```

### Step 7: The game loop

```js
let lastTime = 0;

function loop(timestamp) {
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  if (!gameOver) {
    moveTimer += dt;
    if (moveTimer >= MOVE_INTERVAL) {
      moveTimer = 0;
      moveSnake();
    }
  }

  draw();
  requestAnimationFrame(loop);
}
```

Notice the move timer pattern. We're not moving the snake every frame -- that would be way too fast. Instead we accumulate time and only move when enough has passed. Change `MOVE_INTERVAL` to make the game faster or slower.

### Step 8: Restart

```js
function reset() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  moveTimer = 0;
  spawnFood();
}

window.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") reset();
  // ... rest of keydown handler
});

// Start
spawnFood();
requestAnimationFrame(loop);
```

That's the whole game. Not a library call in sight.

### Ideas to explore yourself

The game works, but it's pretty barebones. Some things to add on your own before Part 3:

- Speed it up as the snake gets longer (decrease `MOVE_INTERVAL` with score)
- Add a special food that flashes and disappears after a few seconds, worth more points
- Wrap-around walls instead of death (snake comes out the other side)
- High score stored in `localStorage`
- A proper start screen before the game begins

These aren't hard, and figuring them out yourself is the whole point.

---

<div class="cv-checkpoint">
<div class="cv-cp-label">// checkpoint -- part 02</div>
<ul>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand why requestAnimationFrame is better than setInterval</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can implement the clear, update, draw cycle</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand delta time and why frame-rate independence matters</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can handle keyboard input cleanly with the keys object pattern</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand the state vs render separation and why it helps</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done')?'✓':''"></div><span>I built a playable Snake game from scratch</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I tried at least one of the extension ideas on my own</span></li>
</ul>
</div>

---

<div class="cv-next">
<p><strong>// up next — Part 03: Gravity, Input and the Feel of Things</strong></p>
<p>Snake was grid-based and discrete. In Part 3 we go continuous -- real velocity, real gravity, real physics feel. We'll build Flappy Bird, which means learning how to tune numbers until something <em>feels right</em>. It's a skill game developers actually spend a lot of time on.</p>
</div>

</div>
