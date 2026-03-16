---
title: "06 : React Hooks: useEffect, useMemo, useCallback, useRef"
date: 2026-03-13T23:41:51+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 6
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

> **Blog Summary:** Deep dive into React's hook system. Covers when and why each hook exists, common pitfalls, reconciliation internals, and performance optimization patterns.

---

## 1. Reconciliation — How React Updates the DOM

[SOURCE — COURSE MATERIAL]

### The CA Analogy

- **You** = developer (provide state/data)
- **CA (Chartered Accountant)** = React reconciler
- **Bank statements** = state
- **Tax filing** = DOM update

React receives your updated state and calculates **what changed** in the DOM — it doesn't re-create everything.

```
State change → React compares old Virtual DOM vs new Virtual DOM
             → Finds minimal set of changes (diffing)
             → Applies only those changes to real DOM
```

### What Is a Re-render?

1. The component function gets called again
2. React computes new virtual DOM
3. React diffs old vs new virtual DOM
4. Updates only changed real DOM nodes

[ADDED — EXPLANATION]
You can verify a re-render by adding `console.log('Rendered')` inside a component. Every time it logs, the component re-rendered.

### How to Minimize Re-renders

```
Principle: Keep state as low in the tree as possible
```

```jsx
// BAD — App re-renders every time header changes
function App() {
  const [headerTitle, setHeaderTitle] = useState("Hello");

  return (
    <>
      <Header title={headerTitle} />
      <ExpensiveComponent /> {/* re-renders unnecessarily */}
    </>
  );
}

// GOOD — Push state down to Header
function Header() {
  const [title, setTitle] = useState("Hello");
  return <h1>{title}</h1>;
}

function App() {
  return (
    <>
      <Header />
      <ExpensiveComponent /> {/* never re-renders */}
    </>
  );
}
```

### React.memo — Prevent Unnecessary Child Re-renders

```jsx
import { memo } from "react";

// Without memo: re-renders whenever parent does
// With memo: only re-renders if its props change
const ExpensiveChild = memo(function ExpensiveChild({ data }) {
  console.log("Child rendered");
  return <div>{data}</div>;
});
```

---

## 2. Component Return & Fragments

[SOURCE — COURSE MATERIAL]

```jsx
// Must return single root element
// Option 1: wrap in div (adds extra DOM node)
return (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// Option 2: Fragment (no extra DOM node — preferred)
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);

// Option 3: explicit Fragment (when you need a key)
return (
  <React.Fragment key={id}>
    <h1>Title</h1>
  </React.Fragment>
);
```

---

## 3. Keys in Lists

[SOURCE — COURSE MATERIAL]

Keys help React identify which items changed, added, or removed.

```jsx
// ❌ BAD — using index as key
{
  todos.map((todo, index) => <TodoItem key={index} todo={todo} />);
}
// Problem: if order changes, React thinks wrong items updated

// ✅ GOOD — use stable unique ID
{
  todos.map((todo) => <TodoItem key={todo.id} todo={todo} />);
}
```

**Why keys matter:**

```
Old list: [A(id:1), B(id:2), C(id:3)]
New list: [B(id:2), A(id:1), C(id:3)]  ← reordered

With IDs: React moves elements (efficient)
Without IDs (index): React re-renders all (wasteful)
```

---

## 4. Wrapper / Children Components

[SOURCE — COURSE MATERIAL]

```jsx
// Card wrapper component
function Card({ children, title }) {
  return (
    <div className="card-wrapper">
      <div className="card-header">{title}</div>
      <div className="card-body">
        {children} {/* render whatever is passed inside */}
      </div>
    </div>
  );
}

// Usage — pass any JSX as children
function App() {
  return (
    <Card title="User Info">
      <p>Name: Alice</p>
      <p>Email: alice@example.com</p>
    </Card>
  );
}
```

---

## 5. Hooks Overview

[SOURCE — COURSE MATERIAL]

Hooks are functions starting with `use` that "hook into" React features from functional components.

```
Common hooks:
├── useState     — manage component state
├── useEffect    — run side effects
├── useMemo      — memoize expensive computations
├── useCallback  — memoize function references
├── useRef       — mutable ref that doesn't trigger re-renders
└── useContext   — consume context values (Week 7)
```

**Rules of Hooks:**

1. Only call hooks at the **top level** (not inside loops/conditions)
2. Only call hooks from **React functions** (not regular JS)

---

## 6. useEffect

[SOURCE — COURSE MATERIAL]

### What Is a Side Effect?

Anything that reaches outside the component:

- API calls (fetch data)
- Timers (setTimeout, setInterval)
- Manual DOM manipulation
- Event listener registration

**Car race analogy:** You're racing 100 laps. A pit stop is a side effect — you do it from time to time, not every lap.

### Syntax

```jsx
useEffect(() => {
  // side effect code here

  return () => {
    // cleanup (optional) — runs when component unmounts or deps change
  };
}, [dependency1, dependency2]); // dependency array
```

### Dependency Array Behaviors

```jsx
// 1. Empty array [] — runs ONCE on mount (component appears)
useEffect(() => {
  fetchData();
}, []);

// 2. No array — runs on EVERY render (usually a bug)
useEffect(() => {
  console.log("Rendered!");
}); // ← no array

// 3. With dependencies — runs when listed values change
useEffect(() => {
  fetchUserData(userId);
}, [userId]); // re-runs whenever userId changes
```

### Fetching Data Example

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodos() {
      const res = await fetch("https://sum-server.100xdevs.com/todos");
      const data = await res.json();
      setTodos(data.todos);
      setLoading(false);
    }
    fetchTodos();
  }, []); // once on mount

  if (loading) return <p>Loading...</p>;
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}
```

### Todo with Changing ID

```jsx
function TodoDetail({ todoId }) {
  const [todo, setTodo] = useState(null);

  useEffect(() => {
    async function fetchTodo() {
      const res = await fetch(
        `https://sum-server.100xdevs.com/todo?id=${todoId}`,
      );
      const data = await res.json();
      setTodo(data.todo);
    }
    fetchTodo();
  }, [todoId]); // re-fetch when todoId changes

  if (!todo) return <p>Loading...</p>;
  return <div>{todo.title}</div>;
}
```

### Cleanup — Preventing Memory Leaks

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    setCount((c) => c + 1);
  }, 1000);

  return () => clearInterval(timer); // cleanup when unmounting
}, []);
```

---

## 7. useMemo — Memoize Expensive Computations

[SOURCE — COURSE MATERIAL]

**Problem:** Component re-renders trigger all calculations to re-run, even if their inputs didn't change.

```jsx
// BAD — sum recalculates on every render
function App() {
  const [count, setCount] = useState(0);
  const [inputN, setInputN] = useState(0);

  // This runs every time count changes — even though inputN didn't!
  let sum = 0;
  for (let i = 1; i <= inputN; i++) {
    sum += i;
  }

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <input
        value={inputN}
        onChange={(e) => setInputN(Number(e.target.value))}
      />
      <p>
        Sum 1 to {inputN}: {sum}
      </p>
    </div>
  );
}
```

```jsx
// GOOD — memoize sum; only recalculate when inputN changes
import { useMemo } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [inputN, setInputN] = useState(0);

  const sum = useMemo(() => {
    let total = 0;
    for (let i = 1; i <= inputN; i++) total += i;
    return total;
  }, [inputN]); // only recalculate when inputN changes

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <input
        value={inputN}
        onChange={(e) => setInputN(Number(e.target.value))}
      />
      <p>
        Sum 1 to {inputN}: {sum}
      </p>
    </div>
  );
}
```

**Crypto analogy:** You have returns from 3 exchanges. You calculated the sum and gave it to your CA. Your income report arrived. Would you recalculate the crypto sum? No — it hasn't changed.

---

## 8. useCallback — Memoize Function References

[SOURCE — COURSE MATERIAL]

**Problem:** On every render, React recreates all functions inside the component. When these functions are passed as props to child components, the children re-render unnecessarily (even with `React.memo`).

```jsx
// BAD — sendRequest is recreated every render
function Parent() {
  const [count, setCount] = useState(0);

  const sendRequest = function () {
    console.log("Sending request...");
  };

  // Child sees a "new" sendRequest every render → re-renders even with memo
  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      <Child onRequest={sendRequest} />
    </div>
  );
}
```

```jsx
// GOOD — sendRequest is stable across renders
import { useCallback } from "react";

function Parent() {
  const [count, setCount] = useState(0);

  const sendRequest = useCallback(function () {
    console.log("Sending request...");
  }, []); // empty deps = never recreate

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
      <Child onRequest={sendRequest} /> {/* stable reference */}
    </div>
  );
}

const Child = memo(function Child({ onRequest }) {
  console.log("Child rendered");
  return <button onClick={onRequest}>Send</button>;
});
```

---

## 9. useRef — Mutable Values Without Re-renders

[SOURCE — COURSE MATERIAL]

`useRef` gives you a box that persists across renders, but changing its `.current` does NOT trigger a re-render.

```jsx
import { useRef } from "react";

// Common use case 1: Accessing DOM elements directly
function TextInput() {
  const inputRef = useRef(null);

  function focusInput() {
    inputRef.current.focus(); // directly access DOM node
  }

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus Input</button>
    </>
  );
}

// Common use case 2: Storing previous value
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = useRef(0);

  useEffect(() => {
    prevCount.current = count;
  });

  return (
    <p>
      Now: {count}, Before: {prevCount.current}
    </p>
  );
}

// Common use case 3: Storing mutable value (e.g., timer ID)
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  function start() {
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  }

  function stop() {
    clearInterval(timerRef.current);
  }

  return (
    <>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}
```

**useRef vs useState:**
| | useState | useRef |
|--|---------|--------|
| Triggers re-render | Yes | No |
| Value persists | Yes | Yes |
| Use for | UI state | DOM refs, timers, previous values |

---

## 10. Custom Hooks

[SOURCE — COURSE MATERIAL]

Extract reusable logic into custom hooks. Must start with `use`.

```jsx
// Custom hook — useFetch
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Using it — much cleaner!
function TodoList() {
  const { data, loading, error } = useFetch("https://api.example.com/todos");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <ul>
      {data.todos.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}
```

---

## Exercises

### Quick (15 min)

Create a component that shows an auto-incrementing second counter using `setInterval` in `useEffect`. Make sure to cleanup the interval.

**Hint 1:** `return () => clearInterval(id)` inside useEffect  
**Hint 2:** Use functional update `setCount(c => c + 1)` inside interval

---

### Intermediate (45 min)

Build an app with:

- Counter (click to increment)
- Input for a number N
- Shows sum from 1 to N using `useMemo`
- A memoized child component (use `React.memo + useCallback`) that only re-renders when actually needed

---

### Challenge (2–3 hours)

Build a custom `useDebounce` hook:

- Takes a value and a delay
- Returns the debounced value (only updates after delay ms of no changes)
- Use it in a search input that fires API requests with debouncing

---

## Common Confusions

| Confusion                                | Reality                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| "useEffect with [] runs every render"    | No. Empty `[]` = runs ONCE on mount. No array = every render.                   |
| "useMemo is for caching API responses"   | No. Use for expensive synchronous calculations. Use `useEffect` for API calls.  |
| "useCallback makes functions run faster" | No. It memoizes the function reference to prevent unnecessary child re-renders. |
| "useRef causes re-renders"               | No. Changing `ref.current` does NOT trigger re-render. That's the whole point.  |

---

## Key Takeaways

- `useEffect` runs after render; control when with dependency array
- `useMemo` caches computed values; recomputes only when deps change
- `useCallback` caches function references; prevents unnecessary child re-renders
- `useRef` = a box that persists between renders without causing re-renders
- Custom hooks = extract and reuse stateful logic across components
- Push state down the tree to minimize re-renders; use `React.memo` for expensive children
