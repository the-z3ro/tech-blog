---
title: "16 : State Libraries - Zustand, Jotai and Recoil for Blog State"
date: 2026-09-11T14:30:00+05:30
draft: false
tags: ["react", "zustand", "jotai", "recoil", "state"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 1600
description: "Global state with Zustand and Jotai, the atoms model with Recoil for older codebases, async state, and a decision tree for picking a tool."
aliases: ["/posts/13-state-libraries/", "/posts/state-libraries/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

Windows keeps shared settings in one place, and every program reads and writes them through rules. Global state libraries do that for your React app: one place, many readers, controlled writes. The question is which tool: Context, Zustand, Jotai, Recoil, or Redux.

This post gives you the two I would pick today, the older one you will meet in existing code, and a decision tree so you stop second guessing.

> **Where we are:** Routing and Context work. After this post you know which state tool to pick, and why.
>
> **Phase 01** · Real frontends · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** Zustand, Jotai, Recoil for older code, async state, a decision tree.  
> **Not today:** Redux, which gets its own post.
>
> **Time:** about 25 minutes to read, 50 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, say in one sentence why Context can cause extra re-renders.

<details>
<summary>Prereqs to run this file</summary>

- [The routing and Context post](../15-routing-and-context/) done, folder `blog-frontend`. Installs: `npm install zustand jotai`. For the Recoil section only: `npm install recoil`.
- Backend optional: the `/admin/stats` demo in Project 1 needs a tiny stub: `app.get("/admin/stats", (req, res) => res.json({ views: 1280, drafts: 4 }))`, or replace the fetch with local atoms.
- Recoil may warn about the peer React version. That is expected, it is archived.

</details>

## Part 1 of 4: Zustand and Jotai, the options teams pick today

Recoil, which this post covers further down, was archived by Meta in January 2025. You will still meet it in older code, so we keep it. But for new projects, two maintained libraries cover the same ground. We use the same demo for both: the blog admin counters, views and drafts.

### Zustand: one store, read it with a hook

```bash
npm install zustand
```

```jsx
// src/store.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useBlogStore = create(
  persist(
    (set) => ({
      views: 1280,
      drafts: 4,
      bumpViews: () => set((s) => ({ views: s.views + 1 })),
      reset: () => set({ views: 0, drafts: 0 }),
    }),
    { name: "blog-store" } // saves to localStorage under this key
  )
);
```

```jsx
// anywhere in your app, no Provider needed
import { useBlogStore } from "./store";

function ViewsBadge() {
  const views = useBlogStore((s) => s.views);
  return <span>{views} views</span>;
}

function BumpButton() {
  const bumpViews = useBlogStore((s) => s.bumpViews);
  return <button onClick={bumpViews}>+1 view</button>;
}
```

The selector `(s) => s.views` is the important bit. The component subscribes only to `views`, so changing `drafts` does not re-render it. That is the fix for the Context problem from [the routing and Context post](../15-routing-and-context/).

> Checkpoint: click the button and the badge updates. Refresh the page and the number is still there, because of `persist`.

### Jotai: tiny atoms you combine

```bash
npm install jotai
```

```jsx
import { atom, useAtomValue, useSetAtom } from "jotai";

const viewsAtom = atom(1280);
const draftsAtom = atom(4);
const totalAtom = atom((get) => get(viewsAtom) + get(draftsAtom)); // derived

function Total() {
  const total = useAtomValue(totalAtom);
  return <span>{total} total</span>;
}

function BumpButton() {
  const setViews = useSetAtom(viewsAtom);
  return <button onClick={() => setViews((v) => v + 1)}>+1 view</button>;
}
```

An **atom** is one small piece of state. A derived atom recomputes when the atoms it reads change. `useAtomValue` only reads, `useSetAtom` only writes, so a button that just writes never re-renders when the value changes.

How I choose between them: Zustand when I think "a store with actions" (it feels close to Redux). Jotai when I think "many small independent pieces" (it feels close to `useState`, shared).

> Checkpoint: you can say which of the two you would use for a theme toggle, and which for a form with twenty separate fields, and why.

## Part 2 of 4: Recoil, atoms for fine grained updates, in older codebases

**Recoil** gives global state in small units so components subscribe only to what they use. Change views, only views readers rerender. Theme toggle stays quiet.

Note on currency: Recoil pioneered this atoms model, but Meta archived the repository in January 2025, so it no longer gets updates and may warn about newer React versions. We keep it because you will meet it in older codebases and because the atoms idea transfers directly to Jotai, which you just saw. For new work, pick Zustand or Jotai.

```bash
npm install recoil
```

Core ideas:

```
Atom is a unit of state, like global useState
Selector derives from atoms, like a formula cell
```

Blog admin atoms, same shape as the old LinkedIn counts example but in our domain:

```jsx
// atoms.js
import { atom, selector } from "recoil";

export const draftsCountAtom = atom({
  key: "draftsCount",
  default: 4,
});

export const viewsCountAtom = atom({
  key: "viewsCount",
  default: 1280,
});

export const commentsCountAtom = atom({
  key: "commentsCount",
  default: 12,
});

export const totalActivitySelector = selector({
  key: "totalActivity",
  get: ({ get }) => {
    return get(draftsCountAtom) + get(viewsCountAtom) + get(commentsCountAtom);
  },
});
```

Hooks mirror `useState` but global:

```jsx
import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  RecoilRoot,
} from "recoil";

function ActivityBadge() {
  const total = useRecoilValue(totalActivitySelector);
  return <span>Total activity: {total}</span>;
}

function ViewsPanel() {
  const [views, setViews] = useRecoilState(viewsCountAtom);
  return (
    <div>
      Views: {views}
      <button onClick={() => setViews((v) => v + 1)}>+1 view</button>
    </div>
  );
}

function ResetComments() {
  const setComments = useSetRecoilState(commentsCountAtom);
  return <button onClick={() => setComments(0)}>Clear comments</button>;
}

function App() {
  return (
    <RecoilRoot>
      <ActivityBadge />
      <ViewsPanel />
      <ResetComments />
    </RecoilRoot>
  );
}
```

Why three hooks? `useRecoilValue` reads without subscribing to writes, `useSetRecoilState` writes without rerendering on value change. Handlers that only dispatch use the setter form to stay cheap.

Why `RecoilRoot` at top? It holds the atom store, like Provider for Redux or Context. Missing root gives a clear error about hooks outside the tree.

> Try it yourself: add a `publishedCount` atom plus a selector for unpublished = drafts minus published. Show both in a badge that updates only when those two change.

<details>
<summary>Solution</summary>

```jsx
import { atom, selector } from "recoil";

export const publishedCountAtom = atom({
  key: "publishedCount",
  default: 1,
});

export const unpublishedSelector = selector({
  key: "unpublished",
  get: ({ get }) => get(draftsCountAtom) - get(publishedCountAtom),
});
```

Why selector and not state: unpublished derives from two atoms. Storing it separately would drift when either source changes. Derive to stay correct.

Common mistake: duplicate `key` strings across atoms. Keys must be unique app wide. Copy pasted keys silently clash. Prefix with domain like `blog/draftsCount`.

</details>

> Checkpoint: you should see updating one atom re-render only the components that read it. Add logs to prove it.

## Part 3 of 4: Dynamic and async state with families and loadables

One atom per post breaks when you do not know post count upfront. **atomFamily** makes atoms on demand by id.

```jsx
import { atomFamily } from "recoil";

const postAtomFamily = atomFamily({
  key: "postById",
  default: (id) => ({ id, title: "", published: false }),
});

function DraftRow({ id }) {
  const [post, setPost] = useRecoilState(postAtomFamily(id));
  return (
    <div>
      <p>{post.title || id}</p>
      <button onClick={() => setPost({ ...post, published: true })}>
        Publish
      </button>
    </div>
  );
}
```

Why family over one big array atom? Editing one post rerenders only its row. Big array atom rerenders every row on any edit. Same fine grained win as atoms, now for collections.

**selectorFamily** fetches by id:

```jsx
import { selectorFamily } from "recoil";

const postFromServer = selectorFamily({
  key: "postFromServer",
  get: (id) => async () => {
    const res = await fetch(`http://localhost:3000/posts/${id}`);
    return res.json();
  },
});
```

Async needs loading and error UI. **Loadable** gives status without Suspense forced everywhere:

```jsx
import { useRecoilValueLoadable } from "recoil";

function PostDetail({ id }) {
  const loadable = useRecoilValueLoadable(postFromServer(id));

  if (loadable.state === "loading") return <p>Loading post...</p>;
  if (loadable.state === "hasError") return <p>Failed to load post</p>;
  return <h2>{loadable.contents.title}</h2>;
}
```

Async selector for initial admin stats, same shape as old notifications example but blog flavored:

```jsx
const adminStatsSelector = selector({
  key: "adminStats",
  get: async () => {
    const res = await fetch("http://localhost:3000/admin/stats");
    return res.json();
  },
});
```

Why loadable over try catch in component? Selector holds fetch, loadable holds status. Component stays UI only: loading branch, error branch, value branch. No effect code mixed with markup.

> Checkpoint: you should see switching the id load a new value while the old one stays cached.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Decision tree I actually use*.

## Part 4 of 4: Decision tree I actually use

```
Need shared state?
  Close together, parent plus kids?
    useState plus props
  Deep but rarely changes, like theme or the logged in author?
    Context API
  Many readers, frequent writes, need per piece updates?
    Small and quick: Zustand, or Jotai for many small pieces
    Large team, strict history and DevTools: Redux Toolkit (the Redux post)
  Server data with cache, retry, dedupe?
    SWR or TanStack Query, not a global store
```

In older codebases you will see Recoil in the third branch. The atoms idea is the same as Jotai, so reading Recoil code is not a new skill, just a different import.

## Patterns for shared state

**Fetch in selectors or query libs, not in render.** Render must stay pure. Side work lives in effects, families, or SWR. Components read results and branch on status.

**Select the smallest slice.** `useStore((s) => s.views)` re-renders only when `views` changes. Selecting the whole store brings the Context problem back.

**Keep server data out of your store.** A cache library like SWR knows about loading, retries and staleness. A global store does not, and you end up rewriting those.

## Solo rep: The activity header in Zustand

> **Level 3: Spec only.** You get a plain sentence of what to build. No code to look at. Docs are allowed after 10 minutes stuck. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

From this spec only: rebuild the blog activity header with Zustand. The store holds `views` and `drafts`, has `bumpViews` and `reset` actions, and a derived `total` shown in a badge. Two components read different pieces.

<details>
<summary>Check yourself, only after you try</summary>

```jsx
import { create } from "zustand";

const useStats = create((set) => ({
  views: 1280,
  drafts: 4,
  bumpViews: () => set((s) => ({ views: s.views + 1 })),
  reset: () => set({ views: 0, drafts: 0 }),
}));

function Views() {
  const views = useStats((s) => s.views);
  return <span>{views} views</span>;
}

function Total() {
  const total = useStats((s) => s.views + s.drafts);
  return <span>{total} total</span>;
}
```

</details>

## Projects

### 1. Blog activity header with atoms plus async stats

Recreate the old LinkedIn header challenge in blog words with sync plus async atoms.

Requirements:

- Atoms for drafts, views, comments with plus and minus buttons per section
- Selector total badge updating automatically
- Async selector fetching initial stats from `/admin/stats` with loadable UI
- Family for per post publish toggles without rerendering the whole list

> **Solo gate:** set a 15 minute timer and build this without opening the solution. Stuck at minute 10? Open only the first step, then close it and keep typing. Typing it yourself is the point.

<details>
<summary>Stuck? Solution, one step at a time</summary>

Steps are in order. Open only the one you are stuck on, then close it and type it yourself.

<details>
<summary>Step 1 of 4: import</summary>

```jsx
import {
  atom,
  selector,
  atomFamily,
  useRecoilState,
  useRecoilValue,
  useRecoilValueLoadable,
  RecoilRoot,
} from "recoil";

const draftsAtom = atom({ key: "blog/drafts", default: 4 });
const viewsAtom = atom({ key: "blog/views", default: 1280 });
const commentsAtom = atom({ key: "blog/comments", default: 12 });
```

</details>

<details>
<summary>Step 2 of 4: const totalSelector = selector(</summary>

```jsx
const totalSelector = selector({
  key: "blog/total",
  get: ({ get }) => get(draftsAtom) + get(viewsAtom) + get(commentsAtom),
});

const statsFromServer = selector({
  key: "blog/statsFromServer",
  get: async () => {
    const res = await fetch("http://localhost:3000/admin/stats");
    return res.json();
  },
});
```

</details>

<details>
<summary>Step 3 of 4: const postFamily = atomFamily(</summary>

```jsx
const postFamily = atomFamily({
  key: "blog/post",
  default: (id) => ({ id, published: false }),
});

function Header() {
  const total = useRecoilValue(totalSelector);
  const remote = useRecoilValueLoadable(statsFromServer);
  return (
    <div>
      <h2>Activity: {total}</h2>
      {remote.state === "loading" && <p>Syncing stats...</p>}
      {remote.state === "hasValue" && (
        <p>Server views: {remote.contents.views}</p>
      )}
    </div>
  );
}
```

</details>

<details>
<summary>Step 4 of 4: function Counter({ label, atomRef })</summary>

```jsx
function Counter({ label, atomRef }) {
  const [n, setN] = useRecoilState(atomRef);
  return (
    <div>
      {label}: {n}
      <button onClick={() => setN((v) => v + 1)}>+</button>
      <button onClick={() => setN((v) => Math.max(0, v - 1))}>-</button>
    </div>
  );
}

function App() {
  return (
    <RecoilRoot>
      <Header />
      <Counter label="Drafts" atomRef={draftsAtom} />
      <Counter label="Views" atomRef={viewsAtom} />
      <Counter label="Comments" atomRef={commentsAtom} />
    </RecoilRoot>
  );
}
```

</details>

Why family plus atoms plus async in one header: real admin badges mix local edits with server truth. Local atoms feel instant, async selector reconciles on load, family scales to many posts without widening renders.

Common mistake: fetching in component effect and writing to atoms in two places, causing double loads. Keep server read in the selector, components only consume the loadable.

</details>

## If lost / If bored

- If lost: Recoil peer dependency warnings with newer React are expected, use the Zustand or Jotai path. `useRecoilValue` outside `RecoilRoot` crashes, wrap the app. A 404 on `/admin/stats` means add the stub from the prereqs.
- If bored: do the solo rep: rebuild the same header in Zustand and compare how little code it takes.
- Keep for next: the Zustand store and the atoms idea. [The Tailwind post](../17-tailwind-axios-and-a-real-blog-frontend/) makes the frontend look like a product before Redux in [the Redux post](../18-redux-toolkit/).

## What breaks next

Your state is organized, and the app still looks like a ransom note. How does it start looking like a product?

[Where we are and what is next](../progress/)
