---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 10 — Sorting"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 10"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Sorting

**CEN207 Data Structures — Week 10**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!--
Speaker note: Today we sort the same array eleven different ways, and count exactly what each one costs. By the end, "which sort should I use" has a real, numeric answer.
-->

---

# Today's plan (3 hours)

| Hour | Topic |
| --- | --- |
| 1 | Cost model · bubble, selection, insertion, shell sort |
| 2 | Merge sort (top-down, bottom-up) · quick sort (Lomuto, Hoare, worst case) |
| 3 | Counting, radix, bucket sort · stability · empirical comparison · choosing |

**Learning outcomes:** LO.1 (explain fundamental data structures) · LO.2 (analyze complexity) · LO.7 (choose the right structure)

<!-- Speaker note: Fourteen short animations carry the whole lecture; every algorithm gets a normal run and at least one edge/hard run, right where it is introduced. -->

---

# This week's concepts — where

| Concept | Where |
| --- | --- |
| Bubble, selection, insertion, shell sort | Sections 2–5 |
| Merge sort (top-down / bottom-up) | Section 6 |
| Quick sort (Lomuto / Hoare / worst case) | Section 7 |
| Counting, radix, bucket sort | Sections 8–10 |
| Stability, comparison, choosing | Sections 11–13 |

<!-- Speaker note: Every term gets a full definition the first time it appears; this table just says where to find it again. -->

---

# How the code examples work

- Every algorithm has a complete **C** and **Java** program
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Sources: `code/week-10/c/` and `code/week-10/java/`
- Each program's expected output is in the week notes

<!-- Speaker note: Open a terminal now if you want to run these live; every snippet on today's slides compiles and runs exactly as shown. -->

---

# Recap — arrays and Big-O (Week 1)

- Every sort today works on a plain array, O(1) access
- Best / average / worst case is not decoration
- It is *why* eleven different sorts exist, not one
- Watch the same input give wildly different costs

<!-- Speaker note: This week is, above all, an exercise in Big-O — you will watch the numbers diverge in real time. -->

---

# Recap — heap sort (Week 4)

- You already built an O(n log n), in-place sort
- Keep it as today's yardstick throughout
- Merge sort matches its guarantee, at O(n) extra cost
- Quick sort matches it only on **average**

<!-- Speaker note: Heap sort does not get its own section today — you already earned it — but it reappears as the reference point all afternoon. -->

---

# Two genuinely new ideas

- **Divide and conquer**: split, solve each half, combine
- Powers merge sort and quick sort (Sections 6–7)
- **Non-comparison sorting**: never compare two keys
- Powers counting, radix, bucket sort (Sections 8–10)

<!-- Speaker note: Both ideas will reappear constantly for the rest of this course and the next. -->

---

# Map of the week — at a glance

| O(n²) family | O(n log n) guaranteed |
| --- | --- |
| Bubble, selection, insertion, shell | Merge sort (top-down, bottom-up) |
| **Average O(n log n)** | **Non-comparison, O(n+k)** |
| Quick sort (Lomuto, Hoare) | Counting, radix, bucket sort |

<!-- Speaker note: Every box on this map gets its own slides below, most with a short animation and a complete C/Java program. -->

---

# Mini-quiz

Every sort you have met before today assumes
one thing about how order is decided. What is
it, and which three sorts today break that rule?

<!-- Speaker note: Give them a moment — the answer sets up the whole second half of the lecture. -->

---

# Answer

**Comparing two keys with `<` or `>`.**
Counting, radix, and bucket sort (Sections 8–10)
never compare keys — they compute locations directly.

<!-- Speaker note: This is the single biggest idea shift of the week: from "compare and narrow" to "compute the address". -->

---

<!-- _class: bolum -->

# 1. The Sorting Problem, and How to Measure It

<!-- Speaker note: Section 1 sets up the two numbers — comparisons and writes — that every algorithm today will be measured by. -->

---

# A question to start

Sorting has been solved a dozen different ways
in the history of computing. Given how simple the
problem sounds, why does it need so many answers?

<!-- Speaker note: Because "rearrange the array" leaves enormous room for how: memory budget, what you already know about the input, whether ties may move. -->

---

# The sorting problem, restated

- Array of `n` values, a rule ("is `a` less than `b`?")
- Rearrange so every element is `<=` the next one
- Freedom: how much extra memory, what you exploit
- Freedom: whether equal elements may change order

<!-- Speaker note: That last freedom — stability — turns out to matter a great deal, and gets its own full section (11) later today. -->

---

# Measuring cost: two numbers

| Quantity | Counts | Matters when |
| --- | --- | --- |
| comparisons | every `<`/`>`/`==` | the classic cost measure |
| moves / writes / swaps | every array write | records are big, or writes are expensive |

<!-- Speaker note: These two numbers do not always agree on a winner — Section 12's animation puts five algorithms side by side to show exactly that. -->

---

# Stability, defined

- Equal keys keep their **input order** in the output
- Not about correctness — the output is still sorted
- An **extra** guarantee some algorithms give for free
- Gets a dedicated animation in Section 11

<!-- Speaker note: A stable sort on students-by-grade leaves every same-grade group in their prior (name) order; an unstable one may shuffle them. -->

---

# In place, or extra memory?

- **In place**: rearranges with O(1) extra memory
- Bubble, selection, insertion, shell, quick sort: in place
- Merge sort needs O(n) extra — the price of its guarantee
- Counting/radix sort need O(n+k) extra too

<!-- Speaker note: Time and space are always a trade-off — Section 13 ends the week with a decision table instead of one winner. -->

---

<!-- _class: bolum -->

# 2. Bubble Sort

<!-- Speaker note: Section 2 opens the simple O(n²) family with the most intuitive idea: compare neighbors, swap if wrong, and know when to stop. -->

---

# A question to start

Comparing two neighbors and swapping them if
they are backwards is the most natural sorting
instinct there is. How far does that idea alone get you?

<!-- Speaker note: Surprisingly far, if you add one refinement: noticing when a whole pass made no swaps at all. -->

---

# A short history

- No single named inventor, unlike quick or merge sort
- One of the oldest sorting ideas in computing
- Appears in the literature as early as the mid-1950s
- Taught first because it needs no cleverness to invent

<!-- Speaker note: Only the discipline of noticing "a pass made zero swaps, stop" turns it from a curiosity into something worth teaching. -->

---

# The bubble sort idea

- Walk left to right, compare each neighbor pair
- Swap if out of order — the larger value "bubbles" right
- Repeat the whole walk, one cell shorter each time
- **Early exit**: a pass with zero swaps means done

<!-- Speaker note: Every pass settles one more maximum at the tail; the early-exit flag is the one thing that makes this worth teaching. -->

---

# Bubble sort, step by step

<iframe class="dsanim" src="anim/bubble-sort.html?yer=slayt&lang=en" title="Bubble sort"></iframe>

<!-- Speaker note: Normal example: 10 unordered values — watch the counters on the right and the "settled" brace grow from the tail. -->

---

# Edge case — already sorted

<iframe class="dsanim" src="anim/bubble-sort.html?yer=slayt&lang=en&example=already-sorted" title="Bubble sort: already sorted"></iframe>

<!-- Speaker note: One pass, zero swaps, early exit — this is bubble sort's O(n) best case, made visible. -->

---

# Code — the pass and the early exit

```c
for (int pass = 0; pass < n - 1; pass++) {
    int swapped = 0;
    for (int i = 0; i < n - 1 - pass; i++) {
        if (a[i] > a[i + 1]) {
            int tmp = a[i]; a[i] = a[i + 1];
            a[i + 1] = tmp; swapped = 1;
        }
    }
    if (!swapped) break;
}
```

<!-- Speaker note: `n - 1 - pass` shrinks the inner loop every pass — the tail is already settled and never re-checked. -->

---

# Complexity and mistakes

- Best case **O(n)**: early exit on already-sorted input
- Worst/average case **O(n²)**: reverse-sorted or random
- Common bug: using `>=`, which breaks stability
- Common bug: forgetting the early-exit flag entirely

<!-- Speaker note: Without the flag, bubble sort is always O(n²) — the flag is the entire reason it is worth teaching. -->

---

# Mini-quiz

Why is bubble sort **stable** — what specific
line of code guarantees that two equal
elements are never swapped past each other?

<!-- Speaker note: Point them at the comparison operator itself. -->

---

# Answer

**The strict `>` in `if (a[i] > a[i+1])`.**
Equal elements never satisfy `>`, so they
are never swapped — their input order survives.

<!-- Speaker note: Change that one operator to `>=` and stability is gone, with no change to the sorted result itself. -->

---

<!-- _class: bolum -->

# 3. Selection Sort

<!-- Speaker note: Section 3 trades bubble sort's many small swaps for a different cost profile: full scans, but the fewest writes possible. -->

---

# A question to start

Bubble sort's reverse-sorted case did 66 swaps
to sort 12 values. What if you scanned once for
the true minimum, and moved it directly into place?

<!-- Speaker note: You still scan the whole remainder every time — no early exit is possible — but you write far less. -->

---

# A short history

- Like bubble sort, no single named inventor
- The direct algorithmic form of "pick the smallest left"
- At least as old as the idea of sorting itself
- Valued today for its minimal-write guarantee

<!-- Speaker note: It is the clearest example this week of trading comparisons for writes — see Section 12's empirical numbers. -->

---

# The selection sort idea

- For each `i`, scan `i+1..n-1` for the minimum's index
- Swap it into position `i` — skip if already there
- Sorted region grows from the **left** (bubble: right)
- At most `n-1` swaps, ever — but always O(n²) scans

<!-- Speaker note: No early exit is possible: finding the true minimum requires checking every remaining candidate, sorted or not. -->

---

# Selection sort, step by step

<iframe class="dsanim" src="anim/selection-sort.html?yer=slayt&lang=en" title="Selection sort"></iframe>

<!-- Speaker note: Normal example: watch `min_idx` update as the scan finds smaller candidates, then the single swap into place. -->

---

# Edge case — already sorted

<iframe class="dsanim" src="anim/selection-sort.html?yer=slayt&lang=en&example=already-sorted" title="Selection sort: already sorted"></iframe>

<!-- Speaker note: Still the full n(n-1)/2 comparisons, and zero swaps — no early exit exists here, unlike bubble sort. -->

---

# Code — find the minimum, swap once

```c
for (int i = 0; i < n - 1; i++) {
    int min_idx = i;
    for (int j = i + 1; j < n; j++)
        if (a[j] < a[min_idx]) min_idx = j;
    if (min_idx != i) {
        int tmp = a[i];
        a[i] = a[min_idx]; a[min_idx] = tmp;
    }
}
```

<!-- Speaker note: The swap is skipped entirely when i is already the minimum — one of the few "wasted work" checks worth adding. -->

---

# Complexity and mistakes

- Best/average/worst: all **O(n²)** comparisons, always
- At most **n-1** swaps — the fewest of any sort today
- Common bug: swapping unconditionally, wasting writes
- **Not stable**: the long-range swap can jump a tie

<!-- Speaker note: Selection sort and quick sort are this week's two clearest examples of instability — Section 11 shows why. -->

---

# Mini-quiz

Selection sort does at most `n-1` swaps, no
matter the input. Why does that bound hold
regardless of how scrambled the array is?

<!-- Speaker note: Point them at how many swaps happen per outer-loop iteration. -->

---

# Answer

**At most one swap per outer-loop step.**
Each element that needs to move, moves once,
directly to its final spot — `n-1` steps, `n-1` swaps max.

<!-- Speaker note: Contrast with bubble sort, where a badly placed value crawls one cell at a time — up to n(n-1)/2 swaps total. -->

---

<!-- _class: bolum -->

# 4. Insertion Sort

<!-- Speaker note: Section 4 is the sort you already draw on the board — the picture matches exactly how people sort a hand of cards. -->

---

# A question to start

Think about sorting a hand of playing cards.
You never compare every card to every other
card. What do you actually do instead?

<!-- Speaker note: You hold a small sorted hand, and slide each new card into the one gap where it belongs. -->

---

# A short history

- The card-sorting idea itself — no single inventor
- One of the oldest, most intuitive sorting methods
- The instructor's own board drawings use exactly this model
- Real library sorts fall back to it for small sub-arrays

<!-- Speaker note: C's qsort and Java's Arrays.sort both switch to insertion sort once a recursive sub-array shrinks below ~16-32 elements. -->

---

# The insertion sort idea

- `A[0..i-1]` is always **already sorted**
- Pull `A[i]` out as the **key** (the red box)
- Shift every `> key` element one cell right
- Drop the key into the hole it opened

<!-- Speaker note: The hole moves left with every shift; the key drops in the moment a comparison finds "not greater than". -->

---

# The board-drawing model

- **Brace** over `A[0..i-1]`: "already sorted"
- **Red box**: the key, pulled out of the array
- **`<= key`** region stays; **`> key`** region shifts
- **Shift arrow**: the hole moving one step left

<!-- Speaker note: This is drawn on the board exactly this way every time — the animation matches it element for element. -->

---

# Insertion sort, step by step

<iframe class="dsanim" src="anim/insertion-sort.html?yer=slayt&lang=en" title="Insertion sort"></iframe>

<!-- Speaker note: Normal example: watch the red key box, the "already sorted" brace grow, and the shift arrows one at a time. -->

---

# Edge case — reverse sorted

<iframe class="dsanim" src="anim/insertion-sort.html?yer=slayt&lang=en&example=reverse-sorted" title="Insertion sort: reverse sorted"></iframe>

<!-- Speaker note: The worst case — every single key shifts all the way to the front, one cell at a time. -->

---

# Code — pull the key, shift, drop it in

```c
for (int i = 1; i < n; i++) {
    int key = a[i];
    int j = i - 1;
    while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        j--;
    }
    a[j + 1] = key;
}
```

<!-- Speaker note: The bound check `j >= 0` must come first in the && — never read a[-1] to find out. -->

---

# Complexity and mistakes

- Best case **O(n)**: already sorted, one check per `i`
- Worst case **O(n²)**: reverse sorted, full shifts
- Common bug: `>=` instead of `>` breaks stability
- Common bug: checking `a[j] > key` before `j >= 0`

<!-- Speaker note: Small average-case constant makes it genuinely fast for small or nearly-sorted arrays in practice. -->

---

# Mini-quiz

Why is insertion sort's best case exactly
O(n), and what specific kind of real-world
data makes that best case the common case?

<!-- Speaker note: Nearly-sorted data — log files, re-sorting after a small update — is exactly insertion sort's sweet spot. -->

---

# Answer

**Already-sorted (or nearly so) input.**
Each `a[j] <= key` check succeeds immediately,
so most of the n outer steps cost only O(1).

<!-- Speaker note: Selection sort gets none of this benefit — its full scan costs the same regardless of how sorted the input already is. -->

---

<!-- _class: bolum -->

# 5. Shell Sort

<!-- Speaker note: Section 5 asks: what if insertion sort moved badly placed elements most of the way home BEFORE the final pass? -->

---

# A question to start

Insertion sort is slow exactly when an element
starts far from home. What if you closed most
of that distance first, in big jumps?

<!-- Speaker note: Donald Shell asked exactly this question in 1959 and published the first sort to beat O(n²) in the worst case. -->

---

# A short history

- Donald L. Shell, "A High-Speed Sorting Procedure"
- *Communications of the ACM*, 1959
- The first sorting algorithm to beat plain O(n²)
- Gap-sequence choice remains an open research area

<!-- Speaker note: This is a genuinely rare thing in this course: a named person, a named paper, a specific year, still actively researched. -->

---

# The shell sort idea

- Insertion sort, but comparing `gap` apart, not 1 apart
- Start `gap = n/2`, halve every round, end at `gap = 1`
- Large gaps move far-out elements home in one jump
- By `gap = 1`, the array is "almost sorted" — cheap pass

<!-- Speaker note: The final gap=1 pass is literally plain insertion sort, but on data that barely needs any shifting left. -->

---

# Shell sort, step by step

<iframe class="dsanim" src="anim/shell-sort.html?yer=slayt&lang=en" title="Shell sort"></iframe>

<!-- Speaker note: Normal example: gap sequence 5, 2, 1 — watch how few shifts the final gap=1 pass needs. -->

---

# Edge case — reverse sorted

<iframe class="dsanim" src="anim/shell-sort.html?yer=slayt&lang=en&example=reverse-sorted" title="Shell sort: reverse sorted"></iframe>

<!-- Speaker note: Compare this against Section 4's plain-insertion-sort reverse-sorted example — far fewer total shifts here. -->

---

# Code — insertion sort, gapped

```c
for (int gap = n/2; gap > 0; gap /= 2) {
    for (int i = gap; i < n; i++) {
        int key = a[i];
        int j = i;
        while (j >= gap && a[j-gap] > key) {
            a[j] = a[j - gap];
            j -= gap;
        }
        a[j] = key;
    }
}
```

<!-- Speaker note: Every line matches plain insertion sort exactly, with "1" replaced by "gap" throughout. -->

---

# Complexity and mistakes

- Worst case **O(n²)** with this simple gap sequence
- Far faster than plain insertion sort in practice
- Better sequences (Hibbard, Sedgewick) lower the bound
- **Not stable**: gapped moves can cross equal elements

<!-- Speaker note: The important idea is the gap itself — the exact optimal sequence is a research question outside this course's scope. -->

---

# Mini-quiz

In the reverse-sorted example, the smallest
value starts at the last index. How many total
shifts does it take across all three gap rounds?

<!-- Speaker note: Compare this to the 11 single-cell shifts plain insertion sort would need for the same value. -->

---

# Answer

**Four shifts total** (sizes 6, 3, 1, 1) — covering
the same 11-position distance plain insertion
sort would need 11 single-cell shifts to cover.

<!-- Speaker note: Large early gaps cover far more ground per shift — that is the entire mechanism behind shell sort's speed. -->

---

<!-- _class: bolum -->

# 6. Merge Sort

<!-- Speaker note: Section 6 introduces divide and conquer: split, solve each half the same way, combine — the first O(n log n) guarantee today. -->

---

# A question to start

What if, instead of moving elements around
inside one array, you split it in half, sorted
each half completely, then just combined them?

<!-- Speaker note: Combining two already-sorted halves is cheap — the only remaining question is how to sort each half. -->

---

# A short history

- **John von Neumann**, 1945
- One of the first algorithms for a stored-program computer
- Founding example of **divide and conquer** in computing
- The pattern reappears constantly for the rest of this course

<!-- Speaker note: 1945 predates almost every other named algorithm this week — merge sort is genuinely one of the oldest. -->

---

# The divide-and-conquer idea

- Split `[lo, hi)` at its midpoint into two halves
- Recursively sort each half the same way
- **Merge** the two sorted halves with a helper array
- `log2(n)` levels × `O(n)` per level = **O(n log n)**

<!-- Speaker note: This holds in every case — best, average, worst — the only algorithm today with that guarantee. -->

---

# Why the guarantee never breaks

- No early exit, no data-dependent shortcuts anywhere
- Every level always touches every element once
- Price: an auxiliary array of size `n` — O(n) extra
- Two equivalent forms: top-down, bottom-up

<!-- Speaker note: That O(n) extra memory is the one real cost of merge sort's unconditional guarantee. -->

---

# Top-down — recursion depth as rows

- `d=0`: the whole array; `d=1`: two halves; …
- Splitting never changes values, only brace boundaries
- Then merging goes back up the same rows
- Last row: the fully sorted array

<!-- Speaker note: The animation draws the recursion literally — one row per depth, split going down, merge continuing further down. -->

---

# Merge sort (top-down), step by step

<iframe class="dsanim" src="anim/merge-sort.html?yer=slayt&lang=en" title="Merge sort, top-down"></iframe>

<!-- Speaker note: Normal example: watch the split rows (braces only, no value changes), then the merge rows building the sorted result. -->

---

# Edge case — already sorted

<iframe class="dsanim" src="anim/merge-sort.html?yer=slayt&lang=en&example=already-sorted" title="Merge sort: already sorted"></iframe>

<!-- Speaker note: Every split and every merge still runs in full — merge sort's guarantee is unconditional, unlike bubble sort's early exit. -->

---

# Code — the merge step

```c
int i = lo, j = mid, k = lo;
while (i < mid && j < hi)
    tmp[k++] = (a[i] <= a[j])
        ? a[i++] : a[j++];
while (i < mid) tmp[k++] = a[i++];
while (j < hi)  tmp[k++] = a[j++];
for (int x=lo; x<hi; x++) a[x]=tmp[x];
```

<!-- Speaker note: `<=` (not `<`) always prefers the left run on a tie — this single choice is what makes merge sort stable. -->

---

# Code — the recursive driver

```c
void merge_sort(int a[], int lo,
                 int hi, int tmp[]) {
    if (hi - lo <= 1) return;
    int mid = lo + (hi - lo) / 2;
    merge_sort(a, lo, mid, tmp);
    merge_sort(a, mid, hi, tmp);
    merge(a, lo, mid, hi, tmp);
}
```

<!-- Speaker note: `lo + (hi-lo)/2`, not `(lo+hi)/2` — the form that stays correct even near integer overflow. -->

---

# Bottom-up — no recursion at all

- Every element starts as a sorted run of width 1
- Merge adjacent runs into width-2, then width-4, …
- Doubling stops once one run covers the whole array
- Same `merge()`, reached by a loop instead of a call stack

<!-- Speaker note: Bottom-up can never overflow a call stack, no matter how large n is — a real practical advantage. -->

---

# Merge sort (bottom-up), step by step

<iframe class="dsanim" src="anim/merge-sort-bottom-up.html?yer=slayt&lang=en" title="Merge sort, bottom-up"></iframe>

<!-- Speaker note: Normal example: watch the width label double each round — width=1, 2, 4, 8 — with no recursion anywhere. -->

---

# Edge case — n a power of two

<iframe class="dsanim" src="anim/merge-sort-bottom-up.html?yer=slayt&lang=en&example=power-of-two" title="Merge sort bottom-up: power of two"></iframe>

<!-- Speaker note: Every round is perfectly even here — compare against the "hard" example, where the last pair each round is partial. -->

---

# Code — the width-doubling loop

```c
for (int width=1; width<n; width*=2) {
    for (int lo=0; lo<n-width;
         lo += 2*width) {
        int mid = lo + width;
        int hi = min(mid+width, n);
        merge(a, lo, mid, hi, tmp);
    }
}
```

<!-- Speaker note: The `min(mid+width, n)` clamp handles both power-of-two and uneven array sizes with no special-casing. -->

---

# Complexity and mistakes

- **O(n log n)** in every case — best, average, worst
- **O(n)** extra memory — the price of that guarantee
- **Stable**: the `<=` tie-break always prefers the left run
- Common bug: `<` instead of `<=` breaks stability silently

<!-- Speaker note: Heap sort (Week 4) shares this O(n log n)-always guarantee, but needs no extra memory — merge sort trades memory for stability. -->

---

# Mini-quiz

Both top-down and bottom-up merge sort do
the same total work. Name one real advantage
bottom-up has, and one top-down has in return.

<!-- Speaker note: Give them a moment before revealing — both answers are genuinely practical, not just theoretical. -->

---

# Answer

**Bottom-up**: never uses the call stack, cannot
overflow it. **Top-down**: its recursive structure
is easier to adapt — e.g. switch to insertion sort early.

<!-- Speaker note: Production sort libraries do exactly this second optimization — recursive structure makes it a natural fit. -->

---

<!-- _class: bolum -->

# 7. Quick Sort

<!-- Speaker note: Section 7 asks: can a sort guarantee O(n log n) on average AND sort in place, with no extra array? -->

---

# A question to start

Merge sort's O(n log n) costs O(n) extra memory.
Is there a divide-and-conquer sort that is just
as fast on average, but sorts in place?

<!-- Speaker note: Tony Hoare invented exactly that in 1959-1960, and it remains one of the most-used sorts in real software today. -->

---

# A short history

- **C. A. R. Hoare**, 1959–1960, Moscow State University
- Published as "Quicksort", *The Computer Journal*, 1962
- Still the default array sort in many language libraries
- One of the most consequential algorithms in this course

<!-- Speaker note: Hoare was 26, a visiting researcher on a machine-translation project — quicksort was almost a side project. -->

---

# The quick sort idea

- Pick one element of the range as the **pivot**
- **Partition**: `<= pivot` left, `>= pivot` right
- Recursively quick-sort left part and right part
- No separate "combine" step — partitioning does the work

<!-- Speaker note: Once both sides are recursively sorted, the whole range is sorted — everything on the left is already <= everything on the right. -->

---

# Two classic partition schemes

- **Lomuto**: pivot = last element, one forward scan
- **Hoare**: pivot = first element, two inward scans
- Both studied side by side — they differ in a way
- that trips up almost everyone the first time

<!-- Speaker note: The difference is not cosmetic — it changes the recursive call boundaries, a classic source of off-by-one bugs. -->

---

# Lomuto partition — the idea

- Pivot = the range's **last** element
- `i` marks the boundary of the "`<= pivot`" region
- `j` scans left to right; `a[j] <= pivot` advances `i`
- Pivot swaps to `i+1` — its final, correct position

<!-- Speaker note: The pivot's final position is guaranteed by construction — this is what makes Lomuto's recursion lo,p-1 / p+1,hi correct. -->

---

# Quick sort (Lomuto), step by step

<iframe class="dsanim" src="anim/quick-sort-lomuto.html?yer=slayt&lang=en" title="Quick sort, Lomuto"></iframe>

<!-- Speaker note: Normal example: watch the pivot (red box), the i boundary, and the pivot's final swap into place. -->

---

# Edge case — already sorted

<iframe class="dsanim" src="anim/quick-sort-lomuto.html?yer=slayt&lang=en&example=already-sorted" title="Quick sort Lomuto: already sorted"></iframe>

<!-- Speaker note: The classic trap — every partition splits n-1 against 0, the worst possible split. Section 7's worst-case slides return to this. -->

---

# Code — Lomuto partition

```c
int pivot = a[hi];
int i = lo - 1;
for (int j = lo; j < hi; j++) {
    if (a[j] <= pivot) {
        i++;
        int t=a[i]; a[i]=a[j]; a[j]=t;
    }
}
int t=a[i+1]; a[i+1]=a[hi]; a[hi]=t;
return i + 1;
```

<!-- Speaker note: The final three lines place the pivot into its guaranteed final position, i+1. -->

---

# Code — Lomuto's recursion

```c
void quick_sort_lomuto(
        int a[], int lo, int hi) {
    if (lo < hi) {
        int p = partition_lomuto(
                    a, lo, hi);
        quick_sort_lomuto(a, lo, p-1);
        quick_sort_lomuto(a, p+1, hi);
    }
}
```

<!-- Speaker note: p-1 and p+1 both exclude the pivot itself, which is correct because Lomuto guarantees it sits exactly at p. -->

---

# Hoare partition — the idea

- Pivot = the range's **first** element
- Two pointers `i`, `j` scan **inward** from both ends
- Swap when a pair is found out of place; repeat
- Pivot's final resting spot is **not** guaranteed to be `j`

<!-- Speaker note: This "not guaranteed" is the single most important fact about Hoare's scheme — it changes the recursion boundaries. -->

---

# Quick sort (Hoare), step by step

<iframe class="dsanim" src="anim/quick-sort-hoare.html?yer=slayt&lang=en" title="Quick sort, Hoare"></iframe>

<!-- Speaker note: Normal example: watch the two pointers scan inward and swap, and compare the total swap count to Lomuto's. -->

---

# Edge case — all equal values

<iframe class="dsanim" src="anim/quick-sort-hoare.html?yer=slayt&lang=en&example=all-equal" title="Quick sort Hoare: all equal"></iframe>

<!-- Speaker note: Even with every value equal to the pivot, the scan still converges correctly — a good invariant check. -->

---

# Code — Hoare partition

```c
int pivot = a[lo];
int i = lo - 1, j = hi + 1;
while (1) {
    do { i++; } while (a[i] < pivot);
    do { j--; } while (a[j] > pivot);
    if (i >= j) return j;
    int t=a[i]; a[i]=a[j]; a[j]=t;
}
```

<!-- Speaker note: Two do-while loops, each guaranteed to stop at or before the pivot's own position on that side. -->

---

# Code — Hoare's recursion trap

```c
void quick_sort_hoare(
        int a[], int lo, int hi) {
    if (lo < hi) {
        int p = partition_hoare(
                    a, lo, hi);
        quick_sort_hoare(a, lo, p);
        quick_sort_hoare(a, p+1, hi);
    }
}
```

<!-- Speaker note: Note: p, NOT p-1 — the single most common quick sort bug, because Hoare never guarantees the pivot sits at p. -->

---

# Quick sort's worst case

- Both schemes above pick a **fixed corner** as pivot
- Always the smallest/largest element = worst split
- Sorted or reverse-sorted input triggers it directly
- **Median-of-three** is the standard real-world defense

<!-- Speaker note: The same three animations you've already seen — Lomuto's already-sorted example was this exact trap. -->

---

# Comparing pivot strategies

<iframe class="dsanim" src="anim/quick-sort-worst-case.html?yer=slayt&lang=en" title="Quick sort worst case"></iframe>

<!-- Speaker note: Same input, three pivot strategies — first, middle, median-of-three — comparisons and depth counted side by side. -->

---

# Edge case — random input

<iframe class="dsanim" src="anim/quick-sort-worst-case.html?yer=slayt&lang=en&example=random" title="Quick sort worst case: random"></iframe>

<!-- Speaker note: On random data with no adversarial structure, all three strategies perform similarly — the trap needs sorted-like input. -->

---

# The numbers, made concrete

| Strategy | Comparisons (n=14, sorted) | Depth |
| --- | --- | --- |
| First element | 91 | 13 |
| Median-of-three | 31 | 3 |

<!-- Speaker note: 91 vs 31 on the identical input — O(n²) vs O(n log n) is not an abstraction, it is this exact table. -->

---

# The comparison-sorting lower bound

- `n!` possible orderings of `n` distinct elements
- A decision tree distinguishing all of them needs
- at least `log2(n!)` levels — which is **O(n log n)**
- No comparison-based sort can ever beat this bound

<!-- Speaker note: This is a genuine theorem, not a rule of thumb — you will prove it yourself as an exercise. -->

---

# Complexity and mistakes

- **Average O(n log n)**, in place — the fastest in practice
- **Worst O(n²)** on a badly-chosen, adversarial pivot
- Common bug: mixing Lomuto's `p-1` with Hoare's `p`
- **Not stable**: both schemes swap across long distances

<!-- Speaker note: This single mix-up — p-1 vs p — is the most common bug students write when implementing quick sort from memory. -->

---

# Mini-quiz

Explain in one sentence why Hoare's partition
must recurse on `(lo, p)` and `(p+1, hi)`,
not `(lo, p-1)` like Lomuto's.

<!-- Speaker note: The answer is entirely about what each scheme actually guarantees about the pivot's final position. -->

---

# Answer

**Hoare never guarantees the pivot sits at `p`** —
only that everything `<= p` is `<= pivot`. Excluding
`p` (as `p-1` would) could drop an unsorted element.

<!-- Speaker note: Lomuto's explicit final swap is exactly what makes its p-1/p+1 recursion safe — Hoare has no equivalent guarantee. -->

---

<!-- _class: bolum -->

# 8. Counting Sort

<!-- Speaker note: Section 8 opens the second half of the week: sorts that never compare two keys against each other at all. -->

---

# A question to start

The O(n log n) lower bound assumes you only
know how two keys compare. What if you know
every value is a small, non-negative integer?

<!-- Speaker note: Then you don't need to compare at all — you can simply count how many times each value occurs. -->

---

# A short history

- **Harold H. Seward**, MIT master's thesis, 1954
- The simplest way to beat the comparison lower bound
- Requires knowing the key range `0..maxVal` in advance
- Foundation for radix sort (Section 9)

<!-- Speaker note: Seward's thesis is one of the earliest documented non-comparison sorting ideas in computing. -->

---

# The counting sort idea

- Count occurrences of each value into `count[]`
- Turn counts **cumulative**: `count[v]` = "how many `<= v`"
- Place each value at `output[count[a[i]]-1]`, decrement
- Scan **backwards** — this is what keeps it stable

<!-- Speaker note: The backward scan guarantees that among equal values, the one appearing earlier in the input claims the earlier output slot. -->

---

# Counting sort, step by step

<iframe class="dsanim" src="anim/counting-sort.html?yer=slayt&lang=en" title="Counting sort"></iframe>

<!-- Speaker note: Watch the comparisons counter — it stays at zero the entire time. That is the whole point of a non-comparison sort. -->

---

# Edge case — sparse range

<iframe class="dsanim" src="anim/counting-sort.html?yer=slayt&lang=en&example=sparse-range" title="Counting sort: sparse range"></iframe>

<!-- Speaker note: 10 values but maxVal=15 — the O(n+k) cost made visible: count[] must cover every value up to 15. -->

---

# Code — count, then accumulate

```c
int count[max_val + 1] = {0};
for (int i = 0; i < n; i++)
    count[a[i]]++;
for (int v = 1; v <= max_val; v++)
    count[v] += count[v - 1];
```

<!-- Speaker note: After this, count[v] means "how many values are <= v" — the last output index that value should occupy. -->

---

# Code — place, scanning backwards

```c
for (int i = n - 1; i >= 0; i--) {
    output[count[a[i]] - 1] = a[i];
    count[a[i]]--;
}
for (int i = 0; i < n; i++)
    a[i] = output[i];
```

<!-- Speaker note: Backwards is not optional here — it is the entire mechanism that keeps counting sort stable. -->

---

# Complexity and mistakes

- **O(n + k)** time and space, `k = maxVal` — every case
- Beats O(n log n) genuinely, when `k` is not `>> n`
- Wasteful when `k` is much larger than `n` (sparse example)
- **Stable** by construction, via the backward scan

<!-- Speaker note: The sparse-range example already showed count[] larger than the input itself for k=15, n=10 — imagine k=1,000,000. -->

---

# Mini-quiz

Two equal values `a[p]` and `a[q]`, with `p < q`.
Trace the backward scan — why does `a[p]`
always end up to the LEFT of `a[q]` in the output?

<!-- Speaker note: The scan processes a[q] first (larger index), so it claims the later slot; a[p] then claims what's left, one slot earlier. -->

---

# Answer

**`a[q]` is placed first** (scan goes n-1 down to 0),
claiming the later slot and decrementing `count[v]`.
`a[p]` then claims the next slot — one to the left.

<!-- Speaker note: This is exactly the mechanism from the code slide, traced through for two specific tied elements. -->

---

<!-- _class: bolum -->

# 9. Radix Sort (LSD)

<!-- Speaker note: Section 9 rescues counting sort's idea for larger integers, by processing one digit at a time instead of the whole range at once. -->

---

# A question to start

Counting sort needs a small key range. What if
your keys are five-digit integers — too many
distinct values, but each built from tiny digits?

<!-- Speaker note: Run counting sort digit by digit instead of value by value — always 10 buckets, no matter how large the numbers are. -->

---

# A short history

- **Herman Hollerith**, 1890 US census tabulating machines
- Mechanical card sorters processed one column at a time
- Far older than counting sort itself
- Still used today for fixed-width integer/string keys

<!-- Speaker note: This is one of the oldest ideas in this entire course — punched-card sorting predates electronic computing by decades. -->

---

# The radix sort (LSD) idea

- Start at the **ones** place, run a **stable** counting sort
- Move to **tens**, then **hundreds** — always 10 buckets
- Stability of every pass is not optional — it's required
- Stops once `max_val / place` reaches zero

<!-- Speaker note: A stable pass preserves every earlier, less-significant digit's ordering — that composability is the whole algorithm. -->

---

# Radix sort (LSD), step by step

<iframe class="dsanim" src="anim/radix-sort-lsd.html?yer=slayt&lang=en" title="Radix sort, LSD"></iframe>

<!-- Speaker note: Normal example: 3-digit values, 3 passes — watch the array reorder pass by pass, place=1, 10, 100. -->

---

# Edge case — single-digit values

<iframe class="dsanim" src="anim/radix-sort-lsd.html?yer=slayt&lang=en&example=single-digit" title="Radix sort LSD: single-digit"></iframe>

<!-- Speaker note: Only one pass ever runs — the loop condition naturally stops once every value fits in one digit. -->

---

# Code — extracting a digit

```c
int get_digit(int x, int place) {
    return (x / place) % 10;
}

for (int place = 1;
     max_val / place > 0;
     place *= 10) { ... }
```

<!-- Speaker note: get_digit(5, 100) correctly returns 0 — shorter numbers act as if left-padded with invisible zeros. -->

---

# Code — one digit pass

```c
/* stable counting sort,
   keyed on get_digit(a[i], place) */
count_and_accumulate(place);
for (int i = n-1; i >= 0; i--)
    place_by_digit(a[i], place);
copy_output_back();
```

<!-- Speaker note: This is literally counting sort's exact two-phase structure (Section 8), just keyed on one digit instead of the whole value. -->

---

# Complexity and mistakes

- **O(d × (n + b))** — `d` digits, base `b=10`
- Fixed-width keys: effectively **O(n)**, no log factor
- Common bug: an unstable per-digit pass breaks correctness
- Common bug: sorting from the MOST significant digit first

<!-- Speaker note: Unlike most other contexts, stability here is not a nicety — it is load-bearing for correctness itself. -->

---

# Mini-quiz

Why does sorting least-significant-digit FIRST
work, when running the exact same algorithm
most-significant-digit first would not?

<!-- Speaker note: The answer is entirely about what each pass can and cannot assume about the digits it has not processed yet. -->

---

# Answer

**Stability composes upward.** Each pass preserves
order from all earlier, less-significant digits —
MSD-first has no such guarantee to build on.

<!-- Speaker note: MSD-first radix sort exists too, but needs a different, recursive structure to work — outside this week's scope. -->

---

<!-- _class: bolum -->

# 10. Bucket Sort

<!-- Speaker note: Section 10 generalizes counting sort: instead of one bucket per value, one bucket per RANGE of values. -->

---

# A question to start

What if, instead of exact counts, you just threw
each value into one of a few buckets by rough
magnitude, then cleaned up each small bucket?

<!-- Speaker note: If values are spread evenly, each bucket holds only a handful of elements — cheap to finish sorting locally. -->

---

# A short history

- The oldest and most general of today's three
- non-comparison sorts — no single inventor or date
- A natural generalization of counting sort
- Depends entirely on the input's actual distribution

<!-- Speaker note: Unlike Seward (counting sort) or Hollerith (radix sort), bucket sort is usually presented without a specific attribution. -->

---

# The bucket sort idea

- Divide `[0, max_val]` into 10 equal-sized buckets
- Distribute each value into its bucket (tens digit here)
- Sort each small bucket (insertion sort — cheap)
- Concatenate buckets `0..9` — automatically sorted

<!-- Speaker note: Bucket b's values are all smaller than bucket b+1's, by construction — concatenation alone finishes the sort. -->

---

# Bucket sort, step by step

<iframe class="dsanim" src="anim/bucket-sort.html?yer=slayt&lang=en" title="Bucket sort"></iframe>

<!-- Speaker note: Normal example: watch values distribute into 10 buckets, then each small bucket get insertion-sorted. -->

---

# Edge case — all in one bucket

<iframe class="dsanim" src="anim/bucket-sort.html?yer=slayt&lang=en&example=same-bucket" title="Bucket sort: same bucket"></iframe>

<!-- Speaker note: The worst case — every value collides into one bucket, degrading to plain insertion sort on the whole array. -->

---

# Code — distribute, then finish

```c
int b = (a[i]*BUCKETS)
        / (max_val+1);
bucket[b][bucket_len[b]++]=a[i];
/* ... then insertion-sort each
   bucket, then concatenate */
```

<!-- Speaker note: With max_val=99 and 10 buckets, b is literally the tens digit — a clean, easy-to-explain mapping. -->

---

# Complexity and mistakes

- **Average O(n)**: values spread evenly across buckets
- **Worst O(n²)**: all values collide into one bucket
- Common bug: bucket boundaries that ignore the real data
- **Stable**, if the inner per-bucket sort is stable

<!-- Speaker note: Bucket sort's O(n) promise is entirely conditional on the input actually being evenly spread — there is no way to detect this from inside the algorithm. -->

---

# Mini-quiz

Bucket sort needs an internal sort per bucket;
counting sort needs nothing similar per value.
What structural difference explains this?

<!-- Speaker note: The key word is "range" versus "single value" — think about what could still be out of order within a bucket. -->

---

# Answer

**A bucket covers a RANGE of values**, so it can
hold several genuinely different values still
needing relative order — counting sort's counts cannot.

<!-- Speaker note: This is exactly why bucket sort can handle floating-point values in its general form, unlike counting sort's per-value counting. -->

---

<!-- _class: bolum -->

# 11. Stability, Demonstrated

<!-- Speaker note: Section 11 stops defining stability in words and shows it happening, on the same input, with two named algorithms. -->

---

# A question to start

We defined stability in Section 1. Words are
not proof. Can we watch the SAME input produce
two different results, depending only on the sort?

<!-- Speaker note: Yes — and this is exactly what today's dedicated stability animation does, live, with tagged records. -->

---

# The demo's setup

- Records are `(key, tag)` pairs — e.g. `5a`, `5b`, `5c`
- Several records deliberately share a key (a "tie")
- Row 1: **insertion sort** — stable (Section 4)
- Row 2: **selection sort** — unstable (Section 3)

<!-- Speaker note: The tag is a stand-in for "which physical record this was" — imagine a student name, sorted by grade. -->

---

# Stability, demonstrated

<iframe class="dsanim" src="anim/stability-demo.html?yer=slayt&lang=en" title="Stability demo"></iframe>

<!-- Speaker note: Watch the 5a, 5b, 5c group specifically — stable keeps them in order, unstable does not. -->

---

# Edge case — all keys equal

<iframe class="dsanim" src="anim/stability-demo.html?yer=slayt&lang=en&example=all-equal" title="Stability demo: all equal"></iframe>

<!-- Speaker note: The most extreme case — a fully stable sort must reproduce the ENTIRE input order unchanged. -->

---

# The result, read closely

- Stable (insertion): `5a 5b 5c` — exact input order
- Unstable (selection): `5b 5c 5a` — `5a` pushed to the end
- Not a bug — selection sort's long-range swap in action
- Already-sorted input shows NO difference between them

<!-- Speaker note: Instability only has something to act on when a swap actually crosses a tied element — sorted input never triggers that. -->

---

# Which sorts are stable?

| Sort | Stable? |
| --- | --- |
| Bubble, insertion, merge, counting, radix | Yes |
| Selection, shell, quick (Lomuto/Hoare) | **No** |
| Bucket | Yes, if inner sort is stable |

<!-- Speaker note: Radix sort's stability is not optional — Section 9 showed it is required for correctness, not just a nice-to-have. -->

---

# Mini-quiz

Selection sort is unstable. Describe, without
code, one general way to force it — or any
comparison sort — to become stable.

<!-- Speaker note: The trick generalizes to any comparison-based sort, not just selection sort specifically. -->

---

# Answer

**Attach the original index to each element**,
and break ties in the comparison by that index.
The sort's mechanics never need to change.

<!-- Speaker note: This costs extra memory to track indices, but works universally — a good trick to know even if today's sorts don't need it. -->

---

<!-- _class: bolum -->

# 12. Comparing the Algorithms, Empirically

<!-- Speaker note: Section 12 stops trusting Big-O's hidden constants and just runs five algorithms on the same input, counting exactly. -->

---

# A question to start

Big-O hides constant factors. The only way to
settle "which sort actually wins on THIS data"
is to run them and count. So — let's count.

<!-- Speaker note: Five algorithms, one identical input each time, comparisons and writes counted through the same two primitives. -->

---

# The setup

- Bubble, selection, insertion, merge, quick (Lomuto)
- All sort the **identical** array, every single time
- Every comparison and write goes through counted helpers
- The tallies are a measurement, not an estimate

<!-- Speaker note: No algorithm here is re-taught — each already has its own dedicated animation. This is purely a side-by-side measurement. -->

---

# Sorting algorithms, compared

<iframe class="dsanim" src="anim/sorting-comparison.html?yer=slayt&lang=en" title="Sorting comparison"></iframe>

<!-- Speaker note: Normal example: watch each row reveal its comparisons/writes tally as its "running..." highlight resolves. -->

---

# Edge case — already sorted

<iframe class="dsanim" src="anim/sorting-comparison.html?yer=slayt&lang=en&example=already-sorted" title="Sorting comparison: already sorted"></iframe>

<!-- Speaker note: The whole week's lesson in one animation: bubble wins by a landslide, quick (Lomuto) has its worst possible day. -->

---

# Four numbers, one story

| Input | Bubble | Quick (Lomuto) |
| --- | --- | --- |
| Already sorted (n=12) | **11** | **66** |
| Reverse sorted (n=12) | 66 | 66 |

<!-- Speaker note: The exact same 66-comparison worst case from Section 7's quick sort slides, now sitting right next to bubble's 11. -->

---

# No single winner

- Bubble: wins decisively on already-sorted data
- Quick (Lomuto): wins on average for large random data
- Insertion: wins on nearly-sorted data specifically
- The winner always depends on the **shape** of the input

<!-- Speaker note: This single sentence is the entire justification for teaching eleven different sorting algorithms instead of one "best" one. -->

---

# Mini-quiz

On nearly-sorted input (just two values swapped),
insertion sort needed only 18 comparisons while
selection sort needed the full 66. Why the gap?

<!-- Speaker note: Point them back at Section 4's self-check about why insertion sort's cost tracks how far out of place elements are. -->

---

# Answer

**Insertion sort exploits partial order** — most
elements need one check and stop. Selection
sort's full scan ignores how sorted the input is.

<!-- Speaker note: Nearly-sorted data is insertion sort's best case in practice, but not selection sort's — a direct callback to Section 4.5. -->

---

<!-- _class: bolum -->

# 13. Choosing a Sorting Algorithm

<!-- Speaker note: Section 13 turns everything today into a single practical question: given what you know about your data, which sort? -->

---

# The decision table

| Situation | Best choice |
| --- | --- |
| Tiny array, or a recursive sub-array | Insertion sort |
| Already / nearly sorted | Insertion, or bubble (early exit) |
| Writes expensive, comparisons cheap | Selection sort |

<!-- Speaker note: This table continues over the next two slides — read the full version in this week's notes for the complete nine-row table. -->

---

# The decision table, continued

| Situation | Best choice |
| --- | --- |
| Need guaranteed O(n log n), memory OK | Merge sort |
| Need average O(n log n), in place | Quick sort, median-of-3 |
| No recursion allowed | Merge sort (bottom-up), heap sort |

<!-- Speaker note: "Memory OK" versus "in place" is the single biggest fork in this whole table — merge sort or quick sort, rarely both matter equally. -->

---

# The decision table, concluded

| Situation | Best choice |
| --- | --- |
| Small-integer keys, range ≈ n | Counting sort |
| Larger integer/string keys | Radix sort (LSD) |
| Keys spread evenly over a range | Bucket sort |
| Ties must keep input order | Any stable sort (Section 11.5) |

<!-- Speaker note: These four rows are this week's second half in one glance — the non-comparison sorts, chosen by what you know about the keys. -->

---

# The real question

- Not "which sort is fastest in general" — there isn't one
- **What do you actually know** about your data?
- **What do you actually need**: a guarantee? stability?
- Section 12 gave you the tool to measure, not guess

<!-- Speaker note: Knowing all eleven well enough to recognize which situation you're in — that is this week's real, transferable skill. -->

---

# Summary

- O(n²) family: bubble, selection, insertion, shell sort
- O(n log n) guaranteed: merge sort (top-down, bottom-up)
- O(n log n) average, in place: quick sort (Lomuto, Hoare)
- Non-comparison, O(n+k): counting, radix, bucket sort

<!-- Speaker note: Eleven algorithms, four families, one underlying question each time: what do you know, and what can you afford? -->

---

# Summary, continued

- Comparison-sorting lower bound: O(n log n), provably
- Non-comparison sorts beat it by never comparing keys
- Stability: an extra guarantee, not correctness itself
- No single "best" sort — the input's shape decides

<!-- Speaker note: If you remember one thing from today, make it this: measure, don't assume, and know which situation you are actually in. -->

---

# Looking ahead

- Week 11: **advanced tree structures**
- Balanced trees maintain sorted order incrementally
- Merge sort's divide-and-conquer reappears, tree-shaped
- Later: **external sorting** — data too big for memory

<!-- Speaker note: Bottom-up merge sort's "merge sorted runs" mechanism becomes the literal foundation for sorting data that lives on disk. -->

---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Questions?

**CEN207 Data Structures — Week 10**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!-- Speaker note: Full notes, all fourteen animations, and every program are in this week's lecture notes — thank you. -->



