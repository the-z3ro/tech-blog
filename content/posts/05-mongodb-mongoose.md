---
title: "05 : MongoDB and Mongoose - Persisting the Blog"
date: 2026-08-13T12:00:00+05:30
draft: false
tags: ["mongodb", "mongoose", "database"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 5
description: "Clusters to collections, schemas to models, CRUD, populate, and a full auth plus DB blog backend. The single DB source for this series."
cover:
  image: ""
  alt: ""
  caption: ""
---

My blog API worked until I restarted the server. Every post vanished. Every author gone. That is what in memory storage does. It lives in RAM, dies on restart, and never shares between two server instances.

This post fixes that with MongoDB for storage and Mongoose for structure. Same routes and auth from post 04, but data survives.

<details>
<summary>Prereqs to run this file</summary>

- Post 04 auth flow working. Folder: `blog-platform`.
- Installs: `npm install mongoose dotenv`. Check with `node -e "require('mongoose'); console.log('ok')"`.
- Env: `.env` needs `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/blogdb` and `JWT_SECRET=dev-only-change-in-prod`. Copy from `.env.example` block below. Atlas free cluster works: create cluster, allow IP for learning, create DB user, paste the srv string.
- If connect hangs with timeout, `MONGO_URI` is missing or IP not allowed. The fail fast check in the connect snippet prints `Set MONGO_URI in .env first`.
- Full file vs Fragment: schema plus route blocks with imports and `app.listen` are Full files. CRUD one liners are Fragments to run inside an async handler.

</details>

## Why an outside database

Two problems force the move:

```
Problem 1: restart wipes arrays
Problem 2: two servers do not share memory
Fix: outside database both servers talk to
```

Architecture we use from here:

```
Browser -> Express (auth, validation, logic) -> MongoDB
```

Why not let browsers hit Mongo directly? Three reasons I learned the hard way:

1. Browsers do not speak Mongo wire protocol
2. Mongo has no per user row rules like "only edit your drafts"
3. Exposing DB creds in frontend JS hands everyone your password

Express stays in the middle to check JWT, validate with Zod, and enforce ownership. DB just stores.

> Try it yourself: list what breaks if you keep the array version and run two servers on ports 3000 and 3001 behind a load balancer.

<details>
<summary>Solution</summary>

Signup on 3000 creates an author in server A memory. Login on 3001 misses it and returns invalid login. Posts created on A never show on B. Restart of either wipes its half.

Why: each Node process has its own heap. Arrays are not shared. Outside DB gives one shared truth both processes read.

Common mistake: thinking `app.listen` twice in one file shares memory across machines. It shares inside one process only. Separate deploys still split.

</details>

## Clusters, databases, collections

Mongo terms map to familiar ideas:

