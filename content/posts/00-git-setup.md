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

</details>

## The core flow: edit, stage, commit, push

Files move through four places:

```
Working Directory -> Staging Area -> Local Repo -> Remote on GitHub
   edit files        git add         git commit      git push
```

**Blob, Tree, Commit** sound scary but map cleanly:

- Blob holds file content, addressed by hash
- Tree holds a folder listing of blobs and sub trees
- Commit holds a snapshot plus a pointer to its parent, forming a linked list of history

Daily commands for the series:

```bash
# Start or get code
git init
git clone <url>

# Daily loop
git status
git add .
git add server.js
git commit -m "feat: add posts CRUD"
git push origin main
git pull origin main

# Look around
git log --oneline
git diff
```

Why `add` then `commit` instead of one save step? Staging lets you craft small clean commits. I stage only the blog API files, commit that, then stage the frontend files separately. Reviewers and future me can read that history.

Start your blog repo now:

```bash
mkdir blog-platform
cd blog-platform
npm init -y
git init
echo "node_modules/" > .gitignore
echo "# Blog platform" > README.md
git add .
git commit -m "init: blog platform starter"
```

Why `.gitignore` first? Without it you will commit `node_modules` once and your repo becomes huge. Adding the ignore before the first commit avoids that mess.

> Try it yourself: create `post.js` with one console log, stage only that file, commit, then check log.

<details>
<summary>Solution</summary>

```bash
echo 'console.log("hello blog")' > post.js
git status
# shows post.js as untracked

git add post.js
git status
# shows post.js staged, ready to commit

git commit -m "feat: add post helper"
git log --oneline
# shows your two commits so far
```

Why: `status` before and after shows the move from working dir to staging to repo.

Common mistake: `git add .` then realizing you staged secrets like `.env`. Check `status` before commit. If you staged too much, `git reset HEAD <file>` unstages without deleting the file.

</details>

## Branching without fear

Main should always run. New work happens on branches.

```bash
git branch feature/posts-api
git checkout feature/posts-api
# shortcut for both:
git checkout -b feature/auth

# after work is done, back to main and merge
git checkout main
git merge feature/posts-api
```

Picture:

```
main:    C1 --- C2 --- C3 --- C4 --- Merge
                   \                /
feature:            A1 --- A2 -----
```

Why branch for each blog post feature? When auth breaks, posts API on main still works. You can switch branches instead of commenting out half your server.

Naming I use in this series: `feature/posts-crud`, `feature/auth-jwt`, `fix/cors-error`. The prefix tells me what kind of change it is before I open it.

> Try it yourself: create a branch, add a line to README, commit, merge back to main, delete the branch.

<details>
<summary>Solution</summary>

```bash
git checkout -b feature/readme-note
echo "Posts API on port 3000" >> README.md
git add README.md
git commit -m "docs: note API port"
git checkout main
git merge feature/readme-note
git branch -d feature/readme-note
git log --oneline
```

Why: merge brings the branch commits into main history. Delete after merge keeps the list clean.

Common mistake: merging with uncommitted changes on main. Commit or stash first, or Git refuses to switch branches to protect your work.

</details>

## Merge conflicts, what they look like and how to fix

Conflicts happen when two branches edit the same lines differently. Git cannot pick for you, so it marks the file.

```
<<<<<<< HEAD
const PORT = 3000;
=======
const PORT = 5000;
>>>>>>> feature/auth
```

Top part is your current branch. Bottom part is incoming. Markers show the split.

Fix flow:

1. Open the file, pick one side or combine, delete all markers
2. Test the file still runs
3. Stage and commit the fix

```bash
git status
# shows unmerged paths

# edit server.js to keep one PORT line, save

git add server.js
git commit -m "fix: resolve port conflict"
git log --merge
```

Why manual fix instead of auto pick? PORT 3000 vs 5000 changes Postman URLs, env docs, and frontend fetch strings. Only you know which one the team agreed on.

To see conflicts clearly I use `git status` for files plus `git diff` for content. `git log --merge` shows which commits clashed, useful when the conflict spans many files.

## Patterns worth copying

**Commit small and readable.** `feat: add GET posts` beats `stuff`. I follow type plus scope: `feat`, `fix`, `docs`, `chore`. Future search with `git log --oneline --grep=feat` actually works.

**Pull before push on shared branches.** `git pull origin main` before `git push` surfaces conflicts early when they are small. Pushing blind on a busy repo creates bigger merges later.

**Never commit secrets.** `.env` with JWT secrets and Mongo URIs stays local. Commit `.env.example` with fake values so others know what to create. If you already pushed a secret, rotate it. Deleting the file later does not remove it from history.

**Check status and diff before every commit.** Ten seconds here prevents committing debug logs, large dumps, or half finished auth middleware.

## Projects

### 1. Blog repo from zero to GitHub

Push the starter from this post to a real remote.

Requirements:

- Local repo with README, .gitignore, post.js
- At least 2 commits with clear messages
- GitHub repo connected as origin, pushed main
- README lists how to run `node post.js`

<details>
<summary>Solution with explanation</summary>

```bash
# local already done above, now connect remote
# create empty repo on github.com first, copy its URL

git remote add origin https://github.com/YOU/blog-platform.git
git branch -M main
git push -u origin main
```

Why `-u` on first push: links local main to remote main so later `git push` and `git pull` need no args.

Common mistake: pushing over HTTPS without login cached. Use a personal access token as password, or switch remote to SSH after setup.

</details>

### 2. Feature branch for posts API

Simulate real teamwork solo. Build posts CRUD on a branch, merge via a clean commit.

Requirements:

- Branch `feature/posts-crud` from main
- Add `server.js` with GET posts from post 03
- Commit on the branch, merge to main, tag the merge with log check
- Delete the branch after merge

<details>
<summary>Solution with explanation</summary>

```bash
git checkout -b feature/posts-crud
# add server.js from post 03 here
git add server.js
git commit -m "feat: add posts list API"
git checkout main
git merge feature/posts-crud -m "merge: posts list API"
git branch -d feature/posts-crud
git log --oneline --graph -5
```

