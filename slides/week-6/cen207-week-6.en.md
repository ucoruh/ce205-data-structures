---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 6 — Search and Hashing"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 6"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Search and Hashing

**CEN207 Data Structures — Week 6**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!--
Speaker note: Last week we explored a whole graph to answer a question. This week flips that idea: can we compute exactly where to look, without exploring anything at all?
-->

---

# Today's plan (3 hours)

| Hour | Topic |
| --- | --- |
| 1 | Search costs, jump **Anim 1–2** · interpolation **Anim 3–4** |
| 2 | Exponential **Anim 5–6** · Fibonacci **Anim 7–8** · hashing idea |
| 3 | Division **Anim 9–10** · chaining **Anim 11–12** · probing **Anim 13–18** · rehashing **Anim 19–20** |

**Learning outcomes:** LO.1 (explain fundamental data structures) · LO.2 (analyze complexity) · LO.7 (choose the right structure)

<!-- Speaker note: Twenty-one short animations carry the whole lecture; each idea gets one normal run and one edge/hard run, right where it is introduced. -->

---

# This week's concepts — where

| Concept | Where |
| --- | --- |
| Jump, interpolation, exponential, Fibonacci search | Sections 2–5 |
| Hashing, division method, prime table size | Section 7 |
| Collisions, chaining, load factor | Section 8 |
| Open addressing, rehashing | Sections 9–10 |

<!-- Speaker note: Every term gets a full definition the first time it appears; this table just says where to find it again. -->

---

# How the code examples work

- Every idea has a complete **C** and **Java** program
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Sources: `code/week-06/c/` and `code/week-06/java/`
- Each program's expected output is in the week notes

<!-- Speaker note: Open a terminal now if you want to run these live; every snippet on today's slides compiles and runs exactly as shown. -->

---

# Recap — linear and binary search (Week 1)

- **Linear search:** check every cell, one by one — O(n)
- **Binary search:** sorted array, halve the range — O(log n)
- Binary search needs the array **sorted** first
- Today: strategies between and beyond these two

<!-- Speaker note: Everything this week either beats binary search on a special case, or drops "compare" entirely for "compute". -->

---

# Recap — arrays and linked lists (Week 2)

- **Array:** contiguous memory, O(1) access by index
- **Linked list:** nodes and pointers, O(1) insert at head
- Search structures below build directly on both
- A hash table's bucket is often a small linked list

<!-- Speaker note: Nothing here is brand new machinery — Week 2's two basic structures reappear as building blocks all through today. -->

---

# Map of the week — at a glance

| Faster search (sorted) | Hashing |
| --- | --- |
| Jump, interpolation search | Direct addressing, division method |
| Exponential, Fibonacci search | Chaining, open addressing, rehashing |

<!-- Speaker note: Every box on this map gets its own slides below, most with a short animation and a complete C/Java program. -->

---

<!-- _class: bolum -->

# 1. The Search Problem and Costs

<!-- Speaker note: Section 1 sets up the one question every algorithm today answers differently: how many comparisons before you find — or rule out — a key? -->

---

# A question to start

Binary search already takes only O(log n).
Is there any reason to look for something
even faster, or something completely different?

<!-- Speaker note: Yes to both — faster comparison-based search exists for special data, and hashing drops comparisons almost entirely. -->

---

# What "search" means here

- Given a collection and a **target** key, find its location
- Or correctly report: the key is **not present**
- We count **comparisons** (or **probes**) as the cost
- Fewer comparisons for the same correctness = a better search

<!-- Speaker note: "Correctness first, speed second" — every algorithm today must still get the right answer on every input. -->

---

# Cost, restated as a question

- Linear search: no assumption on the data, O(n) worst case
- Binary search: needs **sorted** data, O(log n) worst case
- Can sorted data be searched even faster than O(log n)?
- Can we search **without comparisons** at all?

<!-- Speaker note: Sections 2–6 answer the first question; Sections 7 onward answer the second, with hashing. -->

---

# When binary search isn't enough

- Binary search always checks the **middle**, no matter what
- But real data often has **structure** binary search ignores
- Evenly spread values? A formula can guess better than "middle"
- Data outside memory (disk, tape)? Every access has to count

<!-- Speaker note: Every algorithm in Sections 2–5 exploits one extra fact about the data that plain binary search throws away. -->

---

# Today's toolbox — five strategies

| Strategy | Exploits |
| --- | --- |
| Jump search | Cheap block jumps beat many comparisons |
| Interpolation search | Values are roughly evenly spread |
| Exponential search | Target is likely near the front |
| Fibonacci search | No division/multiplication needed |

<!-- Speaker note: Hashing, the biggest idea of the week, gets its own toolbox slide later, right before Section 7 begins. -->

---

# Mini-quiz

Binary search always looks at the array's
**middle** element first. Under what condition
might a smarter first guess do better?

<!-- Speaker note: Think about what extra information the array's actual values might carry, beyond just being sorted. -->

---

# Answer

**When values are roughly evenly spread.**
The middle is only "index-optimal" — a value-aware
guess (Section 3) can land closer to the target.

<!-- Speaker note: This is exactly the idea Section 3's interpolation search turns into a full algorithm. -->

---

<!-- _class: bolum -->

# 2. Jump Search

<!-- Speaker note: Section 2 opens the "faster than binary" family: instead of halving, jump forward in fixed blocks, then scan one block linearly. -->

---

# A question to start

Binary search jumps to the **middle** every time.
What if jumping in **fixed-size blocks** instead
turned out to be simpler, and still fast?

<!-- Speaker note: Jump search trades binary search's recursion for one straight line of block jumps, then a short linear scan. -->

---

# A short history

- Block-style search appears in Knuth's *Sorting and
  Searching* (1973), as an alternative to binary search
- The key design choice: how big should each block be?
- The answer, `block = floor(sqrt(n))`, balances two costs

<!-- Speaker note: This is one of the cleanest examples in the course of calculus (minimizing a sum) driving an algorithm's design. -->

---

# Intuition — skipping pages in a book

- Flipping one page at a time to find a word: too slow
- Binary search: always split remaining pages in half
- Jump search: flip **whole sections** first, then one page
- Stop the big jumps once you have passed the word

<!-- Speaker note: A block is like a chapter — check its last page, and only open it fully once you know the word is inside. -->

---

# The jump search idea

- Requires a **sorted** array, exactly like binary search
- `block = floor(sqrt(n))`: the jump distance
- Jump forward one block until a boundary is `>= target`
- Then scan that one block **linearly**, left to right

<!-- Speaker note: Two phases, each simple on its own: coarse jumps to find the right block, then a short linear scan inside it. -->

---

# Why sqrt(n)?

- `n/block` jumps, then up to `block` linear steps
- Total cost: `n/block + block` comparisons, worst case
- This sum is smallest when `block = sqrt(n)`
- Result: **O(sqrt(n))** — between O(log n) and O(n)

<!-- Speaker note: Balancing "few big jumps" against "short final scan" is exactly a minimize-the-sum calculus problem, solved once for all n. -->

---

# Jump search, step by step

<iframe class="dsanim" src="anim/jump-search.html?yer=slayt&lang=en" title="Jump search"></iframe>

<!-- Speaker note: Normal example: 16 sorted values, target found in the second block — watch the block boundary checks, then the short linear scan. -->

---

# Edge case — target in range but absent

<iframe class="dsanim" src="anim/jump-search.html?yer=slayt&lang=en&example=not-present" title="Jump search: not present"></iframe>

<!-- Speaker note: The target falls between two real values — the linear scan inside the right block stops early, the moment it passes the target. -->

---

# Code — finding the right block

```c
int block = (int) sqrt((double) n);
if (block < 1) block = 1;
int prev = 0, step = block, comp = 0;
while (step < n) {
    comp++;
    if (arr[step - 1] >= target) break;
    prev = step;
    step += block;
}
```

<!-- Speaker note: `block` is computed once, from `n` alone — it never depends on `target`, only the array's size. -->

---

# Code — linear scan inside the block

```c
if (step > n) step = n;
for (int i = prev; i < step; i++) {
    comp++;
    if (arr[i] == target) return i;
    if (arr[i] > target) break;
}
return -1;
```

<!-- Speaker note: The same "sorted array" fact that lets binary search stop early also lets this final scan stop early, on `arr[i] > target`. -->

---

# Complexity

- Block-finding phase: at most `n/block` jumps
- Linear-scan phase: at most `block` comparisons
- With `block = sqrt(n)`: total **O(sqrt(n))**
- Worse than binary search's O(log n), but simpler code

<!-- Speaker note: Jump search is a genuine middle ground: faster than linear search, simpler (no recursion) than binary search. -->

---

# Common mistakes

- Forgetting the array must be **sorted** first
- Using a fixed block size instead of `sqrt(n)`
- Scanning past the block boundary instead of stopping there

<!-- Speaker note: A wrong block size still finds the right answer — it just loses the O(sqrt(n)) guarantee. -->

---

# Mini-quiz

An array has `n = 100` elements. What
block size does jump search use, and how
many comparisons does it need in the worst case?

<!-- Speaker note: Recall the formula from a few slides back, then apply the O(sqrt(n)) bound. -->

---

# Answer

**`block = 10`** (`sqrt(100)`). Worst case: about
`10` jumps plus `10` linear steps — **~20**
comparisons, far below linear search's `100`.

<!-- Speaker note: This is the O(sqrt(n)) bound made concrete: 20 is close to 2*sqrt(100), the theoretical worst case. -->

---

<!-- _class: bolum -->

# 3. Interpolation Search

<!-- Speaker note: Section 3 replaces "always check the middle" with "compute where the target should be" — a formula instead of a fixed split point. -->

---

# A question to start

A phone book is sorted **and** roughly evenly
spread. Would you really start a search for
"Smith" at the exact middle page?

<!-- Speaker note: Nobody does — you flip straight toward the back, because you already know roughly where "S" should be. -->

---

# A short history

- The idea appears in 1957, in early work on
  searching ordered files (W. W. Peterson)
- Later formalized and analyzed as **interpolation search**
- Best case on **uniform** data: close to O(log log n)

<!-- Speaker note: O(log log n) is a genuinely small number — for a billion elements, it is only around 5. -->

---

# Intuition — a phone book

- Looking for "Smith": jump close to the back, not the middle
- Looking for "Baker": jump close to the front
- The jump uses the **value**, not just position, to guess
- Binary search only ever uses position — it ignores values

<!-- Speaker note: This single difference, using the value instead of ignoring it, is the entire idea of interpolation search. -->

---

# The interpolation search idea

- Requires a **sorted** array, exactly like binary search
- Estimate `target`'s position **proportionally** between ends
- `pos = lo + (target-arr[lo])*(hi-lo) / (arr[hi]-arr[lo])`
- Narrow `lo`/`hi` toward `pos`, exactly like binary search

<!-- Speaker note: Everything after the formula is identical to binary search — only how the split point is chosen has changed. -->

---

# Interpolation search, step by step

<iframe class="dsanim" src="anim/interpolation-search.html?yer=slayt&lang=en" title="Interpolation search"></iframe>

<!-- Speaker note: Normal example: 16 uniformly spread values — watch the formula's estimate land very close to the target in a single probe. -->

---

# Edge case — a guard against division by zero

<iframe class="dsanim" src="anim/interpolation-search.html?yer=slayt&lang=en&example=all-equal" title="Interpolation search: all equal"></iframe>

<!-- Speaker note: Every value in this range is identical — arr[hi] equals arr[lo], so the formula's denominator would be zero without an explicit guard. -->

---

# Code — the position formula

```c
while (lo <= hi && target >= arr[lo]
       && target <= arr[hi]) {
    if (arr[hi] == arr[lo]) {
        /* … guard: avoid division by zero … */
        return lo;
    }
    int pos = lo + (int) ((double)
        (target - arr[lo]) * (hi - lo)
        / (arr[hi] - arr[lo]));
```

<!-- Speaker note: The guard is not optional — without it, an all-equal range crashes the program with a division-by-zero error. -->

---

# Code — narrowing the range

```c
if (arr[pos] == target) return pos;
if (arr[pos] < target) lo = pos + 1;
else hi = pos - 1;
```

<!-- Speaker note: Identical in shape to binary search's narrowing step — only `pos` came from a formula instead of `(lo + hi) / 2`. -->

---

# Complexity

- Uniform data: close to **O(log log n)** on average
- Skewed data (one huge outlier): degrades toward **O(n)**
- Worst case is never better than binary search's O(log n)
- The formula's power depends entirely on the data's shape

<!-- Speaker note: Interpolation search is a genuine trade: excellent on the right data, no better than linear search on the wrong data. -->

---

# Common mistakes

- Forgetting the `arr[hi] == arr[lo]` division guard
- Using interpolation search on **skewed** (non-uniform) data
- Assuming O(log log n) is a worst-case guarantee — it isn't

<!-- Speaker note: A skewed array can make interpolation search's probes climb toward O(n), demonstrating exactly the second mistake. -->

---

# Mini-quiz

An array's values are extremely **skewed** —
mostly small, one huge outlier at the end.
Is interpolation search still a good choice?

<!-- Speaker note: Recall the complexity slide's second bullet point, a few slides back. -->

---

# Answer

**No, not necessarily.** Skewed data can push
interpolation search's cost toward **O(n)** — plain
binary search's O(log n) becomes the safer choice.

<!-- Speaker note: "Roughly uniform" is not a minor detail in interpolation search's description — it is the condition the whole speed-up depends on. -->

---

<!-- _class: bolum -->

# 4. Exponential Search

<!-- Speaker note: Section 4 answers a very different question from Sections 2–3: what if you do not even know how big the array is? -->

---

# A question to start

You are searching a huge, **sorted** stream
of data, and you do not know its length.
Where could binary search even start?

<!-- Speaker note: Binary search's very first step needs `hi = n - 1` — if `n` is unknown, that step cannot even be taken. -->

---

# A short history

- **1976** — Jon Bentley and Andrew Yao publish
  "An almost optimal algorithm for unbounded searching"
- Also called **unbounded** or **galloping** search
- Used today inside several merge and set-intersection algorithms

<!-- Speaker note: "Galloping" is a vivid name for the doubling phase — small steps that get bigger and bigger, like a horse picking up speed. -->

---

# Intuition — searching an unbounded list

- No known end? Grow a **guess** at the end instead
- Check index 1, then 2, then 4, then 8, then 16, …
- Stop doubling once you have clearly gone too far
- Now a normal, **bounded** binary search finishes the job

<!-- Speaker note: The doubling phase's only job is to manufacture a valid `hi` for binary search to use — nothing more. -->

---

# The exponential search idea

- Check `arr[0]` first — the target might be right there
- Grow `bound`: 1, 2, 4, 8, … until `arr[bound] >= target`
- Run ordinary **binary search** inside `[bound/2, bound]`
- Needs a **sorted** array, same as every strategy so far

<!-- Speaker note: The array does need a known upper bound in practice — "unbounded" here means "we do not need to know n in advance", not "infinite". -->

---

# Exponential search, step by step

<iframe class="dsanim" src="anim/exponential-search.html?yer=slayt&lang=en" title="Exponential search"></iframe>

<!-- Speaker note: Normal example: 16 sorted values, target found around the middle — watch the bound double, then binary search take over inside it. -->

---

# Edge case — target beyond the last value

<iframe class="dsanim" src="anim/exponential-search.html?yer=slayt&lang=en&example=beyond-end" title="Exponential search: beyond the end"></iframe>

<!-- Speaker note: The bound doubles all the way past the array's real end, clamped to n-1, before binary search reports not found. -->

---

# Code — growing the bound

```c
int comp = 1;
if (arr[0] == target) return 0;
int bound = 1;
while (bound < n) {
    comp++;
    if (arr[bound] >= target) break;
    bound *= 2;
}
```

<!-- Speaker note: This whole block only decides where binary search should start — it never itself finds the target, except by luck at index 0. -->

---

# Code — binary search inside the bound

```c
int lo = bound / 2;
int hi = (bound < n) ? bound : n - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    comp++;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
```

<!-- Speaker note: Exactly binary search from Week 1, unchanged — only the starting `lo` and `hi` come from the doubling phase above. -->

---

# Complexity

- Bound-finding phase: **O(log index)**, where `index`
  is where the target actually is
- Binary search phase: **O(log(bound))**, so O(log index) too
- Total: **O(log index)** — much better than O(log n)
  when the target is near the front

<!-- Speaker note: This is the whole payoff: exponential search adapts to WHERE the answer is, not just to how big the array is. -->

---

# Common mistakes

- Forgetting to clamp `bound` to `n - 1` near the end
- Restarting binary search from `[0, bound]` instead of
  `[bound/2, bound]` — wastes the doubling phase's work
- Assuming this needs a known `n` — it explicitly does not

<!-- Speaker note: Clamping matters because `arr[bound]` would otherwise read past the array's real end. -->

---

# Mini-quiz

An array has one million elements, but the
target sits at index `3`. Roughly how many
comparisons does exponential search need?

<!-- Speaker note: Recall the complexity slide: the cost depends on the target's INDEX, not the array's size. -->

---

# Answer

**Only a handful** — about `log2(3) + 1 ≈ 3`
comparisons total, regardless of the array
holding a million elements.

<!-- Speaker note: Binary search alone would still need about 20 comparisons here — exponential search's advantage is largest exactly when the target is near the front. -->

---

<!-- _class: bolum -->

# 5. Fibonacci Search

<!-- Speaker note: Section 5 closes the "faster search on sorted data" family with a strategy that never divides or multiplies at all. -->

---

# A question to start

Every strategy so far divides: `n/block`,
`(hi-lo)/2`, `bound/2`. What if the hardware
running your program could not divide cheaply?

<!-- Speaker note: This was a real, practical constraint on early computers — some had no hardware division instruction at all. -->

---

# A short history

- **1953** — Jack Kiefer's Fibonacci search **technique**,
  first developed for optimization, not arrays
- Adapted to array search soon after
- Uses only **addition and subtraction** — no `/`, no `*`

<!-- Speaker note: Kiefer's original problem was finding the peak of a function using as few measurements as possible — the same math reused here. -->

---

# Intuition — Fibonacci numbers as a ruler

- Fibonacci numbers: 1, 1, 2, 3, 5, 8, 13, 21, …
- Each one is the sum of the two before it
- Pick the smallest Fibonacci number `>= n` as a "ruler"
- Split the range using that ruler, not by dividing

<!-- Speaker note: The ruler shrinks by exactly one Fibonacci step at a time, which is what replaces halving in binary search. -->

---

# The Fibonacci search idea

- Requires a **sorted** array, exactly like binary search
- Track a triple `(fib, fib1, fib2)`, one Fibonacci step apart
- Probe at `offset + fib2`; compare, then shrink the triple
- `< target`: shrink by one step; `> target`: shrink by two

<!-- Speaker note: "Shrink by two steps" on an overshoot is what keeps the whole algorithm free of any multiplication or division. -->

---

# Fibonacci search, step by step

<iframe class="dsanim" src="anim/fibonacci-search.html?yer=slayt&lang=en" title="Fibonacci search"></iframe>

<!-- Speaker note: Normal example: 16 sorted values, target found around the middle — watch the (fib, fib1, fib2) triple shrink after each probe. -->

---

# Edge case — target in range but absent

<iframe class="dsanim" src="anim/fibonacci-search.html?yer=slayt&lang=en&example=not-present" title="Fibonacci search: not present"></iframe>

<!-- Speaker note: The main loop ends with fib1 == 1 — one element is left over and checked separately, then reported not found. -->

---

# Code — the Fibonacci triple and probe

```c
int fib2=0, fib1=1, fib=fib1+fib2;
while (fib < n) {
    fib2=fib1; fib1=fib; fib=fib1+fib2;
}
int offset = -1;
while (fib > 1) {
    int i = (offset+fib2 < n-1)
            ? offset+fib2 : n-1;
```

<!-- Speaker note: The while-loop above only runs once, before any comparisons — it just finds the starting Fibonacci triple for `n`. -->

---

# Code — shrinking the triple

```c
if (arr[i] < target) {
    fib=fib1; fib1=fib2; fib2=fib-fib1;
    offset = i;
} else if (arr[i] > target) {
    fib=fib2; fib1=fib1-fib2; fib2=fib-fib1;
} else {
    return i;
}
```

<!-- Speaker note: Every line here is `+` or `-` only — this is the concrete proof that no division or multiplication was ever needed. -->

---

# Complexity

- Same order as binary search: **O(log n)**
- Slightly more comparisons in practice, on average
- Its real advantage: **no division or multiplication**
- Historically valuable on hardware without fast division

<!-- Speaker note: On modern hardware division is cheap, so Fibonacci search is now mostly of historical and educational interest. -->

---

# Common mistakes

- Forgetting the leftover single-element check at the end
- Computing the Fibonacci triple **inside** the main loop
- Assuming it beats binary search's O(log n) — it does not

<!-- Speaker note: The "one element left over" case is exactly what this section's not-present edge case was built to show. -->

---

# Mini-quiz

Why might Fibonacci search have mattered more
in the 1950s and 1960s than it does on
today's hardware?

<!-- Speaker note: Recall the "short history" slide's motivation, a few slides back. -->

---

# Answer

**Division was expensive, or unavailable, on
early hardware.** Fibonacci search's pure
addition/subtraction avoided that cost entirely.

<!-- Speaker note: Modern CPUs have fast hardware division, so this specific advantage has mostly disappeared — the algorithm survives as an elegant idea. -->

---

<!-- _class: bolum -->

# 6. Comparing the Five Search Strategies

<!-- Speaker note: Section 6 is a short pause before hashing — a single table to compare everything Sections 2–5 just built. -->

---

# Comparison — what each one needs

| Strategy | Needs | Best case |
| --- | --- | --- |
| Jump search | Sorted array | O(sqrt(n)) |
| Interpolation search | Sorted, uniform | O(log log n) |
| Exponential search | Sorted array | O(log index) |

<!-- Speaker note: "Needs" here is the extra assumption beyond "sorted" that each strategy relies on to beat plain binary search. -->

---

# Comparison — Fibonacci and the recap

| Strategy | Needs | Best case |
| --- | --- | --- |
| Fibonacci search | Sorted array | O(log n) |
| Binary search (Week 1) | Sorted array | O(log n) |
| Linear search (Week 1) | Nothing | O(n) |

<!-- Speaker note: Every row on both tables shares one requirement: the data must be sorted first — hashing, starting next, drops that requirement entirely. -->

---

# When to use which

- Data roughly uniform? **Interpolation** search
- Target usually near the front? **Exponential** search
- Simple code, no division available? **Jump** or **Fibonacci**
- No special structure? Plain **binary search** is enough

<!-- Speaker note: None of these strategies is ever the "wrong" choice — each is a specialist that wins only under its own assumption. -->

---

# Mini-quiz

A sorted log file grows constantly, so its
length `n` is never known in advance. Which
of today's strategies fits best, and why?

<!-- Speaker note: Recall which strategy specifically does not require knowing `n` ahead of time. -->

---

# Answer

**Exponential search.** It only grows a bound
until it overshoots — it never needs `n`
known in advance, unlike binary search.

<!-- Speaker note: This is precisely the "unbounded searching" framing from Bentley and Yao's original 1976 paper. -->

---

<!-- _class: bolum -->

# 7. Hashing: From Direct Addressing to Hash Functions

<!-- Speaker note: Section 7 opens the second half of the week: instead of comparing values, compute exactly where a key belongs. -->

---

# A question to start

Every search so far **compares** values,
again and again. Could we instead **compute**
a key's location directly, in one step?

<!-- Speaker note: Yes — that single idea, "compute, don't compare", is the entire foundation of hashing. -->

---

# A short history

- **1953** — Hans Peter Luhn, at IBM, proposes using
  a computed function to place records directly
- This internal memo is widely credited as hashing's origin
- The idea: turn a **key** into a **table index**, by formula

<!-- Speaker note: Luhn also invented the separate, unrelated credit-card checksum that bears his name — a different, more famous invention by the same person. -->

---

# Intuition — direct addressing

- Keys are small integers, `0..m-1`? Just use the key
  itself as the array index — O(1), no computing needed
- `table[key] = value` — direct addressing, no hash at all
- Problem: real keys rarely fit `0..m-1` neatly
- Student IDs, phone numbers: far too many possible values

<!-- Speaker note: Direct addressing is the ideal case hashing is trying to approximate, once the key space is far bigger than the table. -->

---

# The hashing idea

- A **hash function** `h(key)` maps any key to `0..m-1`
- `m` = the table size; `h` must be fast, ideally O(1)
- Two different keys landing on the same index: a **collision**
- Sections 8–10 build the machinery to handle collisions

<!-- Speaker note: A perfect hash function with zero collisions exists in theory, but in practice collisions are expected and must be handled. -->

---

# The division method

- Simplest common hash function: `h(k) = k mod m`
- Maps any integer key into `[0, m-1]` — always, in O(1)
- The **choice of m** changes how well keys spread out
- A careless `m` can make many keys collide on purpose

<!-- Speaker note: "mod" is the whole function — its simplicity is exactly why it is the natural first hash function to teach. -->

---

# Division method, step by step

<iframe class="dsanim" src="anim/hash-function-division.html?yer=slayt&lang=en" title="Division hash function"></iframe>

<!-- Speaker note: Normal example: m = 11 (prime), 12 assorted keys — watch most keys spread out, with only the occasional collision. -->

---

# Edge case — m a power of 10: disaster

<iframe class="dsanim" src="anim/hash-function-division.html?yer=slayt&lang=en&example=power-of-10" title="Division hash: m a power of 10"></iframe>

<!-- Speaker note: m = 10, and every key is a multiple of 10 — k mod 10 is 0 for every single key: total collision, the worst possible spread. -->

---

# Why prime m?

- Keys sharing a **common factor** with `m` collide badly
- `m` a power of 10, keys multiples of 10: total collapse
- A **prime** `m` shares no factor with most key patterns
- Rule of thumb: pick `m` prime, avoid powers of 2 or 10

<!-- Speaker note: This is not a superstition — it follows directly from how the modulo operation interacts with a key's own factors. -->

---

# Code — the division hash function

```c
/* + m) % m guards negative keys in C */
int hash_division(int key, int m) {
    return ((key % m) + m) % m;
}
```

<!-- Speaker note: In C, `key % m` can be negative when `key` is negative — the extra `+ m` fixes that before the final `% m`. -->

---

# Complexity

- `h(k) = k mod m`: one division — **O(1)**, always
- This O(1) cost is what makes hashing attractive at all
- The real cost of a hash table lives in **collisions**
- Sections 8–10 are entirely about managing that cost

<!-- Speaker note: A hash function's own cost is essentially free; every remaining slide this week is about what happens after two keys collide. -->

---

# Common mistakes

- Picking `m` as a power of 2 or 10 out of convenience
- Forgetting the negative-key guard in languages like C or Java
- Assuming O(1) always holds, even with many collisions

<!-- Speaker note: The negative-key guard slide's `+ m` trick is a small detail that a surprising number of real bugs trace back to. -->

---

# Mini-quiz

`m = 8` and every key in a dataset happens
to be **even**. What fraction of the table's
cells can ever be used?

<!-- Speaker note: Think about which remainders `key mod 8` can produce when `key` is always even. -->

---

# Answer

**At most half.** An even key mod 8 can only
land on an even index (0, 2, 4, 6) — the
odd-indexed cells are never reachable at all.

<!-- Speaker note: This is the same "shared factor" problem as the power-of-10 edge case, just with the factor 2 instead of 10. -->

---

<!-- _class: bolum -->

# 8. Collisions and Separate Chaining

<!-- Speaker note: Section 8 accepts that collisions are normal, then builds the first of two standard ways to survive them. -->

---

# A question to start

Two different keys hash to the same index.
The table has only one cell there. Where
does the second key go?

<!-- Speaker note: There is no single right answer — the rest of today's lecture is two different, equally valid answers to this exact question. -->

---

# Intuition — a shared mailbox slot

- Two students share the same mailbox number by chance
- Solution: hang a **small list** off that one mailbox slot
- Any number of keys can share one slot, one after another
- This is **separate chaining**: a linked list per bucket

<!-- Speaker note: Collisions never overwrite anything here — they simply grow a list, which is exactly Week 2's linked list reused. -->

---

# The chaining idea

- Table cell `i` holds the **head** of a linked list
- Insert: new node becomes the list's **head** — O(1)
- Search: walk the list, comparing each key — O(chain length)
- Empty chain (`NULL`): the key is certainly not present

<!-- Speaker note: Insertion never has to search the chain first — the new node always goes straight to the front. -->

---

# Separate chaining, step by step

<iframe class="dsanim" src="anim/hash-chaining.html?yer=slayt&lang=en" title="Hash chaining"></iframe>

<!-- Speaker note: Normal example: m = 7, 10 inserts, 4 searches — watch a bucket's chain grow, then get walked during a search. -->

---

# Edge case — a heavily loaded table

<iframe class="dsanim" src="anim/hash-chaining.html?yer=slayt&lang=en&example=high-load" title="Hash chaining: high load"></iframe>

<!-- Speaker note: m = 3, 12 keys: load factor α = 4 — chains grow long, and searching now costs several probes on average, not O(1). -->

---

# Code — insert (head of the chain)

```c
void insert(int key) {
    int idx = key % M;
    Node *n = malloc(sizeof(Node));
    n->key = key;
    n->next = table[idx];  /* new head */
    table[idx] = n;
}
```

<!-- Speaker note: This is Week 2's "insert at head" linked-list operation, completely unchanged — only the bucket comes from a hash. -->

---

# Code — search (walk the chain)

```c
bool search(int key) {
    int idx = key % M;
    for (Node *c = table[idx]; c;
         c = c->next) {
        if (c->key == key) return true;
    }
    return false;
}
```

<!-- Speaker note: A `NULL` chain is handled for free here — the for-loop simply never runs, and the function returns false immediately. -->

---

# Load factor

- `α = n / m` — keys stored, divided by table size
- `α = 0.5`: chains average length 0.5 — nearly O(1)
- `α = 4`: chains average length 4 — real cost, not O(1)
- A hash table's **speed** depends directly on `α`

<!-- Speaker note: Load factor is the single number that predicts, on average, how many nodes a search must walk past. -->

---

# Complexity

- Insert: always **O(1)** — straight to the chain's head
- Search (average): **O(1 + α)** — one hash, plus the chain
- Search (worst case): **O(n)** — every key in one chain
- Keeping `α` small is what keeps chaining fast in practice

<!-- Speaker note: The worst case is deliberately alarming — Section 10's rehashing exists specifically to prevent α from ever getting that large. -->

---

# Common mistakes

- Letting `α` grow unbounded without ever resizing the table
- Forgetting an empty chain (`NULL`) means "definitely absent"
- Confusing "collision" with "error" — collisions are expected

<!-- Speaker note: A hash table with zero collisions ever is not a realistic design goal — managing them well is the actual goal. -->

---

# Mini-quiz

A table has `m = 5` buckets and `n = 20`
keys, spread evenly by chaining. What is
the load factor, and the average chain length?

<!-- Speaker note: Apply the load factor formula from a few slides back directly. -->

---

# Answer

**α = 20 / 5 = 4.** On average, each chain
holds about 4 keys — search costs roughly
4 comparisons, not O(1).

<!-- Speaker note: This exact scenario is what Section 10's rehashing later fixes, by growing the table before α gets this large. -->

---

<!-- _class: bolum -->

# 9. Open Addressing

<!-- Speaker note: Section 9 answers the collision question a second way: instead of a list outside the table, keep every key inside it. -->

---

# A question to start

Separate chaining needs extra memory for
list nodes. Could every key instead live
**directly inside** the table's own cells?

<!-- Speaker note: Yes — this whole section is three different rules for where to look next, when a key's home cell is occupied. -->

---

# The open addressing idea

- No lists: every key lives **in** the table array itself
- Collision at `h(key)`? **Probe** a sequence of other cells
- Stop at the first **empty** cell — the key settles there
- Deleting needs a **tombstone** marker, not a true empty cell
- Three probing rules follow: linear, quadratic, double hashing

<!-- Speaker note: All three rules answer exactly one question differently: "the home cell is taken — where do I look next?" The tombstone detail is explained fully in Section 9a. -->

---

# 9a. Linear Probing

<!-- Speaker note: The simplest probing rule: if a cell is taken, just try the very next one, wrapping around at the end. -->

---

# The linear probing idea

- Collision at `h(key)`? Try `h(key)+1`, `+2`, `+3`, …
- Wrap around with `mod m` when the index passes the end
- Stop at the first cell that is empty **or** deleted
- Simple to code, but keys tend to pile up in **runs**

<!-- Speaker note: Those growing runs are exactly what the next slide's "primary clustering" describes. -->

---

# Linear probing, step by step

<iframe class="dsanim" src="anim/hash-linear-probing.html?yer=slayt&lang=en" title="Linear probing"></iframe>

<!-- Speaker note: Normal example: m = 11, 10 inserts, a search, and a delete — watch a probe sequence form, then get walked again during the search. -->

---

# Edge case — search after a delete

<iframe class="dsanim" src="anim/hash-linear-probing.html?yer=slayt&lang=en&example=tombstone" title="Linear probing: tombstone"></iframe>

<!-- Speaker note: Without a tombstone, this exact search would wrongly stop at the emptied cell and report "not found" — even though the key is still further along the probe chain. -->

---

# Edge case — the table fills up

<iframe class="dsanim" src="anim/hash-linear-probing.html?yer=slayt&lang=en&example=table-full" title="Linear probing: table full"></iframe>

<!-- Speaker note: m = 8, 8 keys collide into the same cell in sequence — the table fills exactly, and the next insert is correctly rejected. -->

---

# Code — insert with linear probing

```c
bool insert(int key) {
    int idx = key % M;
    for (int i = 0; i < M; i++) {
        if (state[idx] != OCCUPIED) {
            table[idx] = key;
            state[idx] = OCCUPIED;
            return true;
        }
        idx = (idx + 1) % M;
    }
    return false;  /* table full */
}
```

<!-- Speaker note: `state[idx] != OCCUPIED` accepts both EMPTY and DELETED cells — reusing a tombstone's slot for a new key. -->

---

# Code — delete leaves a tombstone

```c
bool delete_key(int key) {
    int idx = key % M;
    for (int i = 0; i < M; i++) {
        if (state[idx] == EMPTY)
            return false;
        if (table[idx] == key) {
            state[idx] = DELETED;
            return true;
        }
        idx = (idx + 1) % M;
    }
    return false;
}
```

<!-- Speaker note: `DELETED`, never `EMPTY` — this one-word difference is what keeps every later search's probe chain intact. -->

---

# Primary clustering

- Colliding keys always retrace the **same** linear path
- Occupied runs grow, and growing runs attract more collisions
- This snowball effect is called **primary clustering**
- Sections 9b and 9c fix this with a less predictable step

<!-- Speaker note: "Predictable" is the actual problem — every key that collides at the start of a run walks the exact same growing run to escape it. -->

---

# Complexity

- Insert / search, low load factor: close to **O(1)**
- As `α` approaches 1: clustering makes cost climb sharply
- Worst case: **O(m)** — scanning the whole table
- Keeping `α` well below 1 matters even more than chaining

<!-- Speaker note: Open addressing has no "extra" memory to fall back on — once the table is full, no key at all fits, unlike chaining. -->

---

# Common mistakes

- Clearing a deleted cell to EMPTY instead of DELETED
- Letting `α` reach 1.0 — insertion then never terminates cleanly
- Forgetting search must also walk **past** DELETED cells

<!-- Speaker note: Every one of these mistakes still compiles and often "looks" correct on small test cases — that is exactly what makes them dangerous. -->

---

# Mini-quiz

A key is deleted, leaving a tombstone. A
later `search()` walks past that cell without
stopping. Why is that the correct behavior?

<!-- Speaker note: Recall the tombstone edge-case animation's speaker note, a few slides back. -->

---

# Answer

**Because a key placed after the deleted one
may have probed right past it.** Stopping at
a tombstone would wrongly report it as absent.

<!-- Speaker note: A tombstone means "something was here, keep looking" — only a true EMPTY cell means "nothing was ever placed beyond this point". -->

---

# 9b. Quadratic Probing

<!-- Speaker note: Quadratic probing keeps every key inside the table too, but replaces linear probing's fixed step with a fast-growing one. -->

---

# The quadratic probing idea

- Collision at `home`? Try `home + 1²`, `home + 2²`, …
- Step size grows fast: 1, 4, 9, 16, … instead of 1, 1, 1, …
- Spreads colliding keys apart — reduces primary clustering
- New trap: the `i²` sequence can **cycle** without success

<!-- Speaker note: The growing step is the whole fix for clustering — but that same growth is what can cause the new cycling problem. -->

---

# Quadratic probing, step by step

<iframe class="dsanim" src="anim/hash-quadratic-probing.html?yer=slayt&lang=en" title="Quadratic probing"></iframe>

<!-- Speaker note: Normal example: m = 13 (prime), 10 keys — watch the i² jumps land on scattered cells instead of one growing run. -->

---

# Edge case — m a power of 2: a cycle

<iframe class="dsanim" src="anim/hash-quadratic-probing.html?yer=slayt&lang=en&example=quadratic-cycle" title="Quadratic probing: cycle"></iframe>

<!-- Speaker note: m = 8, not prime — the i² sequence revisits the same few cells forever, even though free cells still exist elsewhere in the table. -->

---

# Code — insert with quadratic probing

```c
bool insert(int key) {
    int home = key % M;
    for (int i = 0; i < M; i++) {
        int idx = (home + i*i) % M;
        if (state[idx] != OCCUPIED) {
            table[idx] = key;
            state[idx] = OCCUPIED;
            return true;
        }
    }
    return false;
}
```

<!-- Speaker note: `i*i` is the only real change from linear probing's code — the step now depends on `i`, not on a fixed +1. -->

---

# Complexity, and why m matters

- Insert / search, low load factor: close to **O(1)**
- Less clustering than linear probing at the same `α`
- Requires `m` **prime** and `α <= 0.5` — else the `i²`
  sequence can **cycle** without reaching a free cell

<!-- Speaker note: Unlike linear probing, a bad m here can break correctness outright, not just slow things down — this condition is genuinely stronger. -->

---

# Common mistakes

- Choosing `m` as a power of 2, "because it's a round number"
- Letting `α` exceed `0.5` — cycling becomes likely
- Treating a cycled insert the same as a genuinely full table

<!-- Speaker note: The animation's edge case flags a cycle explicitly, exactly so it is never confused with a table that is truly full. -->

---

# Mini-quiz

`m = 8`. Why is quadratic probing riskier
here than with `m = 11`?

<!-- Speaker note: Recall the "complexity, and why m matters" slide's last bullet. -->

---

# Answer

**8 is a power of 2, not prime.** The `i²`
sequence can cycle through only a few cells,
even when the table still has free space.

<!-- Speaker note: This is exactly the scenario the quadratic-cycle edge-case animation demonstrated a few slides back. -->

---

# 9c. Double Hashing

<!-- Speaker note: Double hashing keeps the same "probe inside the table" idea, but makes the step itself depend on the key. -->

---

# The double hashing idea

- Two hash functions: `h1(key)` for the home, `h2(key)` for
  the **step**
- `probe(i) = (h1(key) + i * h2(key)) mod m`
- Different keys usually get **different** steps
- Colliding keys no longer retrace the same path

<!-- Speaker note: This directly fixes linear probing's problem: two keys sharing a home cell now usually take completely different routes from there. -->

---

# Double hashing, step by step

<iframe class="dsanim" src="anim/hash-double-hashing.html?yer=slayt&lang=en" title="Double hashing"></iframe>

<!-- Speaker note: Normal example: m = 13, R = 11, 10 keys — watch two keys share a home cell, then follow visibly different probe paths. -->

---

# Edge case — a shared-factor cycle

<iframe class="dsanim" src="anim/hash-double-hashing.html?yer=slayt&lang=en&example=double-hash-cycle" title="Double hashing: cycle"></iframe>

<!-- Speaker note: m = 9, not prime — a key's step shares a common factor with m, so its probe sequence cycles without reaching every cell. -->

---

# Code — the two hash functions

```c
int h1(int key, int m) {
    return key % m;
}
int h2(int key, int r) {
    return r - (key % r);  /* r < m, prime */
}
```

<!-- Speaker note: `h2` is built so its result is always in `[1, r]` — never 0, since a step of 0 would reprobe the same cell forever. -->

---

# Code — probing with two hashes

```c
int idx = h1(key, M);
int step = h2(key, R);
for (int i = 0; i < M; i++) {
    if (state[idx] != OCCUPIED) {
        table[idx] = key;
        return idx;
    }
    idx = (idx + step) % M;
}
```

<!-- Speaker note: `step` is computed once per key, outside the loop — every collision for this key then reuses that same personal step. -->

---

# Complexity, and why m matters

- Insert / search: close to **O(1)** for `α` well below 1
- Least clustering of the three probing rules
- Needs `m` prime so every step reaches **every** cell
- Usually the best open-addressing choice in practice

<!-- Speaker note: A composite m can let some keys' steps cycle, exactly like Section 9b — double hashing is not immune to the same underlying issue. -->

---

# Common mistakes

- Letting `h2(key)` possibly return **0** — an infinite step
- Choosing `m` and `R` so they share a common factor
- Forgetting `R` itself must be prime, and `R < m`

<!-- Speaker note: A step of exactly 0 is the single most dangerous bug here — it reprobes the very same occupied cell forever. -->

---

# Mini-quiz

Linear, quadratic, and double hashing all
require `m` prime for good behavior. Which
one is **most** forgiving if `m` is not prime?

<!-- Speaker note: Recall each subsection's "why m matters" bullets, and compare how strict each condition was. -->

---

# Answer

**Linear probing.** It still reaches every cell
whenever `m` is composite — only its
**clustering** gets worse, not its correctness.

<!-- Speaker note: Quadratic and double hashing can outright fail to find a free cell on a bad m; linear probing degrades gracefully instead, just more slowly. -->

---

<!-- _class: bolum -->

# 10. Rehashing

<!-- Speaker note: Section 10 answers the question every collision-resolution technique this week has been dodging: what happens when the table gets too full? -->

---

# A question to start

Every technique in Section 9 gets slower
as `α` climbs toward 1. What should happen
before that actually occurs?

<!-- Speaker note: The table should grow — but growing a hash table is not as simple as growing an array, because every key's index depends on m. -->

---

# The rehashing idea

- Pick a **threshold** for `α` (commonly around 0.7–0.8)
- Crossing it triggers a **rehash**: build a bigger table
- New size: the next **prime** at least `2 * m`
- **Every** key must be reinserted — its index may change

<!-- Speaker note: A key's index depends on m through the mod operation — change m, and almost every key's correct index changes too. -->

---

# Why every key must move

- `h(k) = k mod m` — change `m`, and `h(k)` usually changes
- Copying old cells to new ones directly would be wrong
- Instead: **reinsert** each key into the new, empty table
- This uses the exact same `insert()` already written

<!-- Speaker note: Rehashing needs no new insertion logic at all — it just calls the ordinary insert() once per surviving key. -->

---

# Rehashing, step by step

<iframe class="dsanim" src="anim/rehashing.html?yer=slayt&lang=en" title="Rehashing"></iframe>

<!-- Speaker note: Normal example: m0 = 6, 10 keys — watch α cross the threshold, a new prime-sized table appear, and every key's index get recomputed. -->

---

# Edge case — growing twice in a row

<iframe class="dsanim" src="anim/rehashing.html?yer=slayt&lang=en&example=double-rehash" title="Rehashing: grows twice"></iframe>

<!-- Speaker note: m0 = 2 is tiny — the threshold is crossed almost immediately, and a second rehash follows soon after the first. -->

---

# Code — finding the next prime size

```c
int is_prime(int x) {
    if (x < 2) return 0;
    for (int i=2; i*i<=x; i++)
        if (x % i == 0) return 0;
    return 1;
}
int next_prime(int x) {
    while (!is_prime(x)) x++;
    return x;
}
```

<!-- Speaker note: This is the exact same reasoning as Section 7's division method — the new table size still needs to be prime. -->

---

# Code — growing and reinserting

```c
void rehash(void) {
    int newM = next_prime(2 * m);
    /* … allocate newState, newTable … */
    for (int i = 0; i < m; i++)
        if (state[i] == OCCUPIED)
            insert_into(newState, newTable,
                        newM, table[i]);
    m = newM;  /* … swap in new arrays … */
}
```

<!-- Speaker note: The loop walks every OLD cell once, so this whole operation costs O(m) — expensive, but it happens rarely. -->

---

# Amortized complexity

- A single rehash costs **O(n)** — every key reinserted
- Rehashes happen **rarely**: table size at least doubles
- Spread across many inserts, average cost stays **O(1)**
- This is the same **amortized** idea as Week 2's dynamic array

<!-- Speaker note: "Amortized" means the occasional expensive operation, averaged over many cheap ones, still comes out to a small constant. -->

---

# Common mistakes

- Never rehashing at all — `α` grows without bound
- Growing to a size that is not prime
- Rehashing on every single insert instead of past a threshold

<!-- Speaker note: Rehashing on every insert would make EVERY insert cost O(n) — the whole point of a threshold is to make it rare. -->

---

# Mini-quiz

A table with `m = 6` holds `n = 5` keys, and
the threshold is `0.8`. One more key is
inserted. Does a rehash trigger, and to what size?

<!-- Speaker note: Compute the new α after the insert, then compare it to the threshold, then apply next_prime(2*m). -->

---

# Answer

**Yes.** `α = 6/6 = 1.0 > 0.8` — a rehash
triggers. New size: `next_prime(12) = 13`.

<!-- Speaker note: This is exactly the normal-preset animation's scenario above, with the same m0 = 6 starting size. -->

---

<!-- _class: bolum -->

# 11. Choosing a Collision-Resolution Technique

<!-- Speaker note: Section 11 is the practical payoff of the whole second half of the week: which technique should you actually reach for? -->

---

# Chaining vs. open addressing

| | Chaining | Open addressing |
| --- | --- | --- |
| Extra memory | Yes, per node | No, in-place |
| High `α` | Degrades gracefully | Degrades sharply |
| Deletion | Simple | Needs tombstones |

<!-- Speaker note: Every row is a genuine trade-off — neither column is simply "better" in every situation. -->

---

# Choosing within open addressing

- Simple code, `α` kept low? **Linear** probing is enough
- Want less clustering, willing to require prime `m`?
  **Quadratic** probing
- Want the best spread available? **Double** hashing

<!-- Speaker note: This ordering is also roughly the historical order these three techniques were developed in, each fixing the previous one's weak spot. -->

---

# A practical rule of thumb

- Deletions are frequent or memory is not tight? **Chaining**
- Memory matters and `α` is kept well below 1? **Open addressing**
- Either way: **rehash** before `α` gets too large
- No universally "best" choice — only best **for your case**

<!-- Speaker note: Real hash table libraries (Java's HashMap, for instance) make exactly this kind of engineering trade-off explicitly, in their documentation. -->

---

# Mini-quiz

A hash table will hold millions of keys,
with almost no deletions, and memory is
tight. Which family fits best, and why?

<!-- Speaker note: Recall the practical rule of thumb slide's first two bullets. -->

---

# Answer

**Open addressing**, likely **double hashing**.
No deletions to worry about, and no extra
per-node memory for millions of chain links.

<!-- Speaker note: If deletions later become common, tombstones would need careful handling — chaining might then become the better trade-off instead. -->

---

# Summary — faster search on sorted data

| Idea | Key fact |
| --- | --- |
| Jump search | O(sqrt(n)), block = sqrt(n) |
| Interpolation search | O(log log n) on uniform data |
| Exponential / Fibonacci | Unbounded n / no division |

<!-- Speaker note: Every row here still compares values — hashing, summarized next, is the one idea this week that mostly does not. -->

---

# Summary — hashing and collisions

| Idea | Key fact |
| --- | --- |
| Hash function | h(k) = k mod m, O(1), m prime |
| Chaining | Linked list per bucket, O(1+α) |
| Open addressing | In-place, needs tombstones, rehashing |

<!-- Speaker note: Both collision families still share one number that predicts their speed: the load factor α = n/m. -->

---

# The big picture

Sorted data supports faster-than-binary search
by exploiting extra structure. Hashing drops
comparison entirely: compute a location, handle
collisions, and grow the table before it fills.

<!-- Speaker note: If a student remembers only one sentence from today, this is the one worth remembering. -->

---

# Self-check round

Four short questions. Think before the answer
appears on the next slide. Full exercises and
a ten-question quiz are in the week notes.

<!-- Speaker note: These mirror the self-check quiz at the end of the written notes, one question per slide, with a shorter set here. -->

---

# 1. An array has 400 elements. What block size does jump search use, and roughly how many comparisons in the worst case?

<!-- Speaker note: Ask, wait, then advance. -->

---

# `block = sqrt(400) = 20`. Worst case: about `20 + 20 = 40` comparisons — far below linear search's 400.

<!-- Speaker note: This is the exact O(sqrt(n)) bound from Section 2, applied to a bigger n. -->

---

# 2. Why does interpolation search's formula need a guard against `arr[hi] == arr[lo]`?

<!-- Speaker note: Recall Section 3's division-by-zero edge case. -->

---

# Without it, the formula's denominator would be zero — a division-by-zero error, since an all-equal range makes `arr[hi] - arr[lo] = 0`.

<!-- Speaker note: This is exactly what the all-equal edge-case animation in Section 3 was built to demonstrate. -->

---

# 3. Why should a hash table's size `m` usually be chosen prime?

<!-- Speaker note: Recall Section 7's power-of-10 example. -->

---

# A prime `m` shares no common factor with most key patterns, avoiding the severe clustering a composite `m` (like a power of 10) can cause.

<!-- Speaker note: This same fact matters even more strongly for quadratic and double hashing, from Section 9. -->

---

# 4. Why must a deleted cell in open addressing become a tombstone, not a plain empty cell?

<!-- Speaker note: Recall Section 9a's tombstone edge case. -->

---

# A later search stops at the first truly empty cell. Clearing to empty would wrongly cut off the probe chain for keys placed after it.

<!-- Speaker note: This is the single most common real-world bug in open-addressing implementations, and exactly what the tombstone animation demonstrated. -->

---

<!-- _class: baslik -->

# Next week

**Week 7 — Project Demonstrations**

No new algorithms this week: teams present
their project's search or hashing component,
followed by Week 8's quiz before graph algorithms resume in Week 9.

<!-- Speaker note: Weeks 7–8 are the exam-week project demo and quiz block; Week 9 then moves on to weighted graph algorithms, building on Week 5. -->

---

# References (1/2)

- Course syllabus, Week 6: `docs/syllabus/syllabus.en.md`
- Cormen, Leiserson, Rivest, Stein. *Introduction to
  Algorithms*, 4th ed. MIT Press
- Knuth. *The Art of Computer Programming, Vol. 3:
  Sorting and Searching*, 2nd ed
- Bentley, J., Yao, A. (1976). "An almost optimal
  algorithm for unbounded searching"
- Luhn, H. P. (1953). Internal IBM memorandum on hashing

<!-- Speaker note: These are the same references listed at the end of the week's written notes. -->

---

# References (2/2)

- Kiefer, J. (1953). "Sequential minimax search
  for a maximum"
- Peterson, W. W. (1957). "Addressing for
  random-access storage"
- Sedgewick, Wayne. *Algorithms*, 4th ed. Addison-Wesley
- williamfiset/Algorithms · Programiz DSA

<!-- Speaker note: The historical references — Luhn, Kiefer, Bentley and Yao — are what today's "short history" slides drew on. -->
