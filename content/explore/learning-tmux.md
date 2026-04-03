---
title: "Learning Tmux From Scratch"
date: 2026-03-31T00:44:32+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 0
hiddenInHomeList: false
description: "A practical guide that takes you from never hearing about tmux to having it feel completely natural, with exercises, spaced repetition, and my exact config."
cover:
  image: ""
  alt: ""
  caption: ""
---

<!--
  NOTE FOR HUGO SETUP:
  This post uses inline HTML. To allow this, add the following to your hugo.toml / config.yaml:

  [markup.goldmark.renderer]
    unsafe = true

  Without this, Hugo will strip the HTML blocks and the styling won't work.
-->

<style>
/* ── POST-SCOPED VARIABLES ──────────────────────────── */
.tmux-post {
  --tm-green:  #00ffcc;
  --tm-yellow: #ffff00;
  --tm-orange: #ff9500;
  --tm-bg:     #111111;
  --tm-bg2:    #0d0d0d;
  --tm-border: #222222;
  --tm-muted:  #555555;
  --tm-text:   #c8c8c8;
  --tm-white:  #eeeeee;
}

/* ── KEY BADGE ──────────────────────────────────────── */
.tm-key {
  display: inline-block;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.78em;
  background: #1e1e1e;
  color: #ddd;
  border: 1px solid #3a3a3a;
  border-bottom: 2px solid #4a4a4a;
  padding: 1px 8px;
  border-radius: 3px;
  white-space: nowrap;
}

/* ── TERMINAL BLOCK ─────────────────────────────────── */
.tm-term {
  background: #080808;
  border: 1px solid #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  margin: 24px 0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.tm-term-bar {
  background: #161616;
  padding: 9px 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  border-bottom: 1px solid #1e1e1e;
}
.tm-dot {
  width: 11px; height: 11px;
  border-radius: 50%;
}
.tm-dot-r { background: #ff5f57; }
.tm-dot-y { background: #febc2e; }
.tm-dot-g { background: #28c840; }
.tm-term-body {
  padding: 16px 20px;
  font-size: 13px;
  line-height: 1.85;
  color: #b8f0dc;
}
.tm-term-body .p  { color: #00ffcc; }
.tm-term-body .cm { color: #3a5a4a; }

/* ── EXERCISE BLOCK ─────────────────────────────────── */
.tm-exercise {
  background: #0a1a12;
  border: 1px solid #1a3a24;
  border-left: 3px solid #00ffcc;
  border-radius: 6px;
  padding: 20px 24px;
  margin: 28px 0;
}
.tm-ex-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #00ffcc;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.tm-ex-label::before { content: '▶'; font-size: 0.55rem; }
.tm-exercise p,
.tm-exercise li { color: #9ecfba; font-size: 0.94rem; }
.tm-exercise strong { color: #00ffcc; }
.tm-exercise ol { padding-left: 18px; }
.tm-exercise ol li { margin-bottom: 6px; }
.tm-exercise code {
  background: #0f2a1e;
  color: #00ffcc;
  border: 1px solid #1a3a24;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.85em;
}

/* ── CHECKPOINT ─────────────────────────────────────── */
.tm-checkpoint {
  background: #111118;
  border: 1px solid #22223a;
  border-left: 3px solid #ffff00;
  border-radius: 6px;
  padding: 18px 22px;
  margin: 28px 0;
}
.tm-cp-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #ffff00;
  margin-bottom: 14px;
}
.tm-checkpoint ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tm-checkpoint ul li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.9rem;
  color: #9a9a66;
  margin-bottom: 7px;
  cursor: pointer;
}
.tm-cb {
  width: 15px; height: 15px;
  border: 1px solid #444;
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 3px;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  font-size: 9px;
  font-weight: bold;
  color: transparent;
}
.tm-cb.done {
  background: #ffff00;
  border-color: #ffff00;
  color: #000;
}

/* ── WARN / TIP ─────────────────────────────────────── */
.tm-warn {
  background: #1a0f08;
  border: 1px solid #3a2000;
  border-left: 3px solid #ff9500;
  border-radius: 4px;
  padding: 14px 18px;
  margin: 20px 0;
  font-size: 0.92rem;
  color: #cc9966;
}
.tm-warn strong { color: #ff9500; }

.tm-tip {
  background: #0c0c1a;
  border: 1px solid #20203a;
  border-left: 3px solid #8888ff;
  border-radius: 4px;
  padding: 14px 18px;
  margin: 20px 0;
  font-size: 0.92rem;
  color: #9999bb;
}
.tm-tip strong { color: #aaaaff; }

/* ── NOTICE ─────────────────────────────────────────── */
.tm-notice {
  background: #0a1810;
  border: 1px solid #00ffcc44;
  border-left: 3px solid #00ffcc;
  border-radius: 4px;
  padding: 15px 20px;
  margin: 24px 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: #88ccbb;
  line-height: 1.7;
}
.tm-notice strong { color: #00ffcc; }

/* ── KEYTABLE ────────────────────────────────────────── */
.tm-keytable {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 0.88rem;
}
.tm-keytable th {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #555;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #1e1e1e;
}
.tm-keytable td {
  padding: 10px 12px;
  border-bottom: 1px solid #141414;
  vertical-align: top;
}
.tm-keytable tr:hover td { background: #111; }
.tm-keytable td:first-child {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: #ffff00;
  white-space: nowrap;
}
.tm-keytable td:last-child { color: #888; }

/* ── HIERARCHY ───────────────────────────────────────── */
.tm-hierarchy {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #1e1e1e;
  margin: 24px 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}
.tm-h-row {
  display: flex;
  align-items: center;
  padding: 13px 16px;
  background: #0d0d0d;
  border-bottom: 1px solid #161616;
  transition: background 0.1s;
}
.tm-h-row:last-child { border: none; }
.tm-h-row:hover { background: #141414; }
.tm-h-icon { margin-right: 12px; font-size: 15px; }
.tm-h-name { color: #eee; font-weight: 500; }
.tm-h-arrow { color: #00ffcc; margin: 0 10px; font-size: 11px; }
.tm-h-desc { color: #444; font-size: 11px; margin-left: auto; text-align: right; }

/* ── CONFIG BLOCK ────────────────────────────────────── */
.tm-config {
  background: #070707;
  border: 1px solid #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  margin: 28px 0;
}
.tm-config-bar {
  background: #101010;
  padding: 10px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #444;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}
.tm-config-bar::before { content: '●'; color: #00ffcc; font-size: 8px; }
.tm-config-body {
  padding: 20px 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  line-height: 1.9;
  overflow-x: auto;
  white-space: pre;
}
.cc  { color: #2e4a3a; }   /* comment */
.ck  { color: #ff9966; }   /* key     */
.cv  { color: #66ccff; }   /* value   */
.cs  { color: #88dd88; }   /* string  */
.csec{ color: #00ffcc; font-weight: bold; display: block; margin-top: 6px; }

/* ── CHEATSHEET GRID ─────────────────────────────────── */
.tm-cs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 24px 0;
}
@media(max-width:600px){ .tm-cs-grid { grid-template-columns: 1fr; } }
.tm-cs-card {
  background: #0d0d0d;
  border: 1px solid #1a1a1a;
  border-radius: 6px;
  padding: 16px;
}
.tm-cs-card h4 {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffff00;
  margin: 0 0 12px;
}
.tm-cs-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #141414;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
}
.tm-cs-item:last-child { border: none; }
.tm-cs-item .k { color: #00ffcc; }
.tm-cs-item .d { color: #444; font-size: 11px; }
</style>

<div class="tmux-post">

<div class="tm-notice">
<strong>⚠ before you start reading:</strong> this is not a blog you just read and close. open a terminal right now and keep it next to this tab. every section has a small exercise, do it immediately, don't save it for "later." if you just passively read this, you will forget everything in about 3 days. i promise.
</div>

---

## What even is tmux

Ok so honestly, before I learned tmux, I was just opening like 4 separate terminal windows and alt-tabbing between them like a maniac. Running a server in one, editing code in another, watching logs in a third. It was genuinely messy.

Tmux solves this. It is a **terminal multiplexer**, that scary word just means it lets you run multiple terminals inside one single terminal window. And more importantly, it lets you **detach from your work and come back to it later**, exactly how you left it.

Imagine this: you start a long running process, a model training, a big build, whatever. You close your laptop and go eat. When you open it again, everything is still there, still running. That's tmux. That's the whole magic of it.

> The real reason to learn tmux is not the split-screen thing. It's the "my work persists even when I'm not looking at it" thing.

Also once you get comfortable with it, it genuinely starts to feel like a superpower. Your terminal becomes this organized, structured workspace and you stop losing context constantly. I'm not exaggerating.

---

## Installing it

Before anything else, check if it's already on your machine:

<div class="tm-term">
<div class="tm-term-bar"><div class="tm-dot tm-dot-r"></div><div class="tm-dot tm-dot-y"></div><div class="tm-dot tm-dot-g"></div></div>
<div class="tm-term-body"><span class="p">$ </span>tmux -V</div>
</div>

If it prints something like `tmux 3.3a` you're good. If not:

<div class="tm-term">
<div class="tm-term-bar"><div class="tm-dot tm-dot-r"></div><div class="tm-dot tm-dot-y"></div><div class="tm-dot tm-dot-g"></div></div>
<div class="tm-term-body"><span class="cm"># Ubuntu / Debian</span>
<span class="p">$ </span>sudo apt install tmux

<span class="cm"># Arch / Manjaro</span>
<span class="p">$ </span>sudo pacman -S tmux

<span class="cm"># Fedora</span>
<span class="p">$ </span>sudo dnf install tmux</div>

</div>

Very lightweight, installs in seconds.

<div class="tm-exercise">
<div class="tm-ex-label">Exercise 01 => launch tmux for the first time</div>
<p>Type this in your terminal and press Enter:</p>

```
tmux
```

<p>You should see your terminal looks slightly different, there's a bar at the bottom. That's tmux's status bar. It shows your session name, open windows, and some info.</p>
<p>To get out for now, type <code>exit</code> or press <strong>Ctrl + d</strong>. We'll explore properly in the next section.</p>
</div>

---

## The three-layer mental model

This is the most important thing to understand before touching any shortcuts. Tmux has three layers and everything builds on top of this.

<div class="tm-hierarchy">
<div class="tm-h-row">
  <span class="tm-h-icon">🗂</span>
  <span class="tm-h-name">Session</span>
  <span class="tm-h-arrow">→</span>
  <span class="tm-h-desc">the "project" persists even when you're not looking</span>
</div>
<div class="tm-h-row" style="padding-left:32px;">
  <span class="tm-h-icon">🪟</span>
  <span class="tm-h-name">Window</span>
  <span class="tm-h-arrow">→</span>
  <span class="tm-h-desc">like a browser tab, fills the whole screen</span>
</div>
<div class="tm-h-row" style="padding-left:64px;">
  <span class="tm-h-icon">▪</span>
  <span class="tm-h-name">Pane</span>
  <span class="tm-h-arrow">→</span>
  <span class="tm-h-desc">a split inside a window, multiple terminals at once</span>
</div>
</div>

Think of it like this: a **session** is your whole project (say, "work" or "side-project"). Inside that session you have multiple **windows** (like tabs, one for your editor, one for running the server, one for git). And inside each window, you can **split it into panes** if you want two terminals side by side.

You don't have to use all three. Most of the time you'll use sessions + panes. But knowing this model makes every shortcut make sense.

### The Prefix Key, the gatekeeper

Almost every tmux shortcut starts with something called the **Prefix key**. It's tmux's way of knowing "ok, the next key you press is a command, not text."

The default prefix is <span class="tm-key">Ctrl</span> + <span class="tm-key">b</span>. But in my config (which I'll share later), I changed it to <span class="tm-key">Ctrl</span> + <span class="tm-key">a</span> because it's way more comfortable to press.

In this blog I'll write `Prefix` to mean <span class="tm-key">Ctrl</span> + <span class="tm-key">a</span>. If you're on a fresh tmux without my config yet, use <span class="tm-key">Ctrl</span> + <span class="tm-key">b</span> , everything else is the same.

<div class="tm-tip">
<strong>// tip:</strong> the prefix key does nothing visible when you press it. press it, release, then quickly press the next key. it times out after about a second so don't be slow about it.
</div>

---

## Sessions, the superpower

Sessions are genuinely the reason to use tmux. The concept is simple: a session keeps running even when you close your terminal or disconnect. You "detach" from it, go do something else, "attach" back later and everything is exactly how you left it.

### Starting a session

<div class="tm-term">
<div class="tm-term-bar"><div class="tm-dot tm-dot-r"></div><div class="tm-dot tm-dot-y"></div><div class="tm-dot tm-dot-g"></div></div>
<div class="tm-term-body"><span class="cm"># start tmux (creates a session with a random number name)</span>
<span class="p">$ </span>tmux

<span class="cm"># start with a specific name, much better habit</span>
<span class="p">$ </span>tmux new -s work
<span class="p">$ </span>tmux new -s side-project
<span class="p">$ </span>tmux new -s learning</div>

</div>

Always name your sessions. "work", "personal", "project-name", anything. It makes attaching back way easier.

### The core session actions

<table class="tm-keytable">
<tr><th>Key / Command</th><th>What it does</th></tr>
<tr><td>Prefix + d</td><td>Detach, leave the session running, go back to normal terminal</td></tr>
<tr><td>tmux ls</td><td>List all running sessions (run this outside tmux)</td></tr>
<tr><td>tmux a</td><td>Attach back to the last session</td></tr>
<tr><td>tmux a -t work</td><td>Attach to a specific session by name</td></tr>
<tr><td>Prefix + s</td><td>List and switch between sessions (inside tmux)</td></tr>
<tr><td>Prefix + $</td><td>Rename the current session</td></tr>
<tr><td>tmux kill-session -t work</td><td>Kill a specific session</td></tr>
<tr><td>tmux kill-server</td><td>Nuclear option, kills absolutely everything</td></tr>
</table>

<div class="tm-exercise">
<div class="tm-ex-label">Exercise 02 => the detach / attach cycle</div>
<p>This is the core skill. Do this now, it takes 2 minutes:</p>
<ol>
<li>Outside tmux, run: <code>tmux new -s myfirst</code></li>
<li>You're now inside a session called "myfirst"</li>
<li>Run something in it: <code>echo "hello from tmux"</code></li>
<li>Now detach: press <strong>Prefix + d</strong>, you'll drop back to your normal terminal</li>
<li>Check the session is still alive: <code>tmux ls</code> you should see "myfirst" listed</li>
<li>Attach back: <code>tmux a -t myfirst</code></li>
<li>See? Your terminal is exactly where you left it.</li>
</ol>
</div>

<div class="tm-checkpoint">
<div class="tm-cp-label">// checkpoint -- sessions</div>
<ul>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can create a named session</span></li>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can detach from a session with Prefix + d</span></li>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can list sessions with tmux ls</span></li>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can attach back with tmux a -t &lt;name&gt;</span></li>
</ul>
</div>

---

## Windows, your tabs

Inside a session, you can have multiple windows. Think browser tabs, each one takes up the whole screen and you switch between them. The status bar shows all your open windows.

I use windows when I want to completely separate concerns. Window 1 for editor, window 2 for git, window 3 for running tests. When I'm doing simple stuff, I just stick to panes.

<table class="tm-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>Prefix + c</td><td>Create a new window</td></tr>
<tr><td>Prefix + ,</td><td>Rename the current window</td></tr>
<tr><td>Prefix + n</td><td>Go to next window</td></tr>
<tr><td>Prefix + p</td><td>Go to previous window</td></tr>
<tr><td>Prefix + 1..9</td><td>Jump to window by number, super fast</td></tr>
<tr><td>Prefix + w</td><td>Tree view, see all sessions and windows at once</td></tr>
<tr><td>Prefix + &</td><td>Kill current window (asks you to confirm)</td></tr>
</table>

<div class="tm-exercise">
<div class="tm-ex-label">Exercise 03 => working with windows</div>
<ol>
<li>Inside tmux, press <strong>Prefix + c</strong>, a new window opens, you'll see "2" in the status bar</li>
<li>Press <strong>Prefix + ,</strong> and rename it "server", type the name, press Enter</li>
<li>Press <strong>Prefix + c</strong> again, rename it "editor"</li>
<li>Now press <strong>Prefix + 1</strong> to jump to window 1, then <strong>Prefix + 2</strong> for window 2, <strong>Prefix + 3</strong> for window 3</li>
<li>Press <strong>Prefix + w</strong> to see a tree view of everything, use arrow keys to navigate, press Enter to jump to one</li>
</ol>
</div>

<div class="tm-warn">
<strong>// gotcha:</strong> by default tmux starts windows at index 0. in my config I changed it to start at 1 (<code>set -g base-index 1</code>). that way Prefix+1 jumps to your first window, which is more intuitive. when you set up my config later, this is handled automatically.
</div>

<div class="tm-checkpoint">
<div class="tm-cp-label">// checkpoint, windows</div>
<ul>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can create windows with Prefix + c</span></li>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can rename a window with Prefix + ,</span></li>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can jump between windows by number</span></li>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I know what the tree view looks like</span></li>
</ul>
</div>

---

## Panes, splitting the screen

Ok this is the visually impressive part. This is what people show off in their dev setup videos. But it's also genuinely useful, seeing your code and your running server at the same time without switching is really nice once you get used to it.

### Splitting

By default, the shortcuts are <span class="tm-key">Prefix</span> + <span class="tm-key">%</span> for vertical split and <span class="tm-key">Prefix</span> + <span class="tm-key">"</span> for horizontal. These are terrible to remember honestly. In my config I changed them to <span class="tm-key">Prefix</span> + <span class="tm-key">v</span> for vertical and <span class="tm-key">Prefix</span> + <span class="tm-key">s</span> for horizontal. v for vertical, s for stacked. Much more intuitive.

For now use the defaults. Once you set up my config it'll be nicer.

<table class="tm-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>Prefix + %</td><td>Split vertically (side by side), default</td></tr>
<tr><td>Prefix + "</td><td>Split horizontally (top/bottom), default</td></tr>
<tr><td>Prefix + v</td><td>Split vertically, my config</td></tr>
<tr><td>Prefix + s</td><td>Split horizontally, my config</td></tr>
<tr><td>Prefix + arrows</td><td>Move between panes</td></tr>
<tr><td>Prefix + q</td><td>Show pane numbers, tap a number to jump to that pane</td></tr>
<tr><td>Prefix + z</td><td>Zoom, maximize current pane. Press again to undo.</td></tr>
<tr><td>Prefix + x</td><td>Kill current pane</td></tr>
</table>

### Resizing

Hold <span class="tm-key">Ctrl</span> after the prefix and press arrow keys for fine control. <span class="tm-key">Alt</span> for bigger jumps. Honestly I mostly just use zoom (<span class="tm-key">Prefix</span> + <span class="tm-key">z</span>) when I need to focus, rather than resizing.

<div class="tm-exercise">
<div class="tm-ex-label">Exercise 04 => build your first real three-pane setup</div>
<p>This simulates an actual workflow:</p>
<ol>
<li>Create a fresh session: <code>tmux new -s myproject</code></li>
<li>Split vertically: <strong>Prefix + %</strong> two panes side by side</li>
<li>In the left pane run: <code>echo "this is my editor"</code></li>
<li>Move to right pane: <strong>Prefix + right arrow</strong></li>
<li>Split it horizontally: <strong>Prefix + "</strong> now you have 3 panes total</li>
<li>In this bottom-right pane run: <code>echo "this is my logs"</code></li>
<li>Try navigating between all 3 panes with arrow keys</li>
<li>Press <strong>Prefix + q</strong> and see the numbers appear, immediately tap one to jump there</li>
<li>Press <strong>Prefix + z</strong> on any pane to zoom in, then again to zoom out</li>
</ol>
</div>

<div class="tm-tip">
<strong>// the trick I use most:</strong> Prefix + q then immediately press the pane number. way faster than pressing the arrow key multiple times. once this is in muscle memory, moving around feels instant.
</div>

<div class="tm-checkpoint">
<div class="tm-cp-label">// checkpoint -- panes</div>
<ul>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can split a window vertically and horizontally</span></li>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can navigate between panes with arrow keys</span></li>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I know the Prefix + q trick to jump to panes by number</span></li>
<li><div class="tm-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can zoom in/out with Prefix + z</span></li>
</ul>
</div>

---

## Copy Mode, keyboard warrior stuff

One thing that's slightly annoying when you first use tmux is that you can't scroll up with your mouse wheel to see older output. Tmux captures the terminal. Copy mode is the solution, and once you get used to it, it's actually better than using the mouse.

**How it works:**

1. Press <span class="tm-key">Prefix</span> + <span class="tm-key">[</span> to enter copy mode. You'll see `[0/0]` appear in the top right corner.
2. Now scroll with arrow keys, or <span class="tm-key">Page Up</span> / <span class="tm-key">Page Down</span>.
3. If you set `setw -g mode-keys vi` in your config (which I do), you can use <span class="tm-key">j</span> <span class="tm-key">k</span> to scroll line by line and <span class="tm-key">Ctrl+u</span> / <span class="tm-key">Ctrl+d</span> for half-page jumps.
4. To select text: press <span class="tm-key">Space</span> to start selection, move to end, press <span class="tm-key">Enter</span> to copy.
5. To paste: <span class="tm-key">Prefix</span> + <span class="tm-key">]</span>
6. To exit without copying: press <span class="tm-key">q</span> or <span class="tm-key">Escape</span>

<div class="tm-notice">
<strong>// quick note:</strong> I also have <code>set -g mouse on</code> in my config, which means you can use your mouse to scroll in most cases anyway. copy mode becomes more useful for selecting and copying text precisely. both work together fine.
</div>

<div class="tm-exercise">
<div class="tm-ex-label">Exercise 05 => scrolling through history</div>
<ol>
<li>Create a long output in a pane:<br><code>for i in $(seq 1 50); do echo "line $i"; done</code></li>
<li>Press <strong>Prefix + [</strong> to enter copy mode</li>
<li>Use arrow keys to scroll up through the output</li>
<li>Press <strong>q</strong> to exit copy mode</li>
</ol>
</div>

---

## The Config File

By default tmux is not that comfortable. The prefix key is awkward, you can't scroll with the mouse, no nice colors. The config file is where you fix all of this.

### Where it lives

```
~/.config/tmux/tmux.conf
```

Older setups use `~/.tmux.conf`. Both work. I use the `.config` path because it's cleaner (XDG standard).

### Create it

<div class="tm-term">
<div class="tm-term-bar"><div class="tm-dot tm-dot-r"></div><div class="tm-dot tm-dot-y"></div><div class="tm-dot tm-dot-g"></div></div>
<div class="tm-term-body"><span class="p">$ </span>mkdir -p ~/.config/tmux
<span class="p">$ </span>touch ~/.config/tmux/tmux.conf
<span class="p">$ </span>nvim ~/.config/tmux/tmux.conf  <span class="cm"># or nano, vim, whatever</span></div>
</div>

### Reloading without restarting

After editing, tell tmux to read the new config:

```
tmux source-file ~/.config/tmux/tmux.conf
```

Or add this shortcut so you can press <span class="tm-key">Prefix</span> + <span class="tm-key">r</span> to reload:

```
bind r source-file ~/.config/tmux/tmux.conf \; display "Config reloaded!"
```

Add that line, save, manually source once. After that `Prefix + r` always reloads for you.

---

## My exact setup, the hacker dashboard

Ok so this is my actual config. I'll go through each section so you understand what each thing does before copy-pasting. Don't blindly copy config files you don't understand, you'll run into problems and have no idea why.

This config uses **TPM (Tmux Plugin Manager)** for some plugins. I'll explain how to install it too.

### Step 1 -> Install TPM

<div class="tm-term">
<div class="tm-term-bar"><div class="tm-dot tm-dot-r"></div><div class="tm-dot tm-dot-y"></div><div class="tm-dot tm-dot-g"></div></div>
<div class="tm-term-body"><span class="p">$ </span>git clone https://github.com/tmux-plugins/tpm ~/.config/tmux/plugins/tpm</div>
</div>

That's it. TPM is just a folder, no system install needed.

### Step 2 -> The full config, explained

<div class="tm-config">
<div class="tm-config-bar">~/.config/tmux/tmux.conf</div>
<div class="tm-config-body"><span class="cc"># ── MODULE 1: THE CORE ──────────────────────────────────────────</span>

<span class="cc"># Change prefix from Ctrl+b (default) to Ctrl+a</span>
<span class="cc"># Ctrl+a is much more comfortable, left pinky on Ctrl, ring finger on 'a'</span>
<span class="ck">set -g prefix</span> <span class="cv">C-a</span>
<span class="ck">unbind</span> <span class="cv">C-b</span>
<span class="ck">bind</span> <span class="cv">C-a send-prefix</span>
<span class="ck">unbind</span> <span class="cv">o</span>

<span class="ck">set -g mouse</span> <span class="cv">on</span> <span class="cc"># scroll with mouse, click to focus panes</span>
<span class="ck">set -g base-index</span> <span class="cv">1</span> <span class="cc"># windows start at 1, not 0</span>
<span class="ck">set -g renumber-windows</span> <span class="cv">on</span> <span class="cc"># close window 2 → window 3 becomes window 2</span>
<span class="ck">set -g detach-on-destroy</span> <span class="cv">off</span> <span class="cc"># closing a session drops you to another, not to shell</span>
<span class="ck">set -g set-clipboard</span> <span class="cv">on</span> <span class="cc"># copies go to system clipboard</span>

<span class="cc"># ── MODULE 2: NAVIGATION ────────────────────────────────────────</span>
<span class="cc"># vim-tmux-navigator: move between panes with Ctrl+hjkl, no prefix needed</span>
<span class="cc"># works seamlessly across tmux panes AND neovim splits</span>
<span class="ck">set -g @plugin</span> <span class="cs">'christoomey/vim-tmux-navigator'</span>

<span class="cc"># v for vertical (side by side), s for stacked (top/bottom)</span>
<span class="cc"># -c "#{pane_current_path}" means new pane opens in same directory</span>
<span class="ck">bind v</span> <span class="cv">split-window -h -c "#{pane_current_path}"</span>
<span class="ck">bind s</span> <span class="cv">split-window -v -c "#{pane_current_path}"</span>

<span class="cc"># ── MODULE 3: THE DESIGN (Hacker Dashboard) ─────────────────────</span>
<span class="ck">set -g status-position</span> <span class="cv">top</span> <span class="cc"># status bar at the top (more modern feel)</span>
<span class="ck">set -g status-interval</span> <span class="cv">3</span> <span class="cc"># refresh the bar every 3 seconds</span>
<span class="ck">set -g status-justify</span> <span class="cv">left</span>

<span class="cc"># Dark base for the whole status bar</span>
<span class="ck">set -g status-style</span> <span class="cs">'bg=#111111'</span>

<span class="cc"># Left side: session name with a small icon</span>
<span class="ck">set -g status-left</span> <span class="cs">"#[fg=#00ffcc,bg=#1e1e2e,bold] 󰚀 #S #[fg=#1e1e2e,bg=default]"</span>
<span class="ck">set -g status-left-length</span> <span class="cv">30</span>

<span class="cc"># Right side: date and time in green/cyan</span>
<span class="ck">set -g status-right</span> <span class="cs">"#[fg=#333333]#[fg=#00ff00,bg=#333333] 󰃭 %Y-%m-%d #[fg=#00ffcc]󱑒 %H:%M "</span>

<span class="cc"># Active window tab: bold yellow highlight</span>
<span class="ck">set -g window-status-current-format</span> <span class="cs">"#[fg=#111111,bg=#ffff00,bold] #I:#W "</span>
<span class="cc"># Inactive window tabs: dimmed grey</span>
<span class="ck">set -g window-status-format</span> <span class="cs">"#[fg=#666666,bg=default] #I:#W "</span>

<span class="cc"># ── MODULE 4: PERSISTENCE (The Time Machine) ────────────────────</span>
<span class="cc"># tmux-resurrect: manually save/restore sessions</span>
<span class="cc"># Prefix + Ctrl+s to save, Prefix + Ctrl+r to restore</span>
<span class="ck">set -g @plugin</span> <span class="cs">'tmux-plugins/tmux-resurrect'</span>
<span class="cc"># tmux-continuum: auto-saves every 15 min + auto-restores on tmux start</span>
<span class="ck">set -g @plugin</span> <span class="cs">'tmux-plugins/tmux-continuum'</span>
<span class="ck">set -g @continuum-restore</span> <span class="cs">'on'</span>
<span class="cc"># If you use neovim: also restore your nvim sessions</span>
<span class="ck">set -g @resurrect-strategy-nvim</span> <span class="cs">'session'</span>

<span class="cc"># ── MODULE 5: SLEEK SESSION MANAGER ─────────────────────────────</span>
<span class="cc"># tmux-sessionx: floating fuzzy session picker</span>
<span class="cc"># Press Prefix + o to open it</span>
<span class="ck">set -g @plugin</span> <span class="cs">'omerxx/tmux-sessionx'</span>
<span class="ck">set -g @sessionx-bind</span> <span class="cs">'o'</span>
<span class="ck">set -g @sessionx-window-height</span> <span class="cs">'75%'</span>
<span class="ck">set -g @sessionx-window-width</span> <span class="cs">'75%'</span>

<span class="cc"># ── INITIALIZE TPM (always keep this at the very bottom) ────────</span>
<span class="ck">set -g @plugin</span> <span class="cs">'tmux-plugins/tpm'</span>
<span class="ck">run</span> <span class="cs">'~/.config/tmux/plugins/tpm/tpm'</span></div>

</div>

### Step 3 -> Install the plugins

After saving the config, open tmux (or reload it), then press:

```
Prefix + I    (capital I, like "Install")
```

TPM will pull all plugins from GitHub. You'll see it downloading. When done, press Enter.

<div class="tm-warn">
<strong>// note about the icons:</strong> the status bar uses Nerd Font icons (those little symbols like 󰚀). if they show as weird boxes, you need to install a Nerd Font and set it as your terminal font. grab one from <a href="https://www.nerdfonts.com" target="_blank">nerdfonts.com</a>, I use JetBrainsMono Nerd Font. if you don't want to deal with fonts right now, just delete those icon characters from the status-left and status-right lines and it'll work fine with plain text.
</div>

### What each plugin actually does

**vim-tmux-navigator** -- lets you press <span class="tm-key">Ctrl</span> + <span class="tm-key">h/j/k/l</span> to move between panes without using the prefix at all. And if you also use Neovim, the same keys cross the vim/tmux boundary seamlessly. You just navigate everywhere with Ctrl+hjkl and never think about it.

**tmux-resurrect** -- saves your entire tmux state (sessions, windows, panes, running commands) to a file. <span class="tm-key">Prefix</span> + <span class="tm-key">Ctrl+s</span> to save, <span class="tm-key">Prefix</span> + <span class="tm-key">Ctrl+r</span> to restore. Super useful after a reboot.

**tmux-continuum** -- same thing but automatic. Saves every 15 minutes, restores on startup. You don't have to think about it at all.

**tmux-sessionx** -- a beautiful floating fuzzy-finder for sessions. Press <span class="tm-key">Prefix</span> + <span class="tm-key">o</span> and get a popup where you can search and switch sessions, create new ones, even preview them. A nice upgrade from the basic list.

<div class="tm-exercise">
<div class="tm-ex-label">Exercise 06 => full setup from scratch</div>
<ol>
<li>Clone TPM: <code>git clone https://github.com/tmux-plugins/tpm ~/.config/tmux/plugins/tpm</code></li>
<li>Copy the config above into <code>~/.config/tmux/tmux.conf</code></li>
<li>Start a fresh tmux: <code>tmux</code></li>
<li>Source the config: <code>tmux source-file ~/.config/tmux/tmux.conf</code></li>
<li>Install plugins: <strong>Prefix + I</strong> (capital I)</li>
<li>Wait for it to finish, press Enter</li>
<li>Notice the status bar moved to the top and looks different</li>
<li>Try the new split keys: <strong>Prefix + v</strong> and <strong>Prefix + s</strong></li>
<li>Try navigating with <strong>Ctrl + h/l</strong>, no prefix needed</li>
</ol>
</div>

---

## Building muscle memory

Reading about shortcuts and actually having them in your fingers are two completely different things. The brain learns by doing, not by reading. So here's my honest recommendation for the first two weeks.

### Week 1 => force yourself to use just these four things

Don't try to learn everything at once. Seriously. Just these four:

1. **Prefix + d** -> detach. Use this instead of closing your terminal.
2. **tmux a** -> attach back. Build this rhythm: detach → do something → attach.
3. **Prefix + v** -> split panes. Every time you want a second terminal, use this instead of opening a new window.
4. **Prefix + q, then number** -> jump to a pane. Drill this until it's automatic.

That's week 1. If you use just these 4 things consistently, tmux starts feeling normal within a few days.

### Week 2 => add these

1. **Prefix + c, Prefix + ,** -> create and name windows. Start organizing your work this way.
2. **Prefix + number** -> jump to windows by number. Muscle memory for this is fast.
3. **Prefix + z** -> zoom. Use when you need focus on one pane.
4. **Prefix + [** -> copy mode scrolling. Replace your mouse scrolling habit with this.

### The daily workflow drill

<div class="tm-exercise">
<div class="tm-ex-label">Daily ritual, do this every single day for two weeks</div>
<ol>
<li><code>tmux new -s &lt;project-name&gt;</code> or attach if it already exists</li>
<li>Rename your first window with <strong>Prefix + ,</strong></li>
<li>Split it once with <strong>Prefix + v</strong>, editor on left, terminal on right</li>
<li>When you're done: <strong>Prefix + d</strong> to detach, don't close tmux</li>
<li>Next day: <code>tmux a</code> and you're back exactly where you were</li>
</ol>
<p>Do this exact workflow every day for two weeks. After that, it will feel genuinely weird to <em>not</em> use tmux.</p>
</div>

### The three commands you should never forget

If you forget everything else, remember these. I call them the survival kit:

<div class="tm-term">
<div class="tm-term-bar"><div class="tm-dot tm-dot-r"></div><div class="tm-dot tm-dot-y"></div><div class="tm-dot tm-dot-g"></div></div>
<div class="tm-term-body"><span class="cm"># list all running sessions</span>
<span class="p">$ </span>tmux ls

<span class="cm"># attach to the last one</span>
<span class="p">$ </span>tmux a

<span class="cm"># when everything is a mess and you want to start fresh</span>
<span class="p">$ </span>tmux kill-server</div>

</div>

And inside tmux, if you forget any shortcut:

```
Prefix + ?   →   shows every active shortcut (press q to close)
```

This is the built-in manual. Any time you forget something, this is faster than googling.

---

## Quick reference cheatsheet

<div class="tm-cs-grid">
<div class="tm-cs-card">
<h4>Sessions</h4>
<div class="tm-cs-item"><span class="k">tmux new -s &lt;name&gt;</span><span class="d">new session</span></div>
<div class="tm-cs-item"><span class="k">tmux ls</span><span class="d">list sessions</span></div>
<div class="tm-cs-item"><span class="k">tmux a -t &lt;name&gt;</span><span class="d">attach</span></div>
<div class="tm-cs-item"><span class="k">Prefix + d</span><span class="d">detach</span></div>
<div class="tm-cs-item"><span class="k">Prefix + $</span><span class="d">rename session</span></div>
<div class="tm-cs-item"><span class="k">Prefix + o</span><span class="d">sessionx picker</span></div>
</div>
<div class="tm-cs-card">
<h4>Windows</h4>
<div class="tm-cs-item"><span class="k">Prefix + c</span><span class="d">new window</span></div>
<div class="tm-cs-item"><span class="k">Prefix + ,</span><span class="d">rename window</span></div>
<div class="tm-cs-item"><span class="k">Prefix + n / p</span><span class="d">next / prev</span></div>
<div class="tm-cs-item"><span class="k">Prefix + 1-9</span><span class="d">jump by number</span></div>
<div class="tm-cs-item"><span class="k">Prefix + w</span><span class="d">tree view</span></div>
<div class="tm-cs-item"><span class="k">Prefix + &</span><span class="d">kill window</span></div>
</div>
<div class="tm-cs-card">
<h4>Panes</h4>
<div class="tm-cs-item"><span class="k">Prefix + v</span><span class="d">split vertical</span></div>
<div class="tm-cs-item"><span class="k">Prefix + s</span><span class="d">split horizontal</span></div>
<div class="tm-cs-item"><span class="k">Ctrl + h/j/k/l</span><span class="d">navigate (plugin)</span></div>
<div class="tm-cs-item"><span class="k">Prefix + q, N</span><span class="d">jump to pane N</span></div>
<div class="tm-cs-item"><span class="k">Prefix + z</span><span class="d">zoom / unzoom</span></div>
<div class="tm-cs-item"><span class="k">Prefix + x</span><span class="d">kill pane</span></div>
</div>
<div class="tm-cs-card">
<h4>Copy / Misc</h4>
<div class="tm-cs-item"><span class="k">Prefix + [</span><span class="d">enter copy mode</span></div>
<div class="tm-cs-item"><span class="k">q / Esc</span><span class="d">exit copy mode</span></div>
<div class="tm-cs-item"><span class="k">Space → Enter</span><span class="d">select + copy</span></div>
<div class="tm-cs-item"><span class="k">Prefix + ]</span><span class="d">paste</span></div>
<div class="tm-cs-item"><span class="k">Prefix + ?</span><span class="d">show all shortcuts</span></div>
<div class="tm-cs-item"><span class="k">Prefix + r</span><span class="d">reload config</span></div>
</div>
</div>

---

A few months ago I was alt-tabbing between 4 terminal windows like an idiot. Now I have one tmux session per project, everything is organized, and I can pick up exactly where I left off after a reboot because of the continuum plugin. The learning curve is real, first few days it'll feel annoying and slow. Push through that. It clicks, and then it feels obvious that this is just how terminals should work.

Good luck. And remember, the point is not to memorize shortcuts, it's to build habits. Habits come from doing things repeatedly, not from reading about them once.

</div>
