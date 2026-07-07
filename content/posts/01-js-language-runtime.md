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

