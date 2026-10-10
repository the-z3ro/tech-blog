---
title: "18 : Redux Toolkit - Global State You Will Meet at Work"
date: 2026-10-06T10:00:00+05:30
draft: false
tags: ["redux", "react", "state"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 1800
description: "Store, slices, selectors and async thunks with Redux Toolkit on the blog frontend, plus DevTools and when Redux is worth it."
aliases: ["/posts/10-react-redux/", "/posts/15-react-redux/", "/posts/react-redux/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

Windows keeps an Event Viewer: a log of everything that happened on the system, in order, so when something breaks you can read what happened. Redux gives your app the same thing. Every change to state is an **action** in a log, and the log can be replayed.

You may or may not pick Redux for your own projects, but you will read it at work, so we learn it properly on the blog frontend, including async data.

> **Where we are:** A styled frontend. After this post it has a global store.
>
> **Phase 01** · Real frontends · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** store, slices, selectors, async thunks, DevTools.  
> **Not today:** RTK Query in depth. We only touch the idea.
>
> **Time:** about 20 minutes to read, 50 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, name the three pieces of the Redux loop. Then check them against the post.

<details>
<summary>Prereqs to run this file</summary>

- The `blog-frontend` project from [the Tailwind post](../17-tailwind-axios-and-a-real-blog-frontend/), with `api.js`, `PostCard`, and `PostList` working against your backend.
- Install: `npm install @reduxjs/toolkit react-redux`
- Redux DevTools browser extension (Chrome or Edge). We use it in the last section.

</details>

## Part 1 of 7: Why Redux when we already have Context and Zustand?

Fair question. Here is the honest comparison.

- **Context** passes values deep without drilling, but it is not a state tool. When the value changes, every component reading that context re-renders.
- **Zustand and Jotai** ([the state libraries post](../16-state-libraries/)) are small and quick. Great for most apps.
- **Redux** is more ceremony, and in return you get strict one way data flow, a full log of every change, and time travel debugging. In a large app with many developers, that predictability is the product.

The practical reason to learn it: a lot of existing React code uses Redux Toolkit. Reading it fluently is a career skill, even if your next side project uses something lighter.

## Part 2 of 7: A quick history so the names make sense

Facebook introduced **Flux**, a one way data flow with multiple stores. Dan Abramov and Andrew Clark simplified it into **Redux** in 2015 with one rule: the whole app state lives in a single object, called the **store**.

Original Redux needed a lot of boilerplate: action type constants, action creators, switch statements, hand copied state, extra libraries for async. People got tired of it.

**Redux Toolkit (RTK)** is the fix, and it is now the official way to write Redux. It removes the boilerplate, sets up DevTools for you, and includes **Immer**, which lets you write `state.items.push(x)` and safely turns it into an immutable update behind the scenes.

## Part 3 of 7: The mental model in three pieces

1. **Store:** one object holding the state of the whole frontend.
2. **Slice and reducers:** a slice is one feature's state plus the only functions allowed to change it. You never edit the store directly, you ask a reducer.
3. **Dispatch and selectors:** `dispatch` sends a request to change state (an **action**). A **selector** reads a piece of state.

The loop is always: user clicks, component dispatches an action, reducer updates state, components that selected that state re-render.

Is Redux a React thing? No. It is a standalone library, and `react-redux` is the bridge. That is why you install both.

> Checkpoint: say the loop out loud without looking: click, dispatch, reducer, new state, re-render. If you can, the rest of the post is just details.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Build 1: the store and a slice (saved posts)*.

## Part 4 of 7: Build 1: the store and a slice (saved posts)

We will add a "Save for later" feature. First, the store, which starts empty:

```js
// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {},
});
```

`configureStore` creates the store and wires up Redux DevTools automatically.

Now a slice for saved posts:

```js
// src/features/saved/savedSlice.js
import { createSlice } from "@reduxjs/toolkit";

const savedSlice = createSlice({
  name: "saved",
  initialState: { ids: [] },
  reducers: {
    toggleSaved: (state, action) => {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((x) => x !== id);
      } else {
        state.ids.push(id); // looks like mutation, Immer makes it safe
      }
    },
    clearSaved: (state) => {
      state.ids = [];
    },
  },
});

export const { toggleSaved, clearSaved } = savedSlice.actions;
export default savedSlice.reducer;
```

Two things to burn in. First, `state` is the current slice state, and `action.payload` is whatever you pass when you dispatch, so `toggleSaved("abc")` makes the payload `"abc"`. Second, the exports: **named exports for the actions, default export for the reducer.** Forgetting either is the number one beginner error.

Register the slice and wrap the app:

```js
// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import savedReducer from "../features/saved/savedSlice";

export const store = configureStore({
  reducer: { saved: savedReducer },
});
```

```jsx
// src/main.jsx
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

> Checkpoint: the app still runs exactly as before. In Redux DevTools you can now see the state tree with a `saved` key holding an empty `ids` array.

## Part 5 of 7: Build 2: connect components

Writing data uses `useDispatch`. Reading uses `useSelector`. Update the card with a Save button:

```jsx
// src/PostCard.jsx
import { useDispatch, useSelector } from "react-redux";
import { toggleSaved } from "./features/saved/savedSlice";

export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const isSaved = useSelector((state) => state.saved.ids.includes(post._id));

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-lg font-semibold">{post.title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {post.content.slice(0, 120)}
      </p>
      <button
        onClick={() => dispatch(toggleSaved(post._id))}
        className="mt-3 rounded-lg border px-3 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        {isSaved ? "Saved" : "Save for later"}
      </button>
    </article>
  );
}
```

And a counter anywhere else in the app, with no props passed at all:

```jsx
// src/SavedBadge.jsx
import { useSelector } from "react-redux";

export default function SavedBadge() {
  const count = useSelector((state) => state.saved.ids.length);
  return <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{count} saved</span>;
}
```

Put `<SavedBadge />` in the header. Click Save on a card and watch the badge change. That is global state with zero drilling.

> Checkpoint: Save toggles the button text, and the header badge count goes up and down. Open DevTools and you will see `saved/toggleSaved` in the action list.

## Part 6 of 7: Build 3: async data, where Redux earns its keep

A reducer must be pure: no fetching, no randomness, no side effects. So how do we load posts from the API? With `createAsyncThunk`. It wraps an async function and automatically dispatches three actions: pending, fulfilled, and rejected.

```js
// src/features/posts/postsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPosts } from "../../api";

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  return await getPosts();
});

const postsSlice = createSlice({
  name: "posts",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default postsSlice.reducer;
```

Register it in the store as `posts: postsReducer`, then use it in the list:

```jsx
// src/PostList.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "./features/posts/postsSlice";
import PostCard from "./PostCard";

export default function PostList() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.posts);

  useEffect(() => {
    if (status === "idle") dispatch(fetchPosts());
  }, [status, dispatch]);

  if (status === "loading") return <p>Loading posts...</p>;
  if (status === "failed") return <p className="text-red-700">{error}</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <PostCard key={p._id} post={p} />
      ))}
    </div>
  );
}
```

Why `status === "idle"` in the effect? Without the guard, loading changes `status`, which retriggers the effect, which dispatches again. The guard makes it fetch exactly once.

Notice how much hand written state this takes: `loading`, `error`, and the data. Libraries like **RTK Query** (part of Redux Toolkit) and **SWR** ([the custom hooks post](../19-custom-hooks/)) exist to own that whole pattern for server data. Modern Redux apps often use Redux for client state like saved items and an RTK Query style tool for server data. Knowing the manual version first is what makes those tools make sense.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Redux DevTools, the real reason people stay*.

## Part 7 of 7: Redux DevTools, the real reason people stay

1. Right click your app, Inspect, open the **Redux** tab.
2. Click Save on a card. You will see `saved/toggleSaved` appear in the action list.
3. Open the **Diff** tab to see exactly what changed in state.
4. Drag the **slider** backward and watch your UI undo itself in order.

When a bug appears in a big app, you read the action log and find the exact payload that corrupted state. That traceability is what teams are really paying for.

## Patterns I follow with Redux

- **Keep Redux for state many distant components share.** Form inputs and open/closed toggles belong in local `useState`.
- **One slice per feature,** in a `features/<name>` folder, with the slice and its components together.
- **Store ids, derive the rest.** We saved `ids`, not whole post objects. Duplicated data drifts out of sync.
- **Selectors return the smallest piece they need.** `state.saved.ids.length` re-renders only when the count changes.
- **Name actions as events,** like `toggleSaved`, not setters like `setIds`. Your action log reads like a story of what the user did.
- **Never put API calls inside a reducer.** Use `createAsyncThunk` or RTK Query.

## Common confusions

| What you might think | What is true |
| -------------------- | ------------ |
| "I must spread `...state` to update." | Not in RTK. Immer lets you write `push` and assign directly inside reducers. |
| "My state is undefined." | Check the exports: named actions plus `export default slice.reducer`, and check the key name in `configureStore`. |
| "`action.payload` is undefined." | You dispatched without an argument. Write `dispatch(toggleSaved(id))`. |
| "I can mutate state anywhere." | Only inside reducers. Mutating state in a component breaks Redux. |

## Solo rep: Blank page: a cart slice

> **Level 4: Blank page.** One line of goal, an empty file, and your own plan. Docs allowed, copy paste never. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

One line of goal: a `cartSlice` with `addItem`, `removeItem` and a derived total, registered in an empty store, with a header badge that shows the item count. Start from an empty project and do not copy from the post.

<details>
<summary>Check yourself, only after you try</summary>

```js
import { createSlice, configureStore } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
  },
});

export const { addItem, removeItem } = cartSlice.actions;
export const store = configureStore({ reducer: { cart: cartSlice.reducer } });
export const selectTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price, 0);
```

</details>

## Projects

### 1. Clear and count

Add a "Clear saved" button next to the badge that empties the saved list using the `clearSaved` reducer that already exists.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```jsx
import { useDispatch, useSelector } from "react-redux";
import { clearSaved } from "./features/saved/savedSlice";

export default function SavedBadge() {
  const dispatch = useDispatch();
  const count = useSelector((state) => state.saved.ids.length);
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{count} saved</span>
      {count > 0 && (
        <button onClick={() => dispatch(clearSaved())} className="text-xs underline">
          Clear
        </button>
      )}
    </div>
  );
}
```

Why: the reducer already exists, so the only new work is dispatching it. Reducers do the change, components just ask.

Common mistake: writing `dispatch(clearSaved)` without the parentheses. That dispatches the function itself, not an action.

</details>

### 2. A Saved page

Create a view that shows only the saved posts, using the posts slice and the saved slice together. Do not copy post objects into the saved slice.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```jsx
import { useSelector } from "react-redux";
import PostCard from "./PostCard";

export default function SavedPosts() {
  const items = useSelector((state) => state.posts.items);
  const ids = useSelector((state) => state.saved.ids);
  const saved = items.filter((p) => ids.includes(p._id));

  if (saved.length === 0) return <p className="text-slate-500">Nothing saved yet.</p>;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {saved.map((p) => (
        <PostCard key={p._id} post={p} />
      ))}
    </div>
  );
}
```

Why: ids in one slice, data in another, joined at read time. If a post title changes, the saved page is automatically correct.

Common mistake: storing the whole post in `saved`. Then you have two copies of every post and they disagree after an edit.

</details>

### 3. Solo build: persist saved posts

No solution. Make saved posts survive a page refresh using `localStorage`. Hint: read `localStorage` once when creating `initialState`, and write to it with `store.subscribe` in `store.js`. Try it for 20 minutes before looking anything up.

## Cheat sheet

- Setup: `npm install @reduxjs/toolkit react-redux`
- Store: `configureStore({ reducer: { saved: savedReducer } })`
- Provider: `<Provider store={store}><App /></Provider>`
- Slice: `createSlice({ name, initialState, reducers })`
- Export: named actions, `export default slice.reducer`
- Read: `useSelector((state) => state.saved.ids)`
- Write: `dispatch(toggleSaved(id))`
- Async: `createAsyncThunk` plus `extraReducers` for pending, fulfilled, rejected

## If lost / If bored

- If lost: nothing updates means check the reducer is registered in `configureStore`. A crash on `useSelector` usually means the app is not wrapped in `<Provider>`.
- If bored: build the multi slice shopping cart. Slice one holds products, slice two holds cart items, and a navbar badge shows the count.
- Keep for next: the `blog-frontend` app now has a store. [The custom hooks post](../19-custom-hooks/) turns repeated fetching logic into reusable custom hooks.

## What breaks next

The store works, but components keep repeating the same fetch logic. How do you reuse it?

[Where we are and what is next](../progress/)
