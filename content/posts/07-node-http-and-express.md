---
title: "07 : Node, HTTP and Express - Building a Blog API"
date: 2026-07-27T11:00:00+05:30
draft: false
tags: ["nodejs", "express", "http", "backend"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 700
description: "Runtimes, HTTP methods and status codes, Express routes, query vs params vs body, and a full blog posts CRUD API tested with Postman and fetch."
aliases: ["/posts/03-node-http-express/", "/posts/04-node-http-express/", "/posts/node-http-express/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

Jarvis was a program that waited for a command, ran a function, and answered. A web server is the same loop over a network: wait for a request, run a function, send a response. Express is a clean way to say "when this kind of request arrives, run this function".

If you have seen Flask in Python, you already know the shape:

| Flask (Python) | Express (Node) |
| -------------- | -------------- |
| `@app.route("/posts")` | `app.get("/posts", handler)` |
| `request.json` | `req.body` |
| `jsonify(data)` | `res.json(data)` |
| `abort(404)` | `res.status(404).json({ error })` |

By the end you will have `GET`, `POST`, `PUT` and `DELETE` running on your machine, and a way to test them without a frontend.

> **Where we are:** You can fetch and transform data. After this post you own a real API with CRUD routes.
>
> **Phase 01** · Backend · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** HTTP, methods, status codes, Express routes, CRUD, `.env`, and CORS.  
> **Not today:** Validation, auth and databases. Each gets its own post.
>
> **Time:** about 25 minutes to read, 55 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, write an `async` function that fetches a URL and returns the parsed JSON. Include the `res.ok` check.

<details>
<summary>Prereqs to run this file</summary>

- Node 22 or 24 LTS. Check with `node -v` and `npm -v`.
- Folder: `blog-platform`. Installs: `npm init -y`, `npm install express`, dev helper `npm install -D nodemon`. CORS helper `npm install cors` for the React fetch project in [the DOM post](../12-dom-to-react-bridge/).
- Port: `3000` locally, override with `PORT` env on hosting.
- Test tools: Postman download from getpostman.com, or `curl` (built in on Mac and Linux, on Windows use Git Bash or Postman). Browser address bar covers GET only.

</details>

## Part 1 of 7: Runtimes, where JS actually runs

**ECMAScript** is the spec. It defines `let`, `const`, `function`, `Date`, `Promise`, and the rest of the core language. It is a document, not a program you can run.

A runtime implements that spec and adds extra APIs for its world.

```
Browser JS:
  ECMAScript core
  + document, window
  + fetch
  + localStorage
  + setTimeout

Node.js:
  ECMAScript core
  + fs (files)
  + http (servers)
  + path, crypto, os
  + process
```

How Node was born is simple once you see it. Chrome has V8, a C++ engine that compiles JS to machine code. Ryan Dahl took V8 out of the browser and wrapped it with OS level code for files and network. That wrapper is Node. It is not a language. It is a place to run JS with backend powers.

Check yours:

```bash
node -v
npm -v
```

If `node -v` prints like `v22.11.0`, you are ready. If not, install LTS from nodejs.org and restart your terminal. I once debugged for an hour only to find my terminal still used an old Node from another installer.

You will hear about Bun too. Bun is a newer runtime written in Zig. It runs most Node code and is faster at startup and package installs. I use Node here because jobs, hosting, and most docs still assume Node. What you learn transfers directly.

What can Node do for our blog? A lot, but we care about one thing first: **HTTP servers**. CLI tools, scripts, and build tools are nice. Servers pay the bills.

> Try it yourself: run `node -e "console.log(process.version)"` and `node -e "console.log(typeof window)"`. What does the second one print and why?

<details>
<summary>Solution</summary>

```bash
node -e "console.log(process.version)"
# v22.x.x

node -e "console.log(typeof window)"
# undefined
```

Why: `process` exists only in Node. `window` exists only in browsers. Same language, different runtime APIs. This is why `document` code crashes in Node and `fs` code crashes in the browser.

Common mistake: copying browser fetch + `localStorage` code into Node and wondering why `localStorage` is missing. In Node, persist with files or a DB, not `localStorage`.

</details>

> Checkpoint: you should see `node -v` and `npm -v` both print version numbers.

## Part 2 of 7: HTTP, the function call over network

**HTTP** is how clients and servers talk. The browser is usually the client. Your Express app is the server.

```
Browser or Client              Server on localhost:3000
  |                                        |
  |  Request: method, URL, headers, body   |
  | -------------------------------------> |
  |                                        |  run route logic
  |  Response: status code, headers, body  |
  | <------------------------------------- |
```

I like to read HTTP as a function call:

| Function idea | HTTP version                              |
| ------------- | ----------------------------------------- |
| Function name | URL route like `/posts`                   |
| Arguments     | Query params, route params, headers, body |
| Function body | Your Express handler                      |
| Return value  | Response JSON plus status code            |

What happens when you visit a URL in full:

1. Browser parses the URL
2. DNS lookup turns `example.com` into an IP, like contacts turning a name into a phone number
3. TCP plus TLS handshake opens a secure channel
4. Browser sends the HTTP request
5. Server runs logic and responds
6. Browser renders the response

You do not need to memorize step 3 for daily work. You need to know step 2 exists, because when DNS fails you get a lookup error before your server ever sees a request.

## Part 3 of 7: Methods and status codes, the contract

Methods say what kind of action you want. For our blog:

```
GET     read data, no body in practice
POST    create new post, has body
PUT     replace a post fully
PATCH   update part of a post
DELETE  remove a post
```

Blog mapping I actually use:

- `GET /posts` list all drafts and published
- `POST /posts` create one, body has title and content
- `PUT /posts/:id` replace title and content fully
- `PATCH /posts/:id` flip `published` from false to true
- `DELETE /posts/:id` remove it

Status codes tell the client what happened without parsing text:

```
200 OK, GET worked
201 Created, POST worked
400 Bad Request, missing or malformed fields
401 Unauthorized, no login or bad token
403 Forbidden, logged in but not allowed
404 Not Found, route or id does not exist
500 Internal Error, our server crashed
```

Note on validation errors: the usual status for a bad request shape is `400`. You will also see `422` in some APIs, and some tutorials use `400`, which really means Length Required. We use `400` everywhere in this series, so frontend checks stay consistent and `res.ok` branches the same way.

Why care about codes if you also send JSON? Because clients branch on codes. Frontend shows a login screen on 401, a not found page on 404, and retries on 500. If you return 200 for everything, every client has to parse your message strings. That breaks fast.

> Try it yourself: which code for "created a post", "post id does not exist", "no token sent", "server threw"? No code yet, just the numbers.

<details>
<summary>Solution</summary>

- Created a post: `201`
- Post id does not exist: `404`
- No token sent: `401`
- Server threw: `500`

Why: codes group by first digit. 2 means success, 4 means client messed up, 5 means server messed up. Pick the specific one inside the group.

Common mistake: returning 200 with `{ error: "not found" }`. Frontend `fetch` treats 200 as success unless you check the body manually. Use real codes so `res.ok` works.

</details>

> Checkpoint: you should be able to answer without looking: created is 201, missing is 404, not logged in is 401, bad input is 400.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *First Express server, routes that do something*.

## Part 4 of 7: First Express server, routes that do something

Install once per project:

```bash
npm init -y
npm install express
```

Minimal server with the four input styles you will use daily:

```js
// index.js
const express = require("express");
const app = express();

// Parses JSON bodies into req.body, without this req.body stays undefined
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Blog API running" });
});

// Body: POST /posts with JSON { title, content }
app.post("/posts", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "title and content required" });
  }
  res.status(201).json({ created: true, title });
});

// Query: GET /sum?a=5&b=3, best for filters and search
app.get("/sum", (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.status(400).json({ error: "a and b must be numbers" });
  }
  res.json({ result: a + b });
});

// Params: GET /posts/123, best for ids
app.get("/posts/:id", (req, res) => {
  res.json({ postId: req.params.id });
});

app.listen(3000, () => {
  console.log("Server on http://localhost:3000");
});
```

Run with `node index.js`, then open `http://localhost:3000/` in your browser. Browsers can only do GET from the address bar, so use Postman or curl for POST next.

Why `express.json()` first? Express does not parse bodies by default. Without that line, `req.body` is undefined even if the client sent perfect JSON. I forget this every few months and stare at undefined for ten minutes.

Query vs params vs body still confuses people, so here is how I pick:

- Query `?q=react&limit=5` for optional filters, search, pagination
- Params `/posts/:id` for which resource, required id
- Body for new or updated data, JSON object
- Headers for tokens and metadata, not business data

> Try it yourself: add `GET /greet?name=Alice` that returns `{ message: "Hello, Alice!" }`. Default to "Guest" when name is missing.

<details>
<summary>Solution</summary>

```js
app.get("/greet", (req, res) => {
  const name = req.query.name || "Guest";
  res.json({ message: `Hello, ${name}!` });
});
```

Why `|| "Guest"`: query values are strings or undefined. If missing, fall back. Template literal keeps spacing clean.

Common mistake: `req.params.name` here. Params only work when the route has `:name` in its path. Query lives after `?`, params live inside the path.

</details>

> Checkpoint: you should see your route's response when you open `http://localhost:3000` in the browser, and the terminal stay running.

## Part 5 of 7: Blog posts CRUD, the core you will reuse everywhere

This is the same shape as every CRUD API you will build: list, create, fix, remove. I use posts instead of abstract todos so the fields feel real.

```js
const express = require("express");
const app = express();
app.use(express.json());

let posts = [
  { id: 1, title: "Hello world", content: "First post", published: false },
  { id: 2, title: "Async JS", content: "Promises explained", published: true },
];
let nextId = 3;

// GET list plus stats, like an admin header needs
app.get("/posts", (req, res) => {
  res.json({
    total: posts.length,
    published: posts.filter((p) => p.published).length,
    posts,
  });
});

// POST create
app.post("/posts", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "title and content required" });
  }
  let post = { id: nextId++, title, content, published: false };
  posts.push(post);
  res.status(201).json(post);
});

// PUT publish all drafts, shows bulk update logic
app.put("/posts/publish-all", (req, res) => {
  let hasDraft = posts.some((p) => !p.published);
  if (!hasDraft) {
    return res.status(400).json({ message: "All posts already published" });
  }
  posts = posts.map((p) => ({ ...p, published: true }));
  res.json({ message: "All posts published", posts });
});

// DELETE remove all published, keeps drafts
app.delete("/posts/published", (req, res) => {
  let hasPublished = posts.some((p) => p.published);
  if (!hasPublished) {
    return res.status(400).json({ message: "No published posts to remove" });
  }
  posts = posts.filter((p) => !p.published);
  res.json({ message: "Published posts removed", posts });
});

app.listen(3000, () => console.log("Blog API on 3000"));
```

Why in memory array for now? Because HTTP comes before DB in this series. The array lets you learn routes, codes, and testing without Mongo setup. In [the MongoDB post](../11-mongodb-and-mongoose/) we swap the array for Mongoose and keep the same routes.

Why `PUT /posts/publish-all` and not `PUT /posts`? Explicit paths read better in logs and avoid clashing with `PUT /posts/:id` later. When you add single post update, use `PUT /posts/:id` for one and keep this bulk path separate.

> Try it yourself: add `DELETE /posts/:id` that removes one post by id and returns 404 when missing.

<details>
<summary>Solution</summary>

```js
app.delete("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const found = posts.find((p) => p.id === id);
  if (!found) {
    return res.status(404).json({ error: "Post not found" });
  }
  posts = posts.filter((p) => p.id !== id);
  res.json({ message: "Deleted", posts });
});
```

Why `Number()`: params are always strings. `p.id` is a number. `"2" === 2` is false, so convert first.

Common mistake: `posts.splice(index)` without checking `findIndex` result. If index is `-1`, splice removes the last item. Filter by id is safer for beginners.

</details>

> Checkpoint: you should see POST add a post, GET return the list including it, DELETE remove it, and a missing id return 404.

## Part 6 of 7: Testing with Postman and curl, plus fetch from code

Browsers do GET from the address bar. For POST, PUT, DELETE you need a client.

Postman flow I use:

1. New request, set method to POST
2. URL `http://localhost:3000/posts`
3. Body tab, raw, JSON, then `{ "title": "My draft", "content": "Hello" }`
4. Send, check status 201 and the returned JSON

Curl version of the same, good for sharing in docs:

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My draft","content":"Hello"}'
```

Why `-H Content-Type` matters: without it Express sees plain text and `req.body` stays empty even with `express.json()`. That header tells the server how to parse.

Third way is fetch from your own frontend code. This is the bridge to React later.

```js
// GET list
async function getPosts() {
  const res = await fetch("http://localhost:3000/posts");
  const data = await res.json();
  console.log(data);
}

// POST with token, this shape returns in auth post too
async function createPost(title, content, token) {
  const res = await fetch("http://localhost:3000/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Create failed");
  return data;
}
```

Why `JSON.stringify`? Fetch body must be a string. Passing a raw object sends `[object Object]`. Stringify on send, `express.json()` parses on receive.

For daily dev I add `nodemon` so the server restarts on save, and read port from env so hosting can override it:

```bash
npm install -D nodemon
```

```js
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`On ${PORT}`));
```

For React fetch from Vite `:5173` to Express `:3000`, browsers block without CORS. Add once in backend:

```bash
npm install cors
```

```js
// Full file addition near top after express.json()
const cors = require("cors");
app.use(cors());
```

```json
// package.json
{
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  }
}
```

> Checkpoint: you should see the same JSON from `curl`, from Postman, and from a `fetch` call in code.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Two things that bite on day one: .env and CORS*.

## Part 7 of 7: Two things that bite on day one: .env and CORS

**.env keeps secrets and settings out of your code.** Anything that changes between your laptop and a real server (a port, a password, a secret key) belongs in a file called `.env`.

```bash
npm install dotenv
```

```
# .env  (never commit this file)
PORT=3000
JWT_SECRET=change-me-in-production
```

```js
// top of server.js
require("dotenv").config();
const PORT = process.env.PORT || 3000;
```

Add `.env` to `.gitignore`, and commit a `.env.example` with fake values so other people know which variables exist. The moment a real secret reaches GitHub, treat it as stolen. On Node 22 or 24 you can also skip the package and run `node --env-file=.env server.js`.

**CORS is the browser's bouncer.** An **origin** is protocol plus host plus port. Your React app on `localhost:5173` and your API on `localhost:3000` are different origins. By default the browser refuses to let a page read a response from a different origin, unless the server says it is allowed with an `Access-Control-Allow-Origin` header.

Two details that save hours:

- The **browser** enforces CORS, not the server. That is why a request works in Postman or `curl` and fails in your frontend.
- For requests with JSON bodies or an `Authorization` header, the browser first sends a harmless **preflight** `OPTIONS` request asking permission. The `cors` package answers it for you.

```js
const cors = require("cors");
app.use(cors({ origin: "http://localhost:5173" }));
```

Plain `cors()` allows every origin, which is fine for learning. In production, list the exact frontend URL.

> Checkpoint: before adding `cors`, a `fetch` from your Vite page shows a red CORS error in the console while `curl` works. After adding it, the same `fetch` returns your posts.

## Patterns I follow on Express APIs

**Validate at the top, logic below.** Every POST and PUT starts with missing field checks and early returns. Handlers stay flat and the happy path is obvious.

**Use correct codes from day one.** 201 for create, 404 for missing id, 401 for no token, 400 for bad shape. Frontend `res.ok` then works without string matching.

**Keep route order in mind.** Express matches top to bottom. Put `/posts/publish-all` before `/posts/:id`, or `publish-all` gets treated as an id. I hit this once and spent too long wondering why id was a string word.

**Separate storage from routes early.** Even with an array, put `posts` ops in small functions like `findPost(id)` and `addPost(data)`. When we move to Mongo in [the MongoDB post](../11-mongodb-and-mongoose/), only those functions change, not every route.

**Log method plus path while learning.** One line per request shows what Postman actually hit versus what you thought you hit.

```js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

## Solo rep: Rebuild the CRUD core

> **Level 2: Peek once.** Read the code once, hide it, and type it from memory. Peek again only when stuck. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

Read the CRUD routes once, hide them, and rebuild `GET /posts`, `POST /posts`, `GET /posts/:id` and `DELETE /posts/:id` in a fresh folder. Use correct status codes: 201 on create, 404 when missing. Aim for 15 minutes.

<details>
<summary>Check yourself, only after you try</summary>

```js
const express = require("express");
const app = express();
app.use(express.json());

let posts = [];
let nextId = 1;

app.get("/posts", (req, res) => res.json({ posts }));

app.post("/posts", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Missing fields" });
  const post = { id: nextId++, title, content };
  posts.push(post);
  res.status(201).json(post);
});

app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: "Not found" });
  res.json(post);
});

app.delete("/posts/:id", (req, res) => {
  const before = posts.length;
  posts = posts.filter((p) => p.id !== Number(req.params.id));
  if (posts.length === before) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

app.listen(3000);
```

</details>

## Projects

All free, all local, each one maps to a real backend task.

### 1. Greet plus calculator API

Build `GET /greet`, `GET /sum`, and `POST /echo`. This cements query vs body vs params.

Requirements:

- `GET /greet?name=X` returns hello message, defaults to Guest
- `GET /sum?a=5&b=3` returns result or 400 on bad numbers
- `POST /echo` returns back whatever JSON it got plus a timestamp

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```js
const express = require("express");
const app = express();
app.use(express.json());

app.get("/greet", (req, res) => {
  const name = req.query.name || "Guest";
  res.json({ message: `Hello, ${name}!` });
});

app.get("/sum", (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.status(400).json({ error: "a and b must be numbers" });
  }
  res.json({ result: a + b });
});

app.post("/echo", (req, res) => {
  res.json({ youSent: req.body, at: new Date().toISOString() });
});

app.listen(3000);
```

Why: greet proves query handling, sum proves number conversion and 400s, echo proves body parsing. Timestamp shows server side data added to client data.

Common mistake: forgetting `app.use(express.json())` so echo gets empty body. If `req.body` is undefined, that line is missing or the client forgot `Content-Type: application/json`.

</details>

### 2. Full blog posts API

Extend the CRUD in this post to single resource ops. This is the API the React frontend will call later.

Requirements:

- Keep `GET /posts`, `POST /posts` from above
- Add `GET /posts/:id` with 404
- Add `PUT /posts/:id` to replace title and content, 404 when missing, 400 when fields missing
- Add `DELETE /posts/:id` with 404
- Test all five with Postman or curl

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

let posts = [{ id: 1, title: "Hello", content: "World", published: false }];
let nextId = 2;

app.get("/posts", (req, res) => res.json({ posts }));

app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});
```

</details>

<details>
<summary>Step 2 of 3: app.post(&quot;/posts&quot;, (req, res) =&gt;</summary>

```js
app.post("/posts", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "title and content required" });
  }
  const post = { id: nextId++, title, content, published: false };
  posts.push(post);
  res.status(201).json(post);
});

app.put("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: "Post not found" });
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "title and content required" });
  }
  post.title = title;
  post.content = content;
  res.json(post);
});
```

</details>

<details>
<summary>Step 3 of 3: app.delete(&quot;/posts/:id&quot;, (req, res) =&gt;</summary>

```js
app.delete("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!posts.some((p) => p.id === id)) {
    return res.status(404).json({ error: "Post not found" });
  }
  posts = posts.filter((p) => p.id !== id);
  res.json({ message: "Deleted" });
});

app.listen(3000);
```

</details>

Why separate GET one plus PUT one: list views need all posts, edit pages need one post. PUT replaces fully, so both fields required. PATCH later will allow partial.

Common mistake: defining `/posts/:id` before `/posts/publish-all` in the same file. Express would treat `publish-all` as an id. Keep static paths above param paths.

</details>

### 3. Blog views tracker

Build a small stats API that uses query filters and reduce. This previews DB aggregation without a DB.

Requirements:

- In memory `views = [{ postId, day, count }]`
- `POST /views` adds a record `{ postId, day, count }`
- `GET /views?postId=1` returns records for that post plus total via reduce
- `GET /top?limit=2` returns top posts by total views
- Validate numbers, return 400 on bad input

> **Solo gate:** set a 15 minute timer and build this without opening the solution. Stuck at minute 10? Open only the first step, then close it and keep typing. Typing it yourself is the point.

<details>
<summary>Stuck? Solution, one step at a time</summary>

Steps are in order. Open only the one you are stuck on, then close it and type it yourself.

<details>
<summary>Step 1 of 2: const express = require(&quot;express&quot;);</summary>

```js
const express = require("express");
const app = express();
app.use(express.json());

let views = [
  { postId: 1, day: "2026-09-01", count: 120 },
  { postId: 1, day: "2026-09-02", count: 80 },
  { postId: 2, day: "2026-09-01", count: 310 },
];

app.post("/views", (req, res) => {
  const postId = Number(req.body.postId);
  const count = Number(req.body.count);
  const day = req.body.day;
  if (Number.isNaN(postId) || Number.isNaN(count) || !day) {
    return res.status(400).json({ error: "postId, count, day required" });
  }
  const rec = { postId, day, count };
  views.push(rec);
  res.status(201).json(rec);
});
```

</details>

<details>
<summary>Step 2 of 2: app.get(&quot;/views&quot;, (req, res) =&gt;</summary>

```js
app.get("/views", (req, res) => {
  const postId = Number(req.query.postId);
  if (Number.isNaN(postId)) {
    return res.status(400).json({ error: "postId query required" });
  }
  const list = views.filter((v) => v.postId === postId);
  const total = list.reduce((s, v) => s + v.count, 0);
  res.json({ postId, total, records: list });
});

app.get("/top", (req, res) => {
  const limit = Number(req.query.limit) || 3;
  let totals = {};
  for (let v of views) {
    totals[v.postId] = (totals[v.postId] || 0) + v.count;
  }
  let ranked = Object.entries(totals)
    .map(([postId, total]) => ({ postId: Number(postId), total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
  res.json({ top: ranked });
});

app.listen(3000);
```

</details>

Why this shape: POST writes raw events, GET aggregates on read. That mirrors analytics tables later. Object map plus sort is the simplest top N without a DB.

Common mistake: sorting strings instead of numbers. `sort()` without a compare fn sorts lexicographically, so 100 comes before 20. Always pass `(a, b) => b.total - a.total` for numeric rank.

</details>

Next is middleware, validation, and auth. We take this blog API and add logging, Zod checks, and JWT so only authors can publish their own drafts.

## If lost / If bored

- If lost: `req.body` undefined means missing `app.use(express.json())` or missing `Content-Type: application/json` on client. `publish-all` treated as id means route order, keep static paths above `:id`.
- If bored: skip to Project 2 full blog CRUD, it is the API the frontend calls later.
- Keep for next: `blog-platform` folder plus Postman collection. [The middleware post](../09-middleware-and-zod/) adds middleware to these same routes.

## What breaks next

Your API works, right up until it does not. How do you find out why, fast?

[Where we are and what is next](../progress/)
