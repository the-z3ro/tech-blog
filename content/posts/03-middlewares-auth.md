---
title: "03 : Middlewares, Authentication, Zod & MongoDB"
date: 2026-03-13T23:22:09+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 3
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

> **Blog Summary:** Adds production patterns to the Express server: middleware chains, JWT-based auth, schema validation with Zod, and persistent storage with MongoDB via Mongoose.

---

## 1. Middlewares

[SOURCE — COURSE MATERIAL]

### The Problem

Every route needs auth checks, input validation, logging. Repeating these in every handler is messy.

```js
// BAD — repeated logic in every route
app.get("/kidney", (req, res) => {
  // auth check here
  // input validation here
  // actual logic here
});

app.put("/kidney", (req, res) => {
  // auth check here (copied!)
  // input validation here (copied!)
  // actual logic here
});
```

### What Is Middleware?

A function that runs **between** the request and the route handler. Has access to `req`, `res`, and `next`.

**Hospital analogy:**

```
Patient enters → Insurance check → Blood test → BP check → Doctor
Request arrives → Auth check → Input validation → Logger → Route handler
```

### Middleware Syntax

```js
// Define middleware
function authMiddleware(req, res, next) {
  const username = req.headers.username;
  const password = req.headers.password;

  if (username !== "admin" || password !== "secret") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  next(); // pass control to next middleware/handler
}

function inputValidation(req, res, next) {
  const kidneyId = Number(req.query.kidneyId);
  if (isNaN(kidneyId) || kidneyId < 1 || kidneyId > 2) {
    return res
      .status(411)
      .json({ message: "Invalid kidney ID (must be 1 or 2)" });
  }
  next();
}

// Apply to specific route
app.get("/kidney", authMiddleware, inputValidation, (req, res) => {
  res.json({ message: "Kidney data" });
});

// Apply to all routes
app.use(authMiddleware);
```

### Global Error Handler

```js
// Must have 4 params to be recognized as error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// In routes, trigger it with next(err)
app.get("/data", (req, res, next) => {
  try {
    // risky operation
  } catch (err) {
    next(err); // forwards to error handler
  }
});
```

### Global Request Counter (Assignment Example)

```js
let requestCount = 0;

app.use((req, res, next) => {
  requestCount++;
  console.log(`Request #${requestCount}: ${req.method} ${req.url}`);
  next();
});
```

---

## 2. Input Validation with Zod

[SOURCE — COURSE MATERIAL]

### The Problem with Manual Validation

```js
// Manual — doesn't scale
if (!req.body.username || typeof req.body.username !== "string") {
  return res.status(411).json({ error: "Invalid username" });
}
if (!req.body.age || req.body.age < 1 || req.body.age > 120) {
  return res.status(411).json({ error: "Invalid age" });
}
// What if there are 20 fields?
```

### Zod — Schema Validation

```bash
npm install zod
```

```js
const { z } = require("zod");

// Define schema
const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  age: z.number().min(1).max(120),
  password: z.string().min(8),
});

// Use in middleware or route
app.post("/signup", (req, res) => {
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(411).json({
      errors: result.error.errors,
    });
  }

  // result.data is now type-safe and validated
  const { username, email, age, password } = result.data;
  // ... proceed with signup
});
```

**Zod types cheat sheet:**

```js
z.string()              // string
z.string().email()      // valid email
z.string().url()        // valid URL
z.number()              // number
z.number().min(0)       // non-negative
z.boolean()             // boolean
z.array(z.string())     // array of strings
z.enum(['admin','user']) // one of these values
z.optional(z.string())  // optional field
z.object({ ... })       // nested object
```

---

## 3. Authentication

[SOURCE — COURSE MATERIAL]

### Why Authentication?

Anyone can hit your backend with Postman. Auth ensures only legitimate users access protected resources.

### Key Cryptography Concepts

**Hashing:**

- One-directional — cannot reverse
- Same input → same output always
- Tiny input change → completely different output
- Use for **storing passwords**

```js
const bcrypt = require("bcrypt");

// Store password
const hashed = await bcrypt.hash("mypassword", 10);
// "$2b$10$..." — never store plaintext

// Check password on login
const matches = await bcrypt.compare("mypassword", hashed);
// true or false
```

**Encryption:**

- Two-directional (encrypt + decrypt)
- Requires a key/password
- Used for data that needs to be retrieved

**JWT (JSON Web Tokens):**

- Neither hashing nor encryption — it's a **digital signature**
- Anyone can decode the payload (it's base64)
- But only the server with the secret can **verify** it's valid
- Structure: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.ABC123...
     header (base64)    payload (base64)   signature
```

**Local Storage:**

- Browser storage (persists across page reloads)
- Commonly used to store JWT tokens
- [ADDED — EXPLANATION] For more security, `httpOnly cookies` are preferred over localStorage (not accessible via JS)

### Auth Flow

```
Signup:
  1. User sends {username, password}
  2. Server hashes password, stores in DB
  3. Server returns JWT token

Login (Signin):
  1. User sends {username, password}
  2. Server finds user, compares hashed passwords
  3. If match: server returns JWT token

Protected Routes:
  1. User sends request with JWT in Authorization header
  2. Server verifies JWT signature
  3. If valid: allow access, extract userId from payload
```

### Implementation with jsonwebtoken

```bash
npm install jsonwebtoken
```

```js
const jwt = require("jsonwebtoken");
const JWT_SECRET = "your-secret-key-use-env-variable-in-production";

// Sign a token (on login/signup)
const token = jwt.sign(
  { userId: user._id, username: user.username }, // payload
  JWT_SECRET,
  { expiresIn: "7d" }, // token expires in 7 days
);

// Verify token (middleware)
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  // Expected format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // attach to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}
```

### Complete Signup/Signin Example

```js
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());

const users = []; // in-memory for now
const JWT_SECRET = "mysecret";

app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  users.push({ username, password }); // TODO: hash in production!
  res.json({ message: "User created" });
});

app.post("/signin", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    return res.status(403).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET);
  res.json({ token });
});

app.get("/users", authMiddleware, (req, res) => {
  const userList = users.map((u) => ({ username: u.username }));
  res.json({ users: userList });
});
```

---

## 4. Fetch API (Browser-Side HTTP)

[SOURCE — COURSE MATERIAL]

### Three Ways to Send HTTP Requests

1. **Browser address bar** — GET only
2. **Postman** — all methods, manual testing
3. **Fetch API** — programmatic, from your own code (frontend JS)

```js
// Browser / frontend JavaScript
async function getUsers() {
  try {
    const response = await fetch("https://api.example.com/users");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Request failed:", error);
  }
}

// POST with body and headers
async function login(username, password) {
  const response = await fetch("https://api.example.com/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  return data;
}
```

---

## 5. MongoDB & Mongoose

[SOURCE — COURSE MATERIAL]

### Why Not In-Memory?

```
Problem 1: Server restarts wipe all data
Problem 2: Multiple server instances don't share memory
Solution: External database
```

### Architecture

```
Browser → Express Server → MongoDB
              ↑
         Auth, logic,
         business rules
```

**Why can't users hit DB directly?**

1. Browsers don't speak MongoDB's protocol
2. DBs have no concept of per-user access control
3. Exposing DB directly = security disaster

### MongoDB Concepts

```
Cluster (group of servers)
  └── Database (e.g., "myapp")
       ├── Collection/Table (e.g., "users")
       │    ├── Document: { name: "Alice", age: 25 }
       │    └── Document: { name: "Bob", age: 30 }
       └── Collection (e.g., "courses")
```

- **Schemaless** — no fixed structure enforced by DB itself
- **Mongoose** — adds schema on top for validation & autocomplete

### Mongoose CRUD

```bash
npm install mongoose
```

```js
const mongoose = require("mongoose");

// 1. Connect
mongoose.connect("mongodb+srv://user:pass@cluster.mongodb.net/myapp");

// 2. Define Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// 3. Create Model
const User = mongoose.model("User", userSchema);

// CREATE
const newUser = new User({
  username: "alice",
  email: "alice@ex.com",
  password: "hash",
});
await newUser.save();
// or:
await User.create({ username: "bob", email: "bob@ex.com", password: "hash" });

// READ
const allUsers = await User.find({});
const alice = await User.findOne({ username: "alice" });
const byId = await User.findById("64abc123...");

// UPDATE
await User.updateOne(
  { username: "alice" },
  { $set: { email: "new@email.com" } },
);
await User.findByIdAndUpdate(id, { email: "new@email.com" }, { new: true });

// DELETE
await User.deleteOne({ username: "alice" });
await User.findByIdAndDelete(id);
```

### Course App Data Model

```js
// Users
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  age: Number,
});

// Admins
const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
});

// Courses
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
});

// Purchases (join table)
const purchaseSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  courseId: mongoose.Schema.Types.ObjectId,
  timestamp: { type: Date, default: Date.now },
});
```

---

## Exercises

### Quick (15 min)

Add a middleware to an Express app that logs `METHOD /path — timestamp` for every request.

**Hint 1:** `app.use((req, res, next) => { ... })`  
**Hint 2:** `new Date().toISOString()` for timestamp

---

### Intermediate (45 min)

Build a full auth system:

- `POST /signup` — create user with hashed password (use bcrypt)
- `POST /signin` — return JWT if credentials match
- `GET /profile` — protected route, return user info from JWT payload

**Hint 1:** `jwt.sign({ userId }, secret, { expiresIn: '1d' })`  
**Hint 2:** Extract token: `req.headers.authorization.split(' ')[1]`

---

### Challenge (2–3 hours)

Build a **course marketplace** backend with MongoDB:

- Admins can create courses
- Users can sign up, sign in, purchase courses
- Users can only see courses they've purchased
- Proper auth on all protected routes using Zod validation

---

## Common Confusions

| Confusion                             | Reality                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| "JWT is encrypted"                    | No. Payload is base64-encoded (decodable). The signature verifies integrity. |
| "Hashing and encryption are the same" | Hashing is one-way. Encryption is reversible.                                |
| "`next()` is optional"                | Without `next()`, request will hang. Always call it OR send a response.      |
| "MongoDB is truly schemaless"         | MongoDB is, but Mongoose adds schemas for safety. Use them.                  |

---

## Key Takeaways

- Middleware = reusable request processing (auth, validation, logging)
- Use Zod for schema validation — scales far better than manual if/else
- JWT flow: sign on login → send in Authorization header → verify on protected routes
- MongoDB is schemaless but Mongoose adds structure — use schemas
- Architecture: Browser ↔ Express ↔ MongoDB (users never touch DB directly)
