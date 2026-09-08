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

