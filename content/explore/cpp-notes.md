---
title: "C++ for DSA & Competitive Programming"
date: 2026-03-18T19:32:06+05:30
draft: false
tags: []
categories: []
author: "Eshan"
showToc: true
TocOpen: false
weight: 0
hiddenInHomeList: false
description: ""
cover:
  image: ""
  alt: ""
  caption: ""
---

### Complete Notes — From Zero to Solving Problems

> **How to use these notes:** Read each section once top to bottom. Then close the notes and try to recall the patterns. Come back only to verify. Retention comes from recall, not re-reading.

---

## 1. The Mindset

This is not a general C++ course. The goal is one thing:

> **Algorithm idea → immediate, clean C++ implementation**

Every concept in these notes exists to eliminate the friction between knowing how to solve a problem and actually writing the code. If a topic does not appear in DSA solutions, it is not here.

**Two rules to follow while studying:**

- After reading a concept, type it out yourself. Don't copy-paste. Ever.
- When you see a new pattern in someone else's solution, immediately connect it back to a section here.

---

## 2. Boilerplate

Every competitive programming solution starts with the same skeleton. Memorize this. It should take under 10 seconds to type from scratch.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // your code here

    return 0;
}
```

**Why each line exists:**

`#include <bits/stdc++.h>` — includes every standard library header at once. You never need to include `<vector>`, `<map>`, `<algorithm>` separately. Only works in GCC (standard in competitive programming).

`using namespace std;` — lets you write `vector` instead of `std::vector`, `cout` instead of `std::cout` everywhere.

`ios::sync_with_stdio(false)` — by default, C++ syncs its I/O with C's I/O. This disables that sync. Result: `cin` and `cout` become 5–10x faster. Critical for problems with large input.

`cin.tie(nullptr)` — unties `cin` from `cout`. Without this, every time you use `cin`, it first flushes `cout`. Disabling this saves unnecessary flushes.

**One rule:** After adding these lines, never mix `scanf`/`printf` with `cin`/`cout`. Pick one system and stay with it.

**Useful constants — define these at the top:**

```cpp
const int INF  = 1e9;       // safe "infinity" for int
const int MOD  = 1e9 + 7;   // standard modulo in problems
const int MAXN = 1e5 + 5;   // max array size + buffer

// When int isn't enough
long long big = 1e18;        // ~9.2 × 10^18
```

---

## 3. Block 1 — C++ Features That Reduce Friction

These are not extra features. They are the default way experienced programmers write C++ for DSA. You will use every single one of these in almost every solution you write.

---

### 3.1 `auto` — Stop Writing Long Type Names

`auto` tells the compiler to figure out the type. The type is still there — you just don't have to type it.

```cpp
auto x = 5;           // int
auto y = 3.14;        // double
auto n = v.size();    // size_t — you don't care what this is

// Where it really helps — long iterator types
map<string, vector<int>>::iterator it = m.begin();  // painful
auto it = m.begin();                                 // clean
```

**The rule:** Use `auto` whenever writing the type is longer than writing `auto` or makes the code harder to read.

**The trap:** `auto` without `&` makes a copy. Always think about whether you need a reference.

```cpp
for (auto x : v)    // copies each element — fine for int
for (auto& x : v)   // reference — use for objects, strings, pairs
```

---

### 3.2 Range-Based For Loop — Iterate Without Indices

When you don't need the index, this is cleaner than a traditional loop.

```cpp
vector<int> v = {1, 2, 3, 4, 5};

// Traditional — use when you need the index
for (int i = 0; i < v.size(); i++)
    cout << v[i] << " ";

// Range-based — use when you just need each value
for (auto& x : v)
    cout << x << " ";

// Read-only — when you won't modify elements
for (const auto& x : v)
    cout << x << " ";
```

**The `&` rule — applies everywhere, not just here:**

| You want              | Write                           |
| --------------------- | ------------------------------- |
| Read and modify       | `auto& x`                       |
| Read only, no copy    | `const auto& x`                 |
| A copy you can modify | `auto x` (but ask yourself why) |

For anything larger than a primitive (int, char, bool), always use `&`. Copying strings, pairs, vectors inside a loop is a silent performance killer.

---

### 3.3 Structured Bindings — Unpack Pairs with Real Names

`pair.first` and `pair.second` tell you nothing about what those values mean. Structured bindings let you unpack a pair into named variables.

```cpp
pair<int,int> p = {5, 3};

// Old way — what does first and second mean here?
cout << p.first << " " << p.second;

// Structured binding — meaning is clear
auto& [distance, node] = p;
cout << distance << " " << node;
```

**Most common use — looping over maps and vectors of pairs:**

```cpp
map<string, int> scores = {{"alice", 90}, {"bob", 85}};

// Old way
for (auto& e : scores)
    cout << e.first << ": " << e.second << "\n";

// With structured bindings — immediately clear
for (auto& [name, score] : scores)
    cout << name << ": " << score << "\n";
```

**With priority queue in Dijkstra — the clearest form:**

```cpp
auto [dist, u] = pq.top();
pq.pop();

for (auto& [v, w] : adj[u]) {
    if (dist + w < d[v]) { ... }
}
```

**The `&` rule again:** Write `auto& [a, b]` by default. Without `&` you get copies.

---

### 3.4 References — The Most Important Concept for Performance

A reference is an alias. It is not a copy. It refers to the original variable.

```cpp
int x = 5;
int& ref = x;   // ref is x — same memory location

ref = 10;
cout << x;      // prints 10 — x changed through ref
```

**Why this matters in DSA — function parameters:**

Every time you pass a container to a function, C++ copies it by default. A vector of 100,000 integers copied on every recursive DFS call = guaranteed TLE.

```cpp
// Copies the entire vector every call — O(n) per call
void dfs(int node, vector<vector<int>> adj)  // ❌

// Passes reference — zero copy cost
void dfs(int node, vector<vector<int>>& adj) // ✅
```

**The three patterns you will write constantly:**

```cpp
// Modify the container inside the function
void fill(vector<int>& v)

// Read-only — protect from accidental modification
void print(const vector<int>& v)

// Return by reference (careful — don't return local variable references)
int& getElement(vector<int>& v, int i) { return v[i]; }
```

**The one mistake that crashes programs:**

```cpp
int& bad() {
    int x = 5;
    return x;   // ❌ x dies when function returns — dangling reference
}
```

Never return a reference to a local variable. The variable dies when the function ends. The reference becomes garbage.

---

### 3.5 `const` — Two Uses That Matter in DSA

Forget everything about `const` except these two patterns:

```cpp
// Pattern 1 — fixed values (use these in almost every solution)
const int INF = 1e9;
const int MOD = 1e9 + 7;

// Pattern 2 — read-only function parameters
void solve(const vector<int>& v) {
    v[0] = 5;    // ❌ compiler error — cannot modify
    cout << v[0]; // ✅ reading is fine
}
```

`const` in a function parameter says: "I promise not to modify this. I just need to read it." It's both documentation and a safeguard against bugs.

---

### 3.6 `pair` and `tuple` — Bundling Values

DSA constantly involves values that come in twos or threes: edges (u, v, weight), coordinates (row, col), frequencies (value, count). `pair` and `tuple` bundle these into a single unit.

**`pair` — for two values:**

```cpp
pair<int, int> p = {3, 7};
p.first;    // 3
p.second;   // 7

// In vectors — very common
vector<pair<int,int>> edges;
edges.push_back({0, 1});
edges.push_back({1, 2});

// Comparison is lexicographic — first element compared first
pair<int,int> a = {1, 5};
pair<int,int> b = {1, 3};
a > b;  // true — first elements equal, 5 > 3
```

**`tuple` — for three or more values:**

```cpp
// Edge with weight — 3 values
tuple<int,int,int> edge = {weight, u, v};

// Unpack with structured binding
auto [w, u, v] = edge;

// Or access by index (uglier)
get<0>(edge);   // weight
get<1>(edge);   // u
get<2>(edge);   // v
```

**The classic DSA pattern — value with original index:**

```cpp
vector<int> nums = {40, 10, 30, 20};
vector<pair<int,int>> indexed;

for (int i = 0; i < nums.size(); i++)
    indexed.push_back({nums[i], i});  // {value, original_index}

sort(indexed.begin(), indexed.end());
// Now sorted by value, but you still know original positions
```

---

### 3.7 Lambda Expressions — Inline Logic for Comparators

A lambda is a function you define right where you need it. In DSA, they appear almost exclusively as custom comparators for `sort` and `priority_queue`.

**Anatomy:**

```cpp
[capture](parameters) { body }

// Examples:
auto add = [](int a, int b) { return a + b; };
cout << add(3, 4);  // 7
```

**The only part you need to understand for DSA right now — the comparator rule:**

> A comparator returns `true` if `a` should come **before** `b`. That's the entire rule.

```cpp
// Sort ascending (default behavior)
sort(v.begin(), v.end(), [](auto& a, auto& b) { return a < b; });

// Sort descending
sort(v.begin(), v.end(), [](auto& a, auto& b) { return a > b; });

// Sort pairs by second element ascending
sort(v.begin(), v.end(), [](auto& a, auto& b) {
    return a.second < b.second;
});

// Sort by multiple keys — grade descending, name ascending on tie
sort(v.begin(), v.end(), [](auto& a, auto& b) {
    if (a.grade != b.grade)
        return a.grade > b.grade;
    return a.name < b.name;
});
```

**Capture brackets — when your lambda needs an outside variable:**

```cpp
int threshold = 5;

// [&] — capture all outside variables by reference
auto isAbove = [&](int x) { return x > threshold; };
```

| Capture   | Meaning                            |
| --------- | ---------------------------------- |
| `[]`      | capture nothing                    |
| `[&]`     | all outside variables by reference |
| `[=]`     | all by value (copy)                |
| `[&x, y]` | x by ref, y by value               |

**The fatal comparator mistake — never use `>=` or `<=`:**

```cpp
// ❌ undefined behavior — strict weak ordering violated
sort(v.begin(), v.end(), [](auto& a, auto& b) { return a >= b; });

// ✅ always strict: < or >
sort(v.begin(), v.end(), [](auto& a, auto& b) { return a > b; });
```

---

## 4. Block 2 — Core STL Containers

These are the data structures you will use in every problem. For each container: understand what problem it solves, how to use it, and when to prefer it over alternatives.

---

### 4.1 `vector` — Your Default Array

A vector is a dynamic array. It handles its own sizing. Use it everywhere you would use a plain array.

**Declaring and initializing:**

```cpp
vector<int> v;                         // empty
vector<int> v(5);                      // [0, 0, 0, 0, 0]
vector<int> v(5, 3);                   // [3, 3, 3, 3, 3]
vector<int> v = {1, 2, 3, 4, 5};      // initializer list

// 2D vector — replaces int grid[MAXN][MAXN]
vector<vector<int>> grid(rows, vector<int>(cols, 0));
```

**Core operations:**

```cpp
v.push_back(x);    // add to end — O(1) amortized
v.pop_back();      // remove from end — O(1)
v[i];              // access by index — O(1)
v.size();          // number of elements — O(1)
v.empty();         // true if size == 0
v.clear();         // remove all elements

// Safe size usage — avoids sign comparison warning
int n = v.size();  // store as int, not auto
for (int i = 0; i < n; i++) { ... }
```

**Passing to functions — always by reference:**

```cpp
void process(vector<int>& v)       // modify
void process(const vector<int>& v) // read only
```

**`reserve` — avoid reallocations when size is known:**

```cpp
vector<int> v;
v.reserve(100000);    // allocate space upfront
for (int i = 0; i < 100000; i++)
    v.push_back(i);   // no reallocation happens
```

Without `reserve`, a vector doubles its capacity every time it fills up, triggering a copy of all elements. With `reserve`, you pay the cost once.

---

### 4.2 `stack` — Last In, First Out

Use a stack when you need to process the most recently added item first.

**Problems that need a stack:** valid parentheses, next greater element, undo operations, DFS iterative.

```cpp
stack<int> st;

st.push(10);     // add to top
st.push(20);
st.top();        // see top — 20 (does not remove)
st.pop();        // remove top
st.empty();      // true if empty
st.size();       // number of elements
```

**Critical rule:** Always check `!st.empty()` before calling `top()` or `pop()`. Calling either on an empty stack is undefined behavior (crash).

```cpp
if (!st.empty())
    cout << st.top();   // safe
```

**Classic pattern — valid parentheses:**

```cpp
stack<char> st;
for (char c : s) {
    if (c == '(' || c == '{' || c == '[') {
        st.push(c);
    } else {
        if (st.empty()) return false;
        char top = st.top(); st.pop();
        if (c == ')' && top != '(') return false;
        if (c == '}' && top != '{') return false;
        if (c == ']' && top != '[') return false;
    }
}
return st.empty();
```

---

### 4.3 `queue` — First In, First Out

Use a queue when you process items in arrival order. The primary use in DSA is BFS.

```cpp
queue<int> q;

q.push(10);      // add to back
q.front();       // see front — does not remove
q.back();        // see back — does not remove
q.pop();         // remove from front
q.empty();
q.size();
```

**The most important distinction:** stack uses `top()`, queue uses `front()`. Mixing these up is one of the most common bugs.

---

### 4.4 `deque` — Double-Ended Queue

Like a vector and a queue combined. Efficient push/pop at **both** ends.

```cpp
deque<int> dq;

dq.push_back(x);    // add to back
dq.push_front(x);   // add to front
dq.pop_back();      // remove from back
dq.pop_front();     // remove from front
dq.front();
dq.back();
dq[i];              // random access like vector
```

**When to use:** Sliding window maximum problem — you need to add to one end and remove from both ends efficiently. That's the main DSA use case.

---

### 4.5 `priority_queue` — Always Get the Most Important Element

A priority queue (heap) lets you always extract the maximum (or minimum) element in O(log n), regardless of insertion order.

**Problems:** Dijkstra, k largest elements, greedy algorithms, merge k sorted lists.

```cpp
// Max-heap — default, largest element on top
priority_queue<int> pq;
pq.push(3); pq.push(1); pq.push(4);
pq.top();   // 4 (largest)
pq.pop();   // removes 4
```

**Min-heap — smallest element on top:**

```cpp
priority_queue<int, vector<int>, greater<int>> pq;
// Same API — just smallest comes out first
```

**With pairs — extremely common:**

```cpp
// Max-heap of pairs — compares by first element by default
priority_queue<pair<int,int>> pq;

// Min-heap of pairs — for Dijkstra
priority_queue<pair<int,int>,
    vector<pair<int,int>>,
    greater<pair<int,int>>> pq;

pq.push({dist, node});
auto [d, u] = pq.top(); pq.pop();
```

**The three differences from stack:**

|           | `stack`               | `priority_queue`           |
| --------- | --------------------- | -------------------------- |
| Order     | LIFO                  | By priority                |
| Access    | `top()` — most recent | `top()` — highest priority |
| Insertion | `push()`              | `push()`                   |

Both use `top()` and `pop()`. The difference is only in what `top()` returns.

---

### 4.6 `set` — Sorted Unique Elements

A set stores elements in sorted order with no duplicates. Internal structure is a balanced BST (red-black tree).

**Use when:** You need to know if something exists, get unique elements, or iterate in sorted order.

```cpp
set<int> s;

s.insert(3);
s.insert(1);
s.insert(4);
s.insert(1);    // duplicate — silently ignored

// s = {1, 3, 4}  — sorted, no duplicates

s.count(3);     // 1 if exists, 0 if not — use for existence check
s.find(3);      // iterator to element, or s.end() if not found
s.erase(3);     // remove element
s.size();

// Build from vector — instant dedup + sort
set<int> s(v.begin(), v.end());
```

**Existence check — two ways:**

```cpp
// count — simpler for existence only
if (s.count(x)) { /* exists */ }

// find — when you need to do something with the element too
auto it = s.find(x);
if (it != s.end()) { /* *it is the element */ }
```

**One critical rule:** You cannot modify an element in a set. Set elements are immutable. If you need to change a value, erase it and insert the new value.

```cpp
s.erase(3);
s.insert(5);   // replace 3 with 5
```

---

### 4.7 `multiset` — Sorted Elements with Duplicates

Like `set` but allows duplicates. Use when you need a sorted structure where you insert and delete individual occurrences.

```cpp
multiset<int> ms;
ms.insert(3);
ms.insert(3);    // kept — ms = {3, 3}
ms.insert(1);    // ms = {1, 3, 3}

// ⚠️ THE CLASSIC BUG:
ms.erase(3);              // ❌ removes ALL 3s — ms = {1}

// ✅ CORRECT — remove only one occurrence:
ms.erase(ms.find(3));     // removes one 3 — ms = {1, 3}
```

Burn `ms.erase(ms.find(x))` into memory. It is the only correct way to remove a single element from a multiset.

---

### 4.8 `unordered_set` — Fast Existence Check, No Order

Same as `set` but uses hashing internally instead of a BST. No sorted order. O(1) average for all operations.

```cpp
unordered_set<int> us;
us.insert(x);
us.count(x);    // 0 or 1
us.erase(x);
us.find(x);     // same as set
```

**When to use which:**

| Need                                   | Use             |
| -------------------------------------- | --------------- |
| Fast existence check, don't need order | `unordered_set` |
| Sorted iteration or range queries      | `set`           |
| Allow duplicates                       | `multiset`      |

Default choice for existence checking: `unordered_set`. Only switch to `set` if you need sorted traversal.

---

### 4.9 `map` — Key-Value Lookup

A map stores key-value pairs, sorted by key. Like an array but the index can be anything — string, char, pair, etc.

**Problems:** Frequency counting, grouping elements, memoization, any "look up X, return Y" scenario.

```cpp
map<string, int> freq;

freq["apple"] = 3;         // insert/update
freq["apple"]++;           // increment (creates with 0 if missing)

// ⚠️ Critical: m[key] CREATES the key if it doesn't exist
// Never use m[key] to check existence — use count()

freq.count("apple");       // 1 if exists, 0 if not ✅
freq["banana"];            // creates "banana" with value 0 ❌ for checking

auto it = freq.find("apple");
if (it != freq.end()) {
    cout << it->first << ": " << it->second;
}

freq.erase("apple");
freq.size();
```

**Frequency counting — the most common map pattern:**

```cpp
vector<int> nums = {1, 3, 2, 1, 3, 3};
map<int, int> freq;

for (auto x : nums)
    freq[x]++;   // auto-initializes to 0, then increments

for (auto& [val, cnt] : freq)
    cout << val << " appears " << cnt << " times\n";
// Output is in sorted key order
```

**Map always keeps keys sorted.** Iterating a map gives you pairs in ascending key order. This is useful when you need sorted output.

---

### 4.10 `unordered_map` — Fast Map, No Order

Same as `map` but O(1) average instead of O(log n). Identical API.

```cpp
unordered_map<int, int> um;
um[key]++;
um.count(key);
um.find(key);
// everything same as map
```

**When to use which:**

| Situation                      | Use                           |
| ------------------------------ | ----------------------------- |
| Need sorted keys               | `map`                         |
| Just need fast lookup/counting | `unordered_map`               |
| Not sure                       | `unordered_map` (it's faster) |

**One warning:** In rare contest scenarios with adversarial inputs, `unordered_map` can degrade to O(n) per operation due to hash collisions. If you're getting TLE with `unordered_map`, switch to `map`.

---

### 4.11 `string` — Character Sequences

Strings in C++ behave like vectors of characters with extra operations.

**Core operations:**

```cpp
string s = "helloworld";

s.length();              // 10, same as s.size()
s[i];                    // access character by index
s[0] = 'H';             // modify character
s.push_back('!');        // append character
s.pop_back();            // remove last character
s + " world";            // concatenation (creates new string)
```

**`substr(start, length)` — second argument is LENGTH, not end index:**

```cpp
string s = "helloworld";
//          0123456789

s.substr(5);       // "world"      — from index 5 to end
s.substr(0, 5);    // "hello"      — from 0, length 5
s.substr(2, 3);    // "llo"        — from 2, length 3

// ⚠️ Common mistake:
s.substr(2, 5);    // "llowo" — NOT s[2..5]
// Second arg is how many chars to take, not where to stop
```

**`find` — locate a substring:**

```cpp
int pos = s.find("world");      // returns index, or string::npos if not found

if (s.find("world") != string::npos)
    cout << "found at " << pos << "\n";

// string::npos is a special sentinel value meaning "not found"
// Just like map.end() means "key not found"
```

**Splitting a string by spaces:**

```cpp
string sentence = "the cat sat on the mat";
string word;
vector<string> words;

stringstream ss(sentence);
while (ss >> word)
    words.push_back(word);
// words = {"the", "cat", "sat", "on", "the", "mat"}
```

`stringstream` treats a string like `cin`. The `>>` operator reads one whitespace-delimited token at a time. This pattern appears in almost every string manipulation problem.

**Character frequency — the `c - 'a'` trick:**

```cpp
// Maps lowercase letters to indices 0-25
// 'a' - 'a' = 0, 'b' - 'a' = 1, ..., 'z' - 'a' = 25

int freq[26] = {0};
for (char c : s)
    freq[c - 'a']++;

// Reverse: index back to character
char ch = (char)('a' + i);
```

This avoids a map for simple character frequency problems. O(1) access instead of O(log n).

**String ↔ number conversion:**

```cpp
string s = "42";
int n = stoi(s);         // string to int
long long n = stoll(s);  // string to long long
double d = stod(s);      // string to double

int n = 42;
string s = to_string(n); // int to string
```

**Comparison — lexicographic by default:**

```cpp
string a = "apple", b = "banana";
a == b;   // false
a < b;    // true — 'a' < 'b' alphabetically
```

Sorting a `vector<string>` with `sort` works automatically because `<` is defined on strings.

---

## 5. Block 3 — Essential STL Algorithms

All STL algorithms operate on ranges defined by two iterators: `begin()` and `end()`. Think of `begin()` as a pointer to the first element, and `end()` as a pointer to one-past-the-last element.

```cpp
sort(v.begin(), v.end());
//   ^^^^^^^^^^  ^^^^^^^^
//   start here  stop before here
```

---

### 5.1 `sort` — The Most Used Algorithm

```cpp
// Ascending (default)
sort(v.begin(), v.end());

// Descending — using built-in greater
sort(v.begin(), v.end(), greater<int>());

// Custom — using lambda
sort(v.begin(), v.end(), [](auto& a, auto& b) {
    return a.second < b.second;   // by second element of pair
});

// Sort only part of the vector
sort(v.begin(), v.begin() + k);   // sort first k elements
sort(v.begin() + l, v.begin() + r + 1);  // sort range [l, r]
```

`sort` is O(n log n). It uses introsort internally (hybrid of quicksort, heapsort, insertion sort).

`stable_sort` — same signature, preserves relative order of equal elements. O(n log n) but slightly slower. Use only when the problem explicitly requires stability.

---

### 5.2 `binary_search`, `lower_bound`, `upper_bound`

**All three require a sorted array. Always sort first.**

**`binary_search` — does value exist?**

```cpp
bool found = binary_search(v.begin(), v.end(), target);
// Returns true or false only. Does not give position.
```

**`lower_bound` — first position where value could be inserted (first element >= target):**

```cpp
vector<int> v = {1, 2, 4, 4, 5, 6};
//               0  1  2  3  4  5

auto it = lower_bound(v.begin(), v.end(), 4);
int idx = it - v.begin();   // → 2 (first index of 4)
```

**`upper_bound` — position after all occurrences (first element > target):**

```cpp
auto it = upper_bound(v.begin(), v.end(), 4);
int idx = it - v.begin();   // → 4 (one past last 4)
```

**Together — count occurrences:**

```cpp
auto lo = lower_bound(v.begin(), v.end(), x);
auto hi = upper_bound(v.begin(), v.end(), x);
int count = hi - lo;   // number of times x appears
```

This is O(log n) and replaces a linear scan for counting in sorted arrays.

**Converting iterator to index:**

```cpp
// Subtract begin() from any iterator to get the index
auto it = lower_bound(v.begin(), v.end(), x);
int index = it - v.begin();
```

---

### 5.3 Other Algorithms

**`reverse`:**

```cpp
reverse(v.begin(), v.end());          // reverses vector in place
reverse(s.begin(), s.end());          // reverses string in place
```

**`min_element` and `max_element`:**

```cpp
auto it = min_element(v.begin(), v.end());
cout << *it;                          // value — dereference the iterator
int idx = it - v.begin();             // index of minimum

auto it = max_element(v.begin(), v.end());
cout << *it;
```

**`accumulate` — sum (or any reduction):**

```cpp
#include <numeric>   // or just use bits/stdc++.h

int sum = accumulate(v.begin(), v.end(), 0);
// Third argument is the starting value — almost always 0
```

**`next_permutation` — generate all permutations:**

```cpp
vector<int> v = {1, 2, 3};
sort(v.begin(), v.end());   // must start sorted to get all permutations

do {
    for (int x : v) cout << x << " ";
    cout << "\n";
} while (next_permutation(v.begin(), v.end()));
// Prints all 6 permutations of {1, 2, 3} in lexicographic order
```

---

## 6. Block 4 — Structures for DSA

---

### 6.1 `struct` — Custom Data Bundling

When you need more than two related values, use a struct instead of a pair.

```cpp
struct Edge {
    int from, to, weight;
};

// Create and use
Edge e = {0, 1, 5};
cout << e.from << " " << e.to << " " << e.weight;

// Vector of structs
vector<Edge> edges;
edges.push_back({0, 1, 4});
edges.push_back({1, 2, 3});
```

**Functions inside struct:**

```cpp
struct Student {
    string name;
    int grade;

    bool isPass() {
        return grade >= 75;
    }
};

Student s = {"alice", 80};
s.isPass();   // true
```

---

### 6.2 Constructor and Initializer List

A constructor is a special function that runs automatically when you create an object.

```cpp
struct ListNode {
    int val;
    ListNode* next;

    // Constructor
    ListNode(int x) : val(x), next(nullptr) {}
    //                 ^^^^^^  ^^^^^^^^^^^^
    //              set val=x  set next=nullptr
};

// Usage
ListNode* node = new ListNode(5);
// node->val = 5, node->next = nullptr — set by constructor
```

The `: val(x), next(nullptr)` part is the **initializer list** — it sets member variables during construction. It is exactly equivalent to writing this inside the `{}`:

```cpp
ListNode(int x) {
    val = x;
    next = nullptr;
}
```

The initializer list version is preferred — it's more compact and slightly more efficient.

---

### 6.3 `operator<` Overloading — Custom Default Sort Order

When you call `sort` on a vector of your custom struct, C++ doesn't know how to compare your structs. You either provide a lambda comparator, or you define `operator<` inside the struct.

Defining `operator<` means: "when C++ needs to know if `a < b`, use this logic."

```cpp
struct Edge {
    int from, to, weight;

    bool operator<(const Edge& other) const {
        return weight < other.weight;   // sort by weight ascending
    }
    // `other` = the right side of <
    // `this`  = the left side of <
};

sort(edges.begin(), edges.end());   // uses operator< — no lambda needed
```

Once `operator<` is defined, `sort`, `set`, `map`, and `priority_queue` all use it automatically.

**Lambda vs operator< — when to use which:**

| Situation                                  | Use                  |
| ------------------------------------------ | -------------------- |
| One-off sort in one place                  | Lambda comparator    |
| Same struct sorted the same way everywhere | `operator<`          |
| Need to put struct in a `set` or `map`     | `operator<` required |

---

### 6.4 Node Structures — Linked List and Tree

These exact structs appear in LeetCode/competitive programming problems. You need to be able to write them from memory.

**Linked List Node:**

```cpp
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

// Build 1 -> 2 -> 3
ListNode* head = new ListNode(1);
head->next = new ListNode(2);
head->next->next = new ListNode(3);
```

**Binary Tree Node:**

```cpp
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// Build:
//       1
//      / \
//     2   3
TreeNode* root = new TreeNode(1);
root->left  = new TreeNode(2);
root->right = new TreeNode(3);
```

**Graph Edge Struct:**

```cpp
struct Edge {
    int to, weight;
};
vector<vector<Edge>> adj(n);  // adjacency list with weights
adj[u].push_back({v, w});
```

---

## 7. Block 5 — Pointers and Memory

Pointers are required for linked lists, trees, and any dynamically allocated node-based structure. Understanding them is non-negotiable for DSA.

---

### 7.1 What is a Pointer?

Every variable lives at some address in memory. A pointer is a variable that stores that address.

```
int x = 42;
// x lives at address 1000 (example)
// memory at address 1000 holds the value 42

int* p = &x;
// p holds the value 1000 (the address of x)
// the * in declaration means "this is a pointer to int"
// the & in &x means "give me the address of x"
```

---

### 7.2 The Two Uses of `*` and `&` — Read This Carefully

Both symbols have two completely different meanings depending on context. This is the single most confusing thing about pointers for beginners.

**`*` has two meanings:**

```cpp
int* p = &x;   // Meaning 1: DECLARATION — "p is a pointer to int"
cout << *p;    // Meaning 2: DEREFERENCE — "value at the address p holds"
```

**`&` has two meanings:**

```cpp
int& ref = x;  // Meaning 1: DECLARATION — "ref is a reference to int"
int* p = &x;   // Meaning 2: ADDRESS-OF — "give me the address of x"
```

In summary:

| Symbol | In a declaration (`int* p`, `int& r`) | On a variable (`*p`, `&x`)       |
| ------ | ------------------------------------- | -------------------------------- |
| `*`    | "this is a pointer to..."             | "value at address" (dereference) |
| `&`    | "this is a reference to..."           | "address of this variable"       |

**Putting it together:**

```cpp
int x = 42;
int* p = &x;    // p = address of x (say, 1000)

cout << p;      // prints 1000 — the address (rarely useful)
cout << *p;     // prints 42 — the value at that address

*p = 99;        // change the value at that address
cout << x;      // prints 99 — x changed because p pointed to it
```

---

### 7.3 `new` — Allocating on the Heap

```cpp
// Stack allocation — automatic cleanup when scope ends
int x = 5;          // lives until } of current scope

// Heap allocation — lives until you delete it
int* p = new int(5);        // allocate one int, initialize to 5
int* arr = new int[100];    // allocate array of 100 ints
```

For DSA, you mainly use `new` to create nodes:

```cpp
ListNode* node = new ListNode(5);
// Allocates a ListNode on the heap
// node holds the address of that node
// node->val = 5, node->next = nullptr
```

In competitive programming, you almost never call `delete`. Memory leaks don't matter in contest submissions — the process ends and the OS reclaims everything. In production code, you would always `delete` what you `new`.

---

### 7.4 `nullptr` — The Empty Pointer

`nullptr` means "this pointer points to nothing." Like `null` in Java or `None` in Python.

```cpp
ListNode* p = nullptr;   // p points to nothing

// Always check before dereferencing
if (p != nullptr) {
    cout << p->val;   // safe
}

// Shorter — pointers evaluate to false when null
if (p) {
    cout << p->val;   // same thing
}
```

Accessing a `nullptr` pointer is undefined behavior — on most systems, an immediate crash. This is the most common runtime error in pointer code.

---

### 7.5 The `->` Operator

When you have a **pointer** to a struct, use `->` to access members.
When you have the **struct directly**, use `.`

```cpp
ListNode node(5);      // direct struct
cout << node.val;      // use dot

ListNode* p = &node;   // pointer to struct
cout << p->val;        // use arrow

// -> is just shorthand: p->val == (*p).val
// The arrow dereferences and accesses in one step
```

**Memory rule:** Pointer → use `->`. Direct object → use `.`

---

### 7.6 Linked List Patterns

The linked list traversal template. Write this until it is automatic:

```cpp
// Traverse — print all values
ListNode* curr = head;
while (curr != nullptr) {      // condition: curr not null
    cout << curr->val << " ";
    curr = curr->next;         // move to next node
}
```

**Why `curr != nullptr` and NOT `curr->next != nullptr`:**

`curr != nullptr` — stops AFTER the last node (processes every node including last).
`curr->next != nullptr` — stops AT the last node (misses the last node's value).

Always use `curr != nullptr` for traversal.

**Reverse a linked list — the canonical interview problem:**

```cpp
ListNode* reverse(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    ListNode* next = nullptr;

    while (curr != nullptr) {
        next = curr->next;   // 1. save next before we overwrite it
        curr->next = prev;   // 2. flip the pointer
        prev = curr;         // 3. advance prev
        curr = next;         // 4. advance curr
    }

    return prev;   // prev is the new head
}
```

The four steps in the loop — in order, every time: **save, flip, advance prev, advance curr.**

---

### 7.7 Tree Traversals

**Inorder (left → root → right) — gives sorted order for BST:**

```cpp
void inorder(TreeNode* root) {
    if (root == nullptr) return;   // base case
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}
```

**Preorder (root → left → right):**

```cpp
void preorder(TreeNode* root) {
    if (!root) return;
    cout << root->val << " ";
    preorder(root->left);
    preorder(root->right);
}
```

**Postorder (left → right → root):**

```cpp
void postorder(TreeNode* root) {
    if (!root) return;
    postorder(root->left);
    postorder(root->right);
    cout << root->val << " ";
}
```

The pattern: always check `if (!root) return;` first. This is the base case that stops recursion.

---

## 8. Block 6 — Performance Knowledge

You don't need to understand computer architecture. You need to know which operations are fast and which are slow.

---

### 8.1 STL Complexity Reference

| Container                         | Operation                    | Complexity                |
| --------------------------------- | ---------------------------- | ------------------------- |
| `vector`                          | `push_back`                  | O(1) amortized            |
| `vector`                          | `insert` at middle           | O(n) — avoid in hot loops |
| `vector`                          | `operator[]`                 | O(1)                      |
| `stack` / `queue`                 | `push`, `pop`, `top`/`front` | O(1)                      |
| `priority_queue`                  | `push`, `pop`                | O(log n)                  |
| `priority_queue`                  | `top`                        | O(1)                      |
| `set` / `map`                     | `insert`, `find`, `erase`    | O(log n)                  |
| `unordered_set` / `unordered_map` | `insert`, `find`, `erase`    | O(1) avg                  |
| `sort`                            | —                            | O(n log n)                |
| `binary_search`                   | —                            | O(log n)                  |
| `lower_bound` / `upper_bound`     | —                            | O(log n)                  |

**The critical comparison:** If you're doing 100,000 lookups, `unordered_map` takes 100,000 × O(1) = O(n). `map` takes 100,000 × O(log n) = O(n log n). For n = 10^5, that's the difference between 10^5 and ~1.7 × 10^6 operations.

---

### 8.2 Avoiding Unnecessary Copies

Copies are silent performance killers. They don't cause errors — they just make your code slower.

```cpp
// ❌ All of these make copies
for (auto v : matrix)           // copies each row
for (string s : words)          // copies each string
void solve(vector<int> v)       // copies entire vector

// ✅ References — no copy
for (auto& v : matrix)
for (auto& s : words)
void solve(vector<int>& v)
```

**Rule of thumb:** If the object is larger than a pointer (8 bytes on 64-bit), use a reference.

---

### 8.3 Move Semantics — One Paragraph

When you return a `vector` from a function, you might expect it to be copied. In modern C++ (C++11 and later), the compiler applies **Return Value Optimization (RVO)** — it constructs the vector directly in the caller's memory, with zero copies. If RVO doesn't apply, the compiler uses **move semantics**: instead of copying all the data, it "moves" ownership (just copies a pointer). The result: returning large containers from functions is cheap. Write clean code; don't sacrifice clarity to avoid returning vectors.

```cpp
vector<int> buildResult() {
    vector<int> result;
    // ... fill result
    return result;   // zero or near-zero cost — compiler optimizes this
}
```

---

## 9. Block 7 — Coding Templates

These are the exact skeletons you will use in real problems. Learn the shape of each one. When you encounter a problem, recognize which template fits, then fill in the logic.

---

### 9.1 Frequency Counting

```cpp
unordered_map<int, int> freq;
for (auto x : nums)
    freq[x]++;

// Find most frequent
int maxFreq = 0;
int result = -1;
for (auto& [val, cnt] : freq) {
    if (cnt > maxFreq) {
        maxFreq = cnt;
        result = val;
    }
}
```

---

### 9.2 Two Pointers

Use when: array is sorted and you're looking for pairs satisfying a condition.

```cpp
sort(nums.begin(), nums.end());   // sort first if not already sorted
int l = 0, r = n - 1;

while (l < r) {
    int sum = nums[l] + nums[r];
    if (sum == target) {
        // found a pair
        l++; r--;
    } else if (sum < target) {
        l++;   // need larger sum
    } else {
        r--;   // need smaller sum
    }
}
```

---

### 9.3 Sliding Window — Fixed Size

Use when: you need maximum/minimum/sum of all subarrays of exactly size k.

```cpp
int win = 0, best = 0;

// Build first window
for (int i = 0; i < k; i++)
    win += nums[i];

best = win;

// Slide — add right element, remove left element
for (int i = k; i < n; i++) {
    win += nums[i];        // add new right element
    win -= nums[i - k];    // remove element that left the window
    best = max(best, win);
}
```

---

### 9.4 Sliding Window — Variable Size

Use when: you need the longest/shortest subarray satisfying a condition.

```cpp
int l = 0, best = 0;
unordered_map<int, int> window;

for (int r = 0; r < n; r++) {
    window[nums[r]]++;                   // expand right

    while (/* condition violated */) {
        window[nums[l]]--;               // shrink left
        if (window[nums[l]] == 0)
            window.erase(nums[l]);
        l++;
    }

    best = max(best, r - l + 1);         // window size = r - l + 1
}
```

---

### 9.5 Binary Search Template

```cpp
int l = 0, r = n - 1;

while (l <= r) {                         // note: <=, not <
    int mid = l + (r - l) / 2;          // avoids integer overflow

    if (nums[mid] == target) {
        return mid;
    } else if (nums[mid] < target) {
        l = mid + 1;
    } else {
        r = mid - 1;
    }
}

return -1;   // not found
```

**Why `l + (r - l) / 2` instead of `(l + r) / 2`:** If l and r are both close to INT_MAX, their sum overflows. The first form never overflows.

---

### 9.6 Prefix Sum

Use when: you need to answer multiple range sum queries efficiently.

```cpp
int n = nums.size();
vector<int> prefix(n + 1, 0);

// Build — O(n)
for (int i = 0; i < n; i++)
    prefix[i + 1] = prefix[i] + nums[i];

// Query sum from index l to r inclusive — O(1)
int rangeSum = prefix[r + 1] - prefix[l];
```

Without prefix sum: each range query is O(n). With prefix sum: O(1) per query after O(n) preprocessing.

---

### 9.7 DFS — Recursive Graph Traversal

```cpp
vector<vector<int>> adj(n);    // build this from input edges
vector<bool> visited(n, false);

void dfs(int u) {
    visited[u] = true;

    // process u here (before neighbors = preorder)

    for (auto v : adj[u]) {
        if (!visited[v]) {
            dfs(v);
        }
    }

    // process u here (after neighbors = postorder)
}

// Call from main
dfs(startNode);
```

---

### 9.8 BFS — Level-Order Graph Traversal

```cpp
vector<vector<int>> adj(n);
vector<bool> visited(n, false);
vector<int> dist(n, -1);      // optional: track distance from source
queue<int> q;

q.push(start);
visited[start] = true;
dist[start] = 0;

while (!q.empty()) {
    int u = q.front();
    q.pop();

    for (auto v : adj[u]) {
        if (!visited[v]) {
            visited[v] = true;
            dist[v] = dist[u] + 1;   // one step further
            q.push(v);
        }
    }
}
```

BFS gives shortest path (in number of edges) in unweighted graphs.

---

### 9.9 Graph — Building Adjacency List

```cpp
int n, m;   // n nodes (0-indexed), m edges
cin >> n >> m;

vector<vector<int>> adj(n);   // unweighted

for (int i = 0; i < m; i++) {
    int u, v;
    cin >> u >> v;
    adj[u].push_back(v);
    adj[v].push_back(u);   // remove for directed graph
}

// Weighted graph
vector<vector<pair<int,int>>> adj(n);   // adj[u] = {v, weight}
int u, v, w;
cin >> u >> v >> w;
adj[u].push_back({v, w});
adj[v].push_back({u, w});
```

---

### 9.10 Dijkstra's Shortest Path

For weighted graphs — finds shortest distance from source to all nodes.

```cpp
vector<vector<pair<int,int>>> adj(n);   // adj[u] = {v, weight}
vector<int> dist(n, INT_MAX);

priority_queue<pair<int,int>,
    vector<pair<int,int>>,
    greater<pair<int,int>>> pq;    // min-heap

dist[src] = 0;
pq.push({0, src});    // {distance, node}

while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();

    if (d > dist[u]) continue;   // outdated entry — skip

    for (auto [v, w] : adj[u]) {
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.push({dist[v], v});
        }
    }
}

// dist[i] = shortest distance from src to i
// INT_MAX means unreachable
```

---

### 9.11 Memoization (Top-Down DP)

```cpp
unordered_map<int, long long> memo;

long long solve(int n) {
    // Base case
    if (n <= 1) return n;

    // Return cached result if already computed
    if (memo.count(n))
        return memo[n];

    // Compute, store, return
    return memo[n] = solve(n - 1) + solve(n - 2);
}
```

The three-step pattern: base case → check cache → compute and store.

---

### 9.12 Sorting Pairs and Structs

```cpp
// Sort vector of pairs by second element descending
sort(v.begin(), v.end(), [](auto& a, auto& b) {
    return a.second > b.second;
});

// Sort structs with multiple keys
sort(students.begin(), students.end(), [](auto& a, auto& b) {
    if (a.grade != b.grade)
        return a.grade > b.grade;   // grade descending
    return a.name < b.name;         // name ascending on tie
});

// Sort edges by weight (using operator<)
sort(edges.begin(), edges.end());   // uses operator< if defined
```

---

## 10. Common Mistakes Quick Reference

These are mistakes that produce incorrect output or crashes with no compiler error. Silent bugs.

| Mistake               | Wrong                                 | Correct                   |
| --------------------- | ------------------------------------- | ------------------------- |
| Map existence check   | `if (m[key])` — creates key           | `if (m.count(key))`       |
| Multiset erase one    | `ms.erase(x)` — removes ALL           | `ms.erase(ms.find(x))`    |
| Linked list loop      | `curr->next != nullptr` — misses last | `curr != nullptr`         |
| Comparator            | `return a >= b` — UB                  | `return a > b` (strict)   |
| Priority queue access | `pq.front()` — no such function       | `pq.top()`                |
| substr second arg     | `s.substr(2, 5)` — means length 5     | second arg is length      |
| Loop copy             | `for (auto x : v)` for strings/pairs  | `for (auto& x : v)`       |
| Sign comparison       | `for (int i = 0; i < v.size(); ...)`  | `int n = v.size(); i < n` |
| Overflow              | `(l + r) / 2`                         | `l + (r - l) / 2`         |
| Null dereference      | `p->val` without checking             | `if (p) p->val`           |
| Redundant includes    | `#include <bits/stdc++.h>` + others   | only `bits/stdc++.h`      |
| Slow output           | `cout << endl` in tight loop          | `cout << "\n"`            |

**`endl` vs `"\n"`:** `endl` flushes the output buffer every call. `"\n"` does not. In problems with 100,000+ output lines, using `endl` can cause TLE by itself. Always use `"\n"`.

---

## 11. Complexity Cheat Sheet

**Big-O intuition for contest constraints:**

| n (input size) | Max acceptable complexity |
| -------------- | ------------------------- |
| n ≤ 10         | O(n!) — permutations fine |
| n ≤ 20         | O(2^n) — bitmask DP fine  |
| n ≤ 500        | O(n³)                     |
| n ≤ 5,000      | O(n²)                     |
| n ≤ 10^6       | O(n log n)                |
| n ≤ 10^8       | O(n)                      |

**Container operations:**

```
vector    push_back O(1)    access O(1)    insert-mid O(n)
stack     push/pop  O(1)    top    O(1)
queue     push/pop  O(1)    front  O(1)
pq        push/pop  O(logn) top    O(1)
set/map   insert    O(logn) find   O(logn) erase O(logn)
uo_set/map insert   O(1)*   find   O(1)*   erase O(1)*
sort      O(n logn)
bin_search O(logn)
```

\*average case, O(n) worst case for unordered containers

---

_These notes cover everything required to implement standard DSA topics in C++ cleanly and quickly. The templates in Block 7 are the payoff — the rest of the notes exist to make those templates readable and writable without hesitation._
