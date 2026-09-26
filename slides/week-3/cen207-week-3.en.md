---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 3 — Stacks and Queues"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 3"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Stacks and Queues

**CEN207 Data Structures — Week 3**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!--
Speaker note: Today we meet the two oldest, most-used linear structures in computing. Stack = touch one end only. Queue = add at one end, remove at the other. That single rule change explains everything that follows.
-->

---

# Today's plan (3 hours)

| Hour | Topic |
| --- | --- |
| 1 | Stack ADT · array stack · overflow **Anim 1–2** · linked stack **Anim 3** |
| 2 | Stack apps: brackets, postfix, prefix, infix **Anim 4–8** · recursion **Anim 9–10** |
| 3 | Hanoi **Anim 11** · queue variants **Anim 12–16** · self-check |

**Learning outcomes:** LO.1 (explain fundamental data structures) · LO.7 (choose the right structure)

<!-- Speaker note: Sixteen short animations carry the whole lecture; each appears once, exactly where its idea is introduced. -->

---

# This week's concepts — where

| Concept | Where |
| --- | --- |
| Stack ADT, LIFO, push/pop | Section 1 |
| Expression algorithms (postfix, infix) | Section 2 |
| Recursion, call stack, Tower of Hanoi | Sections 3–4 |
| Queue ADT, FIFO, circular queue, deque | Section 5 |

<!-- Speaker note: Every term gets a full definition the first time it appears; this table just says where to find it again. -->

---

# How the code examples work

- Every idea has a complete **C** and **Java** program
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Sources: `code/week-03/c/` and `code/week-03/java/`
- Each program's expected output is in the week notes

<!-- Speaker note: Open a terminal now if you want to run these live; every snippet on today's slides compiles and runs exactly as shown. -->

---

# Bridge from Weeks 1–2

- Weeks 1–2 gave you two tools: **pointers/memory** and the **linked list**
- This week reuses both, constantly, in new shapes
- New idea this week: restricting *where* you may touch a structure

<!-- Speaker note: Nothing new about memory is needed today — only new rules about which end of it you are allowed to touch. -->

---

# Recap — Week 1: pointers and memory

- `int *p` holds an **address**, not a number
- `malloc` asks the OS for a box; `free` gives it back
- Forgetting `free` → **memory leak**
- Using memory after `free` → **dangling pointer**

<!-- Speaker note: We will do both malloc and free again today, and point out exactly where a forgotten free would bite. -->

---

# Recap — Week 2: linked lists

- A linked list is a chain of **nodes**
- Each node: a value + a pointer to the next node
- Adding/removing rewires a couple of pointers — no shifting
- Today's linked stack/queue reuse this idea exactly

<!-- Speaker note: The only new part today is restricting which end(s) of the chain you are allowed to touch. -->

---

# Map of the week — the one rule

- Both stacks and queues are **linear** structures
- A **stack** lets you touch only **one** end
- A **queue** makes you add at one end, remove at the other
- That single rule change decides what each is good for

<!-- Speaker note: Ask the class: which end of a queue do the ones who arrived first sit at? The front — and that is the whole idea. -->

---

# Map of the week — at a glance

| Stack topics | Queue topics |
| --- | --- |
| Array stack, linked stack | Array queue, circular queue |
| Brackets, postfix, infix | Linked-list queue |
| Recursion, call stack | Deque, multilevel queue |
| Tower of Hanoi | — |

<!-- Speaker note: Every box on this map gets its own slides below, most with a short animation and a complete C/Java program. -->

---

<!-- _class: bolum -->

# 1. The Stack: Last In, First Out

<!-- Speaker note: Section 1 builds the stack from scratch: an array version, then a linked version, both with the same tiny interface. -->

---

# A question to start

Visit three web pages, then click **Back** three times.

You land on page 2, then page 1, then nowhere.
The *last* page visited is the *first* one revisited.

<!-- Speaker note: Ask: how would you build that "history" feature with only an array or a linked list? The answer is coming. -->

---

# A short history

- Late 1950s: "stack", "push", "pop" already in CS literature
- **1957** — Bauer & Samelson (Munich) patent a hardware stack
- **1946** — Turing used a similar idea in the ACE computer
- One of the oldest ideas in computing — still in every program

<!-- Speaker note: Every function call your computer makes right now still uses a hardware/software stack, exactly like these early machines did. -->

---

# Intuition — a stack of plates

- Take a plate only from the **top**
- Add a plate only to the **top**
- Cannot reach the middle without removing everything above it
- Last plate placed is the first one removed — **LIFO**

<!-- Speaker note: LIFO = Last In, First Out. Keep this cafeteria picture in mind for every operation today. -->

---

# Three operations

- **push** — put a new element on top
- **pop** — remove and return the top element
- **peek** (or `top`) — look at the top without removing it
- All three touch only **one end**

<!-- Speaker note: These three short names are standard across every language and textbook; learn them now, they never change. -->

---

# The Stack ADT

| Operation | What it does | Precondition | Complexity |
| --- | --- | --- | --- |
| `push(x)` | Add `x` on top | not full (array) | O(1) |
| `pop()` | Remove/return top | not empty | O(1) |
| `peek()` | Return top, keep it | not empty | O(1) |
| `isEmpty()` | zero elements? | none | O(1) |

<!-- Speaker note: An ADT describes what a structure does, not how — this table holds whether it is built from an array or a linked list. -->

---

# Array stack — the idea

- Reserve a fixed-size array `data[CAP]`
- Keep one integer, `top`: index of the topmost slot
- Empty stack: `top == -1` — "no top yet"
- `push`: `top++`, write; `pop`: read, `top--`

<!-- Speaker note: Nothing else in memory ever moves — only the single integer top changes. -->

---

# Array stack: push and pop

<iframe class="dsanim" src="anim/array-stack-push-pop.html?yer=slayt&lang=en" title="Array stack: push and pop"></iframe>

<!-- Speaker note: Normal example: 10 pushes (12, 7, 25, 3, 18, 9, 30, 14, 5, 21), then 4 pops — watch top and the array update one step at a time. -->

---

# Code — push()

```c
bool push(int x) {
    if (top == CAP - 1) return false;
    top = top + 1;
    data[top] = x;
    return true;
}
```

<!-- Speaker note: Check first, refuse if full, then two writes — top moves, the value lands. Two steps, always. -->

---

# Code — pop()

```c
bool pop(int *out) {
    if (top == -1) return false;
    *out = data[top];
    top = top - 1;
    return true;
}
```

<!-- Speaker note: Same shape as push, mirrored: check empty, read the top slot, move top down. -->

---

# Expected output

```text
push(12) -> true   [top = 0]
push(21) -> true   [top = 9]
pop()    -> 21     [top = 8]
pop()    -> 5      [top = 7]
pop()    -> 14     [top = 6]
pop()    -> 30     [top = 5]
```

<!-- Speaker note: Last pushed (21) comes back first, then 5, 14, 30 — last in, first out. -->

---

# Why every operation is O(1)

- `push`/`pop` do a **fixed number of steps**
- One condition check, one move of `top`, one array access
- True whether the stack holds 1 element or a million
- No loop ever touches the other elements

<!-- Speaker note: This constant-time guarantee is the entire point of a stack — reaching the middle needs a different structure. -->

---

# Overflow and underflow — the question

An array has a **fixed size**. What happens when
you `push` a full stack, or `pop` an empty one?

A correct stack must **check first and refuse**.

<!-- Speaker note: Writing outside array bounds in C does not raise a friendly error — it corrupts nearby memory silently. -->

---

# Stack overflow and underflow

<iframe class="dsanim" src="anim/stack-overflow-underflow.html?yer=slayt&lang=en" title="Stack overflow and underflow"></iframe>

<!-- Speaker note: A 10-slot stack takes 11 pushes (overflow on the last one), then 13 pops (underflow after draining) — watch both checks fire. -->

---

# Common mistakes (array stack)

- Checking `top == CAP`, not `top == CAP - 1`
- Popping without checking `isEmpty` first
- Ignoring the `bool` return value of `push`

<!-- Speaker note: Valid indices run 0..CAP-1, so the stack is full the moment top reaches CAP-1, not one step later. -->

---

# Quick question

Why is `top = -1` a better choice for "empty"
than, say, `top = 0`?

<!-- Speaker note: Let the class answer before revealing — index 0 is a real, valid slot. -->

---

# Answer

Index `0` is a **valid slot**. If `top = 0` meant
"empty", you could not tell an empty stack from
one holding a single element at index 0.

<!-- Speaker note: -1 is not a valid index, so it can only ever mean "no elements". -->

---

# A stack that never overflows

- Array stack has a hard ceiling: `CAP`
- **Linked-list stack**: every element is its own node
- `top` is now a **pointer**, not an index
- `push` allocates; `pop` frees

<!-- Speaker note: Exactly the same node-and-pointer idea from Week 2, restricted to touching one end. -->

---

# Linked-list stack: push and pop

<iframe class="dsanim" src="anim/linked-stack-push-pop.html?yer=slayt&lang=en" title="Linked-list stack: push and pop"></iframe>

<!-- Speaker note: Watch malloc create a node, then three pointer rewrites move top — no capacity limit anywhere. -->

---

# Code — struct Node + push()

```c
typedef struct Node {
    int data;
    struct Node *next;
} Node;
Node *top = NULL;

void push(int x) {
    Node *n = malloc(sizeof(Node));
    n->data = x;
    n->next = top;
    top = n;
}
```

<!-- Speaker note: New node points at the old top, then top moves to the new node — three assignments, always. -->

---

# Code — pop()

```c
bool pop(int *out) {
    if (top == NULL) return false;
    Node *tmp = top;
    *out = tmp->data;
    top = top->next;
    free(tmp);
    return true;
}
```

<!-- Speaker note: tmp holds the old top just long enough to read its value and free it after top has already moved on. -->

---

# Why push is still O(1)

- `malloc` for **one fixed-size node** is constant time
- Does not depend on how many nodes already exist
- No loop over existing elements
- Cost: one pointer (`next`) per node vs. array's zero

<!-- Speaker note: The trade for unlimited capacity is a little extra memory per element and worse cache locality. -->

---

# Common mistakes (linked stack)

- Forgetting `free(tmp)` in `pop` — slow memory leak
- Using a pointer after `free`ing it — undefined behavior
- Java: holding an old reference blocks garbage collection

<!-- Speaker note: free(tmp); return tmp->data; reads memory already given back — sometimes it "works", sometimes it crashes. -->

---

# Array vs. linked-list stack

| | Array stack | Linked stack |
| --- | --- | --- |
| Capacity | Fixed, can overflow | Limited by memory |
| Extra memory | None | One pointer/node |
| Cache behavior | Contiguous, fast | Scattered, slower |

<!-- Speaker note: Both push and pop are O(1) either way; the difference is capacity and memory locality, not speed class. -->

---

# Quick question

`CAP = 8`. After 5 pushes and 2 pops, what is `top`?

<!-- Speaker note: Each push adds 1 to top, each pop subtracts 1 — do the arithmetic together. -->

---

# Answer

`-1 + 5 - 2 = 2`. Three elements remain
(indices 0, 1, 2), and `top == 2`.

<!-- Speaker note: This is exactly the bookkeeping the push/pop code we just read performs, one step at a time. -->

---

<!-- _class: bolum -->

# 2. Stack Applications: Expressions

<!-- Speaker note: Three classic algorithms, all built on the same tiny stack interface: check brackets, evaluate postfix, convert infix to postfix. -->

---

# Infix is awkward for computers

- `A + B * C` — is `*` computed before `+`? Needs **precedence**
- Two other notations move the operator so no
  precedence rule is ever needed at evaluation time

<!-- Speaker note: Ask the class to compute A + B * C by hand — everyone silently applies precedence without noticing. -->

---

# A short history

- 1920s — Polish logician **Jan Łukasiewicz** introduces
  prefix ("Polish") and postfix ("Reverse Polish") notation
- Famous via **HP calculators**: no parenthesis keys needed
- Evaluated by a small stack machine — what you build next

<!-- Speaker note: RPN calculators are still sold today; the algorithm on the next slides is exactly what runs inside them. -->

---

# Three notations

| Notation | Operator position | `A + B * C` |
| --- | --- | --- |
| Infix | Between operands | `A + B * C` |
| Postfix (RPN) | After both operands | `A B C * +` |
| Prefix (Polish) | Before both operands | `+ A * B C` |

<!-- Speaker note: Postfix and prefix need no parentheses and no precedence table at evaluation time — that work was already done once. -->

---

# Balanced brackets — the question

Is `{([])(]}` validly nested?

Every closer must match the **most recently
opened** bracket that is still open.

<!-- Speaker note: "Most recently opened" should immediately make everyone think of a stack — that phrase is the whole algorithm. -->

---

# The rule

- Scan the string once
- Every **opener**: push it
- Every **closer**: pop, and it must match
- If empty stack when a closer arrives → unbalanced
- If the stack is not empty at the end → unbalanced

<!-- Speaker note: Three distinct ways to fail; a correct checker must catch all three, not just the first. -->

---

# Checking brackets with a stack

<iframe class="dsanim" src="anim/bracket-matching.html?yer=slayt&lang=en" title="Checking brackets with a stack"></iframe>

<!-- Speaker note: Watch the mismatch: a `]` arrives while `(` sits on top — no match, reject immediately. -->

---

# Code — matches()

```c
static bool matches(char open, char close) {
    return (open == '(' && close == ')') ||
           (open == '[' && close == ']') ||
           (open == '{' && close == '}');
}
```

<!-- Speaker note: A tiny helper: does this closing bracket pair with this opening bracket? -->

---

# Code — balanced()

```c
bool balanced(const char *s) {
    char st[100]; int top = -1;
    for (int i = 0; s[i] != '\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            st[++top] = c;
        } else if (c == ')' || c == ']' || c == '}') {
            if (top == -1) return false;
            char o = st[top--];
            if (!matches(o, c)) return false;
        }
    }
    return top == -1;
}
```

<!-- Speaker note: The very last line is the one people forget: the string can end with unmatched openers still on the stack. -->

---

# Complexity

Each character is looked at **exactly once**,
each stack op is O(1) → `balanced` runs in **O(n)**.

Worst-case space: O(n) — a string of all openers.

<!-- Speaker note: One pass, one stack, done — this is the shape almost every stack algorithm today will take. -->

---

# Pitfall — three ways to be unbalanced

1. Closer arrives, top does not match — `(]`
2. Closer arrives, stack already empty — `)`
3. String ends, stack **not** empty — `(()`

<!-- Speaker note: A common bug: checking only case 1 and forgetting the final `return top == -1;`. -->

---

# Quick question

Is `((A+B)` accepted by `balanced`? Why or why not?

<!-- Speaker note: One unmatched opening parenthesis — walk through what the stack looks like at the very end. -->

---

# Answer

No. Every `(` is pushed, and the string ends
with the stack still holding one — `top == -1`
is false, so `balanced` correctly returns false.

<!-- Speaker note: This is exactly failure case 3 from the previous slide. -->

---

# Postfix evaluation — the question

`5 3 + 8 2 - * 6 + 12 -` should evaluate to
`(5+3)*(8-2) = 48`, `48+6 = 54`, `54-12 = 42`.

No precedence rules needed at all — just a scan.

<!-- Speaker note: Ask the class to predict the result before the animation runs. -->

---

# Evaluating a postfix expression

<iframe class="dsanim" src="anim/postfix-evaluation.html?yer=slayt&lang=en" title="Evaluating a postfix expression"></iframe>

<!-- Speaker note: Every number is pushed; every operator pops two values, applies itself, and pushes the result back. -->

---

# Code — apply()

```c
static int apply(char op, int a, int b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default:  return 0;
    }
}
```

<!-- Speaker note: A small dispatcher — nothing surprising, just the four arithmetic operators. -->

---

# Code — eval_postfix()

```c
int eval_postfix(char *tok[], int n) {
    int st[100]; int top = -1;
    for (int i = 0; i < n; i++) {
        char *t = tok[i];
        if (isdigit(t[0])) {
            st[++top] = atoi(t);
        } else {
            int b = st[top--];
            int a = st[top--];
            st[++top] = apply(t[0], a, b);
        }
    }
    return st[top];
}
```

<!-- Speaker note: b comes off first (right operand), a second (left operand) — order matters for minus and divide. -->

---

# Complexity

**O(n)** in the number of tokens: each token
is pushed at most once and popped at most once.

<!-- Speaker note: Calculators and compilers evaluate expressions exactly this way, in real time, on huge inputs. -->

---

# Pitfall — operand order matters

`8 2 -` means `8 - 2`. First popped (`b`) is the
**right** operand; second popped (`a`) is the **left**.
Swap them and you compute `2 - 8` instead.

<!-- Speaker note: This is the single most common bug students write in this algorithm. -->

---

# Quick question

Why does `eval_postfix` need only **one** stack,
while `to_postfix` (coming next) needs a
second output area too?

<!-- Speaker note: Think about what each algorithm is actually producing at the end. -->

---

# Answer

Evaluation **collapses** two operands and an
operator into one number immediately — nothing
extra to remember. Conversion only **reorders**
symbols, so it needs a place to collect them.

<!-- Speaker note: This distinction — collapsing values vs. reordering symbols — is worth restating slowly. -->

---

# Evaluating a prefix expression

- Operator comes **before** its operands: `+ A B`
- Same idea as postfix, scanned **right to left**
- First value popped is now the **left** operand

<!-- Speaker note: Prefix is the mirror image of postfix in every respect — direction of scan, and which operand comes off first. -->

---

# Evaluating a prefix expression

<iframe class="dsanim" src="anim/prefix-evaluation.html?yer=slayt&lang=en" title="Evaluating a prefix expression"></iframe>

<!-- Speaker note: Normal example: 11 tokens, no errors. The "hard" example actually errors out — more tokens is not automatically a valid expression. -->

---

# Prefix vs. postfix — the mirror

- Scan **right to left**, not left to right
- Pop the **left** operand first, then the right one
- Same **O(n)** complexity, same error checks (division by zero, too few/many operands)

<!-- Speaker note: Getting the pop order backwards silently breaks every non-commutative operator: minus and divide. -->

---

# Infix to postfix — the idea

- Humans write infix; our evaluator needs postfix
- **Shunting-yard algorithm** (Dijkstra) — after railway
  yards that reorder freight cars
- A second stack, holding **operators**, resolves
  precedence once, up front

<!-- Speaker note: This is the classic first "compiler-shaped" algorithm most students ever write. -->

---

# Converting infix to postfix

<iframe class="dsanim" src="anim/infix-to-postfix.html?yer=slayt&lang=en" title="Converting infix to postfix"></iframe>

<!-- Speaker note: Every operand goes straight to output; every operator first flushes stronger waiting operators, then is pushed. -->

---

# Code — prec()

```c
static int prec(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    return 0;
}
```

<!-- Speaker note: A tiny precedence table — multiply/divide bind tighter than plus/minus. -->

---

# Code — to_postfix()

```c
void to_postfix(const char *in, char *out) {
    char ops[100]; int top = -1, k = 0;
    for (int i = 0; in[i]; i++) {
        char c = in[i];
        if (isalnum(c)) { out[k++] = c; }
        else {
            while (top >= 0 && prec(ops[top]) >= prec(c))
                out[k++] = ops[top--];
            ops[++top] = c;
        }
    }
    while (top >= 0) out[k++] = ops[top--];
    out[k] = '\0';
}
```

<!-- Speaker note: The final while-loop is the "flush" step: whatever is left on the stack still has to reach the output. -->

---

# Complexity

**O(n)**: every character is pushed onto the
operator stack at most once, popped at most once.

<!-- Speaker note: Same shape, same bound, as every other stack algorithm we have seen today. -->

---

# Pitfall — three bugs here

- Using `>` instead of `>=` breaks left-associativity
- Forgetting the final flush loses trailing operators
- No parentheses support (left as a natural extension)

<!-- Speaker note: A-B-C must become (A-B)-C, which needs equal-precedence operators to also be popped first. -->

---

# Quick question

Convert `A*B+C` to postfix by hand.

<!-- Speaker note: Give the class thirty seconds, then reveal and compare to the algorithm's own trace. -->

---

# Answer

`AB*C+`. `A`→out. `*`→push. `B`→out.
`+` sees `*` (prec 2 ≥ 1): pop `*`→out, push `+`.
`C`→out. Flush `+`. Result: `A B * C +`.

<!-- Speaker note: Walk through this trace line by line if the class looks unsure. -->

---

# Converting infix to prefix

- **Reverse** the input, swapping `(` ↔ `)`
- Run shunting-yard again, but pop only when
  a waiting operator is **strictly** stronger (`>`, not `>=`)
- **Reverse** the result

<!-- Speaker note: Three already-familiar steps instead of a brand-new algorithm — that is the whole trick. -->

---

# Converting infix to prefix

<iframe class="dsanim" src="anim/infix-to-prefix.html?yer=slayt&lang=en" title="Converting infix to prefix"></iframe>

<!-- Speaker note: Same normal example as infix-to-postfix, A+B*C-D+E*F, so the two outputs can be compared side by side. -->

---

# Pitfall — strict `>`, not `>=`

- Prefix conversion pops only a **strictly stronger**
  waiting operator — using `>=` breaks the final reversal
- Forgetting to swap `(`/`)` while reversing breaks grouping

<!-- Speaker note: Compare the postfix and prefix outputs for a same-precedence chain like A+B+C+... to see the rule in action. -->

---

<!-- _class: bolum -->

# 3. Recursion and the Call Stack

<!-- Speaker note: The connection that makes recursion click: every function call, recursive or not, pushes a real stack frame. -->

---

# What is recursion — a question

`fact(n) = n * fact(n - 1)`, base case `fact(0) = 1`.

`fact(3) = 3 * (2 * (1 * fact(0))) = 6`

<!-- Speaker note: A function that calls itself on a smaller version of the same problem, until a case simple enough to answer directly. -->

---

# The base case is mandatory

- Not optional — it is what **stops** the recursion
- Without one: the function calls itself **forever**
- "Forever" really means: until memory runs out

<!-- Speaker note: We are about to meet exactly the memory structure that runs out — the call stack. -->

---

# The simplest recursion: countdown

- Print `n`, recurse on `n - 1`, until the base case
- Base case must be `n <= 0`, **not** `n == 0`
- `n = 0` or negative `n` must stop on the very first call

<!-- Speaker note: This is the smallest possible recursive function — everything about base cases shows up here first. -->

---

# Recursion: countdown

<iframe class="dsanim" src="anim/recursion-countdown.html?yer=slayt&lang=en" title="Recursion: countdown"></iframe>

<!-- Speaker note: Normal example: countdown from 10. Edge cases n=0 and n=-4 both hit the base case immediately. -->

---

# Pitfall — the wrong base case

`n == 0` only: a negative starting value **never**
satisfies it — infinite recursion. `n <= 0` fixes it:
negative input stops on the very first call.

<!-- Speaker note: This is the exact bug that turned "countdown from -4" into an infinite loop before the fix. -->

---

# The call stack: recursion is a stack

- Every function call pushes a **frame**:
  local variables + the return address
- Returning from a function **pops** that frame
- This is a genuine **LIFO stack**, built into every
  running program, whether you write one or not

<!-- Speaker note: You have been using a stack every time you called a function — you just could not see it until today. -->

---

# Recursion and the call stack: fact(n)

<iframe class="dsanim" src="anim/recursion-call-stack.html?yer=slayt&lang=en" title="Recursion and the call stack: fact(n)"></iframe>

<!-- Speaker note: Normal example: fact(10), 10 frames deep — each waits on the next, then frames unwind in reverse order. -->

---

# Code — fact()

```c
int fact(int n) {
    if (n == 0) return 1;
    return n * fact(n - 1);
}
```

<!-- Speaker note: Two lines: a base case that stops the recursion, and a recursive call on a strictly smaller problem. -->

---

# Expected output

```text
fact(10) = 3628800
```

<!-- Speaker note: Small output, but the call-stack machinery behind it is the real subject of this section. -->

---

# Complexity

`fact(n)` makes `n` recursive calls: **O(n) time**,
and — easy to forget — **O(n) stack space**,
one frame per pending call.

A loop computing the same product uses O(1) space.

<!-- Speaker note: Recursion often reads more clearly than a loop, but it is never free of memory cost. -->

---

# Pitfall — silent `int` overflow

`13! = 6227020800` — too big for a 32-bit `int`
(max `2147483647`). The program does **not** crash;
it silently wraps to `1932053504`.

<!-- Speaker note: This is why the "hard" example in the picker stops at 12 — one call short of the overflow. -->

---

# Pitfall — missing base case

Without a reachable base case, a recursive
function pushes a **new frame every call**,
forever — until the call stack itself overflows.

<!-- Speaker note: This crash has a name you already know from Section 1: stack overflow — just applied to the call stack instead. -->

---

# Pitfall — a problem that doesn't shrink

`fact(n)` calls itself with `n - 1`, strictly
smaller. Every recursive call **must** move
measurably closer to the base case.

<!-- Speaker note: Decrementing by 2 from an odd starting n that expects to hit 0 is a classic version of this bug. -->

---

# Quick question

`fact(3)` is the original call. How many frames
sit on the call stack the instant `fact(0)` starts?

<!-- Speaker note: Count them together: fact(3), fact(2), fact(1), fact(0). -->

---

# Answer

**Four**: `fact(3)`, `fact(2)`, `fact(1)`, `fact(0)`,
each still waiting for the one below it to return.

<!-- Speaker note: None of these frames have returned yet — that is exactly why they are still on the stack. -->

---

# Quick question

If the base case were `if (n == 1) return 1;`
and someone called `fact(-1)`, what happens?

<!-- Speaker note: -1 never equals 1 on the way down through -2, -3, -4... -->

---

# Answer

`-1` never equals `1`; the function recurses on
`-2, -3, -4, ...` forever, eventually
**overflowing the call stack**.

<!-- Speaker note: A wrong base-case condition is just as dangerous as a missing one. -->

---

<!-- _class: bolum -->

# 4. The Tower of Hanoi

<!-- Speaker note: The standard first example of a problem that is easy to solve recursively yet fundamentally exponential. -->

---

# The puzzle

- Three rods; disks stacked large-to-small on rod A
- Move the whole stack to rod C, one disk at a time
- Never place a larger disk on a smaller one
- Invented by **Édouard Lucas**, 1883 (monks legend)

<!-- Speaker note: The legend: monks moving 64 golden disks, and the world ends when they finish. Not a bad time estimate, as we'll see. -->

---

# The recursive idea

To move `n` disks from `from` to `to`, via `via`:

1. Move top `n - 1` disks to `via`
2. Move the largest disk to `to`
3. Move the `n - 1` disks from `via` onto it

<!-- Speaker note: Steps 1 and 3 are the same problem, just smaller, with the rods relabeled — a perfect recursion. -->

---

# Tower of Hanoi

<iframe class="dsanim" src="anim/tower-of-hanoi.html?yer=slayt&lang=en" title="Tower of Hanoi"></iframe>

<!-- Speaker note: Normal example: 4 disks, 15 moves. No explicit stack needed in the code — the call stack itself remembers "from, to, via". -->

---

# Code — hanoi()

```c
void hanoi(int n, char from, char to, char via) {
    if (n == 0) return;
    hanoi(n - 1, from, via, to);
    move_disk(n, from, to);
    hanoi(n - 1, via, to, from);
}
```

<!-- Speaker note: Four lines, and the recursion structure is identical in spirit to fact() — smaller problem, act, smaller problem. -->

---

# Expected output

```text
move 1: disk 1 from A to B
move 2: disk 2 from A to C
move 3: disk 1 from B to C
move 4: disk 3 from A to B
...
total moves = 15
```

<!-- Speaker note: Fifteen moves for four disks — we will see exactly why that number in a moment. -->

---

# Complexity

`T(n) = 2*T(n-1) + 1`, `T(0) = 0`
→ `T(n) = 2ⁿ - 1` — **exponential** growth.

`n = 4`: `2⁴ - 1 = 15`, matching the program above.

<!-- Speaker note: No implementation trick fixes exponential growth — only a smaller n does. -->

---

# The legend's 64 disks

`2⁶⁴ - 1 ≈ 1.8 × 10¹⁹` moves.

At one move per second: **~585 billion years** —
tens of times the current age of the universe.

<!-- Speaker note: The monks' prophecy about the world ending was, in a sense, a reasonable time estimate. -->

---

# Looking further ahead

"Solve a smaller version, then combine" is exactly
how **depth-first search (DFS)** explores a tree or
graph, coming in the next two weeks.

<!-- Speaker note: The call stack that tracked "from, to, via" here is the same call stack DFS will use to track "where to backtrack". -->

---

# Quick question

How many moves does a 5-disk Tower of Hanoi need?

<!-- Speaker note: Apply the formula from two slides ago. -->

---

# Answer

`2⁵ - 1 = 31` moves.

<!-- Speaker note: Doubling the disks by one adds roughly double the moves, minus one. -->

---

# Quick question

In `hanoi(n - 1, from, via, to)`, why are the
last two arguments swapped vs. the outer call?

<!-- Speaker note: Think about what the "destination" and "spare" are for the smaller sub-problem. -->

---

# Answer

For moving the top `n - 1` disks out of the way,
the *destination* is the spare rod, and the
*spare* is the original destination — roles
rotate at every level of recursion.

<!-- Speaker note: This rotation is the part students find hardest to trace by hand — the animation makes it visible. -->

---

<!-- _class: bolum -->

# 5. The Queue: First In, First Out

<!-- Speaker note: The mirror image of the stack: same two operations, opposite ends, different name — FIFO instead of LIFO. -->

---

# Intuition — a waiting line

- A checkout line, a print queue, a web request queue
- New arrivals join at the **back**
- The longest-waiting item leaves from the **front**

<!-- Speaker note: Ask: who leaves the supermarket line first — the newest arrival, or the one who has waited longest? -->

---

# FIFO — the mirror of LIFO

**First In, First Out.** Same two underlying
operations as a stack, different names, and
now they touch **different ends**.

<!-- Speaker note: Stack: one end. Queue: two ends, one for each operation — that is the entire conceptual jump. -->

---

# The Queue ADT

| Operation | What it does | Precondition | Complexity |
| --- | --- | --- | --- |
| `enqueue(x)` | Add at the back | not full (array) | O(1) |
| `dequeue()` | Remove/return front | not empty | O(1) |
| `peek()` | Return front, keep it | not empty | O(1) |
| `isEmpty()` | zero elements? | none | O(1) |

<!-- Speaker note: We will build this ADT three different ways, each with its own trade-off. -->

---

# Array queue — the idea

- Keep two indices: `front` (oldest) and `rear` (newest)
- `enqueue`: advance `rear`, write there
- `dequeue`: read at `front`, advance `front`
- No elements shifted — but watch the space at index 0

<!-- Speaker note: Something goes wrong with the unused space at the front as elements are dequeued — the animation shows it. -->

---

# Queue in a plain array

<iframe class="dsanim" src="anim/array-queue-drift.html?yer=slayt&lang=en" title="Queue in a plain array and the drift problem"></iframe>

<!-- Speaker note: Normal example: fill 8 cells, remove 3, then two more enqueues still fail — front never reuses the cells dequeue frees. -->

---

# Code — enqueue()/dequeue() (naive)

```c
bool enqueue(int x) {
    if (rear == CAP - 1) return false;
    q[++rear] = x;
    return true;
}

bool dequeue(int *out) {
    if (front > rear) return false;
    *out = q[front++];
    return true;
}
```

<!-- Speaker note: Simple and O(1), but rear never comes back, no matter how many cells dequeue frees near the front. -->

---

# Expected output

```text
enqueue(5,12,7,19,3,27,14,8): front=0, rear=7
dequeue() x3:    front=3, rear=7
enqueue(99) -> false
enqueue(42) -> false
```

<!-- Speaker note: Cells 0, 1, 2 are empty, yet the queue insists it is full — that is the drift problem. -->

---

# Pitfall — the drift problem

`rear` only ever moves **forward**. The queue
reports "full" while cells sit empty at the
front — it has **drifted** off the array.

<!-- Speaker note: Shifting every element after each dequeue would fix it, but turns O(1) dequeues into O(n) — not acceptable. -->

---

# Quick question

Why does this queue say "full" even with
three empty cells at the beginning?

<!-- Speaker note: Look again at what enqueue actually checks. -->

---

# Answer

`enqueue` only checks `rear == CAP - 1`; it never
looks at whether cells before `front` are free.
The real fix is next: think of the array as a **ring**.

<!-- Speaker note: This sets up the circular queue perfectly. -->

---

# The circular queue — think ring

- After the last index comes the first one again
- `(index + 1) % CAP` walks forward, wraps around
- `front == rear` is now ambiguous (empty? full?)
- Keep one more field, `count`, to resolve it

<!-- Speaker note: The wasted space was only wasted because we were thinking of the array as a straight line. -->

---

# Circular queue

<iframe class="dsanim" src="anim/circular-queue.html?yer=slayt&lang=en" title="Circular queue"></iframe>

<!-- Speaker note: Normal example: 10-cell ring, moderate mixing, one wrap-around — watch rear reuse the cells dequeue freed at the front. -->

---

# Code — enqueue() (circular)

```c
bool enqueue(int x) {
    if (count == CAP) return false;
    rear = (rear + 1) % CAP;
    q[rear] = x;
    count++;
    return true;
}
```

<!-- Speaker note: The only change from the naive version: rear wraps with modulo, and count tracks true fullness. -->

---

# Code — dequeue() (circular)

```c
bool dequeue(int *out) {
    if (count == 0) return false;
    *out = q[front];
    front = (front + 1) % CAP;
    count--;
    return true;
}
```

<!-- Speaker note: Same mirror shape as enqueue — front also wraps with modulo now. -->

---

# Why we also need `count`

`front == rear` could mean "one element",
"empty", **or** "completely full" — a plain
index comparison can no longer tell these apart.

<!-- Speaker note: count resolves the ambiguity directly instead of relying on clever index tricks. -->

---

# Complexity — still O(1), no drift

All five cells are used before the queue reports
"full". The drift problem is completely gone,
and every operation is still **O(1)**.

<!-- Speaker note: This is the queue implementation you would actually use in a real bounded buffer. -->

---

# Common mistakes (circular queue)

- Using `front == rear` alone to mean "empty"
- Forgetting the modulo on **one** of the two indices
- Either mistake corrupts the ring after one wrap

<!-- Speaker note: If only rear wraps and not front, the ring breaks silently after the first wrap-around. -->

---

# Quick question

After `count` reaches `CAP`, what does
`front == rear` mean now, vs. when empty?

<!-- Speaker note: Both "just became empty" and "just became full" can show front == rear. -->

---

# Answer

Both states can show `front == rear`; **`count`**
is exactly what tells them apart, since the
indices alone are ambiguous.

<!-- Speaker note: This is why count is not optional bookkeeping — it is the only thing resolving the ambiguity. -->

---

# A queue that never overflows

- Linked-list queue: one node per element, no `CAP`
- Needs **two** pointers: `front` (remove),
  `rear` (add) — so both stay O(1)
- Without `rear`, `enqueue` would walk the whole list

<!-- Speaker note: Same overflow-removal trade as the linked stack, but this time we need a pointer to each end. -->

---

# Linked-list queue

<iframe class="dsanim" src="anim/linked-queue.html?yer=slayt&lang=en" title="Linked-list queue"></iframe>

<!-- Speaker note: With one node, front and rear point to the same node — watch that special case at the very start. -->

---

# Code — enqueue() (linked)

```c
void enqueue(int x) {
    QNode *n = malloc(sizeof(QNode));
    n->data = x; n->next = NULL;
    if (rear == NULL) {
        front = rear = n;
    } else {
        rear->next = n;
        rear = n;
    }
}
```

<!-- Speaker note: The empty-queue case sets both pointers to the new node; otherwise only rear moves. -->

---

# Code — dequeue() (linked)

```c
bool dequeue(int *out) {
    if (front == NULL) return false;
    QNode *tmp = front;
    *out = tmp->data;
    front = front->next;
    if (front == NULL) rear = NULL;
    free(tmp);
    return true;
}
```

<!-- Speaker note: If the queue just became empty, rear must also be reset to NULL, or the next enqueue writes through garbage. -->

---

# Common mistakes (linked queue)

- Forgetting to reset `rear` to `NULL` when empty
- Updating only one of `front`/`rear` with one node
- Both lead to a **dangling pointer** on the next enqueue

<!-- Speaker note: A single node is both the front and the rear — both pointers must point to it. -->

---

# Quick question

Why does the linked queue need a `rear`
pointer, while the linked stack does not?

<!-- Speaker note: Compare where each structure adds and where it removes. -->

---

# Answer

The stack adds/removes at the **same** end
(`top`) — one pointer suffices. The queue adds
at one end, removes at the other — it needs a
pointer to **each** end to stay O(1).

<!-- Speaker note: Without rear, enqueue would need to walk the entire list to find the last node — O(n), not O(1). -->

---

# The deque — both ends

A **deque** (double-ended queue) drops the
"one end only" rule: it allows push/pop at
**both** the front and the back.

<!-- Speaker note: A deque behaves like a stack and a queue at the same time, depending only on which operations you call. -->

---

# The Deque ADT

| Operation | What it does | Complexity |
| --- | --- | --- |
| `push_back(x)` | Add at the back | O(1) |
| `push_front(x)` | Add at the front | O(1) |
| `pop_back()` | Remove the back | O(1) |
| `pop_front()` | Remove the front | O(1) |

<!-- Speaker note: Built here on a doubly linked list, each end getting its own pair of pointer rewrites. -->

---

# Double-ended queue (deque)

<iframe class="dsanim" src="anim/deque.html?yer=slayt&lang=en" title="Double-ended queue (deque)"></iframe>

<!-- Speaker note: Watch push_front insert at the opposite end from push_back — something a plain queue could never do. -->

---

# Code — push_back()

```c
void push_back(Deque *d, int x) {
    DNode *n = malloc(sizeof(DNode));
    n->data = x;
    n->next = NULL;
    n->prev = d->back;
    if (d->back != NULL)
        d->back->next = n;
    else
        d->front = n;
    d->back = n;
}
```

<!-- Speaker note: push_front is the mirror image of this function, touching front/prev instead of back/next. -->

---

# Code — pop_back()

```c
bool pop_back(Deque *d) {
    if (d->back == NULL) return false;
    DNode *tmp = d->back;
    d->back = tmp->prev;
    if (d->back != NULL)
        d->back->next = NULL;
    else
        d->front = NULL;
    free(tmp);
    return true;
}
```

<!-- Speaker note: pop_front mirrors this exactly, touching front/next instead of back/prev. -->

---

# Note — a deque can be a stack or a queue

- Only `push_back`/`pop_back` → behaves like a **stack**
- Only `push_back`/`pop_front` → behaves like a **queue**
- Java's `ArrayDeque` is recommended as a faster
  general replacement for both

<!-- Speaker note: In C there is no standard deque, so we build one; in Java, java.util.ArrayDeque already gives us this. -->

---

# Quick question

Empty deque: `push_front(1)`, `push_back(2)`,
`push_front(3)`. Front to back — what is it?

<!-- Speaker note: Trace one call at a time. -->

---

# Answer

`3 1 2`. `push_front(1)` → `[1]`.
`push_back(2)` → `[1, 2]`.
`push_front(3)` → `[3, 1, 2]`.

<!-- Speaker note: Front-inserts build backwards from the left; back-inserts build forwards on the right. -->

---

# The multilevel queue

- Real schedulers rarely treat all work equally
- OS scheduler: keeps **several** FIFO queues at once
- Interactive first, then background, then batch
- Each level is an **ordinary queue**; a policy picks one

<!-- Speaker note: This needs no new code today — just several of the queues we already built, plus a small selection rule. -->

---

# Multilevel queue — levels

| Level | Kind of work | Priority |
| --- | --- | --- |
| Queue 1 | Interactive | Highest |
| Queue 2 | Background | Medium |
| Queue 3 | Batch | Lowest |

<!-- Speaker note: The scheduler serves higher queues first, falling through to lower ones only when higher ones are empty. -->

---

# Multilevel queue scheduling

<iframe class="dsanim" src="anim/multilevel-queue.html?yer=slayt&lang=en" title="Multilevel queue scheduling"></iframe>

<!-- Speaker note: Normal example: 12 processes evenly spread across three classes. admit() enqueues by level; pick_next() always tries level 0 first. -->

---

# Pitfall — starvation risk

One early **batch** process among nine
system/interactive ones is served **last** —
plain priority order alone cannot prevent starvation.

<!-- Speaker note: Real schedulers add aging or time-slicing so a lower level is never starved forever. -->

---

# Quick question

Why is a multilevel queue not, strictly
speaking, a new data structure?

<!-- Speaker note: Look at what each individual level actually is. -->

---

# Answer

Each level is an **ordinary queue**; "multilevel"
describes a *scheduling policy* for choosing among
several existing queues — not a new way to store data.

<!-- Speaker note: You will meet its close relative, the priority queue, built on a heap, next week. -->

---

# Summary — stack-based structures

| Structure | Rule | Add/remove | Typical use |
| --- | --- | --- | --- |
| Array stack | LIFO | O(1), fixed cap. | Small, bounded stacks |
| Linked stack | LIFO | O(1), unbounded | Unpredictable size |
| Call stack | LIFO | Automatic | Every running program |

<!-- Speaker note: All three obey the exact same LIFO rule — only the storage and the capacity limit differ. -->

---

# Summary — queue-based structures (I)

| Structure | Rule | Add/remove |
| --- | --- | --- |
| Array queue (naive) | FIFO | O(1), but drifts |
| Circular queue | FIFO | O(1), no drift |
| Linked-list queue | FIFO | O(1), unbounded |

<!-- Speaker note: The circular queue is the one you would actually ship; the naive array queue is a teaching stepping stone. -->

---

# Summary — queue-based structures (II)

| Structure | Rule | Typical use |
| --- | --- | --- |
| Deque | Both ends | Sliding window, undo/redo |
| Multilevel queue | Several FIFOs + policy | OS scheduling |

<!-- Speaker note: Both generalize the plain queue — one by relaxing which end you touch, one by adding priority. -->

---

# Summary — stack applications

| Application | Structure | Key idea |
| --- | --- | --- |
| Balanced brackets | Stack | Most recent, first closed |
| Postfix evaluation | Stack | Pop two, apply, push result |
| Infix → postfix | Operator stack + output | Resolve precedence once |
| Tower of Hanoi | Call stack | Solve n-1, act, solve n-1 |

<!-- Speaker note: Four very different-looking problems, all solved by the exact same tiny stack interface. -->

---

# The big picture

One rule — **which end(s) you may touch** —
separates every structure in this lecture:
one end (stack), two ends (queue/deque),
or several parallel queues (multilevel).

<!-- Speaker note: If a student remembers only one sentence from today, this is the one worth remembering. -->

---

# Practice

- Exercises for all of today's topics are in the
  week notes: `docs/week-3/cen207-week-3.en.md`
- Peek, unbalanced-parens detection, prefix-free
  infix-to-prefix, count-free circular queue,
  palindrome check, fairer multilevel scheduling

<!-- Speaker note: These are the same five exercises listed at the end of the written notes, with worked answer sketches. -->

---

# Self-check round

Ten short questions. Think before the answer
appears on the next slide.

<!-- Speaker note: These mirror the self-check quiz at the end of the week notes, one question per slide. -->

---

# 1. What does LIFO stand for?

<!-- Speaker note: Ask, wait, then advance. -->

---

# Last In, First Out — the stack.

<!-- Speaker note: The plate-stack picture from Section 1 is the whole idea. -->

---

# 2. What does FIFO stand for?

<!-- Speaker note: Ask, wait, then advance. -->

---

# First In, First Out — the queue.

<!-- Speaker note: The waiting-line picture from Section 5 is the whole idea. -->

---

# 3. Why does array `push` check `top == CAP - 1`, not `top == CAP`?

<!-- Speaker note: Think about the valid index range. -->

---

# Valid indices run 0..CAP-1; the stack is full the moment `top` reaches CAP-1.

<!-- Speaker note: Waiting for top == CAP would already be one slot past the array's end. -->

---

# 4. In postfix evaluation, which operand is popped first?

<!-- Speaker note: Recall the "right operand first" rule. -->

---

# The right-hand operand — it was pushed most recently.

<!-- Speaker note: This is exactly why 8 2 - means 8 - 2, not 2 - 8. -->

---

# 5. Why does a plain array queue eventually report "full" even with empty cells at the front?

<!-- Speaker note: This is the drift problem, restated as a question. -->

---

# `rear` only increases and never reuses cells `dequeue` frees near the front.

<!-- Speaker note: The queue "drifts" right until it hits the end of the array. -->

---

# 6. What extra state does a circular queue need beyond `front`/`rear`?

<!-- Speaker note: Think about the front == rear ambiguity. -->

---

# A `count` of current elements — indices alone cannot tell empty from full.

<!-- Speaker note: After a wraparound, front == rear no longer decides the question by itself. -->

---

# 7. What is the base case of `fact(n) = n * fact(n - 1)`?

<!-- Speaker note: Recall the very first code slide of Section 3. -->

---

# `fact(0) = 1`. Without it, calls never stop and the call stack overflows.

<!-- Speaker note: Every recursive function needs at least one reachable base case. -->

---

# 8. Why does the call stack qualify as a genuine stack?

<!-- Speaker note: Compare it to the LIFO rule from Section 1. -->

---

# It obeys LIFO exactly: the most recent call is always the next one to finish.

<!-- Speaker note: Just like the most recently pushed element of any stack is the next one popped. -->

---

# 9. For `n` disks, how many Hanoi moves are needed?

<!-- Speaker note: Recall the recurrence from Section 4. -->

---

# `2ⁿ - 1` moves — exponential growth in `n`.

<!-- Speaker note: For n = 64, that is about 585 billion years at one move per second. -->

---

# 10. Name one thing a deque can do that a plain stack or queue cannot.

<!-- Speaker note: Think about which ends each structure is allowed to touch. -->

---

# Add or remove at **both** the front and the back, each in O(1).

<!-- Speaker note: A plain stack only ever touches its top; a plain queue only adds at one end and removes at the other. -->

---

<!-- _class: baslik -->

# Next week

**Week 4 — Trees: Binary Trees, Traversals, Heaps**

Every stack and queue today stored elements in a
strict, unbranching sequence. Trees let a node
have several children — traversed with the very
same recursive pattern used for the Tower of Hanoi.

<!-- Speaker note: Solve the left subtree, visit the node, solve the right subtree — exactly Hanoi's recursion shape, on a new shape of data. -->

---

# References (1/2)

- Course syllabus, Week 3: `docs/syllabus/syllabus.en.md`
- Cormen, Leiserson, Rivest, Stein. *Introduction to
  Algorithms*, 3rd ed. MIT Press
- Sedgewick, Wayne. *Algorithms*, 4th ed.
  Addison-Wesley, 2011

<!-- Speaker note: These are the same references listed at the end of the week's written notes. -->

---

# References (2/2)

- Deitel & Deitel. *C How to Program*, 7th ed.
- Y. D. Liang. *Introduction to Java Programming*, 10th ed.
- É. Lucas, *Récréations mathématiques*, 1883
- J. Łukasiewicz, Polish/Reverse Polish notation, 1920s

<!-- Speaker note: The historical references (Lucas, Łukasiewicz) are what today's "short history" slides drew on. -->
