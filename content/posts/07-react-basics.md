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

Rules that fix 90 percent of beginner errors:

```jsx
// 1. One root, wrap siblings
// Wrong: two roots
// return (<h1>A</h1><p>B</p>);

// Right: div or Fragment, Fragment adds no extra node
return (
  <>
    <h1>A</h1>
    <p>B</p>
  </>
);

// 2. class to className, since class is reserved in JS
<div className="post-card">Hi</div>

// 3. JS in braces
const author = "eshan";
<h1>Hello, {author}!</h1>

// 4. Self close void tags
<input />
<img src="cover.jpg" alt="cover" />

// 5. camelCase events
<button onClick={publish}>Publish</button>
<input onChange={(e) => setQuery(e.target.value)} />
```

Why Fragment `<>` over div soup? Extra divs break flex layouts and bloat the tree. Fragment groups without adding a node. Use explicit `<React.Fragment key={id}>` only when mapping with keys on the wrapper itself.

> Try it yourself: fix a component that returns `h1` plus `p` without a wrapper, uses `class`, and uses `onclick` lowercase.

<details>
<summary>Solution</summary>

```jsx
function Fixed() {
  return (
    <>
      <h1 className="title">Hello</h1>
      <p>World</p>
      <button onClick={() => console.log("hi")}>Say hi</button>
    </>
  );
}
```

Why each fix: single root satisfies JSX parser, `className` avoids reserved word clash, `onClick` matches React prop names.

Common mistake: `<label for="x">` in JSX. Use `htmlFor` for the same reserved word reason.

</details>

## Components, props, and children

A **component** is a reusable function that returns JSX. Props are inputs, read only inside.

```jsx
function PublishButton({ label, onPublish, color }) {
  return (
    <button onClick={onPublish} style={{ backgroundColor: color }}>
      {label}
    </button>
  );
}

function AdminBar() {
  return (
    <div>
      <PublishButton
        label="Publish"
        onPublish={() => console.log("pub")}
        color="green"
      />
      <PublishButton
        label="Delete"
        onPublish={() => console.log("del")}
        color="red"
      />
    </div>
  );
}
```

Why destructure `{ label }` in params? Shorter reads plus clear contract at the top. You see required inputs without scanning the body.

Composition with `children` lets wrappers hold any content:

```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <div className="card-head">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function DraftCard({ draft }) {
  return (
    <Card title={draft.title}>
      <p>{draft.content.slice(0, 100)}</p>
      <small>by {draft.author}</small>
    </Card>
  );
}
```

Why `children` over many props? Card does not need to know what lives inside. Same shell holds drafts, posts, comments, bios. Fewer props, more reuse.

Keys and lists go here too, since every blog list needs them:

```jsx
// Good: stable id from data
{
  posts.map((p) => <DraftCard key={p.id} draft={p} />);
}

// Risky: index as key
{
  posts.map((p, i) => <DraftCard key={i} draft={p} />);
}
```

Why ids over indexes? React uses keys to match old vs new items. With indexes, inserting at the top shifts every key and React reuses the wrong nodes. Inputs keep old text, checkboxes jump. Server `_id` or local `id` stays stable across sorts and filters.

> Try it yourself: render a list of three drafts with ids `a,b,c`, then reverse the array. Predict what breaks with index keys vs id keys.

<details>
<summary>Solution</summary>

With id keys, React moves nodes correctly. Inputs and state stay with the right draft.

With index keys, node 0 stays node 0 even though data moved. If each row had an input, typed text sticks to position not draft. That is the classic index key bug.

Why: keys are identity, not styling. Stable identity lets the diff move instead of recreate.

Common mistake: `key={Math.random()}`. New key every render forces full recreate and kills performance plus focus. Keys must be stable across renders.

</details>

## useState with immutable updates

`useState` holds component state. Setter triggers rerender with new value.

```jsx
import { useState } from "react";

function DraftsApp() {
  const [drafts, setDrafts] = useState([]);
  const [title, setTitle] = useState("");

  function addDraft() {
    if (!title.trim()) return;
    setDrafts([...drafts, { id: Date.now(), title, published: false }]);
    setTitle("");
  }

  function togglePublish(id) {
    setDrafts(
      drafts.map((d) => (d.id === id ? { ...d, published: !d.published } : d)),
    );
  }

  return (
    <div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New draft title"
      />
      <button onClick={addDraft}>Add</button>
      <ul>
        {drafts.map((d) => (
          <li
            key={d.id}
            onClick={() => togglePublish(d.id)}
            style={{ textDecoration: d.published ? "line-through" : "none" }}
          >
            {d.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Critical rule: never mutate state directly. React compares references to decide what changed.

```jsx
// Wrong: same array reference, React may skip render
drafts.push(newDraft);
setDrafts(drafts);

// Right: new array, React sees change
setDrafts([...drafts, newDraft]);

// Wrong object mutate
// draft.title = "x"; setDrafts(drafts);

