---
title: "03 : HTML Foundations - Structure, Forms and the Accessibility Basics"
date: 2026-10-06T10:00:00+05:30
draft: false
tags: ["html", "forms", "accessibility", "seo"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 300
description: "Set up VS Code, then learn the tags behind almost every page: semantic layout, forms, tables, media, and the accessibility and SEO basics."
aliases: ["/posts/html-foundations/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

I built a few Blogger sites before I understood what a web page is made of. They worked, but when something broke I could not fix it, because I did not know the parts. HTML is the part list.

HTML does not make things move or look good. It says **what each piece is**: a heading, a link, a form. Get that right and CSS, JavaScript, search engines and screen readers all behave better. This post covers the tags that appear on almost every real page, forms (every SaaS runs on forms), and the accessibility and SEO basics most tutorials skip.

> **Where we are:** A folder under Git and an empty editor. After this post you can describe any page's structure.
>
> **Phase 01** · Web foundations · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** the page skeleton, core tags, semantic layout, links, forms, tables, accessibility and SEO basics.  
> **Not today:** Styling (that is CSS) and behavior (that is JavaScript). Here we only describe structure.
>
> **Time:** about 25 minutes to read, 45 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, write the commands to make a folder `site`, go into it, and create an `index.html`.

<details>
<summary>Prereqs to run this file</summary>

- A browser (Chrome, Edge or Firefox) and the `blog-platform` folder from the Git post.
- VS Code from code.visualstudio.com. The first part sets it up.
- Nothing else. HTML needs no install and no server.

</details>

## Part 1 of 8: Set up your editor in 5 minutes

You will spend thousands of hours in your editor, so ten minutes of setup pays back fast.

1. Install **VS Code** and open your folder with `code .` from the terminal.
2. Install three extensions: **Prettier** (formats on save), **Live Server** (reloads the browser when you save), and **Error Lens** (shows errors inline).
3. Turn on format on save: Settings, search "format on save", tick it, and set Prettier as the default formatter.
4. Learn six shortcuts: `Ctrl+P` opens a file by name, `Ctrl+Shift+P` opens the command palette, `Ctrl+D` selects the next match, `Alt+Up` or `Alt+Down` moves a line, `Ctrl+/` comments a line, `Ctrl+B` toggles the sidebar. On Mac use Cmd and Option.
5. Learn **Emmet**. In an empty `.html` file type `!` then Tab for a full page skeleton. Type `ul>li*3` then Tab for a list of three items.

> Checkpoint: you should see a full HTML skeleton appear when you type `!` and press Tab in a new `index.html`, and your code reformat itself when you save.

## Part 2 of 8: The anatomy of every page

Every HTML page, from a blog post to a banking dashboard, has the same skeleton:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Blog</title>
    <meta name="description" content="A blog about building things from scratch." />
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>Hello, blog</h1>
  </body>
</html>
```

What each line is doing:

- `<!DOCTYPE html>` tells the browser to use modern rules. Without it, browsers fall back to old quirks.
- `lang="en"` helps screen readers pick a voice and browsers offer translation.
- `charset` makes accents, symbols and non-English text show correctly.
- `viewport` is the line that makes a page work on phones. Without it, a phone shows a tiny zoomed-out desktop page.
- `<title>` is the browser tab text and the blue link in search results.
- `description` is the grey text under that link.
- **head** holds information about the page. **body** holds what people see.

> Checkpoint: right click `index.html` in VS Code, choose Open with Live Server, and you should see "Hello, blog" with the tab titled "My Blog". Edit the heading and save: the browser updates by itself.

## Part 3 of 8: The tags that make up most pages

You do not need 100 tags. About 25 cover nearly everything. Here are the core ones in a real article:

```html
<h1>Why I Learned Git First</h1>
<p>Posted by <strong>Eshan</strong> on <time datetime="2026-10-08">8 October 2026</time></p>
<img src="cover.jpg" alt="A terminal window showing a git log" width="800" height="400" />
<h2>The short version</h2>
<p>I lost a project once. <em>Never again.</em></p>
<ul>
  <li>History</li>
  <li>Branches</li>
  <li>Backup</li>
</ul>
<a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
```

Rules that save you later:

- **One `h1` per page,** and do not skip levels (`h1`, then `h2`, then `h3`). Headings are an outline, not a font size. Use CSS for size.
- **Every image needs `alt` text** that says what the image is for. If it is pure decoration, use `alt=""`.
- **Add `width` and `height` to images.** The browser reserves the space, so the page does not jump while loading.
- **`target="_blank"` needs `rel="noopener noreferrer"`,** or the new page can control the old one.
- `strong` means important, `em` means emphasis. They are meaning, not styling.

Two kinds of elements trip up every beginner:

| Kind | Behavior | Examples |
| ---- | -------- | -------- |
| Block | Starts a new line and takes the full width | `div`, `p`, `h1` to `h6`, `ul`, `section` |
| Inline | Sits inside a line of text | `span`, `a`, `strong`, `em`, `img` |

`div` is a generic block box, `span` is a generic inline box. Use them only when no better tag exists.

> Try it yourself: build a page with one `h1`, two paragraphs, a three item list, an image with alt text, and a link that opens in a new tab safely.

<details>
<summary>Solution</summary>

```html
<h1>My Reading List</h1>
<p>Books I want to finish this year.</p>
<p>I read a little every evening.</p>
<ul>
  <li>Automate the Boring Stuff</li>
  <li>Python Crash Course</li>
  <li>Eloquent JavaScript</li>
</ul>
<img src="books.jpg" alt="Three books stacked on a desk" width="400" height="300" />
<a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">MDN docs</a>
```

Why: every rule above appears once. Common mistake: using `<br>` to make space between paragraphs. Space is a CSS job, so use separate `p` tags and style the gap later.

</details>

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Semantic layout: tags that say what a region is*.

## Part 4 of 8: Semantic layout: tags that say what a region is

For layout, beginners reach for `div` everywhere. Professionals reach for **semantic tags** first:

```html
<body>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/posts">Posts</a>
    </nav>
  </header>
  <main>
    <article>
      <h1>Why I Learned Git First</h1>
      <section>
        <h2>The short version</h2>
        <p>...</p>
      </section>
    </article>
    <aside>
      <h2>Related posts</h2>
    </aside>
  </main>
  <footer>
    <p>Built with HTML, no framework.</p>
  </footer>
</body>
```

Why bother, when `div` looks identical? Three real reasons:

1. **Screen readers** let users jump between regions (navigation, main content). With only `div`s, the page is one long wall.
2. **Search engines** understand which part is the article and which is the sidebar.
3. **You** read the code faster, six months later.

A quick rule: `header` and `footer` introduce and close a region, `nav` holds main links, `main` appears once per page, `article` is content that makes sense alone (a blog post), `section` groups related content with a heading, `aside` is side content.

## Part 5 of 8: Links, paths and attributes

Links and images use paths, and these are the same two ideas from the terminal post:

- **Absolute:** `https://example.com/posts` or `/posts` (from the site root). Works from any page.
- **Relative:** `images/cover.jpg` or `../index.html` (from the current file). Moves with your folder.

Other things you will use constantly:

```html
<a href="#comments">Jump to comments</a>   <!-- goes to the element with id="comments" -->
<a href="mailto:hello@example.com">Email me</a>
<div id="comments" class="box" data-post-id="42"></div>
```

- `id` is unique per page, `class` can repeat. CSS and JavaScript find elements with them.
- `data-*` attributes carry small bits of data for JavaScript, like `data-post-id="42"`.
- The `hidden` attribute hides an element until you show it later.

## Part 6 of 8: Forms: where every SaaS actually lives

Signup, login, checkout, settings, search: all forms. Get the HTML right and the browser does half the work for free.

```html
<form action="/signup" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required autocomplete="email" />

  <label for="password">Password</label>
  <input id="password" name="password" type="password" minlength="8" required autocomplete="new-password" />

  <label for="plan">Plan</label>
  <select id="plan" name="plan">
    <option value="free">Free</option>
    <option value="pro">Pro</option>
  </select>

  <label>
    <input type="checkbox" name="terms" required />
    I accept the terms
  </label>

  <button type="submit">Create account</button>
</form>
```

Things worth knowing:

- **`label for` must match the input's `id`.** Clicking the label focuses the input, and screen readers read it aloud.
- **`name` is what gets sent to the server,** not `id`. Forgetting `name` is why a field "disappears" in the request.
- **Input types are free features:** `email` checks the format and shows the right mobile keyboard, `number`, `date`, `password`, `url`, `search`.
- **Built in validation:** `required`, `minlength`, `maxlength`, `min`, `max`, `pattern`.
- A `button` inside a form submits it by default. Write `type="button"` for buttons that should not.
- `method="get"` puts data in the URL (searches). `method="post"` puts it in the body (anything private or that changes data).

Say this out loud once: **browser validation is a convenience for users, never security.** Anyone can skip your form and send a request directly. The server must validate again, which is why we used Zod in the backend posts.

> Checkpoint: submit the form empty and the browser should stop you with a message on the first required field. Type a bad email and it should complain about the format. Both happen with zero JavaScript.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Tables and media*.

## Part 7 of 8: Tables and media

Use `table` for real tabular data (not for layout):

```html
<table>
  <thead>
    <tr><th scope="col">Plan</th><th scope="col">Price</th></tr>
  </thead>
  <tbody>
    <tr><td>Free</td><td>$0</td></tr>
    <tr><td>Pro</td><td>$12 / month</td></tr>
  </tbody>
</table>
```

For media: `<video controls src="demo.mp4"></video>` and `<audio controls src="note.mp3"></audio>` give you players for free. Add `loading="lazy"` to images below the fold so they load only when needed.

## Part 8 of 8: Accessibility and SEO, the minimum that matters

Most tutorials skip this, and it is the cheapest quality jump you can make. It also helps your search ranking and your customers with disabilities, and a product that works for everyone earns more.

Accessibility checklist:

- Every image has `alt`. Every input has a `label`.
- Headings follow a sensible order.
- Text has enough contrast with its background (at least 4.5 to 1 for normal text).
- You can use the whole page with only the keyboard: press Tab and check you can see where the focus is.
- Use a `button` for actions and an `a` for navigation. Not the other way around.

SEO and sharing basics go in `head`:

```html
<title>Why I Learned Git First | My Blog</title>
<meta name="description" content="How losing one project taught me to use Git before writing real code." />
<link rel="canonical" href="https://example.com/posts/git-first/" />
<meta property="og:title" content="Why I Learned Git First" />
<meta property="og:description" content="How losing one project taught me Git." />
<meta property="og:image" content="https://example.com/cover.jpg" />
```

The `og:` tags control the preview card when someone shares your link on social apps and chats.

> Checkpoint: open Chrome DevTools, go to the Lighthouse tab, and run an audit on your page. You should see an Accessibility and SEO score. Aim for 90 or more on both. Fixing what it lists is real learning.

## Patterns I follow

- **Semantic tag first, `div` last.** If a tag exists for the job, use it.
- **Structure in HTML, looks in CSS.** Never choose a heading level because of its size.
- **Label every input,** and give every input a `name`.
- **Test with the keyboard** before you call a page finished.
- **Run Lighthouse** on every page you are proud of. It is a free reviewer.
- **Do not copy a whole page template you do not understand.** Build the skeleton by hand until it is muscle memory.

## Solo rep: Build the page skeleton blind

> **Level 1: Copy-type.** Type every line yourself while looking at the code. No copy paste. The goal is your fingers learning the shapes. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

Do not look at the post. Type an `index.html` with the full skeleton, a `header` with a three link `nav`, a `main` with an `article` (one `h1`, two `h2` sections, a list, an image with alt text), an `aside`, and a `footer`. Then run Lighthouse and aim for 90 or more on accessibility.

<details>
<summary>Check yourself, only after you try</summary>

Check yourself:

- `<!DOCTYPE html>`, `lang`, `charset` and `viewport` are all there
- Exactly one `h1`, and the headings go `h1`, `h2` with no skips
- The image has `alt`, `width` and `height`
- Landmarks: `header`, `nav`, `main`, `article`, `aside`, `footer`

</details>

## Projects

### 1. The semantic article page

Build one blog article page with a header, nav (three links), main, article (title, author and date, cover image, two sections with headings, a list), an aside with related posts, and a footer. No styling yet.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Why I Learned Git First | My Blog</title>
    <meta name="description" content="How losing one project taught me to use Git first." />
  </head>
  <body>
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="/posts.html">Posts</a>
        <a href="/about.html">About</a>
      </nav>
    </header>
    <main>
      <article>
        <h1>Why I Learned Git First</h1>
        <p>By <strong>Eshan</strong>, <time datetime="2026-10-08">8 October 2026</time></p>
        <img src="cover.jpg" alt="A terminal showing a git log" width="800" height="400" />
        <section>
          <h2>What Git gives you</h2>
          <ul>
            <li>History</li>
            <li>Branches</li>
            <li>A remote copy</li>
          </ul>
        </section>
        <section>
          <h2>The first week</h2>
          <p>Three commands cover most days: add, commit, push.</p>
        </section>
      </article>
      <aside>
        <h2>Related posts</h2>
        <ul>
          <li><a href="/terminal.html">The terminal in 20 minutes</a></li>
        </ul>
      </aside>
    </main>
    <footer>
      <p>Built with plain HTML.</p>
    </footer>
  </body>
</html>
```

Why: every region has the tag that names it, and the headings form a clean outline.

Common mistake: wrapping everything in `div`s because it "works". It works visually, and it fails for screen readers and search engines.

</details>

### 2. Signup and login forms

On one page, build a signup form (email, password with at least 8 characters, a plan select, a required terms checkbox) and a login form. Every input needs a label and a `name`.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```html
<main>
  <h1>Create your account</h1>
  <form action="/signup" method="post">
    <label for="s-email">Email</label>
    <input id="s-email" name="email" type="email" required autocomplete="email" />
    <label for="s-pass">Password</label>
    <input id="s-pass" name="password" type="password" minlength="8" required autocomplete="new-password" />
    <label for="s-plan">Plan</label>
    <select id="s-plan" name="plan">
      <option value="free">Free</option>
      <option value="pro">Pro</option>
    </select>
    <label><input type="checkbox" name="terms" required /> I accept the terms</label>
    <button type="submit">Create account</button>
  </form>

  <h2>Already a member?</h2>
  <form action="/signin" method="post">
    <label for="l-email">Email</label>
    <input id="l-email" name="email" type="email" required autocomplete="email" />
    <label for="l-pass">Password</label>
    <input id="l-pass" name="password" type="password" required autocomplete="current-password" />
    <button type="submit">Sign in</button>
  </form>
</main>
```

Why: the two forms use different `id`s (`s-` and `l-`) so each label points to its own input. The `autocomplete` values let password managers do their job.

Common mistake: reusing `id="email"` in both forms. Duplicate ids make the second label focus the first input.

</details>

### 3. A SaaS landing page skeleton

Structure (no styling) a landing page: a hero with a heading and a call to action link, a features list, a pricing table with Free and Pro, an FAQ using `details` and `summary`, and a footer with links. This is the page you will need for your own product.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution with explanation</summary>

```html
<main>
  <section>
    <h1>Write once, publish everywhere</h1>
    <p>The simplest way to run your blog.</p>
    <a href="/signup">Start free</a>
  </section>

  <section>
    <h2>Features</h2>
    <ul>
      <li>Markdown editor</li>
      <li>Custom domains</li>
      <li>Built in analytics</li>
    </ul>
  </section>

  <section>
    <h2>Pricing</h2>
    <table>
      <thead>
        <tr><th scope="col">Plan</th><th scope="col">Price</th><th scope="col">Includes</th></tr>
      </thead>
      <tbody>
        <tr><td>Free</td><td>$0</td><td>1 blog</td></tr>
        <tr><td>Pro</td><td>$12 / month</td><td>Unlimited blogs and custom domain</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>FAQ</h2>
    <details>
      <summary>Can I cancel any time?</summary>
      <p>Yes. Your plan ends at the end of the billing period.</p>
    </details>
  </section>
</main>
<footer>
  <a href="/terms">Terms</a>
  <a href="/privacy">Privacy</a>
</footer>
```

Why: `details` and `summary` give you a working accordion with zero JavaScript. The pricing table is real tabular data, so `table` is correct here.

Common mistake: building the pricing "table" out of `div`s. Screen readers lose the row and column relationships.

</details>

## Cheat sheet

- Skeleton: `<!DOCTYPE html>`, `html lang`, `head` (charset, viewport, title, description), `body`
- One `h1`, no skipped levels. Headings are an outline, not a size
- `img` needs `alt`, `width`, `height`. `target="_blank"` needs `rel="noopener noreferrer"`
- Semantic: `header`, `nav`, `main`, `article`, `section`, `aside`, `footer`
- Forms: `label for` matches `id`, `name` is what gets sent, pick the right `type`
- Validation attributes: `required`, `minlength`, `pattern`. Never a substitute for server checks
- Tables only for tabular data. `details` and `summary` give a free accordion
- Run Lighthouse on every page you care about

## If lost / If bored

- If lost: a page that looks empty usually has an unclosed tag. Format on save will show it by indenting oddly. A missing image means the path is wrong, check it against the folder, like in the terminal post.
- If bored: run Lighthouse on your favorite website's homepage and see what it gets wrong. It is a great way to learn what matters.
- Keep for next: your article page and forms. The next post styles them.

## What breaks next

The page has structure and no style, so it looks like a document from 1995. Something has to give it layout.

[Where we are and what is next](../progress/)
