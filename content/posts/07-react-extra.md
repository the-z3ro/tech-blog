---
title: "07 React Extra"
date: 2026-03-13T23:42:32+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 7
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

# 07 : Routing, Prop Drilling, Context API & Recoil

> **Blog Summary:** Covers client-side routing for SPAs, solves the prop drilling problem with Context API, and introduces Recoil as a production-grade state management solution.

---

## 1. Routing in React

[SOURCE — COURSE MATERIAL]

### Jargon First

**Single Page Application (SPA):**

- Browser downloads ONE HTML file
- React controls what to show based on URL
- No full page reloads when navigating

**Client-Side Bundle:**

- All your React code compiled into JS files
- Browser downloads once, runs locally

**Client-Side Routing:**

- URL changes don't hit the server
- React intercepts and renders appropriate components

```
Traditional (Multi-Page):
  /home  → server returns home.html
  /about → server returns about.html (full reload)

React SPA (Single-Page):
  /home  → React shows <Home /> (no reload)
  /about → React shows <About /> (no reload, URL changes)
```

### React Router DOM

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
} from "react-router-dom";

// App.jsx — define routes
function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/user/123">User 123</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/user/:id" element={<UserPage />} />
        <Route path="*" element={<NotFound />} /> {/* catch-all */}
      </Routes>
    </BrowserRouter>
  );
}

// Accessing route params
import { useParams } from "react-router-dom";

function UserPage() {
  const { id } = useParams();
  return <h1>User ID: {id}</h1>;
}

// Programmatic navigation
function LoginForm() {
  const navigate = useNavigate();

  async function handleLogin() {
    await login();
    navigate("/dashboard"); // redirect after login
  }
}
```

### Lazy Loading Routes

```jsx
import { lazy, Suspense } from "react";

// Load component only when needed (code splitting)
const Dashboard = lazy(() => import("./Dashboard"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

---

## 2. Prop Drilling — The Problem

[SOURCE — COURSE MATERIAL]

Prop drilling = passing props through multiple component layers just to reach a deeply nested component.

```jsx
// Problem: theme and user must pass through every layer
function App() {
  const [user, setUser] = useState({ name: "Alice" });
  return <Layout user={user} />;
}

function Layout({ user }) {
  return <Sidebar user={user} />;
}

function Sidebar({ user }) {
  return <UserProfile user={user} />;
}

function UserProfile({ user }) {
  return <h2>{user.name}</h2>; // finally uses it
}
```

**Problems:**

- Intermediate components receive props they don't use
- Refactoring is painful — change in one place ripples everywhere
- Code becomes hard to read

[SOURCE — COURSE MATERIAL]

> "Prop drilling doesn't mean parent re-renders children. It's the syntactic uneasiness when writing code."

---

## 3. Context API — Teleport State

[SOURCE — COURSE MATERIAL]

Context lets you share state without prop drilling — any component can access it directly.

```jsx
import { createContext, useContext, useState } from "react";

// 1. Create context
const UserContext = createContext(null);

// 2. Provide it at the top level
function App() {
  const [user, setUser] = useState({ name: "Alice" });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Layout />
    </UserContext.Provider>
  );
}

// 3. Consume anywhere in the tree — no prop drilling!
function UserProfile() {
  const { user } = useContext(UserContext);
  return <h2>{user.name}</h2>;
}

// Intermediate components need NO changes
function Layout() {
  return <Sidebar />;
}
function Sidebar() {
  return <UserProfile />;
}
```

### Theme Context Example

```jsx
// theme-context.js
import { createContext, useContext, useState } from "react";

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

// In any component:
function Button() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      className={theme}
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
    >
      Toggle Theme
    </button>
  );
}
```

### Context Limitation

[SOURCE — COURSE MATERIAL]

Context solves prop drilling but **does NOT fix unnecessary re-renders**.

```jsx
// When Context value changes, ALL consumers re-render
// even if the part they use didn't change
const ctx = useContext(AppContext);
// If AppContext has { user, posts, theme } and only theme changed,
// components using only user STILL re-render
```

This is why Recoil (and Redux, Zustand) exist.

---

## 4. State Management with Recoil

[SOURCE — COURSE MATERIAL]

Recoil is a state management library that solves Context's re-render problem.

```bash
npm install recoil
```

### Core Concepts

```
Atom = unit of state (like useState but global)
Selector = derived state (computed from atoms)
```

### Atoms

```jsx
// atoms.js — define global state
import { atom } from "recoil";

export const networkCountAtom = atom({
  key: "networkCount", // unique key
  default: 102, // initial value
});

export const notificationCountAtom = atom({
  key: "notificationCount",
  default: 0,
});

export const jobsCountAtom = atom({
  key: "jobsCount",
  default: 3,
});
```

### Selectors — Derived State

```jsx
// Total notification count (sum of atoms)
import { selector } from "recoil";

export const totalNotificationsSelector = selector({
  key: "totalNotifications",
  get: ({ get }) => {
    const network = get(networkCountAtom);
    const notifications = get(notificationCountAtom);
    const jobs = get(jobsCountAtom);
    return network + notifications + jobs;
  },
});
```

### Recoil Hooks

```jsx
import {
  useRecoilState, // [value, setter] — like useState
  useRecoilValue, // just the value (read-only)
  useSetRecoilState, // just the setter (write-only)
} from "recoil";

function NotificationBadge() {
  const total = useRecoilValue(totalNotificationsSelector);
  return <span>{total}</span>;
}

function NotificationPanel() {
  const [count, setCount] = useRecoilState(notificationCountAtom);
  return (
    <div>
      Notifications: {count}
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}

// Write-only — useful in handlers that don't need current value
function MarkAllRead() {
  const setNotifications = useSetRecoilState(notificationCountAtom);
  return <button onClick={() => setNotifications(0)}>Mark all read</button>;
}
```

### RecoilRoot — Wrap Your App

```jsx
import { RecoilRoot } from "recoil";

function App() {
  return (
    <RecoilRoot>
      <AppBar />
      <Main />
    </RecoilRoot>
  );
}
```

---

## 5. Recoil Advanced — atomFamily & selectorFamily

[SOURCE — COURSE MATERIAL]

### The Problem with Multiple Atoms

```
TODO app: you need one atom per todo
But you don't know how many todos there are upfront
Creating atom1, atom2, atom3... manually doesn't work
```

### atomFamily — Dynamic Atoms

```jsx
import { atomFamily } from "recoil";

// Creates an atom factory — pass an ID, get an atom
const todoAtomFamily = atomFamily({
  key: "todo",
  default: (id) => ({
    id,
    title: "",
    completed: false,
  }),
});

// In component
function TodoItem({ id }) {
  const [todo, setTodo] = useRecoilState(todoAtomFamily(id));

  return (
    <div>
      <p>{todo.title}</p>
      <button onClick={() => setTodo({ ...todo, completed: true })}>
        Complete
      </button>
    </div>
  );
}
```

### selectorFamily — Dynamic Selectors

```jsx
import { selectorFamily } from "recoil";

// Fetch todo from server based on ID
const todoSelectorFamily = selectorFamily({
  key: "todoFromServer",
  get: (id) => async () => {
    const res = await fetch(`https://sum-server.100xdevs.com/todo?id=${id}`);
    const data = await res.json();
    return data.todo;
  },
});

// Usage in component
function TodoDetail({ id }) {
  const todo = useRecoilValue(todoSelectorFamily(id));
  return <div>{todo.title}</div>;
}
```

---

## 6. Recoil Loadable — Handling Async State

[SOURCE — COURSE MATERIAL]

When selectors fetch async data, components need to handle loading/error states.

```jsx
import { useRecoilValueLoadable } from "recoil";

function TodoDetail({ id }) {
  const loadable = useRecoilValueLoadable(todoSelectorFamily(id));

  if (loadable.state === "loading") {
    return <p>Loading...</p>;
  }

  if (loadable.state === "hasError") {
    return <p>Error: {loadable.contents.message}</p>;
  }

  // loadable.state === 'hasValue'
  const todo = loadable.contents;
  return <div>{todo.title}</div>;
}
```

### Asynchronous Selector (Fetches from Backend)

```jsx
const notificationsSelector = selector({
  key: "notifications",
  get: async () => {
    const res = await fetch("https://sum-server.100xdevs.com/notifications");
    const data = await res.json();
    return data;
  },
});
```

---

## 7. State Management: Decision Tree

[ADDED — EXPLANATION]

```
Need to share state between components?
│
├── Close in the tree (parent-child or siblings)?
│   └── Use useState + props
│
├── Deeply nested but simple?
│   └── Use Context API
│   (warning: causes all consumers to re-render)
│
└── Large app with frequent state changes?
    └── Use Recoil / Zustand / Redux
    ├── Recoil — atomic, fine-grained re-renders, selector support
    ├── Zustand — simpler API, less boilerplate
    └── Redux — most powerful, highest boilerplate, best devtools
```

---

## Exercises

### Quick (15 min)

Add React Router to a simple app with 3 pages: Home, About, Contact. Add a navigation bar.

**Hint 1:** Wrap with `<BrowserRouter>` and use `<Link>` (not `<a>`)  
**Hint 2:** 404 page: `<Route path="*" element={<NotFound />} />`

---

### Intermediate (45 min)

Build a dark/light theme toggle using Context API:

- Theme context with `light` or `dark` value
- All components consume it to apply correct styling
- One button anywhere in the app toggles the theme

---

### Challenge (3–4 hours)

Build a LinkedIn-style notification header using Recoil:

- Atoms for: network count, job alerts, messages, notifications
- Selector that sums all for the total badge count
- Each section has +/- buttons to change its own count
- Total badge updates automatically via selector
- Async selector fetches initial values from `https://sum-server.100xdevs.com/notifications`

---

## Common Confusions

| Confusion                                   | Reality                                                                                   |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| "Context fixes re-rendering"                | Context fixes prop drilling. Re-rendering is still an issue. Use Recoil/Zustand for that. |
| "useRecoilState is like useState for atoms" | Exactly right — same API, but global scope.                                               |
| "Selectors are like useEffect"              | No. Selectors derive values; useEffect performs side effects.                             |
| "`<Link>` and `<a>` do the same thing"      | `<a>` causes full page reload. `<Link>` does client-side navigation.                      |

---

## Key Takeaways

- React Router: wrap app in `<BrowserRouter>`, define `<Route>`s, use `<Link>` for navigation
- Prop drilling = syntactic pain, not a performance issue
- Context API: creates a teleport for state — `createContext → Provider → useContext`
- Context limitation: all consumers re-render when value changes
- Recoil: atoms (global state) + selectors (derived state) with fine-grained re-renders
- Use `atomFamily/selectorFamily` for dynamic collections (like todos with IDs)
- `useRecoilValueLoadable` handles async selectors with loading/error states
