---
title: "06 : DOM to React Bridge - Why Raw DOM Breaks"
date: 2026-08-20T13:00:00+05:30
draft: false
tags: ["dom", "frontend", "react", "vite"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 6
description: "Browser JS vs Node, DOM trees and selectors, raw manipulation pain, and why React exists. Setup included first so you can follow along."
cover:
  image: ""
  alt: ""
  caption: ""
---

My backend served blog posts fine. Then I tried to show them without React. One list, three buttons, and my UI went out of sync with my data. Deleted posts still showed. Counts were wrong. I refreshed to fix it.

This post is that mess plus the way out. We set up React first, then break raw DOM on purpose so the React fix makes sense.

<details>
<summary>Prereqs to run this file</summary>

- Node LTS 20 or above. Two folders: `blog-platform` backend on `3000` for Project 3, `blog-frontend` for Vite below.
- Frontend: `npm create vite@latest blog-frontend -- --template react`, `npm install`, `npm run dev` gives `http://localhost:5173`.
- Backend for fetch project: keep post 03 or 05 API running on `3000`. Browser fetch from `:5173` to `:3000` needs CORS, run `npm install cors` in backend and add the two line `cors()` setup shown in the fetch project.
- Full file vs Fragment: `index.html` plus `script` blocks in Projects are Full files to save and open. Selector one liners are Fragments for console.

</details>

## Setup first, so nothing blocks you later

Old drafts put setup at the end. That never made sense. Do it now once.

```bash
npm create vite@latest blog-frontend -- --template react
cd blog-frontend
npm install
npm run dev
```

What you get:

```
blog-frontend/
  src/
    App.jsx      main component you edit
    main.jsx     entry, renders App into index.html
    components/  your own pieces go here
  index.html
  package.json
```

`npm run dev` starts a fast dev server with hot reload. Edit `App.jsx`, save, browser updates without manual refresh. `npm run build` makes the production bundle later.

Why Vite and not plain script tags? Script tags work for one file demos. Real apps need imports, JSX compile, and fast refresh. Vite gives that with zero config. Older tutorials show `create-react-app`. That tool is slow and now deprecated for new work. Use Vite.

If `npm run dev` prints a localhost URL, open it. You should see the Vite plus React starter. Keep it running while you read the DOM parts below. We return to it at the end.

> Try it yourself: change the `h1` text in `App.jsx`, save, and watch the browser update without refresh. Then stop the server with Ctrl+C and restart with `npm run dev`.

<details>
<summary>Solution</summary>

Open `src/App.jsx`, find the heading, change text to `My blog frontend`, save. Browser shows the new text in under a second.

Why it works: Vite watches files and pushes updates over websocket. No rebuild step from you.

Common mistake: editing files in `dist` after a build instead of `src`. `dist` is output. Always edit `src`, rebuild to refresh `dist`.

</details>

## Browser JS vs Node, same language different tools

JS runs in both, but the extra APIs differ. This is why `document` code crashes in Node and `fs` code crashes in the browser.

```
Browser JS:
  ECMAScript core
  + document, window
  + fetch
  + localStorage
  + setTimeout

Node.js:
  ECMAScript core
  + fs, http, path
  + process
```

Quick check in browser console (right click, Inspect, Console):

```js
console.log(typeof document); // object in browser
console.log(typeof window); // object in browser
```

Same lines in Node print `undefined`. Not a bug. Different runtime, different globals.

Why does this matter for the blog? Your Express code uses `fs` and `process.env`. Your frontend code uses `document` and `window`. Sharing helper files between them works only for pure logic like `slugify` or `readingTime`. Anything touching runtime APIs must stay on its side.

## DOM tree, selectors, and raw updates

**DOM** is the browser in memory view of the page as a tree of objects. HTML is static text. DOM is live and editable by JS.

```
HTML file:              DOM tree:
<html>                  document
  <body>                  html
    <div id=app>            body
      <h1>Hello</h1>          div#app
      <button>Click</button>    h1
                                button
```

Change the tree and the page changes instantly. That is dynamic UI at its simplest.

Selectors you will use constantly:

```html
<input id="readMins" type="number" placeholder="Minutes you read" />
<button onclick="showTime()">Save</button>
<div id="result"></div>
```

```js
function showTime() {
  const mins = document.getElementById("readMins").value;
  document.getElementById("result").textContent = `Saved ${mins} min read`;
}

// Other ways to grab elements
document.getElementsByClassName("post-card"); // live collection
document.querySelector("#readMins"); // first match, CSS style
document.querySelectorAll(".post-card"); // all matches
```

Rule I follow: classes for styling, ids for JS hooks. `.post-card` styles every card the same. `#publish-btn` targets one button to attach logic. Mixing them makes refactors painful when designers rename classes.

Create and edit nodes directly:

```js
// Create
const div = document.createElement("div");
div.textContent = "New draft saved";
div.className = "post-card";
div.setAttribute("data-id", "123");

// Add to page
document.getElementById("list").appendChild(div);

// Update
div.style.color = "green";
div.classList.add("fresh");
div.classList.remove("stale");

// Remove
div.remove();
```

Why `textContent` for user titles and `innerHTML` only for your own markup? `textContent` treats input as plain text. `innerHTML` parses it as HTML, so a title with `<script>` would run. For blog titles from users, always `textContent`. I use `innerHTML` only to clear a container I control, never to inject user strings.

> Try it yourself: make a page with an input and button that adds the input text as a new div inside `#list`. Use `textContent`, not `innerHTML`, for the input value.

<details>
<summary>Solution</summary>

```html
<input id="draftTitle" placeholder="Draft title" />
<button onclick="addDraft()">Add</button>
<div id="list"></div>

<script>
  function addDraft() {
    const val = document.getElementById("draftTitle").value;
    if (!val.trim()) return;
    const div = document.createElement("div");
    div.className = "post-card";
    div.textContent = val;
    document.getElementById("list").appendChild(div);
    document.getElementById("draftTitle").value = "";
  }
</script>
```

Why trim check: stops empty cards from blank spaces. Clearing input after add keeps flow fast for many drafts.

Common mistake: `list.innerHTML += "<div>" + val + "</div>"`. Works until someone types HTML. Then layout breaks or worse. `createElement` plus `textContent` avoids that class of bug.

</details>

## Where raw DOM falls apart

One add function feels fine. A real drafts page needs add, edit, delete, filter, and server sync. That is where manual DOM breaks.

```js
let drafts = [];

function addDraft(text) {
  const li = document.createElement("li");
  li.textContent = text;
  li.setAttribute("id", `draft-${drafts.length}`);
  document.getElementById("list").appendChild(li);
  drafts.push({ text, published: false });
}

// Now server returns updated drafts with one item edited.
// Which li do you update? Which do you remove?
// Array and DOM are out of sync and you have no map between them.
```

Core problem in one picture:

```
Data array        DOM nodes
  updated           stale
    |                 |
    Need manual code to reconcile every change
```

The naive fix is clear everything and rerender all:

```js
function renderDrafts(drafts) {
  const list = document.getElementById("list");
  list.innerHTML = "";
  for (let d of drafts) {
    const li = document.createElement("li");
    li.textContent = d.title;
    list.appendChild(li);
  }
}
```

Why this hurts: even one title change destroys and recreates every node. Focus lost, scroll jumps, images refetch, animations restart. On 500 posts it visibly lags.

Ideal fix looks like this:

```
State changes -> diff old vs new -> update only changed nodes
```

You manage state. Something else figures out the minimal DOM edits. That something is React.

> Try it yourself: with 3 drafts rendered, edit the second title in the array only. Notice the page still shows old text until you manually find and update that li.

<details>
<summary>Solution</summary>

No code fix here is the point. You would need to store id to node maps, handle deletes, handle reorders, and keep them all correct on every fetch. That bookkeeping grows with every feature.

Why this exercise matters: every line of that bookkeeping is what React reconciler does for you. Feeling the pain once makes the abstraction stick.

Common mistake: adding `id` attributes and thinking sync is solved. Ids help find nodes but you still write update, insert, remove, and move logic by hand for every data shape.

</details>

## Why frameworks showed up

Short history so the React choice makes sense:

```
1995 to 2000: vanilla direct DOM, fine for small pages
2006 to 2010: jQuery simplified selectors and cross browser quirks
2013 onward: React, Angular, Vue for state plus UI at scale
Today: React dominates jobs, Vue and Svelte are solid alternatives
```

What React actually solves for our blog:

```
No central state  -> useState holds drafts as source of truth
Manual DOM sync   -> reconciler diffs and patches minimal nodes
Repeated UI       -> components reuse PostCard everywhere
Hard to read      -> JSX reads like HTML with JS power
```

Three jobs split cleanly:

1. You update state, like `setDrafts(newList)`
2. React diffs old vs new virtual tree
3. React patches only changed real nodes

React is just JS plus JSX. JSX looks like HTML but compiles to function calls:

```jsx
function PostCard() {
  return (
    <div className="post-card">
      <h1>Hello blog</h1>
      <p>World</p>
    </div>
  );
}
// Compiles roughly to React.createElement calls, then to DOM patches
```

Why `className` not `class`? `class` is reserved in JS. JSX borrows JS rules, so the attribute got renamed. Same for `onClick` camelCase instead of lowercase `onclick`.

## Patterns before React

**Keep one source of truth even in vanilla.** If drafts array is truth, never read titles back from DOM to save. Read inputs once on submit, update array, rerender from array. Two truths always drift.

**Never trust DOM for ids on save.** Use data ids from your array or server `_id`. Relying on list index breaks the moment you sort or filter. Index 2 today is a different post after a delete.

**Escape by default.** Blog titles, comments, bios. All user text goes through `textContent` or a sanitizer. I treat `innerHTML` with user data as a bug in review, even if it works in the demo.

