---
title: "Git and GitHub: The Guide That Actually Makes You Comfortable"
date: 2026-05-30T00:00:00+05:30
draft: false
tags: ["git", "github", "open-source", "tools"]
author: "Eshan"
showToc: true
TocOpen: false
description: "Not another clone-add-commit-push walkthrough. This covers what you actually hit in real work: forking, pull requests, merge conflicts, rebase, stash, upstream setup, and how to recover when things go wrong."
---

<style>
.gt{--o:#f4845f;--b:#79c0ff;--g:#56d364;--r:#ff7b72;--y:#e3b341;--p:#d2a8ff;--bg:#0d1117;--bg2:#161b22;--bd:#30363d;--tx:#c9d1d9;--mu:#6e7681}
.gt .term{background:#010409;border:1px solid #21262d;border-radius:8px;overflow:hidden;margin:18px 0;font-family:'JetBrains Mono',monospace}
.gt .term .bar{background:#161b22;padding:8px 14px;display:flex;align-items:center;gap:7px;border-bottom:1px solid #21262d}
.gt .term .lbl{font-size:11px;color:#6e7681;margin-left:auto}
.gt .d1{width:11px;height:11px;border-radius:50%;background:#ff5f57}
.gt .d2{width:11px;height:11px;border-radius:50%;background:#febc2e}
.gt .d3{width:11px;height:11px;border-radius:50%;background:#28c840}
.gt .term .body{padding:13px 18px;font-size:13px;line-height:1.9;color:#c9d1d9;overflow-x:auto}
.gt .p{color:#56d364}.gt .cm{color:#3d444d}.gt .b{color:#79c0ff}.gt .y{color:#e3b341}.gt .r{color:#ff7b72}.gt .o{color:#f4845f}.gt .pu{color:#d2a8ff}
.gt .warn{background:#1a0e0a;border:1px solid #3a1a10;border-left:3px solid #f4845f;border-radius:4px;padding:11px 16px;margin:16px 0;font-size:.91rem;color:#b87060}
.gt .warn strong{color:#f4845f}
.gt .tip{background:#0d1320;border:1px solid #1a2a3a;border-left:3px solid #79c0ff;border-radius:4px;padding:11px 16px;margin:16px 0;font-size:.91rem;color:#6a9ab8}
.gt .tip strong{color:#79c0ff}
.gt table{width:100%;border-collapse:collapse;margin:16px 0;font-size:.87rem}
.gt th{font-family:'JetBrains Mono',monospace;font-size:.67rem;letter-spacing:.08em;text-transform:uppercase;color:#6e7681;text-align:left;padding:7px 12px;border-bottom:1px solid #21262d}
.gt td{padding:8px 12px;border-bottom:1px solid #161b22;vertical-align:top;color:#8b949e}
.gt tr:hover td{background:#161b22}
.gt td:first-child{font-family:'JetBrains Mono',monospace;font-size:.82rem;color:#f4845f;white-space:nowrap}
.gt .dia{border:1px solid #21262d;border-radius:8px;overflow:hidden;margin:20px 0;background:#0d1117}
.gt .dia .dh{background:#161b22;padding:8px 14px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#6e7681;border-bottom:1px solid #21262d}
.gt .dia .dh::before{content:'◈  ';color:#f4845f}
.gt .dia .db{padding:20px;overflow-x:auto}
.gt .flow{display:flex;align-items:center;gap:0;flex-wrap:wrap;font-family:'JetBrains Mono',monospace;font-size:12px}
.gt .fbox{border:1px solid #30363d;border-radius:5px;padding:10px 8px;background:#161b22;line-height:1.6;min-width:110px}
.gt .farr{padding:0 10px;color:#444c56;display:flex;flex-direction:column;align-items:center}
.gt .farr .ar{font-size:16px;line-height:1}
.gt .farr .cmd{font-size:9px;color:#6e7681;font-family:'JetBrains Mono',monospace}
.gt .diff{background:#0d1117;border:1px solid #21262d;border-radius:6px;overflow:hidden;margin:16px 0;font-family:'JetBrains Mono',monospace;font-size:12.5px}
.gt .diff .dbar{background:#161b22;padding:6px 14px;font-size:11px;color:#6e7681;border-bottom:1px solid #21262d}
.gt .dl{padding:1px 14px;line-height:1.85;white-space:pre}
.gt .da{background:#0d2118;color:#56d364}.gt .dd{background:#1a0a0a;color:#ff7b72}.gt .dm{color:#6e7681}.gt .dc{color:#8b949e}
.gt .ex{background:#0d1a14;border:1px solid #1a3a26;border-left:3px solid #56d364;border-radius:6px;padding:16px 20px;margin:22px 0}
.gt .ex .xl{font-family:'JetBrains Mono',monospace;font-size:.67rem;letter-spacing:.13em;text-transform:uppercase;color:#56d364;margin-bottom:10px}
.gt .ex p,.gt .ex li{color:#7dcca0;font-size:.92rem}
.gt .ex strong{color:#56d364}
.gt .ex ol,.gt .ex ul{padding-left:16px;margin:8px 0}.gt .ex li{margin-bottom:4px}
.gt .ex code{background:#0d2218;color:#56d364;border:1px solid #1a3a26;padding:1px 6px;border-radius:3px;font-size:.83em}
.gt .ck{background:#111118;border:1px solid #22223a;border-left:3px solid #d2a8ff;border-radius:6px;padding:14px 18px;margin:22px 0}
.gt .ck .cl{font-family:'JetBrains Mono',monospace;font-size:.67rem;letter-spacing:.13em;text-transform:uppercase;color:#d2a8ff;margin-bottom:10px}
.gt .ck ul{list-style:none;padding:0;margin:0}
.gt .ck li{display:flex;align-items:flex-start;gap:9px;font-size:.89rem;color:#8b7ec8;margin-bottom:5px;cursor:pointer}
.gt .cb{width:14px;height:14px;border:1px solid #444;border-radius:2px;flex-shrink:0;margin-top:3px;background:#1a1a2a;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:transparent;transition:all .15s}
.gt .cb.on{background:#d2a8ff;border-color:#d2a8ff;color:#0d1117}
.gt .sc{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0}
@media(max-width:580px){.gt .sc{grid-template-columns:1fr}}
.gt .sc .card{background:#0d1117;border:1px solid #21262d;border-radius:6px;padding:13px}
.gt .sc .card h4{font-family:'JetBrains Mono',monospace;font-size:.66rem;letter-spacing:.09em;text-transform:uppercase;color:#f4845f;margin:0 0 9px}
.gt .si{display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #161b22;font-family:'JetBrains Mono',monospace;font-size:11px}
.gt .si:last-child{border:none}
.gt .si .k{color:#f4845f}.gt .si .v{color:#6e7681;font-size:10.5px;text-align:right;max-width:58%}
.gt .bvis{font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:2.1;color:#c9d1d9;padding:4px 0}
.gt .bvis .gn{color:#56d364}.gt .bvis .bn{color:#79c0ff}.gt .bvis .sh{color:#e3b341}.gt .bvis .pt{color:#f4845f}.gt .bvis .mu{color:#6e7681}
.gt .prac{background:#0f0f1a;border:1px solid #2a2a4a;border-left:3px solid #e3b341;border-radius:6px;padding:16px 20px;margin:22px 0}
.gt .prac .pl{font-family:'JetBrains Mono',monospace;font-size:.67rem;letter-spacing:.13em;text-transform:uppercase;color:#e3b341;margin-bottom:10px}
.gt .prac p,.gt .prac li{color:#a89060;font-size:.92rem}
.gt .prac strong{color:#e3b341}
.gt .prac ol,.gt .prac ul{padding-left:16px;margin:8px 0}.gt .prac li{margin-bottom:6px}
.gt .prac code{background:#1a1500;color:#e3b341;border:1px solid #3a2a00;padding:1px 6px;border-radius:3px;font-size:.83em}
</style>

<div class="gt">

There is a very specific moment where git stops making sense. You know `add`, `commit`, `push`. Then someone says "just fork the repo, set upstream, rebase your branch onto main and open a PR." You nod. You have no idea what any of that means.

That is what this covers. Not a full git textbook, not a list of every flag. Just the things you will actually hit in real work, explained in a way that makes them click. If you are reading this with zero experience, that is fine. Start from the top and go section by section. Everything builds on what came before.

---

## the mental model (actually important, takes 2 minutes)

Before running a single command, this is the one concept worth getting right.

Git does not track changes the way most people imagine. It does not store a list of edits like "you added line 5 and deleted line 12." Instead, it stores **snapshots**. Every commit is a complete picture of your entire project at that exact moment. This is why switching between commits is instant, why branching costs almost nothing, and why certain undo operations behave the way they do.

Three places your code can live at any point in time:

<div class="dia">
<div class="dh">the three areas every git command works with</div>
<div class="db">
<div class="flow">
<div class="fbox" style="color:#79c0ff;border-color:#1e3a5f"><strong>working directory</strong><br><span style="color:#6e7681;font-size:11px">your actual files<br>on disk right now<br>edit freely here</span></div>
<div class="farr"><span class="ar">→</span><span class="cmd">git add</span></div>
<div class="fbox" style="color:#56d364;border-color:#1a3a1a"><strong>staging area</strong><br><span style="color:#6e7681;font-size:11px">a draft of your<br>next commit<br>pick what goes in</span></div>
<div class="farr"><span class="ar">→</span><span class="cmd">git commit</span></div>
<div class="fbox" style="color:#f4845f;border-color:#3a1a0a"><strong>repository (.git/)</strong><br><span style="color:#6e7681;font-size:11px">permanent history<br>every commit lives<br>here forever</span></div>
</div>
</div>
</div>

#PICTURE : PROMPT -> "A clean dark-themed technical diagram showing three connected boxes in a horizontal flow layout. Background is #0d1117 (very dark navy). The three boxes are: 1) 'Working Directory' in blue (#79c0ff) with subtitle 'your actual files on disk', 2) 'Staging Area' in green (#56d364) with subtitle 'draft of your next commit', 3) 'Repository (.git/)' in orange (#f4845f) with subtitle 'permanent history'. Between boxes 1 and 2 is a right arrow labeled 'git add' and between boxes 2 and 3 is a right arrow labeled 'git commit'. Each box has a subtle border matching its text color. Font is monospace (JetBrains Mono style). The overall aesthetic is minimal, developer-focused, GitHub dark theme inspired. No gradients, no shadows, flat and clean."

Every single git command either moves data between these three areas or reads from them. Once you internalize this, the output of `git status` becomes completely readable without guessing.

---

## setup (do this once before anything else)

Before you can use git, it needs to know who you are. Every commit you make will be stamped with this name and email, so use something real.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git config --global user.name <span class="b">"Your Name"</span>
<br>
<span class="p">$ </span>git config --global user.email <span class="b">"you@example.com"</span>
<br>
<span class="p">$ </span>git config --global core.editor <span class="b">nano</span>           <span class="cm"># nano is safest for beginners</span>
                                                   <span class="cm"># other options: nvim, "code --wait"</span>
<br>
<span class="p">$ </span>git config --global init.defaultBranch <span class="b">main</span>
<br>
<span class="p">$ </span>git config --global alias.lg <span class="b">"log --oneline --graph --all --decorate"</span>
<br><br>
<span class="cm"># check everything that got set</span>
<br>
<span class="p">$ </span>git config --global --list</div>
</div>

That `alias.lg` line is worth its weight. Instead of a wall of text when you run `git log`, running `git lg` gives you a visual tree of your branches and commits. You will use it constantly once you have it.

A quick note on editors: if you are just starting out, set it to `nano`. If you accidentally end up in `vim` without setting this, type `:q!` and press enter to escape.

<div class="prac">
<div class="pl">practice: verify your setup</div>
<ol>
<li>Run each config command above in your terminal, replacing the name and email with your own.</li>
<li>Run <code>git config --global --list</code> and confirm your name, email, and editor appear in the output.</li>
<li>Create a test folder anywhere: <code>mkdir git-practice && cd git-practice</code></li>
<li>Run <code>git init</code> and then <code>git lg</code> -- you will see an empty result, which is fine. The alias is working.</li>
</ol>
</div>

---

## starting a repo

Two situations: starting fresh, or working with an existing project.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<span class="cm"># --- starting a brand new project ---</span>
<br>
<span class="p">$ </span>mkdir my-project && cd my-project
<br>
<span class="p">$ </span>git init
<br>
<span class="cm"># this creates a hidden .git/ folder inside your project</span>
<span class="cm"># that folder is git. it contains your entire history.</span>
<span class="cm"># delete .git/ and all git tracking vanishes. your files stay.</span>
<br><br>
<span class="cm"># --- getting someone else's project ---</span>
<br>
<span class="p">$ </span>git clone https://github.com/username/repo.git
<br>
<span class="p">$ </span>git clone https://github.com/username/repo.git my-folder-name   <span class="cm"># custom folder name</span></div>
</div>

When you clone, git automatically saves the source URL under the nickname `origin`. That is all a "remote" is: a saved URL with a name you can refer to later. We will come back to remotes in detail.

<div class="prac">
<div class="pl">practice: init your first repo</div>
<ol>
<li>Create a new folder called <code>hello-git</code> and navigate into it.</li>
<li>Run <code>git init</code>.</li>
<li>Run <code>ls -la</code> (on Mac/Linux) or <code>dir /a</code> (on Windows) and confirm you see a <code>.git</code> folder.</li>
<li>Create a file: <code>echo "hello world" > readme.txt</code></li>
<li>Run <code>git status</code> and read the output carefully. You should see <code>readme.txt</code> listed as an untracked file.</li>
</ol>
</div>

---

## the daily cycle

This is what you will do every single time you work on a project. Get comfortable with this loop before moving on.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git status                  <span class="cm"># always start here. always.</span>
<br>
<span class="p">$ </span>git add index.html          <span class="cm"># stage one specific file</span>
<br>
<span class="p">$ </span>git add src/                <span class="cm"># stage everything in a folder</span>
<br>
<span class="p">$ </span>git add .                   <span class="cm"># stage every changed file from here down</span>
<br>
<span class="p">$ </span>git add -p                  <span class="cm"># stage piece by piece, hunk by hunk (powerful)</span>
<br>
<span class="p">$ </span>git commit -m <span class="b">"add login page"</span>
<br>
<span class="p">$ </span>git push</div>
</div>

`git add -p` is worth learning even as a beginner, even though most tutorials skip it. It walks you through each changed section of each file and asks what to do with it. The options are:

- `y` to stage this chunk
- `n` to skip it
- `s` to split it into smaller pieces
- `q` to quit

This matters when you have changed two unrelated things in the same file and want to put them in separate commits. Commits should be focused and logical, not just "everything I changed today."

**Writing good commit messages.** A helpful rule: your commit message should complete this sentence: "If applied, this commit will \_\_\_". Keep the first line under 72 characters. Many open source projects use a prefix format like `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`. It is not required everywhere but it is a good habit that makes history readable.

Good: `fix: prevent crash when user email is empty`
Bad: `stuff` or `fix` or `asdfgh`

### reading git status output

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git status
<br><br>
<span class="y">Changes to be committed:</span>         <span class="cm"># staged. will go into your next commit.</span>
<br>
        <span class="b">new file:   login.html</span>
<br><br>
<span class="y">Changes not staged for commit:</span>  <span class="cm"># modified but not yet staged.</span>
<br>
<span class="r">        modified: index.html</span>
<br><br>
<span class="y">Untracked files:</span>                <span class="cm"># git sees these files but is not tracking them.</span>
<br>
<span class="r">        notes.txt</span></div>
</div>

One thing that trips people up: the same file can appear in both "to be committed" and "not staged" at once. This happens when you stage a file, then edit it again. Staging takes a snapshot of the file at that exact moment. The newer edit is sitting in your working directory as a separate version that has not been staged yet. Run `git add` on it again to capture the latest version.

### looking at history and differences

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git log --oneline           <span class="cm"># compact commit list</span>
<br>
<span class="p">$ </span>git lg                      <span class="cm"># your alias: visual branch tree (use this)</span>
<br>
<span class="p">$ </span>git diff                    <span class="cm"># what changed but is NOT staged yet</span>
<br>
<span class="p">$ </span>git diff --staged           <span class="cm"># what IS staged (what will go into the next commit)</span>
<br>
<span class="p">$ </span>git diff HEAD~1 HEAD        <span class="cm"># compare the last two commits</span>
<br>
<span class="p">$ </span>git show HEAD               <span class="cm"># full diff of the latest commit</span>
<br>
<span class="p">$ </span>git show abc1234:style.css  <span class="cm"># see a file exactly as it was at any commit</span>
<br>
<span class="p">$ </span>git log -S <span class="b">"functionName"</span>   <span class="cm"># find when a specific string appeared or disappeared</span></div>
</div>

`HEAD` just means "wherever you are right now." Think of it as a bookmark. `HEAD~1` is one commit behind your current position, `HEAD~3` is three back. The tilde means "go back this many commits."

`git log -S` is called the pickaxe search and most people never discover it. It searches your entire project history for commits that added or removed a specific string. When something breaks and you have no idea which commit caused it, this is often the fastest way to find out.

<div class="prac">
<div class="pl">practice: the daily cycle</div>
<ol>
<li>Inside your <code>hello-git</code> folder, create two files: <code>index.html</code> and <code>style.css</code>.</li>
<li>Run <code>git status</code> and confirm both show as untracked.</li>
<li>Stage only <code>index.html</code> with <code>git add index.html</code>.</li>
<li>Run <code>git status</code> again. Notice that <code>index.html</code> is staged and <code>style.css</code> is still untracked. Two different states in the same status output.</li>
<li>Commit with a good message: <code>git commit -m "feat: add initial html structure"</code></li>
<li>Now stage and commit <code>style.css</code> separately.</li>
<li>Run <code>git lg</code> and see your two commits in the tree.</li>
</ol>
</div>

---

## .gitignore

Some files should never go into your git history. Dependencies (like `node_modules/`) are huge and can be reinstalled. Build output can be regenerated. And API keys should never, ever be committed.

The `.gitignore` file tells git which files and folders to completely ignore.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div><span class="lbl">.gitignore</span></div>
<div class="body">
<span class="cm"># dependencies (these get installed, not committed)</span>
<br>
<span class="b">node_modules/</span>
<br>
<span class="b">.venv/</span>
<br>
<span class="b">__pycache__/</span>
<br><br>
<span class="cm"># build output (generated automatically)</span>
<br>
<span class="b">dist/</span>
<br>
<span class="b">build/</span>
<br>
<span class="b">*.pyc</span>
<br><br>
<span class="cm"># secrets. NEVER commit these.</span>
<br>
<span class="b">.env</span>
<br>
<span class="b">.env.local</span>
<br>
<span class="b">.env.*.local</span>
<br><br>
<span class="cm"># OS and editor clutter</span>
<br>
<span class="b">.DS_Store</span>
<br>
<span class="b">*.swp</span>
<br>
<span class="b">*.log</span></div>
</div>

<div class="warn"><strong>about .env files:</strong> bots scan GitHub constantly looking for API keys and database passwords. if you commit a .env file with real credentials to a public repo, rotate those keys immediately. even if you delete the file one minute later, the keys are already in your history and already being scraped. the right approach is to commit a <code>.env.example</code> file with fake placeholder values so teammates know what variables the project needs, but never the real values.</div>

There is one important rule about .gitignore: it only works on files that are not yet tracked by git. If a file was already committed once, adding it to .gitignore does nothing. You need to explicitly tell git to stop tracking it:

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git rm --cached .env              <span class="cm"># stop tracking this file, but keep it on disk</span>
<br>
<span class="p">$ </span>git rm -r --cached node_modules/  <span class="cm"># same thing for a whole directory</span>
<br>
<span class="cm"># after running these, add the file to .gitignore and then commit</span></div>
</div>

The `--cached` flag is the key part. Without it, `git rm` deletes the file from your disk too. With it, git removes the file from tracking but leaves your actual file alone.

<div class="tip"><strong>// quick tip:</strong> GitHub maintains a large collection of ready-made .gitignore templates for every language and framework at <code>github.com/github/gitignore</code>. When starting a new project, grab the right template from there instead of writing one from scratch.</div>

---

## branches

A branch is just a pointer to a commit. Nothing more. When you create a branch, git creates a new pointer. When you commit on that branch, the pointer moves forward to your new commit. No files are duplicated. No folders are copied. Branching is fast because it is literally just creating a small file that contains a commit hash.

<div class="dia">
<div class="dh">what branches look like in git's history</div>
<div class="db">
<div class="bvis">
<span class="mu">A --- B --- C</span>  <span class="gn">← main</span>
<span class="mu">              \</span>
<span class="mu">               D --- E</span>  <span class="bn">← feature/login</span>  <span class="pt">← HEAD</span>
</div>
</div>
</div>

#PICTURE : PROMPT -> "A clean dark-themed git branch diagram. Background is #0d1117. Shows a horizontal line of circles (commits) labeled A, B, C in muted gray (#6e7681) connected by lines. At commit C, a branch splits diagonally down-right showing commits D and E in blue (#79c0ff). The label 'main' in green (#56d364) points to commit C with an arrow. The label 'feature/login' in blue (#79c0ff) points to commit E. A small orange (#f4845f) 'HEAD' label with an arrow also points to commit E, indicating current position. All text is monospace font. Minimal flat design, no shadows, dark GitHub aesthetic. The branch split is clearly illustrated as a fork in the line."

`HEAD` is a pointer to whatever branch you are currently on. When you make a commit, your current branch moves forward. When you switch branches, HEAD just points somewhere else.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git branch                         <span class="cm"># list all local branches</span>
<br>
<span class="p">$ </span>git branch -a                      <span class="cm"># list local AND remote branches</span>
<br>
<span class="p">$ </span>git switch -c feature/login        <span class="cm"># create a new branch and switch to it</span>
<br>
<span class="p">$ </span>git switch main                    <span class="cm"># switch to an existing branch</span>
<br>
<span class="p">$ </span>git branch -d feature/login        <span class="cm"># delete a branch (only after merging)</span>
<br>
<span class="p">$ </span>git branch -D feature/login        <span class="cm"># force delete even if not merged</span>
<br>
<span class="p">$ </span>git branch -vv                     <span class="cm"># see branches with tracking info and ahead/behind status</span></div>
</div>

`git switch` is the modern command for changing branches. Older tutorials use `git checkout` for this and it works fine, but `checkout` does way too many different things depending on what arguments you pass it. `switch` is clearer and was introduced specifically to replace that part of `checkout`.

**When to branch: always.** For every feature, every bug fix, every experiment. Main should only ever hold working, stable code. All actual development happens on branches. This is not just team etiquette. It protects your own work from yourself. You can experiment freely on a branch, and if it goes wrong you just delete it.

A good naming convention for branches:

- `feature/user-authentication`
- `fix/crash-on-empty-form`
- `docs/update-readme`
- `chore/upgrade-dependencies`

<div class="prac">
<div class="pl">practice: creating and switching branches</div>
<ol>
<li>Inside your practice repo, create a new branch: <code>git switch -c feature/about-page</code></li>
<li>Run <code>git branch</code> and confirm you are now on the new branch (it will have a * next to it).</li>
<li>Create a file called <code>about.html</code> and add some text to it.</li>
<li>Stage and commit it: <code>git add about.html && git commit -m "feat: add about page"</code></li>
<li>Switch back to main: <code>git switch main</code></li>
<li>Run <code>ls</code> (or <code>dir</code> on Windows). Notice that <code>about.html</code> is gone from your folder. It exists on the feature branch, not on main. This is how branches work.</li>
<li>Run <code>git lg</code> and see the branch structure visually.</li>
</ol>
</div>

---

## merging and merge conflicts

When your feature branch is ready, you bring it back into main:

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<span class="cm"># first, switch to the branch you want to merge INTO</span>
<br>
<span class="p">$ </span>git switch main
<br>
<span class="p">$ </span>git merge feature/login</div>
</div>

There are two possible outcomes when merging:

**Fast-forward merge:** If main has not had any new commits since you branched off it, git simply slides the main pointer forward to your branch's tip. Clean, simple, no extra commit created.

**Merge commit:** If main has new commits that your branch does not have, git creates a new "merge commit" that has two parents, one from each branch. This commit records where the two lines of work came back together. It looks slightly messier in history but it is totally normal and fine.

### when conflicts happen

A conflict happens when both branches changed the same lines of the same file in different ways. Git cannot decide which version to keep, so it stops and asks you to decide.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git merge feature/login
<br><br>
<span class="r">CONFLICT (content): Merge conflict in index.html</span>
<br>
<span class="r">Automatic merge failed; fix conflicts and then commit the result.</span></div>
</div>

Open the file in your editor and you will see markers that git inserted:

<div class="diff">
<div class="dbar">index.html with conflict markers</div>
<div class="dl" style="color:#56d364">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</div>
<div class="dl da">  &lt;title&gt;Portfolio&lt;/title&gt;</div>
<div class="dl dm">=======</div>
<div class="dl dd">  &lt;title&gt;My Portfolio by Eshan&lt;/title&gt;</div>
<div class="dl" style="color:#79c0ff">&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/login</div>
</div>

Reading this:

- Everything between `<<<<<<< HEAD` and `=======` is your current branch's version
- Everything between `=======` and `>>>>>>>` is what is coming in from the branch you are merging

You decide what the final result should look like. Maybe you want one version, maybe the other, maybe a combination. Edit the file to exactly what you want, then delete all the conflict markers (the `<<<<<<<`, `=======`, and `>>>>>>>` lines). Save the file, then:

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git add index.html     <span class="cm"># tell git the conflict in this file is resolved</span>
<br>
<span class="p">$ </span>git commit             <span class="cm"># git will pre-fill a merge commit message for you</span>
<br><br>
<span class="cm"># changed your mind and want to abandon the whole merge:</span>
<br>
<span class="p">$ </span>git merge --abort      <span class="cm"># resets everything back to before you ran merge</span></div>
</div>

<div class="tip"><strong>// conflict tools:</strong> VS Code highlights conflict markers and shows clickable buttons labeled "Accept Current Change", "Accept Incoming Change", and "Accept Both Changes". For complex conflicts with many files, this is much easier than editing raw markers by hand. Most editors have similar features built in or available as extensions.</div>

<div class="prac">
<div class="pl">practice: creating and resolving a conflict</div>
<ol>
<li>On main, edit <code>readme.txt</code> to say "version from main" and commit it.</li>
<li>Create a new branch: <code>git switch -c conflict-test</code></li>
<li>Edit the same <code>readme.txt</code> to say "version from branch" and commit it.</li>
<li>Switch back to main: <code>git switch main</code></li>
<li>Run <code>git merge conflict-test</code>. You will get a conflict.</li>
<li>Open the file, read the markers, decide what to keep, remove all markers.</li>
<li>Stage the file and commit. Conflict resolved.</li>
</ol>
</div>

---

## remotes: origin, upstream, and what they actually are

This section trips people up more than almost anything else in git. Read it carefully.

A **remote** is nothing more than a saved URL with a nickname. That is the entire concept. When you clone a repo, git saves the source URL under the name `origin` automatically. You can add more remotes, rename them, or remove them whenever you want. There is nothing magical about the names "origin" or "upstream," they are just the conventions people follow.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<span class="cm"># see your current remotes</span>
<br>
<span class="p">$ </span>git remote -v
<br><br>
<span class="y">origin  git@github.com:you/repo.git (fetch)</span>
<br>
<span class="y">origin  git@github.com:you/repo.git (push)</span>
<br><br>
<span class="cm"># add a new remote with a name</span>
<br>
<span class="p">$ </span>git remote add upstream git@github.com:original/repo.git
<br><br>
<span class="cm"># remove a remote</span>
<br>
<span class="p">$ </span>git remote remove upstream
<br><br>
<span class="cm"># change the URL of an existing remote</span>
<br>
<span class="p">$ </span>git remote set-url origin git@github.com:you/new-repo.git</div>
</div>

Now the four commands that move code between local and remote:

**`git push`** sends your local commits up to the remote. Nothing on the remote changes until you push.

**`git fetch`** downloads new commits from the remote but does NOT touch any of your local branches. You are just downloading information. Safe to run anytime.

**`git pull`** is fetch plus merge in one step. Downloads new commits and immediately merges them into your current branch.

**`git pull --rebase`** is fetch plus rebase. Downloads new commits and replays your local commits on top of them. Usually produces cleaner history than a regular pull.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<span class="cm"># pushing</span>
<br>
<span class="p">$ </span>git push origin main
<br>
<span class="p">$ </span>git push origin feature/login
<br>
<span class="p">$ </span>git push -u origin feature/login  <span class="cm"># -u sets up tracking between local and remote branch</span>
                                    <span class="cm"># after this, plain "git push" works without arguments</span>
<br>
<span class="p">$ </span>git push --delete origin old-branch   <span class="cm"># delete a remote branch</span>
<br><br>
<span class="cm"># fetching and pulling</span>
<br>
<span class="p">$ </span>git fetch origin              <span class="cm"># download from origin, touch nothing local</span>
<br>
<span class="p">$ </span>git fetch --all               <span class="cm"># download from every remote you have</span>
<br>
<span class="p">$ </span>git pull                      <span class="cm"># fetch + merge</span>
<br>
<span class="p">$ </span>git pull --rebase             <span class="cm"># fetch + rebase (cleaner, prefer this)</span></div>
</div>

The `-u` flag on `git push` sets up **tracking**. It links your local branch to the corresponding remote branch so git knows the relationship. You only need to do this once per branch. After that, `git push` and `git pull` with no arguments will know where to go.

---

## SSH setup (stop typing passwords forever)

HTTPS authentication works, but every push requires typing your username and password or a personal access token. SSH keys fix this permanently. You generate a key pair, give GitHub your public key, and everything authenticates silently from then on.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<span class="cm"># step 1: generate your key pair (ed25519 is the current recommended type)</span>
<br>
<span class="p">$ </span>ssh-keygen -t ed25519 -C <span class="b">"you@example.com"</span>
<br>
<span class="cm"># press enter to accept the default save location (~/.ssh/id_ed25519)</span>
<span class="cm"># optionally add a passphrase for extra security, or just press enter for none</span>
<br><br>
<span class="cm"># step 2: print your PUBLIC key and copy the entire output</span>
<br>
<span class="p">$ </span>cat ~/.ssh/id_ed25519.pub
<br><br>
<span class="cm"># step 3: go to GitHub in your browser</span>
<span class="cm"># Settings → SSH and GPG Keys → New SSH Key → paste → Save</span>
<br><br>
<span class="cm"># step 4: test that it works</span>
<br>
<span class="p">$ </span>ssh -T git@github.com
<br><br>
<span class="b">Hi username! You've successfully authenticated...</span>
<br><br>
<span class="cm"># step 5: if an existing repo uses HTTPS, switch it to SSH</span>
<br>
<span class="p">$ </span>git remote set-url origin git@github.com:username/repo.git</div>
</div>

The key pair works like a lock and key. Your private key (`id_ed25519`, no `.pub`) stays on your machine and you never share it with anyone. The public key (`id_ed25519.pub`) is what you paste into GitHub. When you connect, GitHub uses the public key to verify that you have the matching private key, without you ever sending the private key over the network.

After this is set up, always clone using SSH URLs (`git@github.com:user/repo.git`) instead of HTTPS URLs.

---

## forking and contributing to open source

This is the workflow that most beginners want to learn but find confusing. It will make complete sense by the end of this section.

When you want to contribute to a project you do not own, you cannot push directly to it. You need to **fork** it first. Forking creates a full copy of the repo under your own GitHub account. You have complete push access to your fork. You make your changes there, then open a **pull request** asking the original project to pull your changes in.

By convention:

- The original repo that you do not own is called **upstream**
- Your fork on GitHub is called **origin**

#PICTURE : PROMPT -> "A dark-themed diagram showing the GitHub fork and pull request workflow. Background #0d1117. Three boxes arranged in a triangle: Top center box labeled 'upstream repo (original owner)' in orange (#f4845f). Bottom left box labeled 'origin (your fork on GitHub)' in blue (#79c0ff). Bottom right box labeled 'local machine' in green (#56d364). Arrows between them: 1) Arrow from upstream to origin labeled 'fork' in gray. 2) Arrow from origin to local labeled 'git clone' in gray. 3) Arrow from local to origin labeled 'git push' in blue. 4) Arrow from origin to upstream labeled 'Pull Request' in purple (#d2a8ff). 5) Arrow from upstream to local labeled 'git fetch upstream' in orange. All text is monospace JetBrains Mono style. Clean, minimal, flat design. GitHub dark theme aesthetic."

<div class="ex">
<div class="xl">the complete contribution flow, step by step</div>
<ol>
<li>Go to the repo on GitHub. Click <strong>Fork</strong> in the top right. GitHub creates <code>your-username/repo</code> under your account.</li>
<li>Clone your fork to your machine:
<code>git clone git@github.com:your-username/repo.git && cd repo</code></li>
<li>Add the original repo as a second remote named upstream:
<code>git remote add upstream git@github.com:original-owner/repo.git</code></li>
<li>Verify both remotes exist:
<code>git remote -v</code> should show both origin and upstream entries.</li>
<li>Create a branch for your specific change:
<code>git switch -c fix/typo-in-readme</code></li>
<li>Make your changes, stage them, commit with a clear message.</li>
<li>Push your branch to your fork:
<code>git push -u origin fix/typo-in-readme</code></li>
<li>Go to GitHub. You will see a yellow banner asking if you want to open a pull request from your recently pushed branch. Click it.</li>
<li>Write a description explaining what you changed and why, then submit the PR.</li>
</ol>
</div>

### keeping your fork up to date

After you fork a project, the original keeps getting new commits from other contributors. Before starting any new work, sync your local main with upstream first so you are not working from outdated code:

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git switch main
<br>
<span class="p">$ </span>git fetch upstream
<br>
<span class="p">$ </span>git merge upstream/main        <span class="cm"># bring upstream changes into your local main</span>
<br>
<span class="p">$ </span>git push origin main           <span class="cm"># update your fork on GitHub too</span></div>
</div>

Then branch off that updated main for your new work. Make syncing with upstream a habit every time you sit down to work on an open source project.

### pull requests in more detail

A pull request is a proposal to merge your branch into someone else's branch. When you open one on GitHub, the PR page shows all your commits, the full diff of every file you changed, and a discussion thread.

Reviewers can leave comments on specific lines of code. You push new commits to the same branch and they appear in the PR automatically. No need to close and reopen anything. When a reviewer approves, someone with merge access clicks the merge button.

<div class="tip"><strong>// PR tips:</strong> keep them focused. one PR should do one thing. a PR that adds a feature, refactors three files, fixes an unrelated bug, and updates the README will sit in review for a long time because it is hard to review. smaller, focused PRs get merged faster. also, always check if the project has a <code>CONTRIBUTING.md</code> file before writing a single line of code. it tells you exactly how they want contributions structured, what tests to run, and what to put in your PR description.</div>

<div class="prac">
<div class="pl">practice: the fork workflow</div>
<ol>
<li>Go to <code>github.com/firstcontributions/first-contributions</code>. This repo exists specifically for practicing the fork workflow with no risk.</li>
<li>Fork it to your account.</li>
<li>Clone your fork to your machine.</li>
<li>Add the original as upstream.</li>
<li>Create a branch, add your name to the contributors list as the README instructs.</li>
<li>Push and open a pull request. Real maintainers will merge it.</li>
</ol>
</div>

---

## rebase

Rebase is the concept that confuses the most people, but it is actually straightforward once you see what it is doing.

Rebase takes your commits and replays them one by one on top of a different starting point. The most common use case is updating a feature branch that has fallen behind main.

<div class="dia">
<div class="dh">before rebase: feature started from B, but main has moved on to D</div>
<div class="db">
<div class="bvis">
<span class="mu">A --- B --- C --- D  </span><span class="gn">← main</span>
<span class="mu">          \</span>
<span class="mu">           E --- F  </span><span class="bn">← feature  </span><span class="pt">← HEAD</span>
</div>
</div>
</div>

<div class="dia">
<div class="dh">after: git rebase main (run from the feature branch)</div>
<div class="db">
<div class="bvis">
<span class="mu">A --- B --- C --- D  </span><span class="gn">← main</span>
<span class="mu">                  \</span>
<span class="mu">                   E' --- F'  </span><span class="bn">← feature  </span><span class="pt">← HEAD</span>
</div>
</div>
</div>

E' and F' are brand new commit objects with the same changes as E and F, but now applied on top of D instead of B. The history looks as if you had started your branch from the latest main all along. Linear and clean.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git switch feature/my-thing
<br>
<span class="p">$ </span>git fetch upstream
<br>
<span class="p">$ </span>git rebase upstream/main
<br><br>
<span class="cm"># if a conflict shows up during rebase:</span>
<span class="cm"># 1. open the file, fix the conflict, delete the markers</span>
<br>
<span class="p">$ </span>git add .
<br>
<span class="p">$ </span>git rebase --continue     <span class="cm"># move on to replaying the next commit</span>
<br><br>
<span class="cm"># if you want to completely cancel and go back to before:</span>
<br>
<span class="p">$ </span>git rebase --abort        <span class="cm"># puts everything back exactly as it was</span>
<br><br>
<span class="cm"># after a successful rebase, the branch history was rewritten</span>
<span class="cm"># so you need to force push (safely)</span>
<br>
<span class="p">$ </span>git push --force-with-lease origin feature/my-thing</div>
</div>

<div class="warn"><strong>about force pushing:</strong> always use <code>--force-with-lease</code> instead of <code>-f</code> or <code>--force</code>. The difference is important. <code>-f</code> overwrites the remote branch blindly no matter what. <code>--force-with-lease</code> checks first whether someone else pushed to the branch since your last fetch, and refuses to proceed if they did. It protects you from overwriting other people's work. Never force push to main or any branch that multiple people are actively working on.</div>

**Rebase vs merge, when to use which:**
Use rebase to update your own feature branches and keep history linear. Use merge when combining shared branches where multiple people have committed, because rewriting shared history breaks everyone else's local references.

### interactive rebase: cleaning up messy commits

You have been working on something for a few days and have seven commits with messages like "wip", "fix", "fix again", "ok this time". Before opening a pull request, clean them up:

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git rebase -i HEAD~4    <span class="cm"># open an editor to edit the last 4 commits</span></div>
</div>

Your editor opens with the commits listed oldest first:

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div><span class="lbl">interactive rebase editor</span></div>
<div class="body">
<br>
<span class="b">pick</span> 3f7a2c1 add login form
<br>
<span class="b">pick</span> 9a1b3e2 fix typo
<br>
<span class="b">pick</span> c4d5e6f add validation
<br>
<span class="b">pick</span> 7f8a9b0 wip
<br><br>
<span class="cm"># change the word "pick" to one of these actions:</span>
<br>
<span class="cm">#   s  or  squash   -- combine into the previous commit, merge both messages</span>
<br>
<span class="cm">#   f  or  fixup    -- combine into the previous commit, discard this message</span>
<br>
<span class="cm">#   r  or  reword   -- keep this commit but edit its message</span>
<br>
<span class="cm">#   d  or  drop     -- delete this commit entirely</span></div>
</div>

Change the last three `pick` words to `f` (fixup), save and close the editor. Four commits become one clean commit with the first message. Then push with `--force-with-lease`.

<div class="prac">
<div class="pl">practice: interactive rebase</div>
<ol>
<li>Create a branch and make four small commits with bad messages like "wip", "test", "asdf", "ok".</li>
<li>Run <code>git lg</code> to see the four commits.</li>
<li>Run <code>git rebase -i HEAD~4</code>.</li>
<li>Change the second, third, and fourth entries from <code>pick</code> to <code>f</code>.</li>
<li>Save and close. Run <code>git lg</code> again. Four commits are now one.</li>
</ol>
</div>

---

## stash

You are in the middle of building something when you need to switch to a different branch to fix a bug. Your current work is not ready to commit. Stash saves your in-progress changes temporarily so you can switch without losing anything.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git stash push -m <span class="b">"half-done login form"</span>   <span class="cm"># save with a descriptive name</span>
<br>
<span class="p">$ </span>git stash                                   <span class="cm"># save with no name (harder to remember)</span>
<br>
<span class="p">$ </span>git stash -u                                <span class="cm"># also stash untracked files</span>
<br><br>
<span class="p">$ </span>git stash list                              <span class="cm"># see everything currently stashed</span>
<br>
<span class="p">$ </span>git stash pop                               <span class="cm"># apply the most recent stash and delete it</span>
<br>
<span class="p">$ </span>git stash apply stash@{2}                  <span class="cm"># apply a specific stash but keep it in the list</span>
<br>
<span class="p">$ </span>git stash drop stash@{0}                   <span class="cm"># delete a specific stash</span>
<br>
<span class="p">$ </span>git stash clear                            <span class="cm"># delete every stash</span></div>
</div>

Stash works like a stack. `stash@{0}` is always the most recently stashed item. `stash@{1}` is the one before that. Always use `-m` to give your stash a name if you plan to have more than one. An unnamed list of five stashes becomes impossible to navigate quickly.

<div class="prac">
<div class="pl">practice: using stash</div>
<ol>
<li>Edit a file in your practice repo without committing.</li>
<li>Run <code>git stash push -m "work in progress"</code>.</li>
<li>Run <code>git status</code>. Your working directory is now clean.</li>
<li>Switch to another branch, do something, switch back.</li>
<li>Run <code>git stash pop</code>. Your changes are back.</li>
</ol>
</div>

---

## undoing things

This is where a lot of people get anxious because mistakes feel permanent. They mostly are not. Here is the full map of undo operations:

<table>
<tr><th>Situation</th><th>Command</th><th>Safe?</th></tr>
<tr><td>unstage a file, keep changes on disk</td><td>git restore --staged &lt;file&gt;</td><td>yes</td></tr>
<tr><td>discard all working directory changes to a file</td><td>git restore &lt;file&gt;</td><td>destructive, no undo</td></tr>
<tr><td>fix the last commit message</td><td>git commit --amend -m "new message"</td><td>local only</td></tr>
<tr><td>add a forgotten file to the last commit</td><td>git add file && git commit --amend --no-edit</td><td>local only</td></tr>
<tr><td>undo last commit, keep changes staged</td><td>git reset --soft HEAD~1</td><td>local only</td></tr>
<tr><td>undo last commit, keep changes unstaged</td><td>git reset HEAD~1</td><td>local only</td></tr>
<tr><td>undo last commit, throw away all changes</td><td>git reset --hard HEAD~1</td><td>destructive</td></tr>
<tr><td>undo a commit already pushed to a shared branch</td><td>git revert abc1234</td><td>yes, always safe</td></tr>
</table>

The key distinction to understand:

**`git reset`** moves the branch pointer backwards, erasing commits from history. Safe only on local commits you have not pushed anywhere. If you reset past a commit that already exists on a shared remote, you will have a very bad time the next time you try to push.

**`git revert`** creates a brand new commit that is the exact inverse of the target commit. History stays intact. It is the always-safe option for undoing anything that has already been pushed to a shared branch.

**`--amend`** replaces the last commit with a new commit object. This changes the commit hash. Do not amend commits that are already on a shared branch, for the same reason as force pushing.

---

## reflog: the real safety net

Here is something most people do not know: git almost never actually deletes anything. Even after `git reset --hard`, your work is still sitting in git's internal object store for about 30 days before garbage collection runs.

Every time HEAD moves (commit, checkout, merge, rebase, reset, anything) git logs it in the reflog. You can always look back and find what you had.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git reflog
<br><br>
<span class="y">abc1234 HEAD@{0}: reset: moving to HEAD~2</span>
<br>
<span class="y">9f3a1ec HEAD@{1}: commit: add login validation</span>
<br>
<span class="y">3b7d2f1 HEAD@{2}: commit: add login form</span>
<br><br>
<span class="cm"># scenario: you ran "git reset --hard HEAD~2" by accident</span>
<span class="cm"># your commits are still visible in the reflog at HEAD@{1} and HEAD@{2}</span>
<span class="cm"># just reset forward to where you were</span>
<br>
<span class="p">$ </span>git reset --hard 9f3a1ec
<br><br>
<span class="cm"># scenario: you deleted a branch and want it back</span>
<br>
<span class="p">$ </span>git reflog | grep feature/deleted-branch
<br>
<span class="p">$ </span>git branch feature/deleted-branch 9f3a1ec   <span class="cm"># recreate it at that commit</span></div>
</div>

When something goes wrong, `git reflog` is the first thing to run before doing anything else. The hash you need is almost always in there. This single command has saved countless hours of work for developers who thought they had destroyed everything.

---

## common situations you will actually hit

### you committed to the wrong branch

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<span class="cm"># you committed to main when you meant to commit to a feature branch</span>
<span class="cm"># undo the commit on main, keep the changes</span>
<br>
<span class="p">$ </span>git reset HEAD~1
<br><br>
<span class="cm"># now create the right branch and commit there</span>
<br>
<span class="p">$ </span>git switch -c feature/thing
<br>
<span class="p">$ </span>git add . && git commit -m <span class="b">"your message"</span>
<br><br>
<span class="cm"># if you already pushed to main and need to undo that push too:</span>
<br>
<span class="p">$ </span>git push origin main --force-with-lease</div>
</div>

### push rejected because the remote has commits you do not have

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="r">error: Updates were rejected because the remote contains work that you do</span>
<br>
<span class="r">not have locally. Integrate the remote changes before pushing again.</span>
<br><br>
<span class="cm"># this means someone else (or you from another machine) pushed something</span>
<span class="cm"># you need to pull their changes first, then push yours</span>
<br>
<span class="p">$ </span>git pull --rebase origin main
<br>
<span class="p">$ </span>git push origin main</div>
</div>

### detached HEAD state

This sounds alarming but it is not a disaster. You land in detached HEAD state when you check out a specific commit hash directly instead of a branch name. HEAD is pointing at a commit instead of at a branch.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git checkout abc1234
<br><br>
<span class="r">You are in 'detached HEAD' state. You can look around, make experimental</span>
<br>
<span class="r">changes and commit them, and you can discard any commits you make in this</span>
<br>
<span class="r">state without impacting any branches by switching back to a branch.</span>
<br><br>
<span class="cm"># if you just wanted to look at an old commit and do not plan to make changes:</span>
<br>
<span class="p">$ </span>git switch main              <span class="cm"># go back, nothing was lost or changed</span>
<br><br>
<span class="cm"># if you made commits here that you want to keep:</span>
<br>
<span class="p">$ </span>git switch -c my-new-branch  <span class="cm"># create a branch at your current position first</span>
                               <span class="cm"># now those commits are attached to something permanent</span></div>
</div>

Commits you make in detached HEAD state are not deleted when you switch away. They just become unreachable by any branch. Creating a branch immediately saves them. If you switch away without creating a branch, they will eventually be cleaned up by garbage collection, but you can still recover them with `git reflog` for a while.

### your branch is so far behind main that rebasing creates a nightmare of conflicts

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<span class="cm"># first, see which commits are only on your feature branch</span>
<br>
<span class="p">$ </span>git log --oneline main..feature/my-thing
<br><br>
<span class="cm"># strategy: start fresh from updated main, then cherry-pick only your commits</span>
<br>
<span class="p">$ </span>git switch main && git pull
<br>
<span class="p">$ </span>git switch -c feature/my-thing-v2
<br>
<span class="p">$ </span>git cherry-pick abc1234 def5678    <span class="cm"># your commit hashes from the log above</span></div>
</div>

### finding when a bug was introduced

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git show abc1234:src/app.js     <span class="cm"># see a file exactly as it was at a specific commit</span>
<br>
<span class="p">$ </span>git log -S <span class="b">"someFunction"</span>       <span class="cm"># find when that function appeared or disappeared</span>
<br>
<span class="p">$ </span>git blame src/app.js           <span class="cm"># see who last changed every single line of a file</span></div>
</div>

---

## cherry-pick

Cherry-pick takes one specific commit from anywhere in your history and applies it to your current branch. The most common scenario: a bug fix was committed to a feature branch but you need it on main right now without merging the whole feature.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git cherry-pick abc1234               <span class="cm"># apply one commit to current branch</span>
<br>
<span class="p">$ </span>git cherry-pick abc1234 def5678      <span class="cm"># apply multiple commits in order</span>
<br>
<span class="p">$ </span>git cherry-pick abc1234 --no-commit  <span class="cm"># apply the changes but do not auto-commit</span>
                                       <span class="cm"># lets you review or modify before committing</span></div>
</div>

Cherry-pick creates a new commit with the same changes but a different hash. The original commit stays exactly where it was. You are copying the changes, not moving the commit.

---

## git bisect

You know the code worked at some point last month, and it is broken now. There are 50 commits between then and now. You could check each one manually, or you could let git do a binary search.

Binary search works like this: start at the middle. If the bug is there, the culprit is in the first half. If it is not there, the culprit is in the second half. Repeat with the relevant half. Each step eliminates half the remaining options.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git bisect start
<br>
<span class="p">$ </span>git bisect bad                    <span class="cm"># tell git the current commit is broken</span>
<br>
<span class="p">$ </span>git bisect good v1.0.0            <span class="cm"># tell git this earlier commit was working</span>
<br><br>
<span class="cm"># git now checks out the commit halfway between those two points</span>
<span class="cm"># you test your code manually</span>
<br><br>
<span class="p">$ </span>git bisect good                   <span class="cm"># if it works at this midpoint</span>
<br>
<span class="p">$ </span>git bisect bad                    <span class="cm"># if it is still broken</span>
<br><br>
<span class="cm"># repeat this test-and-tell cycle</span>
<span class="cm"># git narrows down until it names the exact commit that introduced the bug</span>
<br><br>
<span class="p">$ </span>git bisect reset                  <span class="cm"># return to your original branch when done</span></div>
</div>

50 commits takes about 6 steps to narrow down. 100 commits takes 7 steps. This is one of those features that feels like magic the first time you use it.

---

## tags

Tags are named pointers to specific commits. Unlike branches, they do not move when you add new commits. They are used to mark release versions.

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div></div>
<div class="body">
<br>
<span class="p">$ </span>git tag -a v1.0.0 -m <span class="b">"first stable release"</span>   <span class="cm"># annotated tag with a message</span>
<br>
<span class="p">$ </span>git tag                                         <span class="cm"># list all tags</span>
<br>
<span class="p">$ </span>git push origin v1.0.0                         <span class="cm"># push one specific tag</span>
<br>
<span class="p">$ </span>git push origin --tags                         <span class="cm"># push all tags at once</span>
<br>
<span class="p">$ </span>git tag -d v1.0.0                              <span class="cm"># delete a tag locally</span>
<br>
<span class="p">$ </span>git push origin --delete v1.0.0               <span class="cm"># delete a tag from remote</span></div>
</div>

Use annotated tags (with `-a`) for releases rather than lightweight tags. Annotated tags store the tagger's name, the date, and the message. GitHub automatically generates a Releases section on your repo page from annotated tags.

---

## github: the interface side

### issues

Issues are GitHub's built-in task and bug tracker. Before writing any code to contribute to an open source project, search the issues first to see if someone is already working on it or if the maintainers have already decided they do not want it. Opening an issue before writing code and waiting for a response is considered good practice. A lot of first-time contributors spend hours on a PR that gets immediately closed because the maintainers specifically do not want that feature.

### code review

On the Files Changed tab of any pull request, click any line number to leave an inline comment on that specific line. When you finish reviewing, you pick one of three options:

- **Comment**: general feedback, no approval or block
- **Approve**: this is ready to merge
- **Request Changes**: something needs to be fixed before this should merge (blocks the PR until the author updates it and you re-review)

### branch protection rules

Under Settings > Branches on GitHub, repo admins can configure rules for protected branches. Common settings include:

- Require at least one approval before merging
- Require all CI checks to pass
- Block force pushes to main
- Require branches to be up to date before merging

Any serious project has these enabled. This means nobody, not even the owner, can accidentally push broken code directly to main.

### github actions (CI/CD)

GitHub Actions lets you run automated tasks whenever certain things happen in your repo, like a push or a new pull request. You write the configuration in a YAML file inside `.github/workflows/`:

<div class="term">
<div class="bar"><div class="d1"></div><div class="d2"></div><div class="d3"></div><span class="lbl">.github/workflows/test.yml</span></div>
<div class="body">
<br>
<span class="b">name:</span> Run Tests
<br>
<span class="b">on:</span> [push, pull_request]
<br>
<span class="b">jobs:</span>
<br>
  <span class="b">test:</span>
<br>
    <span class="b">runs-on:</span> ubuntu-latest
<br>
    <span class="b">steps:</span>
<br>
      - <span class="b">uses:</span> actions/checkout@v4
<br>
      - <span class="b">uses:</span> actions/setup-node@v4
<br>
        <span class="b">with:</span>
<br>
          <span class="b">node-version:</span> <span class="b">'20'</span>
<br>
      - <span class="b">run:</span> npm install
<br>
      - <span class="b">run:</span> npm test</div>
</div>

With this file in place, every push and every pull request will automatically run your tests. The PR page shows a green checkmark or red X. Set branch protection to require this check and broken code cannot be merged, no matter who submits it.

---

## the team workflow (how real projects operate)

Most teams, from two people to hundreds, follow a workflow called GitHub Flow:

1. `main` is always deployable. Every commit on main works. Nobody pushes directly to it.
2. All work happens on feature branches with descriptive names.
3. When the work is ready, open a pull request.
4. One or more teammates review it, leave comments, and approve or request changes.
5. Once approved and all checks pass, it gets merged into main.
6. The feature branch gets deleted.
7. Deployment happens automatically from main via GitHub Actions.

This is not complicated, but it is the thing that makes teams actually function without stepping on each other constantly.

There is a more elaborate model called Gitflow that adds dedicated `develop`, `release`, and `hotfix` branches. It exists for products that ship fixed versioned releases on a schedule, like mobile apps with an App Store review process. For web apps and most modern projects, GitHub Flow is simpler and sufficient.

---

<div class="sc">
<div class="card"><h4>daily work</h4>
<div class="si"><span class="k">git status</span><span class="v">always first</span></div>
<div class="si"><span class="k">git add -p</span><span class="v">stage by hunk</span></div>
<div class="si"><span class="k">git commit -m</span><span class="v">save snapshot</span></div>
<div class="si"><span class="k">git push -u origin branch</span><span class="v">push + track</span></div>
<div class="si"><span class="k">git pull --rebase</span><span class="v">sync cleanly</span></div>
</div>
<div class="card"><h4>branches</h4>
<div class="si"><span class="k">git switch -c name</span><span class="v">create and switch</span></div>
<div class="si"><span class="k">git merge branch</span><span class="v">merge into current</span></div>
<div class="si"><span class="k">git merge --abort</span><span class="v">cancel a merge</span></div>
<div class="si"><span class="k">git branch -d name</span><span class="v">delete branch</span></div>
<div class="si"><span class="k">git branch -vv</span><span class="v">tracking info</span></div>
</div>
<div class="card"><h4>remotes + forks</h4>
<div class="si"><span class="k">git remote -v</span><span class="v">see all remotes</span></div>
<div class="si"><span class="k">git remote add upstream url</span><span class="v">add original</span></div>
<div class="si"><span class="k">git fetch upstream</span><span class="v">download only</span></div>
<div class="si"><span class="k">git rebase upstream/main</span><span class="v">update branch</span></div>
<div class="si"><span class="k">git push --force-with-lease</span><span class="v">safe force</span></div>
</div>
<div class="card"><h4>undo and recover</h4>
<div class="si"><span class="k">git restore --staged</span><span class="v">unstage</span></div>
<div class="si"><span class="k">git commit --amend</span><span class="v">fix last commit</span></div>
<div class="si"><span class="k">git reset --soft HEAD~1</span><span class="v">uncommit</span></div>
<div class="si"><span class="k">git revert abc1234</span><span class="v">safe undo pushed</span></div>
<div class="si"><span class="k">git reflog</span><span class="v">find anything lost</span></div>
</div>
<div class="card"><h4>investigate</h4>
<div class="si"><span class="k">git log -S "string"</span><span class="v">when did this appear</span></div>
<div class="si"><span class="k">git show hash:file</span><span class="v">file at any commit</span></div>
<div class="si"><span class="k">git blame file</span><span class="v">who changed what line</span></div>
<div class="si"><span class="k">git bisect</span><span class="v">binary search a bug</span></div>
<div class="si"><span class="k">git diff main feature</span><span class="v">compare branches</span></div>
</div>
<div class="card"><h4>advanced</h4>
<div class="si"><span class="k">git stash push -m</span><span class="v">save temp work</span></div>
<div class="si"><span class="k">git rebase -i HEAD~n</span><span class="v">squash commits</span></div>
<div class="si"><span class="k">git cherry-pick hash</span><span class="v">grab one commit</span></div>
<div class="si"><span class="k">git tag -a v1.0.0</span><span class="v">mark a release</span></div>
<div class="si"><span class="k">git rm --cached file</span><span class="v">stop tracking</span></div>
</div>
</div>

<div class="ck">
<div class="cl">// are you actually good now?</div>
<ul>
<li><div class="cb" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'✓':''"></div><span>I understand the three areas (working directory, staging, repository) and why a file can appear in two at once</span></li>
<li><div class="cb" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'✓':''"></div><span>I can create branches, switch between them, merge them, and delete them confidently</span></li>
<li><div class="cb" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'✓':''"></div><span>I can read conflict markers, resolve merge conflicts, and know how to abort if needed</span></li>
<li><div class="cb" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'✓':''"></div><span>I know what origin and upstream mean and can set them up from scratch</span></li>
<li><div class="cb" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'✓':''"></div><span>I can fork a repo, add upstream, sync it, create a branch, and open a pull request</span></li>
<li><div class="cb" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'✓':''"></div><span>I know the difference between fetch, pull, and pull --rebase and when to use each</span></li>
<li><div class="cb" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'✓':''"></div><span>I can rebase a feature branch onto main and clean up commits with interactive rebase</span></li>
<li><div class="cb" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'✓':''"></div><span>I know when to use reset vs revert and understand why the difference matters for shared branches</span></li>
<li><div class="cb" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'✓':''"></div><span>I know how to use reflog to recover things that looked permanently deleted</span></li>
<li><div class="cb" onclick="this.classList.toggle('on');this.textContent=this.classList.contains('on')?'✓':''"></div><span>Detached HEAD state does not scare me anymore and I know exactly how to handle it</span></li>
</ul>
</div>

</div>
