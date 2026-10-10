---
title: "09 : Middleware and Zod - Reusable Checks and Safe Input"
date: 2026-08-03T11:30:00+05:30
draft: false
tags: ["express", "middleware", "zod", "validation"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 900
description: "Middleware chains, error handlers that never crash the server, and Zod validation that returns clear 400 errors for the blog API."
aliases: ["/posts/04-middleware-zod-auth/", "/posts/06-middleware-zod/", "/posts/middleware-zod/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

I spent a lot of time changing permissions and ownership on Windows files, even inside `System32`, and I learned one rule: access is a chain of checks, and the first "no" stops everything. Middleware is the same idea for requests. Before a request reaches your function it passes through checks in order, and any of them can reject it.

This post adds two kinds of checks to your API: **middleware** (logging, errors, anything that runs for many routes) and **validation with Zod** (never trust what the client sends). Authentication, the third kind, comes next.

> **Where we are:** An API that works but trusts every input. After this post it validates and logs.
>
> **Phase 01** · Backend · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** middleware, error handling, Zod validation.  
> **Not today:** Authentication, which comes right after.
>
> **Time:** about 15 minutes to read, 45 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, write the three arguments of a middleware function and what calling `next()` does.

<details>
<summary>Prereqs to run this file</summary>

- The API from [the Express post](../07-node-http-and-express/) running on `3000`. Folder: `blog-platform`.
- Install: `npm install zod`.
- Use [the debugging post](../08-debugging-like-a-developer/) whenever something breaks. That is what it is for.

</details>

## Part 1 of 3: Middleware, reusable checks between request and handler

Every route needs the same things: logging, auth, input checks. Copying them into each handler gets messy fast.

```js
// Repeated logic, hard to keep in sync
app.get("/posts", (req, res) => {
  // auth check here
  // validation here
  // real logic here
});

app.post("/posts", (req, res) => {
  // same auth check copied
  // same validation copied
  // real logic here
});
```

A **middleware** is a function that runs between the request arriving and your handler running. It sees `req`, `res`, and `next`. Call `next()` to pass control onward. Send a response to stop there.

Hospital version I finally remembered: patient enters, insurance check, blood test, BP check, then doctor. Request version: request arrives, logger, auth check, validation, then handler.

```js
function logger(req, res, next) {
  console.log(`${req.method} ${req.path} at ${new Date().toISOString()}`);
  next();
}

function requireAuthor(req, res, next) {
  const author = req.headers["x-author"];
  if (!author) {
    return res.status(401).json({ error: "Missing x-author header" });
  }
  req.author = author;
  next();
}

function validatePostId(req, res, next) {
  const id = Number(req.query.postId);
  if (Number.isNaN(id) || id < 1) {
    return res.status(400).json({ error: "postId must be 1 or above" });
  }
  next();
}

// Per route, order matters left to right
app.get("/posts", logger, requireAuthor, validatePostId, (req, res) => {
  res.json({ message: `Hello ${req.author}, fetching posts` });
});

// For all routes
app.use(logger);
```

Why attach to `req` like `req.author`? Downstream handlers need to know who passed auth without rechecking headers. That one line removes duplicate lookups later.

Request lifecycle with logs, so you can see order:

```
GET /posts?postId=2
  logger prints GET /posts
  requireAuthor checks header, sets req.author
  validatePostId checks query
  handler runs and sends JSON
```

If any middleware sends a response and forgets `return`, code after it still runs and you get "headers already sent". I always `return res.json(...)` inside middleware to exit immediately.

> Try it yourself: add a middleware that counts total requests and returns 429 when count passes 100 in one minute. Keep it in memory for now.

<details>
<summary>Solution</summary>

```js
let count = 0;
let windowStart = Date.now();

function rateGuard(req, res, next) {
  const now = Date.now();
  if (now - windowStart > 60 * 1000) {
    count = 0;
    windowStart = now;
  }
  count++;
  if (count > 100) {
    return res.status(429).json({ error: "Too many requests, slow down" });
  }
  next();
}

app.use(rateGuard);
```

Why reset by time window: a global counter that never resets blocks everyone forever after 100 hits. Real rate limiters use per IP plus sliding windows. This version teaches the shape.

Common mistake: placing `app.use(rateGuard)` after routes. Middleware only runs for routes defined below it. Global guards go near the top, right after `express.json()`.

</details>

> Checkpoint: you should see your logger print a line for every request, and the route still respond normally.

## Part 2 of 3: Errors without crashing the server

Sync throw inside a route crashes the process unless you catch it. Express has a special error handler with four params. Four, not three. That signature is how Express knows it is an error handler.

```js
// Must have 4 params to be treated as error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

app.get("/risky", (req, res, next) => {
  try {
    let data = JSON.parse(req.query.data);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
```

Why `next(err)` instead of `res.status(500)` inline? One central place formats all server errors, logs stacks, and hides internals from clients. Ten routes share it without copying.

In async handlers, rejected promises do not reach that handler automatically in Express 4. Wrap or catch and forward:

```js
app.get("/posts/:id", async (req, res, next) => {
  try {
    let post = await fakeDbFind(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  } catch (e) {
    next(e);
  }
});
```

> Checkpoint: you should see a route that throws return a JSON error with status 500 while the server keeps running.

## Part 3 of 3: Zod, validation that scales past three ifs

Manual checks work for one field. They collapse at five.

```js
// Manual, does not scale
if (!req.body.title || typeof req.body.title !== "string") {
  return res.status(400).json({ error: "Invalid title" });
}
if (!req.body.content || req.body.content.length < 20) {
  return res.status(400).json({ error: "Content too short" });
}
// What about 20 fields plus email format plus enums?
```

**Zod** lets you define a schema once and parse with it everywhere.

```bash
npm install zod
```

```js
const { z } = require("zod");

const createPostSchema = z.object({
  title: z.string().min(5).max(120),
  content: z.string().min(20),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

app.post("/posts", (req, res) => {
  const result = createPostSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }
  // result.data is typed and trimmed to schema
  const { title, content, tags } = result.data;
  res.status(201).json({ title, content, tags: tags || [] });
});
```

Why `safeParse` and not `parse`? `parse` throws on bad input. `safeParse` returns `{ success, data, error }` so you control the 400 response. In APIs I always use `safeParse`.

Cheat sheet I keep open:

```js
z.string();
z.string().email();
z.string().url();
z.string().min(5).max(100);
z.number().min(0).max(150);
z.boolean();
z.array(z.string());
z.enum(["draft", "published"]);
z.string().optional();
z.object({ title: z.string() });
```

My take after using both: manual ifs are fine for one internal script. Zod wins the moment two routes share a shape or the frontend needs the same rules. Joi does similar work, but Zod infers TypeScript types directly, so [the TypeScript foundations post](../20-typescript-foundations/) pairs with it cleanly. One schema gives runtime checks now and compile time types later.

> Try it yourself: write a signup schema with username min 3 max 20, email format, age 1 to 120, password min 8. Test with a bad body and log `result.error.issues`.

<details>
<summary>Solution</summary>

```js
const { z } = require("zod");

const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  age: z.number().min(1).max(120),
  password: z.string().min(8),
});

let bad = { username: "ab", email: "not-an-email", age: 500, password: "123" };
let r = signupSchema.safeParse(bad);
console.log(r.success); // false
console.log(r.error.issues.map((e) => e.path.join(".") + ": " + e.message));
```

Why log paths: `errors` array tells you which field failed and why. Frontend can highlight each input instead of showing one generic message.

Common mistake: sending numbers as strings from forms (`age: "25"`) and wondering why number check fails. Either coerce with `z.coerce.number()` or convert before validating. I prefer coerce at the API edge for form data.

</details>

> Checkpoint: you should see valid input pass, and invalid input return 400 with a list of what was wrong.

## Patterns I keep repeating

**Validate with Zod at the edge, trust inside.** Routes parse once, then pass `result.data` down. Helpers do not revalidate. That keeps validation in one layer instead of sprinkled everywhere.

**Log without leaking.** Log method, path, and author id. Never log passwords, tokens, or full headers. I redact `authorization` in logger output by default now after pasting a token into a shared log once.

## Solo rep: A rate limiter middleware

> **Level 2: Peek once.** Read the code once, hide it, and type it from memory. Peek again only when stuck. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

Write a middleware factory `rateLimit(max)` that allows at most `max` requests per minute per IP, using an in-memory object. Over the limit, respond 429. Peek at the middleware section once, then hide it.

<details>
<summary>Check yourself, only after you try</summary>

```js
function rateLimit(max) {
  const hits = {};
  setInterval(() => {
    for (const ip in hits) delete hits[ip];
  }, 60000);
  return (req, res, next) => {
    const ip = req.ip;
    hits[ip] = (hits[ip] || 0) + 1;
    if (hits[ip] > max) {
      return res.status(429).json({ error: "Too many requests" });
    }
    next();
  };
}

app.use(rateLimit(30));
```

</details>

## Projects

### 1. Request logger plus counter

Build the observability trio: logger, counter, error handler. This is the base for every later backend post.

Requirements:

- `app.use` logger with method, path, timestamp
- In memory counter per path, expose `GET /stats`
- Central 4 param error handler returning 500 JSON
- One route `/boom` that throws to prove the handler works

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```js
const express = require("express");
const app = express();

let counts = {};

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} at ${new Date().toISOString()}`);
  counts[req.path] = (counts[req.path] || 0) + 1;
  next();
});

app.get("/stats", (req, res) => res.json({ counts }));

app.get("/boom", (req, res, next) => {
  try {
    throw new Error("kaboom");
  } catch (e) {
    next(e);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(3000);
```

Why counts object and not single number: per path shows which endpoint gets hammered. Real monitoring groups by route the same way.

Common mistake: defining `/stats` below the error handler. Error handlers do not pass onward, so routes after them never run. Keep error handler last.

</details>

### 2. A reusable validate(schema) middleware

Right now every route repeats the same `safeParse` block. Write a middleware factory `validate(schema)` that parses `req.body`, replaces it with the clean data, and returns 400 with the Zod issues when it fails. Then use it on `POST /posts`.

Requirements:

- `validate(schema)` returns a middleware function
- On failure: status 400 and `{ errors: [...] }` built from `issues`
- On success: `req.body` becomes the parsed data and `next()` runs
- The route handler contains no validation code at all

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```js
const { z } = require("zod");

const postSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
});

function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.issues });
    }
    req.body = parsed.data;
    next();
  };
}

app.post("/posts", validate(postSchema), (req, res) => {
  const post = { id: posts.length + 1, ...req.body };
  posts.push(post);
  res.status(201).json(post);
});
```

Why a factory: `validate(postSchema)` runs once at startup and returns the real middleware, so one function serves every route with its own schema.

Common mistake: forgetting `return` before `res.status(400)`. The response goes out, then `next()` still runs and you get `headers already sent`.

</details>

## If lost / If bored

- If lost: `headers already sent` means a middleware sent a response and also called `next()`, add `return`. A Zod error list that looks empty usually means you read `error.errors`, use `error.issues`.
- If bored: jump to Project 2, the `validate(schema)` factory is the most reusable thing in this post.
- Keep for next: the logger, the error handler and your Zod schemas. [The auth post](../10-auth-with-bcrypt-and-jwt/) adds hashing and tokens on top.

## What breaks next

The API checks its input, but anyone can call it. How do you know who is calling?

[Where we are and what is next](../progress/)
