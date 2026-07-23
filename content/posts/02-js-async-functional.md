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

main();
```

Three rules that cover 95 percent of usage:

1. `async` makes a function return a promise
2. `await` pauses only that function until the promise settles, other code keeps running
3. Wrap awaits in `try catch` for errors

Blog version with fetch. Reading example with fake URL, runnable localhost version lives in Projects below with `http://localhost:3000/posts`:

```js
async function showPopularPosts() {
  try {
    const res = await fetch("https://api.example.com/posts");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let popular = data.posts.filter((p) => p.views > 100);
    console.log(popular);
  } catch (e) {
    console.log("Could not load posts:", e.message);
  }
}
```

Why two awaits? `fetch` resolves when headers arrive. `res.json()` resolves when the body is fully read and parsed. Skipping the second await gives you a pending promise instead of data. I console logged a promise object three times before learning this.

A confusion I had: does `await` block the whole app? No. It pauses only the current `async` function. Other requests, timers, and clicks keep working. Think of it as that function stepping aside while the kitchen timer runs.

> Try it yourself: rewrite the promise chain from the last exercise using async await with try catch.

<details>
<summary>Solution</summary>

```js
function wait(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
}

async function run() {
  try {
    let a = await wait(1000);
    console.log(`waited ${a}`);
    let b = await wait(2000);
    console.log(`waited ${b}, done`);
  } catch (e) {
    console.log("Error:", e);
  }
}

run();
```

Why: same waits, flat code. No `.then` nesting.

Common mistake: calling `await` outside an `async` function. That is a syntax error in most setups. Either wrap in `async function` or use top level await only where your runtime allows it (modern Node and browser modules do, plain script files often do not).

</details>

## Fetching together with Promise.all

Sequential awaits are easy to read but slow when calls do not depend on each other. Fetching a post and its author can happen at the same time.

```js
async function loadPostPage(id) {
  try {
    let [post, comments] = await Promise.all([
      fetch(`https://api.example.com/posts/${id}`).then((r) => r.json()),
      fetch(`https://api.example.com/posts/${id}/comments`).then((r) =>
        r.json(),
      ),
    ]);
    console.log(post.title, comments.length);
  } catch (e) {
    console.log("One of the calls failed:", e.message);
  }
}
```

Why `Promise.all`? It runs both fetches in parallel and waits for both. Two 400ms calls take about 400ms together instead of 800ms in sequence.

Catch: if one promise rejects, `Promise.all` rejects immediately. If you need all results even when some fail, use `Promise.allSettled`. I use `all` for page critical data and `allSettled` for optional widgets like related posts.

## Map, filter, and reduce, the trio that replaces most loops

You can write everything with `for`. But after fetching posts, you will transform and filter them constantly. These three cover that.

```js
let posts = [
  { title: "Hello world", views: 120, tags: ["intro"] },
  { title: "Async JS", views: 310, tags: ["js"] },
  { title: "Draft", views: 5, tags: ["js"] },
];

// map transforms each element, returns same length array
let titles = posts.map((p) => p.title);
// ["Hello world", "Async JS", "Draft"]

// filter keeps matches, returns shorter or equal array
let popular = posts.filter((p) => p.views > 100);
// first two posts only

// reduce folds everything into one value, needs an initial value
let totalViews = posts.reduce((sum, p) => sum + p.views, 0);
// 435

// Chain them, this is the daily pattern
let popularTitles = posts
  .filter((p) => p.views > 100)
  .map((p) => p.title.toUpperCase());
// ["HELLO WORLD", "ASYNC JS"]
```

Why the `0` at the end of reduce? That is the starting sum. Without it, reduce uses the first element as the start, which breaks on empty arrays and mixes types. I always pass it explicitly.

Two more you will see in real code:

```js
let firstPopular = posts.find((p) => p.views > 100); // first match or undefined
let hasDraft = posts.some((p) => p.views < 10); // true if any match
let allPublished = posts.every((p) => p.views >= 0); // true if all match
```

Why not just use `filter[0]` instead of `find`? `find` stops at the first match. `filter` scans everything. On a list of 10k posts that difference shows.

> Try it yourself: from the posts array above, get total views of posts tagged `js` using filter plus reduce in one chain.

<details>
<summary>Solution</summary>

```js
let posts = [
  { title: "Hello world", views: 120, tags: ["intro"] },
  { title: "Async JS", views: 310, tags: ["js"] },
  { title: "Draft", views: 5, tags: ["js"] },
];

let jsViews = posts
  .filter((p) => p.tags.includes("js"))
  .reduce((sum, p) => sum + p.views, 0);

console.log(jsViews); // 315
```

Why: filter first narrows to js posts, reduce then sums. Order matters for speed. Filter before map or reduce so you process fewer items.

Common mistake: forgetting `return` in braces version: `.map((p) => { p.title })` returns array of undefined. Either drop braces or add return.

</details>

## Patterns I use on real async code

**Always handle the error path first.** Every `fetch` can fail. Every `json()` can throw on bad data. I write `try catch` before I write the happy path now. Production APIs return 500s, tokens expire, users go offline mid request.

**Do not mix callbacks and promises in one function.** Pick one style per function. Mixed code is where ordering bugs hide. If an old library gives callbacks, wrap it once in a promise helper and use await everywhere else.

```js
// One wrapper at the edge, clean awaits inside
function readFileAsync(path) {
  const fs = require("fs");
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

async function loadDraft() {
  let text = await readFileAsync("draft.txt");
  console.log(text.length);
}
```

**Keep async functions small and named by outcome.** `loadPostPage`, `fetchComments`, `publishPost`. Not `handleData` or `doStuff`. When a stack trace shows the name, you want to know what failed without opening the file.

**Never trust network data shape.** `data.posts` might be missing, null, or a single object instead of an array after a backend change. I guard with defaults before mapping.

```js
let list = Array.isArray(data.posts) ? data.posts : [];
let titles = list.map((p) => p.title ?? "Untitled");
```

The `??` only falls back on null or undefined, not on `0` or empty string. That matters for view counts where zero is valid.

**Arrow functions and `this` still bite in callbacks.** Inside a plain `setTimeout(function () { ... })`, `this` is not your object. Arrow keeps outer `this`. In React function components this rarely matters, but in Node classes and old Express handlers it does. When in doubt I use arrows for inline callbacks.

## Projects

All three run with plain Node. No paid APIs. Each one forces async plus array methods together.

### 1. Delayed blog reader

Build `fetchPosts()` that simulates network with `setTimeout`, then display popular titles with reading time.

Requirements:

- `fetchPosts` returns a promise that resolves after 800ms with 4 posts
- Each post has `title`, `words`, `views`
- Use async await to load, filter views over 100, map to strings like `"TITLE - 3 min"`
- Handle errors with try catch

<details>
<summary>Solution with explanation</summary>

```js
function fetchPosts() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { title: "Hello world", words: 450, views: 120 },
        { title: "Async JS", words: 1200, views: 310 },
        { title: "Draft notes", words: 100, views: 5 },
        { title: "React basics", words: 800, views: 200 },
      ]);
    }, 800);
  });
}

function readingTime(words) {
  return Math.ceil(words / 200);
}

async function showPopular() {
  try {
    let posts = await fetchPosts();
    let lines = posts
      .filter((p) => p.views > 100)
      .map((p) => `${p.title.toUpperCase()} - ${readingTime(p.words)} min`);
    console.log(lines);
  } catch (e) {
    console.log("Load failed:", e.message);
  }
}

showPopular();
```

Why it is shaped this way: fetch is isolated so you can swap the fake timer for real `fetch` later without touching display logic. Filter before map keeps the transform small. Async await keeps error handling in one place.

Common mistake: forgetting `await` and trying to `.filter` a promise. `fetchPosts().filter` throws because promises have no filter method. Always await first, then treat the result as an array.

</details>

### 2. Parallel author dashboard

Load a post and its comments in parallel, then combine. This teaches `Promise.all` plus reduce for stats.

Requirements:

- `fetchPost(id)` resolves after 500ms with `{ id, title, views }`
- `fetchComments(id)` resolves after 700ms with array of `{ text, likes }`
- Load both with `Promise.all`, print title, comment count, total likes via reduce
- Add a 2 second timeout race: if loading takes longer, show "Slow network" (hint: `Promise.race`)

<details>
<summary>Solution with explanation</summary>

```js
function fetchPost(id) {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ id, title: "Async JS", views: 310 }), 500),
  );
}

function fetchComments(id) {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { text: "Great post", likes: 12 },
          { text: "Confusing part on queues", likes: 3 },
          { text: "Saved", likes: 8 },
        ]),
      700,
    ),
  );
}

function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Slow network")), ms),
  );
}

async function showDashboard(id) {
  try {
    let [post, comments] = await Promise.race([
      Promise.all([fetchPost(id), fetchComments(id)]),
      timeout(2000),
    ]);
    let totalLikes = comments.reduce((sum, c) => sum + c.likes, 0);
    console.log(
      `${post.title}: ${comments.length} comments, ${totalLikes} likes`,
    );
  } catch (e) {
    console.log("Dashboard failed:", e.message);
  }
}

showDashboard(2);
```

Why `Promise.race` with timeout: real apps cannot hang forever. Racing the load against a timer gives you control. `Promise.all` inside the race still runs both fetches in parallel.

Common mistake: awaiting fetches one by one (`await fetchPost` then `await fetchComments`) which takes 1200ms instead of 700ms. If neither needs the other result, run them together.

</details>

### 3. Mini promise from scratch

Implement a tiny `MyPromise` style helper plus a retry wrapper. This cements how `.then` chaining and errors actually flow.

Requirements:

- Write `wait(ms, shouldFail)` that resolves after ms or rejects if shouldFail is true
- Write `withRetry(fn, times)` that calls an async fn and retries on failure up to times
- Test with a flaky fetch that fails twice then succeeds
- Use only promises and async await, no external libs

<details>
<summary>Solution with explanation</summary>

```js
function wait(ms, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error(`Failed after ${ms}ms`));
      else resolve(`ok in ${ms}ms`);
    }, ms);
  });
}

async function withRetry(fn, times) {
  let lastError;
  for (let i = 0; i <= times; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      console.log(`Attempt ${i + 1} failed, retrying...`);
    }
  }
  throw lastError;
}

let attempts = 0;
async function flakyFetch() {
  attempts++;
  let shouldFail = attempts < 3;
  return wait(300, shouldFail);
}

withRetry(flakyFetch, 5)
  .then((r) => console.log("Success:", r))
  .catch((e) => console.log("All retries failed:", e.message));
```

Why the loop works: `await` inside `for` pauses each attempt. Return on success exits early. Throw after loop preserves the last real error instead of a generic one.

Common mistake: using `.forEach` with async callbacks for retries. `forEach` does not wait. Use `for` or `for of` when order and waiting matter.

</details>

Next is Node, HTTP, and Express. We take these async habits and build a real blog API with them. GET posts, POST new drafts, proper status codes, tested with Postman. The `fetchPosts` fakes above become real endpoints you can call from a frontend.

## If lost / If bored

- If lost: promise object logged instead of data means missing second `await` on `res.json()`. Order `A,B,C` with zero timeout is correct, timers always queue.
- If bored: skip to Project 2 parallel dashboard, it shows why `Promise.all` matters for speed.
- Keep for next: `wait`, `withRetry`, filter plus map chains. Post 03 handlers reuse the same shapes.
