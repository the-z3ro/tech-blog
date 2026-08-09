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

