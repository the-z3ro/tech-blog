---
title: "07 : React Basics - State, JSX and Components"
date: 2026-08-25T13:30:00+05:30
draft: false
tags: ["react", "jsx", "components", "useState"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 7
description: "Mental model, JSX rules, components and props, useState with immutable updates, and re-render rules. Built on the blog drafts app."
cover:
  image: ""
  alt: ""
  caption: ""
---

Raw DOM taught me the pain. Now the fix. React lets me describe what the UI should look like for a given state, and it handles the DOM patches.

We keep the same blog drafts app from post 06. Same data, new mental model.

<details>
<summary>Prereqs to run this file</summary>

- Post 06 Vite app running. Folder: `blog-frontend`, `npm run dev` on `http://localhost:5173`.
- No backend needed. All state is local with `useState`.
- Paste rule: components below are Fragments. To run in Vite, save as `src/App.jsx` with `import { useState } from "react"` at top and `export default FunctionName` at bottom. Full file versions live in Projects.
- JS recap: destructure `{ title }`, spread `[...list]`, `filter` and `map` from post 02. If fuzzy, reread post 02 chain section first.

</details>

## Mental model: state in, UI out

Every frontend has two halves:

```
State                Components
The data             View function
what changes         state to rendered HTML
```

