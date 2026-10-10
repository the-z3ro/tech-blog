---
title: "Where I Am: Phase 01 Progress"
date: 2026-10-06T11:00:00+05:30
draft: false
tags: ["progress", "roadmap"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 20
description: "The one page that says where this series is, what is published, and what is still left in Phase 01. Updated as the plan changes."
cover:
  image: ""
  alt: ""
  caption: ""
---

<!--
HOW TO UPDATE THIS PAGE (readers do not see this comment)
1. Published a post? Change its line from "- ⬜ Title: scope" to "- ✅ [NN : Title](../NN-title-words/)". Name the file NN-title-words.md to match.
2. Plan changed? Add, remove or reorder lines. The order of lines inside a stage is the reading order.
3. Update "Writing next" and the date at the bottom.
Nothing else stores the plan. Posts only link here and never mention post numbers or totals.
-->

Phase 01 is the whole path from a blank folder to a product you can ship and charge for. It follows a complete web development syllabus, then adds what a real SaaS needs that syllabi usually skip. This page is the single place that says where I am and what is left. Every post links here.

## Where I am right now

**Published:** the terminal, Git, HTML, CSS, JavaScript, backend with auth, MongoDB, React from the DOM to hooks, routing and shared state, Tailwind, Redux, custom hooks, and TypeScript.

**Writing next:** SQL and Postgres: Tables, Constraints, Indexes and Queries. Tables and types, primary and foreign keys, constraints, indexes, the queries you write daily, when SQL beats Mongo.

Items marked *backfill* sit earlier on the path than where I am writing. They are filled in later, in the place shown here, so the reading order stays clean.

## The path at a glance

| Stage | What it covers | Status |
| ----- | -------------- | ------ |
| Workshop | Your terminal and your safety net. | In progress |
| Web foundations | HTML and CSS, the two languages every page speaks. | Complete |
| JavaScript | The language of the web, and how it waits. | In progress |
| Backend | Servers, APIs, validation and auth. | In progress |
| Data: MongoDB | Where your app's memory lives, document style. | Complete |
| React core | From the DOM to components, state and effects. | Complete |
| Real frontends | Routing, shared state, styling, forms and data fetching. | In progress |
| TypeScript | Types across your whole stack. | In progress |
| Relational data: SQL | The database most SaaS products run on. | Not started |
| Next.js full stack | One framework for pages, API routes and auth. | Not started |
| Ship it | Getting your app onto the internet and keeping it there. | Not started |
| Real time and scale | When one request and one server stop being enough. | Not started |
| Capstone: a wallet app | Money moves, so everything must be correct. | Not started |
| SaaS launch kit | What the syllabus does not cover but a paying product needs. | Not started |

## Every post, in reading order

✅ means published, click to read. ⬜ means planned, not written yet.

### Workshop

Your terminal and your safety net.

- ✅ [01 : The Terminal in 20 Minutes - Stop Fearing the Black Window](../01-the-terminal-in-20-minutes/)
- ✅ [02 : Git Setup for This Series - Track Your Blog Code](../02-git-setup-for-this-series/)
- ⬜ **Git for Teams: Pull Requests, Rebase and Clean History** *(backfill)*: GitHub flow, pull requests, rebase versus merge, commit messages, `.gitignore`, undoing mistakes safely.

### Web foundations

HTML and CSS, the two languages every page speaks.

- ✅ [03 : HTML Foundations - Structure, Forms and the Accessibility Basics](../03-html-foundations/)
- ✅ [04 : CSS Foundations - The Box Model, Flexbox, Grid and Responsive Design](../04-css-foundations/)

### JavaScript

The language of the web, and how it waits.

- ✅ [05 : JS Language and Runtime - How JavaScript Actually Works](../05-js-language-and-runtime/)
- ✅ [06 : Async JS and Array Methods - Callbacks to Async Await](../06-async-js-and-array-methods/)
- ⬜ **npm, Modules and Tooling: package.json, ESM vs CJS, ESLint and Prettier** *(backfill)*: npm and `package.json`, semantic versions, lockfiles, ESM versus CommonJS, scripts, linting and formatting.

### Backend

Servers, APIs, validation and auth.

- ✅ [07 : Node, HTTP and Express - Building a Blog API](../07-node-http-and-express/)
- ✅ [08 : Debugging Like a Developer - Read Errors, Use Breakpoints, Fix Bugs Fast](../08-debugging-like-a-developer/)
- ✅ [09 : Middleware and Zod - Reusable Checks and Safe Input](../09-middleware-and-zod/)
- ✅ [10 : Auth with bcrypt and JWT - Signup, Signin and Protected Routes](../10-auth-with-bcrypt-and-jwt/)
- ⬜ **REST API Design: Pagination, Filtering, Versioning and Errors** *(backfill)*: Resource naming, pagination, filtering, versioning, one consistent error shape, idempotency basics.

### Data: MongoDB

Where your app's memory lives, document style.

- ✅ [11 : MongoDB and Mongoose - Persisting the Blog](../11-mongodb-and-mongoose/)

### React core

From the DOM to components, state and effects.

- ✅ [12 : DOM to React Bridge - Why Raw DOM Breaks](../12-dom-to-react-bridge/)
- ✅ [13 : React Basics - State, JSX and Components](../13-react-basics/)
- ✅ [14 : React Hooks in Depth - Effect, Memo, Callback and Ref](../14-react-hooks-in-depth/)

### Real frontends

Routing, shared state, styling, forms and data fetching.

- ✅ [15 : Routing and Context - Share Blog State Without Drilling](../15-routing-and-context/)
- ✅ [16 : State Libraries - Zustand, Jotai and Recoil for Blog State](../16-state-libraries/)
- ✅ [17 : Tailwind, Axios and a Real Blog Frontend - Make It Look Like a Product](../17-tailwind-axios-and-a-real-blog-frontend/)
- ✅ [18 : Redux Toolkit - Global State You Will Meet at Work](../18-redux-toolkit/)
- ✅ [19 : Custom Hooks - Write Once, Use Everywhere](../19-custom-hooks/)
- ⬜ **Forms in React: React Hook Form and Zod** *(backfill)*: Controlled versus uncontrolled inputs, schema validation shared with the backend, error messages, submit states.
- ⬜ **Server State with TanStack Query: Caching, Mutations, Optimistic Updates** *(backfill)*: Queries, mutations, cache invalidation, loading and error states, optimistic updates, pagination.
- ⬜ **Build 2: A Wallet App Frontend** *(backfill)*: A second full frontend with Tailwind, routing, auth and forms, for the capstone later.

### TypeScript

Types across your whole stack.

- ✅ [20 : TypeScript Foundations - Types, Interfaces and tsconfig](../20-typescript-foundations/)
- ✅ [21 : TypeScript Generics and Modules - Reusable Types and Clean Imports](../21-typescript-generics-and-modules/)
- ⬜ **Advanced TypeScript: Utility Types, Narrowing and Typed APIs** *(backfill)*: Utility types, type narrowing, discriminated unions in practice, typing API clients and Express handlers.

### Relational data: SQL

The database most SaaS products run on.

- ⬜ **SQL and Postgres: Tables, Constraints, Indexes and Queries**: Tables and types, primary and foreign keys, constraints, indexes, the queries you write daily, when SQL beats Mongo.
- ⬜ **Prisma ORM: Schema, Migrations and the Client**: The schema file, migrations, the generated client, seeding and common query patterns.
- ⬜ **Relations and Joins: SQL and Prisma Together**: One to many, many to many, joins in SQL and the same ideas in Prisma, avoiding N+1 queries.
- ⬜ **Transactions and Connection Pooling**: ACID in plain words, transactions for money-safe writes, connection pooling in serverless environments.

### Next.js full stack

One framework for pages, API routes and auth.

- ⬜ **Next.js Intro: App Router, Layouts and Server Components**: File based routing, layouts, server versus client components, data loading.
- ⬜ **Rendering Strategies: CSR, SSR, SSG and Middleware**: When to render where, caching, revalidation, and middleware in Next.js.
- ⬜ **Next.js Backend: Route Handlers and Server Actions**: Route handlers, server actions, talking to the database, validation at the edge.
- ⬜ **Auth with Cookies: Sessions, httpOnly and CSRF**: Cookie based sessions, httpOnly and SameSite, CSRF, why tokens in localStorage are risky.
- ⬜ **NextAuth: Social Login and Sessions**: Providers, sessions, protecting pages and API routes, account linking.
- ⬜ **Capstone A: The Blog App, Backend to Frontend**: The running blog platform rebuilt end to end as one Next.js app with auth and a database.

### Ship it

Getting your app onto the internet and keeping it there.

- ⬜ **Serverless Functions: What They Are and When to Use Them**: How serverless works, cold starts, limits, and where it fits.
- ⬜ **Deploying to the Cloud: Servers, Frontends, Domains and HTTPS**: A backend on a server, a frontend on a CDN, domains, certificates, environment config.
- ⬜ **Docker Basics: Images, Containers and Dockerfiles**: What a container is, writing a Dockerfile, building and running images.
- ⬜ **Docker Compose and Volumes: Running a Whole Stack Locally**: Compose files, networks, volumes and bind mounts, a database next to your app.
- ⬜ **Monorepos and Publishing npm Packages**: Workspaces, sharing code between apps, versioning and publishing a package.
- ⬜ **CI/CD with GitHub Actions: Test, Build and Deploy on Every Push**: Workflows, secrets, caching, and deploying automatically when tests pass.

### Real time and scale

When one request and one server stop being enough.

- ⬜ **WebSockets: Real-Time Communication**: Persistent connections, rooms, broadcasting, scaling WebSockets.
- ⬜ **Redis, Pub/Sub and Queues: Caching and Background Work**: Caching, pub/sub between servers, job queues and workers.
- ⬜ **OpenAPI: Documenting and Generating Your API**: Writing a spec, generating docs and clients, keeping spec and code in sync.

### Capstone: a wallet app

Money moves, so everything must be correct.

- ⬜ **Capstone B: Wallet App Backend, Accounts and Transfers**: Users, accounts and balances, transfers, and the database design behind them.
- ⬜ **Capstone B: Safe Transactions and Hardening**: Atomic transfers, race conditions, idempotency, and testing the dangerous paths.

### SaaS launch kit

What the syllabus does not cover but a paying product needs.

- ⬜ **Testing: Vitest, Supertest, Testing Library and Playwright**: What to test, unit versus integration versus end to end, mocking, running tests in CI.
- ⬜ **Security Hardening: OWASP Risks, Rate Limiting and Secrets**: The common web vulnerabilities, rate limiting, headers, secrets management, dependency risks.
- ⬜ **SaaS Architecture: Multi-Tenancy, Roles, Plans and the Data Model**: Tenants and organizations, roles and permissions, plan limits, designing the tables for a product.
- ⬜ **Billing with Stripe: Subscriptions, Webhooks and the Customer Portal**: Checkout, subscriptions, webhooks as the source of truth, failed payments, the customer portal.
- ⬜ **Transactional Email: Verification, Resets and Receipts**: Sending reliable email, templates, deliverability basics, verification and password reset flows.
- ⬜ **File Uploads and Object Storage: Images, Documents and Signed URLs**: Direct uploads to object storage, signed URLs, size and type limits, serving files safely.
- ⬜ **Observability: Logs, Errors, Health Checks and Alerts**: Structured logs, error tracking, health checks, uptime alerts, finding problems before users do.
- ⬜ **Adding AI Features: LLM APIs, Streaming, Cost and Safety**: Calling a model from your backend, streaming responses, prompt and cost control, guarding against misuse.
- ⬜ **Launch Checklist: SEO, Analytics, Pricing Page and Legal Basics**: Metadata and performance for search, product analytics, a pricing page that converts, terms and privacy basics.

## What counts as done

Phase 01 is finished when someone who follows every post can build, test, secure, deploy and bill for a small SaaS product on their own. The first stages teach the building blocks. The last two stages are there so that the product can actually earn money: billing, email, security, testing, and a launch checklist.

*Last updated: October 2026.*
