---
title: "09 : Routing, Context and Recoil - Sharing Blog State"
date: 2026-09-11T14:30:00+05:30
draft: false
tags: ["react", "router", "context", "recoil", "state"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 9
description: "SPA routing with React Router, prop drilling fix with Context, and fine grained atoms with Recoil. Built on the blog admin with drafts and views."
cover:
  image: ""
  alt: ""
  caption: ""
---

Search page works, admin page works, but they live apart. No URLs to share. Draft counts pass through four layers of props to reach a badge. Theme toggle rerenders the whole app. This post connects the pages and cleans the sharing.

We build on the blog admin: drafts, views, comments, theme. Same data, now routed and shared properly.

<details>
<summary>Prereqs to run this file</summary>

- Post 08 hooks solid, folder `blog-frontend`. Installs: `npm install react-router-dom recoil`, Zustand alternative `npm install zustand`.
- Backend optional: post list from `http://localhost:3000/posts` works. The `/admin/stats` demo in Project 3 needs a tiny stub: `app.get("/admin/stats", (req, res) => res.json({ views: 1280, drafts: 4 }))` in backend, or replace fetch with local atoms.
- Full file vs Fragment: Router App blocks with `BrowserRouter` plus `export default` are Full files. Atom definitions are Fragments to keep in `atoms.js`.
- If Recoil install warns about peer React version, Zustand path in Patterns runs the same demo with less setup.

</details>

## Routing, URLs without reloads

A **single page app** loads one HTML file. React swaps components based on URL with no full reload.

```
Multi page:
  /home -> server returns home.html, full reload
  /about -> server returns about.html, full reload

SPA:
  / -> React shows Home, no reload
  /admin -> React shows Admin, URL changes, no reload
```

**Client bundle** is your compiled JS the browser downloads once and runs locally. **Client routing** intercepts link clicks and renders matching components instead of asking the server.

Setup with React Router:

```bash
npm install react-router-dom
```

```jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/posts/a1">Post a1</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<BlogAdmin />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

