---
title: "10 : Auth with bcrypt and JWT - Signup, Signin and Protected Routes"
date: 2026-08-03T11:30:00+05:30
draft: false
tags: ["auth", "jwt", "bcrypt", "express"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 1000
description: "Hash passwords with bcrypt, issue JWTs, protect routes, and use 401 versus 403 correctly. Signup and signin for blog authors."
aliases: ["/posts/07-auth-jwt-bcrypt/", "/posts/auth-jwt-bcrypt/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

I learned early that a login screen is only a door, and a door means nothing if someone can walk around it, for example by starting the computer from a different drive. Web security has the same rule: **never trust anything the client controls**, because an attacker controls the client. Your server is the only place a secret is safe.

That rule explains every decision in this post: why we hash passwords (so a leaked database is not a leaked password), why tokens are signed (so they cannot be forged), and why 401 and 403 are different answers.

> **Where we are:** An API with middleware and validation. After this post users can sign up and sign in.
>
> **Phase 01** · Backend · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** bcrypt hashing, JWT, protected routes, 401 versus 403.  
> **Not today:** Cookies, sessions and OAuth. Those arrive in the Next.js stretch.
>
> **Time:** about 20 minutes to read, 60 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, write a Zod schema for a signup body with a username of 3 to 20 characters and a password of at least 8.

<details>
<summary>Prereqs to run this file</summary>

- [The middleware post](../09-middleware-and-zod/) done: the API with middleware and Zod. Folder: `blog-platform`.
- Installs: `npm install jsonwebtoken bcrypt dotenv`. Native build trouble on Windows usually means missing build tools, retry with `npm install --verbose` to see the failing step.
- Env: create `.env` with `JWT_SECRET=dev-only-change-in-prod` and `PORT=3000`. A `.env.example` block is in the auth section below.

</details>

## Part 1 of 2: Auth, hashing, JWT, and where to keep tokens

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

Implementation with `jsonwebtoken`. Start with the setup:

```bash
npm install jsonwebtoken bcrypt
npm install dotenv
```

```bash
# .env.example, copy to .env and fill real secret
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
    return res.status(401).json({ error: "No token sent" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.authorId = decoded.authorId;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
```

Why `Bearer` prefix? Convention from OAuth. It lets one header carry different schemes later. Always split on space and take index 1. Forgetting the split and verifying `"Bearer xyz"` directly fails every time.

Why `expiresIn`? Tokens leak through logs and screenshots. Short life limits damage. 7 days is comfortable for learning. Prod apps often use 15 min access plus refresh tokens.

Full flow with hashed passwords, no plain text anywhere. Full file: save this as `server.js` and run it. It is complete, with the helpers at the bottom:

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
      return res.status(400).json({ errors: parsed.error.issues });
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
    if (!author) return res.status(401).json({ error: "Invalid login" });
    const ok = await bcrypt.compare(password, author.password);
    if (!ok) return res.status(401).json({ error: "Invalid login" });
    res.json({ token: signAuthor(author) });
  } catch (e) {
    next(e);
  }
});

app.get("/me", authMiddleware, (req, res) => {
  const author = authors.find((a) => a.id === req.authorId);
  res.json({ id: author.id, username: author.username });
});

// Helpers live at the bottom. Function declarations hoist, so the routes above can use them.
function signAuthor(author) {
  return jwt.sign(
    { authorId: author.id, username: author.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token sent" });
  }
  try {
    const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET);
    req.authorId = decoded.authorId;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Auth API on ${PORT}`));
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
    return res.status(400).json({ error: "title and content required" });
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

Why from token not body: body can be forged to claim another author id. Token is verified, so `req.authorId` is trustworthy.

Common mistake: forgetting the middleware arg in the route, so `req.authorId` stays undefined and every post saves with no owner. If owner is missing, check route signature first.

</details>

> Checkpoint: you should see signup return a token, the stored password be a long hash and not your password, and a request without the token get 401.

## Part 2 of 2: Status codes for auth, in one box

Keep this table nearby. Mixing these up is the most common auth mistake in real code.

| Situation | Status | Why |
| --------- | ------ | --- |
| No token, bad token, expired token | `401` | "Who are you?" Go log in |
| Wrong username or password | `401` | Same message for both, so attackers learn nothing |
| Token is fine, but this is not your post | `403` | "I know who you are, and no." Do not retry login |
| Missing or malformed fields | `400` | The request shape is wrong |
| Username already taken | `409` | Conflict with existing data |

Where does the token live in this series? In memory on the frontend, sent as `Authorization: Bearer <token>`. That keeps the flow easy to see. When we reach cookie based auth later, the token moves into an `httpOnly` cookie, which scripts cannot read.

## Patterns I keep repeating

**One evolving auth example beats two separate ones.** Early drafts had a header username check in one section and Bearer JWT in another with no link. Readers wondered which to use. Now the header toy becomes the Bearer real version in the same file. Toy first for shape, real second for prod.

**Separate 401 vs 403 early.** 401 means no or bad auth, go login. 403 means logged in but not allowed, do not retry login. Frontend can branch correctly only if backend respects the split.

## Solo rep: Boss rebuild: auth from a blank file

> **Level 2: Peek once.** Read the code once, hide it, and type it from memory. Peek again only when stuck. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

Boss rebuild. In a new folder, from a blank file, rebuild signup, signin and a protected `GET /me`. Use Zod, bcrypt and JWT with the right status codes. Time yourself. Under 30 minutes means this is becoming second nature. Peek at the post only for syntax, never for structure.

<details>
<summary>Check yourself, only after you try</summary>

Check yourself against this list:

- Signup validates with Zod and returns 400 on bad input
- Duplicate username returns 409
- Password is hashed with bcrypt before storing
- Signin returns 401 for unknown user and for wrong password, with the same message
- Token is signed with a secret from `.env`
- `GET /me` returns 401 without a valid token

</details>

## Projects

### 1. Full author auth with Zod and bcrypt

Build signup, signin, and me from this post without looking, then compare.

Requirements:

- Zod schemas for both routes
- Bcrypt hash on signup, compare on signin
- JWT 1 day expiry, Bearer middleware
- `GET /me` returns id and username only, never hash
- Duplicate username gives 409

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

See the full flow code above in the auth section. It meets all points: safeParse 400s, 409 on duplicate, generic 401 on bad login, token carries authorId, me strips password.

Why retype instead of copy: auth has five moving parts that must line up. Typing forces you to connect schema to hash to sign to verify. Copying hides the one line you misunderstand.

Common mistake: storing `password` from body directly when in a rush. Search your file for `password: req.body` before every commit. That string should never appear. Always `password: hash`.

</details>

### 2. Protected blog marketplace

This preserves the old course marketplace challenge, mapped to blogs so the thread stays clean.

Requirements:

- Authors signup and signin with JWT
- `POST /posts` needs auth, sets owner from token, validates with Zod
- `POST /posts/:id/publish` only owner can publish, 403 otherwise
- `GET /posts` public list, `GET /mine` needs auth and returns only my posts
- All protected routes use the same `authMiddleware`

> **Solo gate:** set a 15 minute timer and build this without opening the solution. Stuck at minute 10? Open only the first step, then close it and keep typing. Typing it yourself is the point.

<details>
<summary>Stuck? Solution, one step at a time</summary>

Steps are in order. Open only the one you are stuck on, then close it and type it yourself.

<details>
<summary>Step 1 of 3: const express = require(&quot;express&quot;);</summary>

```js
const express = require("express");
const app = express();
app.use(express.json());

// Assume authors array plus authMiddleware and signAuthor from above
let posts = [];
let nextPostId = 1;

app.get("/posts", (req, res) => {
  res.json({ posts: posts.filter((p) => p.published) });
});
```

</details>

<details>
<summary>Step 2 of 3: app.get(&quot;/mine&quot;, authMiddleware, (req, res) =&gt;</summary>

```js
app.get("/mine", authMiddleware, (req, res) => {
  res.json({ posts: posts.filter((p) => p.authorId === req.authorId) });
});

app.post("/posts", authMiddleware, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "title and content required" });
  }
  const post = {
    id: nextPostId++,
    title,
    content,
    authorId: req.authorId,
    published: false,
  };
  posts.push(post);
  res.status(201).json(post);
});
```

</details>

<details>
<summary>Step 3 of 3: app.post(&quot;/posts/:id/publish&quot;, authMiddleware, (req, res) =&gt;</summary>

```js
app.post("/posts/:id/publish", authMiddleware, (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: "Not found" });
  if (post.authorId !== req.authorId) {
    return res.status(403).json({ error: "Not your post" });
  }
  post.published = true;
  res.json(post);
});

app.listen(3000);
```

</details>

Why owner check before publish: auth proves who you are, ownership proves you may act. Skipping the second check lets any logged in user publish anyone's drafts.

Common mistake: trusting `authorId` from body on create. Always overwrite with token value server side, as done here.

</details>

Next is persistence. The in memory arrays reset on every restart. We swap them for MongoDB with Mongoose, keep the same routes and auth, and add real queries like populate and filters.

## If lost / If bored

- If lost: `Invalid token` with the word Bearer inside the string means you forgot `split(" ")[1]`. A 401 on a request you thought was logged in means check the header spelling: `Authorization: Bearer <token>`.
- If bored: jump to Project 2, the protected marketplace ties middleware, Zod and JWT together.
- Keep for next: `authMiddleware`, the Zod schemas and `.env` with `JWT_SECRET`. [The MongoDB post](../11-mongodb-and-mongoose/) keeps the same auth and swaps arrays for Mongo.

## What breaks next

Users are real now, but they vanish when the server restarts. Where does data live for good?

[Where we are and what is next](../progress/)
