---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 2 — Arrays, Matrices, and Linked Lists"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 2"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Arrays, Matrices, and Linked Lists

**CEN207 Data Structures — Week 2**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!--
Speaker note: Last week a box held one value, made and destroyed by malloc and free. This week two ideas grow out of that single box: many boxes side by side, reached by arithmetic — the array — and one box pointing at the next — the linked list.
-->

---

# Today's plan (3 hours)

| Hour | Topic |
| --- | --- |
| 1 | Arrays: insert/delete, dynamic growth **Anim 1–2** · 2-D layout, rotation, rearrange **Anim 3–5** |
| 2 | Sparse matrices **Anim 6–8** · lists: node/head/NULL, singly ops **Anim 9–12** |
| 3 | Doubly, circular, Josephus, XOR, skip list **Anim 13–17** · arrays vs. lists |

**Learning outcomes:** LO.1 (explain fundamental data structures) · LO.2 (analyze complexity) · LO.7 (choose the right structure)

<!-- Speaker note: Seventeen short animations carry the whole lecture; each appears once, exactly where its idea is introduced, and every single one gets a second look at its trickiest edge case. -->

---

# This week's concepts — where

| Concept | Where |
| --- | --- |
| Arrays: shifting, dynamic growth | Section 1 |
| 2-D arrays, rotation, rearrangement | Sections 2–3 |
| Sparse matrices | Section 4 |
| Singly/doubly/circular lists | Sections 5–8 |
| XOR list, skip list, arrays vs. lists | Sections 9–11 |

<!-- Speaker note: Every term gets a full definition the first time it appears; this table just says where to find it again. -->

---

# How the code examples work

- Every idea has a complete **C** and **Java** program
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Sources: `code/week-02/c/` and `code/week-02/java/`
- Each program's expected output is in the week notes

<!-- Speaker note: Open a terminal now if you want to run these live; every snippet on today's slides compiles and runs exactly as shown. -->

---

# Recap — Week 1: memory and pointers

- A variable is a labeled **box** in memory
- A pointer **stores an address** — it points at a box
- `malloc(n)`: reserve `n` bytes, returns an address
- `free(p)`: give the box back; then set `p = NULL`
- `NULL`: a pointer that points at **nothing**

<!-- Speaker note: Everything today builds on exactly these five facts — nothing new about memory itself gets introduced this week, only new shapes built from it. -->

---

# Map of the week — at a glance

| Arrays & matrices | Linked lists |
| --- | --- |
| Shifting, dynamic growth | Node, head, NULL |
| Row-major, rotation, rearrange | Singly, doubly, circular |
| Sparse: triplet, transpose, add | Josephus, XOR, skip list |

<!-- Speaker note: Every box on this map gets its own slides below, most with a short animation and a complete C/Java program. -->

---

<!-- _class: bolum -->

# 1. Arrays in Memory: Insertion, Deletion, Growth

<!-- Speaker note: Section 1 asks what it costs to change an array's contents, not just read them — and what to do when the array's size was guessed wrong. -->

---

# A question to start

An array is `n` boxes in a row. Insert one
value in the middle — what has to move
before the new value can even go in?

<!-- Speaker note: Let the class guess before the next slide answers it: everything after the insertion point. -->

---

# Intuition — a row of numbered lockers

- Each box sits at **index × box size** from the start
- `arr[k]` is pure arithmetic — no searching needed
- But lockers do not slide apart by themselves
- Making room means moving every locker after it

<!-- Speaker note: That O(1) index lookup is the array's whole appeal — and its whole cost shows up the moment something has to move. -->

---

# `size` vs. capacity

- A fixed array reserves `CAP` boxes up front
- `size` tracks how many boxes are **actually used**
- `insert_at(k, v)`: make room at index `k`
- `delete_at(k)`: close the gap at index `k`

<!-- Speaker note: CAP never changes in this first version; size is the only thing that moves, and only within 0..CAP. -->

---

# Array insert and delete, step by step

<iframe class="dsanim" src="anim/array-insert-delete.html?yer=slayt&lang=en" title="Array insert and delete"></iframe>

<!-- Speaker note: Watch how many cells light up on a front insert versus an append — that difference is the whole lesson. -->

---

# Edge case — overflow: the array is full

<iframe class="dsanim" src="anim/array-insert-delete.html?yer=slayt&lang=en&example=overflow" title="Array insert and delete: overflow"></iframe>

<!-- Speaker note: A full array rejects the insert outright rather than crash — that check has to come before any shifting starts. -->

---

# Code — `insert_at()`

```c
bool insert_at(int k, int v) {
    if (size == CAP)
        return false;          /* full: overflow */
    for (int i = size; i > k; i--)
        arr[i] = arr[i - 1];   /* shift right */
    arr[k] = v;
    size++;
    return true;
}
```

<!-- Speaker note: The shift loop runs backward, from the end toward k — forward would overwrite values before they are copied. -->

---

# Code — `delete_at()`

```c
bool delete_at(int k) {
    if (size == 0)
        return false;          /* empty: underflow */
    for (int i = k; i < size - 1; i++)
        arr[i] = arr[i + 1];   /* shift left */
    size--;
    return true;
}
```

<!-- Speaker note: This loop runs forward instead — the mirror image of insert's backward shift, and just as easy to get backward by mistake. -->

---

# Complexity and common mistakes

- `k = 0`: shifts **every** element — **O(n)**
- `k = size` (append): no shift at all — **O(1)**
- Mistake: forgetting the overflow/underflow check first
- Mistake: shifting in the wrong direction, overwriting data

<!-- Speaker note: The exact same function costs anywhere from O(1) to O(n), purely depending on which index k the caller picks. -->

---

# Mini-quiz

You insert 5 values, always at index 0.
How many total element-shifts happen?

<!-- Speaker note: Let the class add it up before the next slide. -->

---

# Answer

**0+1+2+3+4 = 10 shifts.** Each front-insert
shifts every element already there — the
classic O(n) worst case, repeated five times.

<!-- Speaker note: Ten shifts to place five values — inserting at the front is expensive precisely because it repeats the worst case every time. -->

---

# But what if the size is unknown?

A fixed array's `CAP` is a hard ceiling.
A **dynamic array** grows its own capacity
on demand, instead of rejecting the insert.

<!-- Speaker note: This is exactly what Java's ArrayList and C++'s std::vector do under the hood — the same trick, industrial strength. -->

---

# Dynamic array growth, step by step

<iframe class="dsanim" src="anim/dynamic-array-growth.html?yer=slayt&lang=en" title="Dynamic array growth"></iframe>

<!-- Speaker note: Watch the temporary row appear below the array each time it grows — that row is the copy, before it slides up to replace the old block. -->

---

# Edge case — shrinking back down

<iframe class="dsanim" src="anim/dynamic-array-growth.html?yer=slayt&lang=en&example=shrink-quarter" title="Dynamic array: shrinking"></iframe>

<!-- Speaker note: Shrinking is optional and symmetric to growing — capacity halves once usage drops to a quarter full, to give memory back. -->

---

# Code — `da_resize()`

```c
static void da_resize(DynArray *a, int new_cap) {
    int *fresh = malloc(new_cap * sizeof(int));
    for (int i = 0; i < a->size; i++)
        fresh[i] = a->data[i];   /* copy every value */
    free(a->data);               /* old block freed */
    a->data = fresh;
    a->cap = new_cap;
}
```

<!-- Speaker note: Every single existing value gets copied into the fresh block — that full copy is exactly where the O(n) cost of growing comes from. -->

---

# Code — `da_append()`

```c
void da_append(DynArray *a, int v) {
    if (a->size == a->cap) {
        int new_cap = a->cap * 2;   /* growth factor 2 */
        da_resize(a, new_cap);
    }
    a->data[a->size++] = v;
}
```

<!-- Speaker note: The resize only happens when the block is already full — most calls skip straight to the one-line write at the end. -->

---

# Complexity and common mistakes

- A growing append copies `size` elements: **O(n)**
- Most appends just write one slot: **O(1)**
- Over `n` appends, total copies stay **under 2n**
- So the **amortized** cost per append is O(1)
- Mistake: treating every single append as O(n)

<!-- Speaker note: Amortized means averaged over a long run of operations — one append can be expensive, but the average never is. -->

---

# Mini-quiz

Starting from `cap = 1` and doubling, how
many times does the array grow while 100
values are appended one by one?

<!-- Speaker note: Have the class count the doublings: 1, 2, 4, 8... before the next slide. -->

---

# Answer

**7 times** (1→2→4→8→16→32→64→128).
`log2(100) ≈ 6.6`, rounded up — growth is
**logarithmic** in the final size, not linear.

<!-- Speaker note: Doubling means the number of growths grows only as the logarithm of the final size — that is exactly why the total copying stays cheap. -->

---

<!-- _class: bolum -->

# 2. 2-D Arrays: Row-Major vs Column-Major

<!-- Speaker note: Section 2 asks what a "two-dimensional" array actually looks like underneath, in memory that has only ever been one-dimensional. -->

---

# A question to start

Memory is one long row of bytes. A matrix
looks two-dimensional — rows and columns.
How does `mat[i][j]` become one address?

<!-- Speaker note: There is no such thing as genuinely 2-D memory — every "2-D" array is really a 1-D array wearing a disguise. -->

---

# Intuition — a bookshelf, one shelf at a time

- Picture the matrix's rows laid end to end
- Row 0's cells, then row 1's cells, and so on
- That layout is called **row-major** order
- Some languages (Fortran, MATLAB) lay out **columns** first

<!-- Speaker note: Row-major versus column-major is purely a convention — nothing about "rows" or "columns" is more natural to memory than the other. -->

---

# The address formulas

- **Row-major:** `addr(i,j) = i * COLS + j`
- **Column-major:** `addr(i,j) = j * ROWS + i`
- C and Java: row-major; Fortran, MATLAB: column-major
- The formula is arithmetic — no searching at all

<!-- Speaker note: Two formulas, and every "2-D array" question this section asks comes down to picking the right one and applying it. -->

---

# Matrix in memory, step by step

<iframe class="dsanim" src="anim/matrix-row-major.html?yer=slayt&lang=en" title="Matrix in memory: row-major"></iframe>

<!-- Speaker note: Watch the memory row below the grid — a row-major walk lands on consecutive memory cells, one step at a time. -->

---

# Edge case — column-major storage, row-by-row walk

<iframe class="dsanim" src="anim/matrix-row-major.html?yer=slayt&lang=en&example=col-major-row-walk" title="Matrix in memory: a mismatched walk"></iframe>

<!-- Speaker note: The traversal order here fights the storage order — every step now jumps across memory instead of landing next door. -->

---

# Code — `addr()` and a row-major walk

```c
int mat[ROWS][COLS];
/* address of mat[i][j], in ints from the start */
int addr(int i, int j) {
    return i * COLS + j;   /* row-major */
}

void traverse_row_major(int mat[ROWS][COLS]) {
    for (int i = 0; i < ROWS; i++)
        for (int j = 0; j < COLS; j++)
            visit(mat[i][j]);
}
```

<!-- Speaker note: The outer loop over i and the inner loop over j exactly retrace the row-major formula, one visit per address in order. -->

---

# Complexity and common mistakes

- Address lookup: pure arithmetic — **O(1)**
- Row-major walk, row-major storage: every step **Δ=1**
- Wrong layout for the walk: a jump **every** step
- Mistake: assuming every language is row-major

<!-- Speaker note: The formula's cost never changes — what changes is how far apart consecutive visits land in real memory, which is what your CPU's cache actually feels. -->

---

# Mini-quiz

A row-major matrix has 5 columns. `mat[3][2]`
sits at address 17. What is `mat[3][3]`'s address?

<!-- Speaker note: Let the class apply the formula themselves before the next slide. -->

---

# Answer

**18.** Moving one column right adds exactly
`1` in row-major order — the next cell is
always the very next address.

<!-- Speaker note: That one-step adjacency is exactly what "row-major" buys you, and exactly what a column-major walk would throw away. -->

---

<!-- _class: bolum -->

# 3. Rotation and Rearrangement: Two Pointers

<!-- Speaker note: Section 3 covers two array tricks that share one idea — moving values around using only O(1) extra space, never a second array. -->

---

# A question to start

Rotate a 12-value array left by 4, using
**no** second array. Where would you even
start, with only O(1) extra space allowed?

<!-- Speaker note: The obvious approach — copy into a new array — is exactly the approach this section rules out. -->

---

# Intuition — reversal, three times

- Reverse the first part, reverse the rest
- Then reverse the **whole** array once more
- Three reversals land every value exactly right
- No second array, no shifting one step at a time

<!-- Speaker note: This trick feels like magic the first time; watching it on the animation, one reversal at a time, is what makes it click. -->

---

# `rotate_left`: three reversals

- `d = d % n` — the real rotation amount
- Reverse `arr[0..d-1]`
- Reverse `arr[d..n-1]`
- Reverse `arr[0..n-1]` — done

<!-- Speaker note: Each reversal on its own looks wrong; only the third one, over the whole array, straightens everything back out. -->

---

# Array rotation, step by step

<iframe class="dsanim" src="anim/array-rotation.html?yer=slayt&lang=en" title="Array rotation"></iframe>

<!-- Speaker note: Each reversal's result is kept as a new row below, so all three phases stay visible at once, side by side. -->

---

# Edge case — d larger than n

<iframe class="dsanim" src="anim/array-rotation.html?yer=slayt&lang=en&example=d-greater-n" title="Array rotation: d greater than n"></iframe>

<!-- Speaker note: d=23 on 10 values still works, because d % n reduces it to 3 before a single reversal even begins. -->

---

# Code — `reverse()`

```c
void reverse(int arr[], int lo, int hi) {
    while (lo < hi) {
        int tmp = arr[lo];
        arr[lo] = arr[hi];
        arr[hi] = tmp;
        lo++;
        hi--;
    }
}
```

<!-- Speaker note: This one helper function, called three times with three different ranges, is the entire rotation algorithm. -->

---

# Code — `rotate_left()`

```c
void rotate_left(int arr[], int n, int d) {
    d = d % n;
    reverse(arr, 0, d - 1);    /* first d */
    reverse(arr, d, n - 1);    /* the rest */
    reverse(arr, 0, n - 1);    /* whole array */
}
```

<!-- Speaker note: Three calls, three ranges — nothing else in this function does any work at all. -->

---

# Complexity and common mistakes

- Three passes over the array, each O(n) — still **O(n)**
- **O(1)** extra space: no second array anywhere
- Mistake: forgetting `d = d % n` first
- Mistake: off-by-one bounds inside `reverse`

<!-- Speaker note: Three passes sounds like it should be three times slower, but three times O(n) is still just O(n). -->

---

# Rearranging: two pointers close in

- Goal: negatives left, non-negatives right
- `left` skips values already negative
- `right` skips values already non-negative
- When both stop, swap and step inward

<!-- Speaker note: This is the exact same two-pointer shape as a quicksort partition step — the same idea shows up again next semester. -->

---

# Array rearrangement, step by step

<iframe class="dsanim" src="anim/array-rearrange.html?yer=slayt&lang=en" title="Array rearrangement"></iframe>

<!-- Speaker note: Watch left and right walk toward each other, each skipping values that are already on the correct side. -->

---

# Edge case — already segregated

<iframe class="dsanim" src="anim/array-rearrange.html?yer=slayt&lang=en&example=already-segregated" title="Array rearrangement: already segregated"></iframe>

<!-- Speaker note: The pointers still walk the whole array here, even though no swap is ever needed — the check itself still costs O(n). -->

---

# Code — `segregate()`

```c
void segregate(int arr[], int n) {
    int left = 0, right = n - 1;
    while (left < right) {
        while (left<right && arr[left]<0) left++;
        while (left<right && arr[right]>=0) right--;
        if (left < right) {
            int tmp = arr[left];
            arr[left] = arr[right];
            arr[right] = tmp;
            left++; right--;
        }
    }
}
```

<!-- Speaker note: Two inner while-loops skip past values already on the right side; only when both stop does an actual swap happen. -->

---

# Complexity and common mistakes

- Both pointers move **inward only** — **O(n)** total
- One pass, O(1) extra space
- Mistake: treating `0` as negative — it is **not**
- Mistake: forgetting the `left < right` guard inside

<!-- Speaker note: Every inner loop also checks left < right, or the two pointers could cross and read past each other. -->

---

# Mini-quiz

After `segregate`, is the array **sorted**
within each half, or just split in two?

<!-- Speaker note: Let the class think about what segregate actually compares. -->

---

# Answer

**Just split.** Negatives end up left of
non-negatives, but neither half is sorted —
`segregate` never compares values to order them.

<!-- Speaker note: Segregating and sorting are different jobs; this algorithm only ever asks "is it negative", never "which is bigger". -->

---

<!-- _class: bolum -->

# 4. Sparse Matrices

<!-- Speaker note: Section 4 asks what to do when a matrix is mostly zeros — a very common case in real scientific and graph computing. -->

---

# A question to start

A 1000×1000 matrix has a million cells.
Only 200 are nonzero. Why store the other
999,800 zeros at all?

<!-- Speaker note: A million ints is 4 MB just for one matrix that is 99.98% empty — the waste is not hypothetical. -->

---

# Intuition — a mostly-empty parking lot

- Most spaces sit empty, all day, every day
- A clipboard listing only the **occupied** spots suffices
- Position + value is all you need to remember
- That clipboard is the **triplet** representation

<!-- Speaker note: Nobody photographs every empty parking space to prove it is empty — they just write down where the cars are. -->

---

# The triplet: `(row, col, value)`

- One entry per **nonzero** cell, nothing else
- Scan row-major, skip every zero found
- A sparse matrix's triplet table can be tiny
- Rebuilding the dense matrix just needs the triplets

<!-- Speaker note: Three numbers per nonzero cell replace an entire row of mostly zeros — the saving grows with how sparse the matrix is. -->

---

# Sparse matrix as triplets, step by step

<iframe class="dsanim" src="anim/sparse-matrix-triplet.html?yer=slayt&lang=en" title="Sparse matrix: triplets"></iframe>

<!-- Speaker note: Watch how many cells get skipped silently — only the handful of nonzero ones ever produce a triplet row. -->

---

# Edge case — an all-zero matrix

<iframe class="dsanim" src="anim/sparse-matrix-triplet.html?yer=slayt&lang=en&example=all-zero" title="Sparse matrix triplets: all zero"></iframe>

<!-- Speaker note: Every cell gets scanned and skipped — the triplet table stays completely empty, which is itself a valid, correct result. -->

---

# Code — `to_triplets()`

```c
int to_triplets(int mat[ROWS][COLS], Triplet out[]) {
    int k = 0;
    for (int i = 0; i < ROWS; i++)
        for (int j = 0; j < COLS; j++)
            if (mat[i][j] != 0) {
                out[k].row = i;
                out[k].col = j;
                out[k].value = mat[i][j];
                k++;
            }
    return k;
}
```

<!-- Speaker note: The nested loops scan every cell regardless, but the if-check means only nonzero cells ever get written into out[]. -->

---

# Complexity

- Scanning the dense matrix: **O(rows × cols)**
- Output size equals the **nonzero count**, never more
- A very sparse matrix: triplets are far smaller

<!-- Speaker note: The scan itself cannot be cheaper than the full matrix, but everything built from the result afterward benefits from the small output. -->

---

# Fast transpose: no re-sorting needed

- Naive transpose: swap `(row,col)`, then **sort** — O(nnz log nnz)
- Better: **count** nonzeros per column first
- Turn counts into starting **positions** (a prefix sum)
- One more pass places every triplet, already sorted

<!-- Speaker note: This is a genuinely clever trick — knowing in advance exactly where each entry belongs means never needing to sort at all. -->

---

# Fast transpose, step by step

<iframe class="dsanim" src="anim/sparse-matrix-transpose.html?yer=slayt&lang=en" title="Sparse matrix: fast transpose"></iframe>

<!-- Speaker note: Watch count[] fill first, then pos[] turn those counts into starting offsets, before a single output triplet is placed. -->

---

# Edge case — a fully dense matrix

<iframe class="dsanim" src="anim/sparse-matrix-transpose.html?yer=slayt&lang=en&example=fully-dense" title="Fast transpose: fully dense"></iframe>

<!-- Speaker note: With every cell nonzero, fast transpose still works — it just has as many triplets to place as the matrix has cells. -->

---

# Code — counting and prefix sums

```c
int count[COLS] = {0};
int pos[COLS];
for (int i = 0; i < nnz; i++)
    count[a[i].col]++;        /* per column */
pos[0] = 0;
for (int c = 1; c < COLS; c++)
    pos[c] = pos[c - 1] + count[c - 1];
```

<!-- Speaker note: pos[c] is the running total of every column before c — exactly where column c's triplets should start in the output. -->

---

# Code — placing every triplet

```c
for (int i = 0; i < nnz; i++) {
    int c = a[i].col;
    int p = pos[c]++;
    b[p].row = a[i].col;    /* row/col swap */
    b[p].col = a[i].row;
    b[p].value = a[i].value;
}
```

<!-- Speaker note: pos[c]++ both reads the next free slot for column c and reserves it for the next triplet that lands there. -->

---

# Complexity and common mistakes

- Two passes, `O(nnz + COLS)` — no sorting at all
- Far faster than a general sort's O(nnz log nnz)
- Mistake: skipping the prefix sum — output lands unsorted
- Mistake: forgetting to swap `row` and `col`

<!-- Speaker note: Skip the prefix-sum step and every triplet still gets placed somewhere — just not in the sorted order the algorithm promises. -->

---

# Adding two sparse matrices: a merge

- Both triplet lists already row-major **sorted**
- Walk both together, like merge sort's merge step
- Earlier `(row,col)` wins and is copied through
- Same `(row,col)` in both: **add** the values

<!-- Speaker note: Because both inputs are already sorted, addition never needs to search — it only ever needs to compare two current positions. -->

---

# Sparse matrix addition, step by step

<iframe class="dsanim" src="anim/sparse-matrix-addition.html?yer=slayt&lang=en" title="Sparse matrix addition"></iframe>

<!-- Speaker note: Watch pointers i and j advance independently, each stepping only through its own list, exactly like merging two sorted runs. -->

---

# Edge case — values that cancel to zero

<iframe class="dsanim" src="anim/sparse-matrix-addition.html?yer=slayt&lang=en&example=cancel" title="Sparse matrix addition: cancellation"></iframe>

<!-- Speaker note: A cancelled cell is not written to the output at all — the result stays sparse, never picking up new zero entries. -->

---

# Code — the merge loop

```c
while (i < na && j < nb) {
    if (/* … a[i]'s (row,col) comes first … */) {
        out[k++] = a[i++];
    } else if (/* … b[j]'s comes first … */) {
        out[k++] = b[j++];
    } else {
        int sum = a[i].value + b[j].value;
        if (sum != 0) /* … out[k++] = sum entry … */;
        i++; j++;
    }
}
```

<!-- Speaker note: Three cases only: a is earlier, b is earlier, or they land on the exact same cell and their values add together. -->

---

# Complexity and common mistakes

- One merge pass: **O(na + nb)**, no re-sorting
- Never touches a cell absent from **both** lists
- Mistake: forgetting to drop a cell when the sum is 0
- Mistake: assuming unsorted triplet lists still merge correctly

<!-- Speaker note: This whole approach depends on both lists already being sorted — feed it unsorted triplets and the merge silently gives the wrong answer. -->

---

# Mini-quiz

Cell (1,2) holds 6 in matrix A and −6 in
matrix B. What ends up in the sum's triplet list?

<!-- Speaker note: Let the class work out the arithmetic before the next slide. -->

---

# Answer

**Nothing.** `6 + (-6) = 0`, and a zero-sum
cell is dropped entirely — the triplet list
only ever holds nonzero values.

<!-- Speaker note: Keeping a zero-valued triplet around would quietly break the "only nonzero cells" promise the whole representation depends on. -->

---

<!-- _class: bolum -->

# 5. Linked Lists: Node, Head, NULL

<!-- Speaker note: Section 5 introduces the second major idea of the week — a structure where inserting never has to shift anything else. -->

---

# A question to start

Every insert into an array can shift up to
`n` elements. Is there a structure where
inserting **never** moves existing values?

<!-- Speaker note: Give the class a moment — the answer is exactly what the rest of today builds. -->

---

# A short history

- **1956** — John McCarthy, Lisp's **cons cell**
- A cons cell: a value, plus a pointer to the next
- Six decades later, every language still uses it
- C's `struct Node { data; next; }` is the same idea

<!-- Speaker note: McCarthy was building a language for symbolic reasoning, not thinking about "data structures" as a subject — this idea simply turned out to be everywhere. -->

---

# Intuition — a treasure hunt

- Each clue tells you **where** the next clue is
- You never see the whole map at once
- Follow one pointer, arrive, read, follow the next
- The **last** clue says "nothing here" — `NULL`

<!-- Speaker note: An array is a map you hold all at once; a linked list is a trail you can only walk one step at a time. -->

---

# The whole idea, one struct

```c
typedef struct Node {
    int data;
    struct Node *next;
} Node;
```

- One value, one pointer — that is a linked list
- No shifting: a new node just gets a pointer

<!-- Speaker note: Every single linked-list program this week and next builds on exactly this five-line struct. -->

---

# `head` and the `NULL` terminator

- `head` is the **only** fixed reference into the list
- Every other node is reached by following `next`
- The last node's `next` is `NULL` — "no more nodes"
- An empty list is just `head == NULL`

<!-- Speaker note: Lose head, and every node after it becomes unreachable — head is the single thread the whole list hangs from. -->

---

# The "inception": a struct containing itself

- `struct Node` has a field of type `struct Node *`
- That is **not** infinite recursion — it is a pointer
- A pointer's size is fixed, known before `Node` is complete
- This is why `struct Node *next;` compiles, but `Node next;` cannot

<!-- Speaker note: This self-reference trips up a lot of students the first time — the key is that a pointer is always the same small, fixed size, whatever it points at. -->

---

# Common mistakes

- Forgetting to check for `NULL` before `->next`
- Confusing a **node** (the struct) with a **pointer** to it
- Writing `Node next;` where a pointer was needed

<!-- Speaker note: Dereferencing a NULL pointer is the single most common crash in every linked-list program this semester. -->

---

# Mini-quiz

Why must `next` be declared as `struct Node *`,
never as a plain `struct Node`?

<!-- Speaker note: Let the class connect this back to the "inception" slide before the answer. -->

---

# Answer

A plain `Node` field would need the **size**
of `Node` to already be known — but `Node`
is not finished being defined yet. A pointer's
size never depends on that.

<!-- Speaker note: A pointer is always the same handful of bytes, no matter what it points at — that is precisely what breaks the circular dependency. -->

---

<!-- _class: bolum -->

# 6. Singly Linked Lists: Insert, Delete, Search, Reverse

<!-- Speaker note: Section 6 builds the four operations every later list variant — doubly, circular, XOR, skip — reuses or extends. -->

---

# A question to start

Three insert positions — head, tail, and
"after a given node" — cost very different
amounts. Which is cheap, and which is not?

<!-- Speaker note: The answer depends entirely on whether the list keeps a separate pointer to its tail, which this version does not. -->

---

# Three ways to insert

- `insert_head`: new node points at the old head — **O(1)**
- `insert_tail`: no tail pointer here — walk to the end
- `insert_after(prev, v)`: two pointer writes, **in order**
- Getting that order backward **breaks** the list

<!-- Speaker note: "In order" is not a stylistic preference here — it is the difference between a working list and a severed one. -->

---

# Singly-list insertion, step by step

<iframe class="dsanim" src="anim/singly-insert.html?yer=slayt&lang=en" title="Singly linked list: insert"></iframe>

<!-- Speaker note: Watch insert_tail specifically — with no tail pointer, it has to walk past every existing node first. -->

---

# Edge case — the two steps, swapped

<iframe class="dsanim" src="anim/singly-insert.html?yer=slayt&lang=en&example=order-swap-mistake" title="Singly insert: wrong pointer order"></iframe>

<!-- Speaker note: This illustration never touches the real list — it exists purely to show why the write order in insert_after truly matters. -->

---

# Code — `insert_head()`

```c
Node *insert_head(Node *head, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    n->next = head;    /* points at the old head */
    return n;           /* new node is head now */
}
```

<!-- Speaker note: One malloc, one pointer write, one return — insert_head never even looks at the rest of the list. -->

---

# Code — `insert_after()`: order matters

```c
void insert_after(Node *prev, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    n->next = prev->next;   /* STEP 1: new first */
    prev->next = n;         /* STEP 2: then link */
}
```

<!-- Speaker note: Swap these two lines and prev->next already equals n by the time step one reads it — the new node ends up pointing at itself. -->

---

# Complexity and common mistakes

- `insert_head`: **O(1)** — no walking at all
- `insert_tail` (no tail pointer): walks to the end — **O(n)**
- `insert_after`: **O(1)** once `prev` is already found
- Mistake: swapping STEP 1 and STEP 2 — cuts the list

<!-- Speaker note: insert_after itself is O(1), but finding prev in the first place, via search, usually is not. -->

---

# Deleting by value

- Special case: the value is at the **head**
- Otherwise: `prev`/`cur` walk together, searching
- Found: `prev->next = cur->next` — the **bypass arrow**
- Then `free(cur)` — the node is gone

<!-- Speaker note: The bypass arrow is the entire trick: nothing points at cur any more, so it is simply unreachable, ready to be freed. -->

---

# Singly-list deletion, step by step

<iframe class="dsanim" src="anim/singly-delete.html?yer=slayt&lang=en" title="Singly linked list: delete"></iframe>

<!-- Speaker note: Watch prev and cur move together — prev always trails one step behind cur, ready to be relinked the moment cur is found. -->

---

# Edge case — deleting the tail, then a missing value

<iframe class="dsanim" src="anim/singly-delete.html?yer=slayt&lang=en&example=tail-and-missing" title="Singly delete: tail and a missing value"></iframe>

<!-- Speaker note: Deleting the tail is not a separate case in this code at all — it falls naturally out of the same prev/cur scan. -->

---

# Code — `delete_value()`

```c
Node *delete_value(Node *head, int value,
                    bool *removed) {
    *removed = false;
    if (head == NULL) return NULL;
    if (head->data == value) {   /* delete head */
        Node *tmp = head;
        head = head->next;
        free(tmp);
        *removed = true;
        return head;
    }
    /* … prev/cur scan, bypass, free(cur) … */
}
```

<!-- Speaker note: The head case is handled separately here because head itself, not just some node's next field, has to change. -->

---

# Complexity and common mistakes

- Deleting the head: **O(1)**, no search needed
- Deleting anywhere else: **O(n)** to find it
- Mistake: forgetting the head is a **special** case
- Mistake: advancing `cur` before saving `prev`

<!-- Speaker note: If prev is not updated in lockstep with cur, the bypass arrow ends up pointing from the wrong node entirely. -->

---

# Linear search: no shortcuts

- No index arithmetic — a list has no `arr[k]`
- Walk from `head`, comparing one node at a time
- Found: return its **position**; exhausted: return `-1`

<!-- Speaker note: This is the single biggest thing a list gives up compared to an array — there is no way to jump straight to position k. -->

---

# Singly-list search, step by step

<iframe class="dsanim" src="anim/singly-search.html?yer=slayt&lang=en" title="Singly linked list: search"></iframe>

<!-- Speaker note: Watch the comparison counter climb — every node visited costs one comparison, whether or not it is the one being searched for. -->

---

# Edge case — searching an empty list

<iframe class="dsanim" src="anim/singly-search.html?yer=slayt&lang=en&example=empty-list" title="Singly search: an empty list"></iframe>

<!-- Speaker note: An empty list means the for-loop's condition, cur != NULL, fails immediately — search returns -1 without ever comparing anything. -->

---

# Code — `search()`

```c
int search(Node *head, int value) {
    int index = 0;
    for (Node *cur = head; cur != NULL;
         cur = cur->next) {
        if (cur->data == value)
            return index;      /* found here */
        index++;
    }
    return -1;                 /* not found */
}
```

<!-- Speaker note: This entire function fits on one slide — nothing in today's lecture gets cut from it. -->

---

# Complexity

- Every search: **O(n)** — no index to jump to
- Contrast: `arr[k]` on an array is **O(1)**
- This exact gap drives the section 11 comparison

<!-- Speaker note: Keep this O(n) number in mind — it is the single biggest argument in the arrays-versus-lists table two sections from now. -->

---

# Reversing in place: three pointers

- `prev` trails, `curr` leads, `next` looks ahead
- Save `next` **before** overwriting `curr->next`
- Flip `curr->next` to point at `prev`
- Both pointers then step one node forward

<!-- Speaker note: Three pointers doing a coordinated dance, one node at a time, is the entire algorithm — no recursion, no extra memory. -->

---

# Singly-list reversal, step by step

<iframe class="dsanim" src="anim/singly-reverse.html?yer=slayt&lang=en" title="Singly linked list: reverse"></iframe>

<!-- Speaker note: Watch every arrow flip one at a time, always in the same order: save next, flip curr's arrow, advance both pointers. -->

---

# Edge case — just two nodes

<iframe class="dsanim" src="anim/singly-reverse.html?yer=slayt&lang=en&example=two-nodes" title="Singly reverse: two nodes"></iframe>

<!-- Speaker note: Even the smallest non-trivial case runs through the exact same three-pointer dance, just for one iteration instead of many. -->

---

# Code — `reverse()`

```c
Node *reverse(Node *head) {
    Node *prev = NULL;
    Node *curr = head;
    while (curr != NULL) {
        Node *next = curr->next;  /* save rest */
        curr->next = prev;         /* flip arrow */
        prev = curr;
        curr = next;
    }
    return prev;                   /* new head */
}
```

<!-- Speaker note: This whole function also fits on one slide, and it is worth reading it line by line, out loud, at least once. -->

---

# Complexity

- One pass, one flip per node — **O(n)** time
- No extra nodes allocated — **O(1)** space
- Compare: reversing an array also needs no extra pointers

<!-- Speaker note: In-place reversal, with no extra memory beyond three pointers, is the main reason this algorithm is worth learning by heart. -->

---

# Mini-quiz

If you flip `curr->next` to `prev` **before**
saving `curr->next` into a temporary `next`
variable, what breaks?

<!-- Speaker note: Let the class trace through what curr->next actually holds at each step before the answer. -->

---

# Answer

**The rest of the list is lost.** Once
`curr->next` points backward, there is no
way left to reach the nodes that used to
follow it.

<!-- Speaker note: This is the exact same "save before you overwrite" lesson as insert_after's step order, just showing up again in a different operation. -->

---

<!-- _class: bolum -->

# 7. Doubly Linked Lists

<!-- Speaker note: Section 7 adds a second pointer per node, in exchange for being able to walk in both directions. -->

---

# A question to start

A singly list can only walk **forward**.
What has to change to walk backward too?

<!-- Speaker note: The answer is almost too obvious once it's said out loud — but it changes how every operation has to be written. -->

---

# Intuition — a two-way street

- Singly list: a one-way street, forward only
- Doubly list: a two-way street, both directions
- Every node carries **two** signs: `next` and `prev`
- Turning around costs nothing extra — just follow `prev`

<!-- Speaker note: The extra pointer is not free, though — it is one more field to keep correct on every single insert and delete. -->

---

# `insert_after`: four pointers to fix, not two

- Singly list's `insert_after`: fix 2 pointers
- Doubly list: also fix the **new** node's `prev`
- And the **old next**'s `prev`, if it exists
- If `cur` was the `tail`, update `list->tail` too

<!-- Speaker note: Every pointer that used to skip over the insertion point now has a matching pointer coming back the other way — both need fixing. -->

---

# Doubly-list insertion, step by step

<iframe class="dsanim" src="anim/doubly-linked-list.html?yer=slayt&lang=en" title="Doubly linked list: insert"></iframe>

<!-- Speaker note: Watch the two arrows on every node — next curving above the row, prev curving below — updated together, never just one. -->

---

# Edge case — inserting right after the tail

<iframe class="dsanim" src="anim/doubly-linked-list.html?yer=slayt&lang=en&example=insert-after-tail" title="Doubly insert: after the tail"></iframe>

<!-- Speaker note: Inserting after the current tail means the new node becomes the new tail — list->tail itself has to be updated, not just a next pointer. -->

---

# Code — `insert_after()`

```c
bool insert_after(List *list, int target, int v) {
    for (Node *cur = list->head; cur; cur = cur->next) {
        if (cur->data == target) {
            Node *n = malloc(sizeof(Node));
            n->data = v; n->prev = cur; n->next = cur->next;
            if (cur->next) cur->next->prev = n;
            else list->tail = n;   /* cur was the tail */
            cur->next = n;
            return true;
        }
    }
    return false;
}
```

<!-- Speaker note: Four pointer writes in total: the new node's own prev and next, the old next's prev (or list->tail), and cur's next. -->

---

# Code — `delete_value()`: no scan for `prev`

```c
bool delete_value(List *list, int value) {
    for (Node *cur = list->head; cur; cur = cur->next) {
        if (cur->data == value) {
            if (cur->prev) cur->prev->next = cur->next;
            else list->head = cur->next;
            if (cur->next) cur->next->prev = cur->prev;
            else list->tail = cur->prev;
            free(cur);
            return true;
        }
    }
    return false;
}
```

<!-- Speaker note: cur->prev is read directly here — the singly version had to track a separate prev variable by hand while scanning. -->

---

# Complexity and common mistakes

- Finding the target: **O(n)**, same as singly
- Relinking, once found: **O(1)** either direction
- Mistake: forgetting to update `tail` after the tail moves
- Mistake: skipping the new node's `prev` link

<!-- Speaker note: The search cost never improves with a second pointer — only the relinking step, and the ability to walk backward, changes. -->

---

# Mini-quiz

Why does a doubly list's `delete_value`
need **no** separate `prev`-tracking variable,
unlike the singly version?

<!-- Speaker note: Point back to the delete_value code slide before the answer. -->

---

# Answer

**Every node already stores its own `prev`.**
The singly version had to track `prev` by
hand while scanning; the doubly version just
reads `cur->prev` directly.

<!-- Speaker note: That stored prev field is the entire reason doubly lists exist — everything else follows from having it available at every node. -->

---

<!-- _class: bolum -->

# 8. Circular Lists and the Josephus Problem

<!-- Speaker note: Section 8 removes NULL entirely — the list wraps around instead of ending — and uses that shape to solve a very old puzzle. -->

---

# A question to start

What if the **last** node's `next` pointed
back at the first node, instead of `NULL`?

<!-- Speaker note: There is no obvious reason not to try this — and it turns out to be exactly what the Josephus problem needs. -->

---

# Intuition — people seated in a circle

- No "first" seat and no "last" seat, really
- Walk far enough and you are back where you started
- A circular list has no `NULL` to stop a walk
- Something else — a count, a condition — must stop it

<!-- Speaker note: Forgetting this is the classic circular-list bug: a loop written to stop at NULL simply never stops at all. -->

---

# One pointer, no separate `head`

- `tail` points at the last-inserted node
- `tail->next` **is** the head — no extra field
- A single node points at **itself** — a tiny loop
- Deleting needs a forward scan — there is no `prev`

<!-- Speaker note: Keeping only tail, and deriving head from tail->next, is a small but deliberate design choice this program makes. -->

---

# Circular-list operations, step by step

<iframe class="dsanim" src="anim/circular-linked-list.html?yer=slayt&lang=en" title="Circular linked list"></iframe>

<!-- Speaker note: Watch the wrap-around arrow, drawn as a curve under the row, connecting the last node straight back to the first. -->

---

# Edge case — the last node, deleted

<iframe class="dsanim" src="anim/circular-linked-list.html?yer=slayt&lang=en&example=one-node-to-empty" title="Circular list: one node to empty"></iframe>

<!-- Speaker note: A one-node circular list points at itself; deleting that single node has to leave the list genuinely empty, tail set back to NULL. -->

---

# Code — `insert_tail()`

```c
Node *insert_tail(Node *tail, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    if (tail == NULL) {
        n->next = n;       /* points at itself */
        return n;
    }
    n->next = tail->next;  /* new node -> old head */
    tail->next = n;        /* old tail -> new node */
    return n;
}
```

<!-- Speaker note: The empty-list case is special precisely because there is no head->next relationship yet to preserve — the new node has to loop back to itself. -->

---

# Complexity and common mistakes

- Insert at the tail: **O(1)**, same trick as before
- Delete by value: **O(n)** scan — no `prev` link
- Mistake: checking `cur == NULL` to stop a traversal
- A circular list needs a **step count**, not a `NULL`

<!-- Speaker note: This mistake alone causes more infinite loops than any other bug in this week's material. -->

---

# A short history

- **c. 67 CE** — Flavius Josephus, siege of Yodfat
- Legend: 41 soldiers, every 3rd one eliminated
- Josephus reportedly placed himself at the survivor's spot
- A single circular list solves the whole puzzle today

<!-- Speaker note: Whether the legend is exactly true or not, the elimination pattern it describes is precisely what this algorithm simulates. -->

---

# Every *k*-th person is eliminated

- `n` people stand in a circle, numbered 1..n
- Count `k-1` steps forward from the last survivor
- Eliminate the person you land on
- Repeat until only **one** person remains

<!-- Speaker note: Every elimination is just one bypass arrow, exactly like circular delete — the whole problem reduces to the operation just shown. -->

---

# The Josephus problem, step by step

<iframe class="dsanim" src="anim/josephus.html?yer=slayt&lang=en" title="The Josephus problem"></iframe>

<!-- Speaker note: Watch the circle shrink by exactly one node per elimination, the wrap-around arrow redrawn each time. -->

---

# Edge case — a circle of one

<iframe class="dsanim" src="anim/josephus.html?yer=slayt&lang=en&example=n-equals-1" title="Josephus: a single person"></iframe>

<!-- Speaker note: With only one person in the circle, the elimination loop's remaining > 1 condition is false immediately — nobody is ever removed. -->

---

# Code — `josephus()`

```c
int josephus(int n, int k) {
    Node *cur = head;
    int remaining = n;
    while (remaining > 1) {
        for (int s = 1; s < k; s++) {  /* k-1 steps */
            prev = cur;
            cur = cur->next;
        }
        prev->next = cur->next;   /* remove cur */
        cur = prev->next;
        remaining--;
    }
    return cur->id;                /* the survivor */
}
```

<!-- Speaker note: The inner for-loop counts exactly k-1 steps forward — the same bypass arrow from circular delete then removes whoever it lands on. -->

---

# Complexity

- Simulating directly: **O(n · k)** in the worst case
- A closed-form recurrence gives the survivor in **O(n)**
- `J(1)=0`, `J(n) = (J(n-1) + k) mod n`

<!-- Speaker note: The simulation is what the animation shows step by step; the recurrence is a shortcut to just the final answer, no circle required. -->

---

# Mini-quiz

With `k = 1`, every count is just "the next
person". Who survives a circle of 10?

<!-- Speaker note: Let the class walk through what k=1 actually means before the answer. -->

---

# Answer

**Person 10 — the last one in line.** With
`k=1` there is no skipping at all: elimination
just proceeds in plain order, 1 through 9.

<!-- Speaker note: k=1 is the simplest possible case, and a good sanity check that the general algorithm still behaves the way plain intuition expects. -->

---

<!-- _class: bolum -->

# 9. XOR Linked Lists: A Curiosity

<!-- Speaker note: Section 9 is a memory-saving trick worth knowing about, but the mistakes slide near the end is the part that matters most. -->

---

# A question to start

A doubly list spends two pointer fields
per node. Could **one** field somehow hold
both neighbors at once?

<!-- Speaker note: It sounds impossible at first — you cannot literally store two addresses in the space of one — and yet there is a trick. -->

---

# `npx = prev XOR next`

- Store **one** field: `prev`'s address XOR `next`'s address
- Arriving from a known neighbor `known`, recover the other:
- `other = npx XOR known`
- XOR quietly "cancels" the neighbor you came from

<!-- Speaker note: XOR-ing a value with itself always gives zero — that single fact is the entire trick behind this whole structure. -->

---

# XOR list traversal, step by step

<iframe class="dsanim" src="anim/xor-linked-list.html?yer=slayt&lang=en" title="XOR linked list"></iframe>

<!-- Speaker note: Watch each node's hex address and npx value on screen — the traversal literally computes the next address, live, at every step. -->

---

# Edge case — inserting at the tail of an empty list

<iframe class="dsanim" src="anim/xor-linked-list.html?yer=slayt&lang=en&example=tail-into-empty" title="XOR list: tail into an empty list"></iframe>

<!-- Speaker note: A single node in an empty list is both head and tail at once — its npx is just its one real neighbor, XOR'd with NULL. -->

---

# Code — the struct and the XOR trick

```c
typedef struct Node {
    int data;
    uintptr_t npx;   /* XOR of prev and next */
} Node;

static Node *xor_node(uintptr_t npx, Node *known) {
    return (Node *)(npx ^ (uintptr_t)known);
}
```

<!-- Speaker note: xor_node is the one helper every other function in this program calls — it is where the trick actually lives. -->

---

# Code — `traverse_forward()`

```c
void traverse_forward(Node *head) {
    Node *prev = NULL, *cur = head;
    while (cur != NULL) {
        printf(" %d", cur->data);
        Node *next = xor_node(cur->npx, prev);
        prev = cur; cur = next;
    }
}
```

<!-- Speaker note: prev starts as NULL, exactly the way an ordinary singly traversal starts — nothing else about the loop's shape has changed. -->

---

# Complexity

- Insert at head or tail: **O(1)**, same as before
- Every traversal step: one extra **XOR** — still O(1) each
- Memory saved: one pointer field per node

<!-- Speaker note: The time complexity does not actually improve over a doubly list — the entire benefit here is memory, not speed. -->

---

# Why this is a curiosity, not a habit

- C does **not** guarantee pointer↔integer round-trips this way
- `uintptr_t` casts back to a pointer are **implementation-defined**
- A garbage-collected language (Java) cannot do this at all
- Real code: use a plain doubly linked list instead

<!-- Speaker note: This is the single most important slide in this section — the trick is clever, but it is not something to actually ship. -->

---

# Mini-quiz

Why can a garbage collector never support
an XOR linked list the way C's `malloc` can?

<!-- Speaker note: Let the class connect this back to what a garbage collector actually has to do. -->

---

# Answer

**A GC needs to find every live pointer to
trace and possibly move it.** An address
hidden inside an XOR'd integer is invisible
to that scan — the GC cannot see it as a pointer.

<!-- Speaker note: Java's simulation in the demo code works around exactly this by using array indices instead of real memory addresses. -->

---

<!-- _class: bolum -->

# 10. Skip Lists

<!-- Speaker note: Section 10 asks whether a linked list can ever get binary search's O(log n), and answers yes, with one extra idea. -->

---

# A question to start

A sorted array gets binary search, O(log n).
A sorted linked list cannot jump to the
middle. Is O(log n) search possible anyway?

<!-- Speaker note: The obstacle is that a list has no index at all, so "jump to the middle" is not even a meaningful operation — yet. -->

---

# A short history

- **1990** — William Pugh, University of Maryland
- A randomized alternative to balanced search trees
- Each key gets a random "coin-flip" height
- Simpler to implement correctly than a balanced tree

<!-- Speaker note: Pugh's own selling point was exactly this: the expected performance of a balanced tree, with far less code to get right. -->

---

# Intuition — a local road and an express lane

- Level 0: the full sorted list — every key
- Level 1: an **express lane** — only some keys
- Start on the express lane; drop down when it overshoots
- Fewer stops than checking every key one by one

<!-- Speaker note: More express lanes, more levels, keep shrinking the number of stops — this demo uses just two levels to keep it visible. -->

---

# Search: go right, or drop down

- At the current level, is `cur->forward[i]->value < target`?
- Yes: step right, staying on this level
- No: **drop down** one level and try again
- Reaching level 0 and stepping once more: the answer

<!-- Speaker note: Every search starts at the highest level and works its way down, never going back up once it has dropped. -->

---

# Skip list search, step by step

<iframe class="dsanim" src="anim/skip-list.html?yer=slayt&lang=en" title="Skip list: search"></iframe>

<!-- Speaker note: Watch the search start on the express lane, drop to the full list only once it overshoots, then take one final step. -->

---

# Edge case — only one node on the express lane

<iframe class="dsanim" src="anim/skip-list.html?yer=slayt&lang=en&example=one-express-node" title="Skip list: one express node"></iframe>

<!-- Speaker note: With almost nothing on the express lane, most of the search still has to happen down at level 0. -->

---

# Code — `sl_search()`

```c
int sl_search(SkipList *sl, int value, int *cmp) {
    Node *cur = sl->header;
    for (int i = MAX_LEVEL-1; i >= 0; i--) {
        while (cur->forward[i] &&
               cur->forward[i]->value < value) {
            cur = cur->forward[i];   /* go right */
            (*cmp)++;
        }
        /* … else: drop down one level … */
    }
    cur = cur->forward[0];
    return cur && cur->value == value;
}
```

<!-- Speaker note: The outer for-loop counts levels down from the top; the inner while-loop is the only place that ever moves cur to the right. -->

---

# Complexity and common mistakes

- Enough express levels: **O(log n)** expected search
- Every key stuck at level 0 only: degrades to **O(n)**
- Mistake: stopping instead of dropping down a level
- This demo's levels are fixed, not really flipped live

<!-- Speaker note: A real implementation flips a coin for each key's level at insert time — this demo fixes the levels in advance so every run is reproducible. -->

---

# Mini-quiz

If every key in a skip list happened to
get level 1 only (no express lane at all),
what does search cost, in Big-O?

<!-- Speaker note: Let the class connect this back to what level 0 alone actually is. -->

---

# Answer

**O(n).** With no express lane, level 0 is
the only level left — search degrades to the
same linear scan as a plain linked list.

<!-- Speaker note: This is worth sitting with: a skip list's speed is never guaranteed, only expected — its worst case is exactly a plain list. -->

---

<!-- _class: bolum -->

# 11. Arrays vs. Linked Lists

<!-- Speaker note: Section 11 puts everything from today side by side, as one table, to make the trade-off explicit. -->

---

# Arrays vs. linked lists

| Operation | Array | Linked list |
| --- | --- | --- |
| Access by index | O(1) | O(n) |
| Insert/delete at front | O(n) | O(1) |
| Search by value | O(n) | O(n) |

<!-- Speaker note: Only two rows actually differ — index access and front insertion — and they differ in opposite directions. -->

---

# When to choose which

- Need `arr[k]` constantly? Arrays win outright
- Frequent front-inserts, unknown final size? Lists win
- Cache-friendly, contiguous scans? Arrays win
- Never shift existing data on insert? Lists win

<!-- Speaker note: There is no universally "better" structure here — the right choice depends entirely on which operation the program actually does most. -->

---

# Mini-quiz

You are building a stack that only ever
grows and shrinks at one end. Array or list?

<!-- Speaker note: Let the class think about which single operation a stack actually needs. -->

---

# Answer

**Either works well** — both give O(1) at
one end: a dynamic array's `append`, or a
list's `insert_head`. The real deciding
factor is whether you also need `arr[k]`.

<!-- Speaker note: Next week's stacks and queues will make this choice concrete, with real implementations built on both. -->

---

# Summary — arrays and matrices

| Idea | Key fact |
| --- | --- |
| Array insert/delete | Shifting; O(n) worst, O(1) at the end |
| Dynamic array | Doubling; O(1) **amortized** append |
| Row-major layout | `i*COLS+j`; match the walk to the layout |
| Sparse matrix | Triplets; fast transpose O(nnz+COLS) |

<!-- Speaker note: Four ideas, and every one of them is really about the same question: what has to move, and how much, when the data changes. -->

---

# Summary — linked lists

| Idea | Key fact |
| --- | --- |
| Singly list | insert_head O(1); insert_after: order matters |
| Doubly / circular | Two links; `tail->next` is the head |
| Josephus | Circular list, one bypass per elimination |
| XOR / skip list | One-field trick; randomized O(log n) |

<!-- Speaker note: Every one of these five list variants is still, underneath, just nodes and pointers — nothing here required any new kind of memory. -->

---

# The big picture

Arrays trade flexible insertion for O(1)
indexing; linked lists trade indexing for
O(1) insertion anywhere you already are.
Every structure this week picks one side
of that same trade-off.

<!-- Speaker note: If a student remembers only one sentence from today, this is the one worth remembering. -->

---

# Self-check round

Four short questions. Think before the
answer appears on the next slide. Full
exercises are in the week notes.

<!-- Speaker note: These mirror the self-check quiz at the end of the written notes, one question per slide, with a shorter set here. -->

---

# 1. Inserting at index 0 in a 20-element array: how many elements move?

<!-- Speaker note: Ask, wait, then advance. -->

---

# All 20 — the entire array shifts right by one slot.

<!-- Speaker note: The same worst case from the very first mini-quiz of the day, just with a bigger array. -->

---

# 2. Why is a dynamic array's append still called O(1), if growing costs O(n)?

<!-- Speaker note: Recall the amortized-cost argument from section 1. -->

---

# The O(n) growth is rare, and its cost **amortizes**: averaged over n appends, the total stays under 2n.

<!-- Speaker note: Amortized is an average over many operations, never a promise about any single one of them. -->

---

# 3. In `insert_after`, why must `n->next = prev->next` happen before `prev->next = n`?

<!-- Speaker note: Recall the order-swap edge case from section 6. -->

---

# Reversed, `prev->next` already equals `n` by the time step one reads it — the new node ends up pointing at itself.

<!-- Speaker note: A self-loop like that silently cuts off everything that used to follow prev in the list. -->

---

# 4. Why does a skip list's search cost degrade to O(n) with no express lane?

<!-- Speaker note: Recall the last mini-quiz of section 10. -->

---

# With no upper level, level 0 is the only level left — search becomes the same one-key-at-a-time walk as a plain linked list.

<!-- Speaker note: A skip list's speed always depends on how many express levels actually exist above level 0. -->

---

<!-- _class: baslik -->

# Next week

**Week 3 — Stacks and Queues**

LIFO and FIFO built directly on the array
and linked-list tools from this week — the
same nodes, the same shifting array, now
disciplined into one entry/exit point.

<!-- Speaker note: Every stack and queue next week is built from exactly one of today's two structures, with the operations simply restricted to one end. -->

---

# References (1/2)

- Course syllabus, Week 2: `docs/syllabus/syllabus.en.md`
- Cormen, Leiserson, Rivest, Stein. *Introduction to
  Algorithms*, 4th ed. MIT Press
- Sedgewick, Wayne. *Algorithms*, 4th ed. Addison-Wesley
- Knuth. *The Art of Computer Programming, Vol. 1*, 3rd ed.

<!-- Speaker note: These are the same references listed at the end of the week's written notes. -->

---

# References (2/2)

- Pugh (1990) — skip lists
- McCarthy (1956) — Lisp cons cells
- Flavius Josephus, *The Jewish War* — the elimination problem
- williamfiset/Algorithms · Programiz DSA

<!-- Speaker note: The historical references — Pugh, McCarthy, Josephus — are what today's "short history" slides drew on. -->
