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

Why `safeParse` and not `parse`? `parse` throws on bad input. `safeParse` returns `{ success, data, error }` so you control the 411 response. In APIs I always use `safeParse`.

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

My take after using both: manual ifs are fine for one internal script. Zod wins the moment two routes share a shape or the frontend needs the same rules. Joi does similar work, but Zod infers TypeScript types directly, so post 10 of the original series pairs with it cleanly. One schema gives runtime checks now and compile time types later.

> Try it yourself: write a signup schema with username min 3 max 20, email format, age 1 to 120, password min 8. Test with a bad body and log `result.error.errors`.

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
console.log(r.error.errors.map((e) => e.path.join(".") + ": " + e.message));
```

Why log paths: `errors` array tells you which field failed and why. Frontend can highlight each input instead of showing one generic message.

Common mistake: sending numbers as strings from forms (`age: "25"`) and wondering why number check fails. Either coerce with `z.coerce.number()` or convert before validating. I prefer coerce at the API edge for form data.

</details>

## Auth, hashing, JWT, and where to keep tokens

Anyone can hit your API with Postman. Auth makes sure only the right author touches their drafts.

Three concepts people mix up:

**Hashing** is one way. Same input gives same output. Tiny change gives totally different output. Cannot reverse. Use for passwords.

```js
const bcrypt = require("bcrypt");

let hash = await bcrypt.hash("mypassword123", 10);
console.log(hash); // $2b$10$... never store plain text

let ok = await bcrypt.compare("mypassword123", hash);
console.log(ok); // true
```

Why cost factor 10? Higher costs resist brute force but slow logins. 10 to 12 is the usual range. I use 10 for dev speed, 12 in prod.

**Encryption** is two way. Encrypt with a key, decrypt with a key. Use when you need the original back, like stored API keys you must reuse. Not for passwords.

**JWT** is neither. It is a signed token. Header plus payload plus signature, base64 encoded and joined by dots.

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.SIGNATURE
header (base64)      payload (base64)   signature
```

Anyone can decode the payload. Only the server with the secret can verify the signature is real. That is the whole trick. Do not put secrets inside the payload.

**Where to store JWT on the browser:** `localStorage` is easy and survives reloads, but any JS on the page can read it, including injected scripts. `httpOnly` cookies cannot be read by JS and are safer against XSS, but need CSRF handling. My take: side project with no sensitive data, `localStorage` is fine to learn. Anything with payments or private drafts, use `httpOnly` cookies from day one.

Auth flow for the blog:

```
Signup:
  client sends { username, password }
  server hashes password, saves author, returns token

Login:
  client sends { username, password }
  server finds author, bcrypt.compare, returns token if match

Protected:
  client sends Authorization: Bearer <token>
  server verifies signature, sets req.authorId, handler runs
```

Implementation with `jsonwebtoken`. Fragment to read, Full env setup below:

```bash
npm install jsonwebtoken bcrypt
npm install dotenv
```

```bash
# .env.example, copy to .env and fill real secret
# Full file vs Fragment: copy this block as .env.example in project root
JWT_SECRET=dev-only-change-in-prod
PORT=3000
```

```js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-in-prod";

function signAuthor(author) {
  return jwt.sign(
    { authorId: author.id, username: author.username },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(403).json({ error: "No token sent" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.authorId = decoded.authorId;
    next();
  } catch (e) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
```

Why `Bearer` prefix? Convention from OAuth. It lets one header carry different schemes later. Always split on space and take index 1. Forgetting the split and verifying `"Bearer xyz"` directly fails every time.

Why `expiresIn`? Tokens leak through logs and screenshots. Short life limits damage. 7 days is comfortable for learning. Prod apps often use 15 min access plus refresh tokens.

Full flow with hashed passwords, no plain text anywhere. Fragment to read here, Full runnable version with `app.listen` lives in Project 2 below, copy that to run:

```js
require("dotenv").config(); // add at top with npm install dotenv
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-in-prod";
let authors = [];
let nextId = 1;

const signupSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8),
});

app.post("/signup", async (req, res, next) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(411).json({ errors: parsed.error.errors });
    }
    const { username, password } = parsed.data;
    if (authors.find((a) => a.username === username)) {
      return res.status(409).json({ error: "Username taken" });
    }
    const hash = await bcrypt.hash(password, 10);
    const author = { id: nextId++, username, password: hash };
    authors.push(author);
    const token = signAuthor(author);
    res.status(201).json({ token });
  } catch (e) {
    next(e);
  }
});

app.post("/signin", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const author = authors.find((a) => a.username === username);
    if (!author) return res.status(403).json({ error: "Invalid login" });
    const ok = await bcrypt.compare(password, author.password);
    if (!ok) return res.status(403).json({ error: "Invalid login" });
    res.json({ token: signAuthor(author) });
  } catch (e) {
    next(e);
  }
});

app.get("/me", authMiddleware, (req, res) => {
  const author = authors.find((a) => a.id === req.authorId);
  res.json({ id: author.id, username: author.username });
});

// Defined below but used above, function declarations hoist so this works.
// Keep helper at bottom to keep routes readable up top.
function signAuthor(author) {
  return jwt.sign(
    { authorId: author.id, username: author.username },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}
```

Why same "Invalid login" for missing user and wrong password? Specific messages tell attackers which usernames exist. Generic message leaks nothing.

> Try it yourself: protect `POST /posts` with `authMiddleware` and set the post author from `req.authorId` instead of trusting the body.

<details>
<summary>Solution</summary>

```js
let posts = [];

app.post("/posts", authMiddleware, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(411).json({ error: "title and content required" });
  }
  const post = {
    id: posts.length + 1,
    title,
    content,
    authorId: req.authorId,
    published: false,
  };
  posts.push(post);
  res.status(201).json(post);
});
```

