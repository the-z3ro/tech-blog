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

