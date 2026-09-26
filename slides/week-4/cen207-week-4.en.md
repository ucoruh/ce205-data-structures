---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 4 — Trees, Heaps and Huffman Coding"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 4"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Trees, Heaps and Huffman Coding

**CEN207 Data Structures — Week 4**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!--
Speaker note: Today a node gets to point at more than one other node. That single change — one pointer becomes two — is the entire jump from "list" to "tree", and it builds the heap, priority queues, and Huffman coding, all in one sitting.
-->

---

# Today's plan (3 hours)

| Hour | Topic |
| --- | --- |
| 1 | Trees, vocabulary, shapes **Anim 1–2** · traversals: pre/in/post/iterative/level **Anim 3–7** |
| 2 | Array repr. **Anim 8** · binary heap: insert/extract/build/sort **Anim 9–12** |
| 3 | Priority queue **Anim 13** · variants **Anim 14–16** · Huffman **Anim 17–18** |

**Learning outcomes:** LO.1 (explain fundamental data structures) · LO.2 (analyze complexity) · LO.7 (choose the right structure)

<!-- Speaker note: Eighteen short animations carry the whole lecture; each appears once, exactly where its idea is introduced, and several get a second look at their trickiest edge case. -->

---

# This week's concepts — where

| Concept | Where |
| --- | --- |
| Tree vocabulary, binary tree shapes | Sections 1–2 |
| Traversals (pre/in/post/iterative/level) | Section 3 |
| Array representation of a tree | Section 4 |
| Binary heap, heap sort | Section 5 |
| Priority queue, variants, Huffman | Sections 6–8 |

<!-- Speaker note: Every term gets a full definition the first time it appears; this table just says where to find it again. -->

---

# How the code examples work

- Every idea has a complete **C** and **Java** program
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Sources: `code/week-04/c/` and `code/week-04/java/`
- Each program's expected output is in the week notes

<!-- Speaker note: Open a terminal now if you want to run these live; every snippet on today's slides compiles and runs exactly as shown. -->

---

# Recap — Weeks 1–2: pointers and lists

- `malloc`/`free`: one box, one owner, `NULL` when empty
- A linked-list node: a value plus one `next` pointer
- A tree node: a value plus **two** pointers, `left`/`right`
- A list ends at `NULL`; a tree **leaf** has both `NULL`

<!-- Speaker note: A tree node is a linked-list node with one extra pointer field — that is genuinely the whole new idea. -->

---

# Recap — Week 3: stack, queue, recursion

- Recursion **is** a stack: a call pushes, a return pops
- Today: the *same* traversal, using our **own** stack
- The queue (FIFO) returns unchanged, for level order
- Week 3's structures now simply hold tree nodes

<!-- Speaker note: Nothing about memory is new this week — only new shapes built from the exact same pointer and stack/queue ideas. -->

---

# Map of the week — at a glance

| Trees & traversals | Heaps & Huffman |
| --- | --- |
| Vocabulary, five shapes | Binary heap, heap sort |
| Five traversal orders | Priority queue, variants |
| Array representation | Huffman coding |

<!-- Speaker note: Every box on this map gets its own slides below, most with a short animation and a complete C/Java program. -->

---

<!-- _class: bolum -->

# 1. Why Trees? Vocabulary and History

<!-- Speaker note: Section 1 builds the vocabulary every later section leans on — root, parent, child, leaf, depth, height — on a general tree where a node may have any number of children. -->

---

# A question to start

A file manager: one home folder, folders inside
folders, files inside those. One root, unlimited
branching, and no folder is ever its own ancestor.

<!-- Speaker note: Ask: is this shape a stack, a queue, or something new? It branches — that is the whole new idea today. -->

---

# A short history

- **1857** — Cayley counts trees while counting molecules
- **1968** — Knuth fixes the vocabulary in *TAOCP* Vol. 1
- Root, leaf, degree, level, height — his terms, still used
- One of the oldest shapes in mathematics, borrowed by CS

<!-- Speaker note: Cayley was not thinking about computers at all — he was counting hydrocarbon isomers, whose branching structure is literally a tree. -->

---

# Intuition — an upside-down tree

- The **root** is the trunk — drawn at the **top**
- Everything branches **downward** from the root
- A **leaf** has no children — the end of a branch
- Yes, upside down: every CS diagram draws it this way

<!-- Speaker note: Ask why "root" sits at the top — it is a convention, not a law of nature, but it is completely universal in this field. -->

---

# Vocabulary (1/3)

| Term | Meaning |
| --- | --- |
| **Root** | The one node with no parent |
| **Parent / child** | Edge from `A` down to `B`: `A` is parent, `B` child |
| **Sibling** | Two nodes sharing the same parent |
| **Leaf** | A node with no children — degree 0 |

<!-- Speaker note: Every one of these is pointed at, one at a time, in the animation right after this table. -->

---

# Vocabulary (2/3)

| Term | Meaning |
| --- | --- |
| **Internal node** | A node with at least one child |
| **Edge** | A parent-child connection; *n* nodes, *n*−1 edges |
| **Degree** (of a node) | Its number of children |
| **Depth** (of a node) | Edges from the root down to it |

<!-- Speaker note: n-1 edges is worth pausing on: every node except the root has exactly one edge, to its own parent. -->

---

# Vocabulary (3/3)

| Term | Meaning |
| --- | --- |
| **Height** (of a node) | Edges on its longest path down to a leaf |
| **Height** (of the tree) | The root's height |
| **Subtree** | A node plus everything below it |

<!-- Speaker note: Depth counts down from the root; height counts down from a node to its deepest leaf — the direction of counting is what people confuse. -->

---

# Tree vocabulary, one term at a time

<iframe class="dsanim" src="anim/tree-terminology.html?yer=slayt&lang=en" title="Tree vocabulary: root, parent, child, leaf, depth, height"></iframe>

<!-- Speaker note: Normal example: an 11-node bushy tree. Watch each term light up on the same real tree, one at a time. -->

---

# Edge case — a star: the root has 10 children

<iframe class="dsanim" src="anim/tree-terminology.html?yer=slayt&lang=en&example=star" title="Tree vocabulary: a star"></iframe>

<!-- Speaker note: A star tests "degree" hardest: one node with degree 10, ten leaves each with degree 0, and a tree of height only 1. -->

---

# Code — the tree node

```c
typedef struct Node {
    char label[4];
    struct Node *children[MAX_CHILDREN];
    int child_count;   /* degree of this node */
    int depth;
    struct Node *parent;
} Node;
```

<!-- Speaker note: Compare this to Week 2's linked-list node: same idea, but children is now an array, since a general tree node may have many children, not just one "next". -->

---

# Code — height() (bottom-up, recursive)

```c
int height(Node *n) {
    if (n->child_count == 0)
        return 0;         /* a leaf: height 0 */
    int best = -1;
    for (int i = 0; i < n->child_count; i++) {
        int h = height(n->children[i]);
        if (h > best) best = h;
    }
    return best + 1;      /* 1 + tallest child */
}
```

<!-- Speaker note: A leaf's height is the base case, 0; every other node is 1 plus its tallest child — pure recursion, no queue needed. -->

---

# Code — compute_depths() (top-down, BFS)

```c
void compute_depths(Node *root) {
    Node *queue[MAX_NODES];
    int front = 0, rear = 0;
    root->depth = 0;
    queue[rear++] = root;
    while (front < rear) {
        Node *cur = queue[front++];
        for (int i = 0; i < cur->child_count; i++) {
            Node *ch = cur->children[i];
            ch->depth = cur->depth + 1;
            queue[rear++] = ch;
        }
    }
}
```

<!-- Speaker note: Depth needs the parent's answer first, so it walks top-down with a queue — the mirror image of height's bottom-up recursion. -->

---

# Complexity

- `height`: every node visited once — **O(n)**
- `compute_depths`: every node visited once — **O(n)**
- Neither depends on the tree's **shape**
- A thin chain costs the same as a bushy tree, same *n*

<!-- Speaker note: Shape will start to matter a lot once we look at recursion *depth* rather than total work, later this week. -->

---

# Common mistakes

- Confusing **depth** (from the root down) with **height** (down to a leaf)
- Forgetting a leaf's height is 0, not 1
- Assuming every tree is **binary** — a general node can have any number of children

<!-- Speaker note: The binary restriction starts in the very next section, and it is a choice we make for its tricks, not a law of nature. -->

---

# Mini-quiz

In the 18-node example, `Q1` has children `S1`
and `S2`. What is `Q1`'s **degree**? What is
`S1`'s **depth**, given `Q1`'s depth is 1?

<!-- Speaker note: Let the class answer both parts before the next slide. -->

---

# Answer

`Q1`'s degree is **2** (two children). `S1` is a
child of `Q1`, so its depth is `Q1`'s depth + 1
= **2**.

<!-- Speaker note: Depth always adds exactly one per level down from the root — no shortcuts, no exceptions. -->

---

<!-- _class: bolum -->

# 2. Binary Trees: Shapes and Node Counts

<!-- Speaker note: One restriction — at most two children, called left and right — unlocks the heap, Huffman coding, and next semester's search trees. -->

---

# A question to start

Restrict every node to **at most two** children,
left and right. Why would giving up "any number
of children" ever be worth it?

<!-- Speaker note: The payoff is arithmetic tricks on array indices, which section 4 introduces — impossible with unlimited children. -->

---

# Code — the binary tree node

```c
typedef struct Node {
    int value;
    struct Node *left, *right;
} Node;
```

<!-- Speaker note: Every program for the rest of this week builds on exactly this struct — one more pointer than a linked-list node. -->

---

# Five shapes, precisely defined

| Shape | Definition |
| --- | --- |
| **Full** | Every node has 0 or 2 children, never 1 |
| **Complete** | Every level full except the last, filled left-to-right |
| **Perfect** | Full **and** every leaf at the same depth |
| **Degenerate** | Every node has 0 or 1 children — a chain |
| **Balanced** | Left/right subtree heights differ by ≤ 1 |

<!-- Speaker note: These are five independent yes/no questions — a tree can be complete without being full, and vice versa. -->

---

# Binary tree shapes, one question at a time

<iframe class="dsanim" src="anim/tree-shapes.html?yer=slayt&lang=en" title="Binary tree shapes"></iframe>

<!-- Speaker note: Normal example: 12 nodes, complete but not perfect. The animation asks all five yes/no questions on the same tree. -->

---

# Edge case — a degenerate chain, 10 nodes

<iframe class="dsanim" src="anim/tree-shapes.html?yer=slayt&lang=en&example=degenerate" title="Binary tree shapes: degenerate"></iframe>

<!-- Speaker note: A degenerate tree fails full, complete, and perfect all at once, and its height is n-1 — as bad as a plain linked list. -->

---

# How many nodes can fit?

- **Max at height *h*:** a perfect tree has 2<sup>h+1</sup> − 1 nodes
- Level *k* holds 2<sup>k</sup> nodes; sum them through level *h*
- **Min height for *n* nodes:** ⌊log₂ n⌋, no arrangement beats it
- Each level holds at most twice the nodes of the one above

<!-- Speaker note: These two formulas come back constantly — the heap in section 5 depends on both. -->

---

# Why balance matters

- A **balanced** tree keeps height close to log₂ n
- Root-to-leaf operations then cost **O(log n)**
- A **degenerate** tree's height is n − 1, no better than a list
- Same node count, wildly different cost — shape decides

<!-- Speaker note: Balance is the whole reason binary search trees, next semester, are worth building carefully rather than by accident. -->

---

# Code — is_complete (spotting gaps)

```c
static bool is_complete(Node *root) {
    Node *queue[MAX_NODES]; int front = 0, rear = 0;
    queue[rear++] = root;
    bool seen_gap = false;
    while (front < rear) {
        Node *n = queue[front++];
        if (n == NULL) { seen_gap = true; continue; }
        if (seen_gap) return false;
        queue[rear++] = n->left;
        queue[rear++] = n->right;
    }
    return true;
}
```

<!-- Speaker note: This walks level by level with a queue, deliberately enqueuing NULL placeholders so a real node right after a gap gets caught. -->

---

# Code — check_balance (one pass, not two)

```c
static int check_balance(Node *n) {
    if (n == NULL) return 0;
    int hl = check_balance(n->left);
    if (hl == -1) return -1;
    int hr = check_balance(n->right);
    if (hr == -1) return -1;
    if (abs(hl - hr) > 1) return -1;
    return 1 + (hl > hr ? hl : hr);
}
```

<!-- Speaker note: One sentinel value, -1, carries "already unbalanced" up the recursion so we never re-walk the same subtree twice. -->

---

# Complexity

- All five shape checks are **O(n)** — visit each node once
- `is_complete` needs O(n) extra space, for its queue
- The other four need only **O(h)** recursion-stack space

<!-- Speaker note: h is the height, which is why a degenerate tree's O(n) stack space is the worst case worth worrying about. -->

---

# Common mistakes

- Thinking "complete" means every level is full
- Confusing **perfect** (complete + all leaves equal depth) with complete
- Calling `height()` twice per node — turns O(n) into **O(n²)**

<!-- Speaker note: The one-pass check_balance above exists specifically to avoid that last, very common trap. -->

---

# Mini-quiz

A binary tree has height 3 and is **perfect**.
How many nodes does it have? How many
of them are leaves?

<!-- Speaker note: Use both formulas from two slides back. -->

---

# Answer

2<sup>4</sup> − 1 = **15** nodes total. The last
level (level 3) holds 2<sup>3</sup> = **8** leaves;
the other 7 nodes are internal.

<!-- Speaker note: Every perfect tree's leaf count is exactly half its total nodes, rounded up — a nice sanity check. -->

---

<!-- _class: bolum -->

# 3. Traversals: Visiting Every Node Once

<!-- Speaker note: A tree has no one natural order — a node has two children, so there is a real choice about which to visit first and when to visit the node itself. -->

---

# No single "natural" order

- A node has (up to) two children — a real choice exists
- Three recursive orders: **preorder, inorder, postorder**
- Two more without recursion: our own **stack**, and a **queue**
- Same tree, five orders, generally five different sequences

<!-- Speaker note: All five programs below share the same 10-node balanced tree [50,30,70,20,40,60,80,10,-,-,45,55], so only the visiting order ever changes. -->

---

# Preorder: visit, left, right

Visit the node **before** either child. The root
is always visited **first** — exactly the order
you need to **rebuild** a tree from scratch.

<!-- Speaker note: Reading the sequence back in, the very first value read is always the root of whatever subtree comes next. -->

---

# Preorder, step by step

<iframe class="dsanim" src="anim/preorder-traversal.html?yer=slayt&lang=en" title="Preorder traversal"></iframe>

<!-- Speaker note: Watch the highlighted call path trace the route from the root down to whichever call is currently active. -->

---

# Edge case — a left-skewed chain

<iframe class="dsanim" src="anim/preorder-traversal.html?yer=slayt&lang=en&example=left-skewed" title="Preorder: left-skewed chain"></iframe>

<!-- Speaker note: With only left children, preorder visits in exactly the order the chain was built — visit, then the one child, every time. -->

---

# Code — preorder (recursive)

```c
static void preorder(Node *node) {
    if (node == NULL) return;
    printf("visit %d\n", node->value);
    visited[visited_count++] = node->value;
    preorder(node->left);
    preorder(node->right);
}
```

<!-- Speaker note: Visit first, then recurse left, then right — the base case, node == NULL, must come first or this crashes on an empty subtree. -->

---

# Inorder: left, visit, right

Visit the node **between** its children. On a
binary **search** tree, this visits every value
in **sorted** order — previewed here, built later.

<!-- Speaker note: On these demonstration trees, which are not built by BST rules, inorder still runs left-before-self-before-right; it just does not happen to sort. -->

---

# Inorder, step by step

<iframe class="dsanim" src="anim/inorder-traversal.html?yer=slayt&lang=en" title="Inorder traversal"></iframe>

<!-- Speaker note: On the normal tree, [50,30,70,...], inorder happens to come out perfectly sorted: 10 20 30 40 45 50 55 60 70 80. -->

---

# Edge case — a right-skewed chain

<iframe class="dsanim" src="anim/inorder-traversal.html?yer=slayt&lang=en&example=right-skewed" title="Inorder: right-skewed chain"></iframe>

<!-- Speaker note: With only right children there is no left subtree to visit first, so inorder comes out in the exact chained order — compare this to the left-skewed case, which comes out reversed. -->

---

# Code — inorder (recursive)

```c
static void inorder(Node *node) {
    if (node == NULL) return;
    inorder(node->left);
    printf("visit %d\n", node->value);
    visited[visited_count++] = node->value;
    inorder(node->right);
}
```

<!-- Speaker note: Identical shape to preorder — only the position of the "visit" line moves, from first to the middle. -->

---

# Postorder: left, right, visit

Visit the node **after** both children. The root
is always visited **last** — exactly the order
you need to **delete** a tree safely.

<!-- Speaker note: Free a node's children before the node itself, or you would need the node's own pointers again after they are already gone. -->

---

# Postorder, step by step

<iframe class="dsanim" src="anim/postorder-traversal.html?yer=slayt&lang=en" title="Postorder traversal"></iframe>

<!-- Speaker note: Compare this run's very first and very last printed values with preorder's — root last here, root first there. -->

---

# Edge case — a right-skewed chain, reversed

<iframe class="dsanim" src="anim/postorder-traversal.html?yer=slayt&lang=en&example=right-skewed" title="Postorder: right-skewed chain"></iframe>

<!-- Speaker note: With no left subtree, postorder still saves "visit self" for last, so the whole right chain comes out in reverse chained order. -->

---

# Code — postorder (recursive)

```c
static void postorder(Node *node) {
    if (node == NULL) return;
    postorder(node->left);
    postorder(node->right);
    printf("visit %d\n", node->value);
    visited[visited_count++] = node->value;
}
```

<!-- Speaker note: Same three lines as always, just moved to the end — visit, left, right becomes left, right, visit. -->

---

# Complexity — all three traversals

- **O(n)** time: every node visited once, O(1) work each
- **O(h)** recursion-stack space — the tree's height
- O(log n) for a balanced tree, but **O(n)** for a chain
- That worst case motivates section 3.4's explicit stack

<!-- Speaker note: Only the order of "visit, left, right" changes between the three; the total work never does. -->

---

# Common mistakes

- Forgetting the base case — `node == NULL` must return
- Not resetting a shared visited-count between scenarios
- Assuming the three orders "mostly agree" — even one extra node makes them diverge
- Picking the wrong traversal: rebuild needs preorder, delete needs postorder

<!-- Speaker note: All three "visit every node", so a wrong choice still runs — the bug only shows up once the order itself matters. -->

---

# Mini-quiz

You must save a tree to a file so that reading
the values back in and inserting each one in
order rebuilds the exact same tree. Which order?

<!-- Speaker note: Think about which value must be read first. -->

---

# Answer

**Preorder.** The first value read back must be
the root, and preorder is the only order that
visits the root before either subtree.

<!-- Speaker note: This is exactly the "rebuild from scratch" property mentioned at the start of the preorder slides. -->

---

# Inorder without recursion

Every recursive traversal secretly uses the
compiler's **call stack**. This time, no recursion
at all — our **own** stack, from Week 3, holding
`Node *` instead of `int`.

<!-- Speaker note: Push the whole left spine; when you cannot go left any further, pop, visit, then walk into the right subtree and repeat. -->

---

# Iterative inorder, step by step

<iframe class="dsanim" src="anim/iterative-inorder-stack.html?yer=slayt&lang=en" title="Iterative inorder with a stack"></iframe>

<!-- Speaker note: Watch the stack grow as the left spine is pushed, then shrink one pop at a time as each node is visited. -->

---

# Edge case — the stack reaches its deepest point

<iframe class="dsanim" src="anim/iterative-inorder-stack.html?yer=slayt&lang=en&example=left-skewed" title="Iterative inorder: left-skewed"></iframe>

<!-- Speaker note: All 10 nodes get pushed before a single one is popped — the stack depth equals the whole chain's length. -->

---

# Code — push / pop (our own stack)

```c
static void push(Node *n) {
    top = top + 1;
    stack_data[top] = n;
}
static Node *pop(void) {
    Node *n = stack_data[top];
    top = top - 1;
    return n;
}
```

<!-- Speaker note: The exact array-based stack from Week 3 — only the element type changed, from int to Node *. -->

---

# Code — the main loop

```c
Node *cur = root;
while (cur != NULL || !is_empty()) {
    while (cur != NULL) {
        push(cur);
        cur = cur->left;
    }
    cur = pop();
    printf("visit %d\n", cur->value);
    cur = cur->right;
}
```

<!-- Speaker note: Push the whole left spine, pop and visit, then step right and repeat — both halves of the outer while matter. -->

---

# Complexity

- **O(n)** time — every node pushed once, popped once
- **O(h)** space — matches the recursive version exactly
- No memory saved; only the bookkeeping moved, to our own stack
- Benefit: an explicit stack can grow past a fixed recursion limit

<!-- Speaker note: A pathologically deep tree can crash a recursive call stack; our own array-based stack just runs out of room more gracefully. -->

---

# Common mistakes

- Dropping either half of `cur != NULL || !is_empty()`
- Forgetting `cur = cur->right` after visiting a popped node
- Skip it, and every right subtree silently disappears

<!-- Speaker note: Both halves of that loop condition matter — drop the first and you stop too early, drop the second and you loop forever. -->

---

# Mini-quiz

On a **perfect** tree of height *h*, what is the
**maximum** number of nodes ever sitting on
the stack at once during this traversal?

<!-- Speaker note: Think about which nodes the stack actually holds at any moment. -->

---

# Answer

***h* + 1.** The stack only ever holds the
current left spine, and a perfect tree's
longest left spine has *h* + 1 nodes.

<!-- Speaker note: Depths 0 through h, inclusive — that is h+1 nodes, never more. -->

---

# Level order (breadth-first) with a queue

Every traversal so far goes **deep** before
**wide**. Level order visits the root, then
**every** node at depth 1, then depth 2 — needs
a **queue**, not a stack.

<!-- Speaker note: The first node enqueued, the root, must also be the first processed — that is exactly FIFO, so a stack would give the wrong order. -->

---

# Level order, step by step

<iframe class="dsanim" src="anim/level-order-traversal.html?yer=slayt&lang=en" title="Level-order traversal"></iframe>

<!-- Speaker note: Watch each depth finish completely — 50, then 30 and 70, then all four grandchildren — before the next depth starts. -->

---

# Edge case — the queue always holds one item

<iframe class="dsanim" src="anim/level-order-traversal.html?yer=slayt&lang=en&example=left-skewed" title="Level order: left-skewed chain"></iframe>

<!-- Speaker note: Every node here has only one child, so there is never more than one node "at" any depth — the queue never grows past size 1. -->

---

# Code — enqueue / dequeue

```c
static void enqueue(Node *n) {
    rear = (rear + 1) % QUEUE_CAP;
    queue_data[rear] = n;
    count++;
}
static Node *dequeue(void) {
    Node *n = queue_data[front];
    front = (front + 1) % QUEUE_CAP;
    count--;
    return n;
}
```

<!-- Speaker note: The exact circular queue from Week 3 — rear starts at -1 so the very first enqueue correctly lands on index 0. -->

---

# Code — the main loop

```c
enqueue(root);
while (!is_empty()) {
    Node *cur = dequeue();
    printf("visit %d\n", cur->value);
    if (cur->left != NULL) enqueue(cur->left);
    if (cur->right != NULL) enqueue(cur->right);
}
```

<!-- Speaker note: Unlike section 2's completeness check, this loop never enqueues NULL — mixing the two conventions up is a classic source of bugs. -->

---

# Complexity

- **O(n)** time — every node enqueued once, dequeued once
- **O(w)** space, where *w* is the tree's maximum **width**
- *w* can be as large as O(n) for a bushy, balanced tree
- Contrast with O(h) space for every depth-first traversal

<!-- Speaker note: Depth-first traversals trade width for depth; level order trades depth for width — neither is free. -->

---

# Common mistakes

- Swapping `dequeue` for `pop` "because it's basically the same" — that silently becomes depth-first
- Enqueuing `NULL` children by mistake — crashes on the next dequeue

<!-- Speaker note: The code still compiles and runs either way; only the actual visiting order reveals the bug. -->

---

# Mini-quiz

Can two **different** binary trees share the
exact same **level-order** sequence of values?
True or false?

<!-- Speaker note: Think about whether a level-order sequence alone tells you which node is whose child. -->

---

# Answer

**True.** A level-order sequence alone does
not encode parent-child relationships once
a level has any gaps.

<!-- Speaker note: A preorder-plus-inorder pair together does determine one specific tree; a single level-order sequence does not. -->

---

<!-- _class: bolum -->

# 4. A Complete Tree in an Array

<!-- Speaker note: For a complete tree specifically, arithmetic on an index replaces every pointer — no malloc, no left/right fields at all. -->

---

# A question to start

Pointers cost memory, and finding a parent
needs either a stored pointer or a search. For
a **complete** tree, is there a cheaper way?

<!-- Speaker note: Yes — and it is exactly the representation the binary heap in section 5 is built on. -->

---

# The index formulas

- Node at index *i*: **left child** at `2*i + 1`
- **Right child** at `2*i + 2`
- **Parent** at `(i - 1) / 2` (integer division)
- No `left`, `right`, or `parent` field anywhere — just an array

<!-- Speaker note: Three formulas are the entire representation; everything else is pure arithmetic on one plain array. -->

---

# The array representation, step by step

<iframe class="dsanim" src="anim/complete-tree-array.html?yer=slayt&lang=en" title="Array representation of a complete tree"></iframe>

<!-- Speaker note: Normal example: 12 nodes, complete, no gaps at all — every formula lands exactly where the picture says it should. -->

---

# Edge case — NOT complete: a gap

<iframe class="dsanim" src="anim/complete-tree-array.html?yer=slayt&lang=en&example=gap" title="Array representation: a gap"></iframe>

<!-- Speaker note: Indices 9 and 10 are empty but index 11 is filled — one real node after a gap is enough to break completeness entirely. -->

---

# Code — parent / left / right, is_complete

```c
static int parent(int i) { return (i - 1) / 2; }
static int left(int i)   { return 2 * i + 1; }
static int right(int i)  { return 2 * i + 2; }

static bool is_complete(int arr[], int n, int last_real) {
    for (int i = 0; i <= last_real; i++)
        if (arr[i] == EMPTY) return false;
    return true;
}
```

<!-- Speaker note: Three one-line formulas, then one loop: any empty slot before the last real one means the array is not complete. -->

---

# Complexity

- `parent`, `left`, `right`: pure arithmetic — **O(1)**
- Cost is the same for 10 nodes or 10 million
- `is_complete` itself: **O(n)**, one scan of the array

<!-- Speaker note: O(1) child/parent access is the entire point of the array representation — it is exactly what the heap needs next. -->

---

# Common mistakes

- Using these formulas on a tree that is **not** actually complete
- Trusting `(i - 1) / 2` without checking your language's integer-division rules
- Forgetting the root (`i = 0`) has no parent — a special case

<!-- Speaker note: The formulas still compute *some* index either way; on a non-complete tree, that index may simply be meaningless. -->

---

# Mini-quiz

A complete binary tree, stored in an array.
The node at index 11 has two children.
At which indices? At which index is its parent?

<!-- Speaker note: Apply all three formulas from a few slides back. -->

---

# Answer

Children at `2*11+1 = 23` and `2*11+2 = 24`.
Parent at `(11-1)/2 = 5`.

<!-- Speaker note: Same three formulas, every single time, regardless of how large the tree is. -->

---

<!-- _class: bolum -->

# 5. The Binary Heap

<!-- Speaker note: A binary heap is a complete tree, from section 4, with one extra rule: every parent beats both its children. -->

---

# A question to start

An OS needs the most urgent of a hundred
waiting processes, instantly, over and over.
Sorting the whole list each time is wasteful.
What is the cheapest structure that always
keeps the single best item within reach?

<!-- Speaker note: Sorting on every arrival costs O(n log n) per arrival — far too slow for something this frequent. -->

---

# A short history

- **1964** — J. W. J. Williams introduces the heap and **heap sort**, together
- **1964** — R. W. Floyd publishes an O(n) way to **build** one
- The heap was invented specifically to make sorting fast

<!-- Speaker note: Both papers appeared the very same year — the heap and heap sort were never really separate ideas. -->

---

# The heap property

- **Min-heap:** every parent ≤ both children — smallest at the root
- **Max-heap:** every parent ≥ both children — largest at the root
- **Not** a sorted structure — siblings have no required order
- Only every parent beats its own two children, nothing more

<!-- Speaker note: This is the single most common misconception about heaps: a heap is not a sorted array, only a partially ordered one. -->

---

# The heap ADT

| Operation | What it does | Complexity |
| --- | --- | --- |
| `peek()` | Returns the root without removing it | O(1) |
| `insert(x)` | Adds `x`, restores order by **sift-up** | O(log n) |
| `extract()` | Removes the root, restores by **sift-down** | O(log n) |
| `build_heap(arr)` | Turns any array into a heap, all at once | O(n) |

<!-- Speaker note: Four operations, and the next four subsections build exactly these four, in this order. -->

---

# Insertion: sift-up

Place the new value in the next free slot —
keeps the tree complete. Then repeatedly
swap it with its **parent** while the heap
property is violated. This is **sift-up**.

<!-- Speaker note: Stop the moment the property holds, or when the value reaches the root — whichever comes first. -->

---

# Insertion by sift-up, step by step

<iframe class="dsanim" src="anim/heap-insert-sift-up.html?yer=slayt&lang=en" title="Heap insertion by sift-up"></iframe>

<!-- Speaker note: Normal example: a min-heap, 10 values inserted one by one: 15, 7, 22, 3, 18, 9, 30, 1, 25, 12. -->

---

# Edge case — already in order, no sifting needed

<iframe class="dsanim" src="anim/heap-insert-sift-up.html?yer=slayt&lang=en&example=already-ordered" title="Heap insert: already ordered"></iframe>

<!-- Speaker note: 12 ascending values into a min-heap: every single insert already satisfies the heap property, so not one swap ever happens. -->

---

# Code — insert() / sift-up

```c
void insert(int value) {
    heap[size] = value;
    int i = size;
    size++;
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (!better(heap[i], heap[parent]))
            break;
        int tmp = heap[parent];
        heap[parent] = heap[i];
        heap[i] = tmp;
        i = parent;
    }
}
```

<!-- Speaker note: better() hides min-heap vs max-heap behind one function, so the sift-up loop itself never needs to change. -->

---

# Complexity

- `insert`: at most one swap per **level** — **O(log n)**
- log n is the height of a complete tree with n nodes
- `peek` (reading `heap[0]`): **O(1)**

<!-- Speaker note: Height, not size, decides insert's cost — exactly the "why balance matters" idea from section 2, put to work. -->

---

# Extraction: sift-down

Save the root, move the **last** array
element into its place — keeps the tree
complete. Then repeatedly swap it with its
**better child**. This is **sift-down**.

<!-- Speaker note: Shrink size by one first, then sift — the moved element usually does not belong at the root at all. -->

---

# Extraction by sift-down, step by step

<iframe class="dsanim" src="anim/heap-extract-sift-down.html?yer=slayt&lang=en" title="Heap extraction by sift-down"></iframe>

<!-- Speaker note: Normal example: a min-heap, 12 values, 3 extractions — watch the last element parachute into the root, then sink back down. -->

---

# Edge case — drain fully: all 10 values extracted

<iframe class="dsanim" src="anim/heap-extract-sift-down.html?yer=slayt&lang=en&example=drain" title="Heap extract: drain fully"></iframe>

<!-- Speaker note: Extracting all 10 values, one at a time, produces them in fully sorted order — that is not a coincidence, it is how heap sort works. -->

---

# Code — extract() / sift-down

```c
int extract(void) {
    int best = heap[0];
    size--;
    heap[0] = heap[size];   /* ... */
    int i = 0;
    while (1) {              /* sift-down */
        /* ... target = better of left, right child ... */
        if (target == i)
            break;
        /* ... swap heap[i], heap[target]; i = target ... */
    }
    return best;
}
```

<!-- Speaker note: Compare with both children, not just the left one — comparing only one side can leave the property broken on the other. -->

---

# Complexity

- `extract`: at most one swap per **level** — **O(log n)**
- The exact mirror image of sift-up's cost
- Same O(log n) bound, going the opposite direction

<!-- Speaker note: Insert climbs at most log n levels; extract sinks at most log n levels — heights, again, decide everything. -->

---

# Common mistakes (insert and extract)

- Calling `extract` without checking `size > 0` first
- Comparing sift-down against only **one** child, not both
- Using `<=` instead of `<` in `better` — harmless, but changes tie behavior

<!-- Speaker note: An empty-heap extract reads heap[-1]-adjacent memory silently — a dangerous bug, not a clean crash. -->

---

# Building a heap in O(n)

n single inserts cost O(n log n) total. **Floyd's
algorithm** does better: every **leaf** is already
a valid one-node heap; sift-down only the
**internal** nodes, from the last one back to
the root.

<!-- Speaker note: This is a genuinely surprising result — building looks like it should cost the same as n inserts, but it does not. -->

---

# Build-heap, step by step

<iframe class="dsanim" src="anim/build-heap.html?yer=slayt&lang=en" title="Bottom-up build-heap"></iframe>

<!-- Speaker note: Normal example: a max-heap, 10 values in arbitrary order — watch how few of the n/2 leaves ever move at all. -->

---

# Edge case — already a valid heap

<iframe class="dsanim" src="anim/build-heap.html?yer=slayt&lang=en&example=already-heap" title="Build-heap: already valid"></iframe>

<!-- Speaker note: Every sift-down call finds target == i immediately and does nothing — build_heap does exactly as much work as the input needs, no more. -->

---

# Code — build_heap()

```c
void build_heap(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)
        sift_down(arr, n, i);
}
```

<!-- Speaker note: sift_down here is the exact same loop as extract's sift-down; the only new idea is which nodes to call it on, and in which order. -->

---

# Why O(n), not O(n log n)?

- Roughly n/2 nodes are **leaves** — skipped entirely
- Roughly n/4 nodes cost at most 1 swap; n/8 cost at most 2
- "Count at height *h* times cost *h*", summed, converges to **O(n)**
- Many cheap sifts near the bottom dominate the few costly ones near the top

<!-- Speaker note: This is the one genuinely surprising complexity result of the whole week — worth sitting with for a moment. -->

---

# Common mistakes

- Starting the loop at `i = 0` instead of `i = n/2 - 1` — sifts unfixed subtrees
- Assuming `build_heap` is "just n calls to insert" — valid, but not the same layout or cost

<!-- Speaker note: The loop must run backward, from the last internal node to the root, so every node's subtrees are already valid by the time it is sifted. -->

---

# Mini-quiz

`build_heap` and `heap_sort`'s main loop both
call `sift_down` repeatedly. Why is the first
**O(n)** overall, but the second **O(n log n)**?

<!-- Speaker note: Think about where in the tree each call to sift-down starts from. -->

---

# Answer

`build_heap` sifts mostly-cheap nodes near
the bottom. `heap_sort` calls sift-down once
per **extraction**, always starting from the
**root** — no cheap majority to average against.

<!-- Speaker note: Same function, sift_down, called in two very different patterns, with two very different total costs. -->

---

# Heap sort — the idea

`build_heap`, then repeatedly move the root
to the sorted tail, shrink, and sift-down.
A max-heap sorts **ascending**; a min-heap
sorts **descending**.

<!-- Speaker note: Once build_heap and extract both exist, sorting is almost free — this section just wires the two together. -->

---

# Heap sort, step by step

<iframe class="dsanim" src="anim/heap-sort.html?yer=slayt&lang=en" title="Heap sort"></iframe>

<!-- Speaker note: Normal example: ascending sort with a max-heap, 10 values — watch the sorted region grow from the array's tail backward. -->

---

# Edge case — already ascending, same cost anyway

<iframe class="dsanim" src="anim/heap-sort.html?yer=slayt&lang=en&example=already-sorted" title="Heap sort: already sorted"></iframe>

<!-- Speaker note: Unlike build-heap, heap sort is not adaptive — an already-sorted input still costs the full O(n log n), swap for swap. -->

---

# Code — heap_sort()

```c
void heap_sort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)
        sift_down(arr, n, i);
    for (int heap_size = n; heap_size > 1; heap_size--) {
        int tmp = arr[0];
        arr[0] = arr[heap_size - 1];
        arr[heap_size - 1] = tmp;
        sift_down(arr, heap_size - 1, 0);
    }
}
```

<!-- Speaker note: The very same build_heap loop from before, then n-1 rounds of swap-and-sift, each on a shrinking region. -->

---

# Complexity

- `build_heap`: O(n); the loop then runs n − 1 times
- Each round: one O(1) swap plus one **O(log n)** sift-down
- Total: **O(n log n)** — sorts in place, no extra array

<!-- Speaker note: Same asymptotic class as merge sort or quicksort's average case, but with no extra memory needed. -->

---

# Common mistakes

- Believing heap sort is **stable** — it is not
- Sifting over the full array instead of the **shrunk** region — corrupts the already-sorted tail

<!-- Speaker note: If a stable sort is required, heap sort is simply the wrong tool, regardless of its good time complexity. -->

---

<!-- _class: bolum -->

# 6. Priority Queue: The ADT a Heap Serves

<!-- Speaker note: A queue serves whoever arrived first; a priority queue serves whoever matters most, arrival order be damned. -->

---

# The ADT

A **priority queue** manages items, each with
a **priority**. `insert`/`peek`/`extract` map
directly onto the heap operations you just built.

<!-- Speaker note: Almost nothing new here — the heap from section 5 is by far the most common way to implement one. -->

---

# The priority queue ADT

| Operation | What it does | Complexity |
| --- | --- | --- |
| `insert(x)` | Adds `x` with its priority | O(log n) |
| `peek()` | Returns the top item, keeps it | O(1) |
| `extract()` | Removes and returns the top item | O(log n) |
| `update_key(id, p)` | Changes an item's priority | O(n) naive |

<!-- Speaker note: update_key is the one genuinely new operation, and it is the whole reason each item needs a permanent id. -->

---

# update_key — the new piece

- Priority changes → item may need to move
- Better now: **decrease-key** — sift **up**
- Worse now: **increase-key** — sift **down**
- Real uses: Dijkstra's algorithm, OS schedulers

<!-- Speaker note: Each item needs a permanent id, stable no matter where it moves inside the array, or update_key cannot find it again. -->

---

# Priority queue operations, step by step

<iframe class="dsanim" src="anim/priority-queue-ops.html?yer=slayt&lang=en" title="Priority queue operations"></iframe>

<!-- Speaker note: Normal example: min-priority, 10 inserts, a peek, 2 extracts, and one update-key — the same 15,7,22,3,18,... values as section 5's heap-insert. -->

---

# Edge case — extract/peek while empty

<iframe class="dsanim" src="anim/priority-queue-ops.html?yer=slayt&lang=en&example=underflow-first" title="Priority queue: underflow"></iframe>

<!-- Speaker note: The caller checks size > 0, not the heap operations themselves — this scenario shows that check catching underflow safely. -->

---

# Code — Item, insert()

```c
typedef struct {
    int id;
    int key;
} Item;

void insert(int id, int key) {
    heap[size] = (Item){id, key};
    sift_up(size);
    size++;
}
```

<!-- Speaker note: Every item now carries a permanent id alongside its key — the id never moves, even when the item's array slot does. -->

---

# Code — update_key()

```c
void update_key(int id, int new_key) {
    int i = find_by_id(id);
    if (i == -1) { /* … print a message */ return; }
    heap[i].key = new_key;
    if (i > 0 && better(heap[i], heap[(i - 1) / 2]))
        sift_up(i);
    else
        sift_down(i);
}
```

<!-- Speaker note: find_by_id is a linear scan here — a real system adds a hash table from id to index to make this O(log n) too. -->

---

# Complexity

- `insert`, `extract`: **O(log n)**, inherited from the heap
- `peek`: **O(1)**
- `update_key`: **O(n)** with a linear scan for the id
- A hash table id→index cuts that to O(log n)

<!-- Speaker note: That extra bookkeeping is a classic space-for-time trade, worth it once thousands of items are in play. -->

---

# Common mistakes

- Confusing an item's **id** (permanent) with its **array index** (not)
- Calling `peek`/`extract` without checking the queue is non-empty
- Sifting the wrong direction after `update_key`

<!-- Speaker note: Decrease-key needs sift-up; increase-key needs sift-down — using the wrong one leaves the heap silently broken. -->

---

# Mini-quiz

A min-priority scheduler is keyed by "time
to deadline". A running process is just
interrupted by something far more urgent.
Decrease-key or increase-key? Which sift?

<!-- Speaker note: Think about what "more urgent" means for the key's numeric value in a min-priority queue. -->

---

# Answer

**Decrease-key** — more urgent means a
**smaller** key. It triggers **sift-up**, floating
toward the root, which holds the minimum.

<!-- Speaker note: In a min-priority queue, smaller is always better — the same rule as section 5's min-heap. -->

---

<!-- _class: bolum -->

# 7. Heap Variants: Trading One Property for Another

<!-- Speaker note: Each variant below relaxes or changes one property of the plain binary heap, in exchange for a different advantage. -->

---

# The d-ary heap

Same array-backed idea, but every node has
up to **D** children, not 2. Child *c* of node
*i* is at `D*i + 1 + c`; parent at `(i-1)/D`.
D = 2 recovers the ordinary binary heap.

<!-- Speaker note: A larger D makes insert cheaper (fewer levels, one comparison each) but extract more expensive (up to D comparisons per level). -->

---

# D-ary heap extraction, step by step

<iframe class="dsanim" src="anim/dary-heap-sift-down.html?yer=slayt&lang=en" title="D-ary heap extraction"></iframe>

<!-- Speaker note: Normal example: D=3, a min-heap, 3 extractions from 12 values — watch each sift-down compare against up to 3 children at once. -->

---

# Edge case — D=3, drain fully

<iframe class="dsanim" src="anim/dary-heap-sift-down.html?yer=slayt&lang=en&example=drain" title="D-ary heap: drain fully"></iframe>

<!-- Speaker note: All 10 values extracted, one at a time — again comes out fully sorted, exactly like the plain binary heap's drain case. -->

---

# Code — extract() with D children

```c
int extract(void) {
    int best = heap[0];
    size--;
    heap[0] = heap[size];
    int i = 0;
    while (1) {
        int target = i, base = D * i + 1;
        /* ... check up to D children, base..base+D-1 ... */
        if (target == i) break;
        /* ... swap heap[i], heap[target]; i = target ... */
    }
    return best;
}
```

<!-- Speaker note: base = D*i+1 replaces the binary heap's 2*i+1 — every other line of extract stays exactly the same shape. -->

---

# Complexity

- `extract`: **O(D · log<sub>D</sub> n)** — fewer levels, more per level
- `insert`: **O(log<sub>D</sub> n)** — only ever compares one parent
- Larger D: cheaper inserts, potentially costlier extracts

<!-- Speaker note: Popular for insert-heavy workloads like network event schedulers, where extract is comparatively rare. -->

---

# Common mistakes

- Reusing the binary heap's `2*i+1`/`2*i+2` formulas unchanged
- Choosing a large D purely for a shorter tree, ignoring extract's cost

<!-- Speaker note: 2*i+1 and 2*i+2 are just the D=2 special case of D*i+1+c — plug in the wrong D and the wrong array cell gets touched. -->

---

# The binomial heap

Introduced by **Jean Vuillemin**, 1978. A
**forest** of binomial trees; order *k* has
2<sup>k</sup> nodes. An *n*-element heap's orders
are exactly the **set bits** of *n* in binary.

<!-- Speaker note: 13 = 0b1101 decomposes into orders 0, 2, and 3 — trees of size 1, 4, and 8, summing to 13. -->

---

# Union: binary addition with a carry

- Walk orders low to high, like adding two numbers
- One heap has a tree at this order → passes straight through
- **Both** do → they **link**, producing a "carry" one order up
- Up to **three** trees can meet at once: A, B, and an incoming carry

<!-- Speaker note: This "three trees at once" case is exactly what the hard scenario in the animation is built to exercise. -->

---

# Binomial heap union, step by step

<iframe class="dsanim" src="anim/binomial-heap-union.html?yer=slayt&lang=en" title="Binomial heap union"></iframe>

<!-- Speaker note: Normal example: min, A has 7 elements (orders 0,1,2), B has 5 (orders 0,2) — watch the carries ripple upward. -->

---

# Edge case — one long carry chain

<iframe class="dsanim" src="anim/binomial-heap-union.html?yer=slayt&lang=en&example=full-cascade" title="Binomial heap: long carry chain"></iframe>

<!-- Speaker note: A (order 3) union B (order 3): a single carry ripples through every order, just like adding 1000 + 1000 in binary. -->

---

# Code — union_heaps()

```c
void union_heaps(Node *a[], Node *b[], Node *result[]) {
    Node *carry = NULL;
    for (int order = 0; order < MAX_ORDER; order++) {
        Node *group[3]; int g = 0;
        if (a[order]) group[g++] = a[order];
        if (b[order]) group[g++] = b[order];
        if (carry) group[g++] = carry;
        carry = NULL;
        /* ... g==0: none; g==1: pass through ... */
        /* ... g>=2: link() two trees, carry up ... */
    }
}
```

<!-- Speaker note: link() makes the worse root a new leftmost child of the better root — O(1), just a handful of pointer updates. -->

---

# Complexity

- `link`: **O(1)** — a few pointer reassignments
- `union`: visits at most O(log n) orders — **O(log n)**
- `insert` is defined as `union` with one order-0 tree — also O(log n)

<!-- Speaker note: A plain binary heap's insert is also O(log n), but for a completely different reason: sift-up, not linking. -->

---

# Common mistakes

- Handling only **two** trees meeting at an order, forgetting the carry makes three
- Re-deriving `insert` from scratch instead of just calling `union`

<!-- Speaker note: insert is not a separate algorithm to memorize — it is exactly union_heaps with a single-element second heap. -->

---

# The leftist heap

Introduced by **C. A. Crane**, 1972. A pointer
tree, generally **not** complete, built around
one operation: **merge**. `insert` and `extract`
both fall out of it as special cases.

<!-- Speaker note: insert is merge with one new node; extract is merge of the root's two children, after the root itself is removed. -->

---

# The leftist property

- Every node tracks its **null path length (npl)**
- `NULL` has npl −1; a leaf has npl 0
- **Leftist:** left child's npl never smaller than the right's
- Consequence: the **right spine** is always O(log n) long

<!-- Speaker note: The tree may be wildly unbalanced overall — only the right spine is guaranteed short, and merge only ever walks that spine. -->

---

# Leftist heap merge, step by step

<iframe class="dsanim" src="anim/leftist-heap-merge.html?yer=slayt&lang=en" title="Leftist heap merge"></iframe>

<!-- Speaker note: Normal example: min, A has 5 elements, B has 6 — watch merge splice down both right spines, then fix npls on the way back up. -->

---

# Edge case — merging with an empty heap

<iframe class="dsanim" src="anim/leftist-heap-merge.html?yer=slayt&lang=en&example=empty-a" title="Leftist heap: A is empty"></iframe>

<!-- Speaker note: A is empty, merging with an 11-element B — merge's two base cases (t1 == NULL, t2 == NULL) handle this immediately. -->

---

# Code — merge() (recursive)

```c
Node *merge(Node *t1, Node *t2) {
    if (t1 == NULL) return t2;
    if (t2 == NULL) return t1;
    if (!better(t1->key, t2->key)) {
        Node *tmp = t1; t1 = t2; t2 = tmp;
    }
    t1->right = merge(t1->right, t2);
    if (npl(t1->left) < npl(t1->right)) {
        /* ... swap t1->left and t1->right ... */
    }
    t1->npl = npl(t1->right) + 1;
    return t1;
}
```

<!-- Speaker note: The better root always wins and absorbs the other tree into its own right side, then the swap restores the leftist property. -->

---

# Complexity

- `merge`: **O(log n)**, bounded by both right spines
- `insert`, `extract`: both defined via `merge` — same O(log n)
- Holds regardless of how unbalanced the rest of the tree is

<!-- Speaker note: Only the right spine's length matters, and the leftist property guarantees it is always short. -->

---

# Common mistakes

- Confusing **npl** (distance to nearest missing child) with **height**
- Skipping the child-swap after merge — silently breaks the leftist property

<!-- Speaker note: Skip that swap, and the whole O(log n) short-right-spine guarantee quietly stops holding. -->

---

# Mini-quiz

You need to merge two large heaps together,
far more often than inserting single items.
Which variant fits best?

<!-- Speaker note: Think about which structure has no fast way to merge two whole heaps at all. -->

---

# Answer

The **leftist heap** (or the **binomial heap**).
Both are built so merge/union costs only
O(log n) — a plain or d-ary heap has no fast
way to merge two whole heaps at all.

<!-- Speaker note: A plain array heap's only way to merge is re-inserting every element of one heap into the other, one at a time. -->

---

<!-- _class: bolum -->

# 8. Huffman Coding

<!-- Speaker note: The payoff for everything this week has built: a heap of trees, and nothing else, produces an optimal compressed code. -->

---

# A question to start

Plain ASCII spends 8 bits on every character,
`E` or `Z` alike. What if common characters
got **short** codes, and rare ones **long** —
like Morse code already does?

<!-- Speaker note: The catch: mixed-length codes in one bitstream could be ambiguous to decode, unless built with one very specific property. -->

---

# A short history

- **1952** — David Huffman, a term paper at MIT
- Professor Fano's own scheme was good, but not optimal
- Huffman's greedy tree-merging is **provably** optimal
- Still inside ZIP, JPEG, and MP3 today

<!-- Speaker note: Huffman's professor offered the class a choice: take the final exam, or find a provably optimal prefix code — Huffman found one. -->

---

# Building the tree

Put every symbol in a **min-heap**, keyed by
frequency. Repeatedly: pop the two **smallest**
roots, make a new internal node with those
two as children, push it back. Repeat to one.

<!-- Speaker note: Rare symbols merge early, staying near the bottom; common symbols merge late, staying near the top — exactly what gives them short codes. -->

---

# Building the Huffman tree, step by step

<iframe class="dsanim" src="anim/huffman-build.html?yer=slayt&lang=en" title="Building the Huffman tree"></iframe>

<!-- Speaker note: Normal example: 10 symbols with English-letter-like frequencies — watch the two smallest roots merge, again and again. -->

---

# Edge case — the smallest meaningful example

<iframe class="dsanim" src="anim/huffman-build.html?yer=slayt&lang=en&example=two-symbols" title="Huffman build: two symbols"></iframe>

<!-- Speaker note: Just 2 symbols: one merge, one root, done — the smallest input for which "build a tree" even means anything. -->

---

# Code — the merge loop

```c
int merge_id = 256;
while (heap_size > 1) {
    Node *a = heap_pop();
    Node *b = heap_pop();
    Node *parent = new_internal(a, b, merge_id++);
    heap_push(parent);
}
Node *root = heap_pop();
```

<!-- Speaker note: heap_pop/heap_push are exactly section 5's min-heap extract/insert, ordering Node pointers instead of plain ints. -->

---

# Encoding and decoding

A symbol's **code** is its root-to-leaf path:
left = `0`, right = `1`. **Decoding** walks bit
by bit from the root; a leaf emits a character
and restarts. This works because the code is
**prefix-free**.

<!-- Speaker note: Every symbol is exactly one leaf, and a leaf has no children — so no code can ever be a prefix of another. -->

---

# Encoding and decoding, step by step

<iframe class="dsanim" src="anim/huffman-encode-decode.html?yer=slayt&lang=en" title="Huffman encoding and decoding"></iframe>

<!-- Speaker note: Normal example: "ABRACADABRA", 11 characters — 88 plain-ASCII bits shrink to 23, because A alone is 5 of the 11 characters. -->

---

# Edge case — very skewed: 9 A's, 1 B

<iframe class="dsanim" src="anim/huffman-encode-decode.html?yer=slayt&lang=en&example=skewed" title="Huffman: skewed frequencies"></iframe>

<!-- Speaker note: Only 2 symbols left, so 1 bit per character is the best possible — 10 bits instead of 80, no matter how skewed the frequencies are. -->

---

# Code — assign_codes() (walk the tree)

```c
static void assign_codes(Node *node, char *path,
                          int depth) {
    if (node->left == NULL && node->right == NULL) {
        path[depth] = '\0';
        strcpy(codes[(unsigned char) node->ch], path);
        return;
    }
    path[depth] = '0';
    assign_codes(node->left, path, depth + 1);
    path[depth] = '1';
    assign_codes(node->right, path, depth + 1);
}
```

<!-- Speaker note: Only leaves ever record a code; every internal node just extends the path with a 0 (left) or a 1 (right). -->

---

# Code — decode() (walk bit by bit)

```c
static char *decode(const char *bits, Node *root,
                     char *out) {
    int n = 0;
    Node *node = root;
    for (int i = 0; bits[i] != '\0'; i++) {
        node = bits[i] == '0' ? node->left : node->right;
        if (node->left == NULL && node->right == NULL) {
            out[n++] = node->ch;
            node = root;
        }
    }
    out[n] = '\0';
    return out;
}
```

<!-- Speaker note: One tree step per bit; the moment a leaf is reached, emit its character and restart the walk from the root. -->

---

# Complexity

- Building: n − 1 merges, O(log n) each — **O(n log n)**
- Encoding: **O(L)** — one lookup and append per character
- Decoding: **O(B)** — one tree step per encoded bit

<!-- Speaker note: L is the text's length in characters; B is the encoded message's length in bits. -->

---

# Common mistakes

- No deterministic tie-breaker — equal frequencies can build two different, equally optimal trees
- Assuming the code table is fixed, like ASCII — it is built **per message**
- Testing `decode` alone, never the full `decode(encode(text)) == text` round trip

<!-- Speaker note: The decoder always needs either the tree or the frequency table shipped alongside the encoded bits. -->

---

# Mini-quiz

In a Huffman tree, can one symbol's code
ever be a **prefix** of another symbol's code?

<!-- Speaker note: Think about what a leaf's position in the tree does, and does not, allow. -->

---

# Answer

**No.** Every symbol is exactly one **leaf**,
and a leaf has no children — so no code can
ever be extended into a different, longer code.

<!-- Speaker note: This "prefix-free" property is exactly what makes single-pass, unambiguous decoding possible. -->

---

# Summary — trees, shapes, traversals, array

| Idea | Key fact |
| --- | --- |
| Tree | One root, no cycles, n−1 edges for n nodes |
| Binary tree shapes | Full, complete, perfect, degenerate, balanced |
| Traversals | Pre/in/post (recursive), iterative, level order |
| Array representation | `2i+1`, `2i+2`, `(i-1)/2` — all O(1) |

<!-- Speaker note: Five ways to visit the same tree, and one way to store a complete one without a single pointer. -->

---

# Summary — heaps, priority queues, Huffman

| Idea | Key fact |
| --- | --- |
| Binary heap | insert/extract O(log n); build O(n) |
| Heap sort | O(n log n), in place, **not** stable |
| Priority queue | `update_key` needs a stable id |
| Variants | d-ary (faster insert), binomial/leftist (fast merge) |
| Huffman coding | Min-heap of trees; prefix-free codes |

<!-- Speaker note: Every one of these five rows is built from the same two moves: sift-up and sift-down. -->

---

# The big picture

One structure, the **heap**, built from two
moves — sift-up, sift-down — produces a
sort, a priority queue, three variants, and
an optimal compression code.

<!-- Speaker note: If a student remembers only one sentence from today, this is the one worth remembering. -->

---

# Self-check round

Four short questions. Think before the answer
appears on the next slide. Full exercises and
a ten-question quiz are in the week notes.

<!-- Speaker note: These mirror the self-check quiz at the end of the written notes, one question per slide, with a shorter set here. -->

---

# 1. What is the maximum number of nodes in a binary tree of height 4?

<!-- Speaker note: Ask, wait, then advance. -->

---

# 2<sup>5</sup> − 1 = 31 nodes — a perfect tree of that height.

<!-- Speaker note: The same formula from section 2, just with h = 4. -->

---

# 2. In a complete tree stored in an array, what is the parent index of node 9?

<!-- Speaker note: Apply the formula from section 4. -->

---

# `(9 - 1) / 2 = 4`, using integer division.

<!-- Speaker note: Same formula, every time, regardless of the tree's size. -->

---

# 3. Why is building a heap from n items O(n), not the "obviously plausible" O(n log n)?

<!-- Speaker note: Recall the height-weighted sum from section 5.5. -->

---

# Most nodes are near the bottom, where sift-down is cheap; the sum converges to O(n).

<!-- Speaker note: The few costly sifts near the top are heavily outnumbered by the many cheap ones near the bottom. -->

---

# 4. In a priority queue, why does every item need a permanent, stable id?

<!-- Speaker note: Recall what changes on almost every operation. -->

---

# An item's array position changes on nearly every operation; only the id stays fixed.

<!-- Speaker note: update_key needs some way to find "this specific item" that does not depend on where it currently sits. -->

---

<!-- _class: baslik -->

# Next week

**Week 5 — Graphs and Traversals**

Drop "no cycles, one parent" and a tree
becomes a **graph**. Level order generalizes
to BFS; the priority queue you built today
becomes the engine inside Dijkstra's algorithm.

<!-- Speaker note: update_key was built for exactly this: "repeatedly extract the closest item, then maybe lower some other item's priority." -->

---

# References (1/2)

- Course syllabus, Week 4: `docs/syllabus/syllabus.en.md`
- Cormen, Leiserson, Rivest, Stein. *Introduction to
  Algorithms*, 4th ed. MIT Press
- Sedgewick, Wayne. *Algorithms*, 4th ed. Addison-Wesley
- Knuth. *The Art of Computer Programming, Vol. 1*, 3rd ed.

<!-- Speaker note: These are the same references listed at the end of the week's written notes. -->

---

# References (2/2)

- Huffman (1952) · Williams (1964) · Floyd (1964)
- Vuillemin (1978) — the binomial heap
- Cayley (1857) — the first tree-counting paper
- williamfiset/Algorithms · Programiz DSA

<!-- Speaker note: The historical references — Huffman, Williams, Floyd, Vuillemin, Cayley — are what today's "short history" slides drew on. -->
