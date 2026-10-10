---
title: "01 : The Terminal in 20 Minutes - Stop Fearing the Black Window"
date: 2026-10-06T10:00:00+05:30
draft: false
tags: ["terminal", "tooling"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 100
description: "The 15 terminal commands that cover daily life: navigate, create, search, stop servers, and fix command not found. The first step of the series."
aliases: ["/posts/00-terminal-primer/", "/posts/terminal-primer/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

My first terminal was `cmd` on Windows 7, and my first scripts were `.bat` files: a list of commands saved in a file so I would not retype them. I did not know it then, but that was already the core idea of this post. The terminal is a text remote control for your computer, and a script is a saved sequence of commands.

If you have only used `cmd`, you already know most of this. Here is the translation, and the rest of the post teaches the right-hand column.

| What you did in Windows `cmd` | What you type here (bash) |
| ----------------------------- | ------------------------- |
| `dir` | `ls` |
| `cd` | `cd` |
| `cls` | `clear` |
| `copy`, `move`, `ren` | `cp`, `mv` (renaming is also `mv`) |
| `del` | `rm` (and there is no recycle bin) |
| `type file.txt` | `cat file.txt` |
| `findstr` | `grep` |
| `tasklist`, `taskkill` | `ps`, `kill` |

> **Where we are:** Nothing exists yet. By the end of this post you can move around your computer from a text window.
>
> **Phase 01** · Workshop · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** `pwd`, `ls`, `cd`, `mkdir`, `touch`, `cp`, `mv`, `rm`, `grep`, pipes, and ports.  
> **Not today:** Shell scripting and system admin. You will not need them for this series.
>
> **Time:** about 15 minutes to read, 30 to build.

<details>
<summary>Prereqs to run this file</summary>

- Mac or Linux: open Terminal. Windows: install Git for Windows and use **Git Bash**, so every command here works the same.
- A code editor. VS Code is what the series assumes.
- Nothing else. This is the very first post, so no folders exist yet.

</details>

## Part 1 of 6: Where am I? The three commands you use every minute

Every terminal session lives inside one folder at a time. Most "it does not work" moments in this series come from being in the wrong folder, so learn to ask where you are.

```bash
pwd          # print working directory: where am I?
ls           # list what is in this folder
cd Desktop   # change directory: go into Desktop
```

Try them in order. `pwd` prints something like `/Users/you`. `ls` lists your folders. `cd Desktop` moves you in, and `pwd` now shows the new place.

Paths have two flavors, and this trips up everyone once:

- **Absolute path** starts from the top: `/Users/you/Desktop/blog-platform`. It works from anywhere.
- **Relative path** starts from where you are: `blog-platform/server.js`. It only works from the right folder.

Four shortcuts you will use forever:

| Symbol | Means |
| ------ | ----- |
| `.` | this folder |
| `..` | the folder above |
| `~` | your home folder |
| `/` | the very top of the computer |

`cd ..` goes up one level. `cd ~` takes you home no matter how lost you are. `cd -` jumps back to where you just were.

> Checkpoint: run `cd ~`, then `pwd`. It should print your home folder. If you can always get home, you can never be truly lost.

> Try it yourself: from your home folder, go into Desktop, go back up one level with `..`, then jump to the same Desktop in one command using the `~` shortcut.

<details>
<summary>Solution</summary>

```bash
cd ~
cd Desktop
cd ..
cd ~/Desktop
pwd
```

Why: `~/Desktop` is an absolute path that works from any folder. `Desktop` alone is a relative path that only works from home.

Common mistake: typing `cd desktop` on Mac or Linux. Folder names are case sensitive there, so `desktop` and `Desktop` are different things.

</details>

## Part 2 of 6: Make things and look inside them

Now build the home for the whole series.

```bash
mkdir blog-platform        # make a folder
cd blog-platform
touch server.js notes.txt  # make empty files
ls                         # you should see both files
echo "hello blog" > notes.txt   # write text into a file (replaces content)
echo "second line" >> notes.txt # append text (keeps content)
cat notes.txt              # print the file
```

`>` replaces, `>>` adds. That one extra arrow is the difference between a safe note and a wiped file, so slow down when you type it.

Moving, copying and deleting:

```bash
cp notes.txt backup.txt    # copy
mv backup.txt old.txt      # move, also how you rename
rm old.txt                 # delete, no recycle bin
mkdir -p src/routes        # make nested folders in one go
rm -r src                  # delete a folder and everything in it
```

`rm` has no undo. There is no trash can. Before any `rm`, I run `ls` first and read what I am about to remove. That one habit has saved me more than once.

> Checkpoint: `ls` inside `blog-platform` shows `notes.txt` and `server.js`, and `cat notes.txt` prints your two lines.

## Part 3 of 6: Shortcuts that give you hours back

Typing less is the real skill. Learn these five and you will feel fast within a day.

- **Tab** completes names. Type `cd blog` then press Tab. Press it twice to see all matches.
- **Up arrow** brings back your previous command. Keep pressing to go further back.
- **Ctrl + C** stops a running program. Your server will not stop any other way.
- **Ctrl + L** or `clear` wipes the screen so you can think.
- **`code .`** opens the current folder in VS Code.

Why does Ctrl + C matter so much? Servers run forever on purpose. When you start Express in [the Express post](../07-node-http-and-express/) the terminal will look frozen. It is not frozen, it is working. Ctrl + C is how you tell it you are done.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Search without opening files*.

## Part 4 of 6: Search without opening files

You will often ask "where did I write that function?" The terminal answers fast.

```bash
grep "TODO" notes.txt          # lines containing TODO in one file
grep -rn "app.get" .           # search the whole folder, show line numbers
ls | wc -l                     # count items: the | passes output along
history | grep git             # find that git command you typed last week
```

The `|` symbol is called a pipe. It takes the output of the left command and feeds it into the right one. `ls | wc -l` means "list the files, then count the lines". Small tools snapped together. That is the entire Unix idea, and you now use it.

## Part 5 of 6: Ports, processes, and the error you will meet in week one

Soon you will run a server on port 3000. One day you will see this:

```
Error: listen EADDRINUSE: address already in use :::3000
```

It means an old copy of your server is still running and holding that port. Find it and stop it:

```bash
# Mac or Linux
lsof -i :3000          # shows the process using port 3000, note the PID
kill <PID>             # stop it, use the number from above

# Windows (cmd or PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Most of the time the real fix is simpler: you have the old server running in another terminal tab. Look there first and press Ctrl + C.

## Part 6 of 6: Why "command not found" happens

Your computer looks for programs in a list of folders called **PATH**. If a tool is not in one of them, you get `command not found`.

```bash
echo $PATH        # the folders your terminal searches (Git Bash and Mac)
node -v           # works only if node is on PATH
```

Nine times out of ten the fix is: install the tool, then **close and reopen the terminal** so it reloads PATH. Remember that when Git or Node "does not work" right after you installed it.

## Patterns I follow every day

- **Read before you delete.** `ls` first, then `rm`. Always.
- **One command at a time.** Run it, read the output, then continue. Chained mystery commands hide errors.
- **Never paste a command you do not understand,** especially anything with `sudo` or `rm -rf`. Ask what each part does first.
- **Tab, not typing.** If you type a full folder name by hand, you are doing it the slow way.
- **Keep the terminal next to the editor.** Two panes, same folder, always visible.

## Solo rep: Build a folder tree blind

> **Level 1: Copy-type.** Type every line yourself while looking at the code. No copy paste. The goal is your fingers learning the shapes. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

Without looking at the post, build this from the terminal by typing every command yourself: `notes/week1/day1.txt`, `notes/week1/day2.txt`, `notes/README.md`. Delete `day2.txt`, then show the whole tree with one command.

<details>
<summary>Check yourself, only after you try</summary>

```bash
mkdir -p notes/week1
touch notes/week1/day1.txt notes/week1/day2.txt notes/README.md
rm notes/week1/day2.txt
ls -R notes
```

</details>

## Projects

### 1. Scaffold the blog project in one paste

Create this structure using only terminal commands, in under a minute:

```
blog-platform/
  server.js
  .env
  src/
    routes/
    models/
  README.md
```

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```bash
mkdir -p blog-platform/src/routes blog-platform/src/models
cd blog-platform
touch server.js .env README.md
echo "# Blog Platform" > README.md
ls -a
```

Why `-p`: it creates parent folders as needed, so one line builds the whole tree. Why `ls -a`: dotfiles like `.env` are hidden by default, `-a` shows them.

Common mistake: creating the folders on the Desktop root instead of inside `blog-platform`. Run `pwd` after every `cd`.

</details>

### 2. Be a detective

Put three lines containing the word `TODO` into different files inside `src`. Then find all of them, with file names and line numbers, using one command.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```bash
echo "// TODO: add posts route" > src/routes/posts.js
echo "// TODO: add user model" > src/models/user.js
echo "// TODO: write readme" >> README.md
grep -rn "TODO" .
```

Why `-rn`: `r` searches inside every folder below, `n` prints the line number. You will use this exact command in real projects to find leftovers before shipping.

Common mistake: forgetting the `.` at the end. Without it, `grep` waits for input and looks frozen. Press Ctrl + C and add the dot.

</details>

### 3. Free a stuck port on purpose

Start any program that holds port 3000 (Node installs in [the JavaScript runtime post](../05-js-language-and-runtime/), so use `python3 -m http.server 3000` if Python is installed). Open a second terminal, find the process using port 3000, and stop it without touching the first terminal.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```bash
lsof -i :3000
kill <PID>
```

On Windows use `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`.

Why practice this now: the first time you see `EADDRINUSE` should be a drill, not a deadline.

Common mistake: running `kill` on the wrong number. Read the `COMMAND` column in the `lsof` output before you kill anything.

</details>

## Cheat sheet

```bash
pwd                   # where am I
ls -a                 # what is here, including hidden files
cd <folder>           # go in; cd .. up; cd ~ home; cd - back
mkdir -p a/b          # make folders (and parents)
touch file            # make an empty file
cat file              # print a file
cp a b / mv a b       # copy / move or rename
rm file / rm -r dir   # delete, no undo
grep -rn "text" .     # search every file below here
Ctrl + C              # stop whatever is running
```

## If lost / If bored

- If lost: `command not found` means the tool is not installed or the terminal needs a restart. `No such file or directory` means you are in the wrong folder, run `pwd` and `ls`.
- If bored: jump to Project 2 and play with `grep` and pipes, it is the most useful trick here.
- Keep for next: the `blog-platform` folder you just made. [The Git post](../02-git-setup-for-this-series/) puts it under version control.

## What breaks next

You can move around your machine now, but one wrong `rm` has no undo. Something has to protect your work.

[Where we are and what is next](../progress/)
