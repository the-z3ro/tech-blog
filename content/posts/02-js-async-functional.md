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

<details>
<summary>Solution</summary>

```js
console.log("A");
setTimeout(() => console.log("C"), 0);
console.log("B");
// A, B, C
```

Even with `0` delay, `C` prints last. Why: `setTimeout` always goes through the queue. It never runs inline, even if the wait is zero.

Common mistake: adding longer timeouts to "fix" ordering, like waiting 2 seconds hoping data arrives. That is flaky. The right fix is promises or await, covered below.

</details>

## Event loop, the one mental model worth memorizing

JS is single threaded. One call stack. One thing at a time. So how does it handle 50 blog readers at once?

It delegates. The browser or Node does the slow work, JS moves on, and a queue holds finished callbacks until the stack is free.

```
Call Stack        Browser or OS         Callback Queue
main()      ->    setTimeout timer
                  file read
                  fetch posts
                  When done: push callback to queue
                  Event loop: if stack empty, move queue to stack
```

**Key rule:** a callback only runs when the call stack is completely empty.

Play with http://latentflip.com/loupe once. Watch the stack, queue, and loop animate. I watched it three times before it stuck. Seeing `setTimeout` sit in Web APIs while the stack clears made more sense than any paragraph.

One detail tutorials skip: there are actually two queues. Microtasks (promise callbacks) run before macrotasks (setTimeout, I/O). That means this prints in a surprising order:

```js
setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promise"));
console.log("sync");
// sync, promise, timeout
```

Why: `Promise.then` goes to the microtask queue, which the loop drains first. You do not need to memorize this for daily work, but when your logs look out of order, this is usually why.

## Callback hell, and why we left it

Nested callbacks work for one level. They collapse after three.

```js
setTimeout(function () {
  console.log("After 1 second");
  setTimeout(function () {
    console.log("After 2 more seconds");
    setTimeout(function () {
      console.log("After 3 more seconds");
    }, 3000);
  }, 2000);
}, 1000);
```

Real version of this: fetch author, then fetch their posts, then fetch comments for each post, each inside the last callback. Indentation grows right, error handling repeats at every level, and you cannot return a value to the top.

I wrote auth + posts + comments exactly like this once. Adding one retry broke all three levels. That pain is why promises exist.

## Promises, async code you can chain

A **Promise** is an object that represents a future value. It starts as pending, then becomes fulfilled or rejected.

```js
function wait(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(`Done waiting ${ms}ms`);
    }, ms);
  });
}

wait(1000)
  .then(function (result) {
    console.log(result);
    return wait(2000);
  })
  .then(function () {
    console.log("Two more seconds passed");
  })
  .catch(function (error) {
    console.log("Something went wrong:", error);
  });
```

No nesting. Each `.then` returns a new promise, so the chain stays flat. One `.catch` at the end handles errors from any step.

For blog data, the same shape looks like this:

```js
function fetchPosts() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "Hello world", views: 120 },
        { id: 2, title: "Async JS", views: 310 },
      ]);
    }, 800);
  });
}

fetchPosts()
  .then((posts) => posts.filter((p) => p.views > 100))
  .then((popular) => console.log(popular))
  .catch((e) => console.log("Fetch failed:", e));
```

Why return inside `.then`? Whatever you return becomes the input of the next `.then`. Forget the `return` and the next step gets `undefined`. I debugged that exact bug for an hour.

> Try it yourself: chain two `wait` calls so the total wait is 3 seconds, then log "done". Add a `.catch` that logs errors.

<details>
<summary>Solution</summary>

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
}

wait(1000)
  .then((ms) => {
    console.log(`waited ${ms}`);
    return wait(2000);
  })
  .then((ms) => console.log(`waited ${ms}, done`))
  .catch((e) => console.log("Error:", e));
```

Why: each `return wait(...)` pauses the chain until that promise settles. The value passes forward.

Common mistake: nesting instead of chaining, like calling `wait` inside `.then` without returning it. That runs but the outer chain does not wait for it. Always `return` the inner promise.

</details>

## Async await, same promises with cleaner syntax

`async await` is not a new system. It is cleaner syntax over promises. I write almost all new code this way.

```js
async function main() {
  try {
    const result = await wait(1000);
    console.log(result);
    await wait(2000);
    console.log("Two more seconds passed");
  } catch (error) {
    console.log("Error:", error);
  }
}

