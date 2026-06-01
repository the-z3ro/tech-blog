---
title: "10 : TypeScript - JavaScript But It Yells at You First"
date: 2026-05-31T12:00:00+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 10
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

> **Blog Summary:** JavaScript is great until your app crashes at 2am because someone passed a string where a number was expected. TypeScript fixes that. This post covers TypeScript from the ground up - types, interfaces, generics, enums, tsconfig, and how to actually use all of this in real code. By the end you will build a fully typed REST API with Express.

---

So I have been writing JavaScript for a while now. And at some point the codebase grew big enough that I started getting these bugs that should never exist. Like calling `.toUpperCase()` on something that turned out to be `undefined` at runtime. Or a function expecting an object with a `name` field but someone passing in just a string. These are not logic bugs. They are type bugs. And TypeScript is specifically designed to catch them before your code even runs.

The way I understand TypeScript is: it is JavaScript, but the compiler reads your code before executing it and goes "hey this doesn't make sense, fix it." That's it. That is the core value.

---

## 1. Strongly Typed vs Loosely Typed - The Foundation

Before we get into TypeScript itself, it helps to understand why it exists.

Programming languages have a concept of typing. Some languages are _strongly typed_ - meaning once you say a variable is a number, it stays a number. You cannot just reassign it to a string. Examples are Java, C++, Go, Rust. If you try to do something that doesn't match the type, the code literally won't compile. The error happens before execution.

Other languages are _loosely typed_ - the type of a variable can change freely at runtime. JavaScript, Python, PHP, Perl are in this category. This is flexible and fast to write, but it means type-related bugs only surface when the code actually runs. Sometimes in production. Sometimes at 2am.

```js
// JavaScript - loosely typed, this works fine
let number = 10;
number = "text"; // now it's a string - no error, no warning

// C++ - strongly typed, this won't even compile
int number = 10;
number = "text"; // COMPILE ERROR
```

People realized JavaScript is a very powerful language but it lacks types. So TypeScript was created - it adds a type layer on top of JavaScript while keeping all the flexibility you're used to. You still write familiar JS syntax, but now you can annotate types and the TypeScript compiler will catch mismatches before your code runs.

---

## 2. What Is TypeScript Exactly

TypeScript is a programming language made and maintained by Microsoft. At its core it is a _superset_ of JavaScript - which means every valid JavaScript file is also a valid TypeScript file. TypeScript only adds things on top. It never removes anything from JS.

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

During this compilation step, TypeScript performs type checking. If there is a type error anywhere in your code, the compilation fails and it tells you exactly what's wrong. No JavaScript file gets produced. This is the whole point - catch errors at compile time, not at runtime.

There are actually several tools that can compile TypeScript to JavaScript:

- `tsc` - the official TypeScript compiler from Microsoft
- `esbuild` - extremely fast, written in Go, used by Vite
- `swc` - written in Rust, used by Next.js
- `ts-node` - lets you run TypeScript files directly in Node without a separate compile step (for development)

For learning, `tsc` is the right starting point. For production projects you will often use `esbuild` or `swc` because they are much faster.

---

## 3. Setting Up - Your First TypeScript Project

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

`tsc --init` creates a `tsconfig.json` file - this is the configuration file for the TypeScript compiler. We will go through the important settings in a bit.

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
x = "harkirat"; // try to assign a string to a number variable
console.log(x);
```

Run `tsc -b` again. You will see something like:

```
a.ts:2:5 - error TS2322: Type 'string' is not assignable to type 'number'.
Found 1 error.
```

And crucially - no `a.js` file is created. The compilation failed. That is exactly the behavior you want. The error is caught before the code runs anywhere.

> **Try it yourself:** Before reading further, change the type from `number` to `string` and try assigning a number to it. What happens? Then try `any` as the type and assign both - what happens now? (Hint: `any` is the escape hatch that basically turns off type checking for that variable.)

---

## 4. The tsconfig.json - Telling the Compiler How to Behave

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

Without a type annotation, TypeScript tries to infer the type. If it cannot infer it, it falls back to `any`. With `noImplicitAny: true`, that fallback is not allowed - TypeScript will throw an error forcing you to explicitly annotate.

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

---

## 5. Basic Types - The Building Blocks

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

> **Quick exercise:** Write a function called `isAdult` that takes an `age: number` and returns a `boolean`. Return `true` if age is 18 or more. Annotate both the parameter type and the return type explicitly. Try calling it with a string - what does TypeScript say?

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

TypeScript infers the return type as `boolean` even without the annotation because it sees that both branches return boolean literals. But writing it explicitly is still good practice - it documents intent and TypeScript will error if you accidentally return the wrong type.

</details>

### Type inference - TypeScript is smart

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

---

## 6. Interfaces - Typing Objects

Primitive types are for simple values. For objects, TypeScript uses **interfaces**.

An interface is a blueprint that describes the shape of an object - what fields it has and what types those fields are.

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

Both `Employee` and `Manager` implement `Person`. This means you can write functions that accept `Person` and they will work with both classes. This is the concept of _polymorphism_ - one interface, multiple implementations.

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

Notice the `public width: number` shorthand in the constructor. TypeScript allows you to declare and assign class properties directly in the constructor parameters using `public`, `private`, or `protected`. This is a very common pattern - it removes the need to write `this.width = width` in the body.

Also note: you could write an `abstract class` instead of an interface here, and the behavior would be similar. The difference is that abstract classes can have method implementations while interfaces are purely a description. For pure shape contracts like this, an interface is the right choice.

</details>

---

## 7. Types - Interfaces But More Flexible

`type` is another way to define types in TypeScript. On the surface it looks similar to `interface`:

```typescript
type User = {
  firstName: string;
  lastName: string;
  age: number;
};
```

But `type` has two superpowers that `interface` doesn't.

### Unions - a value can be one of several types

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

### Intersection - combine multiple types into one

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

- Use `interface` when describing the shape of objects and classes - especially when you might need to _implement_ it with a class.
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

Try accessing `result.value` without the `if (result.ok)` check. TypeScript will error because `value` only exists on the success variant. This is the whole point - TypeScript forces you to handle both cases, which means your code is actually correct.

</details>

---

## 8. Arrays in TypeScript

Typing arrays is straightforward - just add `[]` after the element type:

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

---

## 9. Enums - Named Constants

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

This is simpler, requires no compilation magic, and works identically at runtime. Enums generate actual JavaScript code; union types of string literals are compile-only and produce zero runtime overhead. Both are valid - know that both options exist.

</details>

---

## 10. Generics - Write Once, Work for Any Type

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

The `<T>` is a _type parameter_ - a placeholder for whatever type you actually use. When you call the function:

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

---

## 11. Exporting and Importing - Splitting Code Across Files

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

In larger projects you typically have a `types.ts` or `types/index.ts` file where all your shared interfaces and types live. This is a very clean pattern - one source of truth for all your data structures.

---

## 12. A Few More Things You Will Encounter

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

---

## Patterns I Noticed After Using TypeScript for a While

These are things nobody explains upfront but they save a lot of time.

**TypeScript does not fix bad code, it documents it.** The types you write are a form of documentation. If your function takes a 200-field mega-object when it only needs two fields, TypeScript won't complain - but it is still bad design. Use specific types for function parameters. A function that needs a user's email and age should take `{ email: string; age: number }` not the entire `User` object.

**Start with strict mode from day one.** Turning on `"strict": true` in your tsconfig when you already have a large codebase is painful. Do it from the start. Every project. Always.

**Avoid `any` like it has a communicable disease.** Every time you write `any`, you are opting out of TypeScript. Your code compiles, TypeScript smiles, bugs happen at runtime. If you genuinely don't know the type yet, use `unknown` instead - it forces you to narrow the type before doing anything with the value.

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

**Types are erased at runtime.** TypeScript types exist only in your source code. The compiled JavaScript has zero type information. This means you cannot do `if (variable instanceof MyInterface)` - interfaces don't exist at runtime. For runtime type checking you still need regular JS techniques like `typeof`, `instanceof`, or a validation library.

**The TypeScript error messages look scary but become readable.** At first, TypeScript errors are walls of text. After a few weeks you learn to read them from bottom to top - the bottom line is usually the actual problem, the top part is context about where it happened.

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

This combination - TypeScript for compile-time safety, Zod for runtime validation - is the standard pattern in production TypeScript backends.

---

## Mini Projects - Build Something Real

These projects touch every concept from this post. Start with the first one and work upward.

### Project 1: Todo CLI with Types (Beginner)

Build a command-line todo manager using TypeScript. It should run with `ts-node` directly.

**What it should do:**

- Add a todo with a title and an optional priority (use an enum: `Low`, `Medium`, `High`)
- List all todos
- Mark a todo as done (by its ID)
- Filter todos by priority

**Types you will need:** `Todo` interface with `id`, `title`, `priority`, `done`. `Priority` enum. Functions for each operation with proper type annotations.

<details>
<summary>Solution with explanation</summary>

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

Run it with: `npx ts-node todo.ts`

Notice how the type system made the code almost write itself. When you wrote `todo.id++` you got an error because `id` should not be modified. When you tried to access a field that doesn't exist on `Todo`, TypeScript caught it. This is the everyday value.

</details>

---

### Project 2: Typed Express API (Intermediate)

Build a REST API for a simple user management system. This is the real thing - TypeScript + Express together, which is how almost every Node.js production backend is written.

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

**What to build:**

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

---

### Project 3: GitHub Stats Dashboard (Intermediate, No Backend Needed)

Build a typed React app that shows GitHub user statistics. This uses TypeScript + React + fetch, everything typed end to end.

Setup:

```bash
npm create vite@latest github-stats -- --template react-ts
cd github-stats
npm install
npm run dev
```

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

The `FetchState<T>` discriminated union type is a genuinely useful pattern. Instead of having three separate booleans (`isLoading`, `isError`, `isSuccess`) that can all be true simultaneously in a buggy state, you have one state that can only ever be one thing at a time. TypeScript will narrow it correctly inside each `if` block. This is a pattern worth taking with you into every project.

---

## Common Confusions

| Confusion                                            | Reality                                                                                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| "TypeScript runs in the browser"                     | No. TypeScript compiles to JavaScript first. The browser runs the compiled JS.                                                      |
| "TypeScript and JavaScript types are the same thing" | TS types only exist at compile time. At runtime it is all plain JavaScript - no types anywhere.                                     |
| "`any` is fine for now, I'll fix it later"           | You won't. Use `unknown` instead if you genuinely don't know.                                                                       |
| "interface and type are completely different"        | For object shapes they're nearly identical. Use `interface` for classes and extendable shapes, `type` for unions and intersections. |
| "TypeScript makes my code safer at runtime"          | It doesn't. External data (API responses, user input) is untyped at runtime. You need Zod or similar for that.                      |
| "Generics are only for library authors"              | You'll use generics constantly for API response wrappers, utility functions, and custom hooks.                                      |

---

## Key Takeaways

- TypeScript is JavaScript with types. It compiles to plain JS. The browser never sees TypeScript.
- The biggest value is catching errors at compile time, not at runtime in production.
- `interface` for object shapes and class contracts. `type` for unions and intersections.
- Generics let you write functions and types that work with any type while preserving type information.
- Enums give named constants - useful for finite sets of values like roles, statuses, directions.
- `strict: true` in tsconfig from day one. Always.
- Avoid `any`. Use `unknown` when you don't know the type yet.
- Utility types like `Partial`, `Pick`, `Omit`, `Readonly` save a lot of boilerplate.
- TypeScript cannot validate runtime data. Use Zod for that.
- The pattern `type FetchState<T> = { status: "idle" } | { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: string }` is something you will use in almost every async-heavy project.
