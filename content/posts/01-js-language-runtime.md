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

Run with `node hello.js`. You should see both lines.

What this shows: Node reads the file and runs it top to bottom. No compile command needed.

Common mistake: trying `node hello` without the `.js` extension, or running it from the wrong folder. If you get "cannot find module", check `pwd` and `ls` first. You need to be in the same folder as the file.

</details>

## Compiled vs interpreted, and where JS actually sits

This confused me for a long time because tutorials put JS in one box and move on.

**Compiled** languages need a separate build step before you can run anything. You write C++, then you compile it to a binary, then you run that binary.

```bash
# C++ flow
# Step 1: write main.cpp
# Step 2: compile it
g++ main.cpp -o main
# Step 3: run the binary
./main
```

If there is a type error or syntax error, the compiler stops at step 2. No binary gets created.

**Interpreted** languages skip that manual step. You just run the file.

```bash
# JS flow
node index.js
```

Old explanation stops here and says JS is slower but flexible. That was true in 1998. It is not the full story now.

Modern JS engines like V8 (the engine inside Chrome and Node) use **just-in-time compilation**. They watch your code while it runs, find the hot parts that run a lot, and compile those parts to fast machine code on the fly. So JS feels interpreted when you use it, but under the hood it compiles at runtime.

That is why Node can be fast enough for real backends even though you never run a build command during development.

Why should you care? Because this explains two things you will see later:

1. The first run of a loop can be slower than later runs. V8 is still learning and optimizing.
2. Syntax errors still stop everything, but type related bugs slip through. JS will happily run `let x = 5; x = "hello"` because nothing checks types before running. That flexibility is the reason TypeScript exists, which we cover in post 10 of the original series.

> Try it yourself: run a file with a syntax error (like a missing bracket) and then run a file with `let views = 100; views = "lot of views"; console.log(views)`. See which one stops and which one runs fine.

<details>
<summary>Solution</summary>

```js
// broken.js - syntax error, nothing runs
console.log("hello";

// flexible.js - runs fine, prints the string
let views = 100;
views = "lot of views";
console.log(views);
```

`node broken.js` throws immediately. `node flexible.js` prints `lot of views`.

Why this happens: syntax is checked before running. Types are not. JS lets the type change at runtime. That is called dynamic typing, covered below.

Common mistake: thinking the second file should error. It will not. If you want that error, you need TypeScript with `let views: number = 100`.

</details>

## Why JavaScript and not something else

In 1995 Brendan Eich built a small scripting language for Netscape in about 10 days. The goal was simple: make web pages interactive. Buttons, forms, small animations.

That language became JavaScript. And browsers agreed on one thing: they would all run JS natively. No plugin needed.

That single decision is why JS won. Python is great, Java is solid, but your browser does not run them without extra work. JS runs everywhere a web page runs.

Then in 2009 Ryan Dahl did something clever. He took the V8 engine out of Chrome, added file system and network APIs with C++, and called it Node.js. Suddenly the same language could run on servers too.

```
Chrome V8 (compiles JS to machine code)
  + file access, http, crypto, os
  = Node.js runtime
```

So now you get:

- One language for frontend and backend
- A huge package ecosystem with npm
- An async model that fits I/O heavy work like APIs and blogs really well

A newer runtime called Bun does the same job. It is written in Zig and is faster for many tasks. I still use Node in this series because almost every job and tutorial uses Node, and the concepts transfer directly.

Why not just learn Python for backend and JS for frontend? You can. Many teams do. I picked JS for both because sharing types, validation logic, and even small helper functions between frontend and backend saves a lot of pain once your blog platform grows.

## How to run JS while following this series

You have three places, and you will use all three:

1. **Browser console** for quick checks. Good for `typeof`, string ops, small loops.
2. **Node files** for everything backend related. `node file.js` from your project folder.
3. **Vite + React** from post 06 onward for UI code.

If `node -v` prints a version, you are ready. If not, install LTS from nodejs.org, restart your terminal, and check again. I wasted an hour once because my terminal still pointed to an old install. A restart fixed it.

## Primitives, and the blog data they model

JS has a small set of basic types. Everything else is built from them.

```js
// Number, both integers and decimals are just number
let views = 250;
let readingTime = 4.5;

// String, single, double, or backticks all work
let author = "eshan";
let title = "My first post";
let greeting = `Hello, ${author}!`; // backticks let you embed variables

// Boolean
let isPublished = true;
let hasPaid = false;

// Null is explicit empty, undefined is declared but no value yet
let coverImage = null; // we know there is no image
let lastEdited; // undefined, nobody set it yet
console.log(lastEdited); // undefined
```

A question that bugged me early: what is the difference between `null` and `undefined`? In real code I use `null` when I mean "intentionally empty", like no cover image. `undefined` usually means "I forgot to set this" or "this field does not exist yet". APIs often return `undefined` when you access a missing field.

Reference types are built from primitives:

```js
// Array
let tags = ["javascript", "backend", "react"];
console.log(tags[0]); // javascript
tags.push("nodejs"); // adds to end
console.log(tags.length); // 4

// Object, this is your bread and butter for blog data
let post = {
  title: "Hello world",
  author: "eshan",
  views: 250,
  isPublished: false,
};

console.log(post.title); // Hello world
console.log(post["views"]); // 250, bracket notation, same thing
post.views = 251; // update a field
```

Why two ways to access fields? Dot notation is shorter. Bracket notation lets you use a variable as the key, which you need when the key name comes from user input or a loop.

```js
let field = "title";
console.log(post[field]); // Hello world, works
// console.log(post.field) would look for a key literally called field
```

> Try it yourself: make a `post` object with title, views, and tags. Log the second tag. Add a new tag. Change views to 0 and log the whole object.

<details>
<summary>Solution</summary>

```js
let post = {
  title: "Learning JS",
  views: 10,
  tags: ["js", "basics"],
};

console.log(post.tags[1]); // basics
post.tags.push("blog");
post.views = 0;
console.log(post);
```

Why it works: arrays are zero indexed, so index 1 is the second item. `push` mutates the same array.

Common mistake: `post.tags[2]` after only two items gives `undefined`, not an error. JS does not throw for out of bounds access. Always check `length` if you are unsure.

</details>

## let, const, var, and what to actually use

You will see all three in old code. In new code I only use `let` and `const`.

```js
let views = 10;
views = 11; // fine, let allows reassignment

const author = "eshan";
// author = "someone"; // TypeError, const forbids reassignment

var oldWay = "avoid this";
```

Why avoid `var`? It has function scope instead of block scope and it hoists in a confusing way. I inherited a file full of `var` once and spent half a day tracing why a loop counter leaked outside the loop. `let` and `const` stay inside the `{}` block where you define them.

One catch that trips everyone: `const` does not make objects immutable. It only stops reassignment.

```js
const post = { views: 10 };
post.views = 11; // allowed, same object, different field
post.tags = []; // allowed

// post = {}; // not allowed, that is reassignment
```

If you want to stop field changes too, you need `Object.freeze`, but that is rare in app code. In React we handle this with spread copies instead of mutation, which we cover in post 07.

Rule I follow: default to `const`. Switch to `let` only when you know the variable will be reassigned, like a counter or accumulator.

## Equality, and why === saves you at 2am

JS has two equality operators and they are not the same.

```js
console.log(5 == "5"); // true, JS converts types then compares
console.log(5 === "5"); // false, no conversion, type must match
console.log(null == undefined); // true, weird legacy rule
console.log(null === undefined); // false
```

`==` does type coercion before comparing. That sounds helpful until your blog view count `"0"` equals `false` and your draft filter breaks in production.

I just use `===` and `!==` everywhere. No exceptions. It is one less thing to think about during code review.

> Try it yourself: predict `0 == false`, `0 === false`, `"" == false`, `"" === false` before running them.

<details>
<summary>Solution</summary>

```js
console.log(0 == false); // true
console.log(0 === false); // false
console.log("" == false); // true
console.log("" === false); // false
```

Why: `==` converts both sides to a common type. Empty string and zero both coerce to false. `===` checks type first and stops early.

Common mistake: using `== null` to check for both null and undefined on purpose. Some codebases do this as a shortcut. I prefer explicit `x === null || x === undefined` because it is obvious to the next person reading.

</details>

## Functions, the unit of reuse

A function takes input, does something, returns output. You already know this, but the three syntaxes confused me at first.

```js
// Declaration, hoisted, you can call it before the line where it is defined
function readingTime(words) {
  return Math.ceil(words / 200);
}

// Expression, stored in a variable, not hoisted the same way
const slugify = function (title) {
  return title.toLowerCase().replaceAll(" ", "-");
};

// Arrow, shorter, current default in React code
const isLongPost = (words) => words > 1000;

// Calling them
console.log(readingTime(450)); // 3
console.log(slugify("Hello World")); // hello-world
console.log(isLongPost(450)); // false
```

Why do we bother wrapping code in functions? I learned this when I copied the same reading time math into three files and then fixed a bug in only two of them. That third file stayed wrong for weeks.

```js
// Repeated logic, hard to fix later
console.log(Math.ceil(300 / 200));
console.log(Math.ceil(800 / 200));
console.log(Math.ceil(1200 / 200));

// One function, fix once
function readingTime(words) {
  return Math.ceil(words / 200);
}
console.log(readingTime(300));
console.log(readingTime(800));
console.log(readingTime(1200));
```

That is the **DRY principle**. Do not repeat yourself. If you type the same logic twice, make it a function.

About arrow functions: they are shorter, but they also handle `this` differently. They do not get their own `this`. For the blog helpers above it does not matter. It starts to matter inside objects and React class components. Since we use function components and hooks in this series, you can default to arrows for small helpers and normal functions for top level components without much friction.

> Try it yourself: write `formatViews(n)` that returns `"1.2k"` for 1200 and `"950"` for 950. Hint: if n is 1000 or more, divide by 1000 and add k.

<details>
<summary>Solution</summary>

```js
function formatViews(n) {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  return `${n}`;
}

console.log(formatViews(1200)); // 1.2k
console.log(formatViews(950)); // 950
```

Why it works: template literals let us mix numbers and strings cleanly. `toFixed(1)` keeps one decimal.

Common mistake: returning a number in one branch and a string in another. Here both branches return strings because of the backticks. That keeps the return type consistent, which matters a lot once we add TypeScript later.

</details>

## Loops without fear

You need three patterns. Everything else is a variation.

```js
// 1. Classic for, best when you need the index or a count
let totalViews = 0;
let daily = [120, 80, 200];
for (let i = 0; i < daily.length; i++) {
  totalViews += daily[i];
}
console.log(totalViews); // 400

// 2. While, best when you do not know how many times upfront
let drafts = 3;
while (drafts > 0) {
  console.log(`Publishing draft, ${drafts} left`);
  drafts--;
}

// 3. forEach and for...of, best for reading arrays cleanly
let posts = ["intro", "async", "react"];
posts.forEach((p) => console.log(p));

for (let p of posts) {
  console.log(`Post: ${p}`);
}
```

Why `let i` and not `var i` in the loop? With `var`, the `i` variable survives after the loop and can clash with another loop later in the same function. With `let`, it stays inside the loop. I hit this bug with nested loops fetching paginated posts. The inner loop overwrote the outer counter.

Later in post 02 we replace many manual loops with `map` and `filter`. Manual loops are still the right tool when you need to break early, sum things up, or retry something.

> Try it yourself: given `[120, 0, 310, 45]`, sum only the days with more than 50 views using a for loop.

<details>
<summary>Solution</summary>

```js
let daily = [120, 0, 310, 45];
let total = 0;
for (let i = 0; i < daily.length; i++) {
  if (daily[i] > 50) {
    total += daily[i];
  }
}
console.log(total); // 430
```

Why: the `if` filters inside the loop. `120 + 310` is 430. The other two days are skipped.

Common mistake: starting at `i = 1` and skipping the first day, or using `<= daily.length` and reading one past the end (gives `undefined`, and `total + undefined` becomes `NaN`).

</details>

## Static vs dynamic typing, in one sitting

JS is **dynamically typed**. Types are decided while the code runs, and they can change.

```js
let status = 200; // number for now
status = "ok"; // now a string, JS allows it
```

A **statically typed** language checks types before running. TypeScript adds that layer on top of JS.

```ts
let status: number = 200;
status = "ok"; // compile error, stops before running
```

Why does this matter for a blog platform? Because view counts, form inputs, and API responses are all strings at the boundary and numbers inside. Without checks, `"5" + 1` becomes `"51"` instead of `6`, and your pagination breaks. TypeScript catches that before deploy. We go deep on this in the TypeScript post, but keep this example in mind until then.

## Single threaded, and why async exists

JS has one call stack. It does one thing at a time.

Think of it like cooking alone in a small kitchen. You can only chop one thing at a time. But you can put water on to boil, then chop vegetables while you wait. You are not doing two things at once. You delegated the boiling to the stove and switched back when it needed you.

JS does the same:

- Long work like file reads and network calls gets delegated to the browser or OS
- JS keeps running other code
- When the delegated work finishes, its callback gets queued and runs when the stack is free

```
JS runs code -> hits fetch -> hands it to browser -> keeps running
Browser finishes -> puts callback in queue -> JS picks it up when free
```

Why only one thread? It keeps the mental model simple. No locks, no races on the same variable in basic code. The cost is that a slow loop blocks everything. If you run a huge `for` loop on the main thread, your page freezes until it finishes. That is why we never block, and why post 02 exists.

## Patterns I wish someone told me earlier

These are not syntax rules. They are habits that separate code that works once from code that survives real edits.

**Name things from your domain, not from the tutorial.** `calculateSum(a, b)` teaches nothing. `readingTime(words)` tells the next person what it is for. When I renamed my helpers to `formatViews`, `slugify`, `isPublished`, my own code got easier to find a month later.

**Small pure functions beat clever one liners.** A function that takes input and returns output without touching outside state is easy to test and easy to reuse. If your function reads a global `posts` array and also updates the DOM, split it. One part computes, one part renders.

**Check types at the boundary.** Form inputs, URL params, API bodies. Everything from outside is a string until proven otherwise. Convert with `Number()` explicitly and check `Number.isNaN`. Do not trust `==` to fix it for you.

**Default to const, use early returns.** Deep nesting hides bugs. I now write guards at the top and keep the happy path flat.

```js
function publishPost(post) {
  if (!post.title) return { ok: false, error: "Missing title" };
  if (post.words < 50) return { ok: false, error: "Too short" };
  return { ok: true, value: post };
}
```

**Do not mutate inputs you did not create.** `post.views++` inside a helper changes the caller's object. Return a new value instead. React will force this habit later with state, but starting now saves surprises.

```js
// Harder to trace
function bumpViews(post) {
  post.views += 1;
}

// Easier to trace
function bumpedViews(post) {
  return { ...post, views: post.views + 1 };
}
```

## Projects

These are built to use only what this post taught. No async, no backend yet. Each one is something you can keep in your repo.

### 1. Blog stats helper

Build a small script that takes an array of posts and prints a summary. This forces you to use objects, arrays, functions, and loops together.

What to build:

- Each post has `title`, `words`, `views`, `tags`
- Print reading time for each post (200 words per minute, rounded up)
- Print total views across all posts
- Print the most viewed post title

<details>
<summary>Solution with explanation</summary>

```js
let posts = [
  { title: "Hello world", words: 450, views: 120, tags: ["intro"] },
  { title: "Async JS", words: 1200, views: 310, tags: ["js", "async"] },
  { title: "React basics", words: 800, views: 45, tags: ["react"] },
];

function readingTime(words) {
  return Math.ceil(words / 200);
}

let totalViews = 0;
let topPost = posts[0];

for (let post of posts) {
  console.log(`${post.title}: ${readingTime(post.words)} min`);
  totalViews += post.views;
  if (post.views > topPost.views) {
    topPost = post;
  }
}

console.log(`Total views: ${totalViews}`);
console.log(`Top post: ${topPost.title}`);
```

Why it is structured this way: `readingTime` is pure and reusable. The loop does one pass for all three answers instead of three separate loops. `topPost` starts as the first post so the comparison always has something valid.

Common mistake: setting `topPost = {}` and then reading `topPost.views` which is `undefined`. Comparisons with `undefined` give wrong results. Always seed with a real element when finding a max.

</details>

### 2. Slug and validator

Build `slugify(title)` and `validatePost(post)`. This is real production logic. Every blog needs URL slugs and input checks before saving.

Requirements:

- `slugify` lowercases, trims, replaces spaces with `-`, removes anything that is not a letter, number, or `-`
- `validatePost` returns `{ ok: true }` or `{ ok: false, error: "reason" }`
- A valid post needs a title of 5 or more chars, at least 50 words, and at least one tag

<details>
<summary>Solution with explanation</summary>

```js
function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9-]/g, "");
}

function validatePost(post) {
  if (!post.title || post.title.length < 5) {
    return { ok: false, error: "Title too short" };
  }
  if (!post.words || post.words < 50) {
    return { ok: false, error: "Post too short, need 50+ words" };
  }
  if (!post.tags || post.tags.length === 0) {
    return { ok: false, error: "Add at least one tag" };
  }
  return { ok: true };
}

console.log(slugify("  Hello World! My First Post  ")); // hello-world-my-first-post
console.log(validatePost({ title: "Hi", words: 10, tags: [] }));
// { ok: false, error: Title too short }
console.log(validatePost({ title: "Learning JS", words: 600, tags: ["js"] }));
// { ok: true }
```

