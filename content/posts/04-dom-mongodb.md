---
title: "04 : DOM, Why Frontend Frameworks & MongoDB Deep Dive"
date: 2026-03-13T23:23:33+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 4
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

> **Blog Summary:** Transitions from backend to frontend. Explores raw DOM manipulation, its limitations, and why React exists. Also covers MongoDB/Mongoose in depth with a complete full-stack data model.

---

## 1. Browser JavaScript & the DOM

[SOURCE — COURSE MATERIAL]

### What Is the DOM?

**Document Object Model** — the browser's in-memory representation of a web page as a tree of objects.

```
HTML File:                    DOM Tree:
<html>                          document
  <body>                         └── html
    <div id="app">                    └── body
      <h1>Hello</h1>                       └── div#app
      <button>Click</button>                    ├── h1 ("Hello")
    </div>                                      └── button ("Click")
  </body>
</html>
```

JavaScript can read and modify this tree in real-time → **dynamic web pages**.

### JavaScript in the Browser vs Node.js

```
Browser JS:                    Node.js:
├── ECMAScript (shared)        ├── ECMAScript (shared)
├── document (DOM)             ├── fs (file system)
├── window                     ├── http
├── fetch                      ├── path
├── localStorage               └── process
└── setTimeout/setInterval
```

---

## 2. Raw DOM Manipulation

[SOURCE — COURSE MATERIAL]

### Accessing Elements

```html
<!-- HTML -->
<input id="num1" type="number" />
<input id="num2" type="number" />
<button onclick="calculateSum()">Add</button>
<div id="result"></div>
```

```js
// JavaScript — accessing by ID
function calculateSum() {
  const a = document.getElementById("num1").value;
  const b = document.getElementById("num2").value;
  const sum = parseInt(a) + parseInt(b);
  document.getElementById("result").textContent = `Sum: ${sum}`;
}

// Other selectors
document.getElementsByClassName("my-class"); // HTMLCollection
document.querySelector("#id"); // first match
document.querySelectorAll(".class"); // NodeList
```

### Classes vs IDs

```html
<!-- Classes: reusable styling -->
<div class="card">Card 1</div>
<div class="card">Card 2</div>

<!-- IDs: unique identifier for JS access -->
<div id="main-header">Header</div>
```

**Rule:** Use classes for CSS styling. Use IDs for JS targeting.

### Creating & Modifying Elements

```js
// Create
const div = document.createElement("div");
div.textContent = "New element";
div.className = "todo-item";
div.setAttribute("data-id", "123");

// Add to page
document.getElementById("container").appendChild(div);

// Remove
div.parentNode.removeChild(div);
// or
div.remove(); // modern

// Modify
div.innerHTML = "<strong>Bold text</strong>";
div.style.color = "red";
div.classList.add("active");
div.classList.remove("inactive");
```

---

## 3. Why DOM Manipulation Is Hard to Scale

[SOURCE — COURSE MATERIAL]

### The TODO App Problem

```js
// BAD: imperative DOM manipulation for a TODO app
let todos = [];

function addTodo(text) {
  const li = document.createElement("li");
  li.textContent = text;
  li.setAttribute("id", `todo-${todos.length}`);
  document.getElementById("list").appendChild(li);
  todos.push({ text, completed: false });
}

// Now what if you get updated todos from a server?
// You only have addTodo — no updateTodo, removeTodo
// The DOM and your data are out of sync!
```

### The Core Problem: No Central State

```
Data (todos array)        DOM elements
      │                        │
      ↓                        ↓
  [updated]              [out of sync]
```

When data changes, you have to manually figure out which DOM elements to add/remove/update. This doesn't scale.

### The Dumb Solution (Clear Everything)

```js
function renderTodos(todos) {
  const list = document.getElementById("list");
  list.innerHTML = ""; // clear all
  todos.forEach((todo) => addTodo(todo)); // re-add all
}
```

**Problem:** Destroys and recreates all DOM nodes even if only one changed. Terrible for performance.

### The Ideal Solution

```
State (data) → "Diff" function → Minimal DOM updates

Developer updates state → Framework figures out what changed → Updates only those DOM nodes
```

This is exactly what React does.

---

## 4. Why Frontend Frameworks Exist

[SOURCE — COURSE MATERIAL]

### The Evolution

```
1995-2000: Vanilla JS / Direct DOM manipulation
     ↓ (got painful, code became spaghetti)

2006-2010: jQuery (simplified DOM manipulation + cross-browser)
     ↓ (still messy for large apps, no state management)

2013+: Angular, React, Vue (declarative + state management)
     ↓

Today: React dominates, Vue/Svelte alternatives
```

### What React Solves

```
Problem:          Solution:
─────────         ─────────
No central state  → useState hook (single source of truth)
Manual DOM sync   → React reconciler (Virtual DOM diffing)
Code repetition   → Components (reusable UI pieces)
Hard to read      → JSX (HTML-like syntax in JS)
```

### The Three Things You Need for a Dynamic UI

1. **Update a state variable** (developer's job)
2. **Diff old vs new state** (React's job — the reconciler)
3. **Apply minimal DOM changes** (React's job)

---

## 5. Introduction to React

[SOURCE — COURSE MATERIAL]

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

### React Is Just JS + JSX

```jsx
// JSX — looks like HTML but is JavaScript
// Gets compiled to: React.createElement('div', {className: 'box'}, 'Hello')
function MyComponent() {
  return (
    <div className="box">
      {" "}
      {/* class → className in JSX */}
      <h1>Hello React</h1>
      <p>World</p>
    </div>
  );
}
```

**Under the hood:**

```
Your JSX code → Babel/Vite compiler → React.createElement() calls → DOM updates
```

---

## 6. MongoDB Deep Dive — CRUD with Mongoose

[SOURCE — COURSE MATERIAL]

### 3 Database Jargons

```
Cluster (deployed server group)
  └── Database (logical partition, e.g., "courseapp")
       ├── Collection = Table (e.g., "users")
       └── Collection (e.g., "courses")
```

### Why HTTP Server Over Direct DB Access?

```
Browser ──✗──→ MongoDB       (won't work)
Browser ──→ Express ──→ MongoDB  (correct)
```

Reasons:

1. Browsers don't speak MongoDB's binary protocol
2. MongoDB has no fine-grained user permission system
3. HTTP server provides auth, rate limiting, business logic

### Complete Mongoose Schema Setup

```js
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI);

// User schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

// Course schema
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: String,
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
});

// Purchase schema (join/relation)
const PurchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  purchasedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Course = mongoose.model("Course", CourseSchema);
const Purchase = mongoose.model("Purchase", PurchaseSchema);
```

### CRUD Operations

```js
// CREATE
const user = await User.create({
  username: "alice",
  email: "alice@test.com",
  password: hashedPassword,
});

// READ — various patterns
const allUsers = await User.find({});
const oneUser = await User.findOne({ username: "alice" });
const byId = await User.findById(userId);
// With filter
const expCourses = await Course.find({ price: { $gt: 1000 } });
// Populate (join)
const user = await User.findById(id).populate("purchasedCourses");

// UPDATE
await User.updateOne(
  { _id: userId }, // filter
  { $set: { email: "new@email.com" } }, // update
);
const updated = await User.findByIdAndUpdate(
  id,
  { email: "new@email.com" },
  { new: true }, // return updated doc
);

// DELETE
await User.deleteOne({ _id: userId });
await User.findByIdAndDelete(id);
```

### Custom Schema Methods

[SOURCE — COURSE MATERIAL]

```js
// Attach methods to schema
UserSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Use on instance
const user = await User.findOne({ email });
const valid = await user.isValidPassword(inputPassword);
```

### Full Auth + DB Example

```js
app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    if (err.code === 11000) {
      // duplicate key
      return res.status(409).json({ message: "Username taken" });
    }
    res.status(500).json({ message: "Server error" });
  }
});
```

---

## Exercises

### Quick (15 min)

Create a static HTML page with two input boxes and a button. On button click, fetch the sum from `https://sum-server.100xdevs.com/sum?a=X&b=Y` and display it.

**Hint 1:** Use `fetch` with query params  
**Hint 2:** `document.getElementById('result').textContent = data.answer`

---

### Intermediate (45 min)

Build a course catalog API with MongoDB:

- `POST /course` — create a course (admin only, JWT auth)
- `GET /courses` — list all courses (public)
- `POST /purchase` — purchase a course (user auth)
- `GET /purchased` — get user's purchased courses

---

### Challenge (3 hours)

Build a full-stack mini-project:

- Frontend HTML page that shows courses
- Backend Express API with MongoDB
- Users can sign up, sign in, purchase courses
- Protected routes via JWT
- No React yet — raw DOM manipulation only

---

## Common Confusions

| Confusion                        | Reality                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------- |
| "`document` exists in Node.js"   | No. `document` is browser-only. In Node use `fs`, not `document`.            |
| "MongoDB stores tables"          | It stores collections of documents (JSON-like). Tables are SQL terminology.  |
| "`update` replaces the document" | Without `$set`, yes! Always use `{ $set: {...} }` to update specific fields. |
| "React replaces HTML"            | React compiles TO HTML. The browser still renders HTML in the end.           |

---

## Key Takeaways

- The DOM is the browser's live tree of HTML elements — JS can read/modify it
- Raw DOM manipulation doesn't scale → React abstracts it with state + reconciliation
- MongoDB stores JSON documents in collections; Mongoose adds schema validation
- CRUD = Create, Read, Update, Delete — the four database primitives
- Always use `$set` in MongoDB updates to avoid accidentally overwriting whole documents
