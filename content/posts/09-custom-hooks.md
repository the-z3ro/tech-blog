---
title: "09 : Custom Hooks - Write Once, Use Everywhere"
date: 2026-05-31T14:00:00+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 9
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

> **Blog Summary:** React's built-in hooks are great, but the real superpower is building your own. This covers custom hooks from scratch - data fetching, browser APIs, performance patterns, and the SWR library. By the end you will have a solid collection of hooks you can drop into any project.

---

So we have been through `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`. Those are all hooks React ships with. And honestly, they cover a lot.

But here is the thing nobody told me clearly when I was learning this. The whole hook system is not just a collection of built-in utilities. It is a design pattern. React gives you the primitives, and then it is on you to compose them into logic units that your components can share. That is what custom hooks are.

Once this clicked for me it changed the way I look at component code. Whenever I see a component that has a bunch of `useState` and `useEffect` calls all crammed together handling some specific concern, my first thought now is, that probably should be a hook.

---

## 1. What Even Is a Custom Hook?

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

---

## 2. Data Fetching Hooks - Where You Will Use This Most

This is the category you will reach for constantly in real projects. Almost every screen in a React app needs to fetch some data, show a loader while waiting, handle errors. Writing that `useEffect` + `useState` combo in every component gets old fast.

### The Problem First

Let's say you have this:

```jsx
function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch("https://sum-server.100xdevs.com/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data.todos));
  }, []);

  return (
    <>
      {todos.map((todo) => (
        <div key={todo.id}>
          <p>{todo.title}</p>
          <p>{todo.description}</p>
        </div>
      ))}
    </>
  );
}
```

This works. But now you have another component that also needs todos. And another page that needs user data. And a profile page that needs posts. You keep writing the same `useEffect` + `useState` pattern over and over.

### Step 1 - Extract the Fetching Logic

Pull it into a hook:

```jsx
function useTodos() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch("https://sum-server.100xdevs.com/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data.todos));
  }, []);

  return todos;
}

function App() {
  const todos = useTodos(); // <- entire fetch logic gone from the component

  return (
    <>
      {todos.map((todo) => (
        <div key={todo.id}>
          <p>{todo.title}</p>
          <p>{todo.description}</p>
        </div>
      ))}
    </>
  );
}
```

The component went from knowing about fetch to knowing nothing about fetch. It just calls `useTodos()` and gets back data. Cleaner, and now any other component can call the same hook.

### Step 2 - Add a Loading State

What shows while the data is being fetched? Right now, nothing. You probably want a loader.

```jsx
function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://sum-server.100xdevs.com/todos")
      .then((res) => res.json())
      .then((data) => {
        setTodos(data.todos);
        setLoading(false);
      });
  }, []);

  return { todos, loading };
}

function App() {
  const { todos, loading } = useTodos();

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {todos.map((todo) => (
        <div key={todo.id}>
          <p>{todo.title}</p>
          <p>{todo.description}</p>
        </div>
      ))}
    </>
  );
}
```

Now the hook returns an object with both `todos` and `loading`. The component destructures what it needs.

### Step 3 - Auto Refresh / Polling

Some data needs to stay fresh. Think of a live score board, a notification count, or a stock price. You want to re-fetch every N seconds.

```jsx
function useTodos(n) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  function getData() {
    fetch("https://sum-server.100xdevs.com/todos")
      .then((res) => res.json())
      .then((data) => {
        setTodos(data.todos);
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

  return { todos, loading };
}

// Usage - refetch every 5 seconds
function App() {
  const { todos, loading } = useTodos(5);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {todos.map((todo) => (
        <div key={todo.id}>
          <p>{todo.title}</p>
        </div>
      ))}
    </>
  );
}
```

Notice the cleanup. The `return () => clearInterval(intervalId)` inside `useEffect` runs when the component unmounts or when `n` changes. Without this, you get a memory leak - the interval keeps firing even after the component is gone, trying to set state on something that no longer exists. React will even yell at you in the console about it.

### A More General useFetch Hook

The `useTodos` hook is very specific. In real projects it makes more sense to have a generic hook that takes any URL:

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
function TodoList() {
  const { data, loading, error } = useFetch(
    "https://sum-server.100xdevs.com/todos",
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <ul>
      {data.todos.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}
```

This pattern of returning `{ data, loading, error }` from a data hook is so common it is practically a convention. You will see it everywhere including in the SWR library which we will look at later.

---

## 3. Browser Functionality Hooks

This category is about wrapping browser APIs into hooks. The browser exposes a ton of useful things. Network status, mouse position, window size, scroll position, geolocation, clipboard access. Using these directly in components is messy. Hooks clean that up.

### useIsOnline - Network Status

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

The event listener cleanup is important here too. `window.addEventListener` needs a corresponding `removeEventListener` with the exact same function reference. This is why we define `handleOnline` and `handleOffline` as named functions before registering them - so we can pass the same reference to `removeEventListener`.

### useMousePointer - Track Cursor Position

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

### useWindowSize - Responsive Logic in JS

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

---

## 4. Performance and Timer Hooks

### useInterval - Run Code Every N Seconds

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

### useDebounce - Delay Until Typing Stops

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

---

## 5. SWR - When You Don't Want to Build This Yourself

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
    "https://sum-server.100xdevs.com/todos",
    fetcher,
  );

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;

  return <div>You have {data.todos.length} todos!</div>;
}
```

Compare this with what we built earlier. SWR gives you the same `{ data, error, isLoading }` pattern but under the hood it also handles:

- **Request deduplication** - if 10 components call `useSWR` with the same URL at the same time, only 1 HTTP request happens
- **Cache** - the data is cached and reused across components and page navigations
- **Auto revalidation** - refetches when you switch tabs back to the app (focus revalidation)
- **Polling** - `useSWR(url, fetcher, { refreshInterval: 5000 })` for auto refresh
- **Optimistic updates** - update UI before the server confirms

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

---

## 6. A Few More Hooks Worth Knowing

These come up in real projects often enough that it is worth seeing them at least once.

### useLocalStorage - Persist State Across Refreshes

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

### usePrevious - Remember the Last Value

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

---

## 7. Rules and Things to Keep in Mind

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

**Each component gets its own state.** Custom hooks do not share state between components. If `ComponentA` and `ComponentB` both call `useTodos()`, they each get their own independent todos state. The hook logic is shared, not the state.

**Naming matters.** Be descriptive. `useUser` is better than `useData`. `useDebounce` is better than `useDelay`. Someone reading your code should know what the hook does from the name alone.

---

## The Mini Project - useGithubProfile

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

---

## Common Confusions

| Confusion                                             | Reality                                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| "Custom hooks share state between components"         | No. Each component calling the hook gets its own state. The logic is shared, the state is not.                |
| "My hook must return something"                       | You can return nothing. A hook that only sets up event listeners or timers does not need to return anything.  |
| "I should put all logic in a single big hook"         | No. Split by concern. One hook per logical unit. `useAuth`, `useTodos`, `useTheme` - not one `useEverything`. |
| "useInterval is the same as setInterval in useEffect" | Naive useInterval has a stale closure bug. The ref-based pattern above is the correct way.                    |
| "SWR is just fetch with loading state"                | SWR adds caching, deduplication, background revalidation, focus refetching. It is a full data layer.          |

---

## Key Takeaways

- A custom hook is any function starting with `use` that calls at least one other hook inside
- They do not share state - each component gets its own isolated copy of hook state
- Data fetching hooks evolve: start simple, add loading, add error handling, add polling as needed
- Browser API hooks (`useIsOnline`, `useMousePointer`, `useWindowSize`) wrap event listeners cleanly and always need cleanup
- `useDebounce` is a must-have for any input that triggers API calls
- `useInterval` needs the ref pattern to avoid stale closure issues
- SWR handles the entire data fetching concern in production - caching, deduplication, revalidation
- When you see repeated `useState` + `useEffect` patterns in multiple components, that is a sign a custom hook is waiting to be extracted
