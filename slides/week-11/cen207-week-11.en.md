---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 11 — Advanced Trees"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 11"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Advanced Trees

**CEN207 Data Structures — Week 11**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!--
Speaker note: Today we add an ORDERING rule to trees for the first time, then spend the rest of the week keeping that ordered tree from becoming a linked list in disguise.
-->

---

# Today's plan (3 hours)

| Hour | Topic |
| --- | --- |
| 1 | BST: insert, search, delete, why balance matters |
| 2 | AVL (4 rotations, insert, delete) · red-black · splay |
| 3 | 2-3 tree · segment tree · Fenwick tree · choosing a technique |

**Learning outcomes:** LO.1 (explain fundamental data structures) · LO.2 (analyze complexity) · LO.7 (choose the right structure)

<!-- Speaker note: Twelve animations carry the whole lecture, one appears the moment its idea is introduced. -->

---

# This week's concepts — where

| Concept | Where |
| --- | --- |
| BST insert/search/delete, degenerate case | Section 1 |
| AVL, red-black, splay, 2-3 tree | Sections 2–5 |
| Segment tree, Fenwick tree | Sections 6–7 |
| Choosing a technique | Section 8 |

<!-- Speaker note: Every term gets a full definition the first time it appears; this table just says where to find it again. -->

---

# How the code examples work

- Every idea has a complete **C** and **Java** program
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Sources: `code/week-11/c/` and `code/week-11/java/`
- Each program's expected output is in the week notes

<!-- Speaker note: Open a terminal now if you want to run these live; every snippet on today's slides compiles and runs exactly as shown. -->

---

# Bridge from Week 4

- Week 4 gave you **tree vocabulary**: root, leaf, depth, height, subtree
- Week 4 gave you **traversals**: inorder, preorder, postorder, level-order
- Week 4's heap was never **ordered** left-vs-right, only parent-vs-child
- Today's trees add an ordering rule for the first time

<!-- Speaker note: Nothing new about "what a tree is" is needed today — only a new rule about how keys are arranged inside one. -->

---

# Recap — Week 4: height and depth

- **Depth** of a node = edges from the root to it (root = 0)
- **Height** of a tree = greatest depth of any node
- Empty tree: height -1 by convention; one node: height 0
- Today: height is the single number that decides every cost

<!-- Speaker note: Every complexity claim this week is "O(height)" — so today is really about controlling that one number. -->

---

# Map of the week — the one rule

- A **binary search tree**: left subtree smaller, right subtree larger
- That rule alone gives fast search — IF the tree stays shallow
- Four different strategies keep it shallow: AVL, red-black, splay, 2-3
- Two more trees answer **range** questions instead of single-key ones

<!-- Speaker note: Ask the class: what could go wrong with just "left smaller, right larger" and nothing else? The answer is coming in section 1.4. -->

---

# Map of the week — at a glance

| Balanced BSTs | Range-query trees |
| --- | --- |
| AVL — strict balance factor | Segment tree — build once, query O(log n) |
| Red-black — looser, color-based | Fenwick tree — one array, `i & -i` |
| Splay — no balance, adapts to use | — |
| 2-3 tree — grows only at the root | — |

<!-- Speaker note: Every box gets its own slides below, most with a short animation and a complete C/Java program. -->

---

# Recap — Week 4: traversals

- **Inorder**: left, visit, right — sorted order on a BST
- **Preorder**: visit, left, right — copies a tree's shape
- **Postorder**: left, right, visit — safe for deleting a tree
- **Level-order**: an explicit queue, breadth-first

<!-- Speaker note: Every "Expected output" block today prints an INORDER listing — watch it stay sorted at every step. -->

---

# Vocabulary check

| Term | Meaning |
| --- | --- |
| Balance factor | height(left) − height(right) |
| Rotation | O(1) local pointer rearrangement |
| Amortized cost | averaged over a long operation sequence |
| Invertible operation | undoable via subtraction (sum, not min) |

<!-- Speaker note: These four terms recur across almost every section today — point back here if anyone loses track. -->

---

<!-- _class: bolum -->

# 1. The Binary Search Tree

<!-- Speaker note: Section 1 builds the BST from scratch: insert, search, delete, then the case where it all goes wrong. -->

---

# A question to start

Week 1: sorted array, binary search — fast, but inserting costs O(n).
Week 2: linked list — insert O(1), but search needs O(n).

Is there a structure that does BOTH better than O(n)?

<!-- Speaker note: Let the pause land. The answer, the binary search tree, is one single ordering rule. -->

---

# A short history

- BST ideas appear independently **1959–1962**
- P. F. Windley, A. D. Booth & A. J. T. Colin, T. N. Hibbard
- **Hibbard, 1962** — usually credited for working out deletion
- Deletion is exactly what section 1.4 covers today

<!-- Speaker note: Insertion and search are the "easy" half; deletion is the half that took a dedicated paper to get right. -->

---

# Intuition — a phone book, but a tree

- Open to the middle page: is your name before or after it?
- Keep halving — that is binary search on an array
- A BST bakes that same halving into the **shape** of the structure
- Rule at every node: left smaller, right larger

<!-- Speaker note: The phone book picture only works because the book is sorted — the BST's rule is what keeps that "sorted" property, everywhere, always. -->

---

# The BST ADT

| Operation | What it does | Complexity |
| --- | --- | --- |
| `insert(key)` | Adds key; duplicate ignored | O(h) |
| `search(key)` | Reports present or not | O(h) |
| `delete(key)` | Removes key if present | O(h) |
| `min` / `max` | Smallest / largest key | O(h) |

<!-- Speaker note: h is the tree's CURRENT height — section 1.4 is entirely about what happens when h is not small. -->

---

# In memory — insert's idea

- Walk down from the root, comparing `key` at every node
- Smaller → go left; larger → go right; equal → duplicate, stop
- Reach a `NULL` child → that is the new node's spot
- Link it in; nothing else in the tree moves

<!-- Speaker note: Exactly like a search, except the walk ends by CREATING a node instead of failing. -->

---

# Binary search tree: insert

<iframe class="dsanim" src="anim/bst-insert.html?yer=slayt&lang=en" title="Binary search tree: insert"></iframe>

<!-- Speaker note: Normal example: 10 keys in a mixed order. Watch the new leaf attach exactly where the comparisons led. -->

---

# Code — bst_insert()

```c
Node *bst_insert(Node *root, int key) {
    Node *cur = root, *parent = NULL;
    while (cur != NULL) {
        parent = cur;
        if (key == cur->key) return root;
        if (key < cur->key)  cur = cur->left;
        else                 cur = cur->right;
    }
    Node *n = malloc(sizeof(Node));
    n->key = key; n->left = NULL; n->right = NULL;
```

<!-- Speaker note: The walk down is identical to search; only what happens at the NULL is different. -->

---

# Code — bst_insert(), linking in

```c
    if (parent == NULL) return n;
    if (key < parent->key) parent->left = n;
    else                    parent->right = n;
    return root;
}
```

<!-- Speaker note: One comparison decides left or right; that is the whole "linking in" step. -->

---

# Expected output

```text
insert(50): inorder = 50  height = 0
insert(30): inorder = 30 50  height = 1
insert(70): inorder = 30 50 70  height = 1
insert(20): inorder = 20 30 50 70  height = 2
```

<!-- Speaker note: The inorder listing is always sorted, at every single step — that is the ordering rule made visible. -->

---

# Why insert is O(h)

- One comparison per level visited, at most
- Never revisits a node once passed
- h small (balanced) → fast; h large (chain) → slow
- Section 1.4 shows exactly how large h can get

<!-- Speaker note: "One comparison per level" is the whole complexity argument — no hidden loops anywhere. -->

---

# Common mistake

- Forgetting to `root = bst_insert(root, key);`
- Without reassigning, the caller's `root` never updates
- C/Java pass pointers/references **by value** here
- The function must **return** the (possibly new) root

<!-- Speaker note: This bug is silent — the program runs, just never actually grows the tree. -->

---

# Mini question

In the animation's "ascending order" edge case, every new
key becomes a RIGHT child. Why never a left one?

<!-- Speaker note: Answer on the next slide — give the audience 20 seconds first. -->

---

# Mini answer

- Every later key is larger than everything already inserted
- So every comparison during the walk says "go right"
- The tree leans entirely to the right — a chain
- This is exactly section 1.4's topic, next

<!-- Speaker note: This single observation is the seed of the whole "why balance matters" story. -->

---

# A question to start — search

`insert` already walks down comparing keys.
`search` is almost the same walk — how many nodes, worst case?

<!-- Speaker note: The answer is "at most h+1" — but what IS h, really? Patience — section 1.4. -->

---

# The idea — search

- Equal → found; smaller → only the left subtree can have it
- The ordering rule GUARANTEES the right subtree cannot
- Larger → mirror image
- `NULL` reached before a match → not present

<!-- Speaker note: "Only the left subtree can have it" is a guarantee, not a guess — that is what the BST rule buys you. -->

---

# Binary search tree: search

<iframe class="dsanim" src="anim/bst-search.html?yer=slayt&lang=en" title="Binary search tree: search"></iframe>

<!-- Speaker note: Watch the probe counter — every step down costs exactly one comparison, never more. -->

---

# Code — bst_search()

```c
int bst_search(Node *root, int key) {
    Node *cur = root;
    probes = 0;
    while (cur != NULL) {
        probes++;
        if (key == cur->key) return 1;
        if (key < cur->key) cur = cur->left;
        else                cur = cur->right;
    }
    return 0;
}
```

<!-- Speaker note: Same shape as insert's walk, minus the "create a node" step at the end. -->

---

# Expected output

```text
search(65): found, 4 probes
search(20): found, 3 probes
search(55): not found, 3 probes
search(100): not found, 4 probes
```

<!-- Speaker note: "Not found" costs a real number of probes too — it is not free, it just stops at a NULL instead of a match. -->

---

# Why search is O(h)

- Same one-comparison-per-level argument as insert
- Best case O(1): the root itself
- Worst case: as deep as the tree gets
- Again: everything hinges on h

<!-- Speaker note: We will keep saying "everything hinges on h" until section 1.4 makes it unavoidable to care. -->

---

# Common mistake

- Treating "not found" as an error condition
- It is a normal, expected outcome, not a crash
- The `while (cur != NULL)` guard handles it cleanly
- Continuing to compare after a match (off-by-one) also wastes work

<!-- Speaker note: A search that "fails" is doing its job correctly — the key genuinely was not there. -->

---

# Mini question

search(10) on a 10-node ascending-insert chain costs 10 probes.
search(1) costs only 1. Why such a big gap?

<!-- Speaker note: Answer on the next slide. -->

---

# Mini answer

- That tree is a pure chain: 1 at the root, 10 at the deepest leaf
- Root's own key: one comparison
- Deepest leaf: one comparison per level down to it
- height + 1 comparisons, worst case

<!-- Speaker note: This is the SAME chain from the insert mini-answer — same cause, same consequence. -->

---

# A question to start — delete

Deleting a **leaf** is easy: detach it.
Deleting a node with **two children** is not. Why not?

<!-- Speaker note: You cannot just remove it — something has to take its place while keeping order intact. -->

---

# The idea — three cases

| Case | Fix |
| --- | --- |
| Leaf | Detach it |
| One child | Parent links directly to the child |
| Two children | Copy in the in-order successor's key, then delete IT |

<!-- Speaker note: Successor = smallest key in the right subtree — walk left from the right child as far as possible. -->

---

# Binary search tree: delete

<iframe class="dsanim" src="anim/bst-delete.html?yer=slayt&lang=en" title="Binary search tree: delete"></iframe>

<!-- Speaker note: The normal example deliberately hits all three cases across its four deletes — watch for each one. -->

---

# Code — bst_delete(), finding the node

```c
Node *bst_delete(Node *root, int key) {
    Node *cur = root, *parent = NULL;
    while (cur != NULL && key != cur->key) {
        parent = cur;
        cur = (key < cur->key) ? cur->left : cur->right;
    }
    if (cur == NULL) return root;
```

<!-- Speaker note: Not found is a genuine no-op — the tree is returned completely unchanged. -->

---

# Code — bst_delete(), two children

```c
    if (cur->left != NULL && cur->right != NULL) {
        Node *succ = cur->right, *succParent = cur;
        while (succ->left != NULL) {
            succParent = succ; succ = succ->left;
        }
        cur->key = succ->key;
        parent = succParent; cur = succ;
    }
```

<!-- Speaker note: After this block, cur points at the SUCCESSOR — which now has at most one child, reducing to case 1 or 2. -->

---

# Expected output

```text
delete(35): inorder = 20 30 40 50 60 65 70 80 90
delete(70): inorder = 20 30 40 50 60 65 80 90
delete(50): inorder = 20 30 40 60 65 80 90
delete(20): inorder = 30 40 60 65 80 90
```

<!-- Speaker note: The inorder list stays sorted after every single delete — that is the invariant being preserved. -->

---

# Why delete is O(h)

- Finding the node: O(h)
- Finding a successor: at most another O(h)
- Never revisits nodes already on the search path
- Same worst case as insert and search

<!-- Speaker note: Two O(h) walks back-to-back is still O(h), not O(h squared) — they never overlap. -->

---

# Common mistake

- Copying the successor's key but forgetting to delete ITS node
- The key now exists twice in the tree
- Successor vs. predecessor: either works, but stay consistent
- Forgetting `free()` in C — a real memory leak

<!-- Speaker note: AddressSanitizer (our --sanitize pass) catches exactly this leak — we found and fixed similar bugs while building this week. -->

---

# Mini question

Why is a BST delete's successor guaranteed to have
AT MOST one child?

<!-- Speaker note: Answer on the next slide. -->

---

# Mini answer

- Successor = leftmost node of the right subtree
- Leftmost means: no left child, by definition
- May or may not have a right child
- Never both — so it is always case 1 or case 2

<!-- Speaker note: This is why the two-children case always safely reduces to one of the simpler two cases. -->

---

# A question to start — degenerate

Every section so far states cost as O(h).
What IS h, concretely, for n keys in an arbitrary order?

<!-- Speaker note: We have been avoiding this question on purpose — time to face it. -->

---

# The idea — order, not just the key set

- Every technique compares VALUES, never looks at tree SHAPE
- Sorted input: every new key is bigger than everything so far
- Every new key attaches one level deeper than the last
- The tree **degenerates** into a chain: height n − 1

<!-- Speaker note: "Binary search tree" alone promises nothing about height — only VALUE ordering, not shape. -->

---

# Why balancing matters

<iframe class="dsanim" src="anim/bst-degenerate.html?yer=slayt&lang=en" title="Why balancing matters"></iframe>

<!-- Speaker note: Normal: 10 ascending keys, height 9. Compare against the ideal height of 3 for 10 nodes. -->

---

# The same keys, shuffled

<iframe class="dsanim" src="anim/bst-degenerate.html?yer=slayt&example=edge-shuffled-same-keys&lang=en" title="Why balancing matters: shuffled"></iframe>

<!-- Speaker note: SAME 10 keys, different order: height 3, not 9. Identical key set, wildly different shape — order is everything. -->

---

# Expected output

```text
insert(10): height = 9  (ideal for 10 nodes = 3)
final: n = 10, height = 9, ideal = 3
```

vs. the shuffled edge case: `final: n = 10, height = 3, ideal = 3`

<!-- Speaker note: 9 versus 3 — nearly triple the height, same 10 keys, only the arrival order differs. -->

---

# Why this matters for complexity

- Worst case height: n − 1 (sorted or reverse-sorted input)
- Every operation from sections 1.1–1.4 becomes O(n)
- Average case (random order): O(log n) — but "random" is not guaranteed
- Sorted input is common in practice: imports, replayed logs

<!-- Speaker note: "BST" alone guarantees AT MOST O(n) and AT BEST O(log n) — nothing in between is promised. -->

---

# Common mistake

- Assuming "it's a BST" means O(log n) automatically
- Benchmarking only with random test data
- Random data HIDES this exact failure mode
- Only a SELF-BALANCING BST guarantees O(log n) worst case

<!-- Speaker note: This slide is the hinge of the whole lecture — everything from here on exists because of this one gap. -->

---

# Mini question

You must build a BST from data you KNOW is already sorted.
Cheapest fix, without switching tree types?

<!-- Speaker note: Answer on the next slide. -->

---

# Mini answer

- Shuffle the keys into random order before inserting
- Or: recursively pick the middle element as root, recurse both halves
- Builds a perfectly balanced tree directly, O(n), no rotations
- Sections 2–5 solve the GENERAL problem automatically

<!-- Speaker note: Next: four different strategies that never need to know the input was sorted in advance. -->

---

<!-- _class: bolum -->

# 2. AVL Trees

<!-- Speaker note: The first self-balancing BST ever published — a strict rule, enforced everywhere, every time. -->

---

# A question to start

We need a BST that stays shallow no matter what
order operations arrive in. Does one exist?

<!-- Speaker note: Real programs insert and delete over time — we cannot always pre-sort or pre-shuffle. -->

---

# A short history

- **1962** — Georgy Adelson-Velsky & Evgenii Landis
- "AVL" = their initials
- First self-balancing binary search tree ever published
- Idea: track a **balance factor** at every node

<!-- Speaker note: bf = height(left) - height(right). Kept in {-1, 0, +1} everywhere, always. -->

---

# The four rotation cases

| Case | Shape | Fix |
| --- | --- | --- |
| LL | left-heavy, left child left-heavy | one right rotation |
| RR | right-heavy, right child right-heavy | one left rotation |
| LR | left-heavy, left child right-heavy | rotate left child left, then right |
| RL | right-heavy, right child left-heavy | rotate right child right, then left |

<!-- Speaker note: LR and RL are "double rotations" — two single rotations applied back to back. -->

---

# AVL: the four rebalancing cases

<iframe class="dsanim" src="anim/avl-rotations.html?yer=slayt&lang=en" title="AVL tree: the four rebalancing cases"></iframe>

<!-- Speaker note: Step through LL, RR, LR, RL in the picker — each is a separate preset, built the same way. -->

---

# No rotation needed

<iframe class="dsanim" src="anim/avl-rotations.html?yer=slayt&example=none&lang=en" title="AVL tree: no rotation needed"></iframe>

<!-- Speaker note: Contrast case: an insertion that never violates the balance factor at all. Not every insert rotates. -->

---

# Mini question

After ONE insertion, how many rotations can an
AVL tree need, at most?

<!-- Speaker note: Answer on the next slide. -->

---

# Mini answer

- At most ONE single rotation, or ONE double rotation
- The fix restores the subtree's PRE-insertion height exactly
- So no ancestor further up can have become unbalanced
- Insert never needs to propagate a fix upward

<!-- Speaker note: This is proven, not just observed — it is why AVL insert stays O(log n) with tiny constant work. -->

---

# AVL insert — the idea

- Plain recursive BST insert
- On the way back UP the call stack: `update_height`, then `rebalance`
- Check happens at EVERY level as recursion unwinds
- First (and only) unbalanced node found is fixed immediately

<!-- Speaker note: Two extra lines, added to the same insert you already know from section 1. -->

---

# AVL tree: insert

<iframe class="dsanim" src="anim/avl-insert.html?yer=slayt&lang=en" title="AVL tree: insert, with balance factors"></iframe>

<!-- Speaker note: Watch bf on every node — it never leaves {-1, 0, +1}, even mid-insertion the fix is immediate. -->

---

# Code — rebalance()

```c
Node *rebalance(Node *n) {
    int bf = height(n->left) - height(n->right);
    if (bf > 1  && height(n->left->left)
             >= height(n->left->right))
        return rotate_right(n);
    if (bf > 1) {
        n->left = rotate_left(n->left);
        return rotate_right(n);
    }
```

<!-- Speaker note: The decision compares the CHILD's balance factor, not the just-inserted key — this form works for delete too. -->

---

# Expected output — ascending keys

```text
insert(10): height = 3
```

Section 1.4's plain BST reached **height 9** for the SAME 10 ascending keys.

<!-- Speaker note: Same worst-case input that broke a plain BST — AVL handles it without breaking a sweat. -->

---

# Why AVL is O(log n)

- Height never exceeds 1.44 · log2(n + 2)
- Every operation is O(log n) — WORST case, not just average
- insert: at most one (double) rotation
- delete: up to O(log n) rotations, but each is O(1)

<!-- Speaker note: This is the guarantee section 1.4 was missing — worst case, not just average case. -->

---

# Common mistake

- Forgetting `update_height` before checking balance factor
- `rebalance` then reads a STALE height
- Deciding LL vs LR by the just-inserted key (breaks for delete)
- The balance-factor-based decision works for both insert AND delete

<!-- Speaker note: This exact family of bugs is what makes AVL delete trickier to write correctly than insert. -->

---

# AVL delete — rebalancing can cascade

- Reuses section 1.4's exact splice logic (leaf/one/two children)
- Difference: `rebalance` runs at EVERY ancestor, not just the first
- A delete can shrink a subtree's height
- That shrink can keep propagating all the way to the root

<!-- Speaker note: Unlike insert, delete's fix does NOT always restore the pre-operation height — so the check must continue upward. -->

---

# AVL tree: delete

<iframe class="dsanim" src="anim/avl-delete.html?yer=slayt&lang=en" title="AVL tree: delete, cascading rebalance"></iframe>

<!-- Speaker note: The hard scenario is built so at least one delete cascades — watch for more than one rotation firing. -->

---

# Expected output

```text
delete(90): height = 3, inorder = 10 20 25 30 ...
delete(45): height = 3, inorder = 10 20 25 30 ...
```

Height stays 3 across all six deletes — always rebalanced.

<!-- Speaker note: The tree never leaves the AVL invariant, even mid-sequence, even while shrinking toward empty. -->

---

# Why AVL delete is still O(log n)

- Up to O(log n) rotations — one per ancestor level, worst case
- Each individual rotation is still O(1)
- O(log n) rotations × O(1) each = O(log n) total
- Same asymptotic bound as insert, just a bigger constant

<!-- Speaker note: "More rotations" does not mean "worse complexity class" — it is still logarithmic, just not as tight a constant as insert. -->

---

# Common mistake

- Assuming delete, like insert, needs only one rotation
- The "hard" scenario is deliberately built to disprove this
- Forgetting `free()` the spliced node in C (a leak)
- Not testing "delete every key down to empty" explicitly

<!-- Speaker note: We built exactly this "delete to empty" edge case as a unit test — it is worth doing for your own trees too. -->

---

# Mini question

An AVL tree of height h has AT LEAST how many nodes?

<!-- Speaker note: Answer on the next slide. -->

---

# Mini answer

- N(h) = 1 + N(h−1) + N(h−2) — the Fibonacci recurrence
- N(h) grows EXPONENTIALLY in h
- So h grows only LOGARITHMICALLY in n
- That is the whole proof, in one line

<!-- Speaker note: Same recurrence as the rabbits problem — just applied to tree shapes instead of population growth. -->

---

<!-- _class: bolum -->

# 3. Red-Black Trees

<!-- Speaker note: A looser, color-based balance — fewer rotations in practice, the standard library's usual choice. -->

---

# A question to start

AVL's strict balance factor can require rebalancing
on almost every insertion. Is there a looser rule?

<!-- Speaker note: "Looser" here means: tolerate more imbalance before a fix is required. -->

---

# A short history

- **1972** — Rudolf Bayer: "symmetric binary B-trees"
- **1978** — Guibas & Sedgewick: the "red-black" name
- Modern insertion algorithm dates from 1978
- Four simple, LOCAL rules instead of exact height comparison

<!-- Speaker note: Same era as the 2-3 tree (section 5) — Bayer's work connects both. -->

---

# The four rules

- Every node is **red** or **black**
- The root is always **black**
- A red node never has a red child ("no two reds in a row")
- Every root-to-NULL path has the same **black-height**

<!-- Speaker note: A new key is inserted RED — this can only break rule 3, never rule 4. -->

---

# The three fixup cases

| Case | Situation | Fix |
| --- | --- | --- |
| 1 | Uncle is RED | recolor parent+uncle black, grandparent red, continue up |
| 2 | Uncle black, "triangle" | rotate parent, reduces to case 3 |
| 3 | Uncle black, "line" | rotate grandparent + recolor, done |

<!-- Speaker note: "Uncle" = the parent's sibling — a very common point of confusion, so say it out loud. -->

---

# Red-black tree: insert

<iframe class="dsanim" src="anim/red-black-insert.html?yer=slayt&lang=en" title="Red-black tree: insert"></iframe>

<!-- Speaker note: The normal example is built so all three cases fire across its 10 inserts — watch the colors and the case names. -->

---

# Code — fixup(), case 1

```c
while (z->parent && z->parent->color == RED) {
    Node *p = z->parent, *g = p->parent;
    Node *u = (p == g->left) ? g->right
                              : g->left;
    if (u && u->color == RED) {
        p->color = BLACK; u->color = BLACK;
        g->color = RED; z = g; continue;
    }
```

<!-- Speaker note: Case 1 does not rotate at all — pure recoloring, then the violation may reappear two levels up. -->

---

# Expected output

```text
insert(3): root = 3, bh = 1, inorder = 3B
insert(69): root = 3, bh = 1, inorder = 3B 69R
insert(31): root = 31, bh = 1, inorder = 3R 31B 69R
```

<!-- Speaker note: 3B = key 3, Black. 69R = key 69, Red. bh = black-height of the root. -->

---

# Why red-black is O(log n)

- Height never exceeds 2 · log2(n + 1)
- Proof: no path can be more than twice the shortest
- (red nodes can never be adjacent)
- Slightly looser than AVL's bound, fewer rotations in practice

<!-- Speaker note: This is why C++ std::map, Java TreeMap, and the Linux scheduler all use red-black, not AVL. -->

---

# Common mistake

- Forgetting rule 2 after the fixup loop ends
- Case 1 can walk the violation all the way to the root
- The unconditional `root->color = BLACK;` at the end is NOT optional
- Confusing "uncle" with the new node's own sibling

<!-- Speaker note: Skipping the final recolor is a subtle bug — it only shows up on specific insertion sequences. -->

---

# Mini question

Why can inserting a RED leaf never break rule 4
(equal black-height), only rule 3?

<!-- Speaker note: Answer on the next slide. -->

---

# Mini answer

- A red leaf contributes 0 to any path's black-node count
- Every root-to-leaf black-height stays exactly what it was
- Only rule 3 ("no two reds") can break, and only if the parent is red
- That is exactly the situation fixup is designed to repair

<!-- Speaker note: This is why insertion always starts red — it is the "safer" color to break a rule with. -->

---

<!-- _class: bolum -->

# 4. Splay Trees

<!-- Speaker note: No strict balance at all — the tree adapts to how you actually use it. -->

---

# A question to start

AVL and red-black pay bookkeeping cost on EVERY node,
for EVERY operation — even rarely-touched keys. A different way?

<!-- Speaker note: What if the tree adapted to USAGE PATTERNS instead of enforcing a fixed rule everywhere? -->

---

# A short history

- **1985** — Daniel Sleator & Robert Tarjan
- "Self-adjusting binary search trees"
- No balance information stored at all — zero extra memory per node
- Instead: every access reshapes the tree

<!-- Speaker note: This is a genuinely different philosophy from every other tree today — adapt, don't enforce. -->

---

# The idea — move to the root

| Move | When | What happens |
| --- | --- | --- |
| zig | parent is the root | one single rotation |
| zig-zig | node & parent both left (or both right) children | rotate parent, then node |
| zig-zag | node & parent on opposite sides | rotate node twice |

<!-- Speaker note: zig-zig rotates grandparent-parent BEFORE parent-node — that order is what gives the amortized guarantee. -->

---

# Splay tree: access

<iframe class="dsanim" src="anim/splay-tree.html?yer=slayt&lang=en" title="Splay tree: access moves the key to the root"></iframe>

<!-- Speaker note: The normal example is curated so zig, zig-zig, AND zig-zag all occur — watch for the case name in each caption. -->

---

# Code — splay()

```c
void splay(Node *x) {
    while (x->parent != NULL) {
        Node *p = x->parent, *g = p->parent;
        if (g == NULL) { rotate_up(x); }
        else if ((x == p->left) == (p == g->left))
            { rotate_up(p); rotate_up(x); }
        else { rotate_up(x); rotate_up(x); }
    }
}
```

<!-- Speaker note: rotate_up(n) rotates n over its OWN parent — the case decides how many times, and in what order. -->

---

# Expected output

```text
access(50): root = 50, inorder = 50
access(20): root = 20, inorder = 10 20 30 40 45 50 60 70 80
```

The just-accessed key is ALWAYS the new root.

<!-- Speaker note: No matter how deep the key started, one access puts it at the very top. -->

---

# Why splay is O(log n) amortized

- No single access is guaranteed O(log n) — can be O(n)
- ANY sequence of m accesses costs O(m log n) total
- O(log n) amortized per access
- Adapts automatically to a "hot" working set

<!-- Speaker note: "Amortized" = averaged over a long sequence, not guaranteed for any one operation in isolation. -->

---

# Common mistake

- Implementing zig-zig as two SEPARATE single rotations ("naive splay")
- Valid tree operation, but loses the amortized guarantee
- Forgetting access on a MISSING key still splays something
- Here: the newly inserted node itself

<!-- Speaker note: "Naive splay" still produces a correct BST — it just does not have the performance proof behind it. -->

---

# Mini question

After many accesses to ONE key, how deep is every
OTHER key, roughly?

<!-- Speaker note: Answer on the next slide. -->

---

# Mini answer

- That one key sits at the root every time
- Every OTHER key's depth is barely affected
- Splay only reshuffles nodes ALONG the accessed path
- No "global" balance guarantee — only a local, per-access one

<!-- Speaker note: This is the precise sense in which a splay tree has "no strict balance". -->

---

<!-- _class: bolum -->

# 5. 2-3 Trees

<!-- Speaker note: Never even momentarily crooked — because it grows upward, at the root, not at the leaves. -->

---

# A question to start

Every tree so far fixes imbalance AFTER it happens.
What if imbalance were structurally IMPOSSIBLE?

<!-- Speaker note: A completely different philosophy from rotations — prevent, don't repair. -->

---

# A short history

- **1972** — Rudolf Bayer & Edward McCreight
- A stepping stone to the B-tree (Week 14, disk-backed files)
- Node holds 1 key (2-node) or 2 keys (3-node)
- Every leaf sits at EXACTLY the same depth, always

<!-- Speaker note: Same Bayer as red-black's ancestor paper — two related ideas from the same period. -->

---

# The idea — overflow and split

- New key inserted into the correct leaf, sorted
- Leaf already had 2 keys → now has 3, temporarily: **overflow**
- Split into two 2-nodes; MIDDLE key promoted to the parent
- Parent can overflow the same way — cascades upward

<!-- Speaker note: If the cascade reaches the root and splits there, height grows by one — EVERYWHERE at once. -->

---

# 2-3 tree: insert

<iframe class="dsanim" src="anim/two-three-tree-insert.html?yer=slayt&lang=en" title="2-3 tree: insert via node splits"></iframe>

<!-- Speaker note: Watch the level-order listing's bracket groups — every leaf-level group stays at the same row. -->

---

# Code — the overflow loop

```c
while (node->nkeys == 3) {
    split_node(node, &left, &right, &promoted);
    if (depth == 0) {
        /* root split: height + 1 */
        return new_root(promoted, left, right);
    }
    Node *parent = path[--depth];
    replace_with_split(parent, node,
                        promoted, left, right);
    node = parent;
}
```

<!-- Speaker note: No rotation anywhere in this whole function — only splitting and promoting. -->

---

# Expected output

```text
insert(20): height = 0, level-order = [10,20]
insert(30): height = 1, level-order = [20] [10] [30]
```

<!-- Speaker note: The moment a node WOULD hold 3 keys, it splits immediately — you never actually see a 3-key node printed. -->

---

# Why 2-3 tree insert is O(log n)

- Every leaf at the same depth h → h = O(log n)
- Walk down: O(h); splits cascade up: at most O(h), each O(1)
- Zero rotations, ever — unlike every other tree today
- Direct ancestor of Week 14's B-tree

<!-- Speaker note: "Zero rotations" is the single biggest structural difference from AVL, red-black, and splay. -->

---

# Common mistake

- Sizing `child[]` for only 3 slots (the steady-state max)
- Mid-overflow, a node briefly needs 4 children — real buffer overflow
- Splitting a node without freeing the old shell afterward
- Promoting the wrong key (must be the MIDDLE one)

<!-- Speaker note: We found exactly this array-sizing bug while building this week's program — a genuine memory-corruption crash. -->

---

# Mini question

Why does a 2-3 tree's height grow ONLY at the root,
never partway down?

<!-- Speaker note: Answer on the next slide. -->

---

# Mini answer

- A split only responds to ITS OWN node's overflow
- The promoted key goes to ITS OWN parent, never a sibling
- The cascade only ever travels straight up one path
- The only place it can run out of "parent" is the root

<!-- Speaker note: This is exactly why height growth is always global, never local — there is nowhere else for it to happen. -->

---

<!-- _class: bolum -->

# 6. Segment Trees

<!-- Speaker note: A genuinely different question: not "is x here", but "what about a whole RANGE". -->

---

# A question to start

"What is the SUM of every value between index l and r?"
A loop answers in O(n). Many such queries — can we do better?

<!-- Speaker note: This is a very common real question: totals over a window, a date range, a price range. -->

---

# The idea — precompute every range once

- Built once over a fixed-size array
- Node i responsible for range [lo, hi]; children 2i, 2i+1
- Leaf holds one value; internal node holds sum of its two children
- Query walks down: outside → 0, inside → precomputed sum, partial → recurse both

<!-- Speaker note: "Partial overlap" only ever happens at O(log n) nodes total — that is the whole complexity argument. -->

---

# Segment tree: build and query

<iframe class="dsanim" src="anim/segment-tree.html?yer=slayt&lang=en" title="Segment tree: build and range-sum query"></iframe>

<!-- Speaker note: Watch which nodes turn green (fully inside, used directly) versus which get pruned (dim, no overlap). -->

---

# Code — query()

```c
long query(int i, int lo, int hi, int l, int r) {
    if (r < lo || hi < l)   return 0;
    if (l <= lo && hi <= r) return tree[i];
    int mid = (lo + hi) / 2;
    return query(2*i,   lo,      mid, l, r)
         + query(2*i+1, mid + 1, hi,  l, r);
}
```

<!-- Speaker note: Three cases, three lines of logic — outside, fully inside, partial. -->

---

# Expected output

```text
query(0,9) = 55
query(2,5) = 20
query(7,7) = 4
```

<!-- Speaker note: A single-point query is just a range of length one — the same function handles it with no special case. -->

---

# Why segment tree query is O(log n)

- build(): O(n) total — visits every node once
- Each level: at most TWO "partially overlapping" nodes
- Every other node at that level: answered or pruned immediately
- Total work proportional to height: O(log n)

<!-- Speaker note: "At most two per level" — one at each boundary of [l, r] — is the key fact, worth repeating. -->

---

# A structural difference from sections 1–5

- Segment tree SHAPE depends only on n, never on data values
- Every BST-family tree's shape depends on VALUE comparisons
- A segment tree can never degenerate the way section 1.4's BST did
- No insertion-order problem exists here at all

<!-- Speaker note: This is worth pausing on — it is a genuinely different kind of tree from everything else today. -->

---

# Common mistake

- Sizing the array as 2n instead of 4n
- Confusing "fully inside" with "fully outside" (swapped conditions)
- Rebuilding the WHOLE tree (O(n)) for one single-point update
- A dedicated O(log n) point-update function is the natural fix

<!-- Speaker note: The 4n sizing comes from n not necessarily being a power of two — the tree is not perfectly "complete". -->

---

# Mini question

Why is query's cost O(log n), not O(log n) TIMES
the number of nodes at each level?

<!-- Speaker note: Answer on the next slide. -->

---

# Mini answer

- At most TWO nodes per level are "partially overlapping"
- Every other node: fully inside (done) or fully outside (pruned)
- Total work proportional to height, not width
- O(log n), not O(log n) · O(n)

<!-- Speaker note: This is the same "at most two per level" fact from the complexity slide — now as a self-check. -->

---

<!-- _class: bolum -->

# 7. Fenwick Trees

<!-- Speaker note: The same range-sum idea, with no explicit tree at all — one array, one bitwise trick. -->

---

# A question to start

A segment tree needs up to 4n explicit nodes.
Could a PLAIN ARRAY answer prefix sums just as fast?

<!-- Speaker note: "Fenwick tree" and "binary indexed tree (BIT)" are the same structure, two common names. -->

---

# A short history

- **1994** — Peter Fenwick
- "A new data structure for cumulative frequency tables"
- No tree pointers, no recursion required
- One array, one arithmetic trick: `i & -i`

<!-- Speaker note: Much newer than every other structure today — a genuinely modern, minimal-overhead idea. -->

---

# The idea — i & -i isolates the lowest set bit

- `bit[i]` holds the sum of a range of size `i & -i` ending at `i`
- `update(i, delta)`: walk UP, `i += i & -i`
- `query(i)`: prefix sum 1..i, walk DOWN, `i -= i & -i`
- Both walks: O(log n) steps, no tree structure needed

<!-- Speaker note: "i & -i" relies on two's-complement negation — the same trick works identically in C and Java. -->

---

# Fenwick tree: update and query

<iframe class="dsanim" src="anim/fenwick-tree.html?yer=slayt&lang=en" title="Fenwick tree: prefix sums and i and -i"></iframe>

<!-- Speaker note: Watch the brace under the highlighted cell — it shows exactly which range that cell is responsible for. -->

---

# The i & -i chain length, in isolation

<iframe class="dsanim" src="anim/fenwick-tree.html?yer=slayt&example=edge-chain-length&lang=en" title="Fenwick tree: chain length contrast"></iframe>

<!-- Speaker note: update(1) touches 5 cells on n=16; query(16) touches only 1 — the exact opposite extremes. -->

---

# Code — update() and query()

```c
void update(int i, int delta) {
    while (i <= n) { bit[i] += delta; i += i & (-i); }
}
int query(int i) {
    int sum = 0;
    while (i > 0) { sum += bit[i]; i -= i & (-i); }
    return sum;
}
```

<!-- Speaker note: Four lines total for both operations — this is the entire structure. -->

---

# Expected output

```text
update(3, 5)
update(7, 2)
query(10) = 7
```

<!-- Speaker note: Two updates, one query — the running sum reflects both deltas correctly, O(log n) each. -->

---

# Why Fenwick is O(log n), O(n) space

- `i & -i` at least doubles (update) or halves (query) distance to the boundary
- At most floor(log2(n)) + 1 iterations, either direction
- Space: one plain int array — dramatically less than a segment tree
- Preferred in practice when the array's size will not change

<!-- Speaker note: Less code, less memory, same asymptotic guarantee — the appeal is purely practical, not theoretical. -->

---

# Common mistake

- Using 0-indexing — `i & -i` needs index 0 to be all-zero bits
- Fenwick trees are ALWAYS 1-indexed
- Writing a home-made "negation" instead of the language's `-`
- Reaching for Fenwick on range-MIN/MAX queries (does not work)

<!-- Speaker note: Range min/max is not INVERTIBLE the way sum is — that rules it out structurally, not just by convention. -->

---

# Mini question

For n=16, why does update(1) take exactly 5 steps
(i = 1, 2, 4, 8, 16)?

<!-- Speaker note: Answer on the next slide. -->

---

# Mini answer

- `i += i & -i`: 1→2→4→8→16, then the loop stops (i would exceed n)
- Five cells touched, each responsible for a range including index 1
- query(15) instead takes 4 steps: one per 1-bit in 15's binary (1111)
- Update and query walk opposite directions, different bit patterns

<!-- Speaker note: "One step per 1-bit" for query is a clean, memorable rule worth writing on the board. -->

---

<!-- _class: bolum -->

# 8. Choosing a Technique

<!-- Speaker note: Seven structures, one question each solves best — let's put them side by side. -->

---

# Comparison — balanced BSTs

| Structure | Worst-case height | Rebalance cost |
| --- | --- | --- |
| Plain BST | O(n) | none |
| AVL | O(log n), tightest | <=1 rotation/insert |
| Red-black | O(log n), looser | fewer rotations avg. |
| Splay | O(log n) amortized | full splay/access |

<!-- Speaker note: "Tightest" vs "looser" is about the CONSTANT factor, not the big-O class — both are logarithmic. -->

---

# Comparison — structural & range trees

| Structure | Rebalance cost | Best for |
| --- | --- | --- |
| 2-3 tree | node splits, no rotations | bridge to Week 14's B-tree |
| Segment tree | none after build | many range sum/min/max queries |
| Fenwick tree | none | range sum + frequent point updates |

<!-- Speaker note: 2-3, segment, and Fenwick trees solve genuinely different problems from the balanced-BST family. -->

---

# Choosing — by workload

- **Lookup-heavy** → AVL (tightest bound)
- **Mixed insert/delete/search** → red-black (fewer rotations)
- **Skewed "hot key" access** → splay (adapts, low memory)
- **Range questions** → segment tree or Fenwick tree

<!-- Speaker note: "Most balanced" is not the only axis that matters — the workload decides the right structure. -->

---

# Mini question

A colleague says "always use red-black, it's the most
balanced and library-tested". What would you ask first?

<!-- Speaker note: Answer on the next slide. -->

---

# Mini answer

- Is the workload lookup-heavy, or a mixed insert/delete/search?
- Is access skewed toward a small hot-key set?
- Are the questions about RANGES, not single keys?
- Will this feed into a disk-backed structure later (Week 14)?

<!-- Speaker note: Every one of today's structures is the RIGHT answer for some specific workload — none is universally best. -->

---

# Summary

- BST: `insert`/`search`/`delete` all O(h) — but h depends on ORDER
- Sorted input degenerates a BST to a chain: O(n), no better than a list
- AVL, red-black, splay, 2-3 tree: four different fixes, four trade-offs
- Segment tree, Fenwick tree: O(log n) answers to RANGE questions

<!-- Speaker note: One sentence per structure — if you remember only this slide, you have the whole week. -->

---

# Exercises preview

- Prove a BST of height h has at most 2^(h+1) − 1 nodes
- Trace red-black's fixup cases by hand on the "hard" scenario
- Sketch what changes to turn a segment tree into range-MIN
- Full list of 10 exercises: this week's notes

<!-- Speaker note: All ten exercises build directly on this week's actual programs — trace them with the real code open. -->

---

# Self-check quiz preview

- Why does AVL insert need at most one rotation, but delete can cascade?
- Why can a Fenwick tree not support range-minimum queries?
- Why is a segment tree's shape independent of the data?
- Full 10-question quiz with answers: this week's notes

<!-- Speaker note: Try answering from memory before checking the notes — that is the whole point of a self-check. -->

---

# Looking ahead

- **Week 12** — strings: matching algorithms, and the **trie**
- A trie stores strings by shared PREFIX, not numeric comparison
- **Week 13** — direct and sequential file organization
- **Week 14** — the **B-tree**: this week's 2-3 tree, generalized for disk

<!-- Speaker note: The 2-3 tree you met today is literally the m=3 special case of Week 14's B-tree. -->

---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Questions?

**CEN207 Data Structures — Week 11**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!-- Speaker note: Open the floor — and point back to whichever animation preset best answers whatever comes up. -->

