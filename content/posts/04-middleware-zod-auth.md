---
title: "04 : Middleware, Zod and Auth - Protecting the Blog API"
date: 2026-08-03T11:30:00+05:30
draft: false
tags: ["express", "middleware", "zod", "auth", "jwt"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 4
description: "Middleware chains, Zod validation, bcrypt hashing, JWT Bearer auth, and a full signup signin flow for blog authors."
cover:
  image: ""
  alt: ""
  caption: ""
---

My blog API worked, then I added auth by copying checks into every route. Same five lines in six places. Then I changed the header name and had to edit all six. I missed one. Drafts leaked.

Middleware plus validation plus proper auth fixed that. This post wires all three into the API from post 03.

<details>
<summary>Prereqs to run this file</summary>

- Post 03 API running on `3000`. Folder: `blog-platform`.
- Installs: `npm install zod jsonwebtoken bcrypt`, plus `npm install dotenv` for env loading. Native build trouble on Windows usually means missing build tools, retry with `npm install --verbose` to see the failing step.
- Env: create `.env` with `JWT_SECRET=dev-only-change-in-prod` and `PORT=3000`. See `.env.example` block in the auth section below.
- Full file vs Fragment: auth flow block with `app.listen` at the end of Projects is the Full file. Middleware snippets at the top are Fragments to insert above routes.

</details>

## Middleware, reusable checks between request and handler

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
    return res.status(411).json({ error: "postId must be 1 or above" });
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

## Errors without crashing the server

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

## Zod, validation that scales past three ifs

Manual checks work for one field. They collapse at five.

```js
// Manual, does not scale
if (!req.body.title || typeof req.body.title !== "string") {
  return res.status(411).json({ error: "Invalid title" });
}
if (!req.body.content || req.body.content.length < 20) {
  return res.status(411).json({ error: "Content too short" });
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
    return res.status(411).json({ errors: result.error.errors });
  }
  // result.data is typed and trimmed to schema
  const { title, content, tags } = result.data;
  res.status(201).json({ title, content, tags: tags || [] });
});
```

