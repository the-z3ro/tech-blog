---
title: "08 : Debugging Like a Developer - Read Errors, Use Breakpoints, Fix Bugs Fast"
date: 2026-10-06T10:00:00+05:30
draft: false
tags: ["debugging", "tooling", "node"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 800
description: "Read stack traces, log with intent, use the VS Code debugger, check the network tab, and follow a repeatable method to fix any bug."
aliases: ["/posts/05-debugging-like-a-dev/", "/posts/debugging-like-a-dev/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

When my cheap assembled PC kept crashing, I learned to troubleshoot by isolating the problem: remove everything except one RAM stick, swap one part, test again. The method that finds a bad stick of RAM is the same one that finds a bad line of code. This table is the whole post in miniature.

| Hardware troubleshooting | Debugging code |
| ------------------------ | -------------- |
| Does it crash every time? | Reproduce the bug reliably |
| Remove parts until it stops crashing | Shrink the code until only the bug is left |
| Swap one part at a time | Change one thing at a time |
| Event Viewer and error codes | The error message and the stack trace |
| Reinstall as the last resort | `git restore`, or go back to a known good commit |

> **Where we are:** A working in-memory API. After this post you know how to figure out why it breaks.
>
> **Phase 01** · Backend · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** reading errors, labeled logging, the VS Code debugger, the Network tab, a repeatable method.  
> **Not today:** Profilers and production monitoring. Later, when we deploy.
>
> **Time:** about 15 minutes to read, 40 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, write the five `curl` flags or Postman steps you would use to test `POST /posts`. Then check [the Express post](../07-node-http-and-express/).

<details>
<summary>Prereqs to run this file</summary>

- Node 22 or 24 LTS and the `blog-platform` folder from the last posts. Check with `node -v`.
- Express installed: `npm install express`. If you are not there yet, finish [the Express post](../07-node-http-and-express/) first.
- VS Code, and a browser with DevTools (F12 or right click, Inspect).

</details>

## Part 1 of 6: Read the error, the whole error

Here is a real crash. Do not skim it, read it like a sentence.

```
TypeError: Cannot read properties of undefined (reading 'title')
    at /Users/you/blog-platform/server.js:11:15
    at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)
    at next (node_modules/express/lib/router/route.js:149:13)
```

Three things to notice:

1. **First line is what happened.** A property called `title` was read from something that is `undefined`.
2. **The first line that mentions your file is where.** `server.js:11:15` means file, line 11, column 15. Ignore the `node_modules` lines, those are the library reporting that your code called it.
3. **So the real question is: why is the thing before `.title` undefined?** You are no longer hunting a mystery, you are checking one variable.

> Checkpoint: for any error, you can say out loud "what happened" and "which line of mine". If you can, you are already ahead of where I was.

## Part 2 of 6: console.log, but on purpose

Logging is not shameful. It is the fastest tool you own. The trick is to log with a plan, not a spray.

```js
const post = posts.find((p) => p.id === req.params.id);
console.log("params.id:", req.params.id, typeof req.params.id);
console.log("found:", post);
console.table(posts);          // arrays of objects as a readable table
console.log(JSON.stringify(post, null, 2)); // see nested data fully
```

Rules I follow:

- **Label every log.** `console.log("found:", post)` beats `console.log(post)` when you have ten of them.
- **Log the input and the output of the suspicious line,** not random places.
- **Log `typeof` when a comparison fails.** Strings versus numbers cause a huge share of beginner bugs.
- **Delete the logs after.** A server that prints noise forever hides the next real problem.

> Try it yourself: `"1" === 1`. What does it print, and what would `typeof` tell you about each side?

<details>
<summary>Solution</summary>

```js
console.log("1" === 1);        // false
console.log(typeof "1");       // string
console.log(typeof 1);         // number
```

Why: `===` also compares type. URL params always arrive as strings, so `req.params.id === 1` is never true.

Common mistake: switching to `==` to make it pass. It hides the type problem instead of fixing it. Convert with `Number(req.params.id)`.

</details>

## Part 3 of 6: The real debugger, in VS Code

Logs show you what you guessed to look at. A debugger lets you pause time and look at everything.

1. Open the Command Palette (Ctrl or Cmd + Shift + P) and run **JavaScript Debug Terminal**.
2. Click the gutter left of a line number to set a **breakpoint** (a red dot).
3. In that terminal run `node server.js`, then hit the route.
4. Execution stops on your red dot. Hover over any variable to see its value.
5. Use the toolbar: **Continue** (run to the next breakpoint), **Step Over** (next line), **Step Into** (go inside the function being called).

You do not need more than that. Pausing right before the crashing line and hovering over variables solves most bugs in under two minutes.

> Checkpoint: you hit a breakpoint, the line turns yellow, and hovering over `req.params.id` shows the value in quotes. Those quotes are the clue: it is a string.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Debug the network, not just the code*.

## Part 4 of 6: Debug the network, not just the code

Half of "my frontend is broken" bugs are really "the request is wrong". Look at the request before you touch code.

In the browser, open **DevTools, Network tab**, reload, and click the request:

- **Status:** 200 fine, 401 not logged in, 404 wrong URL, 500 your server crashed.
- **Payload:** what you actually sent. Is `title` really in the body?
- **Response:** what came back. Is it JSON, or an HTML error page?

From the terminal, `curl` gives you the same truth without a browser:

```bash
curl -i http://localhost:3000/posts/1
curl -i -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","content":"First post body here"}'
```

`-i` prints the status line and headers too. If `curl` works but your frontend fails, the bug is in the frontend (or CORS). If `curl` also fails, the bug is in the server. That single test splits the problem in half.

## Part 5 of 6: The method: shrink, guess one thing, change one thing

When there is no useful error, use this loop. It works on every bug, in every language.

1. **Reproduce it.** Find the exact steps that trigger it, every time.
2. **Shrink it.** Remove code until the smallest version still fails. The bug usually becomes obvious here.
3. **Guess one thing.** "I think `id` is a string." Write it down.
4. **Change one thing** and test. If you change three things you will not know which fixed it.
5. **Explain it out loud** to a rubber duck, a friend, or the chat. Saying it wrong often shows you the answer.

If you are stuck for 20 minutes, go for a walk, drink water, or write the problem as a question. When you do ask for help, include the exact error, the file, and what you already tried. That is how you get answers fast.

## Part 6 of 6: The decoder: errors you will meet this month

| Message | What it usually means | First thing to check |
| ------- | --------------------- | -------------------- |
| `Cannot read properties of undefined` | You used `.something` on a missing value | Log the thing before the dot |
| `X is not defined` | Typo, or never imported | Spelling, `require` or `import` line |
| `EADDRINUSE` | Port already used | Old server still running, Ctrl + C it |
| `Unexpected token < in JSON` | You expected JSON, got an HTML page | Check the URL in the Network tab |
| CORS error in the browser | Server did not allow your frontend origin | `app.use(cors())` on the backend |
| `Cannot destructure property of req.body` | Body not parsed | `app.use(express.json())` |
| 401 or 403 | Not logged in, or not allowed | Is the token sent in the header? |
| `Cannot GET /something` | No route for that path or method | Route spelling and HTTP method |

## Patterns I follow

- **Read the first line and the first line of your file.** That is 80 percent of the answer.
- **Fix the first error first.** Later errors are often just echoes of it.
- **Do not trust, verify.** "It should work" is a guess. A log or a breakpoint is evidence.
- **Version control is your undo.** Commit before a risky change. If you break it worse, `git restore .` takes you back.
- **A bug you fixed once is a bug you document.** One line in your notes saves you next month.

## Solo rep: Break it three ways, then explain

> **Level 2: Peek once.** Read the code once, hide it, and type it from memory. Peek again only when stuck. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

Break your own working server in three ways: a wrong param type, a missing `await`, and a missing body parser. For each, write down the exact error text, the line, and the one line fix. Do it from memory the next day.

When you finish, explain your approach in two sentences, out loud or in a note. If you cannot explain it, you do not own it yet.

## Projects

Three buggy routes live in one file. Your job is to find each bug using this post's method, not by guessing. Save this as `buggy.js`:

```js
// buggy.js
const express = require("express");
const app = express();

const posts = [
  { id: 1, title: "Hello", views: 10 },
  { id: 2, title: "Second", views: 4 },
];
const authors = [{ id: 1, name: "Eshan" }];

async function getAuthor(id) {
  return authors.find((a) => a.id === id);
}

app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  res.json({ title: post.title });
});

app.get("/authors/:id", async (req, res) => {
  const author = getAuthor(Number(req.params.id));
  res.json({ name: author.name });
});

app.post("/posts", (req, res) => {
  const { title } = req.body;
  posts.push({ id: posts.length + 1, title, views: 0 });
  res.status(201).json(posts);
});

app.listen(3000, () => console.log("up on 3000"));
```

### 1. Bug hunt: the post that crashes

Run the file and open `/posts/1`. Find why it crashes, using the error message first, then fix it so `/posts/1` returns the title and `/posts/99` returns a 404.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```js
app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json({ title: post.title });
});
```

Why: `req.params.id` is a string, so `p.id === "1"` never matches and `find` returns `undefined`. The crash line was `post.title`, but the real bug was one line earlier.

Common mistake: only fixing the crash with `post?.title`. That hides the bug and returns an empty response instead of a clear 404.

</details>

### 2. Bug hunt: the silent bug

Open `/authors/1`. There is no crash, but the response is `{}`. Find out why without staring at the code. Use a log.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```js
app.get("/authors/:id", async (req, res) => {
  const author = await getAuthor(Number(req.params.id));
  console.log("author:", author);
  if (!author) return res.status(404).json({ error: "Author not found" });
  res.json({ name: author.name });
});
```

Why: `getAuthor` is `async`, so it returns a Promise. Without `await`, `author` is `Promise { <pending> }` and `author.name` is `undefined`, which JSON drops. Logging `author` shows the Promise immediately.

Common mistake: assuming no error means no bug. Silent wrong output is the hardest kind, so log the value before you use it.

</details>

### 3. Bug hunt: the vanishing body

Send a POST with `curl` (see the network section). It crashes with a destructure error. Fix it and prove it works with `curl -i`.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```js
app.use(express.json()); // add this above your routes
```

Then:

```bash
curl -i -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Third"}'
```

Why: without `express.json()`, Express never parses the body, so `req.body` is `undefined` and destructuring it throws.

Common mistake: forgetting the `Content-Type: application/json` header. Even with the middleware, the body will not be parsed without it.

</details>

## Cheat sheet

- Read the first line of the error, then the first line that mentions your file
- Log with labels: `console.log("found:", post)`
- `typeof x` when a comparison fails
- Breakpoint: click the gutter, run in the JavaScript Debug Terminal, hover variables
- Network tab: status, payload, response
- `curl -i` splits "frontend bug" from "server bug"
- Method: reproduce, shrink, guess one thing, change one thing
- Fix the first error first

## If lost / If bored

- If lost: write the error's first line on paper, then circle the first line that mentions your file. Check only that line and the variable before the dot.
- If bored: break your own working server on purpose in three different ways and predict each error message before you run it.
- Keep for next: this method. [The middleware post](../09-middleware-and-zod/) adds middleware and validation, which means many more places for things to go wrong, and now you know how to look.

## What breaks next

You can find bugs now. Better is making fewer of them: how do you stop bad input at the door?

[Where we are and what is next](../progress/)
