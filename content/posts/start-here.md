---
title: "Start Here: How This Series Works"
date: 2026-10-06T09:00:00+05:30
draft: false
tags: ["start", "guide"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 10
description: "What this series is, who it is for, how to move through it without getting overwhelmed, and how the solo reps train you to code by hand."
cover:
  image: ""
  alt: ""
  caption: ""
---

I learned most of this alone, by breaking things and fixing them. I never had a guide who could tell me what to learn next, and I lost a lot of time on things that did not matter. This series is the guide I wished I had: one source, in a sensible order, that takes you from a blank folder to a product you can ship.

## What we build

A **blog platform**. Authors sign up, write posts, readers browse them, and an admin sees stats. We grow it step by step, and later we build a second project (a wallet app) where correctness matters because money moves. Every post adds a real piece, so nothing is a disconnected demo.

## Where things are

The whole plan lives on one page: [Where I Am: Phase 01 Progress](../progress/). It shows what is published, what is next, and what is still planned. When the plan changes, only that page changes, and every post links to it.

## How to move through it without getting overwhelmed

- **One post per sitting.** The top of each post tells you the time it needs.
- **Do the warm-up.** Three minutes recalling the last post is the cheapest way to remember it.
- **Follow the checkpoints.** After each part, a Checkpoint line says what you should see. If you do not see it, stop and fix it before moving on.
- **Stop at the pause points.** *Good place to stop* lines mean leaving there is pacing, not quitting.
- **Never skip the solo rep.** That is where it becomes yours.
- **Commit after every post.** Git is your undo button.

## The hand-code ladder

The goal is that by the end you can build the basics by hand without looking anything up. The solo reps climb a ladder, so the training wheels come off slowly:

| Level | What you do | Where it starts |
| ----- | ----------- | --------------- |
| 1. Copy-type | Type every line yourself while looking at the code | Terminal, Git, HTML, JavaScript |
| 2. Peek once | Read once, hide it, type it from memory | CSS, backend, MongoDB |
| 3. Spec only | You get a sentence, no code | React core, routing, shared state |
| 4. Blank page | One line of goal, an empty file, your own plan | Tailwind, Redux, custom hooks |
| 5. From memory | Rebuild a core piece with no references | TypeScript, and everything after |

Some solo reps are **boss rebuilds**: you rebuild a whole piece from a blank folder against the clock. The first one is at the end of the auth post. If you finish it in under 30 minutes, you are becoming someone who codes by hand.

## The rules I follow in every post

- Titles carry a number for readability, and `weight` (100, 200, 300 and so on) sets the real order, so a new post can slot in anywhere. Posts link to each other by name and never depend on a number or a total.
- Every tool is checked against its current version before I write about it, and the version is named.
- If something is deprecated, I say so and teach the maintained option first.
- Code that is labeled a full file is meant to run exactly as written.

*Last updated: October 2026.*
