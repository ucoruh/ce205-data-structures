---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 1 — Introduction, Big-O and Pointers"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 1"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Introduction, Big-O and Pointers

**CEN207 Data Structures — Week 1**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!-- Speaker note: Welcome to week one — today builds the two foundations every later week stands on: how to measure cost, and how memory actually works. -->

---

# Today's plan (3 hours)

| Hour | Topic |
| --- | --- |
| 1 | Course plan · what a data structure is · linear vs non-linear |
| 2 | Big-O: search, growth, loops, space **Anim 1–5** |
| 3 | Pointers, stack/heap, TLV/PER **Anim 6–13** · C workshop **Anim 14** |

**Learning outcomes:** LO.1 (linear/non-linear structures) · LO.2 (time and space complexity) · LO.7 (choose the right structure)

<!-- Speaker note: Fourteen short animations carry most of today's lecture; each appears once, with a second look at its trickiest case. -->

---

# This week's concepts — where

| Concept | Where |
| --- | --- |
| Data structure, linear vs non-linear | Sections 1–2 |
| Big-O, growth, best/worst/average, space | Section 3 |
| Pointers, structs | Section 4 |
| Stack, heap, TLV/PER, C workshop | Sections 5–7 |

<!-- Speaker note: Every term gets a full definition the first time it appears; this table just says where to find it again. -->

---

# How the code examples work

- Every idea has a complete **C** and **Java** program
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Sources: `code/week-01/c/` and `code/week-01/java/`
- Each program's expected output is in the week notes

<!-- Speaker note: Open a terminal now if you want to run these live; every snippet on today's slides compiles and runs exactly as shown. -->

---

# Course logistics: how you are graded

- **One project**, built all semester: C first, then Java
- **Two checkpoints**: a midterm check in C, a final in Java
- **Two quizzes** — no separate homework
- Weekly notes like this one, English and Turkish
- Full grading breakdown: the course **syllabus**

<!-- Speaker note: In class we only touch the highlights — read the syllabus, project guide and prerequisites page before next week. -->

---

# Course logistics: teams and resources

- Team size: **up to 3** students per project team
- **No team changes after week 3**
- Project guide: `docs/project-guide/`
- Prerequisites: `docs/prerequisites/` (C toolchain, background)
- Older syllabus PDF conflicts with class? **Ask, don't guess**

<!-- Speaker note: Pick a team early — the rule exists so a team's work has time to build momentum before it locks in. -->

---

# The map of this week — and of the course

| This week builds | Every later week adds |
| --- | --- |
| How to measure cost (Big-O) | One more way to arrange data |
| A picture of memory (pointers) | Judged with the same Big-O tool |

<!-- Speaker note: Data structures is a course about exactly two things: how to arrange data in memory, and how much that arrangement costs. -->

---

<!-- _class: bolum -->

# 1. What Is a Data Structure?

<!-- Speaker note: Section 1 asks the most basic question of the whole course, before we touch any code at all. -->

---

# A question to start

Your contacts app finds "Alice" among ten
thousand names almost instantly. Unsorted,
the very same phone would scan every name.

<!-- Speaker note: The arrangement of the names IS the difference — that arrangement is what we call a data structure. -->

---

# A short history

- **1960s** — "data structure" enters common use in CS
- **1968** — Knuth's *TAOCP* Vol. 1 studies lists, stacks, trees
- **1974** — Liskov & Zilles: the **abstract data type** (ADT)
- ADT = *what* a structure does, not *how* it is built

<!-- Speaker note: The ADT distinction — what versus how — is one this course leans on constantly, starting informally today. -->

---

# Intuition: furniture for data

- A filing cabinet, a bookshelf, a stack of trays
- Each holds the same *kind* of content
- Each is good at **different things**
- No single "best" arrangement — only trade-offs

<!-- Speaker note: A stack of trays is fast to add/take from the top, terrible for finding something in the middle — that is the whole idea. -->

---

# A data structure, precisely

A way of organizing data so that specific
operations — access, search, insert, delete —
can be done at a known, analyzable **cost**.

<!-- Speaker note: "Known, analyzable cost" is the part that turns a vague idea of "organizing data" into something this course can measure. -->

---

# Why there isn't just one

| Operation | Why it isn't free |
| --- | --- |
| Access | Some layouts compute a position; others walk from the start |
| Search | Unsorted: check one by one. Sorted: can be halved |
| Insert / Delete | Some shift everything after; others relink two pointers |

<!-- Speaker note: You cannot usually have all four operations be fast at once in the same structure — that trade-off is today's real subject. -->

---

# Mini-quiz

Why is there no single "best" data structure
that beats every other one at everything?

<!-- Speaker note: Let the class answer before advancing. -->

---

# Answer

Every layout makes a **trade-off**: what makes
access fast (e.g. a sorted array) tends to make
insertion slow, and vice versa. No exceptions.

<!-- Speaker note: This one sentence is the reason the rest of the semester introduces one new structure per week. -->

---

<!-- _class: bolum -->

# 2. Linear vs Non-linear: the Map of the Course

<!-- Speaker note: Every structure this semester falls into exactly one of these two families — this map is worth remembering. -->

---

# A question to start

Your last five songs played form a single line.
A company's org chart branches. Is that just
about drawing, or a real structural fact?

<!-- Speaker note: It changes what operations are cheap or expensive — that is the whole point of today's second section. -->

---

# Definitions

- **Linear**: every element has exactly one "next"
- You can always ask "what comes next?" — one answer
- **Non-linear**: an element can have several "next"s
- Traversing means *choosing* which branch to follow

<!-- Speaker note: A tree node can have several children; a graph node can connect to several others — no single "next" any more. -->

---

# The course, sorted: linear structures

| Structure | When | Defining trade-off |
| --- | --- | --- |
| Array | Week 2 | O(1) access; O(n) insert/delete in the middle |
| Linked list | Week 2 | O(n) access; O(1) insert/delete once there |
| Stack (LIFO) | Week 3 | Touch one end only; every op O(1) |
| Queue (FIFO) | Week 3 | Add one end, remove the other; every op O(1) |

<!-- Speaker note: All four are linear — every element still has exactly one next. -->

---

# The course, sorted: non-linear and by-key

| Structure | When | Defining trade-off |
| --- | --- | --- |
| Binary tree, heap | Week 4 | O(log n) when balanced, up to 2 children |
| Graph | Weeks 5–6 | Any number of connections; networks, maps |
| Hash table (by key) | Week 7 | O(1) average, by key, not position |
| Files (on disk) | Weeks 13–15 | Same trade-offs, paid in disk I/O |

<!-- Speaker note: Hash tables and files are still linear in how their slots sit — only the access pattern, by key, is new; Week 7 makes this explicit. -->

---

# Common mistakes

- "Non-linear" does **not** mean "disorganized"
- "Sorted" is not the same as "linear" — different axes
- A hash table's *slots* are linear; access by key is new

<!-- Speaker note: A tree and a graph are extremely structured — they simply allow more than one "next". -->

---

# Mini-quiz

Is a stack of plates linear or non-linear? Why?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

**Linear.** Every plate (except the top) has
exactly one plate above it, and (except the
bottom) exactly one below it — one "next".

<!-- Speaker note: A single, unambiguous next in both directions is exactly the linear definition. -->

---

# Mini-quiz

Is a family tree linear or non-linear?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

**Non-linear.** A parent can have several
children, so there is more than one "next"
from a given person.

<!-- Speaker note: This is the same branching idea as the org chart from two slides ago. -->

---

<!-- _class: bolum -->

# 3. Performance Analysis: Counting Steps, Not Seconds

<!-- Speaker note: This is the biggest section today — the tool, Big-O, that every later week uses to judge a structure. -->

---

# A question to start

You write a function that searches an array.
It works. Is it *fast*? A stopwatch tells you
about your laptop today — not about the algorithm.

<!-- Speaker note: What we want is a property of the algorithm itself: how its work grows as the input grows. -->

---

# A short history

- **1894** — Bachmann introduces capital-**O** notation
- **Early 1900s** — Landau popularizes it (a "Landau symbol")
- **1960s** — computer science adopts it for algorithm cost
- **1976** — Knuth's article standardizes O/Ω/Θ for CS

<!-- Speaker note: The notation predates computers by decades — it originally described how closely one function approximates another. -->

---

# Intuition: count the steps

Count how many times the algorithm does its
basic unit of work — one comparison, one array
access — as a function of input size **n**.

<!-- Speaker note: That count depends only on the algorithm and n — never on the machine, the language, or today's CPU load. -->

---

# Linear search: try every box

Starts at the front, checks one element after
another until it finds the target or runs out.
Needs **no particular order** in the data.

<!-- Speaker note: We will watch it count comparisons on an 11-element array, hunting for a value in the middle. -->

---

# Linear search, step by step

<iframe class="dsanim" src="anim/linear-search.html?yer=slayt&lang=en" title="Linear search: counting comparisons"></iframe>

<!-- Speaker note: Normal example: 11 values, target in the middle. Watch the comparison counter climb one box at a time. -->

---

# Edge case — target not in the array

<iframe class="dsanim" src="anim/linear-search.html?yer=slayt&lang=en&example=not-found" title="Linear search: not found"></iframe>

<!-- Speaker note: When the target is missing, linear search still checks every single box before it can say so — the true worst case. -->

---

# Code — linear_search (the loop)

```c
for (int i = 0; i < n; i++) {
    (*comparisons)++;
    if (arr[i] == target)
        return i;
}
```

<!-- Speaker note: One comparison per iteration, counted explicitly — this is exactly what the animation just counted on screen. -->

---

# Linear search: the result

- Worst case (last element, or absent): **n** comparisons
- Best case (first element): **1** comparison
- Cost grows **directly with n** — this is **O(n)**

<!-- Speaker note: A million-element array would need up to a million comparisons in the worst case — that direct growth is O(n). -->

---

# Binary search: eliminate half every time

If the array is **sorted**: check the middle.
Too small? Discard the left half. Too big?
Discard the right half. Repeat.

<!-- Speaker note: We will search for the same target, 42, that just took linear search 9 comparisons. -->

---

# Binary search, step by step

<iframe class="dsanim" src="anim/binary-search.html?yer=slayt&lang=en" title="Binary search: halving the range"></iframe>

<!-- Speaker note: Normal example: 16 sorted values, target found. Watch lo, hi and mid close in on the answer. -->

---

# Edge case — not found: lo crosses hi

<iframe class="dsanim" src="anim/binary-search.html?yer=slayt&lang=en&example=hard" title="Binary search: not found"></iframe>

<!-- Speaker note: 31 values this time; the range keeps halving until lo is greater than hi — nothing left to check. -->

---

# Code — binary_search (core step)

```c
int mid = lo + (hi - lo) / 2;
(*comparisons)++;
if (arr[mid] == target)
    return mid;
if (arr[mid] < target)
    lo = mid + 1;
else
    hi = mid - 1;
```

<!-- Speaker note: One comparison eliminates half of whatever is left — that halving is the entire trick. -->

---

# Binary search: the result

- The same `42` took **3** comparisons, not 9
- Every comparison throws away **half** of what is left
- Number of halvings before reaching 1: **log₂ n** — **O(log n)**

<!-- Speaker note: The trade-off: binary search needs the array sorted first, and sorting itself costs more than one search. -->

---

# The growth race: shape beats speed

Watch three functions race as `n` doubles:
plain `n`, `n·log₂n` (best sorts), and `n²`
(simple sorts, and nested loops in general).

<!-- Speaker note: Two points on a much larger scale — this animation shows the whole scale at once. -->

---

# The growth race, step by step

<iframe class="dsanim" src="anim/growth-race.html?yer=slayt&lang=en" title="The growth race"></iframe>

<!-- Speaker note: Normal example: n doubling from 1 to 512. Watch n-squared and 2^n pull away from the rest. -->

---

# Edge case — 2^n overflows almost at once

<iframe class="dsanim" src="anim/growth-race.html?yer=slayt&lang=en&example=large-from-start" title="Growth race: large n from the start"></iframe>

<!-- Speaker note: Starting at n = 400, 2^n is already far too large to draw on the same chart as the others. -->

---

# Growth, at realistic sizes

| n | n·log₂n | n² |
| --- | --- | --- |
| 100 | 664 | 10,000 |
| 10,000 | 132,877 | 100,000,000 |
| 100,000 | 1,660,964 | 10,000,000,000 |

<!-- Speaker note: At n = 100,000, n-squared is over 6,000 times larger than n log n — instant on a toy input, very different at scale. -->

---

# Code — the growth table

```c
for (int i = 0; i < count; i++) {
    long n = ns[i];
    double nlogn = (double) n * log2((double) n);
    double nsq = (double) n * (double) n;
}
```

<!-- Speaker note: This is exactly the loop that produced the table you just saw, for five realistic sizes. -->

---

# Big-O, precisely

`f(n)` is `O(g(n))` if, from some point on, `f`
never grows faster than a constant multiple
of `g`. In practice: **drop constants, keep
the dominant term.**

<!-- Speaker note: You rarely compute the constants formally — you count the steps and read off the fastest-growing term. -->

---

# Reading off the dominant term

| Steps counted | Dominant term | Big-O |
| --- | --- | --- |
| `3n + 7` | `n` | O(n) |
| `n² + 2n + 1` | `n²` | O(n²) |
| `2·log₂n + 5` | `log n` | O(log n) |

<!-- Speaker note: The pattern: keep the fastest-growing term, throw away everything smaller and every constant. -->

---

# The order, fastest to slowest

**O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)**

You already met the first three today —
`O(n log n)` and `O(2ⁿ)` arrive later this semester.

<!-- Speaker note: O(1) is constant-time array access from pointer arithmetic; O(log n) is binary search; O(n) is linear search. -->

---

# Building T(n) by hand: a nested loop

A loop inside another loop: for every one of
the `n` outer iterations, the inner loop runs
all `n` of its own — the classic `n²` source.

<!-- Speaker note: Instead of trusting the table, let's count a real, counted program and see n-squared appear for ourselves. -->

---

# Counting a nested loop, step by step

<iframe class="dsanim" src="anim/nested-loop-counting.html?yer=slayt&lang=en" title="Counting a nested loop"></iframe>

<!-- Speaker note: Normal example: a square loop (j < n), n = 3 shown in full detail, then nine more n values. -->

---

# Edge case — a different loop shape

<iframe class="dsanim" src="anim/nested-loop-counting.html?yer=slayt&lang=en&example=hard" title="Nested loop: a triangle shape"></iframe>

<!-- Speaker note: A triangle loop (j < i) still runs the inner body n(n-1)/2 times — still O(n squared), a different constant. -->

---

# Code — the nested loop

```c
long count = 0;
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
        count++;
        (*operations)++;
    }
}
```

<!-- Speaker note: The measured count matched n*n exactly for every n tried — T(n) = n squared, plus smaller dropped terms. -->

---

# Best, worst, and average case

- **Best**: target is first checked — 1 comparison
- **Worst**: target is last, or absent — n comparisons
- **Average**: `(1 + 2 + ... + n) / n = (n + 1) / 2`
- Unqualified "Big-O of an algorithm" usually means **worst**

<!-- Speaker note: The worst case is the guarantee that matters most when you cannot control the input. -->

---

# Space complexity: the same idea, for memory

Big-O counts **time** by counting steps; space
complexity counts **memory** — extra storage
beyond the input itself.

<!-- Speaker note: A recursive function pushes one stack frame per call; that is extra memory a loop never needs. -->

---

# Recursive vs iterative sum, step by step

<iframe class="dsanim" src="anim/space-recursive-vs-iterative.html?yer=slayt&lang=en" title="Space complexity: recursive vs iterative sum"></iframe>

<!-- Speaker note: Normal example: 10 values. Watch the call stack grow one frame per call, then unwind. -->

---

# Edge case — deep recursion, 22 frames

<iframe class="dsanim" src="anim/space-recursive-vs-iterative.html?yer=slayt&lang=en&example=deep" title="Space complexity: deep recursion"></iframe>

<!-- Speaker note: 22 elements means 23 frames at the peak — the stack really can run out for large enough n. -->

---

# Code — recursive vs iterative sum

```c
int sum_recursive(const int arr[], int n) {
    if (n == 0)
        return 0;
    return arr[n - 1] + sum_recursive(arr, n - 1);
}

int sum_iterative(const int arr[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++)
        total += arr[i];
    return total;
}
```

<!-- Speaker note: Both return the same sum. sum_recursive uses O(n) stack space; sum_iterative always uses exactly O(1). -->

---

# Common mistakes

- Reading Big-O off the *code*, not the *steps*
- Forgetting binary search needs **sorted** input
- Confusing O(1) with "instant" — it just means "not growing"
- Quoting only worst case when average matters more

<!-- Speaker note: A hidden loop inside a line (like arr.contains(x)) can quietly turn an O(n) loop into O(n squared). -->

---

# Mini-quiz

An algorithm does exactly `5n + 20` basic
operations. What is its Big-O?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

**O(n)**. Drop the constant factor (5) and the
additive constant (20); only the fastest-growing
term, `n`, survives.

<!-- Speaker note: This is the "read off the dominant term" table applied directly. -->

---

# Mini-quiz

Why can't binary search be used directly on
a linked list the way it is on an array?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

Binary search needs **O(1) access** to the
middle by index. A linked list must be walked
node by node — already O(n), erasing the gain.

<!-- Speaker note: Week 2 builds exactly this structure, so this question previews next week directly. -->

---

# Mini-quiz

Without qualification, which case does
"Big-O of an algorithm" usually mean?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

The **worst case**: the guaranteed upper
bound, useful precisely because it holds no
matter what input you are given.

<!-- Speaker note: Best cases tend to look similar across algorithms, which is exactly why the worst case is more useful to compare. -->

---

<!-- _class: bolum -->

# 4. Pointers and Objects

<!-- Speaker note: A pointer is the location of a variable, not just its value — today we make that idea completely concrete. -->

---

# A question to start

Write `swap(a, b)` to exchange two variables
in the caller. In many languages this is
impossible — the function only sees *copies*.

<!-- Speaker note: To reach back into the caller's variables, a function needs the LOCATION of each one, not just its value — that location is a pointer. -->

---

# A short history

- **1966/1969** — BCPL, then B: address-of, dereference
- **1972** — Dennis Ritchie's C makes pointers central
- **1995** — Java removes raw pointers, keeps **references**
- References: shared data, no arithmetic, no bad addresses

<!-- Speaker note: You can still have two Java variables name the same object — you just cannot compute an arbitrary address. -->

---

# Intuition: memory as numbered mailboxes

- A variable is a mailbox: address + contents
- `&x` asks "what is x's mailbox number?"
- A **pointer** holds another mailbox's number
- Dereferencing (`*p`): go read that mailbox

<!-- Speaker note: int x = 3 puts 3 in some mailbox, say number 1000 — &x gets you that 1000. -->

---

# The pointer operations

| Operation | Syntax | Complexity |
| --- | --- | --- |
| Address-of | `&x` | O(1) |
| Declare | `int *p;` | O(1) |
| Assign an address | `p = &x;` | O(1) |
| Dereference (read/write) | `*p` / `*p = v;` | O(1) |

<!-- Speaker note: Every one of these is O(1) — following a pointer is always a single jump, never a search. -->

---

# A variable, its address, a pointer

<iframe class="dsanim" src="anim/pointer-basics.html?yer=slayt&lang=en" title="Pointer basics"></iframe>

<!-- Speaker note: Normal example: five operations — address-of, write through, copy (alias), move, add through the alias. -->

---

# Edge case — a NULL-pointer dereference

<iframe class="dsanim" src="anim/pointer-basics.html?yer=slayt&lang=en&example=null-deref" title="Pointer basics: NULL dereference"></iframe>

<!-- Speaker note: A write through a NULL pointer is never executed here — it is flagged as undefined behavior instead. -->

---

# Code — pointers: address, alias, NULL

```c
int *p = NULL, *q = NULL;
p = &v[i];
*p = val;
q = p;
*q += k;
if (r != NULL)
    *r = val;
```

<!-- Speaker note: q = p copies the ADDRESS, not the value — q and p now alias the same variable. -->

---

# Java: reference vs value, side by side

```java
int[] box = {3};
int[] alias = box;
alias[0] = 5;
int y = x;
y = 99;
```

<!-- Speaker note: alias is a second name for the SAME array as box; y is an independent COPY of x — same syntax shape, opposite behavior. -->

---

# Pointer arithmetic: p + k, not k bytes

`p + k` never moves `k` bytes — it moves
`k × sizeof(*p)` bytes. `int` is 4 bytes,
so `p + 1` skips 4 bytes, not 1.

<!-- Speaker note: This is the O(1) arithmetic that array indexing, arr[i], compiles down to. -->

---

# Pointer arithmetic, step by step

<iframe class="dsanim" src="anim/pointer-arithmetic.html?yer=slayt&lang=en" title="Pointer arithmetic"></iframe>

<!-- Speaker note: Normal example: an int array, five valid offsets. Watch each computed address and its dereferenced value. -->

---

# Edge case — out-of-range offsets

<iframe class="dsanim" src="anim/pointer-arithmetic.html?yer=slayt&lang=en&example=out-of-range" title="Pointer arithmetic: out of range"></iframe>

<!-- Speaker note: A negative offset and one past the end are both flagged as undefined behavior, never dereferenced. -->

---

# Code — pointer arithmetic

```c
int a[N];
int *p = a;
if (k < 0 || k >= N) {
    /* out of range: undefined behavior (UB) */
} else {
    void *addr = (void *) (p + k);
    int v = *(p + k);
}
```

<!-- Speaker note: Java has no pointer arithmetic at all — only a[k], and an out-of-range k throws a clear exception. -->

---

# Pointer to a struct, and `->`

A `struct` groups fields into one value.
`(*p).field` is so common C gives it a
shorthand: `p->field`.

<!-- Speaker note: A pointer to a struct lets you reach — and modify — the ORIGINAL struct, not a copy of it. -->

---

# Struct pointer, walking an array

<iframe class="dsanim" src="anim/struct-pointer.html?yer=slayt&lang=en" title="A pointer walking an array of structs"></iframe>

<!-- Speaker note: Normal example: 10 students, 2 grade updates. Watch (*p).id, p->grade, and p++ advance by sizeof(Student). -->

---

# Edge case — one student only

<iframe class="dsanim" src="anim/struct-pointer.html?yer=slayt&lang=en&example=single-student" title="Struct pointer: one student"></iframe>

<!-- Speaker note: p reaches "one past the end" immediately — legal to HOLD, but never to dereference. -->

---

# Code — walking an array of structs

```c
Student *p = students;
for (; p != students + N; p++) {
    int id = (*p).id;
    int grade = p->grade;
    p->grade = new_grade;
}
```

<!-- Speaker note: (*p).id and p->id are the same value — the arrow is purely a shorthand, nothing more. -->

---

# Common mistakes

- Using `int *p;` before it points anywhere (wild pointer)
- `int *p, x;` — only `p` is a pointer, not `x`
- Confusing `*` in a **declaration** vs an **expression**
- Java's exception is not the same as C's undefined behavior

<!-- Speaker note: Java checks every dereference and fails loudly; C simply does whatever the hardware does with a bad address. -->

---

# Mini-quiz

Given `int *p = &x;`, what is the difference
between `p` and `*p`?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

`p` is the **address** stored in the pointer
(x's address). `*p` is the **value** at that
address (x's value).

<!-- Speaker note: Same variable, two completely different questions depending on whether you dereference it. -->

---

# Mini-quiz

Why does Java need no `->` operator at all?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

Every object/array variable in Java is
**already a reference** — `.` always means
"follow it, then access the field".

<!-- Speaker note: C needs both . (for values) and -> (for pointers); Java only ever needs one. -->

---

<!-- _class: bolum -->

# 5. Memory Layout: Stack, Heap, and Who Cleans Up

<!-- Speaker note: This is the single most important fact about memory you will use all semester. -->

---

# A question to start

A function declares a local array and returns.
What happens to it? Now compare: a function
`malloc`s a block and returns without freeing.

<!-- Speaker note: The two questions have completely different answers — that difference is today's whole subject. -->

---

# A short history

- **Stack** — one frame per call, back to Algol 60
- **`malloc`/`free`** — earliest Unix C libraries, early 1970s
- **Garbage collection** — McCarthy, Lisp, **1959**
- Java (1995) made GC mainstream for everyday programming

<!-- Speaker note: GC is much older than most people assume — it predates Java by 36 years. -->

---

# Intuition: a neat pile vs a warehouse

- **Stack**: every call pushes a frame; return pops it
- Always LIFO, always automatic, always fast
- **Heap**: you ask for a block; it stays until *given back*
- Nobody does that "giving back" for you in C

<!-- Speaker note: Pushing or popping a stack frame is just moving one pointer — that is why it is so fast. -->

---

# Stack vs heap, side by side

| | Stack | Heap |
| --- | --- | --- |
| Allocates | Compiler, automatically | You: `malloc` (C) / `new` (Java) |
| Freed | Automatically, on return | C: `free()`. Java: the GC |
| Speed | Extremely fast | Slower: finds a free block |

<!-- Speaker note: A stack overflow is deep recursion outrunning a small, fixed region; the heap is much larger but slower. -->

---

# How a stack frame connects to a heap block

<iframe class="dsanim" src="anim/stack-vs-heap.html?yer=slayt&lang=en" title="Stack frames vs a heap block"></iframe>

<!-- Speaker note: Normal example: 10 blocks, properly owned, some freed. Watch main's blocks[] column point at each heap row. -->

---

# Edge case — a dangling pointer, flagged

<iframe class="dsanim" src="anim/stack-vs-heap.html?yer=slayt&lang=en&example=dangling" title="Stack vs heap: dangling pointer"></iframe>

<!-- Speaker note: A second alias still holds a freed block's old address; using it is flagged as UB, never executed. -->

---

# Code — alloc_block / free_block

```c
static int *alloc_block(int size) {
    int *p = malloc(size * sizeof(int));
    return p;
}

static void free_block(int *p) {
    free(p);
}
```

<!-- Speaker note: p is local to alloc_block's own frame — only the RETURNED address survives once that frame pops. -->

---

# Java: `new` and garbage collection

In C, forgetting `free` — or using a pointer
after freeing it — is entirely your job to
avoid. Java removes `free` from the language.

<!-- Speaker note: An object lives on the heap until the garbage collector proves nothing can reach it any more. -->

---

# Java references, aliasing, GC

<iframe class="dsanim" src="anim/java-reference-heap.html?yer=slayt&lang=en" title="Java references, aliasing, and GC"></iframe>

<!-- Speaker note: Normal example: a reference chain, ordinary collection. Watch objects become unreachable and get swept. -->

---

# Edge case — a cycle, still collected

<iframe class="dsanim" src="anim/java-reference-heap.html?yer=slayt&lang=en&example=cycle" title="Java references: a reference cycle"></iframe>

<!-- Speaker note: Two objects point at each other, but once NO root reaches either, both are collected — reachability, not reference counting. -->

---

# Code — Java references: alias and cycle

```java
Node p = new Node();
Node q = p;
p.ref = q;
q.ref = p;
p = null;
q = null;
```

<!-- Speaker note: In C, this exact pattern would leak forever — C has no garbage collector to notice the cycle is unreachable. -->

---

# Common mistakes

- Dangling pointer: use pointer after `free`, not `NULL`
- Double free: freeing the same pointer twice
- Forgetting `free` on an early-return path (a **leak**)
- Assuming Java's GC makes leaks impossible (it does not)

<!-- Speaker note: An object you keep an unneeded reference to cannot be collected, and still "leaks" in effect. -->

---

# Preview: array layout vs linked layout

An array reserves one contiguous block:
`arr[i]` is a single calculation, O(1). A
linked list scatters nodes, joined by pointers.

<!-- Speaker note: Next week you build exactly this linked structure — today is only the preview. -->

---

# Array vs linked layout, step by step

<iframe class="dsanim" src="anim/array-vs-linked-preview.html?yer=slayt&lang=en" title="Preview: array vs linked layout"></iframe>

<!-- Speaker note: Normal example: 10 values, k = 4. Compare one computed address versus four hops through next. -->

---

# Edge case — the last element: most hops

<iframe class="dsanim" src="anim/array-vs-linked-preview.html?yer=slayt&lang=en&example=last" title="Array vs linked: the last element"></iframe>

<!-- Speaker note: The array still reaches the last element in one step; the linked list needs every single hop from the head. -->

---

# Code — building a linked list

```c
Node *head = NULL;
for (int i = N - 1; i >= 0; i--) {
    Node *node = malloc(sizeof(Node));
    node->data = arr[i];
    node->next = head;
    head = node;
}
```

<!-- Speaker note: Same n values, opposite access cost: array O(1), linked list O(n) — same data, completely different shape. -->

---

# Mini-quiz

A function declares `int arr[100];` locally
and returns a pointer to it. What is wrong?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

`arr` lives on the **stack**, in that frame.
The instant the function returns, the frame
is popped — the pointer is dangling already.

<!-- Speaker note: The fix: allocate with malloc instead, so the memory survives the function returning. -->

---

# Mini-quiz

Why does `free(block); block = NULL;` — in
that order — matter?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

`free` needs the real address. `NULL`ing
first makes `free(NULL)` do nothing — the
block leaks, its address lost forever.

<!-- Speaker note: The order is not a style choice — reversing it silently creates a memory leak. -->

---

# Mini-quiz

Why can a dangling pointer never occur in
Java the way it does in C?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

Java has no `free`: an object is only
reclaimed once the GC proves nothing can
reach it — never while still reachable.

<!-- Speaker note: There is never a moment where a reachable reference points at memory already taken back. -->

---

<!-- _class: bolum -->

# 6. ASN.1, BER TLV, and PER TLV

<!-- Speaker note: How do two completely different programs agree, byte for byte, on a structured record? -->

---

# A question to start

Two programs, different languages, different
machines, exchange a record as bytes. A raw
`struct` layout is not portable at all.

<!-- Speaker note: The compiler, platform and padding rules all affect a struct's exact byte layout — we need something both sides agree on. -->

---

# A short history

- **1984** — ASN.1 born as ITU-T/CCITT X.409
- **1995** — X.680 series: the modern, current form
- **BER** (X.690) — self-describing tag + length + value
- **PER** (X.691, 1994) — packs bits when both sides know the schema

<!-- Speaker note: ASN.1 with BER still underlies X.509 certificates — the basis of HTTPS — LDAP, and SNMP, invisibly. -->

---

# Intuition: an envelope, three parts

- **Tag**: what kind of value is this?
- **Length**: how many bytes does it take?
- **Value**: the content itself
- Universally called **TLV**

<!-- Speaker note: A decoder that has never seen your record before can still walk it correctly: read tag, read length, skip that many bytes, repeat. -->

---

# The TLV byte layout

| Part | Size | What it encodes |
| --- | --- | --- |
| Tag | 1 byte | class · primitive/constructed · tag number |
| Length | 1+ bytes | short form (0–127) or long form (≥128) |
| Value | Length bytes | the content, or nested TLVs |

<!-- Speaker note: INTEGER is tag 0x02, UTF8String is tag 0x0C, SEQUENCE is tag 0x30 — real ASN.1 universal-class numbers. -->

---

# TLV encoding, field by field

<iframe class="dsanim" src="anim/tlv-encoding.html?yer=slayt&lang=en" title="TLV encoding"></iframe>

<!-- Speaker note: Normal example: 10 fields — integers, short strings, booleans — each becomes Tag, Length, Value. -->

---

# Edge case — a length that needs the long form

<iframe class="dsanim" src="anim/tlv-encoding.html?yer=slayt&lang=en&example=long-value" title="TLV encoding: the long form"></iframe>

<!-- Speaker note: A 300-character string's length no longer fits in one byte — the long form spends extra bytes just to say "how many". -->

---

# Code — encode_length: short vs long

```c
if (len < 128) {
    out[0] = (unsigned char) len;
    return 1;
}
int n = 0;
while (len > 0) {
    tmp[n++] = (unsigned char) (len & 0xFF);
    len >>= 8;
}
out[0] = (unsigned char) (0x80 | n);
```

<!-- Speaker note: The short form is one byte; the long form's top bit set means "the next n bytes ARE the length". -->

---

# BER vs PER

| | BER | PER |
| --- | --- | --- |
| Self-describing | Yes: tag + length every field | No: schema must be known |
| Size | Larger: 2+ bytes per field | Much smaller: bits, not bytes |
| Typical use | X.509, LDAP, SNMP | Bandwidth-critical (cellular) |

<!-- Speaker note: Both encode the same abstract information — BER trades size for self-description, PER trades the reverse. -->

---

# PER: exactly as many bits as needed

If both sides know a field's range `[min, max]`,
no tag and no length are needed — only
`ceil(log2(max - min + 1))` bits.

<!-- Speaker note: The same kind of record as BER, this time packed bit by bit instead of byte by byte. -->

---

# PER encoding, bit by bit

<iframe class="dsanim" src="anim/per-encoding.html?yer=slayt&lang=en" title="PER-style bit packing"></iframe>

<!-- Speaker note: Normal example: 10 fields — name characters, an age, a few constrained numbers — packed into a handful of bytes. -->

---

# Edge case — a range of size 1: zero bits

<iframe class="dsanim" src="anim/per-encoding.html?yer=slayt&lang=en&example=range-size-one" title="PER: a range of size one"></iframe>

<!-- Speaker note: When min equals max, there is only one possible value — the receiver already knows it, so NOTHING is sent. -->

---

# Code — pack_bits: one bit at a time

```c
int bit = (int) ((value >> i) & 1u);
int byte_index = *bitpos / 8;
int bit_index = 7 - (*bitpos % 8);
/* if (bit) buf[byte_index] |= the bit, MSB first */
(*bitpos)++;
```

<!-- Speaker note: PER output is only byte-aligned at the very end, not field by field — bits pack right up against each other. -->

---

# Common mistakes

- Forgetting the length prefix, hoping a fixed read works
- Assuming length always fits one byte (only under 128)
- Confusing Length (just V) with the whole TLV's size
- Treating BER and PER bytes as interchangeable — they are not

<!-- Speaker note: A PER decoder cannot parse BER bytes, or vice versa — two different byte formats for the same schema. -->

---

# Mini-quiz

What do the three letters in TLV stand for,
and in what order?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

**Tag, Length, Value** — in exactly that
order: what kind, how many bytes, then the
bytes themselves.

<!-- Speaker note: A decoder never has to guess a size — the length prefix always tells it exactly. -->

---

# Mini-quiz

Why is SEQUENCE's tag byte `0x30`, not
`0x10` (tag number 16 in binary)?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

The top 3 bits are not the tag number: 2
class bits (`00`) + 1 constructed bit (`1`,
since SEQUENCE holds more TLVs) = `0x30`.

<!-- Speaker note: 00 1 10000 in binary is exactly 0x30 — the constructed bit is what changes 0x10 into 0x30. -->

---

<!-- _class: bolum -->

# 7. Hands-on Lab: the C Toolchain

<!-- Speaker note: Every idea today is worthless until it compiles and runs — this section sets up the workflow for the whole semester. -->

---

# Why this matters

From here on, every week hands you C and
Java programs to build yourself. The midterm
project is graded, in part, on a clean build.

<!-- Speaker note: This lab sets up, once, the exact workflow you repeat all semester: compile, run, debug. -->

---

# The toolchain, briefly

- **GCC** — Richard Stallman, GNU project, **1987**
- **GDB** — same GNU project, **1986**: step through, inspect
- **CMake** — generates build files for whatever tool you have
- Same `CMakeLists.txt` builds on Windows, WSL, and Linux

<!-- Speaker note: A compiler translates source to machine code; a linker stitches it together with the C standard library. -->

---

# Code — your first compile

```c
#include <stdio.h>

int main(void) {
    printf("Hello, Data Structures!\n");
    return 0;
}
```

`gcc -std=c11 -Wall -Wextra -o /tmp/x hello_workshop.c && /tmp/x`

<!-- Speaker note: gcc compiles hello_workshop.c into x; && only runs it if the compile succeeded. -->

---

# Compile with warnings on, and read them

`-Wall -Wextra` catches unused variables,
suspicious comparisons, format mismatches.
Every program here must compile **cleanly**.

<!-- Speaker note: A warning is the compiler telling you something is probably a bug, before you find out the hard way at runtime. -->

---

# A small bug hunt

```c
int average_buggy(const int arr[], int n) {
    if (n == 0) return 0;
    int sum = 0;
    for (int i = 0; i < n; i++)
        sum = sum + arr[i];
    return sum / n;
}
```

<!-- Speaker note: The average it prints is wrong — sum and n look right, but something in the last line is not. -->

---

# Finding it with gdb

The method: set a breakpoint, run, inspect a
variable, confirm or refute a hypothesis.
Watch it happen live, step by step.

<!-- Speaker note: This scales to bugs far subtler than the one we are about to find. -->

---

# Debugger stepping, live

<iframe class="dsanim" src="anim/debugger-stepping.html?yer=slayt&lang=en" title="Stepping through a debugger"></iframe>

<!-- Speaker note: Normal example: 10 elements. Watch i, sum and n in the watch panel as we step, then print sum / n. -->

---

# Edge case — the empty-array guard

<iframe class="dsanim" src="anim/debugger-stepping.html?yer=slayt&lang=en&example=empty" title="Debugger stepping: empty array"></iframe>

<!-- Speaker note: n == 0 stops the program right at the guard line — dividing by zero would be undefined behavior. -->

---

# The gdb session

```console
(gdb) break debug_average.c:11
(gdb) run
(gdb) print sum
(gdb) print sum / n
(gdb) print (double) sum / n
(gdb) continue
```

<!-- Speaker note: sum/n gives 7 (integer division); (double) sum/n gives the real answer, 7.666... — the bug was only in the final division. -->

---

# Code — CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.20)
project(week1_cmake_demo C)
add_executable(week1_cmake_demo main.c)
```

`cmake -S . -B build && cmake --build build`

<!-- Speaker note: The first command CONFIGURES: reads CMakeLists.txt, checks the compiler. The second BUILDS: compiles and links. -->

---

# A note on Visual Studio

Build → Build Solution compiles; Debug →
Start Debugging (F5) runs under the debugger;
clicking the margin sets a breakpoint.

<!-- Speaker note: Visual Studio can open a CMakeLists.txt directly — the same file from the last slide works unchanged. -->

---

# Common mistakes

- Forgetting `-std=c11`: different behavior per machine
- Committing a `build/` folder or `.exe` files to Git
- Running a stale executable after a failed compile
- Reaching only for `printf`, never a two-minute gdb session

<!-- Speaker note: Always chain the run with && so a failed compile never lets you run yesterday's binary by accident. -->

---

# Mini-quiz

What does `-Wall -Wextra` do, and why does
this course require a clean build under it?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

It enables a wide set of warnings. They
usually point at real bugs — requiring a
clean build fixes them immediately.

<!-- Speaker note: Not discovered later, at runtime, the hard way. -->

---

# Mini-quiz

What is the difference between what
`cmake -S . -B build` and `cmake --build
build` each do?

<!-- Speaker note: Let the class answer, then advance. -->

---

# Answer

The first **configures**: generates build
files, compiles nothing. The second **builds**:
invokes that tool to compile and link.

<!-- Speaker note: Configure once (usually), build every time you change the source. -->

---

# Summary — foundations of the semester

| Idea | Key fact |
| --- | --- |
| Data structure | Known, analyzable cost — always a trade-off |
| Linear vs non-linear | One "next" vs possibly several |
| Big-O | Upper bound on growth; read off the dominant term |
| Space complexity | Same idea, applied to extra memory |

<!-- Speaker note: Every later week adds one more structure, judged with exactly these same tools. -->

---

# Summary — memory and encoding

| Idea | Key fact |
| --- | --- |
| Pointer / reference | Stores an address; `&`, `*`, `->` |
| Stack / heap | Automatic, LIFO / requested, released explicitly |
| TLV / BER / PER | Self-describing bytes, or bits packed by schema |
| C toolchain | `gcc`, `gdb`, CMake — compile, run, debug |

<!-- Speaker note: Pointers, the stack and the heap are the picture of memory every later week assumes you already have. -->

---

# The big picture

Two tools, built today — **Big-O** to measure
cost, and a picture of **memory** — judge
every single structure for the rest of term.

<!-- Speaker note: If a student remembers only one sentence from today, this is the one worth remembering. -->

---

# Self-check round

Five short questions. Think before the
answer appears. Full exercises and a
ten-question quiz are in the week notes.

<!-- Speaker note: These mirror the self-check quiz at the end of the written notes, one question per slide, a shorter set here. -->

---

# 1. Why can two different, correct algorithms have very different Big-O?

<!-- Speaker note: Ask, wait, then advance. -->

---

# Big-O measures the *number of steps*, not whether the answer is right

Linear search and binary search both
correctly find a value, at O(n) and
O(log n) respectively.

<!-- Speaker note: Correctness and cost are two completely separate questions. -->

---

# 2. Order these from fastest- to slowest-growing: O(n log n), O(1), O(n), O(log n), O(n²)

<!-- Speaker note: Ask, wait, then advance. -->

---

# O(1) < O(log n) < O(n) < O(n log n) < O(n²)

<!-- Speaker note: This exact order comes back every single week for the rest of the semester. -->

---

# 3. Why does binary search require a sorted array?

<!-- Speaker note: Ask, wait, then advance. -->

---

# Comparing to the middle only helps if one side is guaranteed smaller and the other larger

That guarantee is exactly what "sorted"
means. Linear search relies on no ordering.

<!-- Speaker note: Without sorted order, discarding a whole half would be a guess, not a guarantee. -->

---

# 4. In a BER TLV encoding, what does the Length field actually count?

<!-- Speaker note: Ask, wait, then advance. -->

---

# The bytes in the Value that immediately follow — not the whole TLV's size

The SEQUENCE example had Length = 8, but
the whole encoded SEQUENCE was 10 bytes.

<!-- Speaker note: Length never counts the Tag byte or its own Length byte(s). -->

---

# 5. Why does `p->x` exist, and what is it shorthand for?

<!-- Speaker note: Ask, wait, then advance. -->

---

# `p->x` is shorthand for `(*p).x`: dereference, then access the field

It exists because this exact combination
is extremely common in C code.

<!-- Speaker note: Dereference-then-access is such a frequent pattern that C gave it its own operator. -->

---

<!-- _class: baslik -->

# Next week

**Week 2 — Linked Lists**

Build a chain of individually allocated
nodes, connected by exactly the pointers
you met today, living on today's heap.

<!-- Speaker note: The O(1)-insert-anywhere, O(n)-access trade-off from today's preview, now in full: insertion, deletion, traversal, measured. -->

---

# References (1/2)

- Course syllabus, Week 1: `CEN207-2026-2027-Guz-Izlence.en.md`
- Knuth. *The Art of Computer Programming, Vol. 1*, 3rd ed.
- Liskov, Zilles. "Programming with Abstract Data Types," 1974
- Knuth. "Big Omicron and Big Omega and Big Theta," 1976
- Cormen, Leiserson, Rivest, Stein. *Introduction to Algorithms*, 3rd ed.

<!-- Speaker note: These are the same references listed at the end of the week's written notes. -->

---

# References (2/2)

- Sedgewick, Wayne. *Algorithms*, 4th ed.
- Kernighan, Ritchie. *The C Programming Language*, 2nd ed.
- Liang. *Introduction to Java Programming*, 10th ed.
- ITU-T X.680 / X.690 / X.691 — ASN.1, BER, PER
- GNU (GCC, GDB) and Kitware (CMake) documentation

<!-- Speaker note: The historical references — Bachmann, Landau, Knuth, Liskov, Cayley's spirit of counting structures — are what today's "short history" slides drew on. -->
