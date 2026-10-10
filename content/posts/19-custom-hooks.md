---
title: "19 : Custom Hooks - Write Once, Use Everywhere"
date: 2026-05-31T14:00:00+05:30
draft: false
tags: ["react", "hooks", "custom-hooks", "swr"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 1900
description: "Turn repeated state and effect logic into custom hooks: data fetching, browser hooks, debounce, timers and SWR, built on the blog API."
aliases: ["/posts/11-custom-hooks/", "/posts/16-custom-hooks/", "/posts/custom-hooks/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

My `.bat` files were my first reusable code: a sequence of commands saved once and run whenever I needed it. A custom hook is a `.bat` file for React logic: state and effects saved once, reused in any component.

That one idea cleans up most React codebases. We build the hooks you will actually use: data fetching, debounce, local storage, window size, and SWR for caching.

> **Where we are:** A store and a lot of repeated fetch code. After this post, hooks tidy it up.
>
> **Phase 01** · Real frontends · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** writing custom hooks, data fetching hooks, browser hooks, debounce, SWR.  
> **Not today:** TanStack Query in depth. The idea is the same as SWR.
>
> **Time:** about 20 minutes to read, 60 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, write the three states a data fetch can be in, and how your UI should show each.

<details>
<summary>Prereqs to run this file</summary>

- The `blog-frontend` app from [the Tailwind post](../17-tailwind-axios-and-a-real-blog-frontend/) and your backend on port 3000 with `GET /posts`.
- Hooks from [the hooks post](../14-react-hooks-in-depth/) feel comfortable: `useState`, `useEffect`, cleanup.
- For the SWR part: `npm install swr`.

</details>

## Part 1 of 8: What Even Is a Custom Hook?

A custom hook is just a JavaScript function. Nothing magical about it. The only two rules it has to follow are:

1. Its name must start with `use`
2. It must call at least one other hook internally (built-in or another custom hook)

That is it. That is the whole definition.

The naming rule is not just a convention for fun. The React linter (ESLint plugin for hooks) uses it to enforce the rules of hooks. If your function calls `useState` but is not named `use___`, React cannot guarantee you are calling it correctly, and you lose the linter warnings. So always start with `use`.

```jsx
// This is a valid custom hook
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  // ...
  return size;
}

// This is NOT a custom hook (doesn't use use prefix, React won't treat it as one)
function getWindowSize() {
  const [size, setSize] = useState({}); // <- this will break the rules of hooks
}
```

The real value of a custom hook is **code reuse across components**. If two components need the same stateful logic, you extract it into a hook. Both components call the hook and get their own isolated copy of that state. No sharing, no interference.

> Checkpoint: you should see the same state and effect logic live in one function, used by two components.

## Part 2 of 8: Data Fetching Hooks: Where You Will Use This Most

This is the category you will reach for constantly in real projects. Almost every screen in a React app needs to fetch some data, show a loader while waiting, handle errors. Writing that `useEffect` + `useState` combo in every component gets old fast.

### The Problem First

Let's say you have this:

```jsx
function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts));
  }, []);

  return (
    <>
      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.title}</p>
          <p>{post.content}</p>
        </div>
      ))}
    </>
  );
}
```

This works. But now you have another component that also needs posts. And another page that needs user data. And a profile page that needs posts. You keep writing the same `useEffect` + `useState` pattern over and over.

### Step 1: Extract the Fetching Logic

Pull it into a hook:

```jsx
function usePosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts));
  }, []);

  return posts;
}

function App() {
  const posts = usePosts(); // <- entire fetch logic gone from the component

  return (
    <>
      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.title}</p>
          <p>{post.content}</p>
        </div>
      ))}
    </>
  );
}
```

The component went from knowing about fetch to knowing nothing about fetch. It just calls `usePosts()` and gets back data. Cleaner, and now any other component can call the same hook.

### Step 2: Add a Loading State

What shows while the data is being fetched? Right now, nothing. You probably want a loader.

```jsx
function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
        setLoading(false);
      });
  }, []);

  return { posts, loading };
}

function App() {
  const { posts, loading } = usePosts();

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.title}</p>
          <p>{post.content}</p>
        </div>
      ))}
    </>
  );
}
```

Now the hook returns an object with both `posts` and `loading`. The component destructures what it needs.

### Step 3: Auto Refresh / Polling

Some data needs to stay fresh. Think of a live score board, a notification count, or a stock price. You want to re-fetch every N seconds.

```jsx
function usePosts(n) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  function getData() {
    fetch("http://localhost:3000/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
        setLoading(false);
      });
  }

  useEffect(() => {
    getData(); // fetch immediately

    const intervalId = setInterval(() => {
      getData(); // then fetch every n seconds
    }, n * 1000);

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [n]);

  return { posts, loading };
}

// Usage - refetch every 5 seconds
function App() {
  const { posts, loading } = usePosts(5);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.title}</p>
        </div>
      ))}
    </>
  );
}
```

Notice the cleanup. The `return () => clearInterval(intervalId)` inside `useEffect` runs when the component unmounts or when `n` changes. Without this, you get a memory leak, the interval keeps firing even after the component is gone, trying to set state on something that no longer exists. React will even yell at you in the console about it.

### A More General useFetch Hook

The `usePosts` hook is very specific. In real projects it makes more sense to have a generic hook that takes any URL:

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Usage
function PostList() {
  const { data, loading, error } = useFetch(
    "http://localhost:3000/posts",
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <ul>
      {data.posts.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}
```

This pattern of returning `{ data, loading, error }` from a data hook is so common it is practically a convention. You will see it everywhere including in the SWR library which we will look at later.

> Checkpoint: you should see loading first, then data, then an error state when you break the URL on purpose.

## Part 3 of 8: Browser Functionality Hooks

This category is about wrapping browser APIs into hooks. The browser exposes a ton of useful things. Network status, mouse position, window size, scroll position, geolocation, clipboard access. Using these directly in components is messy. Hooks clean that up.

### useIsOnline: Network Status

Build a hook that tells you if the user is online or offline. The browser gives you `window.navigator.onLine` for the current state, and `online`/`offline` events when it changes.

```jsx
function useIsOnline() {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Usage
function App() {
  const isOnline = useIsOnline();

  return (
    <div>
      {isOnline ? "You are online" : "You are offline - check your connection"}
    </div>
  );
}
```

The event listener cleanup is important here too. `window.addEventListener` needs a corresponding `removeEventListener` with the exact same function reference. This is why we define `handleOnline` and `handleOffline` as named functions before registering them, so we can pass the same reference to `removeEventListener`.

### useMousePointer: Track Cursor Position

```jsx
function useMousePointer() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return position;
}

// Usage
function App() {
  const { x, y } = useMousePointer();

  return (
    <div style={{ height: "100vh" }}>
      Mouse position is {x}, {y}
    </div>
  );
}
```

Notice how the component knows nothing about `addEventListener`. It just gets `x` and `y`. You could use this in a tooltip, a custom cursor, a parallax effect, or anything that needs cursor coordinates.

### useWindowSize: Responsive Logic in JS

Sometimes you need to know the window size in JS, not just CSS. Like when you want to render a completely different component, not just hide/show one.

```jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

// Usage - render different layout based on screen size
function App() {
  const { width } = useWindowSize();

  return width < 768 ? <MobileLayout /> : <DesktopLayout />;
}
```

> Checkpoint: you should see the value update when you resize the window or go offline.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Performance and Timer Hooks*.

## Part 4 of 8: Performance and Timer Hooks

### useInterval: Run Code Every N Seconds

This one sounds simple but it is surprisingly easy to get wrong. Naive implementations have a stale closure bug where the callback sees old state values.

Here is the correct approach:

```jsx
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  // Always keep the ref updated to the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return; // null means stop

    const id = setInterval(() => {
      savedCallback.current(); // call via ref, always latest version
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}

// Usage - counter that increments every second
function Timer() {
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount((c) => c + 1);
  }, 1000);

  return <p>Timer: {count}</p>;
}
```

The `useRef` trick here is important. If you pass `callback` as a dependency of the second `useEffect`, the interval gets cleared and restarted every time `callback` changes (which is every render, because functions are recreated on every render). Instead, you store the latest version of callback in a ref, and the interval always calls `savedCallback.current`. The interval never restarts, but it always has access to the latest callback.

This is actually a pattern Dan Abramov wrote about in his blog in 2019, and it is still the correct way to do it.

### useDebounce: Delay Until Typing Stops

Debouncing is one of those things you will need constantly. Search inputs, form validation, window resize handlers. The idea is: don't fire immediately, wait until the user has stopped doing the thing for X milliseconds.

```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer); // cancel if value changes before delay
  }, [value, delay]);

  return debouncedValue;
}
```

Here is how it works: every time `value` changes, a new timeout is set. But the cleanup function from the previous `useEffect` run cancels the old timeout first. So if the user types fast, the timeouts keep getting cancelled and reset. Only when the user stops typing for `delay` milliseconds does the timeout actually complete and `debouncedValue` updates.

```jsx
// Usage - search input that delays API calls
const SearchBar = () => {
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 500);

  // This effect only fires when debouncedValue changes (500ms after user stops typing)
  useEffect(() => {
    if (debouncedValue) {
      console.log("Searching for:", debouncedValue);
      // make your API call here
    }
  }, [debouncedValue]);

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

Without debouncing, a user typing "react hooks" would fire 10 API calls. With 500ms debounce, it fires 1 call after they stop typing. That is the kind of thing that makes the difference between a polished app and a slow one.

> Checkpoint: you should see the debounced value update only after you stop typing.

## Part 5 of 8: SWR: When You Don't Want to Build This Yourself

We have been building data fetching hooks from scratch. That is a great exercise to understand how they work. In production though, there is a library called **SWR** that does all of this and much more.

SWR stands for **Stale-While-Revalidate**, which is a cache strategy: show stale data immediately while fetching fresh data in the background.

```bash
npm install swr
```

```jsx
import useSWR from "swr";

const fetcher = async (url) => {
  const res = await fetch(url);
  return res.json();
};

function Profile() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:3000/posts",
    fetcher,
  );

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>You have {data.posts.length} posts!</div>;
}
```

Compare this with what we built earlier. SWR gives you the same `{ data, error, isLoading }` pattern but under the hood it also handles:

- **Request deduplication**: if 10 components call `useSWR` with the same URL at the same time, only 1 HTTP request happens
- **Cache**: the data is cached and reused across components and page navigations
- **Auto revalidation**: refetches when you switch tabs back to the app (focus revalidation)
- **Polling**: `useSWR(url, fetcher, { refreshInterval: 5000 })` for auto refresh
- **Optimistic updates**: update UI before the server confirms

```jsx
// Auto refresh with SWR
function LiveScore() {
  const { data } = useSWR("/api/score", fetcher, {
    refreshInterval: 3000, // refetch every 3 seconds
  });

  return <div>Score: {data?.score}</div>;
}
```

SWR is a great choice for most data fetching needs. If you find yourself building a complex custom hook for fetching, check if SWR covers it first. Another popular alternative is **React Query** (TanStack Query) which has a similar API but more features for mutations.

> Checkpoint: you should see the data refetch by itself when you switch to another tab and back.

## Part 6 of 8: A Few More Hooks Worth Knowing

These come up in real projects often enough that it is worth seeing them at least once.

### useLocalStorage: Persist State Across Refreshes

`useState` is lost on page refresh. `useLocalStorage` keeps it synced with localStorage so it survives:

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Usage - exactly like useState but persists
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current theme: {theme}
    </button>
  );
}
```

### usePrevious: Remember the Last Value

Sometimes you want to compare current value against previous value. Useful for animations, transition logic, or analytics:

```jsx
function usePrevious(value) {
  const ref = useRef(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current; // returns value from previous render
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>
        Now: {count}, Before: {prevCount}
      </p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}
```

This works because `useEffect` runs after the render. So when the component renders with the new `count`, `ref.current` still holds the previous value. Then `useEffect` updates the ref. On the next render, that old value is returned as `prevCount`.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Rules and Things to Keep in Mind*.

## Part 7 of 8: Rules and Things to Keep in Mind

A few rules that apply to custom hooks the same way they apply to built-in hooks:

**Do not call hooks conditionally.** React depends on hooks being called in the same order every render. This breaks that:

```jsx
// BAD
function useBadHook(shouldFetch) {
  if (shouldFetch) {
    const [data, setData] = useState(null); // conditional hook call - broken
  }
}

// GOOD - put the condition inside the hook, not around it
function useConditionalFetch(url, enabled) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!enabled) return; // condition inside the effect
    fetch(url)
      .then((res) => res.json())
      .then(setData);
  }, [url, enabled]);

  return data;
}
```

**Each component gets its own state.** Custom hooks do not share state between components. If `ComponentA` and `ComponentB` both call `usePosts()`, they each get their own independent posts state. The hook logic is shared, not the state.

**Naming matters.** Be descriptive. `useUser` is better than `useData`. `useDebounce` is better than `useDelay`. Someone reading your code should know what the hook does from the name alone.

## Part 8 of 8: The Mini Project: useGithubProfile

Let's put it all together with a small project. Build a hook that fetches a GitHub user's profile, with loading, error handling, and a debounced search input so you are not hammering the GitHub API on every keystroke.

```jsx
// useGithubProfile.js
import { useState, useEffect } from "react";

function useGithubProfile(username) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    setError(null);

    fetch(`https://api.github.com/users/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  return { profile, loading, error };
}

// useDebounce.js (same as above)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// App.jsx
function App() {
  const [input, setInput] = useState("");
  const debouncedUsername = useDebounce(input, 600);
  const { profile, loading, error } = useGithubProfile(debouncedUsername);

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter GitHub username"
      />

      {loading && <p>Searching...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {profile && (
        <div>
          <img src={profile.avatar_url} alt={profile.login} width={80} />
          <h2>{profile.name}</h2>
          <p>{profile.bio}</p>
          <p>
            Repos: {profile.public_repos} | Followers: {profile.followers}
          </p>
        </div>
      )}
    </div>
  );
}
```

This is a real project you can ship. Two custom hooks working together, debouncing real API calls, handling loading and error states properly. Extend it with `useLocalStorage` to save recent searches and you have a pretty complete thing.

## Common Confusions

| Confusion                                             | Reality                                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| "Custom hooks share state between components"         | No. Each component calling the hook gets its own state. The logic is shared, the state is not.                |
| "My hook must return something"                       | You can return nothing. A hook that only sets up event listeners or timers does not need to return anything.  |
| "I should put all logic in a single big hook"         | No. Split by concern. One hook per logical unit. `useAuth`, `usePosts`, `useTheme` - not one `useEverything`. |
| "useInterval is the same as setInterval in useEffect" | Naive useInterval has a stale closure bug. The ref-based pattern above is the correct way.                    |
| "SWR is just fetch with loading state"                | SWR adds caching, deduplication, background revalidation, focus refetching. It is a full data layer.          |

## Solo rep: Blank page: useLocalStorage

> **Level 4: Blank page.** One line of goal, an empty file, and your own plan. Docs allowed, copy paste never. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

One line of goal: a `useLocalStorage(key, initial)` hook that works like `useState` but survives a refresh. Start from an empty file, then use it to remember a dark mode choice.

<details>
<summary>Check yourself, only after you try</summary>

```jsx
import { useEffect, useState } from "react";

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

</details>

## Cheat sheet

- A custom hook is any function starting with `use` that calls at least one other hook inside
- They do not share state: each component gets its own isolated copy of hook state
- Data fetching hooks evolve: start simple, add loading, add error handling, add polling as needed
- Browser API hooks (`useIsOnline`, `useMousePointer`, `useWindowSize`) wrap event listeners cleanly and always need cleanup
- `useDebounce` is a must-have for any input that triggers API calls
- `useInterval` needs the ref pattern to avoid stale closure issues
- SWR handles the entire data fetching concern in production, caching, deduplication, revalidation
- When you see repeated `useState` + `useEffect` patterns in multiple components, that is a sign a custom hook is waiting to be extracted

## If lost / If bored

- If lost: a hook that fires forever has a missing or wrong dependency array. `Hooks can only be called at the top level` means you called one inside an `if` or a loop.
- If bored: build `useDebounce` alone and watch it work in a search box, it is the most satisfying one.
- Keep for next: your `hooks` folder with `usePosts`, `useDebounce` and `useLocalStorage`. [The TypeScript foundations post](../20-typescript-foundations/) adds types on top of code like this.

## What breaks next

The code is clean and reusable, but a typo in a data shape can hide for weeks. How do you catch it before running?

[Where we are and what is next](../progress/)
