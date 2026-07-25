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

