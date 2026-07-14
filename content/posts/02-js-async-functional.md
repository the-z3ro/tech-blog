---
title: "02 : Async JS and Array Methods - Callbacks to Async Await"
date: 2026-07-19T10:30:00+05:30
draft: false
tags: ["javascript", "async", "promises", "arrays"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 2
description: "Callbacks, event loop, callback hell, promises, async await, and map filter reduce. The async mental model behind every API call in the blog platform."
cover:
  image: ""
  alt: ""
  caption: ""
---

I understood loops and functions, then I hit `fetch` and everything broke. My posts rendered empty. My console logs printed in the wrong order. I added a `setTimeout` to "fix" it and made it worse.

The problem was I treated async code like sync code. This post is the fix. We will stay on the same blog platform from post 01. Posts, views, authors. But now we load them over time instead of having them instantly.

<details>
<summary>Prereqs to run this file</summary>

- Node LTS 20 or above, folder `blog-platform`. Check with `node -v`.
- No backend needed. Fake timers with `setTimeout` simulate network so every snippet runs locally.
- Starter seeds: create `data.txt` with two lines of text for the `fs.readFile` demo, and `draft.txt` with one draft paragraph for the wrapper demo.
- Full file vs Fragment: blocks with `fetchPosts()` plus `showPopular()` are Full files. `api.example.com` URLs are reading examples only, runnable localhost versions live in Projects below.
- If `Promise.race` feels new, skip to Project 2 seed first, then return to the Try exercise.

</details>

## Callbacks, functions passed to run later

A **callback** is a function you pass as an argument to another function, so it can be called later.

