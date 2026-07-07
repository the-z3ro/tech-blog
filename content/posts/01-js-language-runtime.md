---
title: "01 : JS Language and Runtime - How JavaScript Actually Works"
date: 2026-07-12T10:00:00+05:30
draft: false
tags: ["javascript", "fundamentals", "runtime"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 1
description: "Why languages exist, compiled vs interpreted, why JS won the web, and the core building blocks: primitives, functions, loops. The base for everything in this series."
cover:
  image: ""
  alt: ""
  caption: ""
---

I kept skipping this part when I started. I wanted to jump straight to building APIs and React apps. But every weird bug I hit later traced back to something basic I never sat with. Like why `[] + {}` behaves the way it does. Or why my loop variable leaked everywhere. So I went back and rebuilt my base. This is that rebuild.

We will use a small blog platform as our running example through the whole series. Posts, authors, views, comments. Nothing fancy, just real enough that the code feels like something you would actually write.

<details>
<summary>Prereqs to run this file</summary>

- Terminal basics: create files, `pwd` and `ls` to confirm folder. That fixes most `cannot find module` errors.
- Node LTS 20 or above recommended. Check with `node -v`. If missing, install from nodejs.org, restart terminal, check again. Full Node setup returns in post 03.
- Folder: `blog-platform`. Run `node hello.js` from inside that folder.
- Browser console works as fallback for quick checks like `typeof` and string ops.
- Full file vs Fragment: `js` blocks labeled Full file run with `node file.js`. Short snippets are Fragments to paste into a file or console.

</details>

## Why programming languages exist at all

Your CPU only understands binary. Zeros and ones. On and off signals moving through circuits.

Nobody wants to write that. So we write in something closer to how we think, and something else converts it to machine code.

```
You write: console.log("hello")
      |
      v
Conversion step (compile or interpret)
      |
      v
CPU runs: 01010101 from RAM
```

The full flow looks like this in practice:

1. You write high level code in a file like `post.js`
2. Some runtime converts it to machine code
3. CPU picks that machine code from RAM and runs it
4. Your SSD holds the file at rest, RAM holds it while it runs

Why does RAM matter here? Because the CPU cannot run code straight from your SSD. It is too slow. The OS loads the program into RAM first, then the CPU works from there. When people say "my app uses a lot of memory", they mostly mean RAM usage while running.

Try this yourself: create a file called `hello.js` with one line in it and run it with Node. We will set up Node properly in post 03, but if you already have it installed, this works right now.

```bash
node hello.js
```

If you do not have Node yet, you can paste the same line in your browser console (right click, Inspect, Console tab) and it runs the same way for now.

> Try it yourself: write a file that logs your name and the current year. Run it. Then change the message and run it again. Notice there is no separate build step. That missing step is the whole difference we talk about next.

<details>
<summary>Solution</summary>

```js
// hello.js
console.log("Eshan - 2026");
console.log("My first post is live");
```

