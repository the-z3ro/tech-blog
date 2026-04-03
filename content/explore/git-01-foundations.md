---
title: "Git and GitHub From Scratch | Part 01: How Git Actually Thinks"
date: 2026-05-12T00:00:00+05:30
draft: false
tags: ["git", "github", "tools", "beginner"]
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 0
hiddenInHomeList: false
description: "Not another git tutorial that stops at 'git push'. This series builds a real mental model of Git from the inside out — starting with what a commit actually is, how the object store works, and why Git behaves the way it does."
cover:
  image: ""
  alt: ""
  caption: ""
---

<!--
  NOTE FOR HUGO SETUP:
  This post uses inline HTML. Add this to your hugo.yaml:

  markup:
    goldmark:
      renderer:
        unsafe: true

  Without this, Hugo strips the HTML blocks.
-->

<style>
/* ── POST-SCOPED ROOT ───────────────────────────────── */
.gt-post {
  --gt-orange:  #f4845f;
  --gt-blue:    #79c0ff;
  --gt-green:   #56d364;
  --gt-red:     #ff7b72;
  --gt-yellow:  #e3b341;
  --gt-purple:  #d2a8ff;
  --gt-bg:      #0d1117;
  --gt-bg2:     #161b22;
  --gt-bg3:     #1c2128;
  --gt-border:  #30363d;
  --gt-text:    #c9d1d9;
  --gt-muted:   #6e7681;
}

/* ── KEY BADGE ──────────────────────────────────────── */
.gt-key {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.76em;
  background: #1c2128;
  color: #c9d1d9;
  border: 1px solid #444c56;
  border-bottom: 2px solid #545d68;
  padding: 1px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

/* ── TERMINAL BLOCK ─────────────────────────────────── */
.gt-term {
  background: #010409;
  border: 1px solid #21262d;
  border-radius: 8px;
  overflow: hidden;
  margin: 24px 0;
  font-family: 'JetBrains Mono', monospace;
}
.gt-term-bar {
  background: #161b22;
  padding: 9px 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  border-bottom: 1px solid #21262d;
}
.gt-term-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #6e7681;
  margin-left: auto;
}
.gt-dot { width: 11px; height: 11px; border-radius: 50%; }
.gt-dot-r { background: #ff5f57; }
.gt-dot-y { background: #febc2e; }
.gt-dot-g { background: #28c840; }
.gt-term-body {
  padding: 16px 20px;
  font-size: 13px;
  line-height: 1.9;
  color: #c9d1d9;
  overflow-x: auto;
}
.gt-term-body .p   { color: #56d364; }
.gt-term-body .cm  { color: #3d444d; }
.gt-term-body .hi  { color: #f4845f; }
.gt-term-body .bl  { color: #79c0ff; }
.gt-term-body .yl  { color: #e3b341; }
.gt-term-body .rd  { color: #ff7b72; }
.gt-term-body .pu  { color: #d2a8ff; }
.gt-term-body .gr  { color: #56d364; }

/* ── EXERCISE BLOCK ─────────────────────────────────── */
.gt-exercise {
  background: #0d1a14;
  border: 1px solid #1a3a26;
  border-left: 3px solid #56d364;
  border-radius: 6px;
  padding: 20px 24px;
  margin: 28px 0;
}
.gt-ex-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #56d364;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.gt-ex-label::before { content: '▶'; font-size: 0.55rem; }
.gt-exercise p,
.gt-exercise li { color: #7dcca0; font-size: 0.93rem; }
.gt-exercise strong { color: #56d364; }
.gt-exercise ol, .gt-exercise ul { padding-left: 18px; }
.gt-exercise li { margin-bottom: 6px; }
.gt-exercise code {
  background: #0d2218;
  color: #56d364;
  border: 1px solid #1a3a26;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.84em;
}

/* ── CHECKPOINT ─────────────────────────────────────── */
.gt-checkpoint {
  background: #111118;
  border: 1px solid #22223a;
  border-left: 3px solid #d2a8ff;
  border-radius: 6px;
  padding: 18px 22px;
  margin: 28px 0;
}
.gt-cp-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #d2a8ff;
  margin-bottom: 14px;
}
.gt-checkpoint ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.gt-checkpoint ul li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.9rem;
  color: #8b7ec8;
  margin-bottom: 7px;
  cursor: pointer;
}
.gt-cb {
  width: 15px; height: 15px;
  border: 1px solid #444;
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 3px;
  background: #1a1a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  font-size: 9px;
  font-weight: bold;
  color: transparent;
}
.gt-cb.done {
  background: #d2a8ff;
  border-color: #d2a8ff;
  color: #0d1117;
}

/* ── WARN / TIP / NOTICE ────────────────────────────── */
.gt-warn {
  background: #1a0e0a;
  border: 1px solid #3a1a10;
  border-left: 3px solid #f4845f;
  border-radius: 4px;
  padding: 14px 18px;
  margin: 20px 0;
  font-size: 0.92rem;
  color: #b87060;
}
.gt-warn strong { color: #f4845f; }

.gt-tip {
  background: #0d1117;
  border: 1px solid #1e2a3a;
  border-left: 3px solid #79c0ff;
  border-radius: 4px;
  padding: 14px 18px;
  margin: 20px 0;
  font-size: 0.92rem;
  color: #6a9ab8;
}
.gt-tip strong { color: #79c0ff; }

.gt-notice {
  background: #0f1a1f;
  border: 1px solid #f4845f33;
  border-left: 3px solid #f4845f;
  border-radius: 4px;
  padding: 15px 20px;
  margin: 24px 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: #a07060;
  line-height: 1.7;
}
.gt-notice strong { color: #f4845f; }

/* ── CONCEPT DIAGRAM ────────────────────────────────── */
.gt-diagram {
  border: 1px solid #21262d;
  border-radius: 8px;
  overflow: hidden;
  margin: 28px 0;
  background: #0d1117;
}
.gt-diagram-title {
  background: #161b22;
  padding: 10px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #6e7681;
  border-bottom: 1px solid #21262d;
  display: flex;
  align-items: center;
  gap: 8px;
}
.gt-diagram-title::before { content: '◈'; color: #f4845f; }
.gt-diagram-body {
  padding: 28px 24px;
  overflow-x: auto;
}

/* Three areas diagram */
.gt-areas {
  display: flex;
  align-items: stretch;
  gap: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  min-width: 520px;
}
.gt-area {
  flex: 1;
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
}
.gt-area-head {
  padding: 10px 14px;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  border-bottom: 1px solid #30363d;
}
.gt-area-body {
  padding: 14px;
  font-size: 11.5px;
  line-height: 1.8;
  color: #6e7681;
  min-height: 90px;
}
.gt-area-body .item { color: #c9d1d9; }
.gt-area-1 .gt-area-head { background: #161b22; color: #79c0ff; }
.gt-area-2 .gt-area-head { background: #1a1f1a; color: #56d364; }
.gt-area-3 .gt-area-head { background: #1a0e0a; color: #f4845f; }
.gt-area-arrow {
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: #30363d;
  font-size: 18px;
  flex-shrink: 0;
  align-self: center;
}
.gt-area-arrow span { color: #444c56; font-size: 12px; display: block; text-align: center; font-size: 9px; letter-spacing: 0.05em; }

/* Commit graph */
.gt-graph {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  line-height: 2;
  padding: 8px 0;
  overflow-x: auto;
}
.gt-commit {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}
.gt-c-dot {
  width: 14px; height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid;
}
.gt-c-line {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gt-c-hash { color: #e3b341; font-size: 11px; }
.gt-c-msg  { color: #c9d1d9; }
.gt-c-meta { color: #6e7681; font-size: 10.5px; margin-left: 6px; }
.gt-c-arrow { color: #30363d; font-size: 10px; padding: 0 2px; }

/* Object store diagram */
.gt-obj-row {
  display: flex;
  gap: 12px;
  margin: 12px 0;
  flex-wrap: wrap;
}
.gt-obj {
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  min-width: 150px;
}
.gt-obj-head {
  padding: 5px 12px;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-bottom: 1px solid #30363d;
  font-weight: 700;
}
.gt-obj-body { padding: 8px 12px; color: #8b949e; line-height: 1.7; }
.gt-obj-body .k { color: #79c0ff; }
.gt-obj-body .v { color: #c9d1d9; }
.gt-obj-body .hash { color: #e3b341; font-size: 10px; }
.gt-obj-commit .gt-obj-head { background: #1a1020; color: #d2a8ff; }
.gt-obj-tree   .gt-obj-head { background: #0d1a0d; color: #56d364; }
.gt-obj-blob   .gt-obj-head { background: #0f1820; color: #79c0ff; }

/* ── KEYTABLE ────────────────────────────────────────── */
.gt-keytable {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 0.88rem;
}
.gt-keytable th {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #6e7681;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #21262d;
}
.gt-keytable td {
  padding: 10px 12px;
  border-bottom: 1px solid #161b22;
  vertical-align: top;
}
.gt-keytable tr:hover td { background: #161b22; }
.gt-keytable td:first-child {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: #f4845f;
  white-space: nowrap;
  min-width: 200px;
}
.gt-keytable td:last-child { color: #8b949e; }

/* ── SERIES MAP ──────────────────────────────────────── */
.gt-series {
  border: 1px solid #21262d;
  border-radius: 8px;
  overflow: hidden;
  margin: 28px 0;
}
.gt-series-head {
  background: #161b22;
  padding: 12px 18px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6e7681;
  border-bottom: 1px solid #21262d;
}
.gt-series-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  border-bottom: 1px solid #161b22;
  font-size: 0.86rem;
}
.gt-series-item:last-child { border: none; }
.gt-series-item:hover { background: #161b22; }
.gt-series-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #6e7681;
  width: 36px;
  flex-shrink: 0;
}
.gt-series-title { color: #c9d1d9; }
.gt-series-tag {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid;
  flex-shrink: 0;
}
.gt-series-tag.active { color: #f4845f; border-color: #f4845f; background: #1a0e0a; }
.gt-series-tag.upcoming { color: #6e7681; border-color: #30363d; }
.gt-series-item.active-row .gt-series-title { color: #f4845f; font-weight: 500; }

/* ── DIFF VIEW ───────────────────────────────────────── */
.gt-diff {
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 6px;
  overflow: hidden;
  margin: 20px 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
}
.gt-diff-bar {
  background: #161b22;
  padding: 8px 14px;
  font-size: 11px;
  color: #6e7681;
  border-bottom: 1px solid #21262d;
}
.gt-diff-line {
  padding: 2px 14px;
  line-height: 1.85;
  white-space: pre;
}
.gt-diff-add  { background: #0d2118; color: #56d364; }
.gt-diff-del  { background: #1a0a0a; color: #ff7b72; }
.gt-diff-meta { color: #6e7681; }
.gt-diff-ctx  { color: #8b949e; }

/* ── CHEATSHEET GRID ─────────────────────────────────── */
.gt-cs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 24px 0;
}
@media(max-width:600px) { .gt-cs-grid { grid-template-columns: 1fr; } }
.gt-cs-card {
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 6px;
  padding: 16px;
}
.gt-cs-card h4 {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #f4845f;
  margin: 0 0 12px;
}
.gt-cs-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #161b22;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
}
.gt-cs-item:last-child { border: none; }
.gt-cs-item .k { color: #f4845f; }
.gt-cs-item .d { color: #6e7681; font-size: 11px; text-align: right; max-width: 55%; }
</style>

<div class="gt-post">

<div class="gt-notice">
<strong>⚠ this is not a "run these commands" tutorial.</strong> every section explains why something works the way it does before telling you what to type. that's intentional. if you actually want git to make sense instead of just memorizing commands that break in new situations, read the explanations. the exercises are short and take real minutes, not theoretical hours.
</div>

---

## the series — what we're building toward

This is Part 01 of a series. Here's the whole map so you know where you're going.

<div class="gt-series">
<div class="gt-series-head">git and github from scratch — series overview</div>
<div class="gt-series-item active-row">
  <span class="gt-series-num">01</span>
  <span class="gt-series-title">How Git Actually Thinks — commits, objects, the three areas</span>
  <span class="gt-series-tag active">you are here</span>
</div>
<div class="gt-series-item">
  <span class="gt-series-num">02</span>
  <span class="gt-series-title">Branching, Merging, Rebasing — and why they're not scary</span>
  <span class="gt-series-tag upcoming">upcoming</span>
</div>
<div class="gt-series-item">
  <span class="gt-series-num">03</span>
  <span class="gt-series-title">Remotes, GitHub, SSH — pushing, pulling, tracking branches</span>
  <span class="gt-series-tag upcoming">upcoming</span>
</div>
<div class="gt-series-item">
  <span class="gt-series-num">04</span>
  <span class="gt-series-title">GitHub Like a Developer — forks, PRs, issues, code review</span>
  <span class="gt-series-tag upcoming">upcoming</span>
</div>
<div class="gt-series-item">
  <span class="gt-series-num">05</span>
  <span class="gt-series-title">Open Source Contribution — the real workflow, from fork to merged PR</span>
  <span class="gt-series-tag upcoming">upcoming</span>
</div>
<div class="gt-series-item">
  <span class="gt-series-num">06</span>
  <span class="gt-series-title">Advanced Git — reflog, cherry-pick, stash, reset, detached HEAD, tags</span>
  <span class="gt-series-tag upcoming">upcoming</span>
</div>
<div class="gt-series-item">
  <span class="gt-series-num">07</span>
  <span class="gt-series-title">Workflows, CI, and Release Flow — gitflow, branch protection, GitHub Actions</span>
  <span class="gt-series-tag upcoming">upcoming</span>
</div>
</div>

By the end of all seven parts, you'll be able to contribute to real open source projects, manage repositories confidently, recover from Git mistakes, and navigate GitHub the way developers who've been using it for years do. That's the goal.

---

## ok so why Git

Real talk: when I first heard "version control", I thought it was just a backup system for code. Like, you save your work to GitHub and if your laptop dies, you still have it. That's it right?

That's not wrong, but it's maybe 10% of what Git actually is.

Git is how every piece of software you use is built. The Linux kernel, the browser you're reading this in, React, Python, Node.js, VS Code — every single one of them uses Git. Not just as storage, but as the entire coordination layer for hundreds or thousands of developers working on the same codebase simultaneously, without destroying each other's work.

The Linux kernel alone has thousands of contributors from hundreds of different companies, and Linus Torvalds actually wrote the first version of Git in about two weeks specifically because the previous tool they were using wasn't good enough to handle that scale. That's the origin story. Git was built by the person who needed it the most.

So why does it matter to you as someone just starting? Because the moment you start working on anything that takes more than a weekend, or the moment you start collaborating with even one other person, or the moment you want to contribute to any existing project on GitHub — you need to understand Git. Not just the commands, but how it thinks. Because once you understand how it thinks, every command makes intuitive sense and you stop being scared of it.

---

## what Git is not

Before explaining what Git is, let me tell you what it isn't. Because most people's confusion starts here.

Git is **not** a system that tracks changes line by line like a diff file. A lot of people assume this because when you do `git diff`, you see additions and deletions line by line. So they assume that's what Git stores internally.

Git stores **snapshots**, not diffs.

Every time you make a commit, Git takes a complete snapshot of your entire project at that moment. Not "here's what changed", but "here's what every single file looked like right now." If a file didn't change since the last commit, Git doesn't store it again — it just points to the same stored copy from before. But the model is snapshots, not deltas. This distinction matters a lot and we'll come back to it.

---

## installing Git

Most Linux systems have Git already. Check first:

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="p">$ </span>git --version</div>
</div>

If you get `git version 2.x.x` you're good. If not:

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="cm"># Arch / Manjaro</span>
<span class="p">$ </span>sudo pacman -S git

<span class="cm"># Ubuntu / Debian</span>
<span class="p">$ </span>sudo apt install git

<span class="cm"># Fedora</span>
<span class="p">$ </span>sudo dnf install git

<span class="cm"># macOS (via Homebrew)</span>
<span class="p">$ </span>brew install git</div>

</div>

---

## first-time setup

Every commit you make will have your name and email attached to it. This is important because when you push to GitHub or contribute to open source projects, other people see this. Set it once and it applies to everything:

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="p">$ </span>git config --global user.name <span class="bl">"Your Name"</span>
<span class="p">$ </span>git config --global user.email <span class="bl">"you@example.com"</span>

<span class="cm"># optional but very useful — set your default editor</span>
<span class="cm"># this is what opens when Git needs you to write a message</span>
<span class="p">$ </span>git config --global core.editor <span class="bl">nvim</span> <span class="cm"># or vim, nano, code --wait</span>

<span class="cm"># verify everything looks right</span>
<span class="p">$ </span>git config --global --list</div>

</div>

The `--global` flag means this applies to all repositories on your machine. The config is stored in `~/.gitconfig`. You can also set config per-repository without the `--global` flag, which overrides the global one for that project specifically.

<div class="gt-tip">
<strong>// about the email:</strong> if you're planning to push to GitHub, use the same email your GitHub account is registered with. that's how GitHub connects your commits to your profile and shows them on your contribution graph. if you want to keep your email private, GitHub provides a no-reply email like <code>12345678+username@users.noreply.github.com</code> — you can find yours in GitHub Settings under Emails.
</div>

---

## the mental model you actually need

Ok this is the most important section in Part 01. Everything else in Git builds on this, so really read this part.

Git manages three distinct areas. Most beginners don't know all three exist, and that's exactly why things feel confusing.

<div class="gt-diagram">
<div class="gt-diagram-title">git's three areas</div>
<div class="gt-diagram-body">
<div class="gt-areas">
  <div class="gt-area gt-area-1">
    <div class="gt-area-head">working directory</div>
    <div class="gt-area-body">
      your actual files on disk. when you open a file and edit it, that's here.<br><br>
      <span class="item">→ files git doesn't know about yet</span><br>
      <span class="item">→ files you've edited but not staged</span>
    </div>
  </div>
  <div class="gt-area-arrow">→<br><span>git add</span></div>
  <div class="gt-area gt-area-2">
    <div class="gt-area-head">staging area (index)</div>
    <div class="gt-area-body">
      a "draft" of your next commit. files go here when you run <code>git add</code>.<br><br>
      <span class="item">→ changes queued for the next commit</span><br>
      <span class="item">→ you control exactly what goes in</span>
    </div>
  </div>
  <div class="gt-area-arrow">→<br><span>git commit</span></div>
  <div class="gt-area gt-area-3">
    <div class="gt-area-head">repository (.git)</div>
    <div class="gt-area-body">
      permanent history, stored inside the hidden <code>.git/</code> folder.<br><br>
      <span class="item">→ immutable commits</span><br>
      <span class="item">→ branches, tags, reflog</span>
    </div>
  </div>
</div>
</div>
</div>

The **working directory** is just your files. When you create a new file or edit an existing one, those changes exist only in the working directory. Git is aware the directory exists, but it doesn't care about those specific changes yet.

The **staging area** (also called the index) is where you prepare your next commit. Think of it as a loading dock. You're deciding what goes into the truck (the commit) before it leaves. This is what `git add` does — it moves changes from the working directory into the staging area. The staging area lets you be selective about what goes into each commit, which is a design choice most people don't appreciate until they're mid-project and it saves them.

The **repository** is the permanent history, stored inside the `.git/` folder. Once you run `git commit`, the staged changes become a permanent, immutable commit. You can always go back and look at any commit from the history, no matter how old.

Every state your files can be in maps to one of these three areas. Once that clicks, `git status` output stops being cryptic.

---

## what a commit actually is

This is the part most tutorials skip because they assume you don't care. You should care. Understanding this makes everything else click.

When you run `git commit`, Git creates three types of objects internally and stores them in `.git/objects/`. Each object is identified by a SHA-1 hash — a 40-character string like `a3f5e8b2c1...` that's basically a fingerprint of the content.

<div class="gt-diagram">
<div class="gt-diagram-title">git object model — what's actually stored when you commit</div>
<div class="gt-diagram-body">
<div class="gt-obj-row">
  <div class="gt-obj gt-obj-commit">
    <div class="gt-obj-head">commit object</div>
    <div class="gt-obj-body">
      <span class="k">tree  </span><span class="hash">4b825d...</span><br>
      <span class="k">parent</span><span class="hash"> 9f3a1e...</span><br>
      <span class="k">author</span><span class="v"> Eshan</span><br>
      <span class="k">date  </span><span class="v"> 2026-05-12</span><br>
      <span class="k">msg   </span><span class="v"> "add login page"</span>
    </div>
  </div>
  <div class="gt-obj gt-obj-tree">
    <div class="gt-obj-head">tree object (directory)</div>
    <div class="gt-obj-body">
      <span class="k">blob</span> <span class="hash">a4f2...</span> <span class="v">index.html</span><br>
      <span class="k">blob</span> <span class="hash">c8e1...</span> <span class="v">style.css</span><br>
      <span class="k">tree</span> <span class="hash">77ab...</span> <span class="v">src/</span>
    </div>
  </div>
  <div class="gt-obj gt-obj-blob">
    <div class="gt-obj-head">blob object (file content)</div>
    <div class="gt-obj-body">
      raw file content,<br>
      compressed.<br><br>
      <span class="v">no filename, no path,<br>just content.</span>
    </div>
  </div>
</div>
</div>
</div>

A **blob** is just the raw content of a single file, compressed. No filename, no path, just content.

A **tree** is like a directory listing. It maps filenames and subdirectories to blob hashes (for files) or other tree hashes (for subdirectories).

A **commit** points to one tree (the root snapshot of your project), has a pointer to its parent commit (which is how history is connected), and has your author name, date, and message.

So a full history looks like a chain of commits, each pointing back to the previous one, and each pointing to a complete snapshot of the whole project:

<div class="gt-diagram">
<div class="gt-diagram-title">commit chain — this is what "history" looks like internally</div>
<div class="gt-diagram-body">
<div class="gt-graph">
<div class="gt-commit">
  <div style="width:24px;height:24px;border-radius:50%;background:#d2a8ff;border:2px solid #d2a8ff;flex-shrink:0;"></div>
  <span class="gt-c-hash">a3f5e8b</span>
  <span style="color:#30363d;">←</span>
  <span class="gt-c-msg">add dark mode toggle</span>
  <span class="gt-c-meta">(HEAD → main)</span>
</div>
<div style="height:2px;background:#21262d;width:12px;margin-left:11px;"></div>
<div class="gt-commit">
  <div style="width:24px;height:24px;border-radius:50%;background:#f4845f;border:2px solid #f4845f;flex-shrink:0;"></div>
  <span class="gt-c-hash">9f3a1ec</span>
  <span style="color:#30363d;">←</span>
  <span class="gt-c-msg">fix navigation bug</span>
  <span class="gt-c-meta"></span>
</div>
<div style="height:2px;background:#21262d;width:12px;margin-left:11px;"></div>
<div class="gt-commit">
  <div style="width:24px;height:24px;border-radius:50%;background:#56d364;border:2px solid #56d364;flex-shrink:0;"></div>
  <span class="gt-c-hash">2bc7f0d</span>
  <span style="color:#30363d;">←</span>
  <span class="gt-c-msg">initial commit</span>
  <span class="gt-c-meta"></span>
</div>
</div>
</div>
</div>

The newest commit is at the top. Each commit points to its parent. `HEAD` is just a pointer — it tracks "where you currently are" in the history. Right now it's pointing to `main`, which points to the newest commit.

Why does any of this matter? Because now when you hear "Git is showing me the difference between two commits", you understand what's happening: Git is looking up the tree objects from both commits, comparing the blobs, and showing you what changed. It's not magic, it's just comparing two snapshots.

---

## git init — starting a repository

When you want to track a project with Git, you initialize a repository in its directory.

<div class="gt-exercise">
<div class="gt-ex-label">Exercise 01 => create your first repo</div>
<p>Let's build a real project through this series. Make a folder for it now:</p>
<ol>
<li>Open a terminal and create a project folder: <code>mkdir my-portfolio && cd my-portfolio</code></li>
<li>Initialize Git: <code>git init</code></li>
<li>Look at what it created: <code>ls -la</code></li>
</ol>
<p>You should see a <strong>.git/</strong> folder. That's your entire repository — the full history, all configuration, all the objects we just talked about. If you delete <code>.git/</code>, you delete all Git tracking. Your files stay, but all history is gone.</p>
</div>

When you run `git init`, here's what's actually created inside `.git/`:

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div><span class="gt-term-label">inside .git/</span></div>
<div class="gt-term-body"><span class="p">$ </span>ls .git/
<span class="bl">HEAD</span>        <span class="cm">← points to the current branch (right now: refs/heads/main)</span>
<span class="bl">config</span>      <span class="cm">← per-repo config, overrides ~/.gitconfig</span>
<span class="bl">description</span> <span class="cm">← used by git web interfaces, ignore it</span>
<span class="gr">hooks/</span>      <span class="cm">← scripts that run before/after git operations (Part 07)</span>
<span class="gr">info/</span>       <span class="cm">← additional settings</span>
<span class="gr">objects/</span>    <span class="cm">← this is where all the blobs, trees, commits live</span>
<span class="gr">refs/</span>       <span class="cm">← pointers to commits (branches, tags)</span></div>
</div>

The `objects/` directory starts completely empty. Every commit, file, and directory snapshot you ever make goes in there. Right now, nothing is tracked.

<div class="gt-warn">
<strong>// one repo per project, at the root:</strong> only run <code>git init</code> at the root of your project. don't run it inside a folder that's already inside another git repository — nested repos cause weird behavior. if you do it by mistake, just delete the inner <code>.git/</code> folder.
</div>

---

## git status — your ground truth

`git status` is the command you will run more than any other. It tells you the current state of all three areas.

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="p">$ </span>git status
<span class="yl">On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)</span></div>

</div>

This makes sense — we just initialized an empty repo. Let's create a file and see what status says:

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="p">$ </span>echo <span class="bl">"# My Portfolio"</span> > README.md
<span class="p">$ </span>git status
<span class="yl">On branch main

No commits yet

Untracked files:
(use "git add &lt;file&gt;..." to include in what will be committed)
</span><span class="rd">README.md</span>

<span class="yl">nothing added to commit but untracked files present (use "git add" to track)</span></div>

</div>

Git sees `README.md` in the working directory but it's **untracked**. That means Git knows the file exists, but it's not in the staging area and has never been in a commit. Git is not tracking any changes to it.

---

## git add — moving things to staging

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="p">$ </span>git add README.md
<span class="p">$ </span>git status
<span class="yl">On branch main

No commits yet

Changes to be committed:
(use "git rm --cached &lt;file&gt;..." to unstage)
</span><span class="gr">new file: README.md</span></div>

</div>

Now `README.md` is in the staging area. It shows up under "Changes to be committed" in green. If you were to run `git commit` right now, this file would be included.

Here's the thing that trips people up: **staging is a snapshot of the file at the moment you ran `git add`.** If you edit the file after staging it, those new changes are NOT staged. You'd need to `git add` it again.

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="cm"># edit the file after staging</span>
<span class="p">$ </span>echo <span class="bl">"by Eshan"</span> >> README.md
<span class="p">$ </span>git status
<span class="yl">On branch main

No commits yet

Changes to be committed:
(use "git rm --cached &lt;file&gt;..." to unstage)
</span><span class="gr">new file: README.md</span>

<span class="yl">Changes not staged for commit:
(use "git add &lt;file&gt;..." to update what will be committed)
(use "git restore &lt;file&gt;..." to discard changes in working directory)
</span><span class="rd">modified: README.md</span></div>

</div>

The same file shows up twice. The staged version (first block) is the snapshot from before the second edit. The modified version (second block) is the newer edit that isn't staged yet. This demonstrates that staging is its own separate state, not just a tag on the file.

### git add patterns

<table class="gt-keytable">
<tr><th>Command</th><th>What it stages</th></tr>
<tr><td>git add README.md</td><td>One specific file</td></tr>
<tr><td>git add src/</td><td>All files inside the src/ directory, recursively</td></tr>
<tr><td>git add *.js</td><td>All .js files in the current directory</td></tr>
<tr><td>git add .</td><td>Everything in the current directory and below — use carefully</td></tr>
<tr><td>git add -p</td><td>Interactive mode — stages hunks (chunks) of changes, file by file. very useful.</td></tr>
</table>

`git add -p` is worth knowing early even though most tutorials save it for "advanced" sections. It lets you stage part of a file's changes and leave the rest unstaged. That's how you make clean, focused commits even when you've changed multiple things in a single file.

---

## your first commit

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="cm"># stage everything cleanly first</span>
<span class="p">$ </span>git add README.md

<span class="p">$ </span>git commit -m <span class="bl">"initial commit: add README"</span>
<span class="yl">[main (root-commit) 2bc7f0d] initial commit: add README
1 file changed, 2 insertions(+)
create mode 100644 README.md</span></div>

</div>

That's it. You've made a commit. Let's read what Git printed:

`[main (root-commit) 2bc7f0d]` — the commit landed on the `main` branch, it's the very first commit (root-commit), and its hash starts with `2bc7f0d`.

`1 file changed, 2 insertions(+)` — one file was in the staging area, and it had 2 lines added.

### writing good commit messages

The `-m "..."` flag lets you write the message inline. This is fine for short messages. For multi-line messages (which are often better for meaningful changes), just run `git commit` without `-m` and your configured editor opens.

A commit message should complete this sentence: **"if applied, this commit will \_\_\_"**

Good: `"add user authentication to login route"`
Good: `"fix crash when email field is empty"`
Bad: `"stuff"`
Bad: `"changes"`
Bad: `"final fix"`

The subject line is conventionally kept under 72 characters. If you need to explain context, add a blank line after the subject, then a body paragraph.

<div class="gt-tip">
<strong>// conventional commits:</strong> a lot of teams use a format like <code>feat: add login page</code> or <code>fix: resolve null pointer in auth</code>. the prefix tells you the type of change at a glance. it's not required but it's a good habit, especially if you plan to work in open source where maintainers read hundreds of PRs.
</div>

---

## git log — reading history

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="p">$ </span>git log
<span class="yl">commit 2bc7f0d1e3a4f5b6c7d8e9f0a1b2c3d4e5f6a7b8</span>
<span class="bl">Author: Eshan &lt;eshan@example.com&gt;</span>
<span class="bl">Date:   Mon May 12 00:00:00 2026 +0530</span>

    initial commit: add README</div>

</div>

One commit, one entry. The full 40-character hash, author, date, and message. As your project grows this gets long fast. Some more useful log formats:

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="cm"># compact one-line view</span>
<span class="p">$ </span>git log --oneline
<span class="yl">2bc7f0d</span> initial commit: add README

<span class="cm"># with branch/tag pointers drawn</span>
<span class="p">$ </span>git log --oneline --graph --all

<span class="cm"># last 5 commits</span>
<span class="p">$ </span>git log --oneline -5

<span class="cm"># commits by a specific author</span>
<span class="p">$ </span>git log --author=<span class="bl">"Eshan"</span>

<span class="cm"># commits that changed a specific file</span>
<span class="p">$ </span>git log --oneline -- README.md

<span class="cm"># commits since a date</span>
<span class="p">$ </span>git log --since=<span class="bl">"2026-01-01"</span></div>

</div>

`git log --oneline --graph --all` becomes your best friend once you start using branches. It draws an ASCII tree of your commit history so you can see how branches diverged and merged. We'll use it a lot in Part 02.

A useful alias to set globally — this gives you a pretty, readable log:

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="p">$ </span>git config --global alias.lg <span class="bl">"log --oneline --graph --all --decorate"</span>
<span class="cm"># now you can just run:</span>
<span class="p">$ </span>git lg</div>
</div>

---

## git diff — seeing what changed

`git diff` shows you changes between different states. The confusing part is it has different behaviors depending on what arguments you give it.

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="cm"># working directory vs staging area</span>
<span class="cm"># shows changes that are NOT yet staged</span>
<span class="p">$ </span>git diff

<span class="cm"># staging area vs last commit</span>
<span class="cm"># shows what WILL be committed if you run git commit right now</span>
<span class="p">$ </span>git diff --staged

<span class="cm"># working directory vs last commit (everything, staged or not)</span>
<span class="p">$ </span>git diff HEAD

<span class="cm"># compare any two commits</span>
<span class="p">$ </span>git diff 2bc7f0d a3f5e8b

<span class="cm"># compare a specific file between two commits</span>
<span class="p">$ </span>git diff 2bc7f0d a3f5e8b -- README.md</div>

</div>

Reading a diff output:

<div class="gt-diff">
<div class="gt-diff-bar">index.html — git diff output</div>
<div class="gt-diff-line gt-diff-meta">--- a/index.html</div>
<div class="gt-diff-line gt-diff-meta">+++ b/index.html</div>
<div class="gt-diff-line gt-diff-meta">@@ -1,4 +1,6 @@</div>
<div class="gt-diff-line gt-diff-ctx">  &lt;html&gt;</div>
<div class="gt-diff-line gt-diff-ctx">    &lt;head&gt;</div>
<div class="gt-diff-line gt-diff-del">-     &lt;title&gt;Home&lt;/title&gt;</div>
<div class="gt-diff-line gt-diff-add">+     &lt;title&gt;My Portfolio&lt;/title&gt;</div>
<div class="gt-diff-line gt-diff-add">+     &lt;meta charset="utf-8"&gt;</div>
<div class="gt-diff-line gt-diff-ctx">    &lt;/head&gt;</div>
</div>

Lines in red starting with `-` were removed. Lines in green starting with `+` were added. Lines with no prefix are context (unchanged lines nearby, shown so you know where in the file the change is). The `@@ -1,4 +1,6 @@` header means "this chunk came from lines 1-4 in the old version and now spans lines 1-6 in the new version."

---

## building your first real sequence of commits

Let's do a proper exercise that builds the mental model through practice:

<div class="gt-exercise">
<div class="gt-ex-label">Exercise 02 => make three commits and read the history</div>
<p>Inside your <code>my-portfolio</code> folder:</p>
<ol>
<li>Create an <code>index.html</code> with a basic HTML skeleton. Just a title and an empty body is fine.</li>
<li>Stage and commit it: <code>git add index.html && git commit -m "add index.html with basic structure"</code></li>
<li>Create a <code>style.css</code> with some basic body styling (background color, font, whatever).</li>
<li>Commit it: <code>git add style.css && git commit -m "add initial stylesheet"</code></li>
<li>Add a link tag in <code>index.html</code> pointing to <code>style.css</code>.</li>
<li>Stage and commit it: <code>git add index.html && git commit -m "link stylesheet in index.html"</code></li>
<li>Now run: <code>git log --oneline</code> and see all three commits.</li>
<li>Try: <code>git show HEAD</code> to see the full diff of the latest commit.</li>
<li>Try: <code>git diff HEAD~1 HEAD</code> to compare the last two commits. (<code>HEAD~1</code> means "one commit before HEAD")</li>
</ol>
</div>

`HEAD~1` is shorthand for "the parent of HEAD." `HEAD~2` is two back, and so on. You'll use this notation constantly once you start rewinding history.

---

## .gitignore — telling Git what to ignore

Some files should never be tracked: build output, compiled binaries, dependency folders, environment files with secrets, OS junk like `.DS_Store`.

Create a `.gitignore` file at the root of your project:

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div><span class="gt-term-label">.gitignore</span></div>
<div class="gt-term-body"><span class="cm"># Node.js</span>
<span class="gr">node_modules/</span>
<span class="gr">dist/</span>
<span class="gr">build/</span>

<span class="cm"># Environment variables — NEVER commit these</span>
<span class="gr">.env</span>
<span class="gr">.env.local</span>
<span class="gr">.env.\*.local</span>

<span class="cm"># OS generated</span>
<span class="gr">.DS_Store</span>
<span class="gr">Thumbs.db</span>

<span class="cm"># Editor junk</span>
<span class="gr">.vscode/</span>
<span class="gr">_.swp</span>
<span class="gr">_.swo</span>

<span class="cm"># Logs</span>
<span class="gr">_.log</span>
<span class="gr">npm-debug.log_</span></div>

</div>

### pattern syntax

`node_modules/` — the trailing slash means "ignore this directory."
`*.log` — ignore any file ending in `.log` anywhere in the project.
`/build` — only ignore `build/` at the root level, not in subdirectories.
`!important.log` — the `!` prefix means "don't ignore this, even if a broader pattern would match it."
`src/**/*.test.js` — ignore all test files inside any subdirectory of `src/`.

<div class="gt-warn">
<strong>// .env files:</strong> i cannot stress this enough. if you commit a <code>.env</code> file with real API keys or database passwords to a public GitHub repo, bots scan for those within minutes. people have gotten bills for thousands of dollars from cloud providers because of this. <code>.env</code> goes in <code>.gitignore</code>, always. use <code>.env.example</code> (with fake values) to show teammates the expected format.
</div>

### what if I already committed something I wanted to ignore?

`.gitignore` only prevents files from being tracked going forward. If a file is already in Git's history, adding it to `.gitignore` doesn't remove it.

To stop tracking a file that's already been committed:

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="cm"># removes the file from tracking but keeps it on disk</span>
<span class="p">$ </span>git rm --cached .env

<span class="cm"># then add .env to .gitignore and commit both changes</span>
<span class="p">$ </span>echo ".env" >> .gitignore
<span class="p">$ </span>git add .gitignore
<span class="p">$ </span>git commit -m "stop tracking .env, add to .gitignore"</div>

</div>

Note that the file will still be in the older commits in history. If the file contained actual secrets, you need to either rotate those secrets (change the API keys/passwords immediately) or do a full history rewrite with `git filter-branch` or the `git-filter-repo` tool. Don't just add it to `.gitignore` and think the secrets are safe.

---

## undoing things before a commit

This is important to know early because you'll need it constantly.

**Unstage something you just added:**

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="p">$ </span>git restore --staged README.md
<span class="cm"># older syntax (still works): git reset HEAD README.md</span></div>
</div>

This moves `README.md` back out of the staging area to the working directory. The file itself is unchanged on disk.

**Discard changes in the working directory (go back to what's in staging or last commit):**

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="p">$ </span>git restore README.md
<span class="cm"># this overwrites the file on disk with the staged version (or last commit)</span>
<span class="cm"># your edits are gone. for real. no undo.</span></div>
</div>

<div class="gt-warn">
<strong>// git restore is destructive for working directory changes:</strong> unlike most git operations, discarding working directory changes cannot be undone. there's no way to recover them. if you're not sure, copy the file somewhere else first, then restore.
</div>

**Fix the last commit message (before pushing):**

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="p">$ </span>git commit --amend -m <span class="bl">"better commit message"</span>
<span class="cm"># this rewrites the last commit. don't do this after pushing to a shared branch.</span></div>
</div>

`--amend` also lets you add files you forgot to stage before committing. Stage the forgotten file, then run `git commit --amend` to fold it into the previous commit.

---

## git show — inspecting a commit

<div class="gt-term">
<div class="gt-term-bar"><div class="gt-dot gt-dot-r"></div><div class="gt-dot gt-dot-y"></div><div class="gt-dot gt-dot-g"></div></div>
<div class="gt-term-body"><span class="cm"># full diff of the most recent commit</span>
<span class="p">$ </span>git show

<span class="cm"># full diff of a specific commit by hash</span>
<span class="p">$ </span>git show 9f3a1ec

<span class="cm"># see the content of a file from a specific commit</span>
<span class="p">$ </span>git show 9f3a1ec:README.md

<span class="cm"># see just the metadata, no diff</span>
<span class="p">$ </span>git show --stat 9f3a1ec</div>

</div>

`git show [hash]:[path]` is one of those commands you'll be very glad you know. It lets you look at what a file contained at any point in history without checking out that commit. Super useful for debugging when something broke.

---

## the full exercise — putting it all together

<div class="gt-exercise">
<div class="gt-ex-label">Exercise 03 => a real commit workflow from scratch</div>
<p>This exercise simulates a real mini-project. Go through it step by step.</p>
<ol>
<li>Make a new directory called <code>git-practice</code>, go into it, and run <code>git init</code>.</li>
<li>Create a <code>.gitignore</code> and add <code>*.log</code> and <code>temp/</code> to it.</li>
<li>Create a file called <code>notes.txt</code> with some text.</li>
<li>Run <code>git status</code> and read the output. You should see <code>notes.txt</code> as untracked and <code>.gitignore</code> as untracked.</li>
<li>Stage both files with <code>git add .</code></li>
<li>Run <code>git status</code> again. Both should be in "Changes to be committed."</li>
<li>Commit: <code>git commit -m "initial setup: gitignore and notes"</code></li>
<li>Now create a <code>temp/</code> directory and put a file inside it. Run <code>git status</code>. It should not show up at all — it's being ignored.</li>
<li>Create a file called <code>app.log</code>. Run <code>git status</code>. Also ignored.</li>
<li>Edit <code>notes.txt</code>. Run <code>git diff</code> to see the change.</li>
<li>Stage it with <code>git add notes.txt</code>. Run <code>git diff</code> — nothing (already staged). Run <code>git diff --staged</code> — now you see it.</li>
<li>Commit it.</li>
<li>Run <code>git log --oneline</code>. You should have two commits.</li>
<li>Run <code>git show HEAD~1</code> to see the first commit in detail.</li>
</ol>
</div>

---

## part 01 cheatsheet

<div class="gt-cs-grid">
<div class="gt-cs-card">
<h4>Setup</h4>
<div class="gt-cs-item"><span class="k">git config --global user.name</span><span class="d">set your name</span></div>
<div class="gt-cs-item"><span class="k">git config --global user.email</span><span class="d">set your email</span></div>
<div class="gt-cs-item"><span class="k">git config --global --list</span><span class="d">view all global config</span></div>
<div class="gt-cs-item"><span class="k">git init</span><span class="d">start a new repo here</span></div>
</div>
<div class="gt-cs-card">
<h4>Staging + Committing</h4>
<div class="gt-cs-item"><span class="k">git status</span><span class="d">what's going on right now</span></div>
<div class="gt-cs-item"><span class="k">git add &lt;file&gt;</span><span class="d">stage a file</span></div>
<div class="gt-cs-item"><span class="k">git add .</span><span class="d">stage everything</span></div>
<div class="gt-cs-item"><span class="k">git add -p</span><span class="d">interactive stage by hunk</span></div>
<div class="gt-cs-item"><span class="k">git commit -m "msg"</span><span class="d">commit with inline message</span></div>
<div class="gt-cs-item"><span class="k">git commit --amend</span><span class="d">rewrite last commit</span></div>
</div>
<div class="gt-cs-card">
<h4>Inspecting</h4>
<div class="gt-cs-item"><span class="k">git log --oneline</span><span class="d">compact history</span></div>
<div class="gt-cs-item"><span class="k">git log --oneline --graph</span><span class="d">history as a tree</span></div>
<div class="gt-cs-item"><span class="k">git diff</span><span class="d">working dir vs staging</span></div>
<div class="gt-cs-item"><span class="k">git diff --staged</span><span class="d">staging vs last commit</span></div>
<div class="gt-cs-item"><span class="k">git show HEAD</span><span class="d">full diff of latest commit</span></div>
<div class="gt-cs-item"><span class="k">git show [hash]:[file]</span><span class="d">file content at any commit</span></div>
</div>
<div class="gt-cs-card">
<h4>Undoing</h4>
<div class="gt-cs-item"><span class="k">git restore --staged &lt;f&gt;</span><span class="d">unstage a file</span></div>
<div class="gt-cs-item"><span class="k">git restore &lt;file&gt;</span><span class="d">discard working dir changes</span></div>
<div class="gt-cs-item"><span class="k">git rm --cached &lt;file&gt;</span><span class="d">stop tracking a file</span></div>
</div>
</div>

---

<div class="gt-checkpoint">
<div class="gt-cp-label">// checkpoint — part 01</div>
<ul>
<li><div class="gt-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand the three areas: working directory, staging, repository</span></li>
<li><div class="gt-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I understand that commits are snapshots, not line-by-line diffs</span></li>
<li><div class="gt-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can run git init and set up name/email config</span></li>
<li><div class="gt-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can read git status and know what each section means</span></li>
<li><div class="gt-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can stage files and make commits with meaningful messages</span></li>
<li><div class="gt-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I know the difference between git diff and git diff --staged</span></li>
<li><div class="gt-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can read git log and understand what HEAD means</span></li>
<li><div class="gt-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I have a .gitignore that ignores the right things in my project</span></li>
<li><div class="gt-cb" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':''"></div><span>I can unstage changes, discard working directory changes, and amend a commit</span></li>
</ul>
</div>

---

## what's next

In Part 02 we're going into branching, and it's where Git goes from "a useful backup tool" to something that genuinely changes how you work. We'll cover what a branch actually is at the object level (spoiler: it's just a pointer to a commit, nothing more), how branching and switching works, the difference between merging and rebasing and when to use each, how to handle merge conflicts without panicking, and what a "detached HEAD" state is and how to get out of it.

By the end of Part 02 you'll be thinking in branches naturally, and you'll have a clear mental model of why Git's branching is so much faster and lighter than other version control systems.

If something in Part 01 felt unclear, the best way to fix it is to run the exercises again with a different project. The mental model only really settles in when you've run through the cycle a few times for real.

</div>
