---
title: "20 : TypeScript Foundations - Types, Interfaces and tsconfig"
date: 2026-05-31T12:00:00+05:30
draft: false
tags: ["typescript", "types", "fundamentals"]
categories: ["web-dev"]
author: "Eshan"
showToc: true
TocOpen: false
weight: 2000
description: "Why TypeScript exists, setup, tsconfig essentials, basic types, interfaces, unions and typed arrays, with a beginner project."
aliases: ["/posts/12-typescripts/", "/posts/17-typescript-foundations/", "/posts/typescript-foundations/"]
cover:
  image: ""
  alt: ""
  caption: ""
---

C++ taught me early that the compiler is a strict friend: it refuses to run code that does not make sense, and it tells you why. JavaScript has no such friend, so mistakes show up at runtime, in front of users. TypeScript is that friend, added on top of JavaScript.

This post covers why TypeScript exists, setup, the few `tsconfig` flags that matter, and the core types: primitives, interfaces, unions and arrays.

> **Where we are:** JavaScript everywhere. After this post the compiler checks your shapes before you run anything.
>
> **Phase 01** · TypeScript · [Series progress](../progress/) · [Start here](../start-here/)
>
> **In scope today:** types, interfaces, unions, typed arrays, and tsconfig.  
> **Not today:** Generics and modules, which come right after.
>
> **Time:** about 25 minutes to read, 60 to build.

> **Warm-up rep (3 minutes, no peeking):** From memory, write a JavaScript function that takes a post and returns its title in uppercase. Then think about what could go wrong at runtime.

<details>
<summary>Prereqs to run this file</summary>

- Node 22 or 24 LTS. Check with `node -v`.
- A new empty folder for practice, for example `ts-practice`.
- The install steps are inside Part 3, so you do not need to install anything yet.

</details>

## Part 1 of 8: Strongly Typed vs Loosely Typed: The Foundation

Before we get into TypeScript itself, it helps to understand why it exists.

Programming languages have a concept of typing. Some languages are _strongly typed_, meaning once you say a variable is a number, it stays a number. You cannot just reassign it to a string. Examples are Java, C++, Go, Rust. If you try to do something that doesn't match the type, the code literally won't compile. The error happens before execution.

Other languages are _loosely typed_: the type of a variable can change freely at runtime. JavaScript, Python, PHP, Perl are in this category. This is flexible and fast to write, but it means type-related bugs only surface when the code actually runs. Sometimes in production. Sometimes at 2am.

```js
// JavaScript - loosely typed, this works fine
let number = 10;
number = "text"; // now it's a string - no error, no warning

// C++ - strongly typed, this won't even compile
int number = 10;
number = "text"; // COMPILE ERROR
```

People realized JavaScript is a very powerful language but it lacks types. So TypeScript was created, it adds a type layer on top of JavaScript while keeping all the flexibility you're used to. You still write familiar JS syntax, but now you can annotate types and the TypeScript compiler will catch mismatches before your code runs.

## Part 2 of 8: What Is TypeScript Exactly

TypeScript is a programming language made and maintained by Microsoft. At its core it is a _superset_ of JavaScript, which means every valid JavaScript file is also a valid TypeScript file. TypeScript only adds things on top. It never removes anything from JS.

The critical thing to understand early: **TypeScript never runs directly in your browser or Node.js**. Browsers only understand JavaScript. TypeScript must first be _compiled_ (or more precisely, _transpiled_) down to plain JavaScript. That compiled output is what actually runs.

```
your TypeScript file (.ts)
         |
         | tsc (TypeScript compiler)
         |
    JavaScript file (.js)
         |
    Browser / Node.js runs it
```

During this compilation step, TypeScript performs type checking. If there is a type error anywhere in your code, the compilation fails and it tells you exactly what's wrong. No JavaScript file gets produced. This is the whole point, catch errors at compile time, not at runtime.

There are actually several tools that can compile TypeScript to JavaScript:

- `tsc`: the official TypeScript compiler from Microsoft
- `esbuild`: extremely fast, written in Go, used by Vite
- `swc`: written in Rust, used by Next.js
- `ts-node`: lets you run TypeScript files directly in Node without a separate compile step (for development)

For learning, `tsc` is the right starting point. For production projects you will often use `esbuild` or `swc` because they are much faster.

## Part 3 of 8: Setting Up: Your First TypeScript Project

Let's get this running locally.

**Step 1: Install TypeScript globally**

```bash
npm install -g typescript
```

This gives you the `tsc` command everywhere on your system.

**Step 2: Create a new project**

```bash
mkdir ts-playground
cd ts-playground
npm init -y
npx tsc --init
```

`tsc --init` creates a `tsconfig.json` file: this is the configuration file for the TypeScript compiler. We will go through the important settings in a bit.

**Step 3: Write your first TypeScript file**

Create `a.ts`:

```typescript
const x: number = 1;
console.log(x);
```

The `: number` part is the type annotation. You are telling TypeScript "this variable will always hold a number."

**Step 4: Compile it**

```bash
tsc -b
```

This produces `a.js` next to your `a.ts` file. Open it and you will see:

```js
"use strict";
const x = 1;
console.log(x);
```

Notice how the type annotation (`: number`) completely disappears in the output. TypeScript only exists at development time. The JS file is clean, plain JavaScript with no TypeScript anywhere.

**Step 5: See TypeScript catch an error**

Now change `a.ts`:

```typescript
let x: number = 1;
x = "eshan"; // try to assign a string to a number variable
console.log(x);
```

Run `tsc -b` again. You will see something like:

```
a.ts:2:5 - error TS2322: Type 'string' is not assignable to type 'number'.
Found 1 error.
```

And crucially: no `a.js` file is created. The compilation failed. That is exactly the behavior you want. The error is caught before the code runs anywhere.

> **Try it yourself:** Before reading further, change the type from `number` to `string` and try assigning a number to it. What happens? Then try `any` as the type and assign both, what happens now? (Hint: `any` is the escape hatch that basically turns off type checking for that variable.)

> Checkpoint: you should see `tsc -v` print a version, and `tsc` compile your `.ts` file into a `.js` file.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *The tsconfig.json: Telling the Compiler How to Behave*.

## Part 4 of 8: The tsconfig.json: Telling the Compiler How to Behave

When you run `npx tsc --init`, you get a `tsconfig.json` with a lot of commented-out options. These are all the settings that control how TypeScript compiles your code. Most of them you will never touch, but a handful are important.

### target

This tells the compiler which version of JavaScript to output.

```json
{
  "compilerOptions": {
    "target": "ES2020"
  }
}
```

If you write an arrow function in TypeScript and set `target` to `ES5`, the compiler will convert it to a regular `function` expression in the output because ES5 doesn't support arrow functions. If you set `target` to `ES2020` or newer, it keeps the arrow function as is.

Try it: write `const greet = (name: string) => \`Hello, ${name}!\``and compile with`target: "ES5"`vs`target: "ES2020"`. The output is different even though the TypeScript input is the same.

### rootDir

Where the compiler looks for your `.ts` source files.

```json
{
  "compilerOptions": {
    "rootDir": "./src"
  }
}
```

Good practice is to put all TypeScript source in a `src/` folder and compile from there. Keeps things clean.

### outDir

Where the compiled `.js` files go.

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

With this setup: `src/index.ts` compiles to `dist/index.js`. This is the standard layout for TypeScript projects. You commit `src/`, you deploy `dist/`.

### noImplicitAny

```json
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
```

Without a type annotation, TypeScript tries to infer the type. If it cannot infer it, it falls back to `any`. With `noImplicitAny: true`, that fallback is not allowed, TypeScript will throw an error forcing you to explicitly annotate.

```typescript
// noImplicitAny: true - this will error
const greet = (name) => `Hello, ${name}!`;
// Error: Parameter 'name' implicitly has an 'any' type.

// Fix it
const greet = (name: string) => `Hello, ${name}!`;
```

This option is what separates a "TypeScript project" from a "JavaScript project with TypeScript installed." Turn it on.

### removeComments

```json
{
  "compilerOptions": {
    "removeComments": true
  }
}
```

Strips all comments from the compiled JS output. Smaller files, nothing revealing in production.

### A minimal practical tsconfig

Here is a solid starting config for a Node.js TypeScript project:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "noImplicitAny": true,
    "strict": true,
    "removeComments": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

The `"strict": true` option is a catch-all that enables a bunch of strict checks including `noImplicitAny`, `strictNullChecks`, and a few others. Just turn it on. You will thank yourself later.

> Checkpoint: you should see an output folder appear after you compile, containing the `.js` files.

## Part 5 of 8: Basic Types: The Building Blocks

TypeScript has several primitive types that map directly to JavaScript types:

```typescript
// number - integers and decimals both
let age: number = 25;
let price: number = 9.99;

// string
let username: string = "eshan";
let greeting: string = `Hello, ${username}!`;

// boolean
let isLoggedIn: boolean = true;
let hasPaid: boolean = false;

// null and undefined
let nothing: null = null;
let missing: undefined = undefined;
```

### Typing function parameters and return types

This is where TypeScript becomes genuinely useful. Functions in JavaScript are the biggest source of type bugs because there's no enforcement on what goes in or comes out.

```typescript
// annotate parameters
function greet(firstName: string): void {
  console.log(`Hello, ${firstName}!`);
}

greet("Eshan"); // works
greet(123); // ERROR: Argument of type 'number' is not assignable to parameter of type 'string'
```

The `: void` after the parentheses is the return type. `void` means the function returns nothing (or undefined). If you return a value from a `void` function, TypeScript will catch that too.

```typescript
// function that returns a number
function sum(a: number, b: number): number {
  return a + b;
}

// TypeScript can also infer the return type - you don't always have to write it
// but being explicit is clearer for others reading your code
function multiply(a: number, b: number) {
  return a * b; // TypeScript infers this returns number
}
```

> **Quick exercise:** Write a function called `isAdult` that takes an `age: number` and returns a `boolean`. Return `true` if age is 18 or more. Annotate both the parameter type and the return type explicitly. Try calling it with a string, what does TypeScript say?

<details>
<summary>Solution</summary>

```typescript
function isAdult(age: number): boolean {
  if (age >= 18) {
    return true;
  }
  return false;
}

// Or the same thing, shorter:
function isAdult(age: number): boolean {
  return age >= 18;
}

isAdult(20); // true
isAdult("twenty"); // ERROR at compile time - caught before it runs
```

TypeScript infers the return type as `boolean` even without the annotation because it sees that both branches return boolean literals. But writing it explicitly is still good practice, it documents intent and TypeScript will error if you accidentally return the wrong type.

</details>

### Type inference: TypeScript is smart

You don't always have to write the type. TypeScript figures it out from context:

```typescript
let count = 5; // TypeScript infers: count is number
count = "five"; // ERROR - TypeScript already knows count should be number

const name = "Eshan"; // TypeScript infers: name is string (and specifically type "Eshan" for const)
```

This is called _type inference_ and it's one of the things that makes TypeScript comfortable to use. You get type safety without writing types everywhere.

### Functions as arguments (callbacks)

You can type functions that are passed as arguments:

```typescript
// The type of the fn parameter says: "a function that takes no args and returns void"
function runAfterDelay(fn: () => void): void {
  setTimeout(fn, 1000);
}

runAfterDelay(() => console.log("hello")); // works
runAfterDelay("not a function"); // ERROR
```

The syntax `() => void` is a function type. `(a: number, b: string) => boolean` would be a function that takes a number and a string and returns a boolean.

> Checkpoint: you should see assigning a string to a number variable show a red squiggle in the editor and an error from `tsc`.

## Part 6 of 8: Interfaces: Typing Objects

Primitive types are for simple values. For objects, TypeScript uses **interfaces**.

An interface is a blueprint that describes the shape of an object, what fields it has and what types those fields are.

```typescript
interface User {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
}
```

Now you can use `User` as a type anywhere:

```typescript
function printUser(user: User): void {
  console.log(`${user.firstName} ${user.lastName} - ${user.email}`);
}

// This works - object matches the interface exactly
printUser({
  firstName: "Eshan",
  lastName: "Studio",
  email: "eshan@example.com",
  age: 22,
});

// This fails - missing the 'age' field
printUser({
  firstName: "Eshan",
  lastName: "Studio",
  email: "eshan@example.com",
  // age is missing - ERROR
});
```

### Optional fields

Sometimes a field might not always be present. Use `?` to mark it optional:

```typescript
interface User {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phoneNumber?: string; // optional - may or may not exist
}

// Both of these are valid now
const user1: User = {
  firstName: "A",
  lastName: "B",
  email: "a@b.com",
  age: 20,
};
const user2: User = {
  firstName: "A",
  lastName: "B",
  email: "a@b.com",
  age: 20,
  phoneNumber: "9999",
};
```

### Interfaces with functions

Interfaces can also describe methods:

```typescript
interface Person {
  name: string;
  age: number;
  greet(phrase: string): void;
}
```

### Implementing interfaces with classes

This is where interfaces connect to OOP. A class can _implement_ an interface, promising that it will have all the fields and methods the interface describes:

```typescript
interface Person {
  name: string;
  age: number;
  greet(phrase: string): void;
}

class Employee implements Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet(phrase: string): void {
    console.log(`${phrase} ${this.name}`);
  }
}

class Manager implements Person {
  name: string;
  age: number;
  department: string;

  constructor(name: string, age: number, department: string) {
    this.name = name;
    this.age = age;
    this.department = department;
  }

  greet(phrase: string): void {
    console.log(`${phrase} ${this.name} from ${this.department}`);
  }
}
```

Both `Employee` and `Manager` implement `Person`. This means you can write functions that accept `Person` and they will work with both classes. This is the concept of _polymorphism_, one interface, multiple implementations.

```typescript
function introduceEveryone(people: Person[]): void {
  people.forEach((person) => person.greet("Hello, I am"));
}

introduceEveryone([
  new Employee("Alice", 28),
  new Manager("Bob", 35, "Engineering"),
]);
```

> **Exercise:** Write an interface called `Shape` with a `name: string` field and a `calculateArea(): number` method. Then write two classes: `Rectangle` (with `width` and `height`) and `Circle` (with `radius`). Both should implement `Shape`. Calculate area correctly for each. Write a function that takes an array of `Shape` and prints the name and area of each. Try it with an array containing both rectangles and circles.

<details>
<summary>Solution</summary>

```typescript
interface Shape {
  name: string;
  calculateArea(): number;
}

class Rectangle implements Shape {
  name = "Rectangle";

  constructor(
    public width: number,
    public height: number,
  ) {}

  calculateArea(): number {
    return this.width * this.height;
  }
}

class Circle implements Shape {
  name = "Circle";

  constructor(public radius: number) {}

  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

function printShapeInfo(shapes: Shape[]): void {
  shapes.forEach((shape) => {
    console.log(`${shape.name}: area = ${shape.calculateArea().toFixed(2)}`);
  });
}

printShapeInfo([new Rectangle(4, 5), new Circle(3), new Rectangle(10, 2)]);
```

Notice the `public width: number` shorthand in the constructor. TypeScript allows you to declare and assign class properties directly in the constructor parameters using `public`, `private`, or `protected`. This is a very common pattern, it removes the need to write `this.width = width` in the body.

Also note: you could write an `abstract class` instead of an interface here, and the behavior would be similar. The difference is that abstract classes can have method implementations while interfaces are purely a description. For pure shape contracts like this, an interface is the right choice.

</details>

> Checkpoint: you should see an object missing a required field give an error that names the missing property.

> **Good place to stop.** Everything above is saved in your repo and your head. Next up: *Types: Interfaces But More Flexible*.

## Part 7 of 8: Types: Interfaces But More Flexible

`type` is another way to define types in TypeScript. On the surface it looks similar to `interface`:

```typescript
type User = {
  firstName: string;
  lastName: string;
  age: number;
};
```

But `type` has two superpowers that `interface` doesn't.

### Unions: a value can be one of several types

```typescript
type StringOrNumber = string | number;

function printId(id: StringOrNumber): void {
  console.log(`ID: ${id}`);
}

printId(101); // works
printId("abc"); // also works
printId(true); // ERROR - boolean is not string or number
```

This is something you genuinely cannot do with `interface`. You cannot say "this interface is either shape A or shape B." But with `type` and the `|` operator, you can.

Union types become really useful when handling API responses or function arguments that can legitimately be different types:

```typescript
type ApiResponse =
  | {
      success: true;
      data: string[];
    }
  | {
      success: false;
      error: string;
    };

function handleResponse(res: ApiResponse): void {
  if (res.success) {
    console.log(res.data); // TypeScript knows data exists here
  } else {
    console.log(res.error); // TypeScript knows error exists here
  }
}
```

This pattern is called a _discriminated union_ and it's one of the most useful things in TypeScript. TypeScript is smart enough to narrow the type based on the condition you check.

### Intersection: combine multiple types into one

```typescript
type Employee = {
  name: string;
  startDate: Date;
};

type Manager = {
  name: string;
  department: string;
};

type TeamLead = Employee & Manager;

const lead: TeamLead = {
  name: "Eshan",
  startDate: new Date(),
  department: "Engineering",
};
```

`&` combines both types. The result must satisfy all fields of both. Think of `|` as "or" and `&` as "and."

### When to use interface vs type

This comes up a lot. The honest answer is: for most things they're interchangeable. But a general rule that works well:

- Use `interface` when describing the shape of objects and classes, especially when you might need to _implement_ it with a class.
- Use `type` when you need unions, intersections, or are working with primitives.

In real codebases you will see both. Don't overthink this distinction early on.

> **Quick exercise:** Create a type called `Result` that can be either `{ ok: true, value: number }` or `{ ok: false, error: string }`. Write a function `divide(a: number, b: number): Result` that returns the division result if `b` is not zero, and an error result if it is. TypeScript should force you to handle both cases at the call site.

<details>
<summary>Solution</summary>

```typescript
type Result = { ok: true; value: number } | { ok: false; error: string };

function divide(a: number, b: number): Result {
  if (b === 0) {
    return { ok: false, error: "Cannot divide by zero" };
  }
  return { ok: true, value: a / b };
}

const result = divide(10, 2);

if (result.ok) {
  console.log("Result:", result.value); // TypeScript knows .value exists
} else {
  console.log("Error:", result.error); // TypeScript knows .error exists
}
```

Try accessing `result.value` without the `if (result.ok)` check. TypeScript will error because `value` only exists on the success variant. This is the whole point, TypeScript forces you to handle both cases, which means your code is actually correct.

</details>

> Checkpoint: you should see a union type accept both allowed values and reject a third one.

## Part 8 of 8: Arrays in TypeScript

Typing arrays is simple: just add `[]` after the element type:

```typescript
const numbers: number[] = [1, 2, 3, 4, 5];
const names: string[] = ["Alice", "Bob"];
const flags: boolean[] = [true, false, true];
```

Or use the generic syntax (both are identical):

```typescript
const numbers: Array<number> = [1, 2, 3];
```

### Arrays of objects

```typescript
interface User {
  firstName: string;
  lastName: string;
  age: number;
}

const users: User[] = [
  { firstName: "Alice", lastName: "Smith", age: 25 },
  { firstName: "Bob", lastName: "Jones", age: 30 },
];

// Now TypeScript knows what each element looks like
users[0].firstName; // TypeScript autocompletes this
users[0].nonExistent; // ERROR - field doesn't exist on User
```

> **Exercise:** Given this interface and array:
>
> ```typescript
> interface User {
>   firstName: string;
>   lastName: string;
>   age: number;
> }
>
> const users: User[] = [
>   { firstName: "Alice", lastName: "Smith", age: 17 },
>   { firstName: "Bob", lastName: "Jones", age: 30 },
>   { firstName: "Carol", lastName: "White", age: 16 },
>   { firstName: "Dave", lastName: "Brown", age: 22 },
> ];
> ```
>
> Write a function `filterAdults(users: User[]): User[]` that returns only users who are 18 or older. Use `.filter()`. Then write a second function `getFullNames(users: User[]): string[]` that uses `.map()` to get full names in the format "FirstName LastName".

<details>
<summary>Solution</summary>

```typescript
function filterAdults(users: User[]): User[] {
  return users.filter((user) => user.age >= 18);
}

function getFullNames(users: User[]): string[] {
  return users.map((user) => `${user.firstName} ${user.lastName}`);
}

const adults = filterAdults(users);
console.log(getFullNames(adults)); // ["Bob Jones", "Dave Brown"]
```

Notice that the return types are explicitly annotated. TypeScript would infer them correctly even without the annotation, but writing them explicitly makes the function signature a clear contract: "give me an array of User, I give back an array of User."

</details>

> Checkpoint: you should see pushing the wrong type into a typed array fail to compile.

## Patterns I follow from day one

**Let inference do the easy work.** Write `const count = 5`, not `const count: number = 5`. Annotate where types cross a boundary, not on every line.

**Annotate the edges.** Function parameters, return types and exported values are where types pay off. Inside a function, let TypeScript figure it out.

**Shape first, code second.** When I get stuck, I write the interface for the data before the function that handles it. The function often writes itself.

## Solo rep: Types from memory

> **Level 5: From memory.** Rebuild a core piece with no references at all, then compare with the post. No copy paste and no AI help. Docs are fine after 10 minutes stuck.

No references at all. Write a `Post` interface with an optional `tags` array, a `Status` union (`"draft" | "published"`), and a function `summarize(post: Post): string`. Compile it with `tsc`, then break it on purpose in two ways and read the errors.

<details>
<summary>Check yourself, only after you try</summary>

```ts
interface Post {
  id: number;
  title: string;
  status: Status;
  tags?: string[];
}

type Status = "draft" | "published";

function summarize(post: Post): string {
  return `${post.title} (${post.status})`;
}
```

</details>

## Projects

These projects touch every concept from this post. Start with the first one and work upward.

### 1. Todo CLI with Types (Beginner)

Build a command-line todo manager using TypeScript. It should run with `ts-node` directly.

**What it should do:**

- Add a todo with a title and an optional priority (use an enum: `Low`, `Medium`, `High`)
- List all todos
- Mark a todo as done (by its ID)
- Filter todos by priority

**Types you will need:** `Todo` interface with `id`, `title`, `priority`, `done`. `Priority` enum. Functions for each operation with proper type annotations.

> **Solo gate:** set a 15 minute timer and build this without opening the solution. Stuck at minute 10? Open only the first step, then close it and keep typing. Typing it yourself is the point.

<details>
<summary>Stuck? Solution, one step at a time</summary>

Steps are in order. Open only the one you are stuck on, then close it and type it yourself.

<details>
<summary>Step 1 of 4: todo.ts</summary>

```typescript
// todo.ts
import * as readline from "readline";

enum Priority {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

interface Todo {
  id: number;
  title: string;
  priority: Priority;
  done: boolean;
  createdAt: Date;
}
```

</details>

<details>
<summary>Step 2 of 4: let todos: Todo[] = [];</summary>

```typescript
let todos: Todo[] = [];
let nextId = 1;

function addTodo(title: string, priority: Priority = Priority.Medium): Todo {
  const todo: Todo = {
    id: nextId++,
    title,
    priority,
    done: false,
    createdAt: new Date(),
  };
  todos.push(todo);
  return todo;
}
```

</details>

<details>
<summary>Step 3 of 4: function markDone(id: number): boolean</summary>

```typescript
function markDone(id: number): boolean {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return false;
  todo.done = true;
  return true;
}

function filterByPriority(priority: Priority): Todo[] {
  return todos.filter((t) => t.priority === priority);
}

function listTodos(): void {
  if (todos.length === 0) {
    console.log("No todos yet.");
    return;
  }
  todos.forEach((todo) => {
    const status = todo.done ? "[x]" : "[ ]";
    console.log(`${status} #${todo.id} [${todo.priority}] ${todo.title}`);
  });
}
```

</details>

<details>
<summary>Step 4 of 4: Quick test</summary>

```typescript
// Quick test
addTodo("Learn TypeScript basics", Priority.High);
addTodo("Build a project", Priority.Medium);
addTodo("Read docs", Priority.Low);
addTodo("Write tests", Priority.High);

markDone(1);

console.log("All todos:");
listTodos();

console.log("\nHigh priority only:");
filterByPriority(Priority.High).forEach((t) => {
  console.log(`  ${t.done ? "[x]" : "[ ]"} ${t.title}`);
});
```

</details>

Run it with: `npx ts-node todo.ts`

Notice how the type system made the code almost write itself. When you wrote `todo.id++` you got an error because `id` should not be modified. When you tried to access a field that doesn't exist on `Todo`, TypeScript caught it. This is the everyday value.

</details>

## If lost / If bored

- If lost: a red squiggle you do not understand: hover for the full message and read it from the bottom line up. `tsc` compiling to the wrong place usually means `rootDir` or `outDir` in `tsconfig.json` is off.
- If bored: jump to the Todo CLI project and type it out.
- Keep for next: your `tsconfig.json` and the Todo project. [The TypeScript generics post](../21-typescript-generics-and-modules/) builds on both.

## What breaks next

You know the foundations. How do you make types reusable across a whole project?

[Where we are and what is next](../progress/)
