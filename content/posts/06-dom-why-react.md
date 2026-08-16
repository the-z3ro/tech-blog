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

