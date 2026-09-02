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

Two rules, no exceptions:

1. Call hooks at the top level only, never inside ifs or loops
2. Call them from React functions only, not plain JS helpers

Why order matters: React tracks hooks by call order. An early return that skips a hook shifts every hook after it, and state attaches to the wrong call. I lint this with `eslint-plugin-react-hooks` so the editor yells before the browser does.

Recap from post 07 in ten seconds: parent rerender reruns children by default. `memo` skips a child when props stay same. The three hooks below exist to keep those props stable or avoid recompute. If that sentence is fuzzy, reread the rerender section of post 07 first.

> Try it yourself: spot the broken hook order in a component with an early return before `useEffect`. Fix by moving the return below all hooks.

<details>
<summary>Solution</summary>

```jsx
// Wrong: return before hook shifts order on some renders
function Search({ query }) {
  if (!query) return <p>Type to search</p>;
  const [results, setResults] = useState([]);
  useEffect(() => {
    setResults([]);
  }, [query]);
  return <p>{results.length}</p>;
}

// Right: hooks first, return after
function Search({ query }) {
  const [results, setResults] = useState([]);
  useEffect(() => {
    setResults([]);
  }, [query]);
  if (!query) return <p>Type to search</p>;
  return <p>{results.length}</p>;
}
```

Why: every render must call the same hooks in the same order. Conditions go inside effects or after all hook calls.

Common mistake: `useState` inside a loop to make dynamic fields. Use one state object or array instead, like `useState({})` keyed by field name.

</details>

## useEffect, syncing with the outside world

A **side effect** is anything outside the render: fetch posts, timers, manual DOM focus, event listeners.

I think of it like autosave in my blog editor. Typing is the render. Saving to the server happens on the side, from time to time, not on every keystroke.

```jsx
useEffect(() => {
  // run this after render when deps change
  return () => {
    // optional cleanup, runs before next run and on unmount
  };
}, [dep1, dep2]);
```

Dependency behavior I keep on a sticky note:

```jsx
// Once on mount, fetch blog list
useEffect(() => {
  loadPosts();
}, []);

// Every render, almost always a bug, avoid
useEffect(() => {
  console.log("rendered");
});

// On query change, search again
useEffect(() => {
  searchPosts(query);
}, [query]);
```

Why empty array means once? React compares deps between renders. Empty means nothing to watch, so it never reruns after mount. No array means no compare at all, so it runs after every render.

Blog list fetch with loading state:

```jsx
function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("http://localhost:3000/posts");
        const data = await res.json();
        if (!cancelled) {
          setPosts(data.posts || []);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Loading posts...</p>;
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

Why `cancelled` flag? If the user leaves the page before fetch finishes, `setPosts` would run on an unmounted component. Flag plus cleanup stops that update. Modern fetch can also use `AbortController`, same idea with real cancel.

Detail view that refetches on id change:

```jsx
function PostDetail({ postId }) {
  const [post, setPost] = useState(null);

  useEffect(() => {
    async function loadOne() {
      const res = await fetch(`http://localhost:3000/posts/${postId}`);
      const data = await res.json();
      setPost(data);
    }
    loadOne();
  }, [postId]);

  if (!post) return <p>Loading post...</p>;
  return <h2>{post.title}</h2>;
}
```

Why `[postId]` and not `[]`? With empty deps the first post sticks even after clicking another title. Listing the id tells React to refetch whenever selection changes.

Timer cleanup, the classic leak:

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setSeconds((s) => s + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);
```

Why functional update `setSeconds((s) => s + 1)`? Interval callback closes over old state. Functional form always gets the latest value instead of the stale one from first render.

> Try it yourself: build an auto increment seconds counter with cleanup. Then add a Start and Stop using a running flag in deps.

<details>
<summary>Solution</summary>

```jsx
function SecondsTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={() => setRunning(false)}>Stop</button>
      <button onClick={() => setRunning(true)}>Start</button>
    </div>
  );
}
```

Why dep on `running`: toggling restarts or clears the interval through the same effect. No separate start and stop functions touching timer ids outside React.

Common mistake: empty deps plus reading `running` inside. Effect sees only the first value and never stops. List every outside value you read, or the linter warning is telling the truth.

</details>

## useMemo, skip repeat math on big lists

Problem: every keystroke rerenders, and every rerender reruns expensive filters, even when the list did not change.

```jsx
// Slow: filters 5000 posts on every counter click too
function BlogSearch({ posts }) {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(0);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count}</button>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <p>{filtered.length} matches</p>
    </div>
  );
}
```

Fix with **useMemo**, recompute only when inputs change:

```jsx
import { useMemo } from "react";

function BlogSearch({ posts }) {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(0);

  const filtered = useMemo(() => {
    return posts.filter((p) =>
      p.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [posts, query]);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count}</button>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <p>{filtered.length} matches</p>
    </div>
  );
}
```

Why deps include both `posts` and `query`? Result depends on both. New posts from server must recompute even if query stayed same. Missing dep shows stale lists after refresh.

When I reach for it: filtered feeds, sorted tables, reading time totals, word counts over long content. When I skip it: tiny arrays under a hundred items. Memo has its own cost. Measuring once beats guessing.

> Try it yourself: memoize total views from a posts array so counter clicks do not resum. Deps should be posts only.

<details>
<summary>Solution</summary>

```jsx
const totalViews = useMemo(() => {
  return posts.reduce((s, p) => s + p.views, 0);
}, [posts]);
```

Why: total depends only on posts. Counter state excluded, so clicks reuse the cached sum.

Common mistake: memoizing fetch calls. `useMemo` is for sync compute. Data loading stays in `useEffect` with state, or a data hook like SWR.

</details>

## useCallback with memo, stable handlers for memo kids

New problem: functions recreate every render. A memo child sees a new prop each time and rerenders anyway.

```jsx
// Child memo cannot help, onPublish is new every render
function Admin({ drafts }) {
  const [count, setCount] = useState(0);

  function publish(id) {
    console.log("publish", id);
  }

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <DraftRow memo onPublish={publish} draft={drafts[0]} />
    </div>
  );
}
```

Fix with **useCallback**, same function reference across renders unless deps change:

```jsx
import { useCallback, memo } from "react";

function Admin({ drafts }) {
  const [count, setCount] = useState(0);

  const publish = useCallback((id) => {
    console.log("publish", id);
  }, []);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <MemoRow onPublish={publish} draft={drafts[0]} />
    </div>
  );
}

const MemoRow = memo(function MemoRow({ onPublish, draft }) {
  console.log("row rendered");
  return (
    <button onClick={() => onPublish(draft.id)}>Publish {draft.title}</button>
  );
});
```

Why empty deps here? `publish` uses no outside state, only its `id` arg, so it never needs a fresh copy. If it read `filter` state, I would list `[filter]`.

Rule I follow: `memo` for heavy rows and panels, `useCallback` for handlers passed to them. One without the other rarely helps. Memo without stable props still rerenders. Stable callback without memo has no one to skip.

## useRef, a box that survives renders without causing them

**useRef** holds `.current` across renders. Writing it never triggers render. Three uses cover almost everything.

1. Focus and measure DOM nodes directly:

```jsx
import { useRef } from "react";

function TitleInput() {
  const inputRef = useRef(null);

  function focus() {
    inputRef.current.focus();
  }

  return (
    <>
      <input ref={inputRef} placeholder="Post title" />
      <button onClick={focus}>Focus title</button>
    </>
  );
}
```

2. Keep previous value for compare:

```jsx
function ViewCount({ views }) {
  const prev = useRef(views);

  useEffect(() => {
    prev.current = views;
  }, [views]);

  return (
    <p>
      Now {views}, before {prev.current}
    </p>
  );
}
```

Why effect updates after render? During render `prev.current` still holds last value, so UI can show the change. Effect then stores current for next time.

3. Hold timer ids and other mutable handles:

```jsx
function Autosave({ text }) {
  const timer = useRef(null);

  function schedule() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      console.log("saving", text);
    }, 800);
  }

  return <button onClick={schedule}>Save draft</button>;
}
```

|                  | useState | useRef                         |
| ---------------- | -------- | ------------------------------ |
| Triggers render  | Yes      | No                             |
| Survives renders | Yes      | Yes                            |
| Use for          | UI state | DOM nodes, timers, prev values |

Why not state for timer ids? Every keystroke would rerender just to store a number the UI never shows. Ref holds it silently.

> Try it yourself: build a search input with a Focus button using useRef, plus a render count ref that shows how many times the component rendered without causing extra renders.

<details>
<summary>Solution</summary>

```jsx
function SearchWithStats() {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  const renders = useRef(0);
  renders.current++;

  return (
    <div>
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search posts"
      />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
      <p>Renders so far: {renders.current}</p>
    </div>
  );
}
```

Why increment during render is okay here for learning but avoid side effects in render in prod: this demo counts renders. Real writes to refs that affect behavior belong in effects or handlers.

Common mistake: reading `ref.current` right after setting state and expecting new DOM. State updates flush later. Read layout in `useEffect` after paint, not inline after set.

</details>

## Custom hooks teaser, full guide lives in post 09 of original series

When fetch plus loading repeats in three components, extract it. Name starts with `use`, calls other hooks inside.

```jsx
function usePosts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/posts")
      .then((r) => r.json())
      .then((d) => {
        setData(d.posts || []);
        setLoading(false);
      });
  }, []);

