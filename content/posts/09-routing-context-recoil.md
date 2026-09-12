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

function PostPage() {
  const { id } = useParams();
  return <h1>Post {id}</h1>;
}

function PublishBar() {
  const navigate = useNavigate();

  async function handlePublish() {
    await fakePublish();
    navigate("/admin");
  }

  return <button onClick={handlePublish}>Publish and go to admin</button>;
}
```

Why `Link` and not `a`? `a` reloads the page and loses state. `Link` updates URL and renders the route client side, keeping drafts, filters, and scroll where useful.

Why `*` route last? It catches unknown URLs for a real 404 page. Without it, typos render blank. I add it on day one now after shipping a blank page to friends once.

Lazy routes split the bundle so admin code loads only when visited:

```jsx
import { lazy, Suspense } from "react";

const Admin = lazy(() => import("./Admin"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading admin...</div>}>
        <Routes>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

Why lazy for admin and not home? Home loads first for everyone. Admin loads for few. Splitting keeps first paint fast. I keep home eager, heavy pages lazy.

> Try it yourself: add routes for Home, Admin, and Post detail with id param, plus a 404. Add a nav with Links, no anchors.

<details>
<summary>Solution</summary>

```jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h1>Home feed</h1>} />
        <Route path="/admin" element={<h1>Admin</h1>} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="*" element={<h1>404, post not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

function PostPage() {
  const { id } = useParams();
  return <h1>Post {id}</h1>;
}
```

Why separate PostPage: `useParams` only works inside a Route element. Reading id in App directly gives undefined.

Common mistake: `<a href="/admin">` inside SPA. Works but reloads, wipes state, refetches everything. Search for `href="/` in React code during review and swap to Link.

</details>

## Prop drilling, passing through layers that do not care

**Prop drilling** means threading props through middle components just to reach a deep child.

```jsx
function BlogApp() {
  const [author, setAuthor] = useState({ name: "eshan" });
  return <Layout author={author} />;
}

function Layout({ author }) {
  return <Sidebar author={author} />;
}

function Sidebar({ author }) {
  return <AuthorBadge author={author} />;
}

function AuthorBadge({ author }) {
  return <h2>{author.name}</h2>;
}
```

Layout and Sidebar never use author. They only forward it. Rename the field and you edit four files. Add a second field and you touch all four again.

Quote I kept from the course because it is accurate: prop drilling is syntactic pain, not always a perf bug. The code gets hard to move even when it runs fine.

## Context, teleport for shared values

**Context** lets any component read shared state without forwarding through middles.

```jsx
import { createContext, useContext, useState } from "react";

const AuthorContext = createContext(null);

function BlogApp() {
  const [author, setAuthor] = useState({ name: "eshan" });

  return (
    <AuthorContext.Provider value={{ author, setAuthor }}>
      <Layout />
    </AuthorContext.Provider>
  );
}

function AuthorBadge() {
  const { author } = useContext(AuthorContext);
  return <h2>{author.name}</h2>;
}

// Middles need no changes now
function Layout() {
  return <Sidebar />;
}
function Sidebar() {
  return <AuthorBadge />;
}
```

Theme toggle, the classic second example, now in blog words:

```jsx
const ThemeContext = createContext("light");

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeButton() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      className={theme}
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
    >
      Toggle theme, now {theme}
    </button>
  );
}
```

Why custom `useTheme` wrapper? One import for consumers, one place to add guards later like missing provider errors. I wrap every context this way now.

Limitation that forces the next step: when context value changes, **every consumer rerenders**, even ones using an untouched part. Blog context holding `{ drafts, views, theme }` rerenders views badges when theme toggles. Small apps never notice. Large admins do.

> Try it yourself: build theme context with light and dark, consume in two far apart components with no prop passing between.

<details>
<summary>Solution</summary>

Same shape as above: create context, provider with state at top, `useContext` in both leaves. Middles take no props.

Why it works: provider value flows directly to consumers regardless of depth. Add a third consumer anywhere without touching middles.

Common mistake: creating context inside a component. New context object every render breaks memo and confuses devtools. Define contexts at module top, outside components.

</details>

## Recoil, atoms for fine grained updates

**Recoil** gives global state in small units so components subscribe only to what they use. Change views, only views readers rerender. Theme toggle stays quiet.

Note on currency: Recoil pioneered this atoms model and still teaches it best, but the lib is quiet now. New teams often pick Zustand or Jotai, Redux Toolkit for large apps. I teach Recoil here because the mental model transfers, then show the Zustand swap in patterns. Concepts over lock in.

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

## Dynamic and async state with families and loadables

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

## Decision tree I actually use

```
Need shared state?
  Close together, parent plus kids?
    useState plus props
  Deep but rarely changes, like theme or author?
    Context API
  Many readers, frequent writes, need per piece updates?
    Atoms lib: Recoil for learning, Zustand or Redux in prod
  Server data with cache, retry, dedupe?
    SWR or TanStack Query, not plain atoms
```

Zustand swap in 20 lines for teams skipping Recoil:

```jsx
import { create } from "zustand";

const useBlogStore = create((set) => ({
  drafts: 4,
  views: 1280,
  bumpViews: () => set((s) => ({ views: s.views + 1 })),
  reset: () => set({ drafts: 0, views: 0 }),
}));

function Badge() {
  const views = useBlogStore((s) => s.views);
  return <span>{views}</span>;
}
```

Why mention both? Hiring reality from post 08 of the original series still holds: many codebases run Redux Toolkit. New smaller apps pick Zustand for less boilerplate. Learn atoms here, ship either at work without relearning the model.

## Patterns for routed stateful apps

**URLs for shareable state, atoms for ephemeral UI.** Post id, tab, page number belong in the URL so refresh and share work. Draft text, hover, open menus stay in state. I review every `useState` and ask if refresh should keep it. If yes, move to search params or route.

**One provider per concern.** Theme provider, author provider, store root. Giant single context object brings back the rerender problem Context was meant to solve. Split by update frequency: slow user data apart from fast filter text.

**Fetch in selectors or query libs, not in render.** Render must stay pure. Side work lives in effects, families, or SWR. Components read results and branch on status.

**Colocate routes with their data needs.** `/posts/:id` route renders `PostDetail` that owns its family fetch. Parent does not preload everything for all routes. Each route loads what it shows, shows skeleton meanwhile.

## Projects

### 1. Blog router with three pages plus 404

Wire Home, Admin, Post detail with real params and nav. This locks in router basics.

Requirements:

- `BrowserRouter` with nav Links, no anchors
- Routes `/`, `/admin`, `/posts/:id`, `*` for 404
- Post page reads id via `useParams` and fetches that post with loading state
- After fake publish, `useNavigate` back to admin

<details>
<summary>Solution with explanation</summary>

```jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";

function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/posts/${id}`)
      .then((r) => r.json())
      .then(setPost);
  }, [id]);

  if (!post) return <p>Loading {id}...</p>;
  return <h1>{post.title}</h1>;
}

function Admin() {
  const navigate = useNavigate();
  return <button onClick={() => navigate("/")}>Back home</button>;
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h1>Feed</h1>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
```

Why effect dep `[id]`: clicking from post A to post B reuses the same component. Without the dep, old post sticks. Param change must retrigger fetch.

Common mistake: reading params outside a Route element. Hooks like `useParams` need router context. Call them only inside components rendered by Routes.

</details>

### 2. Theme plus author with Context, no drilling

Replace a drilled blog header with two contexts. Proves teleport without rerender tricks yet.

Requirements:

- `ThemeProvider` with light and dark plus toggle
- `AuthorProvider` with author object plus login stub
- Header, Sidebar, Badge consume directly, middles take zero props
- Toggle button anywhere flips theme for all consumers

<details>
<summary>Solution with explanation</summary>

```jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);
const AuthorContext = createContext(null);

function App() {
  const [theme, setTheme] = useState("light");
  const [author] = useState({ name: "eshan" });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <AuthorContext.Provider value={{ author }}>
        <Layout />
      </AuthorContext.Provider>
    </ThemeContext.Provider>
  );
}

function Layout() {
  return <Sidebar />;
}
function Sidebar() {
  return <Header />;
}
function Header() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { author } = useContext(AuthorContext);
  return (
    <div className={theme}>
      <h1>{author.name}</h1>
      <button
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      >
        Toggle
      </button>
    </div>
  );
}
```

Why two providers not one object: theme toggles often, author rarely. Split avoids author readers rerendering on theme flips. Same split by frequency rule from patterns.

Common mistake: value object recreated each render causing all consumers to rerender even when fields equal. For hot paths, memoize value with `useMemo` or split contexts as done here.

</details>

### 3. Blog activity header with atoms plus async stats

Recreate the old LinkedIn header challenge in blog words with sync plus async atoms.

Requirements:

- Atoms for drafts, views, comments with plus and minus buttons per section
- Selector total badge updating automatically
- Async selector fetching initial stats from `/admin/stats` with loadable UI
- Family for per post publish toggles without rerendering the whole list

<details>
<summary>Solution with explanation</summary>

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

Why family plus atoms plus async in one header: real admin badges mix local edits with server truth. Local atoms feel instant, async selector reconciles on load, family scales to many posts without widening renders.

Common mistake: fetching in component effect and writing to atoms in two places, causing double loads. Keep server read in the selector, components only consume the loadable.

</details>

That closes the 01 to 09 rebuild. Same knowledge as the original seven, now split so each file owns one job, examples share one blog, and voice matches your 08 to 10 tone. The original 08 Redux, 09 hooks, and 10 TypeScript posts plug straight after this as 10 to 12 with only nav links to add.

## If lost / If bored

- If lost: blank route means missing `BrowserRouter` wrapper or `*` catch placed first. `useParams` undefined means called outside a Route element. 404 on `/admin/stats` means add the stub from Prereqs.
- If bored: skip to Project 3 activity header, it shows atoms plus async plus families in one real badge.
- Keep for next: router plus atoms mental model. Original Redux, hooks deep dive, and TypeScript posts plug after as 10 to 12.
