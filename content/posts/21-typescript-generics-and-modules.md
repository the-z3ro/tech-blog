---
title: "21 : TypeScript Generics and Modules - Reusable Types and Clean Imports"
date: 2026-05-31T12:00:00+05:30
draft: false
tags: ["typescript", "generics", "enums", "modules"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 2100
description: "Enums, generics, import and export, utility types, then a typed Express API and a typed GitHub stats dashboard to put it all to work."
aliases: ["/posts/18-typescript-generics-modules/", "/posts/typescript-generics-modules/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

In C++ you write `template <typename T>` to write logic once for any type. TypeScript has the same idea with a shorter spelling: `<T>`.

```cpp
// C++
template <typename T>
T first(std::vector<T> items) { return items[0]; }
```

```ts
// TypeScript
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

This post adds enums, generics, and clean imports and exports, then puts everything to work in a typed Express API.

> **Where we are:** Types for objects. After this post you have reusable types and clean imports.
>
> **Phase 01** · TypeScript · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** enums, generics, import and export, utility types, a typed API.  
> **Not today:** Advanced type gymnastics. You rarely need them in real work.
>
> **Time:** about 25 minutes to read, 60 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, write an interface for a blog author with an optional `bio`. Check it against [the TypeScript foundations post](../20-typescript-foundations/).

<details>
<summary>Prereqs to run this file</summary>

- [The TypeScript foundations post](../20-typescript-foundations/) done, or at least interfaces and unions. Same `ts-practice` folder with `tsc` working.
- The Express project lists its own installs at the start of that project.

</details>

## Part 1 of 4: Enums: Named Constants

Enums give human-readable names to sets of constant values. They're useful when you have a fixed set of options that something can be.

Let's say you're building a game and you have arrow key inputs:

```typescript
// Without enum - passing raw numbers, confusing
function handleKey(key: number) {
  // what does 0, 1, 2, 3 mean again?
}
handleKey(0); // up? down? nobody knows without checking docs

// With enum
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

function handleKey(key: Direction): void {
  // clear what each value means
}
handleKey(Direction.Up); // obvious
handleKey(Direction.Down); // obvious
```

By default, enum values are numbers starting from 0. `Direction.Up` is `0`, `Direction.Down` is `1`, and so on. You can verify this:

```typescript
console.log(Direction.Up); // 0
console.log(Direction.Down); // 1
```

The final runtime value is still a number (or string). The enum is just a compile-time alias. Once TypeScript compiles this, the output will have the numeric values.

### Customizing enum values

```typescript
enum Direction {
  Up = 1, // starts from 1
  Down, // becomes 2 automatically
  Left, // becomes 3
  Right, // becomes 4
}

// Or string enums
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Banned = "BANNED",
}
```

String enums are often better for readability in debugging and in API responses because `"ACTIVE"` is clearer than `2` when you see it in logs or a database.

### Common real-world use: HTTP status codes

```typescript
enum ResponseStatus {
  Success = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalError = 500,
}

// In an Express route
app.get("/user/:id", (req, res) => {
  if (!req.params.id) {
    return res.status(ResponseStatus.BadRequest).json({ error: "Missing ID" });
  }

  const user = findUser(req.params.id);
  if (!user) {
    return res
      .status(ResponseStatus.NotFound)
      .json({ error: "User not found" });
  }

  res.status(ResponseStatus.Success).json({ user });
});
```

This is much clearer than `res.status(404)` scattered everywhere. And if the status codes ever change, you change them in one place.

> **Exercise:** Create an enum called `UserRole` with values `Admin`, `Editor`, and `Viewer`. Write a function `canEdit(role: UserRole): boolean` that returns `true` only for Admin and Editor. Write another `canDelete(role: UserRole): boolean` that returns `true` only for Admin. Test it with all three roles.

<details>
<summary>Solution</summary>

```typescript
enum UserRole {
  Admin = "ADMIN",
  Editor = "EDITOR",
  Viewer = "VIEWER",
}

function canEdit(role: UserRole): boolean {
  return role === UserRole.Admin || role === UserRole.Editor;
}

function canDelete(role: UserRole): boolean {
  return role === UserRole.Admin;
}

console.log(canEdit(UserRole.Admin)); // true
console.log(canEdit(UserRole.Editor)); // true
console.log(canEdit(UserRole.Viewer)); // false
console.log(canDelete(UserRole.Editor)); // false
```

A note on enums vs union types: for simple cases like this, many modern TypeScript codebases prefer union types over enums:

```typescript
type UserRole = "ADMIN" | "EDITOR" | "VIEWER";
```

This is simpler, requires no compilation magic, and works identically at runtime. Enums generate actual JavaScript code; union types of string literals are compile-only and produce zero runtime overhead. Both are valid, know that both options exist.

</details>

> Checkpoint: you should see an enum member print its underlying value, and a typo in the enum name fail to compile.

## Part 2 of 4: Generics: Write Once, Work for Any Type

Generics are one of those things that seem confusing at first but once they click, you use them all the time.

The problem generics solve: you want to write a function that works with multiple types but still preserves type information.

Here is the problem without generics:

```typescript
// Returns the first element of an array
// If we type this as any, we lose all type info
function getFirst(arr: any[]): any {
  return arr[0];
}

const first = getFirst(["hello", "world"]);
first.toUpperCase(); // no TypeScript help here - first is 'any'
first.someRandomMethod(); // TypeScript won't catch this bug
```

You could write separate functions for each type:

```typescript
function getFirstString(arr: string[]): string {
  return arr[0];
}
function getFirstNumber(arr: number[]): number {
  return arr[0];
}
// ... and so on for every type - this doesn't scale
```

Generics solve this elegantly:

```typescript
function getFirst<T>(arr: T[]): T {
  return arr[0];
}
```

The `<T>` is a _type parameter_, a placeholder for whatever type you actually use. When you call the function:

```typescript
const first = getFirst(["hello", "world"]);
// TypeScript infers T = string
// first is now typed as string, not any

first.toUpperCase(); // TypeScript knows this is safe - first is string
first.someRandomMethod(); // ERROR - this method doesn't exist on string

const num = getFirst([1, 2, 3]);
// TypeScript infers T = number
// num is typed as number

num.toFixed(2); // works - it's a number
```

You can also explicitly specify the type parameter when calling:

```typescript
getFirst<string>(["a", "b", "c"]);
getFirst<number>([1, 2, 3]);
```

### A generic API response wrapper

This comes up constantly in real projects. Backend APIs typically return a response with some wrapper structure:

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Now you can use it with any data type
type UserResponse = ApiResponse<User>;
// { data: User; status: number; message: string }

type TodoListResponse = ApiResponse<Todo[]>;
// { data: Todo[]; status: number; message: string }
```

### A generic pair

```typescript
function createPair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const pair = createPair("hello", 42);
// pair is [string, number]
```

You can have multiple type parameters. By convention they're named `T`, `U`, `V`, but you can use more descriptive names when it helps: `TData`, `TError`, etc.

> **Exercise:** Write a generic function `wrap<T>(value: T): { value: T; timestamp: number }` that wraps any value in an object with the value and the current timestamp (use `Date.now()`). Call it with a string, a number, and a `User` object. Verify that TypeScript correctly infers the type of `result.value` in each case.

<details>
<summary>Solution</summary>

```typescript
function wrap<T>(value: T): { value: T; timestamp: number } {
  return {
    value,
    timestamp: Date.now(),
  };
}

const wrappedString = wrap("hello");
wrappedString.value.toUpperCase(); // works - TypeScript knows value is string

const wrappedNumber = wrap(42);
wrappedNumber.value.toFixed(2); // works - TypeScript knows value is number

interface User {
  name: string;
  age: number;
}

const wrappedUser = wrap<User>({ name: "Eshan", age: 22 });
wrappedUser.value.name; // works - TypeScript knows value is User
```

This pattern of wrapping data with metadata is extremely common. Think timestamps, pagination info, request IDs. Generics let you write the wrapper once and use it with any data type.

</details>

> Checkpoint: you should see the same function return a `string` for a string input and a `number` for a number input, with no casts.

## Part 3 of 4: Exporting and Importing: Splitting Code Across Files

TypeScript follows the ES module system. Same `import` / `export` syntax you know from JavaScript, just with types involved.

### Named exports

```typescript
// math.ts
export function add(x: number, y: number): number {
  return x + y;
}

export function subtract(x: number, y: number): number {
  return x - y;
}

export interface MathResult {
  result: number;
  operation: string;
}
```

```typescript
// main.ts
import { add, subtract, MathResult } from "./math";

const result: MathResult = {
  result: add(5, 3),
  operation: "addition",
};
```

### Default exports

```typescript
// Calculator.ts
export default class Calculator {
  add(x: number, y: number): number {
    return x + y;
  }

  multiply(x: number, y: number): number {
    return x * y;
  }
}
```

```typescript
// main.ts
import Calculator from "./Calculator"; // no curly braces for default

const calc = new Calculator();
console.log(calc.add(10, 5));
```

### Exporting types

You can export interfaces and types just like functions:

```typescript
// types.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export type Status = "active" | "inactive" | "banned";
```

```typescript
// user-service.ts
import { User, Status } from "./types";

function updateUserStatus(user: User, status: Status): User {
  return { ...user };
}
```

In larger projects you typically have a `types.ts` or `types/index.ts` file where all your shared interfaces and types live. This is a very clean pattern, one source of truth for all your data structures.

> Checkpoint: you should see a type exported from one file and used in another, with the editor autocompleting its fields.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *A Few More Things You Will Encounter*.

## Part 4 of 4: A Few More Things You Will Encounter

These topics come up regularly in real TypeScript codebases. They are not beginner things but you will hit them soon enough that it is worth at least seeing them.

### Readonly and Partial utility types

TypeScript has built-in utility types that transform existing types:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

// Readonly - all fields become read-only, cannot be modified after creation
const user: Readonly<User> = {
  id: "1",
  name: "Eshan",
  email: "e@e.com",
};
user.name = "test"; // ERROR - cannot assign to read-only property

// Partial - all fields become optional
// Useful for update operations where you only want to change some fields
function updateUser(userId: string, updates: Partial<User>): void {
  // updates might have only 'name', or only 'email', or both - all fine
}

updateUser("1", { name: "New Name" }); // no need to pass all fields
```

### Pick and Omit

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Pick - take only specific fields
type PublicUser = Pick<User, "id" | "name" | "email">;
// { id: string; name: string; email: string }

// Omit - take all fields EXCEPT specific ones
type SafeUser = Omit<User, "password">;
// { id: string; name: string; email: string; createdAt: Date }
```

`Pick` and `Omit` are extremely useful when you don't want to expose certain fields. For example, you never want to send `password` back to the client. `Omit<User, "password">` ensures the return type never includes it.

### The `as` keyword (type assertion)

Sometimes TypeScript cannot figure out the type but you know better. `as` lets you assert a type:

```typescript
const input = document.getElementById("username") as HTMLInputElement;
input.value; // now TypeScript knows this is an input element and has .value
```

Be careful with `as`. It bypasses type checking. If you are wrong about the type, you will get a runtime error. Use it when you have external data (DOM, JSON from APIs) where TypeScript genuinely cannot infer the type. Don't use it to silence TypeScript errors that are actually warnings about your code.

## Patterns I Noticed After Using TypeScript for a While

These are things nobody explains upfront but they save a lot of time.

**TypeScript does not fix bad code, it documents it.** The types you write are a form of documentation. If your function takes a 200-field mega-object when it only needs two fields, TypeScript won't complain, but it is still bad design. Use specific types for function parameters. A function that needs a user's email and age should take `{ email: string; age: number }` not the entire `User` object.

**Start with strict mode from day one.** Turning on `"strict": true` in your tsconfig when you already have a large codebase is painful. Do it from the start. Every project. Always.

**Avoid `any` like it has a communicable disease.** Every time you write `any`, you are opting out of TypeScript. Your code compiles, TypeScript smiles, bugs happen at runtime. If you genuinely don't know the type yet, use `unknown` instead, it forces you to narrow the type before doing anything with the value.

```typescript
// any - typescript just trusts you, can cause runtime errors
function process(data: any) {
  data.someMethod(); // no error, might crash at runtime
}

// unknown - typescript forces you to check before using
function process(data: unknown) {
  if (typeof data === "string") {
    data.toUpperCase(); // safe, TypeScript knows it's string here
  }
}
```

**Types are erased at runtime.** TypeScript types exist only in your source code. The compiled JavaScript has zero type information. This means you cannot do `if (variable instanceof MyInterface)`, interfaces don't exist at runtime. For runtime type checking you still need regular JS techniques like `typeof`, `instanceof`, or a validation library.

**The TypeScript error messages look scary but become readable.** At first, TypeScript errors are walls of text. After a few weeks you learn to read them from bottom to top, the bottom line is usually the actual problem, the top part is context about where it happened.

**Zod for runtime validation.** TypeScript validates at compile time. But when data comes in from outside your code (HTTP request body, JSON file, user input), TypeScript has no idea if it actually matches your types. Zod is a library that lets you define schemas and validate data at runtime:

```typescript
import { z } from "zod";

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

// This validates the actual data at runtime, not just at compile time
const parsed = UserSchema.parse(req.body);
// parsed is now safely typed as { email: string; age: number }
```

This combination, TypeScript for compile-time safety, Zod for runtime validation, is the standard pattern in production TypeScript backends.

## Common Confusions

| Confusion                                            | Reality                                                                                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| "TypeScript runs in the browser"                     | No. TypeScript compiles to JavaScript first. The browser runs the compiled JS.                                                      |
| "TypeScript and JavaScript types are the same thing" | TS types only exist at compile time. At runtime it is all plain JavaScript - no types anywhere.                                     |
| "`any` is fine for now, I'll fix it later"           | You won't. Use `unknown` instead if you genuinely don't know.                                                                       |
| "interface and type are completely different"        | For object shapes they're nearly identical. Use `interface` for classes and extendable shapes, `type` for unions and intersections. |
| "TypeScript makes my code safer at runtime"          | It doesn't. External data (API responses, user input) is untyped at runtime. You need Zod or similar for that.                      |
| "Generics are only for library authors"              | You'll use generics constantly for API response wrappers, utility functions, and custom hooks.                                      |

## Solo rep: Generics from memory

> **Level 5: From memory.** Rebuild a core piece with no references at all, then compare with the post. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

No references. Write a generic `ApiResponse<T>` type, a function `getFirst<T>(items: T[]): T | undefined`, export both from one file, import them in a second file, and compile.

<details>
<summary>Check yourself, only after you try</summary>

```ts
// types.ts
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}

// main.ts
import { ApiResponse, getFirst } from "./types";

const res: ApiResponse<string[]> = { data: ["a", "b"] };
console.log(getFirst(res.data));
```

</details>

## Projects

These projects touch every concept from this post. Start with the first one and work upward.

### 1. Typed Express API (Intermediate)

Build a REST API for a simple user management system. This is the real thing, TypeScript + Express together, which is how almost every Node.js production backend is written.

**Setup:**

```bash
mkdir typed-api && cd typed-api
npm init -y
npm install express
npm install -D typescript ts-node @types/node @types/express nodemon
npx tsc --init
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  }
}
```

Add to `package.json` scripts:

```json
"scripts": {
  "dev": "nodemon --exec ts-node src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

**Requirements:**

- A `User` interface with `id`, `name`, `email`, `role` (`"admin"` or `"user"`) and `createdAt`
- `CreateUserBody` and `UpdateUserBody` derived with `Omit` and `Partial`, not written by hand
- A generic `ApiResponse<T>` used by every response
- Routes: `GET /users`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id`, with a 404 when the id is missing

> **Solo gate:** set a 15 minute timer and build this without opening the solution. Stuck at minute 10? Open only the first step, then close it and keep typing. Typing it yourself is the point.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. Stuck at minute 10? Open only the first step, then close it and keep typing. Typing it yourself is the point.

<details>
<summary>Stuck? Solution, one step at a time</summary>

Steps are in order. Open only the one you are stuck on, then close it and type it yourself.

```typescript
// src/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
}

export type CreateUserBody = Omit<User, "id" | "createdAt">;
export type UpdateUserBody = Partial<Omit<User, "id" | "createdAt">>;

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}
```

<details>
<summary>Step 1 of 4: src/index.ts</summary>

```typescript
// src/index.ts
import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid"; // npm install uuid && npm install -D @types/uuid
import { User, CreateUserBody, UpdateUserBody, ApiResponse } from "./types";

const app = express();
app.use(express.json());

let users: User[] = [];

// GET all users
app.get("/users", (req: Request, res: Response) => {
  const response: ApiResponse<User[]> = {
    data: users,
    error: null,
    status: 200,
  };
  res.json(response);
});
```

</details>

<details>
<summary>Step 2 of 4: POST create user</summary>

```typescript
// POST create user
app.post("/users", (req: Request<{}, {}, CreateUserBody>, res: Response) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    const response: ApiResponse<null> = {
      data: null,
      error: "Missing required fields: name, email, role",
      status: 400,
    };
    return res.status(400).json(response);
  }

  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    role,
    createdAt: new Date(),
  };

  users.push(newUser);

  const response: ApiResponse<User> = {
    data: newUser,
    error: null,
    status: 201,
  };
  res.status(201).json(response);
});
```

</details>

<details>
<summary>Step 3 of 4: PATCH update user</summary>

```typescript
// PATCH update user
app.patch(
  "/users/:id",
  (req: Request<{ id: string }, {}, UpdateUserBody>, res: Response) => {
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
      const response: ApiResponse<null> = {
        data: null,
        error: "User not found",
        status: 404,
      };
      return res.status(404).json(response);
    }

    // Partial update - only update fields that were sent
    Object.assign(user, req.body);

    const response: ApiResponse<User> = {
      data: user,
      error: null,
      status: 200,
    };
    res.json(response);
  },
);
```

</details>

<details>
<summary>Step 4 of 4: DELETE user</summary>

```typescript
// DELETE user
app.delete("/users/:id", (req: Request<{ id: string }>, res: Response) => {
  const index = users.findIndex((u) => u.id === req.params.id);

  if (index === -1) {
    return res
      .status(404)
      .json({ data: null, error: "User not found", status: 404 });
  }

  users.splice(index, 1);
  res.json({ data: null, error: null, status: 200 });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

</details>

</details>

Run with `npm run dev`. Test with curl or Postman:

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Eshan", "email": "e@e.com", "role": "admin"}'

# List all users
curl http://localhost:3000/users

# Update - only sending name, email stays the same
curl -X PATCH http://localhost:3000/users/{ID_FROM_ABOVE} \
  -H "Content-Type: application/json" \
  -d '{"name": "Eshan Updated"}'
```

The `Partial<>` and `Omit<>` utility types are doing real work here. `CreateUserBody` ensures you cannot accidentally include an `id` in a creation request. `UpdateUserBody` makes all fields optional so you can PATCH with just the fields you want to change. This is the actual pattern used in production APIs.

**Extension ideas (try these yourself):**

- Add input validation using Zod (validate the request body shape at runtime)
- Add a `GET /users/:id` route
- Add filtering by role: `GET /users?role=admin`
- Move the users data to a simple JSON file for persistence between restarts

### 2. GitHub Stats Dashboard (Intermediate, No Backend Needed)

Build a typed React app that shows GitHub user statistics. This uses TypeScript + React + fetch, everything typed end to end.

Setup:

```bash
npm create vite@latest github-stats -- --template react-ts
cd github-stats
npm install
npm run dev
```

**Requirements:**

- Types for `GithubUser`, `GithubRepo`, and a `FetchState<T>` discriminated union (idle, loading, success, error)
- A `useGithubUser` hook that fetches a user and their repos and exposes both states
- An `App` with a search box and a different view for each state
- No `any` anywhere

> **Solo gate:** set a 15 minute timer and build this without opening the solution. Stuck at minute 10? Open only the first step, then close it and keep typing. Typing it yourself is the point.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. When the timer ends, peek once, close it, and type your final version yourself. Typing it yourself is the point.

<details>
<summary>Solution</summary>

```typescript
// src/types.ts
export interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio: string | null;
  location: string | null;
  created_at: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
}

export type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };
```

```typescript
// src/hooks/useGithub.ts
import { useState } from "react";
import { GithubUser, GithubRepo, FetchState } from "../types";

export function useGithubUser() {
  const [state, setState] = useState<FetchState<GithubUser>>({
    status: "idle",
  });
  const [repos, setRepos] = useState<FetchState<GithubRepo[]>>({
    status: "idle",
  });

  async function fetchUser(username: string): Promise<void> {
    setState({ status: "loading" });
    setRepos({ status: "loading" });

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(
          `https://api.github.com/users/${username}/repos?sort=stars&per_page=5`,
        ),
      ]);

      if (!userRes.ok) {
        setState({ status: "error", error: "User not found" });
        setRepos({ status: "idle" });
        return;
      }

      const userData: GithubUser = await userRes.json();
      const reposData: GithubRepo[] = await reposRes.json();

      setState({ status: "success", data: userData });
      setRepos({ status: "success", data: reposData });
    } catch {
      setState({ status: "error", error: "Something went wrong" });
      setRepos({ status: "idle" });
    }
  }

  return { userState: state, reposState: repos, fetchUser };
}
```

```tsx
// src/App.tsx
import { useState } from "react";
import { useGithubUser } from "./hooks/useGithub";

export default function App() {
  const [input, setInput] = useState("");
  const { userState, reposState, fetchUser } = useGithubUser();

  function handleSearch() {
    if (input.trim()) {
      fetchUser(input.trim());
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem" }}>
      <h1>GitHub Stats</h1>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="GitHub username"
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {userState.status === "loading" && <p>Loading...</p>}
      {userState.status === "error" && (
        <p style={{ color: "red" }}>{userState.error}</p>
      )}

      {userState.status === "success" && (
        <div>
          <img
            src={userState.data.avatar_url}
            alt={userState.data.login}
            style={{ width: 80, borderRadius: "50%" }}
          />
          <h2>{userState.data.name ?? userState.data.login}</h2>
          {userState.data.bio && <p>{userState.data.bio}</p>}
          <p>
            Repos: {userState.data.public_repos} | Followers:{" "}
            {userState.data.followers}
          </p>
        </div>
      )}

      {reposState.status === "success" && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Top Repos</h3>
          {reposState.data.map((repo) => (
            <div
              key={repo.id}
              style={{ borderBottom: "1px solid #eee", padding: "0.5rem 0" }}
            >
              <a href={repo.html_url} target="_blank" rel="noreferrer">
                {repo.name}
              </a>
              <span> ⭐ {repo.stargazers_count}</span>
              {repo.language && <span> | {repo.language}</span>}
              {repo.description && (
                <p style={{ margin: "0.2rem 0", color: "#666" }}>
                  {repo.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

</details>

The `FetchState<T>` discriminated union type is a genuinely useful pattern. Instead of having three separate booleans (`isLoading`, `isError`, `isSuccess`) that can all be true simultaneously in a buggy state, you have one state that can only ever be one thing at a time. TypeScript will narrow it correctly inside each `if` block. This is a pattern worth taking with you into every project.

## Cheat sheet

- TypeScript is JavaScript with types. It compiles to plain JS. The browser never sees TypeScript.
- The biggest value is catching errors at compile time, not at runtime in production.
- `interface` for object shapes and class contracts. `type` for unions and intersections.
- Generics let you write functions and types that work with any type while preserving type information.
- Enums give named constants: useful for finite sets of values like roles, statuses, directions.
- `strict: true` in tsconfig from day one. Always.
- Avoid `any`. Use `unknown` when you don't know the type yet.
- Utility types like `Partial`, `Pick`, `Omit`, `Readonly` save a lot of boilerplate.
- TypeScript cannot validate runtime data. Use Zod for that.
- The pattern `type FetchState<T> = { status: "idle" } | { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: string }` is something you will use in almost every async-heavy project.

## If lost / If bored

- If lost: `Cannot find module` on an import means a wrong relative path or a missing `export`. `Type X is not assignable to type Y` means compare the two shapes field by field.
- If bored: jump to the typed Express API project.
- Keep for next: the typed Express API. It becomes the base when later stages add Postgres and Prisma.

## What breaks next

That finishes this stretch. What changes when your data is relational? The progress page shows what is coming.

[Where we are and what is next](../progress/)
