---
title: "08 : React Hooks in Depth - Effect, Memo, Callback and Ref"
date: 2026-09-04T14:00:00+05:30
draft: false
tags: ["react", "hooks", "useEffect", "performance"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 8
description: "useEffect with fetch and cleanup, useMemo for expensive lists, useCallback with memo, and useRef for DOM and timers. Built on one blog search app."
cover:
  image: ""
  alt: ""
  caption: ""
---

Basics gave us drafts in state. Now real behavior: fetch posts from the API, search them fast, save drafts without hammering the server, and focus inputs without rerenders.

One app threads through everything here: a blog search page with a counter, a search box, and a list. Same data, four hooks solving four different pains.

<details>
<summary>Prereqs to run this file</summary>

- Post 07 basics solid, folder `blog-frontend`. Lint helper `npm install -D eslint-plugin-react-hooks` to catch missing deps.
- Backend optional: `http://localhost:3000/posts` for fetch demos, with CORS enabled from post 06 note. Without backend, use the local `fetchPosts()` timer fake from Project 1.
- Starter seed for Project 1: `const posts = Array.from({ length: 200 }, (_, i) => ({ id: i + 1, title: "Post " + (i + 1), views: (i * 37) % 500 }))`.
- Full file vs Fragment: Project blocks with imports plus component plus `export default` are Full files. `useMemo` one liners are Fragments.

</details>

## Hooks overview and the two rules

Hooks are functions starting with `use` that plug into React from function components.

```
useState     local UI state
useEffect    sync with outside world
useMemo      cache expensive results
useCallback  keep function identity stable
useRef       mutable box with no rerenders
useContext   shared values, covered in post 09
```

