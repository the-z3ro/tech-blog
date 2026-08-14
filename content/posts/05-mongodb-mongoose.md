---
title: "05 : MongoDB and Mongoose - Persisting the Blog"
date: 2026-08-13T12:00:00+05:30
draft: false
tags: ["mongodb", "mongoose", "database"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 5
description: "Clusters to collections, schemas to models, CRUD, populate, and a full auth plus DB blog backend. The single DB source for this series."
cover:
  image: ""
  alt: ""
  caption: ""
---

My blog API worked until I restarted the server. Every post vanished. Every author gone. That is what in memory storage does. It lives in RAM, dies on restart, and never shares between two server instances.

This post fixes that with MongoDB for storage and Mongoose for structure. Same routes and auth from post 04, but data survives.

<details>
<summary>Prereqs to run this file</summary>

- Post 04 auth flow working. Folder: `blog-platform`.
- Installs: `npm install mongoose dotenv`. Check with `node -e "require('mongoose'); console.log('ok')"`.
- Env: `.env` needs `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/blogdb` and `JWT_SECRET=dev-only-change-in-prod`. Copy from `.env.example` block below. Atlas free cluster works: create cluster, allow IP for learning, create DB user, paste the srv string.
- If connect hangs with timeout, `MONGO_URI` is missing or IP not allowed. The fail fast check in the connect snippet prints `Set MONGO_URI in .env first`.
- Full file vs Fragment: schema plus route blocks with imports and `app.listen` are Full files. CRUD one liners are Fragments to run inside an async handler.

</details>

## Why an outside database

Two problems force the move:

```
Problem 1: restart wipes arrays
Problem 2: two servers do not share memory
Fix: outside database both servers talk to
```

Architecture we use from here:

```
Browser -> Express (auth, validation, logic) -> MongoDB
```

Why not let browsers hit Mongo directly? Three reasons I learned the hard way:

1. Browsers do not speak Mongo wire protocol
2. Mongo has no per user row rules like "only edit your drafts"
3. Exposing DB creds in frontend JS hands everyone your password

Express stays in the middle to check JWT, validate with Zod, and enforce ownership. DB just stores.

> Try it yourself: list what breaks if you keep the array version and run two servers on ports 3000 and 3001 behind a load balancer.

<details>
<summary>Solution</summary>

Signup on 3000 creates an author in server A memory. Login on 3001 misses it and returns invalid login. Posts created on A never show on B. Restart of either wipes its half.

Why: each Node process has its own heap. Arrays are not shared. Outside DB gives one shared truth both processes read.

Common mistake: thinking `app.listen` twice in one file shares memory across machines. It shares inside one process only. Separate deploys still split.

</details>

## Clusters, databases, collections

Mongo terms map to familiar ideas:

```
Cluster (group of servers Atlas runs for you)
  Database (like blogdb)
    Collection users (like a table)
      Document { username: eshan } (like a row, JSON style)
    Collection posts
    Collection comments
```

Mongo itself is schemaless. You can insert any shape into a collection. That freedom bites later when one post has `title` and another has `Title`. **Mongoose** adds schemas on top for validation and autocomplete. I use it for every Node plus Mongo project now.

Setup:

```bash
npm install mongoose
npm install dotenv
```

```bash
# .env.example for this post, copy to .env
# Full file vs Fragment: keep this file at project root, never commit real .env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/blogdb
JWT_SECRET=dev-only-change-in-prod
PORT=3000
```

```js
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Set MONGO_URI in .env first");
  await mongoose.connect(uri);
  console.log("Mongo connected");
}
```

Why env var and not hardcoded string? Connection strings hold passwords. Hardcoding leaks them to Git. I keep `.env` local and `.env.example` committed with fake values. If `MONGO_URI` is missing, fail fast with a clear message instead of a timeout later.

Atlas quick path: create free cluster, add IP `0.0.0.0/0` for learning (lock down later), create user and password, copy the `mongodb+srv://` string into `.env` as `MONGO_URI`.

## Schemas and models for authors, posts, comments

This is the single canonical schema for the series. Old drafts had users plus admins plus courses plus purchases in two posts with drift. This version keeps the same relations but in blog words so the thread stays clean.

```js
const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, minlength: 3 },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    published: { type: Boolean, default: false },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
  },
  { timestamps: true },
);

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    text: { type: String, required: true, minlength: 1 },
  },
  { timestamps: true },
);

// Helper method on schema, keeps password logic with the model
AuthorSchema.methods.isValidPassword = async function (plain) {
  const bcrypt = require("bcrypt");
  return bcrypt.compare(plain, this.password);
};

const Author = mongoose.model("Author", AuthorSchema);
const Post = mongoose.model("Post", PostSchema);
const Comment = mongoose.model("Comment", CommentSchema);
```

Why `ref` fields? They store ObjectIds that point to other collections. Later `populate` swaps the id for the real doc, like a join without SQL.

Why `timestamps: true`? Adds `createdAt` and `updatedAt` free. Sorting posts by newest and showing "edited 2h ago" needs these. I add it to every schema by default now.

Why `unique: true` on username? It creates an index that rejects duplicates at the DB level. App checks can race when two signups arrive together. The index is the real guard. Handle code `11000` for duplicate key.

> Try it yourself: add a `tags: [String]` field to Post with default empty array, and a `views` number with default 0. What do new posts get when you omit both?

<details>
<summary>Solution</summary>

```js
tags: { type: [String], default: [] },
views: { type: Number, default: 0 },
```

New posts get `tags: []` and `views: 0` without sending them. Why defaults matter: frontend code can always map over tags and add to views without null checks.

Common mistake: `type: Array` without element type. That allows mixed junk like numbers inside tags. `[String]` enforces every item is a string.

</details>

## CRUD, the four ops you will use daily

Create, read, update, delete. Same words as the array version, now against Mongo.

```js
// CREATE
const author = await Author.create({
  username: "eshan",
  email: "eshan@example.com",
  password: hashedPassword,
});

const post = await Post.create({
  title: "Hello",
  content: "World with enough length",
  authorId: author._id,
});

// READ
const allPosts = await Post.find({});
const one = await Post.findOne({ title: "Hello" });
const byId = await Post.findById(post._id);
const popular = await Post.find({ views: { $gt: 100 } });

// READ with join, author details inline
const withAuthor = await Post.findById(post._id).populate(
  "authorId",
  "username email",
);

// UPDATE, always $set for partial
await Post.updateOne({ _id: post._id }, { $set: { title: "Hello edited" } });
const updated = await Post.findByIdAndUpdate(
  post._id,
  { $set: { published: true } },
  { new: true },
);

// DELETE
await Post.deleteOne({ _id: post._id });
await Comment.findByIdAndDelete(someCommentId);
```

Why `$set`? Without it, `updateOne({_id}, { title: "x" })` replaces the whole doc with only title in some drivers. With `$set`, only listed fields change. I treat missing `$set` as a bug in review.

Why `{ new: true }`? `findByIdAndUpdate` returns the old doc by default. New true returns the updated one, which is what you want to send back to the client right after edit.

Why `populate` second arg `"username email"`? It limits fields. Without it you might send password hashes to the frontend. I never populate without a field list on author refs.

> Try it yourself: find all published posts by one author, sorted newest first, limit 5.

<details>
<summary>Solution</summary>

```js
const list = await Post.find({ authorId: someId, published: true })
  .sort({ createdAt: -1 })
  .limit(5);
```

Why chain works: Mongoose queries build up until awaited. Sort minus one means descending. Limit keeps payload small for feeds.

Common mistake: `Post.find({ authorId: "string-id" })` with wrong type sometimes misses when strict casting is off. Store ObjectIds from created docs or convert with `new mongoose.Types.ObjectId(id)`.

</details>

## Full auth plus DB, the version to copy

This merges the JWT flow from post 04 with real storage. Same routes, no more arrays.

```js
require("dotenv").config(); // needs npm install dotenv
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Models from schema section above, same file for learning, split to models/ in real apps
const Author = mongoose.model("Author");
const Post = mongoose.model("Post");

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-in-prod";

mongoose.connect(process.env.MONGO_URI).then(() => console.log("DB up"));

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(403).json({ error: "No token" });
  }
  try {
    const d = jwt.verify(h.split(" ")[1], JWT_SECRET);
    req.authorId = d.authorId;
    next();
  } catch {
    return res.status(403).json({ error: "Bad token" });
  }
}

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const author = await Author.create({ username, email, password: hash });
    const token = jwt.sign({ authorId: author._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ token });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: "Username taken" });
    }
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/posts", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(411).json({ error: "title and content required" });
  }
  const post = await Post.create({
    title,
    content,
    authorId: req.authorId,
  });
  res.status(201).json(post);
});

app.get("/mine", authMiddleware, async (req, res) => {
  const posts = await Post.find({ authorId: req.authorId }).sort({
    createdAt: -1,
  });
  res.json({ posts });
});

// Full file needs a listener, add at bottom to run
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Blog DB API on ${PORT}`));
```

Why catch `11000` specifically? That is Mongo duplicate key. Mapping it to 409 tells the frontend "pick another name" instead of generic 500. I check `e.code` right after create for every unique field.

Why sign with `_id` and not username? Ids never change. Usernames can. Token stays valid after a rename when it holds the id.

## Patterns from real Mongo work

**One schema file per model, one db file for connect.** `models/Author.js`, `models/Post.js`, `db.js`. Routes import models, never define schemas inline. When Post gains `views`, you edit one file.

**Validate twice, for different reasons.** Zod checks shape at the API edge for nice 411s. Mongoose schema enforces at storage for safety when other scripts write directly. Skipping either leaves a hole.

**Index what you query by.** `authorId`, `published`, `createdAt` need indexes once posts grow. Without them, list pages scan everything and slow down. Add `PostSchema.index({ authorId: 1, createdAt: -1 })` early.

