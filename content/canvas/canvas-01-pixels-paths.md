---
title: "Canvas 01 : Pixels, Paths and the Coordinate Lie"
date: 2026-04-11T00:00:00+05:30
draft: false
tags: ["canvas", "javascript", "web"]
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 1
hiddenInHomeList: false
description: "Part 1 of the HTML Canvas series. We go from a blank screen to a fully drawn static Pac-Man frame — covering coordinates, paths, arcs, colors and text along the way."
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

  Without this, Hugo strips the HTML blocks and the styling breaks.
-->

<style>
/* ── CANVAS POST SCOPED VARIABLES ──────────────── */
.cv-post {
  --cv-green:   #86efac;
  --cv-cyan:    #5eead4;
  --cv-amber:   #fbbf24;
  --cv-red:     #fca5a5;
  --cv-bg:      #0d110c;
  --cv-bg2:     #111810;
  --cv-border:  rgba(134, 239, 172, 0.15);
  --cv-border2: rgba(134, 239, 172, 0.35);
  --cv-muted:   #788571;
  --cv-text:    #c8d1c1;
}

/* ── PUZZLE BLOCK ──────────────────────────────── */
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
.cv-puzzle p,
.cv-puzzle li { color: #c4a855; font-size: 0.94rem; }
.cv-puzzle strong { color: #fbbf24; }
.cv-puzzle code {
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.2);
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.85em;
}

/* ── CHECKPOINT BLOCK ──────────────────────────── */
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
.cv-checkpoint ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.cv-checkpoint ul li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.9rem;
  color: #8aad8e;
  margin-bottom: 8px;
  cursor: pointer;
}
.cv-cb {
  width: 15px; height: 15px;
  border: 1px solid #2a4a2e;
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 2px;
  background: #0d110c;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  font-size: 9px;
  font-weight: bold;
  color: transparent;
}
.cv-cb.done {
  background: #86efac;
  border-color: #86efac;
  color: #0d110c;
}

/* ── NOTE / CALLOUT BLOCK ──────────────────────── */
.cv-note {
  background: rgba(94, 234, 212, 0.04);
  border: 1px solid rgba(94, 234, 212, 0.18);
  border-left: 3px solid #5eead4;
  border-radius: 6px;
  padding: 16px 22px;
  margin: 24px 0;
  font-size: 0.93rem;
  color: #78b8b0;
}
.cv-note strong { color: #5eead4; }
.cv-note code {
  background: rgba(94, 234, 212, 0.08);
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.85em;
}

/* ── PROJECT BLOCK ─────────────────────────────── */
.cv-project {
  background: rgba(134, 239, 172, 0.02);
  border: 1px solid rgba(134, 239, 172, 0.12);
  border-radius: 8px;
  padding: 24px 28px;
  margin: 36px 0;
}
.cv-project-header {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #86efac;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(134, 239, 172, 0.1);
}
.cv-project p { color: #9ab89e; font-size: 0.94rem; }

/* ── NEXT TEASER ───────────────────────────────── */
.cv-next {
  background: rgba(18, 22, 16, 0.7);
  border: 1px solid rgba(134, 239, 172, 0.12);
  border-radius: 8px;
  padding: 22px 26px;
  margin: 40px 0 0 0;
  text-align: center;
}
.cv-next p { color: #788571; font-size: 0.9rem; margin: 0; }
.cv-next strong { color: #86efac; }
</style>

<div class="cv-post">

ok so before we start, quick heads up: this is not the kind of post you read and close. open a code editor and a browser right next to it. every section has working code, run it as you go. if you just read through without touching the keyboard, by tomorrow you'll remember nothing. i genuinely promise.

---

## What is canvas, actually

So there's this `<canvas>` element in HTML that almost nobody really talks about. Most tutorials skip straight to Three.js or p5.js. Which is fine, libraries are great. But there's something really satisfying about understanding what's happening underneath all of that. Canvas is basically a blank rectangle in your browser where you get full pixel-level control using JavaScript. No DOM, no CSS, just you drawing things manually.

Games, data visualizations, image editors, generative art, physics simulations -- a huge chunk of the coolest things you see on the web are built with canvas. And it's not even that complicated once you have the right mental model.

By the time we're done with this series, you'll have built Snake, Flappy Bird, Pac-Man, a fake 3D rotating cube and an ASCII art converter. None of it uses a game engine. Just math and canvas API.

But right now we're starting from zero. Let's go.

---

## The setup

The HTML part is pretty much nothing:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Canvas</title>
    <style>
      body {
        margin: 0;
        background: #111;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      canvas {
        background: #000;
      }
    </style>
  </head>
  <body>
    <canvas id="gameCanvas" width="600" height="400"></canvas>

    <script>
      const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");

      // everything we draw happens here
      ctx.fillStyle = "#86efac";
      ctx.fillRect(50, 50, 200, 100);
    </script>
  </body>
</html>
```

Save that, open it in a browser. You should see a green rectangle. That's it, you're drawing on canvas.

Two things to notice here. First, the `width` and `height` on the `<canvas>` element are **not** CSS properties. Don't set canvas dimensions with CSS -- that just stretches the canvas and makes everything blurry. Always set them as HTML attributes.

Second, `getContext('2d')` is where all the real stuff lives. That `ctx` object is your drawing tool. Everything in this post and the next four is a method on that object.

<div class="cv-note">
<strong>// worth knowing:</strong> there's also <code>getContext('webgl')</code> for 3D rendering, but that's a completely different world. We're sticking with <code>'2d'</code> for this whole series. Honestly you can do a lot more with it than most people think.
</div>

---

## The coordinate system (the actual lie)

This is the most important thing to understand early, because it's different from everything you learned in math class.

In math, the Y axis goes **up**. (0, 0) is the bottom left, positive Y means higher.

On canvas, Y goes **down**. (0, 0) is the **top left**, and increasing Y moves things downward.

```
(0,0) ──────────────────────→ X increases
  │
  │
  │
  ↓
  Y increases
```

So if you want to draw something near the bottom of a 400px tall canvas, you give it a Y of around 350. If you want it near the top, Y is small.

This trips people up constantly. I spent like half an hour confused about why my shapes were mirrored when I first started. Now you know, so you won't waste that time.

The other thing: all coordinates you pass to canvas functions are in pixels. No percentages, no `em`, just plain numbers.

---

## Drawing rectangles

Rectangles are the simplest thing to draw, and canvas has three methods for them:

```js
// filled rectangle
ctx.fillStyle = "#86efac";
ctx.fillRect(x, y, width, height);

// outlined rectangle (no fill)
ctx.strokeStyle = "#5eead4";
ctx.lineWidth = 2;
ctx.strokeRect(x, y, width, height);

// erase a rectangle (makes it transparent)
ctx.clearRect(x, y, width, height);
```

All four arguments follow the same pattern: x position, y position, width, height. The x and y are the **top-left corner** of the rectangle.

Try this:

```js
// dark background
ctx.fillStyle = "#111";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// a few boxes
ctx.fillStyle = "#86efac";
ctx.fillRect(50, 50, 100, 60);

ctx.strokeStyle = "#5eead4";
ctx.lineWidth = 2;
ctx.strokeRect(200, 50, 100, 60);

ctx.fillStyle = "#fca5a5";
ctx.fillRect(350, 50, 100, 60);
ctx.clearRect(380, 70, 40, 20); // punch a hole in the red rectangle
```

`clearRect` is especially useful later when we do animation -- it's how you erase the previous frame before drawing the next one.

---

## Paths -- the real way to draw anything

Rectangles are convenient but limited. To draw anything more interesting -- lines, triangles, custom shapes, circles -- you use paths.

The idea is simple: you tell canvas to "start a new path", then describe a sequence of points/curves, then fill or stroke that shape. Think of it like lifting a pen, moving to a starting point, then drawing.

```js
ctx.beginPath(); // start fresh, clear any previous path
ctx.moveTo(100, 100); // pick up the pen, move to (100, 100)
ctx.lineTo(200, 100); // draw a line to (200, 100)
ctx.lineTo(150, 180); // draw a line to (150, 180)
ctx.closePath(); // draw a line back to the starting point
ctx.fillStyle = "#fbbf24";
ctx.fill(); // fill the shape
ctx.strokeStyle = "#fff";
ctx.lineWidth = 2;
ctx.stroke(); // also draw the outline
```

Run that and you'll get a triangle. The `closePath()` call connects the last point back to the first -- without it you'd have an open shape and filling would still work but the outline would have a gap.

One thing that catches people: `beginPath()` is really important. If you forget it, canvas keeps adding to the same path you were drawing before, and things get weird fast. Get in the habit of always starting with `beginPath()`.

Let's draw something more useful -- a cross/plus shape using lines:

```js
function drawCross(ctx, x, y, size) {
  const half = size / 2;
  const third = size / 3;

  ctx.beginPath();
  // horizontal bar
  ctx.moveTo(x - half, y - third);
  ctx.lineTo(x + half, y - third);
  ctx.lineTo(x + half, y + third);
  ctx.lineTo(x - half, y + third);
  ctx.closePath();

  ctx.beginPath();
  // vertical bar
  ctx.moveTo(x - third, y - half);
  ctx.lineTo(x + third, y - half);
  ctx.lineTo(x + third, y + half);
  ctx.lineTo(x - third, y + half);
  ctx.closePath();

  ctx.fillStyle = "#fca5a5";
  ctx.fill();
}

drawCross(ctx, 300, 200, 100);
```

Wait, that's two `beginPath()` calls. When you call `fill()` after the second path, does it fill both? Actually no -- calling `beginPath()` the second time clears the first one. Each fill/stroke call only applies to the current path.

If you want to draw two separate shapes and fill them differently, you always call `beginPath()` before each one.

---

## Arcs and circles

Circles are just a special case of an arc. The method is:

```js
ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
```

Angles are in **radians**, not degrees. `Math.PI` is 180 degrees, so a full circle goes from `0` to `Math.PI * 2`. This is one of those things you just accept and move on.

```js
// a full circle
ctx.beginPath();
ctx.arc(300, 200, 50, 0, Math.PI * 2);
ctx.fillStyle = "#86efac";
ctx.fill();

// a half circle (top half)
ctx.beginPath();
ctx.arc(300, 200, 80, Math.PI, Math.PI * 2);
ctx.fillStyle = "#5eead4";
ctx.fill();
```

For a Pac-Man shape, you want a circle with a wedge cut out for the mouth:

```js
ctx.beginPath();
ctx.moveTo(300, 200); // center point
ctx.arc(300, 200, 50, 0.3, Math.PI * 2 - 0.3); // arc with gap
ctx.closePath(); // connect back to center
ctx.fillStyle = "#fbbf24";
ctx.fill();
```

The `0.3` and `Math.PI * 2 - 0.3` are the start and end angles -- the gap is where the mouth is. Mess with that number to make the mouth bigger or smaller.

A quick degrees to radians helper to keep your sanity:

```js
const toRad = (deg) => (deg * Math.PI) / 180;

// now you can write:
ctx.arc(300, 200, 50, toRad(30), toRad(330));
```

---

## Colors and styling

`fillStyle` and `strokeStyle` accept pretty much anything CSS does:

```js
ctx.fillStyle = "#86efac"; // hex
ctx.fillStyle = "rgb(134, 239, 172)"; // rgb
ctx.fillStyle = "rgba(134, 239, 172, 0.5)"; // with transparency
ctx.fillStyle = "hsl(145, 70%, 74%)"; // hsl
```

For line work, a few properties you'll use all the time:

```js
ctx.lineWidth = 3; // thickness in pixels
ctx.lineCap = "round"; // end cap style: 'butt', 'round', 'square'
ctx.lineJoin = "round"; // corner style: 'miter', 'round', 'bevel'
```

Gradients take a tiny bit more setup but they look good:

```js
// linear gradient
const grad = ctx.createLinearGradient(0, 0, canvas.width, 0); // left to right
grad.addColorStop(0, "#86efac");
grad.addColorStop(1, "#5eead4");

ctx.fillStyle = grad;
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

`createLinearGradient` takes four args: the start x/y and end x/y. The color stops are 0 to 1, representing the position along that gradient line.

There's also `createRadialGradient` for circular gradients, but we'll come back to that when we actually need it.

---

## Text

Drawing text is straightforward:

```js
ctx.font = "24px Space Grotesk"; // CSS font string
ctx.fillStyle = "#c8d1c1";
ctx.fillText("hello canvas", 100, 100);

// or with a stroke:
ctx.strokeStyle = "#86efac";
ctx.lineWidth = 1;
ctx.strokeText("outlined text", 100, 150);
```

One thing to know: the y coordinate for text is the **baseline**, not the top of the text. So if you put text at y=0, most of it will be above the canvas and invisible. Give it a little room.

Alignment properties:

```js
ctx.textAlign = "center"; // 'left', 'right', 'center', 'start', 'end'
ctx.textBaseline = "middle"; // 'top', 'middle', 'bottom', 'alphabetic'
```

These are really useful when you want to center text inside a shape. Set both to `'center'`/`'middle'` and use the center coordinates of the shape, and it'll be perfectly centered.

---

<div class="cv-puzzle">
<div class="cv-puzzle-label">// puzzle 01 => before you continue</div>
<p>Try to draw a <strong>clock face</strong> before reading the project section. Don't overthink it -- just a circle for the face, 12 tick marks around it at equal angles, and some numbers at the main positions (12, 3, 6, 9). You have all the tools for this now.</p>
<p>The rotation math for equally spaced points around a circle is:</p>
<p><code>x = cx + radius * Math.cos(angle)</code><br><code>y = cy + radius * Math.sin(angle)</code></p>
<p>Where <code>angle</code> goes from <code>0</code> to <code>Math.PI * 2</code> in 12 equal steps.<br>Take 15 minutes and genuinely try it yourself. Then come back and keep reading.</p>
</div>

---

## Mini-project: Static Pac-Man Frame

<div class="cv-project">
<div class="cv-project-header">// project 01 of 05 — static pac-man frame</div>
<p>We're not building the full game yet. Not even close. Right now the goal is to use everything from this post to draw a Pac-Man scene that looks right. No movement, no logic, just drawing. By the end of Part 2, we'll start animating it. By Part 4, it'll be a real game.</p>
</div>

Build this step by step, don't paste the whole thing at once. You want to understand what each addition does.

### Step 1: The canvas and background

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Pac-Man</title>
    <style>
      body {
        margin: 0;
        background: #111;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      canvas {
        border: 2px solid #1a3a5c;
      }
    </style>
  </head>
  <body>
    <canvas id="c" width="560" height="620"></canvas>
    <script>
      const canvas = document.getElementById("c");
      const ctx = canvas.getContext("2d");
      const W = canvas.width;
      const H = canvas.height;

      // black background
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
    </script>
  </body>
</html>
```

`W` and `H` as shortcuts is a habit worth building now. You'll reference canvas dimensions constantly.

### Step 2: The maze walls

A proper Pac-Man maze is complex. We'll fake a simplified version using rectangles for the outer border and a few inner walls. Later when we do the real game in Part 4, we'll use a tile map. For now, keep it simple:

```js
function drawMaze() {
  ctx.strokeStyle = "#1a6fa8";
  ctx.lineWidth = 4;

  // outer border
  ctx.strokeRect(20, 20, W - 40, H - 60);

  // a few inner walls to make it feel like a maze
  // top section dividers
  ctx.strokeRect(20, 20, W / 2 - 50, 80);
  ctx.strokeRect(W / 2 + 50, 20, W / 2 - 70, 80);

  // ghost house in the center
  const ghX = W / 2 - 60;
  const ghY = H / 2 - 40;
  ctx.strokeRect(ghX, ghY, 120, 80);

  // ghost house door (drawn over the top edge to make a gap)
  ctx.fillStyle = "#fca5a5";
  ctx.fillRect(W / 2 - 25, ghY - 2, 50, 4);
}

drawMaze();
```

### Step 3: The dots

Pac-Man's dots are just small filled circles in a grid pattern, placed inside the maze. We skip the center ghost area and the edges where walls are:

```js
function drawDots() {
  const dotRadius = 3;
  const spacing = 28;
  const startX = 46;
  const startY = 46;

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 18; col++) {
      const x = startX + col * spacing;
      const y = startY + row * spacing;

      // skip the ghost house area
      const inGhostHouse =
        x > W / 2 - 80 && x < W / 2 + 80 && y > H / 2 - 60 && y < H / 2 + 100;
      // skip the edges
      const tooClose = x < 30 || x > W - 30 || y < 30 || y > H - 70;

      if (inGhostHouse || tooClose) continue;

      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#e8d5a3";
      ctx.fill();
    }
  }
}

drawDots();
```

### Step 4: Power pellets

The four big dots at the corners -- these make ghosts vulnerable:

```js
function drawPowerPellets() {
  const pellets = [
    { x: 60, y: 80 },
    { x: W - 60, y: 80 },
    { x: 60, y: H - 100 },
    { x: W - 60, y: H - 100 },
  ];

  pellets.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#e8d5a3";
    ctx.fill();
  });
}

drawPowerPellets();
```

### Step 5: Pac-Man

Put him in the bottom-left area of the maze, mouth open:

```js
function drawPacman(x, y, radius, mouthAngle) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, radius, mouthAngle, Math.PI * 2 - mouthAngle);
  ctx.closePath();
  ctx.fillStyle = "#fbbf24";
  ctx.fill();
}

drawPacman(90, H - 120, 20, 0.25);
```

### Step 6: A ghost (drawing it freehand)

Ghosts have that classic rounded top and wavy bottom. You can fake it with an arc for the top half and some curves for the body:

```js
function drawGhost(x, y, color) {
  const r = 18;
  const h = 36;

  ctx.beginPath();
  // semi-circle top
  ctx.arc(x, y, r, Math.PI, 0);
  // right side
  ctx.lineTo(x + r, y + h);
  // wavy bottom using quadratic curves
  ctx.quadraticCurveTo(x + r * 0.66, y + h - 10, x + r * 0.33, y + h);
  ctx.quadraticCurveTo(x, y + h - 10, x - r * 0.33, y + h);
  ctx.quadraticCurveTo(x - r * 0.66, y + h - 10, x - r, y + h);
  // left side
  ctx.lineTo(x - r, y);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  // eyes
  const eyeColors = ["#fff", "#1a6fa8"];
  const eyes = [
    { ex: x - 7, ey: y - 4 },
    { ex: x + 7, ey: y - 4 },
  ];

  eyes.forEach(({ ex, ey }) => {
    ctx.beginPath();
    ctx.arc(ex, ey, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ex + 1, ey + 1, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#1a6fa8";
    ctx.fill();
  });
}

// draw four ghosts in the ghost house
drawGhost(W / 2 - 40, H / 2 - 20, "#fca5a5"); // Blinky
drawGhost(W / 2, H / 2 - 20, "#f9a8d4"); // Pinky
drawGhost(W / 2 + 40, H / 2 - 20, "#5eead4"); // Inky
```

Notice we used `quadraticCurveTo` there. It takes a control point and an end point -- the control point "pulls" the curve toward it. That's how you get curves between points that aren't arcs.

### Step 7: Score display

```js
function drawHUD() {
  ctx.fillStyle = "#fff";
  ctx.font = "16px JetBrains Mono";
  ctx.textAlign = "left";
  ctx.fillText("SCORE", 20, H - 20);

  ctx.fillStyle = "#fbbf24";
  ctx.fillText("0", 90, H - 20);

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("HIGH SCORE", W / 2, H - 20);

  ctx.fillStyle = "#fbbf24";
  ctx.fillText("0", W / 2 + 80, H - 20);
}

drawHUD();
```

### The complete file

Here's everything together in the right order:

```js
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

// draw order matters -- later calls go on top of earlier ones
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, W, H);

drawMaze();
drawDots();
drawPowerPellets();
drawPacman(90, H - 120, 20, 0.25);
drawGhost(W / 2 - 40, H / 2 - 20, "#fca5a5");
drawGhost(W / 2, H / 2 - 20, "#f9a8d4");
drawGhost(W / 2 + 40, H / 2 - 20, "#5eead4");
drawHUD();
```

It won't look perfect, the maze is simplified. But you should see a recognizable Pac-Man scene. And importantly, you built it yourself using the raw API, no library, no tutorial copying.

<div class="cv-note">
<strong>// on draw order:</strong> canvas is a painter's model. whatever you draw last is on top. if you draw the dots before the background, the background will cover the dots. always draw backgrounds first.
</div>

---

<div class="cv-checkpoint">
<div class="cv-cp-label">// checkpoint -- part 01</div>
<ul>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I know how to set up a canvas element and get the 2d context</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand the coordinate system (Y goes down, origin is top-left)</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can draw rectangles using fillRect, strokeRect, clearRect</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand the path model: beginPath, moveTo, lineTo, closePath, fill/stroke</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can draw circles and arcs with ctx.arc()</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can style shapes with colors, gradients and line properties</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can draw and align text on the canvas</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I built the static Pac-Man frame</span></li>
</ul>
</div>

---

## A small thing to try on your own

Before Part 2, take the clock face puzzle from earlier (if you didn't do it, do it now) and add the **hour** and **minute** hands. Use `new Date()` to get the actual current time, convert the hours and minutes into angles, then draw lines from the center outward.

This is a fully working clock, on canvas, with real time, without any library. It's a good thing to have built.

---

<div class="cv-next">
<p><strong>// up next — Part 02: Making Things Move</strong></p>
<p>Right now everything we drew is static. One call, one frame, done. In Part 2 we get into <code>requestAnimationFrame</code> -- the loop that makes everything on canvas feel alive. We'll build the animation engine that powers every game in this series, and we'll use it to make Snake. By the end you'll have a fully playable game.</p>
</div>

</div>
