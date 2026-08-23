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

You never touch DOM nodes directly for data changes. You update state. React diffs and patches.

```
You set drafts -> React compares old vs new tree -> React updates changed nodes
```

Analogy that stuck for me: I run a small blog admin. I hand my editor a new drafts list (state). The editor figures out which cards to add, move, or remove (DOM). I do not rearrange the notice board myself.

Two rules from this:

1. One source of truth per piece of data, held in state
2. UI is a function of that state, same state gives same UI

> Try it yourself: write down state for a drafts page with filter text, selected draft id, and list. What is state and what is derived?

<details>
<summary>Solution</summary>

State: `drafts` array, `query` string, `selectedId` or null.

Derived, not state: filtered list (`drafts.filter`), count (`drafts.length`), selected draft object (`drafts.find`). Compute these during render instead of storing separately.

Why: storing derived copies drifts. One update misses one copy and UI shows two truths. Derive on the fly so everything stays in sync.

Common mistake: keeping both `drafts` and `filteredDrafts` in state and updating only one on add. Filter from source each render instead.

</details>

## Vanilla vs React, same counter both ways

Vanilla counter needs manual DOM writes on every change:

```js
let count = 0;

function updateCounter() {
  document.getElementById("counter").textContent = count;
}

document.getElementById("inc").addEventListener("click", () => {
  count++;
  updateCounter();
});
```

React counter declares UI from state:

```jsx
import { useState } from "react";

function WordCounter() {
  const [words, setWords] = useState(0);

  return (
    <div>
      <p>{words} words</p>
      <button onClick={() => setWords(words + 50)}>Add paragraph</button>
    </div>
  );
}
```

Why the React version wins as pages grow: no `getElementById` map to maintain, no manual update calls to forget. `setWords` triggers render, React patches the `p` text. Add ten more fields and the pattern stays the same.

## JSX rules you will hit this week

**JSX** looks like HTML but is JS. It compiles to `React.createElement` calls.

```jsx
// You write
const el = <h1 className="title">Hello blog</h1>;

// Roughly what runs
const el = React.createElement("h1", { className: "title" }, "Hello blog");
```

