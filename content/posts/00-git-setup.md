---
title: "00 : Git Setup for This Series - Track Your Blog Code"
date: 2026-07-05T11:10:00+05:30
draft: false
tags: ["git", "tooling"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 0
description: "Git vs GitHub, staging vs commit vs push, branching, and merge conflicts. The minimum workflow to follow the blog backend and frontend posts."
cover:
  image: ""
  alt: ""
  caption: ""
---

I lost code twice before I took Git seriously. Once I overwrote my Express API with an old copy. Once I broke auth and could not go back. Both times I had no commits to return to. This post is the safety net for the rest of the series.

We will use Git to track the blog platform code from post 01 onward. No theory overload, just the flow you will use daily plus what to do when branches clash.

<details>
<summary>Prereqs to run this file</summary>

- Terminal basics: `mkdir`, `cd`, `ls`. Any OS terminal works.
- Git installed: check with `git --version`. If missing, install from git-scm.com and restart terminal.
- Folder: `blog-platform`. Create with `mkdir blog-platform && cd blog-platform`.
- GitHub account for the push project at the end. HTTPS with a personal access token works, SSH works too.
- Full file vs Fragment: `bash` blocks labeled Full file are paste ready. `git status` checks are safe to run anytime.

</details>

## Git vs GitHub in one minute

**Git** is the local tool on your machine. It tracks changes, lets you revert, and manages branches. Free, open source, works offline.

**GitHub** is a cloud host for Git repos. It adds a web UI, pull requests, and collaboration. It needs Git underneath.

| Git                    | GitHub                   |
| ---------------------- | ------------------------ |
| Installed locally      | Lives in the cloud       |
| Tracks history         | Hosts history plus UI    |
| Works without internet | Needs Git repos to host  |
| `commit` saves locally | `push` uploads to GitHub |

Why both? You commit often locally while building posts API. You push to GitHub to back up and share. If your laptop dies, the pushed copy survives.

Check yours:

```bash
git --version
```

If that prints a version, you are ready. If not, install Git from git-scm.com and restart your terminal.

> Try it yourself: run `git --version` and `git status` inside your blog folder vs outside any repo. Notice how the second one complains.

<details>
<summary>Solution</summary>

```bash
git --version
# git version 2.43.0 or similar

mkdir blog-platform && cd blog-platform
git status
# fatal: not a git repository, expected because no init yet
```

Why: `status` only works inside a repo with a `.git` folder. Outside, Git has nothing to report.

Common mistake: running all Git commands from home directory. Always `cd` into your project first.

