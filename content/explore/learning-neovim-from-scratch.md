---
title: "Learning Neovim From Scratch"
date: 2026-04-14T00:00:00+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 0
hiddenInHomeList: false
description: "How a broken keyboard forced me into Neovim, how I went down the rabbit hole building a config from scratch, and everything I learned so you don't have to spend months figuring it out the hard way."
cover:
  image: ""
  alt: ""
  caption: ""
---

<!--
  NOTE FOR HUGO SETUP:
  This post uses inline HTML. Add this to your hugo.toml:

  [markup.goldmark.renderer]
    unsafe = true

  Also place the nvim config zip at:
  static/downloads/nvim.zip
  It will then be downloadable at /downloads/nvim.zip
-->

<style>
.nv-post {
  --nv-green:  #a7c080;
  --nv-teal:   #83c092;
  --nv-yellow: #dbbc7f;
  --nv-orange: #e69875;
  --nv-red:    #e67e80;
  --nv-blue:   #7fbbb3;
  --nv-panel:  #1e2528;
  --nv-border: #2d353b;
  --nv-muted:  #475258;
  --nv-text:   #d3c6aa;
}
.nv-key {
  display: inline-block;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.78em;
  background: #1e2326;
  color: #d3c6aa;
  border: 1px solid #3d484d;
  border-bottom: 2px solid #4a5860;
  padding: 1px 8px;
  border-radius: 3px;
  white-space: nowrap;
}
.nv-term {
  background: #161c1e;
  border: 1px solid #252d30;
  border-radius: 8px;
  overflow: hidden;
  margin: 24px 0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.nv-term-bar {
  background: #1e2528;
  padding: 9px 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  border-bottom: 1px solid #252d30;
}
.nv-dot { width: 11px; height: 11px; border-radius: 50%; }
.nv-dot-r { background: #ff5f57; }
.nv-dot-y { background: #febc2e; }
.nv-dot-g { background: #28c840; }
.nv-term-body {
  padding: 16px 20px;
  font-size: 13px;
  line-height: 1.85;
  color: #a7c080;
}
.nv-term-body .p  { color: #83c092; }
.nv-term-body .cm { color: #3a5040; }
.nv-term-body .hi { color: #dbbc7f; }
.nv-term-body .er { color: #e67e80; }
.nv-warn {
  background: #221510;
  border: 1px solid #3d2510;
  border-left: 3px solid #e69875;
  border-radius: 4px;
  padding: 14px 18px;
  margin: 20px 0;
  font-size: 0.92rem;
  color: #b8886a;
}
.nv-warn strong { color: #e69875; }
.nv-tip {
  background: #131e22;
  border: 1px solid #1e3038;
  border-left: 3px solid #7fbbb3;
  border-radius: 4px;
  padding: 14px 18px;
  margin: 20px 0;
  font-size: 0.92rem;
  color: #7aaa9a;
}
.nv-tip strong { color: #7fbbb3; }
.nv-notice {
  background: #1a2218;
  border: 1px solid #a7c08033;
  border-left: 3px solid #a7c080;
  border-radius: 4px;
  padding: 15px 20px;
  margin: 24px 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: #7a9a7a;
  line-height: 1.7;
}
.nv-notice strong { color: #a7c080; }
.nv-keytable {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 0.88rem;
}
.nv-keytable th {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #475258;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #2d353b;
}
.nv-keytable td {
  padding: 10px 12px;
  border-bottom: 1px solid #242c2f;
  vertical-align: top;
}
.nv-keytable tr:hover td { background: #1e2528; }
.nv-keytable td:first-child {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: #a7c080;
  white-space: nowrap;
  min-width: 160px;
}
.nv-keytable td:last-child { color: #6a8070; }
.nv-mode-demo {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 20px 0;
}
.nv-mode {
  padding: 6px 16px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  border: 1px solid;
}
.nv-mode-normal { background: #2a3a2e; color: #a7c080; border-color: #a7c080; }
.nv-mode-insert { background: #1f2e38; color: #7fbbb3; border-color: #7fbbb3; }
.nv-mode-visual { background: #2e2838; color: #d699b6; border-color: #d699b6; }
.nv-mode-cmd    { background: #332d20; color: #dbbc7f; border-color: #dbbc7f; }
.nv-grammar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 24px 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  flex-wrap: wrap;
}
.nv-gram-box {
  padding: 10px 18px;
  border-radius: 4px;
  text-align: center;
  line-height: 1.4;
}
.nv-gram-box .label { font-size: 0.6rem; letter-spacing: 0.1em; opacity: 0.6; display: block; margin-bottom: 4px; text-transform: uppercase; }
.nv-gram-box .val   { font-size: 1rem; font-weight: 700; }
.nv-gram-op  { background: #2a2a3e; border: 1px solid #404060; color: #d699b6; }
.nv-gram-obj { background: #1e2d22; border: 1px solid #2a3d2e; color: #a7c080; }
.nv-gram-cnt { background: #2a2218; border: 1px solid #3d3020; color: #dbbc7f; }
.nv-gram-sep { color: #3d484d; font-size: 1.2rem; align-self: center; }
.nv-gram-ex  { background: #131e22; border: 1px solid #1e3038; color: #7fbbb3; }
.nv-hierarchy {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #2d353b;
  margin: 24px 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}
.nv-h-row {
  display: flex;
  align-items: center;
  padding: 13px 16px;
  background: #1e2528;
  border-bottom: 1px solid #252d30;
  transition: background 0.1s;
}
.nv-h-row:last-child { border: none; }
.nv-h-row:hover { background: #222c30; }
.nv-h-icon  { margin-right: 12px; font-size: 15px; }
.nv-h-name  { color: #d3c6aa; font-weight: 500; }
.nv-h-arrow { color: #a7c080; margin: 0 10px; font-size: 11px; }
.nv-h-desc  { color: #3d484d; font-size: 11px; margin-left: auto; text-align: right; }
.nv-os-tabs {
  display: flex;
  gap: 0;
  margin: 24px 0 0;
  border-bottom: 1px solid #2d353b;
}
.nv-os-tab {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  padding: 8px 16px;
  color: #475258;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  user-select: none;
}
.nv-os-tab.active { color: #a7c080; border-bottom-color: #a7c080; }
.nv-os-content { display: none; }
.nv-os-content.active { display: block; }
.nv-dl-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #1e2d22;
  border: 1px solid #a7c080;
  color: #a7c080;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  padding: 12px 22px;
  border-radius: 6px;
  text-decoration: none;
  margin: 16px 0;
  transition: all 0.2s;
}
.nv-dl-btn:hover {
  background: #253522;
  box-shadow: 0 0 16px rgba(167,192,128,0.2);
  text-decoration: none;
  color: #a7c080;
}
.nv-cs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 24px 0;
}
@media(max-width:600px){ .nv-cs-grid { grid-template-columns: 1fr; } }
.nv-cs-card {
  background: #1e2528;
  border: 1px solid #2d353b;
  border-radius: 6px;
  padding: 16px;
}
.nv-cs-card h4 {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a7c080;
  margin: 0 0 12px;
}
.nv-cs-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #252d30;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
}
.nv-cs-item:last-child { border: none; }
.nv-cs-item .k { color: #a7c080; }
.nv-cs-item .d { color: #475258; font-size: 11px; text-align: right; max-width: 55%; }
</style>

<script>
function switchTab(group, os) {
  document.querySelectorAll('[data-group="'+group+'"]').forEach(function(el) {
    el.classList.remove('active');
  });
  document.querySelectorAll('[data-content="'+group+'"]').forEach(function(el) {
    el.classList.remove('active');
  });
  document.querySelector('[data-group="'+group+'"][data-os="'+os+'"]').classList.add('active');
  document.querySelector('[data-content="'+group+'"][data-os="'+os+'"]').classList.add('active');
}
</script>

<div class="nv-post">

<div class="nv-notice">
<strong>how to read this:</strong> this is dense and it's meant to be. don't rush it. open a terminal next to this tab while reading, and whenever I describe something, just try it. the goal isn't to finish reading, it's to understand. a section per day, practiced for real, is worth more than reading the whole thing once and forgetting it.
</div>

---

## the keyboard that broke my workflow

I have a thing for mechanical keyboards. Not the expensive ones, I'm a broke CS student, but I was casually browsing Amazon looking for something cheap with a satisfying click. Found this Amazon Basics mechanical keyboard for like 900 rupees. Ordered it immediately.

It arrived, felt great. Good switches, decent build. But there was one problem I hadn't checked for: the arrow keys were not distinct. They shared keys with other characters, and specifically -- the right arrow key was on the same key as forward slash `/`.

Now if you're a developer, you use `/` literally dozens of times every single line. Path separators, regex, URL strings, comments, division operators. And I also needed arrow keys for navigation. There was no good way to use both comfortably.

I had two options: return it or adapt. Returning it felt like giving up. Adapting meant learning Neovim, something I had been putting off for months because it looked intimidating. The keyboard basically forced my hand.

I started with the goal of just being functional. Survive in the editor, navigate files, edit code. But here's the thing about me -- I cannot do anything halfway. I started watching YouTube videos about Neovim configs. Then I found GitHub repos with insane setups. Then I started reading plugin documentation. Then I got obsessed with making keymaps feel natural. Then I spent a weekend going through Treesitter's textobjects plugin docs.

Three months later I had built something I'm genuinely proud of. A config that's not copied from one source but assembled from maybe fifteen different places, tons of trial and error, some AI help for the Lua parts I didn't understand, pattern recognition from other people's setups, and actual use. Every plugin in there has a reason. Every keymap was thought about.

This blog is that config, explained. And everything I learned using it over three months -- from the absolute basics of modes and motions to LSP, Telescope, git integration, custom snippets. You're getting the full picture, the way I wish someone had written it for me when I started.

---

## setting up Neovim

Before anything else you need Neovim itself. The important thing here: the config uses features from Neovim 0.11+. Older versions won't work correctly. Check what you have first:

<div class="nv-term">
<div class="nv-term-bar"><div class="nv-dot nv-dot-r"></div><div class="nv-dot nv-dot-y"></div><div class="nv-dot nv-dot-g"></div></div>
<div class="nv-term-body"><span class="p">$ </span>nvim --version</div>
</div>

If the output shows `NVIM v0.11.0` or higher you're fine. If it shows something older, or if the command doesn't exist, install it now.

### install Neovim 0.11+

<div class="nv-os-tabs">
  <div class="nv-os-tab active" data-group="install" data-os="arch" onclick="switchTab('install','arch')">Arch / Manjaro</div>
  <div class="nv-os-tab" data-group="install" data-os="ubuntu" onclick="switchTab('install','ubuntu')">Ubuntu / Debian</div>
  <div class="nv-os-tab" data-group="install" data-os="fedora" onclick="switchTab('install','fedora')">Fedora</div>
  <div class="nv-os-tab" data-group="install" data-os="mac" onclick="switchTab('install','mac')">macOS</div>
</div>

<div class="nv-os-content active" data-content="install" data-os="arch">
<div class="nv-term">
<div class="nv-term-bar"><div class="nv-dot nv-dot-r"></div><div class="nv-dot nv-dot-y"></div><div class="nv-dot nv-dot-g"></div></div>
<div class="nv-term-body"><span class="cm"># Arch repos always have current versions, this just works</span>
<span class="p">$ </span>sudo pacman -S neovim

<span class="cm"># verify</span>
<span class="p">$ </span>nvim --version</div>
</div>
</div>

<div class="nv-os-content" data-content="install" data-os="ubuntu">
<div class="nv-term">
<div class="nv-term-bar"><div class="nv-dot nv-dot-r"></div><div class="nv-dot nv-dot-y"></div><div class="nv-dot nv-dot-g"></div></div>
<div class="nv-term-body"><span class="cm"># Ubuntu's apt repos often have outdated Neovim versions</span>
<span class="cm"># Use the AppImage from GitHub for the latest stable release</span>
<span class="p">$ </span>curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.appimage
<span class="p">$ </span>chmod u+x nvim-linux-x86_64.appimage
<span class="p">$ </span>sudo mv nvim-linux-x86_64.appimage /usr/local/bin/nvim

<span class="cm"># verify</span>
<span class="p">$ </span>nvim --version</div>
</div>
<div class="nv-tip"><strong>// note:</strong> on some minimal Ubuntu installs you may need <code>sudo apt install fuse libfuse2</code> first for the AppImage to run. if you get a "fuse: device not found" error, that's why.</div>
</div>

<div class="nv-os-content" data-content="install" data-os="fedora">
<div class="nv-term">
<div class="nv-term-bar"><div class="nv-dot nv-dot-r"></div><div class="nv-dot nv-dot-y"></div><div class="nv-dot nv-dot-g"></div></div>
<div class="nv-term-body"><span class="cm"># Fedora's repos are reasonably current</span>
<span class="p">$ </span>sudo dnf install neovim

<span class="cm"># if the version is older than 0.11, use the AppImage method:</span>
<span class="p">$ </span>curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.appimage
<span class="p">$ </span>chmod u+x nvim-linux-x86_64.appimage
<span class="p">$ </span>sudo mv nvim-linux-x86_64.appimage /usr/local/bin/nvim</div>
</div>
</div>

<div class="nv-os-content" data-content="install" data-os="mac">
<div class="nv-term">
<div class="nv-term-bar"><div class="nv-dot nv-dot-r"></div><div class="nv-dot nv-dot-y"></div><div class="nv-dot nv-dot-g"></div></div>
<div class="nv-term-body"><span class="cm"># Homebrew handles this cleanly</span>
<span class="p">$ </span>brew install neovim

<span class="cm"># verify</span>
<span class="p">$ </span>nvim --version</div>
</div>
</div>

You also need `git` (almost certainly already installed), `node` (for some LSP servers and live-server), and a Nerd Font set as your terminal font so the icons render correctly. If you see small squares where there should be icons, that's the font. Grab one from [nerdfonts.com](https://www.nerdfonts.com) -- I use JetBrainsMono Nerd Font.

### installing the config

After three months of tweaking, this is the config I'm sharing. It has a good LSP setup for Python, JavaScript, TypeScript, C/C++, Lua, Rust, and more. Telescope for fuzzy finding, Neotree for file explorer, gitsigns for inline git diffs, Harpoon for quick file switching, nvim-surround, autoformatting with prettier/stylua/ruff, treesitter-based highlighting and text objects, a working snippet engine. It's a solid base that won't embarrass you.

<a class="nv-dl-btn" href="/downloads/nvim.zip" download>
  ↓ &nbsp; download nvim config (nvim.zip)
</a>

Once you have it:

<div class="nv-term">
<div class="nv-term-bar"><div class="nv-dot nv-dot-r"></div><div class="nv-dot nv-dot-y"></div><div class="nv-dot nv-dot-g"></div></div>
<div class="nv-term-body"><span class="cm"># if you already have a neovim config, back it up first</span>
<span class="p">$ </span>mv ~/.config/nvim ~/.config/nvim.bak

<span class="cm"># extract the zip and move it into place</span>
<span class="p">$ </span>unzip nvim.zip
<span class="p">$ </span>mv nvim_new ~/.config/nvim

<span class="cm"># open neovim -- lazy.nvim (the plugin manager) will bootstrap itself</span>
<span class="cm"># and start downloading all plugins automatically</span>
<span class="p">$ </span>nvim</div>
</div>

The first time you open Neovim with this config it will take a minute or two. You'll see lazy.nvim installing everything. Let it finish. If any errors appear, press `q` to dismiss and then quit with `:q` and reopen. Mason (the LSP package manager) also runs in the background installing language servers -- watch the fidget spinner in the top-right corner to know when things are loading.

After the initial setup, opening Neovim will be instant.

### verify the install

<div class="nv-term">
<div class="nv-term-bar"><div class="nv-dot nv-dot-r"></div><div class="nv-dot nv-dot-y"></div><div class="nv-dot nv-dot-g"></div></div>
<div class="nv-term-body"><span class="cm"># run this from inside neovim (press : then type this)</span>
<span class="hi">:checkhealth</span>

<span class="cm"># see all installed plugins and their status</span>
<span class="hi">:Lazy</span>

<span class="cm"># see all installed LSP servers and tools</span>
<span class="hi">:Mason</span></div>
</div>

If `:checkhealth` shows mostly green with a few yellow warnings, you're fine. Red errors for things like `node` or `python3` just mean those runtimes aren't on your system yet and the relevant LSP servers won't work until you install them. Everything else should be fine.

---

## what makes Neovim different: modes

You've got Neovim installed. Now the actual learning starts, and the very first concept is the one that trips everyone up.

Every editor you've used before works the same way: you open a file, your cursor is somewhere, and whatever you type inserts text at that position. The keyboard always types text. That's the only mode.

Neovim has **modes**. The keyboard does completely different things depending on which mode you're in.

<div class="nv-mode-demo">
  <div class="nv-mode nv-mode-normal">NORMAL</div>
  <div class="nv-mode nv-mode-insert">INSERT</div>
  <div class="nv-mode nv-mode-visual">VISUAL</div>
  <div class="nv-mode nv-mode-cmd">COMMAND</div>
</div>

**Normal mode** is the default and it's where you should be most of the time. In normal mode, the keyboard is entirely for commands -- `j` moves down, `d` deletes, `w` jumps forward a word, `gg` goes to the top of the file. Nothing you type inserts text into the file.

**Insert mode** is what you're used to. Keys type text. You enter it from normal mode and leave it back to normal mode when you're done typing.

**Visual mode** is for selections. `v` selects character by character, `V` selects whole lines, `Ctrl+v` does block/column selection.

**Command mode** is for running ex commands. You enter it with `:`. This is where `:w` (save), `:q` (quit), `:s/old/new/g` (find and replace) live.

The current mode is always shown in the lualine statusbar at the bottom of the screen. You always know where you are.

Why does this design exist? Think about what you actually do when you're coding. You write new text for maybe 30% of the time. The other 70% you're navigating, selecting things, deleting, rearranging, searching. A regular editor gives you the mouse and some Ctrl+key combinations for all of that. Vim gives the entire keyboard, all the home row keys, no modifier needed, just for those operations. Once that keyboard real estate is yours, you use it constantly and efficiently.

### getting out of insert mode

In this config, `jk` and `kj` are both mapped to Escape in insert mode. Use this instead of reaching for the physical Escape key, which is too far up on the keyboard. `jk` is a quick two-finger roll on the home row and after a week it becomes completely unconscious. You'll accidentally do it in browser text boxes.

The single most important habit to build first: **stop living in insert mode**. In VSCode the mental model is "cursor is always ready to type text." In Neovim the mental model is: enter insert mode, type a sentence or a block of code, exit with `jk`, navigate, enter insert mode again, type, exit. Normal mode is home. Insert mode is a visit. The rhythm is burst-of-typing, exit, move, burst-of-typing, exit.

<div class="nv-warn">
<strong>// the mistake almost everyone makes:</strong> staying in insert mode and using arrow keys to navigate to a different position. if you're in insert mode and want to move somewhere, press <code>jk</code> first, navigate in normal mode, then enter insert mode again at the right position. this feels unnatural for a while, but it builds the right muscle memory.
</div>

---

## moving around without arrow keys

The core navigation keys in normal mode are `h`, `j`, `k`, `l` for left, down, up, right. They're on the home row of your right hand. Your hand doesn't need to move. This sounds minor but over a full day of coding it genuinely adds up.

That said, `h/j/k/l` are only for small adjustments. Moving through a file one line at a time would be slow. These are the motions that actually cover distance:

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>w</td><td>Jump forward to the start of the next word</td></tr>
<tr><td>W</td><td>Same, but treats anything-not-whitespace as one word (skips punctuation boundaries)</td></tr>
<tr><td>b</td><td>Jump backward to the start of the current or previous word</td></tr>
<tr><td>B</td><td>Backward WORD version</td></tr>
<tr><td>e</td><td>Forward to the end of the current or next word</td></tr>
<tr><td>E</td><td>End of WORD</td></tr>
<tr><td>0</td><td>Start of line (column 0, absolute)</td></tr>
<tr><td>^</td><td>First non-blank character of the line</td></tr>
<tr><td>$</td><td>End of line</td></tr>
<tr><td>gg</td><td>First line of the file</td></tr>
<tr><td>G</td><td>Last line of the file</td></tr>
<tr><td>50G or :50</td><td>Jump to line 50</td></tr>
<tr><td>{ }</td><td>Jump up or down to the next empty line -- paragraph boundary</td></tr>
<tr><td>H M L</td><td>Move cursor to top, middle, or bottom of the visible screen</td></tr>
<tr><td>Ctrl+d</td><td>Scroll down half page, cursor re-centers on screen</td></tr>
<tr><td>Ctrl+u</td><td>Scroll up half page, cursor re-centers</td></tr>
</table>

The small/WORD distinction matters in practice. In `foo.bar`, `w` stops at the dot. `W` skips the whole thing as one unit. In a URL like `https://example.com/path`, `w` stops at every slash and colon. `W` skips the whole URL. Use `W`, `B`, `E` when you want to jump at the level of tokens rather than individual word-characters.

`{` and `}` are underused by beginners. In real code, blank lines separate functions, classes, logical blocks. You can navigate through an entire file visiting every function boundary with `{` and `}`, no searching needed. I use these more than `Ctrl+d/u` for most files.

This config has `relativenumber = true` set, which shows the distance to every line from your cursor position rather than the absolute line number. So instead of counting in your head, you look at the number next to the line you want: it says `7`, you press `7j` to jump there, `7k` to come back. Count-prefixed jumps become very natural once relative numbers are on.

### finding characters on the current line

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>f{char}</td><td>Find next occurrence of char on this line, land on it</td></tr>
<tr><td>F{char}</td><td>Find previous occurrence, land on it</td></tr>
<tr><td>t{char}</td><td>Jump to just before the next char (think: "until")</td></tr>
<tr><td>T{char}</td><td>Jump to just after the previous char</td></tr>
<tr><td>;</td><td>Repeat last f/F/t/T in the same direction</td></tr>
<tr><td>,</td><td>Repeat in the opposite direction</td></tr>
</table>

These become very useful combined with operators. `f(` on a function call jumps straight to the opening paren. `t,` in an argument list lands just before a comma. `dt,` means delete from cursor up to but not including the comma. `cf(` means change from cursor to the opening paren. Once `f` and `t` are reflex, editing individual lines gets noticeably faster.

### entering insert mode in the right position

There are six ways to enter insert mode and each puts the cursor in a different place. Using only `i` and then navigating with arrow keys is the slowest approach.

<table class="nv-keytable">
<tr><th>Key</th><th>Where it puts you</th></tr>
<tr><td>i</td><td>Insert before cursor</td></tr>
<tr><td>a</td><td>Append after cursor</td></tr>
<tr><td>I</td><td>Insert at first non-blank character of the line</td></tr>
<tr><td>A</td><td>Append at end of line</td></tr>
<tr><td>o</td><td>Open new line below, enter insert mode there</td></tr>
<tr><td>O</td><td>Open new line above, enter insert mode there</td></tr>
<tr><td>s</td><td>Delete character under cursor, enter insert mode</td></tr>
<tr><td>S or cc</td><td>Delete entire line content, enter insert mode at start</td></tr>
</table>

Adding something at the end of a line? `A`, not `$` then `a`. New line below and start typing? `o`, not `j` then `O`. Clear the whole line and retype it? `S`, not `0d$i`. Each one saves a few keystrokes and they happen constantly. After a week these become instinctive.

### the jump list, your undo for navigation

Every time you make a big jump -- `G`, `/search`, `gd` to go to a definition, `*` on a word -- Vim records your position. `Ctrl+o` walks backward through that list. `Ctrl+i` goes forward.

This becomes extremely useful once you're using LSP. You press `gd` to jump to a function definition somewhere else in the file (or another file entirely), read it, then `Ctrl+o` and you're right back where you were. I use this pair probably fifty times a day. It's essentially a browser back/forward button for code navigation.

---

## the grammar: operators, motions, text objects

This is the section where Neovim stops feeling like a weird editor and starts making sense as a system. I remember the exact moment it clicked for me -- I was trying to delete the contents of a string literal and I thought "delete, inside, quotes" and typed `di"` and it just worked. That's the grammar.

<div class="nv-grammar">
  <div class="nv-gram-box nv-gram-cnt"><span class="label">optional</span><span class="val">[count]</span></div>
  <div class="nv-gram-sep">+</div>
  <div class="nv-gram-box nv-gram-op"><span class="label">operator</span><span class="val">verb</span></div>
  <div class="nv-gram-sep">+</div>
  <div class="nv-gram-box nv-gram-obj"><span class="label">motion or text object</span><span class="val">noun</span></div>
  <div class="nv-gram-sep">=</div>
  <div class="nv-gram-box nv-gram-ex"><span class="label">example</span><span class="val">d3w = delete 3 words</span></div>
</div>

You know `d` (delete), `3` (three times), `w` (word). You didn't memorize `d3w` as a shortcut. You **constructed it** from vocabulary you already have. This is the fundamental difference between Vim and every other editor's keyboard shortcuts. VSCode: memorize isolated facts. Vim: learn a grammar, generate thousands of combinations from a small set of primitives.

### operators, the verbs

<table class="nv-keytable">
<tr><th>Operator</th><th>Action</th></tr>
<tr><td>d</td><td>Delete (cuts to register, can be pasted)</td></tr>
<tr><td>c</td><td>Change -- delete then immediately enter insert mode</td></tr>
<tr><td>y</td><td>Yank (copy to register)</td></tr>
<tr><td>></td><td>Indent right</td></tr>
<tr><td><</td><td>Indent left</td></tr>
<tr><td>=</td><td>Auto-indent</td></tr>
<tr><td>gc</td><td>Comment or uncomment (native Neovim 0.10+, no plugin)</td></tr>
<tr><td>gU</td><td>Make uppercase</td></tr>
<tr><td>gu</td><td>Make lowercase</td></tr>
</table>

Doubling any operator applies it to the whole line: `dd` deletes the line, `yy` yanks it, `cc` clears it and enters insert mode, `>>` indents it, `gcc` comments it.

### text objects, the nouns that actually matter

A motion describes a **direction** -- "three words forward." A text object describes a **shape** -- "the thing inside these quotes," "the whole function body," "this paragraph." They always need a prefix:

- `i` means **inner** -- the contents, without the surrounding delimiters
- `a` means **around** -- the contents plus the delimiters themselves

<table class="nv-keytable">
<tr><th>Text Object</th><th>What it selects</th></tr>
<tr><td>iw / aw</td><td>inner word / a word including trailing whitespace</td></tr>
<tr><td>iW / aW</td><td>inner WORD / a WORD (whitespace-bounded)</td></tr>
<tr><td>i" / a"</td><td>inside double quotes / including the quote characters</td></tr>
<tr><td>i' / a'</td><td>inside single quotes / including them</td></tr>
<tr><td>i` / a`</td><td>inside backticks / including them (great for template literals)</td></tr>
<tr><td>i( / a(  or  ib / ab</td><td>inside parentheses / including the parens</td></tr>
<tr><td>i{ / a{  or  iB / aB</td><td>inside curly braces / including them</td></tr>
<tr><td>i[ / a[</td><td>inside square brackets / including them</td></tr>
<tr><td>it / at</td><td>inside HTML/XML tag / including the tags</td></tr>
<tr><td>is / as</td><td>inner sentence / around sentence</td></tr>
<tr><td>ip / ap</td><td>inner paragraph / around paragraph</td></tr>
<tr><td>if / af</td><td>inner function body / around function (treesitter-aware)</td></tr>
<tr><td>ia / aa</td><td>inner argument / around argument (treesitter-aware)</td></tr>
<tr><td>ic / ac</td><td>inner class body / around class (treesitter-aware)</td></tr>
</table>

The last three -- `if`, `ia`, `ic` -- come from the nvim-treesitter-textobjects plugin included in this config. They're AST-aware, meaning they understand actual code structure rather than just matching brackets. `dif` on a Python function deletes the body correctly regardless of indentation complexity. `dia` on an argument in a function call removes exactly that argument and adjusts the commas. These sound like minor things but they're genuinely impressive when you first feel them work.

### the combos -- read them as sentences

I learned these by saying the sentence in my head while typing the keys. It sounds silly but it works.

<table class="nv-keytable">
<tr><th>Keys</th><th>Read as / what happens</th></tr>
<tr><td>ciw</td><td>"change inner word" -- deletes word under cursor, drops into insert mode ready to type replacement</td></tr>
<tr><td>ci"</td><td>"change inside quotes" -- clears string contents, cursor is inside empty quotes in insert mode</td></tr>
<tr><td>ca(</td><td>"change around parens" -- removes everything including the parens, insert mode</td></tr>
<tr><td>di{</td><td>"delete inside braces" -- clears a block body, useful for emptying a function</td></tr>
<tr><td>yi(</td><td>"yank inside parens" -- copies the arguments of a function call</td></tr>
<tr><td>yif</td><td>"yank inner function" -- copies the entire function body</td></tr>
<tr><td>dif</td><td>"delete inner function" -- removes the function body, keeps the signature</td></tr>
<tr><td>cit</td><td>"change inside tag" -- clears HTML tag content, enter insert mode inside</td></tr>
<tr><td>vip</td><td>"visual inner paragraph" -- visually selects the current code block</td></tr>
<tr><td>gcip</td><td>"comment inner paragraph" -- comments the whole current block</td></tr>
<tr><td>gUiw</td><td>"uppercase inner word" -- makes word under cursor ALL CAPS</td></tr>
<tr><td>=ip</td><td>"auto-indent inner paragraph" -- re-indents the current block</td></tr>
<tr><td>dia</td><td>"delete inner argument" -- removes a function argument cleanly</td></tr>
<tr><td>3dd</td><td>delete three lines</td></tr>
<tr><td>d$</td><td>delete from cursor to end of line (same as D)</td></tr>
<tr><td>>ib</td><td>indent everything inside the current parens</td></tr>
</table>

Once you have ten or fifteen of these internalized, you stop needing to look things up. You think "I want to change what's inside these brackets" and your hands just type `ci[`. You didn't memorize `ci[` specifically -- you constructed it.

### the dot key, repeat anything

`.` repeats your last change. All of it -- the operator, the text object, and whatever you typed in insert mode. If you did `ciw` and typed `newName`, pressing `.` on another word deletes it and types `newName`. If you pressed `A;jk` to add a semicolon at the end of a line, `j.` does the same on the next line.

The practical principle: design edits to be repeatable. Instead of selecting twenty lines and changing everything at once, make the change on one, move to the next with `n` or `j`, press `.`. Instead of manually finding every instance of something, use the search-and-dot pattern described in the config keymaps section. The dot key turns any edit into a batch operation.

### count prefixes

Any operator or motion can be preceded by a number. `3w` jumps three words forward. `d3w` deletes three words. `5j` moves five lines down. `3dd` deletes three lines. `2yy` yanks two lines. With relative numbers on (which this config sets), you see the distance to every line on screen. You see `7` next to the function you want, you type `7j` and you're there.

### visual mode

`v` enters character visual mode, `V` selects whole lines, `Ctrl+v` enters block/column visual mode. You expand the selection with any motion, then apply an operator. `viw` selects inner word. `vi{` selects inside braces. `vip` selects the paragraph.

In this config, `<` and `>` (indent/dedent) stay in visual mode after applying, so you can keep pressing `>` to keep indenting without re-selecting. And `p` in visual mode pastes without overwriting your yank register -- normally pasting over a selection kills what you had copied, this config routes the deleted selection to a blackhole so your clipboard stays intact.

Block visual (`Ctrl+v`) does something other editors can't do natively. Select a column of text across multiple lines, press `I`, type something, press `jk`, and that text gets prepended to every selected line simultaneously. Select a column and `d` to delete that column across every line. This is the "multiple cursors" operation without needing a plugin.

### registers, multiple clipboards

When you `yy` or `dd`, where does it go? Into the default unnamed register `"`. When you `p`, it pastes from there. But Vim has multiple registers:

<table class="nv-keytable">
<tr><th>Register</th><th>What it holds</th></tr>
<tr><td>"</td><td>Default -- last delete or yank (whichever was more recent)</td></tr>
<tr><td>0</td><td>Yank-only register -- only yanks, never deletes. Always reliable.</td></tr>
<tr><td>_</td><td>Blackhole -- things sent here disappear, don't overwrite anything</td></tr>
<tr><td>+</td><td>System clipboard -- your OS copy/paste</td></tr>
<tr><td>a through z</td><td>Named registers you control manually</td></tr>
<tr><td>/</td><td>Last search pattern</td></tr>
</table>

The most useful thing to know: `"0p` pastes from the yank register specifically. This matters because `dd` (delete) overwrites the default register `"`. Say you `yy` something you want, then `dd` a line you don't need -- now `p` gives you the deleted line, not what you yanked. `"0p` always gives you what you last yanked, no matter how many deletes happened since. This saves real frustration.

In this config, `x` is mapped to `"_x` -- deletes the character to the blackhole register. So deleting single characters never pollutes your clipboard. Small thing, genuinely nice quality of life. Also, `Space+y` and `Space+Y` explicitly yank to the system clipboard (`"+y`). Use these when you need to paste something outside of Neovim.

To use named registers: `"ayiw` yanks the current word into register `a`. `"ap` pastes it later. You can hold multiple completely independent things in memory this way -- very useful for complex refactors.

---

## searching

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>/pattern</td><td>Search forward for pattern, Enter to confirm</td></tr>
<tr><td>?pattern</td><td>Search backward for pattern</td></tr>
<tr><td>n</td><td>Jump to next match</td></tr>
<tr><td>N</td><td>Jump to previous match</td></tr>
<tr><td>*</td><td>Search for exact word under cursor (forward)</td></tr>
<tr><td>#</td><td>Search for exact word under cursor (backward)</td></tr>
<tr><td>Esc</td><td>Clear search highlights (mapped to :noh in this config)</td></tr>
</table>

In this config, `n` and `N` are both mapped to auto-center the screen after jumping -- `nzzzv` and `Nzzzv`. This means every match you jump to appears in the middle of the screen. You never lose context cycling through results.

The config has `ignorecase = true` and `smartcase = true` together. This combination means: lowercase searches are case-insensitive (so `/foo` matches Foo, FOO, foo). But if you include any uppercase character in the search, it becomes case-sensitive (so `/Foo` only matches Foo). This is almost always the right behavior and you stop thinking about it quickly.

The `*` key deserves emphasis. Put the cursor on any identifier, press `*`, and every occurrence of that exact word in the file gets highlighted. Then `n`/`N` to cycle through them. This is your quick-find for the symbol under cursor, and it works instantly without typing a search pattern.

---

## marks, navigation bookmarks

Marks save your position so you can come back to it.

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>ma</td><td>Set mark 'a' at current position (line + column)</td></tr>
<tr><td>`a</td><td>Jump to exact position of mark 'a'</td></tr>
<tr><td>'a</td><td>Jump to line of mark 'a' (first non-blank char)</td></tr>
<tr><td>``</td><td>Jump back to position before last big jump</td></tr>
<tr><td>'0</td><td>Jump to where you were when you last exited Neovim</td></tr>
</table>

Lowercase marks `a-z` are local to the file. Uppercase `A-Z` are global and persist across files -- set mark `M` in one file, open another, `'M` to go back to the exact position in the first file.

The pattern I use most: I'm deep in some implementation and need to check something in another part of the file. `ma` where I am, jump there with `gg/pattern` or `gd`, read what I need, `'a` to come back instantly. No scrolling, no searching, just back to exactly where I was.

---

## macros, automating repetitive edits

Macros record any sequence of normal mode actions and replay them. They're stored in registers, same as text.

`qa` starts recording into register `a`. Do your operation. `q` stops. `@a` replays. `@@` replays the last macro again. `50@a` replays it fifty times.

The discipline that makes macros actually reliable: use text objects and motions, not character counts. If your macro does `3l` (move three characters right), it will break on lines with slightly different structure. If it does `f(` (jump to next open paren), it works everywhere there's a paren. Macros should describe structure, not raw physical keystroke positions.

Good workflow: position at the consistent starting point of the first item, record, end at the consistent starting point for the next item (usually `j` to next line or `}` to next block), test with `@a` on one more item, then `98@@` for the rest.

Macros live in registers, so `"ap` in insert mode literally pastes the macro as text. This means you can edit a macro after recording: paste it, fix the mistake, yank it back into register `a` with `"ayy`. Much cleaner than re-recording from scratch when you made one small error halfway through.

---

## the config keymaps, the complete reference

Your leader key is `Space`. Everything `Space+...` below means: press Space, then the rest. The config sets `timeoutlen = 300`, meaning you have 300ms between keys in a sequence. It feels fast but comfortable.

### basics

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>Ctrl+s</td><td>Save file</td></tr>
<tr><td>Ctrl+q</td><td>Quit</td></tr>
<tr><td>Space+sn</td><td>Save without triggering autoformat (when prettier is mangling something specific)</td></tr>
<tr><td>Esc</td><td>Clear search highlights</td></tr>
<tr><td>Space+lw</td><td>Toggle line wrap</td></tr>
<tr><td>Space+ss</td><td>Save session to .session.vim in current directory</td></tr>
<tr><td>Space+sl</td><td>Load session from .session.vim</td></tr>
</table>

### editing helpers

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>Alt+j / Alt+k</td><td>Move current line down / up (works in normal and visual)</td></tr>
<tr><td>Alt+d</td><td>Duplicate current line below</td></tr>
<tr><td>Space+j</td><td>Interactive word replace -- type new name, then . to replace each next occurrence, n to skip</td></tr>
<tr><td>Space+y / Space+Y</td><td>Yank selection or line to system clipboard</td></tr>
<tr><td>Space++ / Space+-</td><td>Increment / decrement number under cursor</td></tr>
<tr><td>x</td><td>Delete character to blackhole (won't kill your yank register)</td></tr>
</table>

`Space+j` maps to `*``cgn`. Here is exactly what that does: `*` searches for the word under cursor. ` `` ` (two backticks) jumps back to where you were before the `*` moved you. `cgn` changes the next search match. You're now in insert mode -- type the replacement, press `jk`. From here, pressing `.` replaces the next occurrence. `n` skips one. This is surgical find-and-replace where you control every individual instance.

### buffers and windows

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>Tab / Shift+Tab</td><td>Next / previous buffer</td></tr>
<tr><td>Space+x</td><td>Close current buffer without closing the window split</td></tr>
<tr><td>Space+b</td><td>New empty buffer</td></tr>
<tr><td>Space+v</td><td>Split window vertically (new pane to the right)</td></tr>
<tr><td>Space+hs</td><td>Split window horizontally (new pane below)</td></tr>
<tr><td>Space+se</td><td>Make all splits equal size</td></tr>
<tr><td>Space+xs</td><td>Close current split</td></tr>
<tr><td>Ctrl+h/j/k/l</td><td>Move focus between splits (also crosses tmux pane boundaries)</td></tr>
<tr><td>Arrow keys</td><td>Resize the current split</td></tr>
</table>

A buffer is a file loaded in memory. A window is a viewport (split) that shows a buffer. A tab is a whole layout of windows. Most of the time you'll use buffers (Tab/Shift+Tab to cycle). Splits are for keeping a reference visible while you edit in another. Tabs are rare in practice.

The `vim-tmux-navigator` plugin in this config means `Ctrl+h/j/k/l` works seamlessly across both Neovim splits and tmux panes with the same keys. If you use tmux (my other blog covers this), you'll find the navigation becomes completely unified.

### tabs

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>Space+to</td><td>Open new tab</td></tr>
<tr><td>Space+tx</td><td>Close current tab</td></tr>
<tr><td>Space+tn / Space+tp</td><td>Next / previous tab</td></tr>
</table>

---

## telescope, the fuzzy finder for everything

Telescope is probably what you'll use more than any other plugin. It's a fuzzy finder covering files, text search across projects, buffers, git history, LSP symbols, diagnostics, help tags -- everything in one. Think VSCode's command palette but significantly more capable.

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>Space+sf</td><td>Find files by name in the project</td></tr>
<tr><td>Space+sg</td><td>Live grep -- search file contents across the whole project</td></tr>
<tr><td>Space+sw</td><td>Search the word currently under cursor across entire project</td></tr>
<tr><td>Space+sb or Space+Space</td><td>Search open buffers</td></tr>
<tr><td>Space+sm</td><td>Search marks</td></tr>
<tr><td>Space+s. or Space+?</td><td>Recently opened files</td></tr>
<tr><td>Space+sh</td><td>Search Neovim help tags -- this is very useful once you know it exists</td></tr>
<tr><td>Space+sd</td><td>Search all current diagnostics (errors and warnings)</td></tr>
<tr><td>Space+sr</td><td>Resume -- reopen whatever Telescope was last showing</td></tr>
<tr><td>Space+/</td><td>Fuzzy search inside the current buffer only</td></tr>
<tr><td>Space+s/</td><td>Live grep across only your currently open files</td></tr>
<tr><td>Space+sds</td><td>Document symbols -- searchable list of all functions, classes, methods in current file</td></tr>
</table>

Inside any Telescope picker, `Ctrl+j/k` navigate the list, `Ctrl+l` or Enter opens the selection, `Esc` or `q` (in normal mode) closes it.

The three I use constantly: `Space+sf` when I know the filename, `Space+sg` when I know some text inside the file, `Space+sw` on a symbol to see every place it's used across the project. The last one replaces most of what I used "Find All References" for, before LSP's `gr` handles it even better.

`Space+sds` deserves a mention too. In any large file, opening it and typing a function name lets you jump directly to any function or class in the file. Way faster than scrolling.

The git pickers: `Space+gs` opens a diff view of all changed files. `Space+gc` lets you browse commit history and jump into any commit. `Space+gb` for branches.

---

## neotree, the file explorer

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>Space+e</td><td>Toggle sidebar file explorer on the left</td></tr>
<tr><td>Space+w</td><td>Toggle floating file explorer</td></tr>
<tr><td>\</td><td>Reveal current file in the tree (opens neotree focused on the current file)</td></tr>
<tr><td>Space+ngs</td><td>Open git status in a floating neotree window</td></tr>
</table>

Inside neotree, the standard file operations:

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>a</td><td>Add file (supports bash brace expansion: src/{a,b,c}.js creates three files)</td></tr>
<tr><td>A</td><td>Add directory</td></tr>
<tr><td>d</td><td>Delete</td></tr>
<tr><td>r</td><td>Rename</td></tr>
<tr><td>y / x / p</td><td>Copy / cut / paste</td></tr>
<tr><td>Enter or l</td><td>Open file</td></tr>
<tr><td>s</td><td>Open in vertical split</td></tr>
<tr><td>S</td><td>Open in horizontal split</td></tr>
<tr><td>t</td><td>Open in new tab</td></tr>
<tr><td>H</td><td>Toggle hidden files (dotfiles etc.)</td></tr>
<tr><td>/</td><td>Fuzzy find within the tree</td></tr>
<tr><td>z</td><td>Close all expanded nodes</td></tr>
<tr><td>R</td><td>Refresh the tree</td></tr>
<tr><td>i</td><td>Show file details -- size, modified date</td></tr>
<tr><td>[g / ]g</td><td>Jump to previous / next git-modified file in the tree</td></tr>
<tr><td>q</td><td>Close neotree</td></tr>
</table>

---

## LSP, the intelligence layer

LSP is Language Server Protocol. The idea: instead of every editor reimplementing autocomplete, go-to-definition, rename, etc. for every language separately, the editor and the language tool talk over a standardized protocol. The editor handles the UI. The language tool handles the understanding. Neovim is the editor. Language servers (separate programs that run in the background) are the tools. There are language servers for essentially every language.

When you open a Python or JavaScript file, a language server starts in the background and connects to Neovim. You'll see this in the fidget.nvim spinner in the top right corner of the screen. Once connected, Neovim gets real code intelligence for that file.

### mason, the package manager for language servers

Before Mason, you'd install each language server yourself -- npm packages, pip packages, random binaries -- and then manually configure each one. Very painful.

Mason lives inside Neovim and manages all of this. It downloads language servers, formatters, and linters to a single place (`~/.local/share/nvim/mason/`). You can see its UI with `:Mason` to browse and install tools. In this config, `ensure_installed = vim.tbl_keys(servers)` tells mason to auto-install every server defined in the config the first time Neovim opens. You never need to touch `:Mason` manually unless you want to add something new.

The full stack:

<div class="nv-hierarchy">
<div class="nv-h-row">
  <span class="nv-h-icon">📦</span>
  <span class="nv-h-name">Mason</span>
  <span class="nv-h-arrow">→</span>
  <span class="nv-h-desc">downloads and installs the actual binary programs</span>
</div>
<div class="nv-h-row" style="padding-left:32px;">
  <span class="nv-h-icon">🔗</span>
  <span class="nv-h-name">mason-lspconfig</span>
  <span class="nv-h-arrow">→</span>
  <span class="nv-h-desc">bridges installed servers to Neovim's native LSP system</span>
</div>
<div class="nv-h-row" style="padding-left:64px;">
  <span class="nv-h-icon">⚙</span>
  <span class="nv-h-name">nvim-lspconfig</span>
  <span class="nv-h-arrow">→</span>
  <span class="nv-h-desc">provides default metadata (filetypes, binary paths) per server</span>
</div>
<div class="nv-h-row" style="padding-left:32px;">
  <span class="nv-h-icon">🎭</span>
  <span class="nv-h-name">none-ls</span>
  <span class="nv-h-arrow">→</span>
  <span class="nv-h-desc">wraps standalone tools like prettier and stylua as fake LSP sources</span>
</div>
<div class="nv-h-row" style="padding-left:64px;">
  <span class="nv-h-icon">📦</span>
  <span class="nv-h-name">mason-null-ls</span>
  <span class="nv-h-arrow">→</span>
  <span class="nv-h-desc">auto-installs those standalone tools via Mason</span>
</div>
</div>

Formatters like prettier and stylua are not LSP servers -- they're standalone CLI tools that don't speak the LSP protocol at all. `none-ls` wraps them and presents them to Neovim as if they were an LSP. This is how `Ctrl+s` saves and auto-formats -- a `BufWritePre` autocmd calls the formatter before every write.

### LSP keymaps

These only work inside a file where a language server is active. They're registered on `LspAttach` -- an event that fires when a server connects. If `gd` does nothing in a file, run `:LspInfo` to see what's active.

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>gd</td><td>Go to definition -- jump to where this symbol is defined</td></tr>
<tr><td>gr</td><td>Go to references -- list every place this symbol is used (opens in Telescope)</td></tr>
<tr><td>gI</td><td>Go to implementation</td></tr>
<tr><td>gD</td><td>Go to declaration</td></tr>
<tr><td>K</td><td>Hover docs -- shows type, signature, docstring in a popup</td></tr>
<tr><td>Space+D</td><td>Type definition</td></tr>
<tr><td>Space+rn</td><td>Rename symbol across entire project -- every file, every reference, instantly</td></tr>
<tr><td>Space+ca</td><td>Code action -- import suggestions, fix options, extract variable, refactor choices</td></tr>
<tr><td>Space+ds</td><td>Document symbols -- searchable list of all functions and classes in this file</td></tr>
<tr><td>Space+ws</td><td>Workspace symbols -- search symbols across the whole project</td></tr>
<tr><td>[d / ]d</td><td>Jump to previous / next diagnostic (error or warning)</td></tr>
<tr><td>Space+d</td><td>Open floating window showing the full diagnostic message</td></tr>
<tr><td>Space+q</td><td>Send all diagnostics to the quickfix list</td></tr>
<tr><td>Space+do</td><td>Toggle diagnostics on/off for current buffer</td></tr>
</table>

The workflow that replaced most of my VSCode usage: `gd` to jump to a definition, read it, `Ctrl+o` to come back. `K` on any symbol to see its type without leaving the file. `]d` to cycle through errors instead of clicking red squiggles. `Space+ca` on an underlined error to get fix suggestions from the server. `Space+rn` to rename a variable -- it finds every reference in every file and renames them all simultaneously.

When `gr` opens in Telescope you get a searchable list of every usage across the project. You can jump to any one, see the context, come back. `Space+ds` in a large file gives you a searchable function/class index so you can jump to any one directly.

### nvim-cmp, the completion popup

In insert mode, a completion popup appears with suggestions from LSP, snippets, buffer words, and file paths. Navigation in the popup:

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>Ctrl+j / Ctrl+k</td><td>Navigate down / up in suggestions</td></tr>
<tr><td>Tab / Shift+Tab</td><td>Same navigation, or jump between snippet placeholders</td></tr>
<tr><td>Enter</td><td>Confirm and insert the selected suggestion</td></tr>
<tr><td>Ctrl+l / Ctrl+h</td><td>Jump forward / backward through snippet placeholders</td></tr>
<tr><td>Ctrl+c</td><td>Manually trigger completion if popup closed</td></tr>
</table>

### LuaSnip, the snippet engine

LuaSnip handles code snippets -- short trigger words that expand into templates with cursor stops you jump between. It's separate from LSP autocomplete. LSP suggests real symbols from your actual codebase. Snippets expand predefined templates you trigger intentionally.

This config loads `friendly-snippets`, a massive pre-written collection for every major language (React hooks, Python class structures, JS imports, and hundreds more). Plus these custom ones defined specifically in this config:

**C++** -- type `cppm` and Tab in a `.cpp` file. Expands to a full competitive programming template with `#include <bits/stdc++.h>`, `using namespace std;`, and a `main()` with `return 0;`. Cursor lands inside main ready to type.

**Lua** -- type `func` and Tab. Expands to `function name()` with cursor on the name placeholder.

**HTML** -- type `!` and Tab. Expands to a complete HTML5 boilerplate. Cursor lands on the title field first, Tab again jumps into the body.

Snippets have insert nodes -- named cursor stops where you fill in the variable parts. After expanding, each Tab press jumps to the next placeholder. `Ctrl+l` also jumps forward, `Ctrl+h` backward. When you've filled in the last placeholder, you're done and the snippet is complete.

To add your own: open `lua/plugins/autocompletion.lua`, find the "Custom Snippets" comment, and add:

```lua
luasnip.add_snippets("javascript", {
    s("cl", {             -- trigger: "cl"
        t("console.log("),
        i(1, "value"),    -- cursor stop 1, default text "value"
        t(");"),
    }),
})
```

`s` creates the snippet, `t` is static text, `i` is a cursor stop with optional default. A table inside `t()` is multi-line: `t({"line one", "line two"})`. `i(0)` is always the final cursor position.

---

## gitsigns, inline git diffs

Before this plugin I was running `git diff` constantly in the terminal to check what I changed. Now it's all inline. Gitsigns adds colored bars in the sign column (the thin strip left of line numbers):

- green bar -- lines added since last commit
- yellow bar -- lines modified
- red symbol -- lines deleted

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>]h / [h</td><td>Jump to next / previous changed hunk</td></tr>
<tr><td>Space+hp</td><td>Preview the diff of the hunk under cursor in a popup</td></tr>
<tr><td>Space+hs</td><td>Stage the hunk under cursor</td></tr>
<tr><td>Space+hr</td><td>Reset the hunk under cursor back to HEAD</td></tr>
<tr><td>Space+hS / Space+hR</td><td>Stage or reset the entire buffer</td></tr>
<tr><td>Space+hu</td><td>Undo the last stage operation</td></tr>
<tr><td>Space+hb</td><td>Show full git blame for current line in a popup</td></tr>
<tr><td>Space+tb</td><td>Toggle inline blame annotation on every line</td></tr>
<tr><td>Space+hd</td><td>Diff current file against HEAD</td></tr>
<tr><td>Space+td</td><td>Toggle showing deleted lines preview inline</td></tr>
</table>

`]h` / `[h` for jumping between hunks is particularly useful -- you can cycle through every change you made in a file without scrolling. For actual commits and push, `Space+lg` opens lazygit in a floating terminal. The full git TUI is easier for writing commit messages and resolving merge conflicts.

---

## harpoon, instant file switching

Harpoon solves a specific problem: you're always working with 3 or 4 files at any given moment in a task. Telescope is great for finding files cold. But once you know which files you need, opening Telescope every time adds friction. Harpoon lets you pin those files and jump to them with one keystroke.

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>Space+Ha</td><td>Add current file to the harpoon list</td></tr>
<tr><td>Space+Hh</td><td>Open harpoon menu -- navigate with j/k, Enter to jump, reorder files</td></tr>
<tr><td>Space+H1 through Space+H4</td><td>Jump directly to harpooned file 1, 2, 3, or 4</td></tr>
<tr><td>Space+Hn / Space+Hp</td><td>Cycle to next / previous harpooned file</td></tr>
</table>

Typical workflow: start a task, open your main files, `Space+Ha` on each one. Main implementation on slot 1, test file on slot 2, related module on slot 3. Jumping between them is now a single chord. This is one of those plugins where after a week you can't imagine not having it.

---

## nvim-surround, wrapping pairs

This handles surrounding pairs -- quotes, brackets, parens, HTML tags -- without manually navigating to both ends of a selection.

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>ysiw"</td><td>Wrap word under cursor in double quotes</td></tr>
<tr><td>ysiw(</td><td>Wrap word in parentheses (with spaces: ( word ))</td></tr>
<tr><td>ysiw)</td><td>Wrap word in parentheses (tight: (word))</td></tr>
<tr><td>ysip&lt;div&gt;</td><td>Wrap current paragraph in div tags</td></tr>
<tr><td>yss"</td><td>Wrap entire line in quotes</td></tr>
<tr><td>cs"'</td><td>Change surrounding double quotes to single quotes</td></tr>
<tr><td>cs'`</td><td>Change single quotes to backticks</td></tr>
<tr><td>cst&lt;p&gt;</td><td>Change surrounding HTML tag to p tag</td></tr>
<tr><td>ds"</td><td>Delete surrounding double quotes</td></tr>
<tr><td>ds(</td><td>Delete surrounding parentheses</td></tr>
<tr><td>dst</td><td>Delete surrounding HTML tag</td></tr>
<tr><td>S" (visual mode)</td><td>Surround the visual selection in double quotes</td></tr>
</table>

`ys` means "you surround" -- add surroundings. `cs` means "change surround." `ds` means "delete surround." Once those three prefixes are in muscle memory you stop thinking about individual commands and just describe what you want. "Change the surrounding tag to a div" is `cst<div>`. This comes up constantly in HTML and JSX work.

---

## treesitter navigation

Beyond syntax highlighting, the treesitter setup in this config adds navigation motions that understand code structure:

<table class="nv-keytable">
<tr><th>Key</th><th>What it does</th></tr>
<tr><td>]m / [m</td><td>Jump to start of next / previous function</td></tr>
<tr><td>]M / [M</td><td>Jump to end of next / previous function</td></tr>
<tr><td>]] / [[</td><td>Jump to start of next / previous class</td></tr>
<tr><td>][ / []</td><td>Jump to end of next / previous class</td></tr>
<tr><td>Space+a</td><td>Swap current parameter with the next one</td></tr>
<tr><td>Space+A</td><td>Swap current parameter with the previous one</td></tr>
</table>

These use the actual syntax tree, not pattern matching. `]m` finds the next real function declaration in whatever language you're in, not just a line that looks like one. Combined with `{`/`}` for block-level navigation and `f`/`t` for line-level, you have navigation at every useful granularity.

---

## search and replace, bulk editing

The substitute command replaces text with a pattern. The full form: `:%s/pattern/replacement/flags`.

<table class="nv-keytable">
<tr><th>Command</th><th>What it does</th></tr>
<tr><td>:s/old/new/</td><td>Replace first match on current line</td></tr>
<tr><td>:s/old/new/g</td><td>Replace all matches on current line</td></tr>
<tr><td>:%s/old/new/g</td><td>Replace all matches in entire file</td></tr>
<tr><td>:%s/old/new/gc</td><td>Replace all, confirm each one</td></tr>
<tr><td>:%s/old/new/gi</td><td>Replace all, case insensitive</td></tr>
<tr><td>:'<,'>s/old/new/g</td><td>Replace in visual selection (auto-fills when you type : from visual)</td></tr>
<tr><td>:5,20s/old/new/g</td><td>Replace between lines 5 and 20</td></tr>
<tr><td>:%s/\&lt;word\&gt;/new/g</td><td>Replace whole word only (won't touch "wordpart")</td></tr>
</table>

This config has `inccommand = "split"` set. As you type a `:s` command, a preview split appears at the bottom of the screen showing exactly what will change before you confirm. You see the old and new text highlighted in real-time. Once you use this, going back to blind substitution feels wrong.

### the global command

`:g/pattern/command` runs any normal mode command on every line matching a pattern. It's a force multiplier.

```vim
:g/console.log/d        " delete every line containing console.log
:g/^$/d                 " delete all blank lines in the file
:g/TODO/normal! >>      " indent every TODO line by one level
:g/import/y A           " append every import line to register A
```

You use it maybe once a week but when you need it nothing else comes close.

### the quickfix list and project-wide replace

When Telescope's live grep (`Space+sg`) is open and you press `Ctrl+q` inside it, all the current matches get sent to the quickfix list -- a persistent list of file locations. `:copen` to see it, `:cclose` to close it, `:cnext`/`:cprev` to navigate.

The power move: `Space+sg` to search something across the project, `Ctrl+q` to send all matches to quickfix, then `:cdo s/old/new/g` to run the substitution on every matched file. Project-wide refactor in four keystrokes. This replaced my usage of VSCode's "Replace in Files" entirely.

---

## the options this config sets

Reading through the config is how you build intuition for what's possible. Here's what every setting in `core/options.lua` actually does and why it's there:

`relativenumber = true` -- line distances instead of absolute numbers. Makes count-prefixed jumps natural. Without this, `5j` means counting in your head. With it, you just look.

`scrolloff = 8` -- always keep 8 lines visible above and below the cursor. The cursor never gets stranded at the very edge of the screen where you lose context.

`inccommand = "split"` -- live preview for substitute commands. See changes before confirming. One of the best options in Neovim and off by default.

`undofile = true` -- undo history is written to disk and persists across sessions. You can close a file, come back tomorrow, and still undo yesterday's changes. Just works, no action needed.

`smartcase` with `ignorecase` together -- searches are case-insensitive until you type a capital letter, then case-sensitive. Almost always the right behavior.

`swapfile = false` -- no `.swapfile` created. You have persistent undo and git. Swap files are unnecessary and create the "already open, recover?" popup annoyance.

`foldmethod = "expr"` with `foldexpr = "nvim_treesitter#foldexpr()"` -- treesitter-based code folding. `za` toggles a fold, `zM` closes all, `zR` opens all. The config sets `foldenable = false` so files open unfolded, but you can fold manually any time.

`list = true` with `listchars = { trail = "·", tab = "» " }` -- shows trailing spaces as visible dots. You'll notice them and clean them up. Stops accidentally committing whitespace issues.

`updatetime = 250` -- how long Neovim waits idle before triggering `CursorHold` events. Lower value means diagnostics and hover docs respond faster. Default is 4000ms which feels slow.

`timeoutlen = 300` -- window for completing a multi-key leader sequence. If you accidentally trigger sequences too easily, bump this to 400.

`expandtab = true` with `tabstop = 4` and `shiftwidth = 4` -- Tab key inserts 4 spaces. Consistent indentation. `vim-sleuth` (also in this config) overrides this per-file based on what the file already uses, so you always match existing code style automatically.

---

## things I wish I had known earlier

**`:help` is actually good.** Use `Space+sh` to open Telescope's help search and type anything. The built-in documentation covers every option, every key, every function. When something doesn't work as expected, `:help` is usually faster than googling.

**`Ctrl+o` and `Ctrl+i` are your back/forward buttons.** Navigate code like web pages. `gd` to jump somewhere, `Ctrl+o` to come back, `Ctrl+i` to go forward. I use this all day. The jump list is automatic -- you don't manage it, just use it.

**`:LspInfo` is for debugging LSP issues.** If `gd` or `K` don't work in a file, run `:LspInfo`. It shows which servers are attached, whether they started correctly, what root directory they resolved. Most LSP problems are either the server not being installed or the wrong root directory, and `:LspInfo` tells you which.

**`:checkhealth` is the system diagnostic.** Run it and get a full health report of every component. If something feels broken, this is the first command.

**`:messages` recovers error output.** When an error flashes at the bottom and disappears before you read it, `:messages` has the full text.

**The first week is genuinely slower.** Things that took one second in VSCode take five seconds in Neovim while you're still thinking about which key to press. This is completely normal. The learning curve is real. The payoff comes in week two when muscle memory starts forming and you stop consciously thinking about keys. By week three, going back to VSCode for anything feels like regression. Commit to two actual weeks of daily use before making any judgments.

---

## quick reference

<div class="nv-cs-grid">

<div class="nv-cs-card">
<h4>modes</h4>
<div class="nv-cs-item"><span class="k">i a o O I A</span><span class="d">enter insert</span></div>
<div class="nv-cs-item"><span class="k">jk</span><span class="d">exit insert</span></div>
<div class="nv-cs-item"><span class="k">v V Ctrl+v</span><span class="d">visual modes</span></div>
<div class="nv-cs-item"><span class="k">:</span><span class="d">command mode</span></div>
</div>

<div class="nv-cs-card">
<h4>navigation</h4>
<div class="nv-cs-item"><span class="k">w b e W B E</span><span class="d">word motion</span></div>
<div class="nv-cs-item"><span class="k">{ }</span><span class="d">paragraph jump</span></div>
<div class="nv-cs-item"><span class="k">gg G 0 ^ $</span><span class="d">extremes</span></div>
<div class="nv-cs-item"><span class="k">f{c} t{c} ; ,</span><span class="d">find on line</span></div>
<div class="nv-cs-item"><span class="k">Ctrl+d / Ctrl+u</span><span class="d">scroll half page</span></div>
<div class="nv-cs-item"><span class="k">Ctrl+o / Ctrl+i</span><span class="d">jump list back / fwd</span></div>
</div>

<div class="nv-cs-card">
<h4>operators + objects</h4>
<div class="nv-cs-item"><span class="k">d c y > < gc gU gu</span><span class="d">operators</span></div>
<div class="nv-cs-item"><span class="k">iw i" i( i{ if ia</span><span class="d">inner objects</span></div>
<div class="nv-cs-item"><span class="k">aw a" a( a{</span><span class="d">around objects</span></div>
<div class="nv-cs-item"><span class="k">.</span><span class="d">repeat last change</span></div>
<div class="nv-cs-item"><span class="k">u / Ctrl+r</span><span class="d">undo / redo</span></div>
<div class="nv-cs-item"><span class="k">"0p</span><span class="d">paste from yank register</span></div>
</div>

<div class="nv-cs-card">
<h4>search</h4>
<div class="nv-cs-item"><span class="k">/pat ?pat</span><span class="d">search fwd / bwd</span></div>
<div class="nv-cs-item"><span class="k">n N</span><span class="d">next / prev match</span></div>
<div class="nv-cs-item"><span class="k">* #</span><span class="d">search word under cursor</span></div>
<div class="nv-cs-item"><span class="k">Space+j then .</span><span class="d">interactive replace</span></div>
<div class="nv-cs-item"><span class="k">:%s/a/b/gc</span><span class="d">substitute with preview</span></div>
</div>

<div class="nv-cs-card">
<h4>telescope</h4>
<div class="nv-cs-item"><span class="k">Space+sf</span><span class="d">find file</span></div>
<div class="nv-cs-item"><span class="k">Space+sg</span><span class="d">grep file contents</span></div>
<div class="nv-cs-item"><span class="k">Space+sw</span><span class="d">search word under cursor</span></div>
<div class="nv-cs-item"><span class="k">Space+sd</span><span class="d">search diagnostics</span></div>
<div class="nv-cs-item"><span class="k">Space+sds</span><span class="d">document symbols</span></div>
<div class="nv-cs-item"><span class="k">Space+/</span><span class="d">search current buffer</span></div>
</div>

<div class="nv-cs-card">
<h4>lsp</h4>
<div class="nv-cs-item"><span class="k">gd</span><span class="d">go to definition</span></div>
<div class="nv-cs-item"><span class="k">gr</span><span class="d">go to references</span></div>
<div class="nv-cs-item"><span class="k">K</span><span class="d">hover docs</span></div>
<div class="nv-cs-item"><span class="k">Space+rn</span><span class="d">rename symbol</span></div>
<div class="nv-cs-item"><span class="k">Space+ca</span><span class="d">code action</span></div>
<div class="nv-cs-item"><span class="k">]d / [d</span><span class="d">next / prev error</span></div>
</div>

<div class="nv-cs-card">
<h4>git + harpoon</h4>
<div class="nv-cs-item"><span class="k">]h / [h</span><span class="d">next / prev hunk</span></div>
<div class="nv-cs-item"><span class="k">Space+hp / hs / hr</span><span class="d">preview / stage / reset</span></div>
<div class="nv-cs-item"><span class="k">Space+tb</span><span class="d">toggle line blame</span></div>
<div class="nv-cs-item"><span class="k">Space+lg</span><span class="d">open lazygit</span></div>
<div class="nv-cs-item"><span class="k">Space+Ha</span><span class="d">harpoon add file</span></div>
<div class="nv-cs-item"><span class="k">Space+H1..4</span><span class="d">jump to pinned file</span></div>
</div>

<div class="nv-cs-card">
<h4>surround + misc</h4>
<div class="nv-cs-item"><span class="k">ysiw"</span><span class="d">surround word in quotes</span></div>
<div class="nv-cs-item"><span class="k">cs"'</span><span class="d">change surrounding</span></div>
<div class="nv-cs-item"><span class="k">ds( / dst</span><span class="d">delete surrounding</span></div>
<div class="nv-cs-item"><span class="k">]m / [m</span><span class="d">next / prev function</span></div>
<div class="nv-cs-item"><span class="k">Space+a / Space+A</span><span class="d">swap parameters</span></div>
<div class="nv-cs-item"><span class="k">Alt+j / Alt+k</span><span class="d">move line up / down</span></div>
</div>

</div>

</div>
