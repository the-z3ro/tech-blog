---
title: "03 : Node, HTTP and Express - Building a Blog API"
date: 2026-07-27T11:00:00+05:30
draft: false
tags: ["nodejs", "express", "http", "backend"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 3
description: "Runtimes, HTTP methods and status codes, Express routes, query vs params vs body, and a full blog posts CRUD API tested with Postman and fetch."
cover:
  image: ""
  alt: ""
  caption: ""
---

I knew JS syntax, then I tried to build a backend and got lost in words. Runtime, server, port, route, middleware. They all sounded like the same thing. This post sorts that out by building one thing: a blog posts API you can actually call.

By the end you will have `GET`, `POST`, `PUT`, `DELETE` working on your machine, and you will know how to test them without a frontend.

<details>
<summary>Prereqs to run this file</summary>

- Node LTS 20 or above. Check with `node -v` and `npm -v`.
- Folder: `blog-platform`. Installs: `npm init -y`, `npm install express`, dev helper `npm install -D nodemon`. CORS helper `npm install cors` for the React fetch project in post 06.
- Port: `3000` locally, override with `PORT` env on hosting.
- Test tools: Postman download from getpostman.com, or `curl` (built in on Mac and Linux, on Windows use Git Bash or Postman). Browser address bar covers GET only.
- Full file vs Fragment: `index.js` blocks with `app.listen` are Full files. Single route snippets are Fragments to insert into that file.

</details>

## Runtimes, where JS actually runs

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

If `node -v` prints like `v20.11.0`, you are ready. If not, install LTS from nodejs.org and restart your terminal. I once debugged for an hour only to find my terminal still used an old Node from another installer.

You will hear about Bun too. Bun is a newer runtime written in Zig. It runs most Node code and is faster at startup and package installs. I use Node here because jobs, hosting, and most docs still assume Node. What you learn transfers directly.

What can Node do for our blog? A lot, but we care about one thing first: **HTTP servers**. CLI tools, scripts, and build tools are nice. Servers pay the bills.

> Try it yourself: run `node -e "console.log(process.version)"` and `node -e "console.log(typeof window)"`. What does the second one print and why?

<details>
<summary>Solution</summary>

```bash
node -e "console.log(process.version)"
# v20.x.x

node -e "console.log(typeof window)"
# undefined
```

Why: `process` exists only in Node. `window` exists only in browsers. Same language, different runtime APIs. This is why `document` code crashes in Node and `fs` code crashes in the browser.

Common mistake: copying browser fetch + `localStorage` code into Node and wondering why `localStorage` is missing. In Node, persist with files or a DB, not `localStorage`.

</details>

## HTTP, the function call over network

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

## Methods and status codes, the contract

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
400 Bad Request, client sent wrong shape
401 Unauthorized, no login or bad token
403 Forbidden, logged in but not allowed
404 Not Found, route or id does not exist
411 Length Required, we use it for missing fields in this series
500 Internal Error, our server crashed
```

Note on 411: strict HTTP reserves 411 for missing Content-Length. Here 411 follows the course convention so validation errors line up across posts 03 to 05 and frontend checks stay consistent. Prod standard for bad shapes is 400. Both branch the same way with `res.ok`, only the number differs.

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

## First Express server, routes that do something

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
    return res.status(411).json({ error: "title and content required" });
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

## Blog posts CRUD, the core you will reuse everywhere

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
    return res.status(411).json({ error: "title and content required" });
  }
  let post = { id: nextId++, title, content, published: false };
  posts.push(post);
  res.status(201).json(post);
});

// PUT publish all drafts, shows bulk update logic
app.put("/posts/publish-all", (req, res) => {
  let hasDraft = posts.some((p) => !p.published);
  if (!hasDraft) {
    return res.status(411).json({ message: "All posts already published" });
  }
  posts = posts.map((p) => ({ ...p, published: true }));
  res.json({ message: "All posts published", posts });
});

// DELETE remove all published, keeps drafts
app.delete("/posts/published", (req, res) => {
  let hasPublished = posts.some((p) => p.published);
  if (!hasPublished) {
    return res.status(411).json({ message: "No published posts to remove" });
  }
  posts = posts.filter((p) => !p.published);
  res.json({ message: "Published posts removed", posts });
});

app.listen(3000, () => console.log("Blog API on 3000"));
```

Why in memory array for now? Because HTTP comes before DB in this series. The array lets you learn routes, codes, and testing without Mongo setup. In post 05 we swap the array for Mongoose and keep the same routes.

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

## Testing with Postman and curl, plus fetch from code

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

## Patterns I follow on Express APIs

**Validate at the top, logic below.** Every POST and PUT starts with missing field checks and early returns. Handlers stay flat and the happy path is obvious.

**Use correct codes from day one.** 201 for create, 404 for missing id, 401 for no token, 400 for bad shape. Frontend `res.ok` then works without string matching.

**Keep route order in mind.** Express matches top to bottom. Put `/posts/publish-all` before `/posts/:id`, or `publish-all` gets treated as an id. I hit this once and spent too long wondering why id was a string word.

**Separate storage from routes early.** Even with an array, put `posts` ops in small functions like `findPost(id)` and `addPost(data)`. When we move to Mongo in post 05, only those functions change, not every route.

**Log method plus path while learning.** One line per request shows what Postman actually hit versus what you thought you hit.

```js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

## Projects

All free, all local, each one maps to a real backend task.

### 1. Greet plus calculator API

Build `GET /greet`, `GET /sum`, and `POST /echo`. This cements query vs body vs params.

Requirements:

- `GET /greet?name=X` returns hello message, defaults to Guest
- `GET /sum?a=5&b=3` returns result or 400 on bad numbers
- `POST /echo` returns back whatever JSON it got plus a timestamp

<details>
<summary>Solution with explanation</summary>

```js
const express = require("express");
const app = express();
app.use(express.json());

