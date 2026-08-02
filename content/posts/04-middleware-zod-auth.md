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

