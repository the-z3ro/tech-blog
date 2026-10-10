---
title: "14 : React Hooks in Depth - Effect, Memo, Callback and Ref"
date: 2026-09-04T14:00:00+05:30
draft: false
tags: ["react", "hooks", "useEffect", "performance"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 1400
description: "useEffect with fetch and cleanup, useMemo for expensive lists, useCallback with memo, and useRef for DOM and timers. Built on one blog search app."
aliases: ["/posts/08-react-hooks/", "/posts/11-react-hooks/", "/posts/react-hooks/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

Hooks feel like magic until you see the picture behind them: every render is a snapshot of your component, with its own props and state frozen inside. `useEffect` runs after that snapshot is on screen, and its cleanup runs before the next one. Almost every hooks bug comes from forgetting the snapshot idea.

We cover the hooks you will use daily (`useEffect`, `useMemo`, `useCallback`, `useRef`) and the mistakes that cost the most time.

> **Where we are:** Components and state. After this post effects, memos and refs are in your toolbox.
>
> **Phase 01** · React core · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** `useEffect`, cleanup, StrictMode, `useMemo`, `useCallback`, `useRef`.  
> **Not today:** Custom hooks and Context. Each gets its own post.
>
> **Time:** about 25 minutes to read, 60 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, write a component with a `count` state and a button that adds one, using the immutable pattern.

<details>
<summary>Prereqs to run this file</summary>

- [The React basics post](../13-react-basics/) done and the basics feel solid, folder `blog-frontend`. Lint helper `npm install -D eslint-plugin-react-hooks` to catch missing deps.
- Backend optional: `http://localhost:3000/posts` for fetch demos, with CORS enabled as shown in [the Express post](../07-node-http-and-express/). Without backend, use the local `fetchPosts()` timer fake from Project 1.
- Starter seed for Project 1: `const posts = Array.from({ length: 200 }, (_, i) => ({ id: i + 1, title: "Post " + (i + 1), views: (i * 37) % 500 }))`.

</details>

## Part 1 of 7: Hooks overview and the two rules

Hooks are functions starting with `use` that plug into React from function components.

```
useState     local UI state
useEffect    sync with outside world
useMemo      cache expensive results
useCallback  keep function identity stable
useRef       mutable box with no rerenders
useContext   shared values, covered in the DOM post
```

Two rules, no exceptions:

1. Call hooks at the top level only, never inside ifs or loops
2. Call them from React functions only, not plain JS helpers

Why order matters: React tracks hooks by call order. An early return that skips a hook shifts every hook after it, and state attaches to the wrong call. I lint this with `eslint-plugin-react-hooks` so the editor yells before the browser does.

Recap from [the React basics post](../13-react-basics/) in ten seconds: parent rerender reruns children by default. `memo` skips a child when props stay same. The three hooks below exist to keep those props stable or avoid recompute. If that sentence is fuzzy, reread the rerender section of [the React basics post](../13-react-basics/) first.

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

## Part 2 of 7: useEffect, syncing with the outside world

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

> Checkpoint: you should see the effect run after the first render, and run again only when a value in its dependency array changes.

## Part 3 of 7: StrictMode, and why your effect runs twice in development

Open your Vite project's `main.jsx`. The app is wrapped in `<StrictMode>`. In development, React deliberately mounts, unmounts and mounts each component once more, to expose effects that forgot to clean up. So this logs twice:

```jsx
useEffect(() => {
  console.log("effect ran");
}, []);
```

That is not a bug, and production runs it once. The rule to take away: **if your effect breaks when it runs twice, your cleanup is missing.** A fetch that creates duplicates, a timer that is never cleared, a listener that is never removed.

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch(url, { signal: ctrl.signal })
    .then((r) => r.json())
    .then(setData)
    .catch((e) => {
      if (e.name !== "AbortError") setError(e.message);
    });
  return () => ctrl.abort();
}, [url]);
```

> Checkpoint: the log prints twice with `npm run dev`, and once after `npm run build` then `npm run preview`.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *useMemo, skip repeat math on big lists*.

## Part 4 of 7: useMemo, skip repeat math on big lists

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

> Checkpoint: you should see typing in an unrelated input stop recomputing the filtered list. Add a log to prove it.

## Part 5 of 7: useCallback with memo, stable handlers for memo kids

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

> Checkpoint: you should see a memoized child skip re-rendering when the parent updates unrelated state.

## Part 6 of 7: useRef, a box that survives renders without causing them

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

> Checkpoint: you should see changing `ref.current` cause no re-render, while reading it later gives the new value.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Custom hooks teaser, full guide lives in [the custom hooks post](../19-custom-hooks/)*.

## Part 7 of 7: Custom hooks teaser, full guide lives in [the custom hooks post](../19-custom-hooks/)

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

  return { data, loading };
}
```

Why teaser only here? Full custom hooks with `useDebounce`, `useLocalStorage`, browser hooks, and SWR deserve their own post. That is [the custom hooks post](../19-custom-hooks/), the flagship of this stage. Here, just notice the pattern: state plus effect moves out, component keeps UI.

## Patterns that keep hooks fast and correct

**List every dep you read.** The exhaustive deps lint is right far more often than I am. Missing `query` or `postId` gives stale UI that looks correct on first load and wrong after interaction.

**Fetch in effects, compute in memos, store handles in refs.** Mixing jobs creates bugs: fetch in memo runs at wrong time, timers in state rerender too much, derived lists in state drift. One job per hook.

**Push state down before memoizing up.** A search query living in the page rerenders the whole admin on each key. Moving `query` into `SearchBox` fixes more than wrapping five children in memo.

**Cleanup everything you subscribe.** Intervals, timeouts, listeners, in flight fetches. Return a cleanup fn that undoes the setup. I review effects by reading setup plus cleanup as a pair. No pair, likely leak.

## Solo rep: A countdown with cleanup

> **Level 3: Spec only.** You get a plain sentence of what to build. No code to look at. Docs are allowed after 10 minutes stuck. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

From this spec only: a `Countdown` component that starts at a `seconds` prop, ticks down every second, stops at 0, and leaves no timer running when it unmounts.

<details>
<summary>Check yourself, only after you try</summary>

```jsx
import { useEffect, useState } from "react";

export default function Countdown({ seconds }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  return <p>{left > 0 ? `${left}s left` : "Done"}</p>;
}
```

</details>

## Projects

### 1. Blog search with memo and stable rows

Combine `useMemo` plus `memo` plus `useCallback` in one page. This is the performance trio working together.

Requirements:

- Props `posts` with 200 plus items, starter seed below generates them locally
- Search input filters by title with `useMemo` on `[posts, query]`
- Counter button that must not refilter or rerender rows
- Row component wrapped in `memo`, publish handler via `useCallback`
- Starter seed to paste above component: `const posts = Array.from({ length: 200 }, (_, i) => ({ id: i + 1, title: "Post " + (i + 1), views: (i * 37) % 500 }))`

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```jsx
import { useState, useMemo, useCallback, memo } from "react";

const Row = memo(function Row({ post, onPublish }) {
  return (
    <div>
      <span>{post.title}</span>
      <button onClick={() => onPublish(post.id)}>Publish</button>
    </div>
  );
});

function BlogAdmin({ posts }) {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(0);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return posts.filter((p) => p.title.toLowerCase().includes(q));
  }, [posts, query]);

  const publish = useCallback((id) => {
    console.log("publish", id);
  }, []);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Clicks {count}</button>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
      />
      {filtered.map((p) => (
        <Row key={p.id} post={p} onPublish={publish} />
      ))}
    </div>
  );
}
```

Why this proves the trio: counter clicks rerender parent but memo rows skip because `post` objects and `publish` ref stay stable. Typing recomputes filter once per query change, not per click.

Common mistake: inline arrow `onPublish={(id) => publish(id)}` in the map. That creates a new fn per row per render and defeats memo. Pass the stable `publish` directly.

</details>

### 2. Autosave draft with debounce via effect and ref

Save 800ms after typing stops, not on every key. Uses effect cleanup plus ref timer.

Requirements:

- Textarea state `text`
- Effect on `[text]` that sets timeout to fake save, clears prior timeout on cleanup
- Status line: Editing, Saving, Saved with timestamp
- Timer id stored in `useRef`, not state

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```jsx
import { useState, useEffect, useRef } from "react";

function AutosaveDraft() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Editing");
  const timer = useRef(null);

  useEffect(() => {
    setStatus("Editing");
    clearTimeout(timer.current);
    if (!text.trim()) return;
    setStatus("Saving...");
    timer.current = setTimeout(() => {
      console.log("saved:", text);
      setStatus(`Saved at ${new Date().toLocaleTimeString()}`);
    }, 800);
    return () => clearTimeout(timer.current);
  }, [text]);

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
      />
      <p>{status}</p>
    </div>
  );
}
```

Why cleanup clears first: fast typing cancels pending saves. Only the pause after the last key completes. That is debounce built from primitives.

Common mistake: storing timer in state. Each keystroke would set state for the timer, causing extra renders and tangled deps. Ref holds it silently.

</details>

### 3. Post detail with abort and prev id

Fetch one post by id with real cancel plus prev value display. Closest to production fetching here.

Requirements:

- Props `postId`
- Fetch on `[postId]` with `AbortController`, abort on cleanup
- Ignore `AbortError` in catch, show other errors
- Show current id plus previous id via `useRef` pattern

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```jsx
import { useState, useEffect, useRef } from "react";

function PostDetail({ postId }) {
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const prevId = useRef(postId);

  useEffect(() => {
    const ctrl = new AbortController();

    async function load() {
      setPost(null);
      setError("");
      try {
        const res = await fetch(`http://localhost:3000/posts/${postId}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setPost(await res.json());
        prevId.current = postId;
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message);
      }
    }

    load();
    return () => ctrl.abort();
  }, [postId]);

  if (error) return <p>Error: {error}</p>;
  if (!post)
    return (
      <p>
        Loading {postId} (prev {prevId.current})...
      </p>
    );
  return <h2>{post.title}</h2>;
}
```

Why abort over cancelled flag here: flag ignores late results, abort actually cancels network work. Fast clicking through posts stops piling requests.

Common mistake: setting `prevId` during render. That overwrites before UI can show the transition. Update after successful load inside the effect, as done here.

</details>

Next is routing plus shared state. Search page becomes `/search`, admin becomes `/admin`, drafts move into Context, then atoms when Context rerenders too much.

## If lost / If bored

- If lost: effect runs every render means missing dep array. Stale list after new posts means missing `posts` in `useMemo` deps. Leak warning means no cleanup return.
- If bored: skip to Project 1 search with memo plus stable rows, then Project 2 autosave debounce. Those two cover 80 percent of hook value.
- Keep for next: search plus counter app. [The routing and Context post](../15-routing-and-context/) routes this same page and shares its state.

## What breaks next

One page works. Real apps have many pages and values that many components need. How do they share?

[Where we are and what is next](../progress/)
