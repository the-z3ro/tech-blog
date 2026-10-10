---
title: "17 : Tailwind, Axios and a Real Blog Frontend - Make It Look Like a Product"
date: 2026-10-06T10:00:00+05:30
draft: false
tags: ["tailwind", "axios", "react", "frontend"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 1700
description: "Set up Tailwind v4 with Vite, learn the classes that matter, swap fetch for Axios, and build a responsive blog frontend with login and publish."
aliases: ["/posts/14-tailwind-axios-frontend/", "/posts/tailwind-axios-frontend/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

In photo editors I never retyped numbers for every image. I used presets: one click, a consistent look. Tailwind is presets for CSS: `p-4`, `text-lg`, `rounded-xl`. You describe the look on the element, and you never name a class again.

This post is the bridge between "it works" and "it looks like a product": Tailwind, Axios, and a real blog frontend with login and publishing.

> **Where we are:** Working state, but plain styling. After this post it looks like a product and has a real login flow.
>
> **Phase 01** · Real frontends · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** Tailwind basics, responsive and dark mode, Axios, a real blog frontend.  
> **Not today:** Component libraries and design systems. We style by hand first.
>
> **Time:** about 20 minutes to read, 60 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, write a `useEffect` that fetches the posts list once and stores it in state.

<details>
<summary>Prereqs to run this file</summary>

- Your backend from [the MongoDB post](../11-mongodb-and-mongoose/) running on `http://localhost:3000` with `cors()` enabled, and `POST /signup`, `POST /signin`, `GET /posts`, `POST /posts` working.
- Node 22 or 24 LTS. A fresh frontend folder: `npm create vite@latest blog-frontend -- --template react`, then `cd blog-frontend && npm install`.
- A few posts in your database. Add them with `curl` if the list is empty.

</details>

## Part 1 of 6: Why Tailwind, in one honest paragraph

Normal CSS makes you invent names (`.card-wrapper-inner`) and jump between files. Tailwind gives you tiny single purpose classes, like `p-4` for padding or `text-lg` for font size, and you describe the look right on the element. No naming, no hunting, no dead CSS that nobody dares delete.

The honest trade-off: class lists get long. We solve that the React way, by turning a styled thing into a component once and reusing it. You will see this in a minute.

## Part 2 of 6: Setup in three steps

Tailwind v4 made setup short. Inside `blog-frontend`:

```bash
npm install tailwindcss @tailwindcss/vite axios
```

Add the plugin to `vite.config.js`:

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Replace everything in `src/index.css` with one line, and make sure `main.jsx` imports it:

```css
/* src/index.css */
@import "tailwindcss";
```

Run `npm run dev` and put this in `App.jsx` to test:

```jsx
export default function App() {
  return <h1 className="text-3xl font-bold text-blue-700">Tailwind is alive</h1>;
}
```

> Checkpoint: a big bold blue heading. If the text is plain black, the CSS file is not imported in `main.jsx`, or the dev server needs a restart.

## Part 3 of 6: The dozen classes that cover most pages

You do not need to memorize hundreds. These cover most real layouts:

| Job | Classes | Reads as |
| --- | ------- | -------- |
| Spacing inside | `p-4`, `px-6`, `py-2` | padding all, sides, top and bottom |
| Spacing outside | `m-4`, `mt-2`, `gap-4` | margin, margin top, gap between children |
| Layout row | `flex items-center justify-between` | children in a row, centered, spread apart |
| Layout grid | `grid grid-cols-3 gap-4` | three equal columns |
| Text | `text-lg font-semibold text-slate-700` | size, weight, color |
| Surface | `bg-white rounded-xl border shadow-sm` | background, rounded corners, outline, soft shadow |
| Size | `w-full max-w-3xl mx-auto` | full width up to a limit, centered |
| States | `hover:bg-blue-700 focus:ring-2` | styles that only apply on hover or focus |

The number scale is consistent: `4` means 1rem (16px), `2` is half of that, `8` is double. Once you feel that, you stop looking things up.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Responsive and dark mode, almost free*.

## Part 4 of 6: Responsive and dark mode, almost free

Tailwind is **mobile first**. Plain classes apply everywhere. Prefixes like `md:` apply from that screen width upward.

```jsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
```

One column on phones, two from tablet width, three on desktop. That single line replaces a whole media query block.

Dark mode works the same way with a `dark:` prefix. To control it with a toggle (instead of the system setting), add one line to your CSS:

```css
/* src/index.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Now `dark:bg-slate-800` applies whenever an ancestor has the class `dark`, for example on `<html>`.

> Try it yourself: make a card that is white on light mode and dark slate on dark mode. Test it by adding `dark` as a class on the `<html>` tag in DevTools.

<details>
<summary>Solution</summary>

```jsx
<div className="rounded-xl bg-white p-5 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
  Hello card
</div>
```

Why: every light value gets a `dark:` partner. Both are always present, the browser picks the right one.

Common mistake: only setting `dark:bg-...` and forgetting `dark:text-...`. You get dark text on a dark card and think the card disappeared.

</details>

## Part 5 of 6: Axios vs fetch: same job, different defaults

Both make HTTP requests. They differ in what they do for you.

| | `fetch` | `axios` |
| -- | ------- | ------- |
| Install | built in | `npm install axios` |
| JSON body | `JSON.stringify` and a header by hand | pass an object, done |
| Reading the response | `await res.json()` | already in `res.data` |
| Non 2xx status | does **not** throw, check `res.ok` | **throws**, caught in `catch` |
| Shared setup (base URL, token) | write a wrapper yourself | `axios.create` plus interceptors |

The same login request, both ways:

```js
// fetch
const res = await fetch("http://localhost:3000/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});
if (!res.ok) throw new Error("Login failed");
const data = await res.json();

// axios
const { data } = await axios.post("http://localhost:3000/signin", { username, password });
```

Why does that "throws" row matter so much? With `fetch`, a 401 looks like a success until you remember to check `res.ok`. With Axios, a 401 jumps straight to `catch`, and the server's message is in `err.response.data`. Fewer silent failures.

We will use Axios in the series from here on, but know `fetch` well. Plenty of code you read will use it.

## Part 6 of 6: Build: the blog feed

Make one small file that owns all backend talk. Components never know the URL or the token.

```js
// src/api.js
import axios from "axios";

let token = "";
export const setToken = (t) => {
  token = t;
};

const api = axios.create({ baseURL: "http://localhost:3000" });

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getPosts = () => api.get("/posts").then((r) => r.data.posts);
export const signin = (username, password) =>
  api.post("/signin", { username, password }).then((r) => r.data.token);
export const createPost = (title, content) =>
  api.post("/posts", { title, content }).then((r) => r.data);
```

An **interceptor** is a function Axios runs on every request. Ours attaches the `Bearer` token if one exists, so you never write that header again.

Now the card. This is where the long class list lives, once:

```jsx
// src/PostCard.jsx
export default function PostCard({ post }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {post.title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {post.content.slice(0, 120)}
      </p>
    </article>
  );
}
```

And the list, with loading and error states, because real users always meet both:

```jsx
// src/PostList.jsx
import { useEffect, useState } from "react";
import { getPosts } from "./api";
import PostCard from "./PostCard";

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading posts...</p>;
  if (error)
    return <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <PostCard key={p._id || p.id} post={p} />
      ))}
    </div>
  );
}
```

```jsx
// src/App.jsx
import PostList from "./PostList";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <h1 className="mx-auto max-w-5xl text-xl font-bold">Blog Platform</h1>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <PostList />
      </main>
    </div>
  );
}
```

> Checkpoint: a header and a grid of post cards that reflow when you resize the window. Stop the backend and refresh: you should see a red error box instead of a blank page. That red box is the difference between a demo and an app.

## Patterns I follow with Tailwind

- **Turn repeated class lists into a component,** not into a pile of custom CSS. `PostCard` above is the whole technique.
- **Style mobile first,** then add `md:` and `lg:` only where the layout needs to change.
- **Use the spacing scale,** never random pixel values. Consistent spacing is most of what "looks designed" means.
- **One `api.js`,** one place for URLs and tokens. Components just call `getPosts()`.
- **Always render the loading and error states** before you celebrate the happy path.

## Solo rep: Blank page: the post card and grid

> **Level 4: Blank page.** One line of goal, an empty file, and your own plan. Docs allowed, copy paste never. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

One line of goal: a responsive grid of post cards with a title, a two line excerpt, a hover shadow, and dark mode. Start from an empty file. Do not copy class names from the post. Docs are allowed after 10 minutes stuck.

When you finish, explain your approach in two sentences, out loud or in a note. If you cannot explain it, you do not own it yet.

## Projects

### 1. Login and publish from the browser

Add a login form and a create post form. After login, keep the token in `api.js` memory. Publishing a post should refresh the list.

Requirements:

- A `LoginForm` with username, password, a Tailwind styled button, and an error message on a failed login
- A `NewPostForm` that is visible only after login and calls `createPost`
- After a successful publish, the list shows the new post without a page reload

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```jsx
// src/LoginForm.jsx
import { useState } from "react";
import { signin, setToken } from "./api";

export default function LoginForm({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = await signin(username, password);
      setToken(token);
      onLoggedIn();
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-center gap-2">
      <input
        className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
        Sign in
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </form>
  );
}
```

```jsx
// src/NewPostForm.jsx
import { useState } from "react";
import { createPost } from "./api";

export default function NewPostForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    await createPost(title, content);
    setTitle("");
    setContent("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 grid gap-2">
      <input
        className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
        placeholder="Title (5+ characters)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
        placeholder="Content (20+ characters)"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button className="w-fit rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
        Publish
      </button>
    </form>
  );
}
```

In `App.jsx`, hold `loggedIn` and a `refreshKey` in state. Show `LoginForm` when logged out and `NewPostForm` when logged in. Pass `key={refreshKey}` to `PostList` and bump `refreshKey` in `onCreated`, which remounts the list and refetches.

Why the key trick: changing `key` makes React throw away the old component and start a fresh one, which reruns its fetch effect. It is the simplest refetch for now. [The custom hooks post](../19-custom-hooks/) introduces SWR, which handles refetching for you.

Common mistake: calling `setToken` but forgetting the interceptor reads it on every request. If you store the token in component state instead, `api.js` never sees it and every publish returns 401.

</details>

### 2. Dark mode toggle

Add a button in the header that toggles the `dark` class on `document.documentElement`, and remembers the choice in `localStorage`.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```jsx
import { useEffect, useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-600"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}
```

Why the lazy initial state: reading `localStorage` inside `useState(() => ...)` runs it once on first render, so the page does not flash light then dark.

Common mistake: forgetting the `@custom-variant dark` line in your CSS. Then `dark:` classes follow the system setting and your button appears to do nothing.

</details>

### 3. Solo build: the author profile card

No solution this time. Using only the table in this post and the docs if you get stuck for ten minutes, build a responsive `AuthorCard` that shows an avatar circle with the author's initial, the username, a post count, and a "Follow" button with hover and focus styles. One column on phones, two cards side by side from `md`.

If you are blank, the first line is `<div className="flex items-center gap-4 rounded-xl border p-4">`. Build outward from there.

## Cheat sheet

- Install: `npm install tailwindcss @tailwindcss/vite axios`
- CSS: `@import "tailwindcss";`
- Spacing: `p-4 px-6 mt-2 gap-4`, layout: `flex items-center justify-between`, `grid md:grid-cols-2`
- Surface: `rounded-xl border bg-white shadow-sm`, states: `hover:` `focus:` `dark:`
- Mobile first: plain classes everywhere, `md:` and `lg:` add changes upward
- Dark toggle needs `@custom-variant dark (&:where(.dark, .dark *));`
- Axios: `axios.create({ baseURL })`, data is in `res.data`, non 2xx throws
- Interceptor attaches the `Bearer` token once, for every request

## If lost / If bored

- If lost: no styles at all means the CSS import is missing in `main.jsx`. A network error in the console means the backend is down or `cors()` is missing. `401` on publish means the token never reached `api.js`.
- If bored: jump to Project 3 and build it with no copy paste. Typing the class names yourself is how they stick.
- Keep for next: the `blog-frontend` project with `api.js`, `PostCard`, and the login flow. [The Redux post](../18-redux-toolkit/) uses the same app to compare Redux against the state tools you already know.

## What breaks next

It looks real now. As the app grows, so does the state. What do large teams use?

[Where we are and what is next](../progress/)
