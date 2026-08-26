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

// Right object copy
setDrafts(drafts.map((d) => (d.id === id ? { ...d, title: "x" } : d)));
```

Why spread works: `[...drafts]` makes a new array with same items. `{ ...d }` makes a new object with same fields plus overrides. Old state stays untouched, new state has a fresh reference React can detect.

`setState` is async in feel. Logging right after set still shows old value. Read the new value on next render or compute it before setting.

> Try it yourself: add `deleteDraft(id)` using filter without mutating. Then add `clearPublished()` that keeps only drafts.

<details>
<summary>Solution</summary>

```jsx
function deleteDraft(id) {
  setDrafts(drafts.filter((d) => d.id !== id));
}

function clearPublished() {
  setDrafts(drafts.filter((d) => !d.published));
}
```

Why filter: returns a new array with matches removed. Original untouched, reference fresh.

Common mistake: `drafts.splice(i, 1); setDrafts(drafts)`. Splice mutates in place, reference same, render may not fire. Filter avoids the trap.

</details>

## Re-render rules and keeping them cheap

A component rerenders when:

1. Its own state changes
2. Its parent rerenders, even if props look same
3. Its props change to a new reference

```jsx
function BlogAdmin() {
  const [filter, setFilter] = useState("");

  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <DraftsList /> {/* rerenders on every keystroke too */}
    </div>
  );
}
```

Why child rerenders when parent types? React reruns the parent function, which recreates child element descriptors by default. Child function runs again unless memoized.

Two cheap fixes I use first:

1. Push state down. If only the search input needs `filter`, move `useState` into `SearchBar`, not the whole admin page.
2. Memoize heavy children with `memo` when props are stable. Details plus `useMemo` and `useCallback` land in post 08.

```jsx
// Push down: ExpensiveStats no longer rerenders on filter typing
function SearchBar() {
  const [filter, setFilter] = useState("");
  return <input value={filter} onChange={(e) => setFilter(e.target.value)} />;
}

function BlogAdmin() {
  return (
    <>
      <SearchBar />
      <ExpensiveStats />
    </>
  );
}
```

State shape tip for the blog admin: keep flat ids plus maps when lists grow, but start simple with arrays. I start with array of drafts, add `selectedId` string, add `query` string. Only split when filters lag.

```js
// Simple shape that scales to hundreds of drafts
const adminState = {
  drafts: [{ id: "a1", title: "Hello", published: false }],
  query: "hello",
  selectedId: "a1",
};
```

## Patterns I copy in every React file

**Props down, events up.** Parent owns drafts. Child gets `draft` plus `onToggle(id)`. Child never edits parent array directly. That one direction keeps bugs local.

**Controlled inputs for forms.** `value` plus `onChange` tied to state. Uncontrolled refs have their place for focus and file inputs, but forms that validate and submit are easier controlled. You get live validation and instant reset with `setTitle("")`.

**No derived state.** Filtered list, counts, selected object. Compute during render. Store only raw inputs. This kills a whole class of stale UI bugs.

**Small components with clear names.** `DraftCard`, `PublishButton`, `SearchBar`. Not `Item`, `Wrapper`, `Handler`. File search finds them, new teammates guess what they do.

**Colocate state.** Keep `title` input state inside the form, not the page. Lift only when two siblings truly share it. Lifting everything to App rerenders everything on each keystroke.

## Projects

### 1. Counter with guard rails

Build word count plus limit warning. This cements useState plus derived UI.

Requirements:

- State `words` starting at 0
- Buttons +50, -50, Reset
- Text red when over 1000, normal below
- Derived message: Draft, Long read, Too long, computed not stored

