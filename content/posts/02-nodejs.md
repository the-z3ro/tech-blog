---
title: "02 Nodejs"
date: 2026-03-13T23:21:12+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 2
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

# 02 : Node.js, HTTP Servers, Express & Git

> **Blog Summary:** Moves from JS fundamentals to building real backend servers. Covers the Node.js runtime, the HTTP protocol, creating servers with Express, testing with Postman, and version control with Git.

---

## 1. JavaScript Runtimes

[SOURCE — COURSE MATERIAL]

### ECMAScript — The Spec

ECMAScript defines the core language: `var`, `const`, `let`, `function`, `Date`, `setTimeout`, etc. It's the specification, not the implementation.

### Browser JS = ECMAScript + Browser APIs

```
Browser JS:
  ├── ECMAScript (core language)
  ├── setTimeout / setInterval
  ├── fetch (HTTP requests)
  ├── document (DOM access)
  └── localStorage
```

### Node.js = ECMAScript + Backend APIs

```
Node.js:
  ├── ECMAScript (core language)
  ├── setTimeout
  ├── fs (file system)
  ├── http (create HTTP servers)
  └── path, crypto, os...
```

### How Node.js Was Born

[ADDED — IMPORTANT BACKGROUND]

```
Chrome's V8 engine (C++) → extracted → Node.js runtime added
(compiles JS → machine code)        (fs, http, etc.)
```

Ryan Dahl took V8 and wrapped it with C++ to add OS-level capabilities. Node became the way to run JS on servers.

### Bun — The Newer Alternative

Written in **Zig**, significantly faster than Node. Drop-in replacement for most use cases. The course focuses on Node.js.

---

## 2. What Can Node.js Do?

[SOURCE — COURSE MATERIAL]

- Create CLI tools
- Video players, games
- **HTTP Servers** ← our focus

---

## 3. HTTP Protocol

[SOURCE — COURSE MATERIAL]

### What Is HTTP?

HyperText Transfer Protocol — the standard way browsers (clients) talk to backends (servers).

```
Browser/Client                    Server (Node.js/Express)
     │                                      │
     │  ─── HTTP Request ──────────────→   │
     │  (method, URL, headers, body)        │
     │                                      │
     │  ←── HTTP Response ──────────────   │
     │  (status code, headers, body)        │
```

### Think of HTTP as a Function Call

| Function Concept | HTTP Equivalent                       |
| ---------------- | ------------------------------------- |
| Function name    | URL / Route                           |
| Arguments        | Request body / query params / headers |
| Function body    | Server-side logic                     |
| Return value     | Response body                         |

### What Happens When You Visit a URL

1. Browser parses the URL
2. DNS lookup — converts `google.com` → IP address (like contacts → phone number)
3. TCP/TLS handshake (establish connection)
4. HTTP request sent
5. Server processes & responds
6. Browser renders response

---

## 4. HTTP Methods

[SOURCE — COURSE MATERIAL]

```
GET    — Retrieve data (read-only, no body)
POST   — Create new resource (has body)
PUT    — Replace a resource entirely
DELETE — Remove a resource
PATCH  — Partial update (not covered but common)
```

**Medical analogy:**

- GET → Doctor consultation (check up)
- POST → Insert a new kidney
- PUT → Replace an existing kidney
- DELETE → Remove a kidney

---

## 5. HTTP Status Codes

[SOURCE — COURSE MATERIAL]

```
200 — OK, success
201 — Created (good response to POST)
400 — Bad Request (client sent wrong data)
401 — Unauthorized (not logged in)
403 — Forbidden (logged in but no permission)
404 — Not Found (route doesn't exist)
411 — Length Required (missing input)
500 — Internal Server Error (your backend crashed)
```

---

## 6. Creating an HTTP Server with Express

[SOURCE — COURSE MATERIAL]

```bash
npm init -y
npm install express
```

```js
// index.js — minimal Express server
const express = require("express");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// GET route
app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

// POST route with body
app.post("/user", (req, res) => {
  const { name, age } = req.body;
  res.json({ created: true, name, age });
});

// Query params: GET /sum?a=5&b=3
app.get("/sum", (req, res) => {
  const a = parseInt(req.query.a);
  const b = parseInt(req.query.b);
  res.json({ result: a + b });
});

// Route params: GET /user/123
app.get("/user/:id", (req, res) => {
  const id = req.params.id;
  res.json({ userId: id });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

---

## 7. The Kidney Hospital — Building a Real CRUD API

[SOURCE — COURSE MATERIAL]

This in-memory CRUD example is the capstone of HTTP basics:

```js
const express = require("express");
const app = express();
app.use(express.json());

// In-memory "database"
const users = [
  {
    name: "John",
    kidneys: [{ healthy: false }, { healthy: true }],
  },
];

// GET — how many kidneys, which are healthy
app.get("/kidney", (req, res) => {
  const user = users[0];
  const total = user.kidneys.length;
  const healthy = user.kidneys.filter((k) => k.healthy).length;
  res.json({ total, healthy, unhealthy: total - healthy });
});

// POST — add a new kidney
app.post("/kidney", (req, res) => {
  const { healthy } = req.body;
  users[0].kidneys.push({ healthy });
  res.json({ message: "Kidney added" });
});

// PUT — make all unhealthy kidneys healthy
app.put("/kidney", (req, res) => {
  const user = users[0];
  const hasUnhealthy = user.kidneys.some((k) => !k.healthy);
  if (!hasUnhealthy) {
    return res.status(411).json({ message: "All kidneys already healthy" });
  }
  user.kidneys = user.kidneys.map((k) => ({ healthy: true }));
  res.json({ message: "All kidneys are now healthy" });
});

// DELETE — remove all unhealthy kidneys
app.delete("/kidney", (req, res) => {
  const user = users[0];
  const hasUnhealthy = user.kidneys.some((k) => !k.healthy);
  if (!hasUnhealthy) {
    return res.status(411).json({ message: "No unhealthy kidneys to remove" });
  }
  user.kidneys = user.kidneys.filter((k) => k.healthy);
  res.json({ message: "Unhealthy kidneys removed" });
});

app.listen(3000);
```

---

## 8. Testing with Postman

[SOURCE — COURSE MATERIAL]

Postman is a GUI tool to send HTTP requests without a browser.

**Why needed:** Browsers can only send `GET` requests via the address bar. To test `POST`, `PUT`, `DELETE`, use Postman (or `curl`).

```bash
# curl equivalent
curl -X POST http://localhost:3000/kidney \
  -H "Content-Type: application/json" \
  -d '{"healthy": true}'
```

---

## 9. Git — Version Control

[SOURCE — COURSE MATERIAL]

### What Is Git?

A **distributed version control system** that tracks changes in files, allows collaboration, and enables reverting to previous states.

### Git vs GitHub

| Git                                   | GitHub                                 |
| ------------------------------------- | -------------------------------------- |
| Local tool, installed on your machine | Cloud hosting for git repos            |
| Tracks changes                        | Provides web interface + collaboration |
| Free, open source                     | Free tier + paid plans                 |
| Works without GitHub                  | Requires Git                           |

### Core Concepts

```
Working Directory → Staging Area → Local Repository → Remote (GitHub)
    (edit files)      (git add)      (git commit)      (git push)
```

- **Blob:** Binary file content (content-addressed by SHA1 hash)
- **Tree:** Represents a directory (holds blobs and sub-trees)
- **Commit:** Snapshot of the repo. Has pointer to parent commit → forms a linked list

### Essential Git Commands

```bash
# Setup
git init                       # initialize new repo
git clone <url>                # copy remote repo locally

# Daily workflow
git status                     # see what's changed
git add .                      # stage all changes
git add file.js                # stage specific file
git commit -m "feat: add login" # save snapshot
git push origin main           # upload to GitHub
git pull origin main           # download latest changes

# Branching
git branch feature/login       # create branch
git checkout feature/login     # switch to branch
git checkout -b feature/login  # create + switch (shortcut)
git merge feature/login        # merge into current branch

# History
git log --oneline              # compact commit history
git diff                       # see unstaged changes
```

### Branching Model

```
main:    C1 ─── C2 ─── C3 ─── C4 ─── [Merge]
                  \                      /
feature:           C1 ─── C2 ──────────
```

### Merge Conflicts

Occur when two branches edit the same line differently.

```
<<<<<<< HEAD (your branch)
const x = 5;
=======
const x = 10;
>>>>>>> feature/login (incoming)
```

**Resolution:** Manually pick one version (or combine), delete the markers, then `git add` + `git commit`.

```bash
git log --merge    # see conflicting commits
git status         # see unmerged files
```

---

## Exercises

### Quick (10–15 min)

Create an Express server with a `GET /greet?name=Alice` route that returns `{ message: "Hello, Alice!" }`.

**Hint 1:** `req.query.name`  
**Hint 2:** Use template literal `` `Hello, ${name}!` ``

---

### Intermediate (30–60 min)

Build a simple **todo list API** in memory:

- `GET /todos` — list all todos
- `POST /todos` — add a new todo `{ title, completed: false }`
- `PUT /todos/:id` — mark a todo as completed
- `DELETE /todos/:id` — delete a todo

**Expected behavior:** All operations work correctly. Deleting a non-existent todo returns 404.

---

### Challenge (2–4 hours)

Build a **student grade tracker** API:

- Add students with name + grades array
- Get average grade for a student
- Get the top 3 students by average
- A route that returns students who are failing (average < 40)

---

## Common Confusions

| Confusion                                      | Reality                                                     |
| ---------------------------------------------- | ----------------------------------------------------------- |
| "GET can't have a body"                        | Technically allowed but not conventional — use query params |
| "`git add .` saves my work"                    | No. `git commit` saves. `add` only stages.                  |
| "`git push` is like saving"                    | Push sends to remote. Always commit before push.            |
| "Status code doesn't matter, just return data" | Standards exist so clients can handle responses correctly   |

---

## Key Takeaways

- Node.js = V8 + backend APIs (fs, http) — not a language, a runtime
- HTTP is a request-response protocol: client sends request, server responds
- Express makes creating routes simple: `app.get/post/put/delete(path, handler)`
- Always validate inputs and return meaningful status codes
- Git tracks history; GitHub hosts it. Branch → develop → PR → merge
