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

