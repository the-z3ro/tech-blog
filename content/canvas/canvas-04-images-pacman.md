---
title: "Canvas 04 : Pixels Are Just Numbers"
date: 2026-04-16T00:00:00+05:30
draft: false
tags: ["canvas", "javascript", "web", "game", "images"]
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 4
hiddenInHomeList: false
description: "Part 4 of the HTML Canvas series. We get into drawImage, sprite sheets and raw pixel manipulation via getImageData. Project is full Pac-Man with a tile map, ghost AI and proper collision."
cover:
  image: ""
  alt: ""
  caption: ""
---

<!--
  NOTE FOR HUGO SETUP:
  unsafe: true required in markup.goldmark.renderer
-->

<style>
.cv-post { --cv-green:#86efac;--cv-cyan:#5eead4;--cv-amber:#fbbf24;--cv-red:#fca5a5; }
.cv-puzzle { background:rgba(251,191,36,.04);border:1px solid rgba(251,191,36,.2);border-left:3px solid #fbbf24;border-radius:6px;padding:20px 24px;margin:32px 0; }
.cv-puzzle-label { font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#fbbf24;margin-bottom:12px; }
.cv-puzzle p,.cv-puzzle li { color:#c4a855;font-size:.94rem; }
.cv-puzzle strong { color:#fbbf24; }
.cv-puzzle code { background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2);padding:1px 6px;border-radius:3px;font-size:.85em; }
.cv-checkpoint { background:rgba(134,239,172,.03);border:1px solid rgba(134,239,172,.18);border-left:3px solid #86efac;border-radius:6px;padding:20px 24px;margin:32px 0; }
.cv-cp-label { font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#86efac;margin-bottom:14px; }
.cv-checkpoint ul { list-style:none;padding:0;margin:0; }
.cv-checkpoint ul li { display:flex;align-items:flex-start;gap:10px;font-size:.9rem;color:#8aad8e;margin-bottom:8px;cursor:pointer; }
.cv-cb { width:15px;height:15px;border:1px solid #2a4a2e;border-radius:2px;flex-shrink:0;margin-top:2px;background:#0d110c;display:flex;align-items:center;justify-content:center;transition:all .15s;font-size:9px;font-weight:bold;color:transparent; }
.cv-cb.done { background:#86efac;border-color:#86efac;color:#0d110c; }
.cv-note { background:rgba(94,234,212,.04);border:1px solid rgba(94,234,212,.18);border-left:3px solid #5eead4;border-radius:6px;padding:16px 22px;margin:24px 0;font-size:.93rem;color:#78b8b0; }
.cv-note strong { color:#5eead4; }
.cv-note code { background:rgba(94,234,212,.08);padding:1px 6px;border-radius:3px;font-size:.85em; }
.cv-project { background:rgba(134,239,172,.02);border:1px solid rgba(134,239,172,.12);border-radius:8px;padding:24px 28px;margin:36px 0; }
.cv-project-header { font-family:'JetBrains Mono',monospace;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:#86efac;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(134,239,172,.1); }
.cv-project p { color:#9ab89e;font-size:.94rem; }
.cv-next { background:rgba(18,22,16,.7);border:1px solid rgba(134,239,172,.12);border-radius:8px;padding:22px 26px;margin:40px 0 0 0;text-align:center; }
.cv-next p { color:#788571;font-size:.9rem;margin:0; }
.cv-next strong { color:#86efac; }
</style>

<div class="cv-post">

So far we've been drawing everything from scratch using shapes, paths and arcs. That works fine for simple games. But Pac-Man has a detailed maze, animated ghosts and sprite-based characters. Drawing all that by hand every frame is going to get tedious fast.

This part is about working with images -- how to load them, how to draw them, how to cut pieces out of a sprite sheet, and how to reach down into the actual pixel data when you need to.

---

## drawImage -- three ways to use it

The `drawImage` function is overloaded -- it accepts different argument combinations:

```js
// 1. just draw the image at position (x, y)
ctx.drawImage(image, x, y);

// 2. draw with explicit width and height (scales the image)
ctx.drawImage(image, x, y, width, height);

// 3. the full version -- crop a section from the image and draw it
ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
```

The third version is the one that matters for sprite sheets. The `s` params are the **source** rectangle (which part of the image to take), and the `d` params are the **destination** rectangle (where and how big to draw it on the canvas).

Loading an image before drawing it:

```js
const img = new Image();
img.src = "spritesheet.png";

img.onload = () => {
  // safe to draw now
  ctx.drawImage(img, 0, 0);
};
```

Always draw inside `onload`. If you call `drawImage` before the image has loaded, nothing appears -- canvas doesn't throw an error, it just silently does nothing. This is a frustrating bug when you first hit it.

---

## Sprite sheets

A sprite sheet is a single image file that contains multiple frames or characters laid out in a grid. Instead of loading 20 separate images, you load one and cut out the piece you need each time.

Say you have a ghost sprite sheet with 4 animation frames, each frame being 32x32 pixels, laid out horizontally:

```
[ frame0 ][ frame1 ][ frame2 ][ frame3 ]
 0,0       32,0      64,0      96,0
```

To draw frame 2:

```js
const FRAME_W = 32;
const FRAME_H = 32;
const frameIndex = 2;

ctx.drawImage(
  spriteSheet,
  frameIndex * FRAME_W,
  0, // source x, y
  FRAME_W,
  FRAME_H, // source width, height
  drawX,
  drawY, // destination x, y
  FRAME_W,
  FRAME_H, // destination width, height
);
```

For animation, you cycle `frameIndex` over time:

```js
let animTimer = 0;
let frameIndex = 0;
const FRAME_COUNT = 4;
const FRAME_DURATION = 0.15; // seconds per frame

function updateAnimation(dt) {
  animTimer += dt;
  if (animTimer >= FRAME_DURATION) {
    animTimer = 0;
    frameIndex = (frameIndex + 1) % FRAME_COUNT;
  }
}
```

Simple, and it works for any sprite animation.

---

## getImageData -- reading raw pixels

This is where things get genuinely interesting. Canvas gives you access to the raw pixel data of anything drawn on it:

```js
const imageData = ctx.getImageData(x, y, width, height);
const pixels = imageData.data; // Uint8ClampedArray
```

`pixels` is a flat array where every 4 consecutive values represent one pixel: `[R, G, B, A, R, G, B, A, ...]`. To get the pixel at position `(px, py)`:

```js
function getPixel(imageData, px, py) {
  const index = (py * imageData.width + px) * 4;
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2],
    a: imageData.data[index + 3],
  };
}
```

And to set a pixel:

```js
function setPixel(imageData, px, py, r, g, b, a) {
  const index = (py * imageData.width + px) * 4;
  imageData.data[index] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
}
```

After modifying the data, you push it back to the canvas:

```js
ctx.putImageData(imageData, x, y);
```

This is how you do real image processing on canvas. Invert colors, convert to grayscale, apply blur, do color replacement -- all of it is just math on those four numbers per pixel.

<div class="cv-puzzle">
<div class="cv-puzzle-label">// puzzle 04 => pixel math</div>
<p>Load any image onto the canvas with <code>drawImage</code>, then use <code>getImageData</code> to get the pixel data. Now write code to:</p>
<ol>
<li>Invert all colors: <code>r = 255 - r</code>, same for g and b</li>
<li>Convert to grayscale: replace r, g, b all with <code>0.299*r + 0.587*g + 0.114*b</code> (those weights match human visual perception)</li>
</ol>
<p>These are the two most common pixel operations and they teach you the pattern for everything else. Try both before reading the Pac-Man section.</p>
</div>

---

## Tile maps -- the foundation of 2D game worlds

Pac-Man's maze isn't drawn as a bunch of rectangles. It's defined as a 2D grid where each cell has a value: 0 for empty, 1 for wall, 2 for dot, 3 for power pellet, etc. That grid is called a tile map.

```js
const TILE = {
  EMPTY: 0,
  WALL: 1,
  DOT: 2,
  PELLET: 3,
  GHOST_H: 4, // ghost house
};

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
  // ... and so on
];
```

To draw the tile map:

```js
const TILE_SIZE = 28;

function drawMap() {
  map.forEach((row, r) => {
    row.forEach((cell, c) => {
      const x = c * TILE_SIZE;
      const y = r * TILE_SIZE;

      if (cell === TILE.WALL) {
        ctx.fillStyle = "#1a6fa8";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (cell === TILE.DOT) {
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#e8d5a3";
        ctx.fill();
      } else if (cell === TILE.PELLET) {
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#e8d5a3";
        ctx.fill();
      }
    });
  });
}
```

For collision, instead of checking against every wall rectangle, you just look up the tile at the position you're moving to:

```js
function getTile(px, py) {
  const col = Math.floor(px / TILE_SIZE);
  const row = Math.floor(py / TILE_SIZE);
  if (row < 0 || row >= map.length || col < 0 || col >= map[0].length)
    return TILE.WALL;
  return map[row][col];
}

function isWall(px, py) {
  return getTile(px, py) === TILE.WALL;
}
```

This is much faster than any distance calculation, and it's how nearly every 2D game does it.

---

## Building full Pac-Man

<div class="cv-project">
<div class="cv-project-header">// project 04 of 05 — full pac-man</div>
<p>This is the biggest project in the series. We're not cutting corners -- proper tile map, moving Pac-Man, four ghosts with different personalities, power pellet logic, lives, score and a proper game loop. It's a lot, but every concept comes from something we've already covered.</p>
</div>

### The complete tile map

This is a 19x21 cell maze (simplified from the original but recognizable):

```js
const MAP_COLS = 19;
const MAP_ROWS = 21;
const T = (TILE_SIZE = 28);

const INITIAL_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 1, 0, 4, 4, 4, 4, 4, 0, 1, 2, 1, 1, 1, 1],
  [0, 0, 0, 0, 2, 0, 0, 4, 4, 4, 4, 4, 0, 0, 2, 0, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 0, 4, 4, 4, 4, 4, 0, 1, 2, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 3, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 3, 1],
  [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
```

We clone this at the start so we can reset without the original data being mutated:

```js
let map = INITIAL_MAP.map((row) => [...row]);
```

### Pac-Man movement

Pac-Man moves tile by tile but feels smooth because we animate between tiles:

```js
const pacman = {
  // tile position
  tileX: 9,
  tileY: 15,
  // pixel position (interpolated)
  x: 9 * T + T / 2,
  y: 15 * T + T / 2,
  dir: { x: 0, y: 0 },
  nextDir: { x: 0, y: 0 },
  speed: 150, // px/s
  mouthAngle: 0,
  mouthOpen: true,
};

function updatePacman(dt) {
  // animate mouth
  pacman.mouthAngle += dt * 5;
  const mouth = Math.abs(Math.sin(pacman.mouthAngle)) * 0.35;

  // try to turn in requested direction
  const nx = pacman.tileX + pacman.nextDir.x;
  const ny = pacman.tileY + pacman.nextDir.y;
  if (getTile(nx * T + T / 2, ny * T + T / 2) !== TILE.WALL) {
    pacman.dir = { ...pacman.nextDir };
  }

  // move in current direction
  pacman.x += pacman.dir.x * pacman.speed * dt;
  pacman.y += pacman.dir.y * pacman.speed * dt;

  // snap to grid when crossing a tile center
  const targetX = Math.round(pacman.x / T) * T;
  const targetY = Math.round(pacman.y / T) * T;
  if (Math.abs(pacman.x - targetX) < 2 && Math.abs(pacman.y - targetY) < 2) {
    pacman.tileX = Math.floor(pacman.x / T);
    pacman.tileY = Math.floor(pacman.y / T);

    // check for wall ahead
    const aheadX = (pacman.tileX + pacman.dir.x) * T + T / 2;
    const aheadY = (pacman.tileY + pacman.dir.y) * T + T / 2;
    if (getTile(aheadX, aheadY) === TILE.WALL) {
      pacman.dir = { x: 0, y: 0 };
    }

    // eat dot
    const tile = map[pacman.tileY]?.[pacman.tileX];
    if (tile === TILE.DOT) {
      map[pacman.tileY][pacman.tileX] = TILE.EMPTY;
      score += 10;
    }
    if (tile === TILE.PELLET) {
      map[pacman.tileY][pacman.tileX] = TILE.EMPTY;
      score += 50;
      frightenGhosts();
    }
  }
}
```

### Ghost AI

The real Pac-Man ghosts have distinct personalities based on their scatter/chase targets. We'll implement simplified but functional versions:

- **Blinky (red)**: always chases Pac-Man directly
- **Pinky (pink)**: targets 4 tiles ahead of Pac-Man
- **Inky (cyan)**: semi-random (good for chaos)
- **Clyde (orange)**: chases when far, scatters when close

```js
const ghosts = [
  {
    name: "blinky",
    tileX: 9,
    tileY: 9,
    x: 9 * T + T / 2,
    y: 9 * T + T / 2,
    color: "#fca5a5",
    dir: { x: 1, y: 0 },
    frightened: false,
    speed: 130,
  },
  {
    name: "pinky",
    tileX: 9,
    tileY: 10,
    x: 9 * T + T / 2,
    y: 10 * T + T / 2,
    color: "#f9a8d4",
    dir: { x: 0, y: -1 },
    frightened: false,
    speed: 130,
  },
  {
    name: "inky",
    tileX: 8,
    tileY: 10,
    x: 8 * T + T / 2,
    y: 10 * T + T / 2,
    color: "#5eead4",
    dir: { x: 0, y: 1 },
    frightened: false,
    speed: 130,
  },
  {
    name: "clyde",
    tileX: 10,
    tileY: 10,
    x: 10 * T + T / 2,
    y: 10 * T + T / 2,
    color: "#fdba74",
    dir: { x: 0, y: -1 },
    frightened: false,
    speed: 130,
  },
];

function getGhostTarget(ghost) {
  if (ghost.frightened) {
    // move semi-randomly when frightened
    return {
      x: Math.floor(Math.random() * MAP_COLS),
      y: Math.floor(Math.random() * MAP_ROWS),
    };
  }
  switch (ghost.name) {
    case "blinky":
      return { x: pacman.tileX, y: pacman.tileY };
    case "pinky":
      return {
        x: pacman.tileX + pacman.dir.x * 4,
        y: pacman.tileY + pacman.dir.y * 4,
      };
    case "inky":
      return {
        x: pacman.tileX + (Math.random() > 0.5 ? 2 : -2),
        y: pacman.tileY + (Math.random() > 0.5 ? 2 : -2),
      };
    case "clyde": {
      const dx = ghost.tileX - pacman.tileX;
      const dy = ghost.tileY - pacman.tileY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist > 8
        ? { x: pacman.tileX, y: pacman.tileY }
        : { x: 0, y: MAP_ROWS - 1 };
    }
  }
}

function updateGhost(ghost, dt) {
  // simple direction choosing at intersections
  const atCenter =
    Math.abs(ghost.x - (ghost.tileX * T + T / 2)) < 2 &&
    Math.abs(ghost.y - (ghost.tileY * T + T / 2)) < 2;

  if (atCenter) {
    const target = getGhostTarget(ghost);
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    const validDirs = dirs.filter((d) => {
      // can't reverse
      if (d.x === -ghost.dir.x && d.y === -ghost.dir.y) return false;
      const nx = ghost.tileX + d.x;
      const ny = ghost.tileY + d.y;
      return getTile(nx * T + T / 2, ny * T + T / 2) !== TILE.WALL;
    });

    if (validDirs.length > 0) {
      // pick direction closest to target
      ghost.dir = validDirs.reduce((best, d) => {
        const nx = ghost.tileX + d.x;
        const ny = ghost.tileY + d.y;
        const dist = Math.hypot(nx - target.x, ny - target.y);
        const bestDist = Math.hypot(
          ghost.tileX + best.x - target.x,
          ghost.tileY + best.y - target.y,
        );
        return dist < bestDist ? d : best;
      });
    }

    ghost.tileX += ghost.dir.x;
    ghost.tileY += ghost.dir.y;
  }

  const speed = ghost.frightened ? ghost.speed * 0.5 : ghost.speed;
  ghost.x += ghost.dir.x * speed * dt;
  ghost.y += ghost.dir.y * speed * dt;
}

let frightenTimer = 0;
function frightenGhosts() {
  ghosts.forEach((g) => (g.frightened = true));
  frightenTimer = 8; // 8 seconds of fright
}

function updateFrighten(dt) {
  if (frightenTimer > 0) {
    frightenTimer -= dt;
    if (frightenTimer <= 0) ghosts.forEach((g) => (g.frightened = false));
  }
}
```

### Ghost-Pac-Man collision

```js
function checkGhostCollisions() {
  ghosts.forEach((ghost) => {
    const dx = ghost.x - pacman.x;
    const dy = ghost.y - pacman.y;
    if (Math.hypot(dx, dy) < T * 0.8) {
      if (ghost.frightened) {
        // eat the ghost
        ghost.frightened = false;
        ghost.tileX = 9;
        ghost.tileY = 9;
        ghost.x = 9 * T + T / 2;
        ghost.y = 9 * T + T / 2;
        score += 200;
      } else {
        // Pac-Man dies
        lives--;
        if (lives <= 0) gameState = STATE.GAME_OVER;
        else resetPositions();
      }
    }
  });
}
```

### Drawing everything

```js
function drawPacman() {
  const mouth = Math.abs(Math.sin(pacman.mouthAngle)) * 0.35;
  const facingAngle = Math.atan2(pacman.dir.y, pacman.dir.x);

  ctx.save();
  ctx.translate(pacman.x, pacman.y);
  ctx.rotate(facingAngle);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, T / 2 - 3, mouth, Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fillStyle = "#fbbf24";
  ctx.fill();

  ctx.restore();
}

function drawGhost(ghost) {
  const x = ghost.x;
  const y = ghost.y;
  const r = T / 2 - 3;
  const color = ghost.frightened
    ? frightenTimer < 2 && Math.floor(Date.now() / 300) % 2
      ? "#fff"
      : "#1a3fa8"
    : ghost.color;

  ctx.beginPath();
  ctx.arc(x, y - r * 0.2, r, Math.PI, 0);
  ctx.lineTo(x + r, y + r * 1.1);
  ctx.quadraticCurveTo(x + r * 0.6, y + r * 0.7, x + r * 0.3, y + r * 1.1);
  ctx.quadraticCurveTo(x, y + r * 0.7, x - r * 0.3, y + r * 1.1);
  ctx.quadraticCurveTo(x - r * 0.6, y + r * 0.7, x - r, y + r * 1.1);
  ctx.lineTo(x - r, y - r * 0.2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  if (!ghost.frightened) {
    // eyes
    [
      [-r * 0.35, -r * 0.2],
      [r * 0.35, -r * 0.2],
    ].forEach(([ex, ey]) => {
      ctx.beginPath();
      ctx.arc(x + ex, y + ey, r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        x + ex + ghost.dir.x * 2,
        y + ey + ghost.dir.y * 2,
        r * 0.14,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "#1a3fa8";
      ctx.fill();
    });
  }
}
```

The frightened ghost flashing when `frightenTimer < 2` is a classic Pac-Man mechanic -- warning the player that the ghosts are about to return to normal.

### Win condition

```js
function checkWin() {
  const dotsLeft = map
    .flat()
    .filter((t) => t === TILE.DOT || t === TILE.PELLET).length;
  if (dotsLeft === 0) {
    gameState = STATE.WIN;
  }
}
```

That's the whole game. The full loop ties everything together:

```js
function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  if (gameState === STATE.PLAYING) {
    updatePacman(dt);
    ghosts.forEach((g) => updateGhost(g, dt));
    updateFrighten(dt);
    checkGhostCollisions();
    checkWin();
  }

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  drawMap();
  drawPacman();
  ghosts.forEach(drawGhost);
  drawHUD();

  requestAnimationFrame(loop);
}
```

<div class="cv-note">
<strong>// on performance:</strong> drawing the tile map by iterating every cell every frame is fine for a 19x21 grid. For a 500x500 grid it would be slow. The optimization is an offscreen canvas -- draw the static tiles once to a hidden canvas, then <code>drawImage</code> that whole thing to the main canvas each frame. One draw call vs thousands. We'll touch on this more in Part 5.
</div>

---

<div class="cv-checkpoint">
<div class="cv-cp-label">// checkpoint -- part 04</div>
<ul>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can load and draw images with drawImage (all three argument forms)</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand sprite sheets and how to cut frames out of them</span></li>
<li><div class="cv-cb" onclick="this.classList.contains('done')?'✓':''"></div><span>I can read and modify pixel data with getImageData / putImageData</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand tile maps and how to use them for collision</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I built a full Pac-Man with ghost AI and win/lose logic</span></li>
</ul>
</div>

---

<div class="cv-next">
<p><strong>// up next — Part 05: Fake Depth, Real Math</strong></p>
<p>The final part is the most mathematically interesting. We leave game mechanics behind and get into transformations, matrix math and the trick that makes 3D rendering possible on a 2D canvas. Then we use pixel manipulation to build an image-to-ASCII converter and a live webcam ASCII renderer. No library, no WebGL.</p>
</div>

</div>
