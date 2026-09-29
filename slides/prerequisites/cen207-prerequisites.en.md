---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Data Structures — Prerequisites"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Prerequisites"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Prerequisites

**CEN207 Data Structures — what to bring on day one**

Asst. Prof. Dr. Uğur CORUH · Fall 2026-2027

<!-- Speaker note: This deck mirrors the Prerequisites page; the "Test yourself" tasks near the end are the same ones on that page. -->

---

# Why this matters from week 1

- From the first week you **write, build and test programs on your own computer**
- First in **C** for the midterm project, later in **Java** for the final project
- You keep your work under **Git and GitHub** throughout
- You therefore need to arrive with the knowledge and tools in this deck

<!-- Speaker note: This is not a "nice to have" list — week 1's C workshop assumes all of this is already working. -->

---

# Formal prerequisites

- **CEN107 Algorithms and Programming I**
- **CEN108 Algorithms and Programming II**

The development environment, Git, unit testing and template usage taught in
CEN107's first weeks are **assumed** in this course.

**Before the first class:** work through the self-check tasks near the
end of this deck, on your own computer.

<!-- Speaker note: If a self-check task feels shaky, the fix is to go back to the matching CEN107/CEN108 material, not to skip it. -->

---

<!-- _class: bolum -->

# 1. What we bring from CEN107/CEN108

<!-- Speaker note: Five things, each already taught in CEN107/CEN108, that this course reuses starting week 1. -->

---

# Development environment

- Compiler (GCC/Clang/MSVC), IDE, WSL on Windows, building with CMake
- Taught in: **CEN107 Week 2 — Development environments**
- Used here in: week 1's C workshop; setting up the midterm (C) project

<!-- Speaker note: If this is not already working, week 1's C workshop will be a struggle before it even starts. -->

---

# Git and GitHub

- Creating a repository, `clone`, `commit`, branches, `pull request`, `.gitignore`
- Taught in: **CEN107 Week 3 — Version management with Git**
- Used here in: the project guide's workflow (fork, plan, submission) for both checkpoints

<!-- Speaker note: Both the midterm and the final checkpoint are graded partly on how Git was actually used, not just the final code. -->

---

# Unit testing and coverage tools

- Writing tests, running them, reading a coverage report
- Taught in: **CEN107 Week 4 — Unit testing and libraries**
- Used here in: the midterm rubric (GoogleTest, gcov/lcov) and the final rubric (JUnit 5, JaCoCo)

<!-- Speaker note: 100% test coverage is a hard acceptance condition in the project guide — this is where that skill comes from. -->

---

# Using project templates

- Forking a template, building it, producing its tests and documentation
- Taught in: **CEN107 weeks 2–4**
- Used here in: the project guide's `cpp-cmake-ctest-template` (midterm) and `eclipse-java-maven-template` (final)

<!-- Speaker note: The template already wires up building, testing, documentation and coverage — you extend it, you do not build that scaffolding from scratch. -->

---

# Basic algorithm analysis and recursion

- Counting operations, writing a simple recursive function
- Taught in: **CEN108, early weeks**
- Used here in: the Big-O recap in week 1; recursive solutions from week 3 onward (Towers of Hanoi, DFS, tree traversals, merge sort, quicksort)

<!-- Speaker note: Recursion is not a "week 3 topic" — it is a tool this course reaches for repeatedly, all the way through file organization. -->

---

<!-- _class: bolum -->

# 2. C and Java programming fundamentals

<!-- Speaker note: The midterm project is C, the final project is Java — almost every data structure is built directly out of these constructs. -->

---

# C fundamentals (midterm project)

- Pointers and pointer arithmetic (`int *p;`, `p + 1`, `p` vs. `*p`)
- Arrays: declaration, indexing, passing to a function
- `struct` definitions; grouping fields (e.g. a linked-list node)
- Dynamic memory: `malloc`/`free`, and why every `malloc` needs a matching `free`
- Recursion: a function that calls itself, with a base case
- File I/O, including **binary files** (`fopen` with `"rb"`/`"wb"`, `fread`, `fwrite`)

<!-- Speaker note: You should be able to read AND write every one of these comfortably before the first class, not just recognize them. -->

---

# Java fundamentals (final project)

- Classes and objects: fields, constructors, methods, `this`
- Generics basics: using `List<T>`, declaring a simple generic class or method
- Exceptions: `try`/`catch`/`finally`, checked vs. unchecked

<!-- Speaker note: The final project ports every C data structure to Java using generics — this short list is exactly what that port needs. -->

---

# 3. Background briefly recalled in class

It is fine not to remember these in full detail — week 1 gives a short
recap before they are needed.

| Background | Needed in which week? |
| --- | --- |
| Big-O notation: counting operations, comparing growth rates | Week 1, then every week to compare data structures |
| Memory layout: stack vs. heap | Week 1, then whenever pointers and dynamic memory are used |

<!-- Speaker note: These two are recapped, not assumed cold — everything else in this deck IS assumed. -->

---

<!-- _class: bolum -->

# 4. What must be installed

<!-- Speaker note: A laptop is required — come to the first class with every one of these already installed. -->

---

# Required toolchain

- A C compiler: **Visual Studio 2022** (Desktop dev with C++) on Windows, or **GCC**/**Clang** on Linux/WSL/macOS
- **CMake** — the midterm template is built and tested with it
- A C coverage tool: **gcov**/**lcov** on Linux/WSL, or **OpenCppCoverage** with MSVC on Windows
- **Doxygen** — generates the project documentation
- **JDK 21** and **Maven** — Maven pulls in JUnit 5 and JaCoCo automatically
- **Git** and a **GitHub** account

Setup steps and the project templates themselves: the **project guide**.

<!-- Speaker note: Every one of these is free and cross-platform; there is no licensing barrier to arriving ready. -->

---

<!-- _class: bolum -->

# 5. Test yourself before the first class

<!-- Speaker note: Eight tasks. Try each on your own computer before looking at the answer on the next slide. -->

---

# Task 1 — Compile and predict

What does this program print?

```c
int x = 5;
int *p = &x;
*p = *p + 1;
printf("%d %d\n", x, *p);
```

<!-- Speaker note: Think about what p and x actually share before revealing the answer. -->

---

# Task 1 — Answer

```text
6 6
```

`p` holds the address of `x`, so `*p` and `x` name the same memory
location; changing one changes the other.

<!-- Speaker note: This is the single idea the entire course builds on: a pointer and the variable it points to are the same memory. -->

---

# Task 2 — Pointer arithmetic

Given `int arr[4] = {10, 20, 30, 40}; int *p = arr;`, what are the values
of `*(p + 2)` and `p[2]`?

<!-- Speaker note: Both notations describe the exact same memory access. -->

---

# Task 2 — Answer

Both are `30`. `p[2]` is defined to mean `*(p + 2)` — array indexing is
pointer arithmetic written with different syntax.

<!-- Speaker note: This equivalence is why arrays and pointers look interchangeable in C function signatures. -->

---

# Task 3 — Find the bug

```c
int *make_array(int n) {
    int arr[n];
    for (int i = 0; i < n; i++) arr[i] = i * i;
    return arr;
}
```

What is wrong, and how would you fix it?

<!-- Speaker note: Ask where arr actually lives, and what happens to that memory the instant the function returns. -->

---

# Task 3 — Answer

`arr` is a local array on the **stack**; it is destroyed when the function
returns, so the returned pointer is **dangling**. Fix: allocate on the
**heap** instead —

```c
int *arr = malloc(n * sizeof(int));
```

— and let the caller `free` it once done.

<!-- Speaker note: "Dangling pointer" is exactly the bug named on the Week 1 recap slide of the stacks-and-queues deck. -->

---

# Task 4 — Struct and recursion

Define `struct Node { int value; struct Node *next; };` and write a
recursive `int length(struct Node *head)` that counts the nodes.

What does `length(NULL)` return, and why does the recursion stop there?

<!-- Speaker note: This is the exact shape every linked-list function in weeks 2–3 will take. -->

---

# Task 4 — Answer

```c
int length(struct Node *head) {
    if (head == NULL) return 0;
    return 1 + length(head->next);
}
```

`length(NULL)` returns `0` — the **base case**; without it the recursion
never stops.

<!-- Speaker note: Every recursive function in this course needs exactly this shape: a base case, then a call on a strictly smaller problem. -->

---

# Task 5 — Binary file I/O

```c
int values[3] = {1, 2, 3};
FILE *f = fopen("data.bin", "wb");
fwrite(values, sizeof(int), 3, f);
fclose(f);
```

How many bytes does `data.bin` contain, and why?

<!-- Speaker note: Compare this to fprintf, which would have produced text, not raw bytes. -->

---

# Task 5 — Answer

`3 * sizeof(int)` bytes — **12 bytes** on almost every current desktop
platform. `fwrite` copies the raw bytes of the array into the file; unlike
`fprintf`, there is no text formatting involved.

<!-- Speaker note: File organization (weeks 13–14) is built entirely on this same fwrite/fread pattern, just with records instead of ints. -->

---

# Task 6 — Java generics

```java
List<Integer> numbers = new ArrayList<>();
numbers.add(10);
numbers.add(20);
int sum = 0;
for (int n : numbers) { sum += n; }
System.out.println(sum);
```

What does this print?

<!-- Speaker note: Think about what List<Integer> restricts and what the for-each loop does with it. -->

---

# Task 6 — Answer

```text
30
```

`List<Integer>` is a generic collection restricted to `Integer` elements;
the for-each loop reads every element and accumulates it into `sum`.

<!-- Speaker note: The final project's F1 requirement ports every C structure to Java using exactly this kind of generic. -->

---

# Task 7 — Java exceptions

```java
try {
    System.out.println("A");
    throw new RuntimeException("boom");
} catch (RuntimeException e) {
    System.out.println("B");
} finally {
    System.out.println("C");
}
```

In what order do the three letters print?

<!-- Speaker note: Think about what "finally" guarantees regardless of whether an exception was thrown. -->

---

# Task 7 — Answer

```text
A
B
C
```

The exception is caught immediately by the matching `catch` (`B`); `finally`
always runs afterward, whether or not an exception was thrown (`C`).

<!-- Speaker note: This exact try/catch/finally shape reappears in the final project's file-handling code. -->

---

# Task 8 — Build and test both toolchains

**C toolchain:** `gcc --version` · `cmake --version` · clone
`cpp-cmake-ctest-template` · `cmake -S . -B build && cmake --build build` ·
`ctest --test-dir build`

**Java toolchain:** `java -version` · `mvn -version` · clone
`eclipse-java-maven-template` · `mvn test`

<!-- Speaker note: These are the exact two templates named in the project guide for the midterm and final checkpoints. -->

---

# Task 8 — What success looks like

- `ctest`: **100% tests passed**
- Maven: **BUILD SUCCESS**, `Failures: 0`
- No compiler errors along the way in either toolchain

If either one fails: go back to "What must be installed," fix the missing
tool, and try again before the first class.

<!-- Speaker note: This is the single best predictor of a smooth week 1 — a green run on both templates, done in advance. -->

---

<!-- _class: baslik -->

# Ready for the course

If all eight tasks made sense and both toolchains built and tested
cleanly, you are ready.

**Next:** the **syllabus** (weekly schedule) and the **project guide**
(exact rubric for each checkpoint).

<!-- Speaker note: These two pages/decks are the natural next stop after this one. -->
