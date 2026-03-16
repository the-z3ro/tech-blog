---
title: "05 : React Deep Dive"
date: 2026-03-13T23:41:11+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 5
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

> **Blog Summary:** Mastering React's core mental model — state, components, JSX, and re-rendering. Understanding how to structure apps and why React re-renders when and how it does.

---

## 1. The React Mental Model

[SOURCE — COURSE MATERIAL]

Every frontend app has two things:

```
State              Components
─────              ──────────
The data           The view function
(what changes)     state → rendered HTML
```

**Key insight:** You never manipulate the DOM directly. You update state. React figures out the DOM.

```
Developer updates state → React reconciler calculates diff → React updates DOM
```

**Analogy:** You are the CA's client. You provide updated financial data (state). The CA (React) re-calculates your taxes (DOM) and files it for you.

---

## 2. React vs Vanilla JS — Side by Side

[SOURCE — COURSE MATERIAL]

### Vanilla JS Counter (the hard way)

```js
let count = 0;

function updateCounter() {
  document.getElementById("counter").textContent = count;
}

document.getElementById("increment").addEventListener("click", () => {
  count++;
  updateCounter();
});
```

### React Counter (the clean way)

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

**Difference:** In React, you just call `setCount`. React handles the DOM update.

---

## 3. JSX — JavaScript + HTML Syntax

[SOURCE — COURSE MATERIAL]

JSX is syntactic sugar. It looks like HTML but is JavaScript.

```jsx
// JSX (what you write)
const element = <h1 className="title">Hello</h1>;

// What Babel compiles it to:
const element = React.createElement("h1", { className: "title" }, "Hello");
```

### JSX Rules

```jsx
// 1. Must return ONE root element
// BAD:
return (
  <h1>Title</h1>
  <p>Text</p>
);

// GOOD: wrap in a div or Fragment
return (
  <div>
    <h1>Title</h1>
    <p>Text</p>
  </div>
);

// Or use Fragment (no extra DOM node)
return (
  <>
    <h1>Title</h1>
    <p>Text</p>
  </>
);

// 2. class → className
<div className="box">...</div>

// 3. JavaScript expressions in curly braces
const name = "Alice";
<h1>Hello, {name}!</h1>

// 4. Self-closing tags must close
<input />    // not <input>
<img src="..." />

// 5. Event handlers use camelCase
<button onClick={handleClick}>Click</button>  // not onclick
<input onChange={handleChange} />
```

---

## 4. Components

[SOURCE — COURSE MATERIAL]

A component is a **reusable function that returns JSX**.

```jsx
// Functional Component (modern standard)
function Button({ label, onClick, color }) {
  return (
    <button onClick={onClick} style={{ backgroundColor: color }}>
      {label}
    </button>
  );
}

// Props — data passed TO a component (read-only!)
function App() {
  return (
    <div>
      <Button label="Save" onClick={() => save()} color="green" />
      <Button label="Delete" onClick={() => remove()} color="red" />
    </div>
  );
}
```

### Component Composition

```jsx
// Components can contain other components
function Card({ children }) {
  return <div className="card">{children}</div>;
}

function UserCard({ name, email }) {
  return (
    <Card>
      <h2>{name}</h2>
      <p>{email}</p>
    </Card>
  );
}

function App() {
  return (
    <div>
      <UserCard name="Alice" email="alice@test.com" />
      <UserCard name="Bob" email="bob@test.com" />
    </div>
  );
}
```

---

## 5. useState — State Management

[SOURCE — COURSE MATERIAL]

```jsx
import { useState } from "react";

function TodoApp() {
  // [currentValue, setterFunction] = useState(initialValue)
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState("");

  function addTodo() {
    if (!inputText.trim()) return;
    setTodos([...todos, { text: inputText, done: false }]);
    setInputText("");
  }

  function toggleTodo(index) {
    const newTodos = todos.map((todo, i) =>
      i === index ? { ...todo, done: !todo.done } : todo,
    );
    setTodos(newTodos);
  }

  return (
    <div>
      <input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Add a todo..."
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {todos.map((todo, index) => (
          <li
            key={index}
            onClick={() => toggleTodo(index)}
            style={{ textDecoration: todo.done ? "line-through" : "none" }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Critical Rules for State

```jsx
// ❌ WRONG — mutating state directly (React won't re-render)
todos.push(newTodo);
setTodos(todos); // same reference, no re-render

// ✅ CORRECT — create a NEW array
setTodos([...todos, newTodo]);

// ❌ WRONG — mutating an object
user.name = "Alice";
setUser(user); // same reference

// ✅ CORRECT — spread operator
setUser({ ...user, name: "Alice" });
```

---

## 6. Re-Rendering — When and Why

[SOURCE — COURSE MATERIAL]

A component **re-renders** when:

1. Its own state variable changes
2. Its parent re-renders (even if props didn't change)
3. Its props change

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <Child /> {/* This ALSO re-renders when Parent does! */}
    </div>
  );
}

function Child() {
  console.log("Child re-rendered"); // runs every time Parent re-renders
  return <p>I am Child</p>;
}
```

### State Object for a Counter App

```js
// Example state shape
const appState = {
  currentCount: 5,
};

// LinkedIn topbar state
const topbarState = {
  notificationCount: 7,
  jobsCount: 3,
  messagingCount: 2,
  networkCount: 12,
};
```

---

## 7. Connecting Frontend to Backend

[SOURCE — COURSE MATERIAL]

```jsx
import { useState, useEffect } from "react";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.example.com/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        setLoading(false);
      });
  }, []); // empty array = run once on mount

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

---

## 8. Creating a React App

[SOURCE — COURSE MATERIAL]

```bash
# Vite (recommended — fast)
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev      # development server
npm run build    # production build
```

### Project Structure

```
my-app/
├── src/
│   ├── App.jsx        ← main component
│   ├── main.jsx       ← entry point (renders App)
│   └── components/    ← your custom components
├── public/
│   └── index.html
└── package.json
```

---

## Exercises

### Quick (15 min)

Build a **counter** with:

- Display current count
- Increment button (+1)
- Decrement button (-1)
- Reset button (back to 0)
- Counter turns red if negative

**Hint 1:** `style={{ color: count < 0 ? 'red' : 'black' }}`  
**Hint 2:** Three separate `onClick` handlers

---

### Intermediate (45 min)

Build a **color picker**:

- Three sliders for R, G, B (0–255)
- A box that updates its background color based on slider values
- Display the hex value below the box

**Hint 1:** `rgb(${r}, ${g}, ${b})`  
**Hint 2:** Convert to hex: `r.toString(16).padStart(2, '0')`

---

### Challenge (2–3 hours)

Build a **full CRUD todo app** connected to your backend:

- Show todos fetched from API
- Add todo (POST to backend)
- Mark complete (PUT to backend)
- Delete todo (DELETE from backend)
- Loading state + error handling

---

## Common Confusions

| Confusion                                            | Reality                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| "I can modify props inside a component"              | Props are read-only. Only parent can change them.                   |
| "State changes are synchronous"                      | No. `setState` is async. New value not available until next render. |
| "Class and className are the same"                   | `class` is reserved in JS. JSX uses `className`.                    |
| "`key` can be array index"                           | Avoid. Use unique IDs. Index causes bugs when list order changes.   |
| "A component re-renders only when its state changes" | Also when parent re-renders.                                        |

---

## Key Takeaways

- React = State + Components. You manage state, React manages DOM.
- JSX compiles to `React.createElement()` — it's just JavaScript
- State is immutable — always create new arrays/objects with spread operator
- Components are functions that return JSX and accept props
- Every state change triggers a re-render of that component and all its children
- `useEffect` is for side effects (API calls, timers) — covered deeply in Week 6
