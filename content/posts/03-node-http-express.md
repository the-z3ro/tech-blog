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

