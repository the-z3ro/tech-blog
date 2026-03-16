---
title: "01 : Js Foundation"
date: 2026-03-13T23:19:51+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 1
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

> **Blog Summary:** The bedrock of the course. Covers why JS exists, how it runs, and the async programming model that makes JS unique and powerful for web development.

---

## 1. Why Programming Languages?

[SOURCE — COURSE MATERIAL]

Computers understand only binary (0s and 1s). Languages exist so humans can write readable instructions that compilers/interpreters then convert to binary.

```
Human-written code → Compiler → 01010101 → CPU executes
```

**The flow:**

1. Developer writes high-level code (JS, Python, C++)
2. A compiler/runtime converts it to machine code
3. CPU executes machine code from RAM
4. SSD holds the program at rest; RAM holds it while running

---

## 2. Compiled vs Interpreted (Scripting) Languages

[SOURCE — COURSE MATERIAL]

| Type      | Compiled                     | Interpreted / Scripting      |
| --------- | ---------------------------- | ---------------------------- |
| Examples  | C, C++, Go, Rust             | JavaScript, Python           |
| Execution | Must compile first, then run | Runs line by line at runtime |
| Speed     | Faster at runtime            | Slower but flexible          |
| Dev cycle | Compile → Run                | Just run                     |

**C++ compile flow:**

```bash
# Step 1: Write code
# Step 2: Compile
g++ main.cpp -o main
# Step 3: Run
./main
```

**JavaScript — no compile step needed:**

```bash
node index.js   # Just run it
```

[ADDED — EXPLANATION]
JS was originally a scripting language for browsers. The JS engine (V8 in Chrome) compiles JS to machine code just-in-time (JIT) at runtime. This is why JS can be fast even though it's "interpreted."

---

## 3. Why JavaScript Over Other Languages?

[SOURCE — COURSE MATERIAL]

JS dominates web because:

- It's the **only language browsers understand natively**
- Works on **frontend AND backend** (Node.js)
- Huge ecosystem (npm)
- Async model is perfect for I/O-heavy web servers

[ADDED — IMPORTANT BACKGROUND]
JS was not designed to be a backend language. It was created in 1995 by Brendan Eich for Netscape to make web pages interactive. Node.js (2009) changed everything — someone took the V8 engine out of Chrome and added file system/network APIs on top, making JS capable on the backend.

---

## 4. Static vs Dynamic Typing

[SOURCE — COURSE MATERIAL]

```js
// Dynamic (JS) — types are inferred at runtime
let x = 5;        // number
x = "hello";      // now a string — totally fine

// Static (TypeScript / Java) — type declared, enforced
let x: number = 5;
x = "hello";      // ERROR at compile time
```

**Implication:** JS is flexible but error-prone. TypeScript adds types on top (covered later).

---

## 5. Single-Threaded Nature of JS

[SOURCE — COURSE MATERIAL]

JS has **one call stack** — it can only do one thing at a time.

**Mental model:** Your brain is single-threaded — it can truly focus on only one task. But you delegate background tasks (boiling water, washing machine running) and context-switch between quick tasks.

JS does the same:

- **Delegate** long operations (file reads, network) to the browser/OS
- **Context switch** using the event loop

```
JS Thread: executes code → hits async call → delegates → continues → callback fires later
```

---

## 6. JavaScript Primitives

[SOURCE — COURSE MATERIAL]

**Simple Primitives:**

```js
// Number
let age = 25;
let price = 9.99;

// String
let name = "Harkirat";
let greeting = `Hello, ${name}!`; // template literal

// Boolean
let isLoggedIn = true;
let hasPaid = false;

// Null / Undefined
let nothing = null; // explicitly nothing
let unknown; // undefined — declared but no value
```

**Complex Primitives (Reference Types):**

```js
// Array
let fruits = ["apple", "banana", "cherry"];
fruits[0]; // "apple"
fruits.push("mango"); // adds to end
fruits.length; // 4

// Object
let user = {
  name: "Harkirat",
  age: 25,
  isAdmin: false,
};
user.name; // "Harkirat"
user["age"]; // 25 — bracket notation
```

---

## 7. Functions

[SOURCE — COURSE MATERIAL]

A function takes input, does something, returns output.

```js
// Function declaration
function add(a, b) {
  return a + b;
}

// Function expression (stored in variable)
const multiply = function (a, b) {
  return a * b;
};

// Arrow function (modern, concise)
const square = (n) => n * n;

// Calling
add(3, 4); // 7
square(5); // 25
```

**Why functions? DRY principle (Don't Repeat Yourself):**

```js
// BAD — repeated logic
console.log(1 * 1);
console.log(2 * 2);
console.log(3 * 3);

// GOOD — reusable function
function printSquare(n) {
  console.log(n * n);
}
printSquare(1);
printSquare(2);
printSquare(3);
```

---

## 8. Loops

[SOURCE — COURSE MATERIAL]

```js
// For loop — sum from 1 to 100
let sum = 0;
for (let i = 1; i <= 100; i++) {
  sum += i;
}
console.log(sum); // 5050

// While loop
let count = 0;
while (count < 5) {
  console.log(count);
  count++;
}

// Array iteration
const nums = [1, 2, 3, 4, 5];
for (let i = 0; i < nums.length; i++) {
  console.log(nums[i]);
}
// Modern style:
nums.forEach((n) => console.log(n));
```

---

## 9. Callback Functions

[SOURCE — COURSE MATERIAL]

A callback is a **function passed as an argument** to another function, to be called later.

```js
// Basic callback concept
function doMath(a, b, operation) {
  return operation(a, b);
}

function add(x, y) {
  return x + y;
}
function multiply(x, y) {
  return x * y;
}

doMath(3, 4, add); // 7
doMath(3, 4, multiply); // 12

// Anonymous callback (no separate function)
doMath(3, 4, function (x, y) {
  return x - y;
}); // -1
doMath(3, 4, (x, y) => x ** y); // 81 (arrow function)
```

[ADDED — EXPLANATION]
Callbacks are the foundation of async programming in JS. When you say "call this function when you're done," that's a callback.

---

## 10. Asynchronous Programming

[SOURCE — COURSE MATERIAL]

### Problem: Synchronous blocking

```js
// Everything stops while waiting
const data = readFile("large-file.txt"); // blocks for 5 seconds
console.log("This prints after 5 seconds"); // bad!
```

### Async solution — delegate and continue:

```js
// setTimeout — basic async function
console.log("1: Start");

setTimeout(function () {
  console.log("3: Callback fires after 1 second");
}, 1000);

console.log("2: This runs immediately");

// Output:
// 1: Start
// 2: This runs immediately
// 3: Callback fires after 1 second
```

### Real async functions:

```js
const fs = require("fs");

// Non-blocking file read
fs.readFile("data.txt", "utf8", function (error, content) {
  if (error) {
    console.log("Error reading file:", error);
    return;
  }
  console.log("File contents:", content);
});

console.log("This runs before file is read!"); // prints first
```

---

## 11. The Event Loop

[SOURCE — COURSE MATERIAL]

[ADDED — IMPORTANT BACKGROUND]
The event loop is JavaScript's mechanism for handling async operations despite being single-threaded.

```
Call Stack        Web APIs/OS        Callback Queue
─────────         ──────────         ──────────────
main()    ──→  setTimeout (1s timer)
              fs.readFile
              fetch

When complete: callback is pushed to Callback Queue
Event loop checks: if Call Stack is empty, push from Queue → Stack
```

**Visualization:** http://latentflip.com/loupe — highly recommended

**Key rule:** A callback only executes when the call stack is **completely empty**.

---

## 12. Callback Hell

[SOURCE — COURSE MATERIAL]

```js
// The "Pyramid of Doom" — deeply nested callbacks
setTimeout(function () {
  console.log("After 1 second");
  setTimeout(function () {
    console.log("After 2 more seconds");
    setTimeout(function () {
      console.log("After 3 more seconds");
      // imagine 10 more levels...
    }, 3000);
  }, 2000);
}, 1000);
```

---

## 13. Promises

[SOURCE — COURSE MATERIAL]

Promises are syntactic sugar over callbacks. They make async code readable.

```js
// Creating a Promise
function wait(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve("Done waiting!");
    }, ms);
  });
}

// Using .then() chaining — NO nesting!
wait(1000)
  .then(function (result) {
    console.log(result); // "Done waiting!"
    return wait(2000);
  })
  .then(function (result) {
    console.log("Two more seconds passed");
  })
  .catch(function (error) {
    console.log("Something went wrong:", error);
  });
```

**Promise states:**

- `pending` — initial, waiting
- `fulfilled` — resolved successfully
- `rejected` — failed

---

## 14. Async/Await

[SOURCE — COURSE MATERIAL]

Async/await is syntactic sugar over Promises. Reads like synchronous code.

```js
// Same logic as above, much cleaner
async function main() {
  try {
    const result = await wait(1000);
    console.log(result); // "Done waiting!"

    await wait(2000);
    console.log("Two more seconds passed");
  } catch (error) {
    console.log("Error:", error);
  }
}

main();
```

**Rules:**

- `async` keyword makes a function return a Promise
- `await` pauses execution until Promise resolves (only inside `async` functions)
- Always wrap in `try/catch`

---

## 15. Array Methods: map & filter

[SOURCE — COURSE MATERIAL]

```js
const numbers = [1, 2, 3, 4, 5, 6];

// map — transform each element
const doubled = numbers.map((n) => n * 2);
// [2, 4, 6, 8, 10, 12]

// filter — keep elements that pass a test
const evens = numbers.filter((n) => n % 2 === 0);
// [2, 4, 6]

// Chain them
const doubledEvens = numbers.filter((n) => n % 2 === 0).map((n) => n * 2);
// [4, 8, 12]
```

---

## Exercises

### Quick (10–15 min)

Write a function `sumArray(arr)` that returns the sum of all elements using a `for` loop. Then rewrite it using `reduce`.

**Hint 1:** `reduce` takes a callback and an initial value.  
**Hint 2:** `arr.reduce((acc, curr) => acc + curr, 0)`

**Common mistakes:** Forgetting the initial value `0` in reduce.

---

### Intermediate (30–60 min)

Create a function `fetchAndLog(url)` that:

1. Fetches data from a URL (use Node's `https` module or browser `fetch`)
2. Logs the result after 2 seconds (use `setTimeout`)
3. Handles errors gracefully

**Expected behavior:** Data prints after delay. If URL is bad, logs an error.  
**Hint 1:** Chain `.then()` before `setTimeout`, or use `await`.  
**Hint 2:** Wrap in `async/await` with `try/catch`.

---

### Challenge (1–2 hours)

Implement your own `Promise` class from scratch (simplified):

- Constructor takes an executor function with `resolve` and `reject`
- `.then()` method registers success handler
- `.catch()` registers error handler

---

## Common Confusions

| Confusion                                     | Reality                                                               |
| --------------------------------------------- | --------------------------------------------------------------------- |
| "Async means parallel"                        | No. JS is still single-threaded. Async means non-blocking delegation. |
| "`await` pauses JS entirely"                  | No. It pauses the current `async` function only. Other code can run.  |
| "Promises and callbacks are different things" | Promises are built ON callbacks. They're just cleaner syntax.         |
| "Arrow functions are just shorter syntax"     | They also don't have their own `this` — important for OOP.            |

---

## Key Takeaways

- JS is single-threaded, interpreted, dynamically typed
- Async programming is the core superpower of JS — delegation + event loop
- Callbacks → Promises → Async/Await: each solves readability of the last
- `map` and `filter` are functional programming tools — prefer them over manual loops for transformations
