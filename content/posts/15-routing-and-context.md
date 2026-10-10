---
title: "15 : Routing and Context - Share Blog State Without Drilling"
date: 2026-09-11T14:30:00+05:30
draft: false
tags: ["react", "router", "context", "state"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 1500
description: "React Router for real URLs, the prop drilling problem, and Context for shared values like theme and author. Built on the blog admin."
aliases: ["/posts/09-routing-context-recoil/", "/posts/12-routing-context/", "/posts/routing-context/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

On Windows 7 I spent hours exploring the folder tree of my PC, corner by corner. A URL is the same idea: a path to a place. Routing maps each path to a component, and Context solves the next problem: how components that are far apart share one value without passing it through every layer in between.

We build both on the blog admin: pages for posts and drafts, and a theme and author that every page can read.

> **Where we are:** One working page. After this post you have several pages with shared state.
>
> **Phase 01** · Real frontends · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** React Router, prop drilling, and Context.  
> **Not today:** Global state libraries, which come next.
>
> **Time:** about 20 minutes to read, 55 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, write a `useEffect` that fetches data and cleans up with an `AbortController`.

<details>
<summary>Prereqs to run this file</summary>

- [The hooks post](../14-react-hooks-in-depth/) done and hooks feel solid, folder `blog-frontend`. Install: `npm install react-router-dom`.
- Backend optional: the post list from `http://localhost:3000/posts` works. Without it, use local arrays.

</details>

## Part 1 of 3: Routing, URLs without reloads

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

> Checkpoint: you should see a click on a link change the URL and the content without a full reload, and an unknown URL show your 404.

## Part 2 of 3: Prop drilling, passing through layers that do not care

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

## Part 3 of 3: Context, teleport for shared values

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

> Checkpoint: you should see a component deep in the tree read the theme without any props passed to it.

## Patterns for routed, shared state

**URLs for shareable state, atoms for ephemeral UI.** Post id, tab, page number belong in the URL so refresh and share work. Draft text, hover, open menus stay in state. I review every `useState` and ask if refresh should keep it. If yes, move to search params or route.

**One provider per concern.** Theme provider, author provider, store root. Giant single context object brings back the rerender problem Context was meant to solve. Split by update frequency: slow user data apart from fast filter text.

**Colocate routes with their data needs.** `/posts/:id` route renders `PostDetail` that owns its family fetch. Parent does not preload everything for all routes. Each route loads what it shows, shows skeleton meanwhile.

## Solo rep: Three routes and a theme

> **Level 3: Spec only.** You get a plain sentence of what to build. No code to look at. Docs are allowed after 10 minutes stuck. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

From this spec only: three routes (`/`, `/about`, and a catch all 404) with a nav bar, and a `ThemeContext` with a toggle that any page can read. No copying from the post.

<details>
<summary>Check yourself, only after you try</summary>

Check yourself:

- `BrowserRouter` wraps the app, and `*` is the last route
- Links use `Link`, not `<a href>`
- The context provider wraps the routes
- A component on `/about` reads the theme with `useContext`

</details>

## Projects

### 1. Blog router with three pages plus 404

Wire Home, Admin, Post detail with real params and nav. This locks in router basics.

Requirements:

- `BrowserRouter` with nav Links, no anchors
- Routes `/`, `/admin`, `/posts/:id`, `*` for 404
- Post page reads id via `useParams` and fetches that post with loading state
- After fake publish, `useNavigate` back to admin

> **Solo gate:** set a 15 minute timer and build this without opening the solution. Stuck at minute 10? Open only the first step, then close it and keep typing. Typing it yourself is the point.

<details>
<summary>Stuck? Solution, one step at a time</summary>

Steps are in order. Open only the one you are stuck on, then close it and type it yourself.

<details>
<summary>Step 1 of 2: import</summary>

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
```

</details>

<details>
<summary>Step 2 of 2: function Admin()</summary>

```jsx
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

</details>

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

> **Solo gate:** set a 15 minute timer and build this without opening the solution. Stuck at minute 10? Open only the first step, then close it and keep typing. Typing it yourself is the point.

<details>
<summary>Stuck? Solution, one step at a time</summary>

Steps are in order. Open only the one you are stuck on, then close it and type it yourself.

<details>
<summary>Step 1 of 2: import { createContext, useContext, useState } from &quot;react&quot;;</summary>

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
```

</details>

<details>
<summary>Step 2 of 2: function Layout()</summary>

```jsx
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

</details>

Why two providers not one object: theme toggles often, author rarely. Split avoids author readers rerendering on theme flips. Same split by frequency rule from patterns.

Common mistake: value object recreated each render causing all consumers to rerender even when fields equal. For hot paths, memoize value with `useMemo` or split contexts as done here.

</details>

## If lost / If bored

- If lost: a blank route means a missing `BrowserRouter` wrapper or the `*` catch placed first. `useParams` returning undefined means it was called outside a `Route` element.
- If bored: jump to Project 2, theme plus author with Context, and feel prop drilling disappear.
- Keep for next: the router setup and your Context providers. [The state libraries post](../16-state-libraries/) compares the tools for sharing state at scale.

## What breaks next

Context shares values, but it re-renders more than it should. What are the alternatives?

[Where we are and what is next](../progress/)
