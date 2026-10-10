---
title: "04 : CSS Foundations - The Box Model, Flexbox, Grid and Responsive Design"
date: 2026-10-06T10:00:00+05:30
draft: false
tags: ["css", "flexbox", "grid", "responsive"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 400
description: "The cascade, the box model, units, Flexbox, Grid, mobile first responsive design, variables and dark mode, with three real layouts to build."
aliases: ["/posts/css-foundations/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

My Blogger sites never got AdSense approval, and I never knew why. Years later I know that page quality is part of the answer, and quality starts with layout, readability and speed on a phone. All of that is CSS.

CSS decides how HTML looks: spacing, color, layout, and how a page adapts from a phone to a wide screen. You do not need hundreds of properties. Seven ideas cover most of the work: the cascade, the box model, units, Flexbox, Grid, responsive design, and variables.

> **Where we are:** Pages with structure and no style. After this post they look right on every screen size.
>
> **Phase 01** · Web foundations · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** the cascade, the box model, units, Flexbox, Grid, responsive design, variables and dark mode.  
> **Not today:** Utility frameworks like Tailwind, and animation libraries. We write plain CSS first.
>
> **Time:** about 25 minutes to read, 50 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, list five HTML tags and what each one is for.

<details>
<summary>Prereqs to run this file</summary>

- The article page and the forms from the HTML post, open in VS Code with Live Server.
- A file named `style.css` next to `index.html`, linked in the `head` with `<link rel="stylesheet" href="style.css" />`.
- Chrome DevTools (F12). You will use it constantly in this post.

</details>

## Part 1 of 7: How CSS finds your HTML, and who wins

A CSS rule has a **selector** (what to style) and **declarations** (how):

```css
h1 {
  color: #0f172a;
  font-size: 2rem;
}
```

Selectors you will use every day:

```css
p { }                 /* every p */
.card { }             /* every element with class="card" */
#hero { }             /* the one element with id="hero" */
.card p { }           /* any p inside .card */
.card > p { }         /* only direct child p */
a:hover { }           /* when the mouse is over a link */
input:focus-visible { } /* when keyboard focus lands on an input */
li:first-child { }    /* the first li in its parent */
```

When two rules disagree, the browser picks a winner. This is the **cascade**, and it has three steps:

1. **Specificity.** More specific selectors win: inline `style` beats `#id`, which beats `.class` (and pseudo-classes), which beats a plain element like `p`.
2. **Order.** If specificity ties, the rule written later wins.
3. **Inheritance.** Some properties (text color, font) pass down to children. Others (margin, padding, border) do not.

Rule of thumb: style with **classes**, keep selectors short, and avoid `!important`. It is not forbidden, but every `!important` is a future fight with yourself.

> Checkpoint: add `.title { color: crimson; }` and give your `h1` `class="title"`. You should see the heading turn crimson even though you also have an `h1 { color: ... }` rule, because a class beats an element selector. Open DevTools, click the heading, and look at the Styles panel: the losing rule is crossed out.

## Part 2 of 7: The box model: the one idea behind all spacing

Every element is a box with four layers, from inside out: **content**, **padding** (space inside), **border**, and **margin** (space outside).

```css
.card {
  padding: 1rem;          /* space between content and border */
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;       /* space between this box and its neighbors */
}
```

There is one line almost every project starts with, because without it widths behave strangely (padding is added on top of width):

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

With `border-box`, a `width: 300px` box is 300px wide including padding and border. It is the sane default.

Also useful:

- `display: block | inline | inline-block | none`. Block takes the full width, inline sits in text, `none` removes the element.
- Vertical margins between neighbors **collapse**: a `margin-bottom: 24px` above a `margin-top: 16px` gives 24px, not 40px. Flexbox and Grid children do not collapse, which is one reason to use them.
- `overflow: auto` adds a scrollbar when content is bigger than the box.

> Checkpoint: in DevTools, hover any element and click it. In the Computed tab you should see a box diagram with the exact content, padding, border and margin sizes. When spacing looks wrong, this diagram tells you which layer is responsible.

## Part 3 of 7: Units, color and type

Units trip people up. Here is the short guide:

| Unit | Relative to | Use it for |
| ---- | ----------- | ---------- |
| `px` | the screen pixel | borders, thin lines, shadows |
| `rem` | the root font size (usually 16px) | font sizes and spacing |
| `em` | the current element's font size | padding that should scale with its text |
| `%` | the parent | widths inside a container |
| `vw`, `vh` | the viewport width and height | full screen sections |
| `ch` | width of the "0" character | limiting line length |

Using `rem` means users who raise their browser font size get a page that scales with them, which is an accessibility win for free.

Colors: hex (`#2563eb`), `rgb(37 99 235)`, or `hsl(221 83% 53%)`. HSL is the easiest to reason about: hue, saturation, lightness. To make a color darker, lower the lightness.

Readable text is mostly three declarations:

```css
body {
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.6;
  color: #0f172a;
}

article {
  max-width: 65ch;  /* about 65 characters per line is easiest to read */
  margin-inline: auto;
}
```

A system font stack loads instantly because the font is already on the device. If you add web fonts later, each one costs loading time, so choose carefully.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Flexbox: layout in one direction*.

## Part 4 of 7: Flexbox: layout in one direction

Flexbox lays children out in a row or a column. Turn it on with `display: flex` on the **parent**:

```css
.nav {
  display: flex;
  justify-content: space-between; /* along the main axis (row by default) */
  align-items: center;            /* across the other axis */
  gap: 1rem;
}
```

The properties you will use 95% of the time:

- `flex-direction: row | column`
- `justify-content`: `flex-start`, `center`, `space-between`, `space-around`
- `align-items`: `stretch`, `center`, `flex-start`
- `gap`: space between children (no more margin hacks)
- `flex-wrap: wrap`: let children drop to the next line
- On a child: `flex: 1` makes it grow to fill leftover space

The classic: centering anything, horizontally and vertically.

```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

> Checkpoint: apply the `.nav` rule to the nav in your HTML article page. The three links should sit in one row, spread across the width, vertically centered.

## Part 5 of 7: Grid: layout in two dimensions

Use Grid when you care about rows **and** columns, like a card list or a page layout.

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
```

Read that one line aloud: "make as many columns as fit, each at least 240px wide, sharing leftover space equally." It gives you a fully responsive card grid with **no media queries**. On a phone you get one column, on a laptop three or four.

When do you pick which?

| Question | Use |
| -------- | --- |
| A row of things, like a navbar or a button group? | Flexbox |
| Content decides the size, and you want it to flow? | Flexbox |
| A grid of cards, a dashboard, a page with a sidebar? | Grid |
| Unsure? | Start with Grid for the page, Flexbox inside each piece |

## Part 6 of 7: Responsive design: mobile first

Most visitors are on a phone. So write the **phone layout first**, then add rules for wider screens.

```css
.layout {
  display: grid;
  gap: 1rem;                 /* phone: single column */
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 2fr 1fr;   /* tablet and up: main plus sidebar */
  }
}
```

Three habits make most pages responsive:

- Images never overflow: `img { max-width: 100%; height: auto; }`
- Use fluid sizes: `font-size: clamp(1.5rem, 4vw, 2.5rem);` picks a size between a minimum and a maximum.
- Test with DevTools: click the device icon (Ctrl+Shift+M) and drag the width from 320px up to 1200px.

Common breakpoints are about 640px, 768px and 1024px. You do not need more than three.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Variables, states and motion*.

## Part 7 of 7: Variables, states and motion

CSS variables let you define a color or size once and reuse it everywhere. They also make dark mode almost trivial:

```css
:root {
  --bg: #ffffff;
  --text: #0f172a;
  --brand: #2563eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b1220;
    --text: #e2e8f0;
    --brand: #60a5fa;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}

a {
  color: var(--brand);
}
```

Interactive states and transitions make a page feel alive:

```css
.btn {
  background: var(--brand);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.btn:hover { transform: translateY(-1px); }
.btn:focus-visible { outline: 3px solid var(--brand); outline-offset: 2px; }
```

Never remove the focus outline without replacing it. Keyboard users need to see where they are.

Positioning, in one paragraph: `position: relative` lets you nudge an element and anchors absolutely positioned children. `absolute` places an element relative to its nearest positioned ancestor. `sticky` makes an element stick when you scroll past it (perfect for a header: `position: sticky; top: 0;`). `fixed` pins it to the screen. Use `z-index` only on positioned elements, and keep the numbers small.

> Checkpoint: switch your operating system or browser to dark mode (or use DevTools, Rendering tab, "Emulate prefers-color-scheme"). Your page should flip colors with no JavaScript.

## Patterns I follow

- **Classes, not tags or ids,** for styling. They are reusable and low in specificity.
- **Start mobile first,** then add `min-width` queries.
- **Variables for anything repeated:** colors, spacing, radii.
- **Flexbox inside, Grid outside.** Grid for the page structure, Flexbox for the parts.
- **Do not fight the browser.** If you need ten lines to move a box, the structure is probably wrong.
- **DevTools before Google.** Toggle a property on and off to see what it does.

## Solo rep: Rebuild the card grid

> **Level 2: Peek once.** Read the code once, hide it, and type it from memory. Peek again only when stuck. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

Peek at the card grid project once, hide it, and rebuild it: six post cards that show one column on phones and fill the screen with as many columns as fit, with a hover shadow and links pinned to the bottom of each card. No media queries allowed.

<details>
<summary>Check yourself, only after you try</summary>

Check yourself:

- `display: grid` with `repeat(auto-fit, minmax(240px, 1fr))`
- Each card is a flex column, and the link has `margin-top: auto`
- `box-sizing: border-box` is set globally
- No `@media` rule anywhere in the file

</details>

## Projects

### 1. Style the article page

Style the blog article page from the HTML post: a readable column, a sticky header with a flex nav, a cover image that never overflows, a footer, and dark mode through variables.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  --bg: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --brand: #2563eb;
  --border: #e2e8f0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b1220;
    --text: #e2e8f0;
    --muted: #94a3b8;
    --brand: #60a5fa;
    --border: #1e293b;
  }
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.6;
}

header {
  position: sticky;
  top: 0;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  max-width: 65ch;
  margin-inline: auto;
  padding: 0.75rem 1rem;
}

a { color: var(--brand); }

main {
  max-width: 65ch;
  margin-inline: auto;
  padding: 1rem;
}

article img { max-width: 100%; height: auto; border-radius: 0.5rem; }

footer {
  text-align: center;
  color: var(--muted);
  padding: 2rem 1rem;
  border-top: 1px solid var(--border);
}
```

Why: variables hold every color, so dark mode only redefines them once. `max-width: 65ch` plus `margin-inline: auto` gives a centered, readable column at any width.

Common mistake: setting `width: 65ch` instead of `max-width`. Then the column cannot shrink on a phone and you get horizontal scrolling.

</details>

### 2. A responsive card grid

Build a list of six blog post cards (title, two lines of text, a "Read more" link) that shows one column on phones and fills the screen with as many columns as fit, without a single media query.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```html
<section class="cards">
  <article class="card">
    <h2>Why I learned Git first</h2>
    <p>Losing a project taught me what history is worth.</p>
    <a href="/posts/git-first/">Read more</a>
  </article>
  <!-- repeat five more times -->
</section>
```

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  transition: box-shadow 0.15s ease;
}

.card:hover { box-shadow: 0 6px 20px rgb(0 0 0 / 0.1); }
.card a { margin-top: auto; }  /* pushes the link to the bottom of every card */
```

Why: Grid builds the columns, Flexbox arranges the inside of each card, and `margin-top: auto` on the link keeps links aligned across cards of different text length.

Common mistake: using `auto-fill` and wondering why cards do not stretch. `auto-fit` collapses empty tracks so the cards expand.

</details>

### 3. The pricing section of a SaaS page

Style three pricing cards (Free, Pro, Team), with the Pro card visually highlighted. On phones they stack, from 768px up they sit side by side.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```html
<section class="pricing">
  <div class="plan">
    <h3>Free</h3>
    <p class="price">$0</p>
    <ul><li>1 blog</li><li>Community support</li></ul>
    <a class="btn" href="/signup">Start free</a>
  </div>
  <div class="plan featured">
    <h3>Pro</h3>
    <p class="price">$12<span>/month</span></p>
    <ul><li>Unlimited blogs</li><li>Custom domain</li></ul>
    <a class="btn" href="/signup?plan=pro">Go Pro</a>
  </div>
  <div class="plan">
    <h3>Team</h3>
    <p class="price">$40<span>/month</span></p>
    <ul><li>Everything in Pro</li><li>5 seats</li></ul>
    <a class="btn" href="/signup?plan=team">Start a team</a>
  </div>
</section>
```

```css
.pricing { display: grid; gap: 1rem; padding: 1rem; }

@media (min-width: 768px) {
  .pricing { grid-template-columns: repeat(3, 1fr); align-items: center; }
}

.plan {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 1px solid var(--border);
  border-radius: 1rem;
}

.plan.featured {
  border-color: var(--brand);
  box-shadow: 0 10px 30px rgb(37 99 235 / 0.2);
  transform: scale(1.03);
}

.price { font-size: 2.25rem; font-weight: 700; margin: 0; }
.price span { font-size: 1rem; font-weight: 400; color: var(--muted); }
```

Why: mobile first means the grid is one column by default, and the media query only adds columns. Highlighting one plan is a classic conversion trick, and it is only a border, a shadow and a slight scale.

Common mistake: using `width: 33%` on cards and then adding gaps. The total goes over 100% and the last card wraps. `repeat(3, 1fr)` shares space after the gaps.

</details>

## Cheat sheet

- Specificity: inline, then `#id`, then `.class`, then element. Ties go to the later rule
- `*, *::before, *::after { box-sizing: border-box; }` first, always
- `rem` for type and spacing, `%` inside containers, `ch` for line length
- Flexbox for one direction: `display:flex; justify-content; align-items; gap`
- Grid for two: `repeat(auto-fit, minmax(240px, 1fr))` is a responsive grid with no media query
- Mobile first: base styles for phones, `@media (min-width: 768px)` for more
- Variables on `:root`, dark mode through `prefers-color-scheme`
- Never remove `:focus-visible` outlines without replacing them

## If lost / If bored

- If lost: a style that "does not apply" usually loses on specificity. Open DevTools, click the element, and look for your rule crossed out in the Styles panel. A page that scrolls sideways has something wider than the screen, often an image without `max-width: 100%`.
- If bored: rebuild the layout of a site you like using only DevTools to inspect it, then recreate it from scratch with Grid and Flexbox.
- Keep for next: the article page and the card grid. Later we meet Tailwind, which is these same ideas written as small utility classes.

## What breaks next

The pages look right but do nothing. Something has to make them react to people.

[Where we are and what is next](../progress/)
