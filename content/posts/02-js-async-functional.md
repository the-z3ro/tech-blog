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

```js
function doMath(a, b, operation) {
  return operation(a, b);
}

function add(x, y) {
  return x + y;
}

console.log(doMath(3, 4, add)); // 7
console.log(doMath(3, 4, (x, y) => x - y)); // -1
console.log(doMath(3, 4, (x, y) => x ** y)); // 81
```

Why pass a function instead of just calling it? Because `doMath` does not need to know the exact math. It only needs to know when to run it. That "call this when you are done" idea is the base of all async JS.

In blog code I use this for formatting. One function loads posts, another decides how to display each one.

```js
function renderPosts(posts, format) {
  for (let p of posts) {
    console.log(format(p));
  }
}

let posts = [
  { title: "Hello world", views: 120 },
  { title: "Async JS", views: 310 },
];

renderPosts(posts, (p) => `${p.title} (${p.views} views)`);
```

If you are wondering why we do not just put the format logic inside `renderPosts`, it is reuse. Same loop, different output for admin view vs public view.

> Try it yourself: write `filterPosts(posts, test)` where `test` is a callback that returns true or false. Use it to keep only posts with more than 100 views.

<details>
<summary>Solution</summary>

```js
function filterPosts(posts, test) {
  let out = [];
  for (let p of posts) {
    if (test(p)) out.push(p);
  }
  return out;
}

let posts = [
  { title: "a", views: 20 },
  { title: "b", views: 200 },
];

console.log(filterPosts(posts, (p) => p.views > 100));
// [{ title: b, views: 200 }]
```

Why it works: `test` runs once per post. The loop only collects matches.

Common mistake: forgetting `return` inside the arrow callback. `(p) => { p.views > 100 }` returns undefined because of the braces. Use `(p) => p.views > 100` without braces, or add explicit `return`.

</details>

## Sync blocking vs async delegation

Sync code stops everything until it finishes. That is fine for math. It is terrible for files and network.

```js
console.log("1: Start");

setTimeout(function () {
  console.log("3: Callback fires after 1 second");
}, 1000);

console.log("2: This runs immediately");

// Output order:
// 1: Start
// 2: This runs immediately
// 3: Callback fires after 1 second
```

When I first saw this I thought the output order was a bug. It is not. `setTimeout` hands the timer to the browser, JS keeps running the next line, and the callback runs later.

Same with files in Node. Starter seed, create this file first to run the snippet:

```bash
# Full file seed, save as data.txt in blog-platform
# Hello blog file demo
# Second line for testing reads
```

```js
const fs = require("fs");

fs.readFile("data.txt", "utf8", function (error, content) {
  if (error) {
    console.log("Error reading file:", error);
    return;
  }
  console.log("File contents:", content);
});

console.log("This runs before file is read!");
```

Why does Node use callbacks here instead of just returning the content? Because reading from disk takes time. If it blocked, your whole server would freeze for every blog post read. With callbacks, the server handles other requests while waiting.

> Try it yourself: predict the order of these three logs before running. Then run and check.

