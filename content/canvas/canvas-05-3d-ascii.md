---
title: "Canvas 05 : Fake Depth, Real Math"
date: 2026-04-20T00:00:00+05:30
draft: false
tags: ["canvas", "javascript", "web", "math", "3d", "creative"]
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 5
hiddenInHomeList: false
description: "Final part of the HTML Canvas series. We cover ctx transforms, build a fake 3D rotating cube using projection math, then create an image-to-ASCII and live webcam-to-ASCII renderer."
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
.cv-finish {
  background: linear-gradient(135deg, rgba(134,239,172,0.05), rgba(94,234,212,0.05));
  border: 1px solid rgba(134,239,172,0.25);
  border-radius: 10px;
  padding: 28px 32px;
  margin: 48px 0 0 0;
  text-align: center;
}
.cv-finish h3 { color: #86efac; font-family: 'Space Grotesk', sans-serif; margin: 0 0 12px 0; }
.cv-finish p { color: #788571; font-size: 0.92rem; margin: 0 0 8px 0; }
.cv-finish strong { color: #c8d1c1; }
</style>

<div class="cv-post">

We've built four games. We know the loop, the physics, pixel data, tile maps. This final part doesn't build a game -- it goes sideways into something more visually interesting. We're going to fake 3D on a 2D canvas using just math, and then we're going to turn live webcam video into ASCII art in real time.

Both of these will make people ask "wait, how did you do that?" when they see them. Good.

---

## Transforms -- translate, rotate, scale

You've seen `ctx.save()` and `ctx.restore()` already. The transform functions they protect are:

```js
ctx.translate(x, y); // move the origin point
ctx.rotate(angle); // rotate around origin (radians)
ctx.scale(sx, sy); // scale on x and y axes
```

The key thing to understand is these transform the **coordinate system**, not the objects. When you call `ctx.translate(100, 100)`, you're saying "from now on, treat (100, 100) as if it were (0, 0)". Then when you draw at (0, 0), it appears at (100, 100) on the actual canvas.

This is confusing at first but it makes certain things much cleaner. Drawing a rotated object around its own center:

```js
ctx.save();
ctx.translate(objectX, objectY); // move origin to object center
ctx.rotate(angle); // rotate around that center
ctx.fillRect(-width / 2, -height / 2, width, height); // draw centered at origin
ctx.restore();
```

Without translate you'd have to calculate the rotated corners manually every time. With translate you just rotate and draw at 0,0.

### The transform stack

`save()` pushes the current state onto a stack. `restore()` pops it. You can nest them:

```js
ctx.save(); // A
ctx.translate(100, 100);
ctx.save(); // B
ctx.rotate(0.5);
ctx.fillRect(-20, -20, 40, 40);
ctx.restore(); // back to A state (translation still active)
ctx.fillRect(0, 0, 10, 10); // drawn at (100, 100) but not rotated
ctx.restore(); // back to no transforms
```

This is how you build hierarchical transforms -- like a robot arm where rotating the shoulder also rotates the forearm. Each segment saves, transforms relative to its parent, draws, restores.

---

## The 3D trick -- projection

Here's the thing about 3D rendering: it's not magic. It's math on points.

A 3D point has three coordinates `(x, y, z)`. To draw it on a 2D screen you project it -- you calculate where it would appear if you were looking at it through a camera.

The simplest projection is perspective projection. Objects farther away appear smaller. The formula is:

```
screenX = x * focalLength / (z + focalLength) + centerX
screenY = y * focalLength / (z + focalLength) + centerY
```

`focalLength` controls how strong the perspective effect is. Higher = more telephoto (flatter). Lower = more fisheye (more distorted).

In code:

```js
function project(x, y, z, focalLength, cx, cy) {
  const scale = focalLength / (z + focalLength);
  return {
    x: x * scale + cx,
    y: y * scale + cy,
    scale, // useful for size scaling and depth sorting
  };
}
```

That's actually the core of 3D rendering. Everything else -- rotation matrices, lighting, textures -- is built on top of this basic projection.

---

## Rotation matrices

To rotate a 3D object you apply rotation matrices. For a cube spinning around the Y axis:

```js
function rotateY(x, y, z, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x * cos - z * sin,
    y: y,
    z: x * sin + z * cos,
  };
}

function rotateX(x, y, z, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x,
    y: y * cos - z * sin,
    z: y * sin + z * cos,
  };
}
```

You feed a 3D point in, you get a rotated 3D point back. Then you project it to 2D and draw it.

---

<div class="cv-puzzle">
<div class="cv-puzzle-label">// puzzle 05 => think before reading</div>
<p>A cube has 8 corners. Write down their 3D coordinates if the cube is centered at the origin and has a side length of 2. (Hint: each coordinate is either -1 or +1.)</p>
<p>Then think: to draw the edges of the cube, which pairs of corners need to be connected? A cube has 12 edges. How do you know which 8 corners are connected by those 12 edges?</p>
<p>Spend a minute on this before reading. Drawing the wireframe cube is just drawing lines between the right pairs of projected points. If you have the corner list and the edge list, the code is five lines.</p>
</div>

---

## Building the 3D rotating cube

<div class="cv-project">
<div class="cv-project-header">// project 05a — wireframe 3D cube (no library, no WebGL)</div>
</div>

```js
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const W = (canvas.width = 500);
const H = (canvas.height = 500);

// 8 corners of a unit cube centered at origin
const vertices = [
  [-1, -1, -1], // 0: left  bottom back
  [1, -1, -1], // 1: right bottom back
  [1, 1, -1], // 2: right top    back
  [-1, 1, -1], // 3: left  top    back
  [-1, -1, 1], // 4: left  bottom front
  [1, -1, 1], // 5: right bottom front
  [1, 1, 1], // 6: right top    front
  [-1, 1, 1], // 7: left  top    front
];

// pairs of vertex indices forming edges
const edges = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0], // back face
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4], // front face
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7], // connecting edges
];

const FOCAL = 400;
const SCALE = 100; // cube size
let angleX = 0.4;
let angleY = 0;

function project(x, y, z) {
  const scale = FOCAL / (z + FOCAL);
  return { x: x * scale + W / 2, y: y * scale + H / 2, z };
}

function rotateX(v, a) {
  return [
    v[0],
    v[1] * Math.cos(a) - v[2] * Math.sin(a),
    v[1] * Math.sin(a) + v[2] * Math.cos(a),
  ];
}
function rotateY(v, a) {
  return [
    v[0] * Math.cos(a) + v[2] * Math.sin(a),
    v[1],
    -v[0] * Math.sin(a) + v[2] * Math.cos(a),
  ];
}

function loop(ts) {
  angleY += 0.01;

  ctx.fillStyle = "#0d110c";
  ctx.fillRect(0, 0, W, H);

  // transform all vertices
  const projected = vertices.map((v) => {
    let p = rotateX(v, angleX);
    p = rotateY(p, angleY);
    p = [p[0] * SCALE, p[1] * SCALE, p[2] * SCALE];
    return project(p[0], p[1], p[2]);
  });

  // draw edges
  ctx.strokeStyle = "#86efac";
  ctx.lineWidth = 1.5;

  edges.forEach(([a, b]) => {
    const pa = projected[a];
    const pb = projected[b];

    // fade edges based on depth (z) for a subtle depth cue
    const avgZ = (pa.z + pb.z) / 2;
    const alpha = 0.3 + (0.7 * (avgZ + SCALE)) / (SCALE * 2);
    ctx.strokeStyle = `rgba(134, 239, 172, ${alpha})`;

    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  });

  // draw vertices as dots
  projected.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#5eead4";
    ctx.fill();
  });

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
```

Run that. You'll see a wireframe cube rotating in 3D. On a completely flat 2D canvas. No WebGL, no library. Just 8 points, a rotation matrix, and a projection formula.

### Making it solid -- depth sorting

The wireframe looks cool but to fill the faces you need to draw them back-to-front (painter's algorithm -- same as the painter's model we talked about in Part 1). Sort faces by their average Z depth and draw the farthest first:

```js
const faces = [
  [0, 1, 2, 3], // back
  [4, 5, 6, 7], // front
  [0, 3, 7, 4], // left
  [1, 2, 6, 5], // right
  [3, 2, 6, 7], // top
  [0, 1, 5, 4], // bottom
];

const faceColors = [
  "#1a3a2a",
  "#2a5a3a",
  "#1a4a3a",
  "#2a4a2a",
  "#3a6a4a",
  "#1a2a1a",
];

function drawSolidCube(projected) {
  const sortedFaces = faces
    .map((f, i) => ({
      indices: f,
      color: faceColors[i],
      depth: f.reduce((sum, vi) => sum + projected[vi].z, 0) / f.length,
    }))
    .sort((a, b) => a.depth - b.depth); // back to front

  sortedFaces.forEach(({ indices, color }) => {
    ctx.beginPath();
    ctx.moveTo(projected[indices[0]].x, projected[indices[0]].y);
    for (let i = 1; i < indices.length; i++) {
      ctx.lineTo(projected[indices[i]].x, projected[indices[i]].y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#86efac";
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}
```

Add mouse drag to control the rotation and you have a proper interactive 3D object. This is the actual foundation of how software renderers work. Games like Quake were doing this math (much more of it) in real time on CPUs with no GPU help.

---

## Image to ASCII

Now we use everything from Part 4 -- pixel data -- to do something creative.

The idea: load an image, sample its pixels, measure the brightness of each sample, then replace it with an ASCII character where dense characters (like `@`, `#`, `M`) represent dark areas and light characters (like `.`, ` `) represent bright areas.

```js
const ASCII_CHARS = "@#S%?*+;:,.    "; // dark to light
const SAMPLE_SIZE = 8; // pixels per character

function brightnessToChar(brightness) {
  const index = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
  return ASCII_CHARS[index];
}

function imageToAscii(img) {
  // draw image to canvas
  const offscreen = document.createElement("canvas");
  const cols = Math.floor(img.width / SAMPLE_SIZE);
  const rows = Math.floor(img.height / SAMPLE_SIZE);
  offscreen.width = img.width;
  offscreen.height = img.height;
  const offCtx = offscreen.getContext("2d");
  offCtx.drawImage(img, 0, 0);

  const imageData = offCtx.getImageData(0, 0, img.width, img.height);
  const pixels = imageData.data;

  const result = [];

  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < cols; col++) {
      const px = col * SAMPLE_SIZE;
      const py = row * SAMPLE_SIZE;
      const i = (py * img.width + px) * 4;

      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // perceived brightness (same weights as grayscale conversion)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      line += brightnessToChar(brightness);
    }
    result.push(line);
  }

  return result;
}
```

Now draw the ASCII art to canvas:

```js
function drawAscii(lines, canvas, ctx) {
  const charW = 6;
  const charH = 10;
  canvas.width = lines[0].length * charW;
  canvas.height = lines.length * charH;

  ctx.fillStyle = "#0d110c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "9px JetBrains Mono";
  ctx.fillStyle = "#86efac";
  ctx.textBaseline = "top";

  lines.forEach((line, row) => {
    ctx.fillText(line, 0, row * charH);
  });
}
```

Result: any image becomes a grid of characters that looks exactly like the original at a distance but is made entirely of text. This is the classic ASCII art effect.

For a **colored version**, instead of using one fillStyle, you sample the actual RGB and set the color per character:

```js
// inside the loop, after getting r, g, b:
ctx.fillStyle = `rgb(${r},${g},${b})`;
ctx.fillText(char, col * charW, row * charH);
```

Colored ASCII art looks genuinely impressive.

---

## Live webcam to ASCII

This is basically the same thing but with a `<video>` element as the source instead of an image. The browser can draw a video frame to canvas directly with `drawImage`.

```html
<video id="webcam" autoplay playsinline style="display:none"></video>
<canvas id="c"></canvas>
```

```js
const video = document.getElementById("webcam");
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

async function startWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    requestAnimationFrame(renderLoop);
  } catch (err) {
    console.error("no webcam access:", err);
  }
}

// offscreen canvas for pixel sampling
const sample = document.createElement("canvas");
const sampleCtx = sample.getContext("2d");
const COLS = 80;
const ROWS = 45;

function renderLoop() {
  if (video.readyState >= video.HAVE_ENOUGH_DATA) {
    // draw current frame to tiny offscreen canvas for sampling
    sample.width = COLS;
    sample.height = ROWS;
    sampleCtx.drawImage(video, 0, 0, COLS, ROWS);

    const data = sampleCtx.getImageData(0, 0, COLS, ROWS).data;

    // size the output canvas
    const charW = 8;
    const charH = 14;
    canvas.width = COLS * charW;
    canvas.height = ROWS * charH;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "12px JetBrains Mono";
    ctx.textBaseline = "top";

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const i = (row * COLS + col) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        const char =
          ASCII_CHARS[
            Math.floor((brightness / 255) * (ASCII_CHARS.length - 1))
          ];

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillText(char, col * charW, row * charH);
      }
    }
  }

  requestAnimationFrame(renderLoop);
}

startWebcam();
```

The sampling trick (draw to a 80x45 offscreen canvas first) means you only read 3600 pixels per frame instead of the full camera resolution which could be 1920x1080. Sampling at the target resolution rather than downsampling in JS makes it fast enough for real-time.

<div class="cv-note">
<strong>// on CORS and images:</strong> if you try to call <code>getImageData</code> on a canvas that has a cross-origin image drawn on it, you'll get a security error ("tainted canvas"). To avoid this, either use images from your own domain, or set <code>img.crossOrigin = 'anonymous'</code> and serve the image with the right CORS headers. The webcam version doesn't have this issue because video input isn't a cross-origin resource.
</div>

---

## Where canvas ends and WebGL begins

Honestly, canvas can do a lot more than most people think. But it does have limits worth knowing:

**Canvas is great for:**

- 2D games (everything we built)
- Data visualization
- Image processing
- Generative art
- Anything under ~100k draw calls per frame

**Canvas starts to struggle with:**

- Complex 3D scenes (more faces, lighting, shadows -- the math gets expensive)
- Particle systems with millions of particles
- Heavy real-time image filters
- Anything that benefits from GPU parallelism

That's where **WebGL** comes in. WebGL runs code directly on the GPU, which is massively parallel. The 3D cube we built updates 8 points per frame on the CPU. A real 3D scene might have millions of polygons -- you need GPU for that.

But here's what I want you to take away: WebGL's fundamental ideas are exactly what we covered. Vertices, transformations, projection, the painter's algorithm -- all the same. The difference is that WebGL's API is lower-level and the code runs on the GPU instead of the CPU.

If you ever want to go down that path, everything in Part 5 is directly applicable.

---

<div class="cv-checkpoint">
<div class="cv-cp-label">// checkpoint -- part 05 and the whole series</div>
<ul>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand ctx.translate, rotate, scale and the transform stack</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand perspective projection (3D point to 2D screen)</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can apply rotation matrices to 3D points</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I built a fake-3D rotating cube with depth sorting</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand pixel brightness sampling and ASCII mapping</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I built an image-to-ASCII converter</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I built the live webcam ASCII renderer</span></li>
<li><div class="cv-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I know where canvas ends and when to reach for WebGL</span></li>
</ul>
</div>

---

## What you've actually built

Let's be real about what happened here. You started with a blank rectangle. Five parts later you've built:

- A static game frame using raw shape drawing
- Snake -- grid game, full animation loop, input, collision
- Flappy Bird -- continuous physics, procedural generation, game feel tuning
- Pac-Man -- tile maps, sprite animation, ghost AI with personalities
- A 3D rotating cube using only math and a 2D API
- An ASCII art renderer that works on images and live video

None of it needed a game engine. No Phaser, no Three.js, no p5.js. Just the canvas API and JavaScript.

That's not to say libraries are bad -- they're not. But now you understand what they're abstracting. When you pick up Phaser for a bigger project, you'll know what's happening under the hood, and that makes a real difference when things break or when you want to do something the library doesn't support.

---

<div class="cv-finish">
<h3>// series complete</h3>
<p>If you worked through all five parts properly -- actually coding, doing the puzzles, trying the extension ideas -- you now have a genuinely solid grip on the HTML Canvas API.</p>
<p>Some good next directions: <strong>OffscreenCanvas + Web Workers</strong> for heavy rendering off the main thread. <strong>WebGL fundamentals</strong> (the site webglfundamentals.org is excellent). <strong>Generative art</strong> -- use everything you've learned but with no rules, just make things that look interesting. That last one is underrated.</p>
<p>There's no better way to solidify this than building something you actually want to make. Go do that.</p>
</div>

</div>
