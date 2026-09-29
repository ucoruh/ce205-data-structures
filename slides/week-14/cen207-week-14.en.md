---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 14 — File Organisation II"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 14"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# File Organisation II

**CEN207 Data Structures — Week 14**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!--
Speaker note: Week 13 gave us a sorted file and a bucket-hashed file. This week asks: can a small index make search cheaper, can the index itself stay balanced forever, and can a hashed file grow without ever being rebuilt?
-->

---

# Today's plan (3 hours)

| Hour | Topic |
| --- | --- |
| 1 | Indexes **Anim 1–2** · ISAM **Anim 3** · B-tree insert **Anim 4** |
| 2 | B-tree search/delete **Anim 5–6** · B+-tree **Anim 7** |
| 3 | Extendible/linear hashing **Anim 8–9** · external sort **Anim 10–11** |

**Learning outcomes:** LO.1 (explain fundamental data structures) · LO.2 (analyze complexity) · LO.6 (design file-based storage) · LO.7 (choose the right structure)

<!-- Speaker note: Eleven animations carry the whole lecture; every drawing labels disk pages by number and tracks reads/writes on the right. -->

---

# This week's concepts — where

| Concept | Where |
| --- | --- |
| Primary/secondary index, ISAM | Sections 1–3 |
| B-tree insert/search/delete, B+-tree | Sections 4–7 |
| Extendible hashing, linear hashing | Sections 8–9 |
| External merge sort, replacement selection | Sections 10–11 |

<!-- Speaker note: Every term gets a full definition the first time it appears; this table just says where to find it again. -->

---

# How the code examples work

- Every idea has a complete **C** and **Java** program
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Sources: `code/week-14/c/` and `code/week-14/java/`
- Two programs create REAL files, only in a self-made lab folder

<!-- Speaker note: external_merge_sort and replacement_selection create real run files, but always inside a folder they create and delete themselves. -->

---

# Recap — Week 13: pages, sorted files, bucket hashing

- A **page** is the unit of disk I/O — this week's currency too
- A **sorted file**: binary search over pages, O(log(n/B))
- A **bucket-hashed file**: ~O(1) search, but overflow chains
- Today: structures that make growth and search both cheap

<!-- Speaker note: Everything this week either speeds up the sorted file with an index, or fixes the hashed file's fixed bucket count. -->

---

# Recap — Week 4: trees and rebalancing

- A BST can degrade to O(n) on adversarial insertion order
- Rebalancing: restructure locally after a change
- A B-tree rebalances whole **pages**, not single-key nodes
- Splitting and merging pages keeps height O(log n) always

<!-- Speaker note: Today's B-tree family generalises Week 4's tree idea to pages that hold many keys, not one. -->

---

# Map of the week — at a glance

| Indexes | Balanced trees | Dynamic hashing | External sorting |
| --- | --- | --- | --- |
| Primary, secondary, ISAM | B-tree, B+-tree | Extendible, linear | Merge sort, replacement selection |

<!-- Speaker note: Every box on this map gets its own slides below, each with a step-by-step animation and a complete C/Java program. -->

---

<!-- _class: bolum -->

# 1. Primary (Sparse) Indexes

<!-- Speaker note: Section 1 opens the indexing family: a tiny, memory-resident structure that turns page-by-page search into one page read. -->

---

# A question to start

Binary search over a file's pages already
costs O(log(n/B)) reads. Could a structure
small enough to live in RAM cut that further?

<!-- Speaker note: Yes — if the structure is small enough never to touch disk at all, only the ONE data page read remains a real cost. -->

---

# Intuition — a book's chapter tabs

- Flipping every page to find a word: too slow
- A **tab per chapter**, holding each chapter's first word
- Check tabs (free, in your hand), open ONE chapter
- That is exactly what a sparse index does per disk page

<!-- Speaker note: The tabs never leave your hand (memory); only opening the one right chapter costs a real "page turn" (disk read). -->

---

# The idea: one entry per PAGE

- Index: `(first_key, page)` pairs, one per data page
- Sorted the same way as the file itself
- Small: `1/B` the size of the data — fits in RAM, free to scan
- `find_page`: last entry whose `first_key <= key`

<!-- Speaker note: Because it holds one entry per page (not per record), it stays tiny even for a huge file. -->

---

# search_key: index scan, then ONE page read

- `find_page` returns `-1` if key is below every first_key
- `-1` means: **no disk access needed at all**
- Otherwise: read that one page, scan it for the key
- Total real disk cost: at most **one page read**

<!-- Speaker note: The index alone can already prove a key absent, with zero disk I/O, in the "below range" edge case. -->

---

# Primary index, step by step

<iframe class="dsanim" src="anim/primary-index.html?yer=slayt&lang=en" title="Primary index"></iframe>

<!-- Speaker note: Normal example: 12 keys, block=4 — watch the index scan (free) hand off to a single page read. -->

---

# Edge case — every query below range

<iframe class="dsanim" src="anim/primary-index.html?yer=slayt&lang=en&example=below-range" title="Primary index: below range"></iframe>

<!-- Speaker note: Every single query is smaller than the smallest key: zero disk reads across the whole scenario. -->

---

# Code — find_page

```c
int find_page(IndexEntry index[], int idx_n, int key) {
    int page = -1;
    for (int i = 0; i < idx_n; i++) {
        if (index[i].first_key <= key)
            page = index[i].page;
        else
            break;
    }
    return page;
}
```

<!-- Speaker note: The index is sorted, so once an entry's first_key exceeds the target, the loop can stop. -->

---

# Code — search_key

```c
bool search_key(int data[][MAX_BLOCK], const int page_len[],
                 IndexEntry index[], int idx_n, int key, int *out_page) {
    int page = find_page(index, idx_n, key);
    if (page == -1) return false;
    for (int i = 0; i < page_len[page]; i++)
        if (data[page][i] == key) { *out_page = page; return true; }
    *out_page = page;
    return false;
}
```

<!-- Speaker note: page == -1 short-circuits before any disk access; otherwise exactly one page is read and scanned. -->

---

# Complexity

- Index scan: O(n/B) comparisons, but **zero** disk I/O
- One guaranteed disk read: the single data page
- Total real I/O per search: **O(1)** page reads
- Index space: O(n/B) — proportional to pages, not records

<!-- Speaker note: A bigger installation would binary-search the index too, but the disk cost stays O(1) either way. -->

---

# Common mistakes

- Assuming a sparse index works on an unsorted file
- Confusing "-1: no page qualifies" with "page scanned, no match"
- Letting the index itself grow too big to fit in RAM

<!-- Speaker note: The third mistake is exactly ISAM's motivation for multiple index levels, coming up next. -->

---

# Mini-quiz

Why does a sparse index need only ONE
entry per PAGE, not one per record?

<!-- Speaker note: Think about what a single page read already gives you once you know which page to read. -->

---

# Answer

**A page read + in-page scan already finds
any record on that page.** More index
entries per page would save zero extra reads.

<!-- Speaker note: This is exactly why "sparse" works: the index only needs to answer "which page", not "which slot". -->

---

<!-- _class: bolum -->

# 2. Secondary (Dense) Indexes

<!-- Speaker note: Section 2 generalises indexing to any attribute, including one that repeats across many records. -->

---

# A question to start

A primary index works on the file's own
sort key. Can an index also help search
on a DIFFERENT attribute, one that repeats?

<!-- Speaker note: Yes — a dense index, sorted by the secondary key itself, makes duplicates cluster together. -->

---

# Intuition — a library's subject catalogue

- Books are shelved by call number (primary order)
- A subject catalogue card exists **per book**, sorted by subject
- Cards for the same subject sit next to each other
- Each card still points to the book's real shelf location

<!-- Speaker note: The catalogue is dense (one card per book) and sorted by a DIFFERENT key than the shelves. -->

---

# The idea: one entry per RECORD, sorted by key

- `(key, slot)` pairs, ONE per record — not per page
- Sorted by the secondary key itself
- Duplicates end up **adjacent** because the index is sorted
- A match streak: scan forward until the key changes

<!-- Speaker note: Dense costs more space (O(n)) than sparse (O(n/B)), the direct price of supporting any attribute. -->

---

# search_dense: collect a whole cluster

- Skip non-matching entries before a match starts
- Once inside a match, collect every consecutive one
- A DIFFERENT key after a match: the cluster has ended
- At most one new page read per distinct page touched

<!-- Speaker note: Two matches sharing a page cost only one read total — the search tracks pages already visited this query. -->

---

# Secondary index, step by step

<iframe class="dsanim" src="anim/secondary-index.html?yer=slayt&lang=en" title="Secondary index"></iframe>

<!-- Speaker note: Normal example: 12 records, block=4 — watch matches cluster together even though the data file is not sorted by this key. -->

---

# Edge case — all records share one key

<iframe class="dsanim" src="anim/secondary-index.html?yer=slayt&lang=en&example=all-same" title="Secondary index: all same"></iframe>

<!-- Speaker note: The whole index is one giant cluster — the search still finds every match in a single pass. -->

---

# Code — search_dense

```c
int search_dense(const IndexEntry index[], int n, int key,
                  int matches[], int max_matches) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (index[i].key == key) {
            if (count < max_matches) matches[count] = index[i].slot;
            count++;
        } else if (count > 0) {
            break;
        }
    }
    return count;
}
```

<!-- Speaker note: "else if (count > 0) break" is the key line: it only stops once a cluster has actually started and ended. -->

---

# Complexity

- Linear scan as written: O(n) worst case
- Production version: binary search to first match, O(log n + m)
- Disk cost: at most one read per distinct matched page
- Space: O(n) — one entry per record, not per page

<!-- Speaker note: Dense trades sparse's tiny footprint for the ability to search ANY attribute, including duplicates. -->

---

# Common mistakes

- Assuming the dense index is sorted by the DATA file's order
- Breaking the scan on the first non-match before a cluster starts
- Forgetting a dense index costs O(n) space, not O(n/B)

<!-- Speaker note: The data file's physical order and the dense index's sort order are usually completely unrelated. -->

---

# Mini-quiz

Why must a dense index hold ONE entry
per record, unlike a sparse index's one per page?

<!-- Speaker note: Think about what a sparse index's "one entry per page" trick relied on. -->

---

# Answer

**The data file is NOT sorted by the
secondary key.** Only one index entry per
record can guarantee a correct match list.

<!-- Speaker note: A sparse index's trick only works because the file itself is sorted on that exact key. -->

---

<!-- _class: bolum -->

# 3. ISAM: Multi-Level Index + Overflow

<!-- Speaker note: Section 3 combines a multi-level index with a growth mechanism: the overflow area. -->

---

# A question to start

Sections 1–2 assumed the file never
changes. Real files grow. Where does a
new record go when its page is already full?

<!-- Speaker note: ISAM answers with two ideas: index LEVELS to keep the index small, and an OVERFLOW AREA to keep growth cheap. -->

---

# A short history — IBM, 1960s

- **ISAM** (Indexed Sequential Access Method)
- IBM's production answer for early mainframe databases
- Used for decades in commercial data processing
- Combines a sparse index with an overflow area

<!-- Speaker note: ISAM predates the B-tree (1972) by roughly a decade — it is the file-organisation problem's first industrial answer. -->

---

# The idea: index the index, and add an escape valve

- Level-2 index: one entry per page (like Section 1)
- Level-1 index: groups every GROUP level-2 entries
- Two short scans replace one long linear scan
- A full page's new key goes to a linked OVERFLOW chain

<!-- Speaker note: The home page and its index entry never move; only its overflow chain grows. -->

---

# Overflow chains: cheap now, costly later

- Insert into an overflow chain: append, O(1) amortised locally
- Search must walk the WHOLE chain if not on the home page
- Long chains: search performance degrades over time
- Fix: periodic **reorganisation** rebuilds the file from scratch

<!-- Speaker note: This trade-off — cheap growth, degrading search — is exactly why real ISAM files need scheduled maintenance. -->

---

# ISAM, step by step

<iframe class="dsanim" src="anim/isam.html?yer=slayt&lang=en" title="ISAM"></iframe>

<!-- Speaker note: Normal example: 12 keys, block=4, fill=3 — watch two direct inserts, then a third that overflows. -->

---

# Edge case — chained overflow, same page

<iframe class="dsanim" src="anim/isam.html?yer=slayt&lang=en&example=hard" title="ISAM: chained overflow"></iframe>

<!-- Speaker note: Three inserts target the same already-full page; the third has to walk past two overflow nodes to be appended. -->

---

# Code — isam_insert

```c
void isam_insert(int key) {
    int g = find_group(l1_key, l1_n, key);
    int page = find_page(l2_key, g * GROUP, group_hi(g), key);
    read_page(page);
    if (page_len[page] < BLOCK) {
        insert_sorted(page, key);
        write_page(page);
    } else {
        int walked = walk_overflow_chain(page);
        append_overflow(page, key);
    }
}
```

<!-- Speaker note: The two-level descent (find_group, then find_page) is the whole "index the index" idea in four lines. -->

---

# Complexity

- Search: O(L) in-memory comparisons + 1 home-page read
- Plus one read per overflow node walked, if not found sooner
- Insert: same search + 1 write (direct) or 2 writes (overflow)
- Search degrades as chains grow — motivates reorganisation

<!-- Speaker note: L (index levels) stays small even for huge files, exactly the point of grouping level-2 under level-1. -->

---

# Common mistakes

- Letting overflow chains grow unbounded, never reorganising
- Attaching a new overflow node to the wrong page's chain
- Stopping at the right GROUP without scanning its pages

<!-- Speaker note: The new record always attaches to its OWN home page's chain — never the shortest chain, never a neighbour. -->

---

# Mini-quiz

Why does ISAM need MULTIPLE index
levels, when Section 1's index used just one?

<!-- Speaker note: Think about what happens to a single-level sparse index over a truly enormous file. -->

---

# Answer

**Even a "small" one-level index can grow
too big for a huge file.** Grouping under a
level-1 index keeps the top scan tiny.

<!-- Speaker note: Exactly like a phone book's tabbed sections before the sorted page underneath. -->

---

<!-- _class: bolum -->

# 4. B-Trees: Insertion

<!-- Speaker note: Section 4 opens the B-tree family: an index that IS a self-balancing tree of disk pages. -->

---

# A question to start

ISAM's index levels are fixed at build
time. What if the index itself could grow
and rebalance, with no reorganisation, ever?

<!-- Speaker note: That structure is the B-tree — every "node" a whole disk page, splitting and merging to stay balanced. -->

---

# A short history — Bayer and McCreight, 1972

- Rudolf Bayer, Edward McCreight, Boeing Research Labs
- "Organization and Maintenance of Large Ordered Indexes"
- "B" is read as Bayer, Boeing, or "balanced" — never settled
- Solved what ISAM's fixed structure could not: provable balance

<!-- Speaker note: A B-tree's height stays O(log n) no matter how the file grows or shrinks — no separate rebalancing step, ever. -->

---

# Intuition — a filing cabinet that grows upward

- Each drawer (page) holds several folders (keys), sorted
- A full drawer splits into two half-full drawers
- The middle folder moves up to the drawer ABOVE
- The cabinet only gets a new TOP drawer when it must

<!-- Speaker note: Growth always happens at the top (the root), never by adding a new bottom shelf. -->

---

# Order m: how many keys per page

- Order `m`: at most `m-1` keys, `m` children per node
- Root may hold fewer; every other node at least `ceil(m/2)-1`
- Insert descends to a leaf, exactly like a search would
- If the leaf now holds `m` keys: **split**

<!-- Speaker note: In this week's presets, m=4 (mixed data) and m=3 (worst case, to make splits visible). -->

---

# split: push the median up

- `mid = n/2`; the median key is pushed to the parent
- Left half keeps `keys[0..mid-1]`, right half gets the rest
- If the PARENT now overflows too: split it too
- If the ROOT splits: a new root grows the tree one level

<!-- Speaker note: This cascading split is the entire mechanism that keeps the tree height O(log_m n). -->

---

# B-tree insert, step by step

<iframe class="dsanim" src="anim/b-tree-insert.html?yer=slayt&lang=en" title="B-tree insert"></iframe>

<!-- Speaker note: Normal example: order=4, 12 mixed keys — watch the first split push a median up, then later a root split. -->

---

# Edge case — order=12, never splits

<iframe class="dsanim" src="anim/b-tree-insert.html?yer=slayt&lang=en&example=never-splits" title="B-tree insert: never splits"></iframe>

<!-- Speaker note: With order large relative to n, the whole tree stays a single leaf node — a clean contrast to the splitting cases. -->

---

# Code — insert_sorted and split

```c
void insert_sorted(Node *node, int key) {
    int i = node->n - 1;
    while (i >= 0 && node->keys[i] > key) {
        node->keys[i + 1] = node->keys[i]; i--;
    }
    node->keys[i + 1] = key;
    node->n++;
}
```

<!-- Speaker note: A plain shift-insert into a sorted array — the same idea used by every insertion sort you have already seen. -->

---

# Code — b_tree_insert

```c
void b_tree_insert(BTree *t, int key) {
    Node *leaf = find_leaf(t->root, key);
    insert_sorted(leaf, key);
    Node *cur = leaf;
    while (cur->n == ORDER) {
        int median; Node *right = split(cur, &median);
        if (cur->parent == NULL) { t->root = new_root(median, cur, right); return; }
        insert_sorted(cur->parent, median);
        attach_child(cur->parent, right);
        cur = cur->parent;
    }
}
```

<!-- Speaker note: The while loop is the cascade: it keeps checking upward until a node does not overflow, or the root splits. -->

---

# Complexity

- Height: O(log_m n) — order 100, 1 billion records: only 5 levels
- Insert: O(log_m n) reads to find the leaf
- Plus up to O(log_m n) splits, O(m) work each
- Worst case (cascade to root): O(m log_m n)

<!-- Speaker note: Cascades reaching every level are rare in practice — most inserts cost just one leaf write. -->

---

# Common mistakes

- Splitting only the leaf, forgetting the parent may overflow too
- Growing the tree at the wrong end (bottom instead of top)
- Choosing an order so small ordinary data keeps splitting

<!-- Speaker note: Real B-trees use an order in the hundreds, sized so one node fills exactly one disk page. -->

---

# Mini-quiz

Why does a B-tree's height stay O(log_m n)
even under an adversarial insertion order?

<!-- Speaker note: Think about where growth happens, and how often. -->

---

# Answer

**Every split is local; the tree only grows
taller when a split reaches the ROOT.**
No insertion order makes a long chain.

<!-- Speaker note: Unlike an unbalanced BST, every leaf is always at the same depth as every other leaf. -->

---

<!-- _class: bolum -->

# 5. B-Tree Search

<!-- Speaker note: Section 5 asks the simpler question: given a tree that already exists, how cheap is one lookup? -->

---

# A question to start

Insertion builds a balanced tree. Given
one that already exists, how many pages
does finding — or ruling out — one key cost?

<!-- Speaker note: The answer will turn out to be bounded by the tree's height, plus one, no matter what. -->

---

# The idea: descend, comparing at every page

- Start at the root; scan its (small) sorted key list
- Exact match: done
- No match, and it's a LEAF: the key cannot exist — absent
- No match, not a leaf: descend into exactly one child

<!-- Speaker note: A B-tree keeps every key reachable along a correctly-guided descent; falling off a leaf proves absence. -->

---

# B-tree search, step by step

<iframe class="dsanim" src="anim/b-tree-search.html?yer=slayt&lang=en" title="B-tree search"></iframe>

<!-- Speaker note: Normal example: order=4, 12 keys, 3 searches — watch a root-level hit versus a deeper, more expensive search. -->

---

# Edge case — single node, every search is 1 read

<iframe class="dsanim" src="anim/b-tree-search.html?yer=slayt&lang=en&example=never-splits" title="B-tree search: single node"></iframe>

<!-- Speaker note: With order=12 and only 10 keys, the whole file fits on one page — found or not, every search costs exactly one read. -->

---

# Code — b_tree_search

```c
bool b_tree_search(Node *node, int key, Node **out_node) {
    if (node == NULL) return false;
    int i = 0;
    while (i < node->n && key > node->keys[i]) i++;
    if (i < node->n && key == node->keys[i]) {
        *out_node = node; return true;
    }
    if (node->leaf) return false;
    return b_tree_search(node->child[i], key, out_node);
}
```

<!-- Speaker note: The leaf check must come AFTER the match check but BEFORE descending — descending on a leaf reads garbage. -->

---

# Complexity

- O(log_m n) page reads worst case — one per level
- Within a page: O(log m) binary, or O(m) linear scan
- Same cost whether the key is found OR proven absent
- This is the direct payoff of Section 4's balanced insertion

<!-- Speaker note: "Not found" is NOT free — the search still walks all the way to a leaf to be sure. -->

---

# Common mistakes

- Descending into a leaf's (uninitialised) child array
- Off-by-one in choosing which child index to descend into
- Assuming "not found" costs fewer reads than "found"

<!-- Speaker note: A wrong child index sends the search down the wrong subtree entirely — silently wrong, not a crash. -->

---

# Mini-quiz

Why does B-tree search cost at most
(height + 1) reads, whichever key is searched?

<!-- Speaker note: Think about what is true of every leaf's depth in a B-tree. -->

---

# Answer

**Every leaf sits at exactly the same
depth.** A search either finds its key
early, or walks to a leaf — never deeper.

<!-- Speaker note: This is the direct structural guarantee Section 4's split-and-grow-from-the-root mechanism provides. -->

---

<!-- _class: bolum -->

# 6. B-Tree Deletion: Borrow and Merge

<!-- Speaker note: Section 6 mirrors insertion's split with deletion's two repair moves: borrow, or merge. -->

---

# A question to start

Insertion splits an overfull page. Could
deletion's mirror image — merging two
too-empty pages — sometimes be avoided?

<!-- Speaker note: Yes — a page just short of the minimum can often borrow a single spare key from a neighbour instead. -->

---

# The idea: remove, then fix underflow

- Leaf key: shift-remove, simple
- Internal key: replace with its inorder PREDECESSOR
- The predecessor's own leaf is where the real delete happens
- If that leaf underflows (too few keys): fix it going up

<!-- Speaker note: Every delete reduces, one way or another, to a leaf removal plus a possible chain of fix-ups above it. -->

---

# Fixing underflow: borrow first, merge only if needed

- Left sibling has a spare key? **Borrow**: rotate through parent
- No? Try the RIGHT sibling the same way
- Neither has a spare? **Merge** with one sibling
- A merge can underflow the PARENT: the check repeats up

<!-- Speaker note: Borrow resolves in one step, touching 3 pages; merge removes a page and a key from the parent. -->

---

# When a merge reaches the root

- A merge at the top can empty the root of all keys
- The root's one remaining child becomes the new root
- The tree **shrinks** by exactly one level
- The direct mirror of Section 4's root-split growth

<!-- Speaker note: This is the only way a B-tree ever loses a level — always at the top, never by pruning a leaf. -->

---

# B-tree delete, step by step

<iframe class="dsanim" src="anim/b-tree-delete.html?yer=slayt&lang=en" title="B-tree delete"></iframe>

<!-- Speaker note: Normal example: order=4, 12 keys, 3 deletes — watch a leaf removal that needs no fix-up at all. -->

---

# Edge case — delete until the root shrinks

<iframe class="dsanim" src="anim/b-tree-delete.html?yer=slayt&lang=en&example=root-shrinks" title="B-tree delete: root shrinks"></iframe>

<!-- Speaker note: Seven deletions on an order=3 tree, each a merge, until the root itself empties and the tree loses a level. -->

---

# Code — fix_underflow (borrow or merge)

```c
void fix_underflow(Node *node) {
    while (node->parent != NULL && node->n < MIN_KEYS) {
        Node *parent = node->parent;
        int idx = child_index(parent, node);
        Node *left = idx > 0 ? parent->child[idx - 1] : NULL;
        Node *right = idx < parent->n ? parent->child[idx + 1] : NULL;
        if (left && left->n > MIN_KEYS) { borrow_from_left(node, parent, left, idx); return; }
        if (right && right->n > MIN_KEYS) { borrow_from_right(node, parent, right, idx); return; }
        if (left) { merge(left, parent, node, idx - 1); node = parent; }
        else { merge(node, parent, right, idx); node = parent; }
    }
}
```

<!-- Speaker note: Borrow returns immediately (resolved); merge sets node = parent and loops (may cascade). -->

---

# Complexity

- Find the key: O(log_m n), same as search
- Fix-up: up to O(log_m n) merges, one level at a time
- Each merge/borrow: O(m) work to shift keys and children
- Borrow: touches 3 pages; merge: removes a page + a key

<!-- Speaker note: A borrow is strictly cheaper — it resolves in one step, with no risk of cascading further. -->

---

# Common mistakes

- Borrowing from a sibling with exactly MIN_KEYS (still underflows)
- Forgetting to move a child pointer along with a borrowed key
- Deleting the wrong copy after an internal-node replacement

<!-- Speaker note: The real removal always happens at the PREDECESSOR's original leaf, never at the internal node itself. -->

---

# Mini-quiz

Why does a B-tree prefer BORROWING
over MERGING, whenever a sibling can spare a key?

<!-- Speaker note: Think about how many pages each option touches, and whether either can cascade. -->

---

# Answer

**Borrow touches 3 pages and resolves
immediately.** Merge removes a page from
the parent, which can cascade further up.

<!-- Speaker note: Same "cheaper local fix first" spirit as a dynamic array preferring in-place growth over reallocation. -->

---

<!-- _class: bolum -->

# 7. B+-Trees: Leaf Chains and Range Queries

<!-- Speaker note: Section 7 asks about range queries — and answers with one structural change: a chain linking every leaf. -->

---

# A question to start

"Every order in the last 30 days" is a
RANGE query. A plain B-tree keeps
re-climbing to the root. Can that be avoided?

<!-- Speaker note: Yes — if every leaf already knows which leaf comes next, no climbing is ever needed again. -->

---

# The idea: keys only in leaves, leaves form a chain

- Internal nodes hold ROUTING copies only — never real data
- Every real key lives in a LEAF
- Every leaf holds a `next` pointer to the leaf on its right
- A range query: descend ONCE, then follow the chain

<!-- Speaker note: The chain turns "re-descend for every match" into "walk sideways", a huge win for large result sets. -->

---

# Leaf split copies; internal split removes

- Leaf splits: median is COPIED up (stays in the right leaf too)
- Internal splits: median is REMOVED (pure routing, no data lost)
- This ONE difference from Section 4 is the whole B+-tree idea
- Splicing `next` correctly is the one new bookkeeping step

<!-- Speaker note: Forgetting to splice next before overwriting it silently drops every leaf after the split point. -->

---

# B+-tree, step by step

<iframe class="dsanim" src="anim/b-plus-tree.html?yer=slayt&lang=en" title="B+-tree"></iframe>

<!-- Speaker note: Normal example: order=4, 12 keys, 3 range queries — watch the orange chain arrows carry the query sideways. -->

---

# Edge case — a range covering every key

<iframe class="dsanim" src="anim/b-plus-tree.html?yer=slayt&lang=en&example=whole-range" title="B+-tree: whole range"></iframe>

<!-- Speaker note: The query walks the ENTIRE chain to the end — never once climbing back to the root. -->

---

# Code — range_query

```c
void range_query(Node *root, int lo, int hi, int out[], int *count) {
    Node *leaf = find_leaf(root, lo);
    *count = 0;
    while (leaf != NULL) {
        for (int i = 0; i < leaf->n; i++)
            if (leaf->keys[i] >= lo && leaf->keys[i] <= hi)
                out[(*count)++] = leaf->keys[i];
        if (leaf->n > 0 && leaf->keys[leaf->n - 1] > hi) break;
        leaf = leaf->next;
    }
}
```

<!-- Speaker note: ONE descent (find_leaf), then a pure sideways walk — no recursion, no re-visiting internal nodes. -->

---

# Complexity

- One lookup: O(log_m n), same as a plain B-tree
- Range of k matches: O(log_m n) + O(k/B) chain reads
- A plain B-tree: could cost O(k) separate root descents
- The chain is the entire source of this speed-up

<!-- Speaker note: The bigger the result set, the bigger the B+-tree's advantage over a plain B-tree's range query. -->

---

# Common mistakes

- Copying the median on an INTERNAL split (only leaves copy)
- Forgetting to splice `next` before overwriting `leaf->next`
- Running a range query as repeated single-key searches

<!-- Speaker note: The third mistake works correctly, but throws away the entire benefit of the leaf chain. -->

---

# Mini-quiz

Why can a B+-tree's range query avoid
climbing back to the root, unlike a plain B-tree's?

<!-- Speaker note: Think about what information a B+-tree leaf has that a plain B-tree leaf does not. -->

---

# Answer

**Every leaf knows its own next leaf,
directly, O(1).** A plain B-tree has no
such shortcut between neighbouring leaves.

<!-- Speaker note: This one pointer per leaf is the entire structural difference behind the B+-tree's range-query speed. -->

---

<!-- _class: bolum -->

# 8. Extendible Hashing

<!-- Speaker note: Section 8 returns to hashing, now letting the bucket count itself grow on demand. -->

---

# A question to start

Week 13's bucket-hashed file froze its
bucket count at creation. Can a hashed
file grow one bucket at a time, on demand?

<!-- Speaker note: Extendible hashing's answer: separate a small, memory-resident directory from the data buckets on disk. -->

---

# A short history — Fagin et al., 1979

- Ronald Fagin, Jürg Nievergelt, Nicholas Pippenger, H. R. Strong
- "Extendible Hashing — A Fast Access Method for Dynamic Files"
- Key idea: directory (memory) separate from buckets (disk)
- Growth touches the cheap directory far more than disk pages

<!-- Speaker note: This directory/data separation is the design pattern later reused by dynamic and distributed hash tables. -->

---

# The idea: a directory, doubled only when needed

- Directory: `2^global_depth` pointers, indexed by last bits
- Multiple entries can point to the SAME bucket
- Each bucket tracks its own `local_depth`
- Overflow, `local_depth == global_depth`: directory DOUBLES first

<!-- Speaker note: Doubling is pure memory work — zero disk cost — it just creates more, finer-grained pointers to redirect. -->

---

# Split, then retry

- Bucket splits: `local_depth++`, a new bucket is created
- Keys redistribute by the ONE new bit the deeper split examines
- Retry the insert: one split is not always enough
- Adversarial data can need SEVERAL splits in a row

<!-- Speaker note: The retry is essential — without it, a key that shares the new bit with everything else would be lost. -->

---

# Extendible hashing, step by step

<iframe class="dsanim" src="anim/extendible-hashing.html?yer=slayt&lang=en" title="Extendible hashing"></iframe>

<!-- Speaker note: Normal example: capacity=2, 10 keys — watch the directory double the first time a bucket's local_depth catches up. -->

---

# Edge case — cascading splits

<iframe class="dsanim" src="anim/extendible-hashing.html?yer=slayt&lang=en&example=skewed" title="Extendible hashing: cascading splits"></iframe>

<!-- Speaker note: Every key is 8 mod 16 — the directory grows all the way to depth 7 before the keys finally separate. -->

---

# Code — insert_key

```c
void insert_key(Hash *h, int key) {
    int idx = last_bits(key, h->global_depth);
    Bucket *b = h->dir[idx];
    if (b->n < CAPACITY) { b->keys[b->n++] = key; return; }
    if (b->local_depth == h->global_depth) {
        h->global_depth++;
        double_directory(h);
    }
    split_bucket(h, b);
    insert_key(h, key);
}
```

<!-- Speaker note: The recursive retry at the end is what handles the "one split was not enough" cascading case. -->

---

# Complexity

- O(1) directory lookup (memory, free)
- 1 page read + 1 write, +2 more per split
- Splits are O(1) amortised — like dynamic array doubling
- Directory space: O(2^global_depth), small unless skewed

<!-- Speaker note: Every doubling allows twice as many future inserts before the next one is needed. -->

---

# Common mistakes

- Splitting the bucket before checking if the directory must double
- Forgetting the retry — one split does not always separate keys
- Assuming every bucket a split creates ends up non-empty

<!-- Speaker note: An unlucky split can leave a brand-new bucket with zero keys, waiting for a future insert. -->

---

# Mini-quiz

Why must the directory double BEFORE
a bucket splits, not after?

<!-- Speaker note: Think about how many directory slots can point to the NEW bucket right after a split. -->

---

# Answer

**A split needs spare, more-specific
slots to redirect.** Without doubling first,
none exist yet at the current depth.

<!-- Speaker note: Doubling first creates exactly the additional slots the split then needs. -->

---

<!-- _class: bolum -->

# 9. Linear Hashing

<!-- Speaker note: Section 9 achieves the same dynamic growth as Section 8, but with no directory at all. -->

---

# A question to start

Extendible hashing needs a whole extra
directory structure. Can a file grow one
bucket at a time with NO directory at all?

<!-- Speaker note: Linear hashing's answer: commit in advance to a fixed, predictable splitting order. -->

---

# A short history — Witold Litwin, 1980

- "Linear Hashing: A New Tool for File and Table Addressing"
- Buckets split in FIXED, round-robin order: 0, then 1, then 2...
- Completely independent of which bucket actually overflowed
- That predictability is what removes the need for a directory

<!-- Speaker note: Litwin's scheme traded extendible hashing's directory for a single counter, n. -->

---

# The idea: a counter n tracks the next split

- `level`: how many full rounds of doubling completed
- `n`: how many buckets have split THIS round
- Address: `key mod (N0 * 2^level)`
- If that address `< n` (already split): use the next level

<!-- Speaker note: The address rule's one "bump" condition is the entire trick that keeps addressing correct as buckets split. -->

---

# ANY overflow splits bucket n — not the one that overflowed

- Insert always fits: an overflowing bucket just grows
- Any overflow, anywhere, triggers splitting bucket `n`
- `n` advances; a full round resets `n=0`, `level++`
- A bucket can temporarily hold MORE than CAPACITY

<!-- Speaker note: This is linear hashing's most distinctive — and most often mis-implemented — rule. -->

---

# Linear hashing, step by step

<iframe class="dsanim" src="anim/linear-hashing.html?yer=slayt&lang=en" title="Linear hashing"></iframe>

<!-- Speaker note: Normal example: N0=4, capacity=2, 10 keys — watch an overflow trigger a split of a DIFFERENT bucket. -->

---

# Edge case — frequent splits, a full round

<iframe class="dsanim" src="anim/linear-hashing.html?yer=slayt&lang=en&example=tight" title="Linear hashing: frequent splits"></iframe>

<!-- Speaker note: N0=2, capacity=1 — splits happen so often that a full round completes, n resets, and level increases. -->

---

# Code — address and split

```c
int address(int key, int level, int n) {
    int a = key % (N0 << level);
    if (a < n) a = key % (N0 << (level + 1));
    return a;
}

void split(Hash *h) {
    int new_index = (N0 << h->level) + h->n;
    rehash_into(h, h->n, new_index);
    h->n++;
    if (h->n == (N0 << h->level)) { h->n = 0; h->level++; }
}
```

<!-- Speaker note: split() always operates on h->n — never on whichever bucket triggered the call. -->

---

# Complexity

- O(1) average insert — same as extendible hashing
- ZERO directory memory: only two integers, level and n
- Trade-off: an individual bucket's size is less tightly bounded
- An overflowing-but-not-yet-due bucket just keeps growing

<!-- Speaker note: Simplicity (no directory) is paid for with a looser worst-case bound on any one bucket. -->

---

# Common mistakes

- Splitting the OVERFLOWING bucket instead of bucket n
- Forgetting the `a < n` bump when computing an address
- Never resetting n to 0 and advancing level

<!-- Speaker note: The split target is always "whichever bucket comes next in round-robin order" — completely predictable. -->

---

# Mini-quiz

Why can linear hashing avoid a directory
entirely, when extendible hashing cannot?

<!-- Speaker note: Think about how predictable the next split target is. -->

---

# Answer

**The split target is always predictable
from level and n alone.** No need to
record which entries point to which bucket.

<!-- Speaker note: The price: a bucket can grow past capacity until its own turn to split finally arrives. -->

---

<!-- _class: bolum -->

# 10. External Merge Sort

<!-- Speaker note: Section 10 tackles sorting a file too large for RAM — a genuinely different algorithm from Week 10's. -->

---

# A question to start

Week 10 sorted arrays that fit in RAM.
A billion-record file does not. What
changes when "the other half" lives on disk?

<!-- Speaker note: The divide step adapts easily; the combine (merge) step needs a fundamentally different implementation. -->

---

# A short history — the tape sorting era

- 1950s–60s mainframes sorted files far larger than RAM
- Magnetic tape: sequential access only, no random seeks
- "Merge" was often the ONLY efficient operation available
- Knuth's TAOCP Vol. 3 (1973): the classic exhaustive reference

<!-- Speaker note: The two-phase run-then-merge structure traces directly back to this tape-based era. -->

---

# The idea: small sorted runs, then a k-way merge

- Phase 1: chunks of RUN_SIZE, sorted in RAM, written as RUNS
- Phase 2: merge up to FAN_IN runs, ONE buffer per run
- Pick the smallest current buffer value, write it, refill
- Repeat passes until exactly ONE run remains

<!-- Speaker note: RAM only ever holds FAN_IN buffers plus one output buffer, however enormous the file is. -->

---

# A lone leftover run just carries forward

- If a group has only 1 run left, nothing to merge with
- Carry it forward to the next pass untouched — zero I/O
- Wasting a read+write on a solo run is a common mistake
- This optimisation matters most with an odd number of runs

<!-- Speaker note: This is a small but real optimisation this week's programs implement. -->

---

# External merge sort, step by step

<iframe class="dsanim" src="anim/external-merge-sort.html?yer=slayt&lang=en" title="External merge sort"></iframe>

<!-- Speaker note: Normal example: 12 values, RUN_SIZE=4, FAN_IN=2 — watch the first merge's small per-run buffers shrink as values are consumed. -->

---

# Edge case — RUN_SIZE=1, many passes

<iframe class="dsanim" src="anim/external-merge-sort.html?yer=slayt&lang=en&example=tiny-runs" title="External merge sort: many passes"></iframe>

<!-- Speaker note: Every value starts as its own run — many more merge passes are needed than the normal case. -->

---

# Code — merge_group

```c
Run merge_group(Run group[], int g) {
    int ptr[FAN_IN] = {0};
    Run out = new_run();
    while (1) {
        int best = -1, best_val = INT_MAX;
        for (int i = 0; i < g; i++)
            if (ptr[i] < group[i].n && group[i].keys[ptr[i]] < best_val)
                { best_val = group[i].keys[ptr[i]]; best = i; }
        if (best == -1) break;
        append(&out, best_val);
        ptr[best]++;
    }
    return out;
}
```

<!-- Speaker note: Only the CURRENT front value of each run needs to be in RAM — never a whole run at once. -->

---

# This program creates REAL files — safely

- Real run files, but only in a self-made LAB FOLDER
- `lab_external_merge_sort/`, created by the program itself
- Every file, and the folder, removed before the program exits
- Nothing is ever written anywhere else on disk

<!-- Speaker note: Both external_merge_sort and replacement_selection follow this same safe lab-folder pattern. -->

---

# Complexity

- Phase 1: ceil(n/RUN_SIZE) runs, 1 read + 1 write each
- Passes: O(log_FAN_IN(n/RUN_SIZE))
- Each pass touches every record once: O(n/B) I/O per pass
- Total: O((n/B) · log_FAN_IN(n/RUN_SIZE))

<!-- Speaker note: Dramatically less than trying to load the whole file into memory at once. -->

---

# Common mistakes

- Merging a lone leftover run anyway (wasted read + write)
- Buffering an entire run in RAM during a merge
- Choosing FAN_IN larger than RAM can actually hold

<!-- Speaker note: FAN_IN buffers, one per run merged simultaneously — bounded by real available memory, not convenience. -->

---

# Mini-quiz

Why does external merge sort need only
O(FAN_IN) RAM buffers, however huge the file?

<!-- Speaker note: Think about how much of a run a k-way merge actually needs to see at once. -->

---

# Answer

**A k-way merge only needs each run's
CURRENT front value.** The runs are
already sorted — nothing more is needed.

<!-- Speaker note: The exact generalisation of Week 10's two-way merge, which likewise only ever looks at two "current" elements. -->

---

<!-- _class: bolum -->

# 11. Replacement Selection: Longer Runs

<!-- Speaker note: Section 11 asks: can Phase 1's runs be made longer than RAM, using the SAME RAM? -->

---

# A question to start

Section 10's Phase 1 always makes runs
of exactly RUN_SIZE. Can the same RAM
produce runs LONGER than RUN_SIZE?

<!-- Speaker note: Replacement selection's answer: a record smaller than the last one WRITTEN starts the next run instead. -->

---

# The idea: current vs. next, decided by the last WRITE

- Keep a small RAM window (a min-heap in practice)
- Extract the smallest CURRENT-tagged record, write it
- New record `>= last written`? Tag CURRENT (can extend the run)
- New record `< last written`? Tag NEXT (waits for the next run)

<!-- Speaker note: The comparison is against the last value WRITTEN, never against the window's own current minimum. -->

---

# Best case, average case, worst case

- All window items NEXT-tagged: current run ends, retag, new run
- Random data: runs average about **2x** the window size m
- Already-sorted input: ONE single run, however large the file
- Strictly descending input: worst case, exactly m per run

<!-- Speaker note: The worst case is no better than Section 10's plain fixed-size chunking — the win is average-case, not guaranteed. -->

---

# Replacement selection, step by step

<iframe class="dsanim" src="anim/replacement-selection.html?yer=slayt&lang=en" title="Replacement selection"></iframe>

<!-- Speaker note: Normal example: RAM=4, 12 mixed values — watch window boxes switch between "current" and "next" labels. -->

---

# Edge case — best case, RAM >= n

<iframe class="dsanim" src="anim/replacement-selection.html?yer=slayt&lang=en&example=ram-covers-all" title="Replacement selection: best case"></iframe>

<!-- Speaker note: With RAM big enough to hold everything, the result is always ONE fully sorted run, whatever the input order. -->

---

# Code — extract_min_current

```c
int extract_min_current(Item window[], int w) {
    int best = -1;
    for (int i = 0; i < w; i++)
        if (window[i].tag == CURRENT &&
            (best == -1 || window[i].val < window[best].val))
            best = i;
    return best;
}
```

<!-- Speaker note: Returns -1 when nothing is tagged CURRENT — the signal that this run has ended. -->

---

# This program also creates REAL files — safely

- `lab_replacement_selection/`, created by the program itself
- Every run file removed before the program exits
- Run boundaries match this week's animation exactly
- A production version keeps the window as a real min-heap

<!-- Speaker note: The code here scans the window linearly, O(m) per record, for clarity — a heap makes it O(log m). -->

---

# Complexity

- O(n) total I/O for run creation — same as Section 10 Phase 1
- E[run length] ≈ 2m on random data — half as many later passes
- extract_min_current: O(m) here, O(log m) with a real heap
- Worst case (descending input): no better than plain chunking

<!-- Speaker note: This average-case win is exactly why real database and OS sort utilities use replacement selection. -->

---

# Common mistakes

- Comparing against the window's minimum, not the last WRITE
- Forgetting to reset last_written when a new run starts
- Assuming the "2x" average also holds in the worst case

<!-- Speaker note: Carrying over the previous run's last value would wrongly tag some of the new run's earliest records. -->

---

# Mini-quiz

Why does replacement selection produce
runs about TWICE the window size m, on average?

<!-- Speaker note: Think about what fraction of the window is typically CURRENT-tagged at any moment. -->

---

# Answer

**Roughly half the window stays CURRENT
at any moment, continuously refreshed.**
The run grows to about 2m before ending.

<!-- Speaker note: A classical result, analysed in full in Knuth's TAOCP, Volume 3. -->

---

<!-- _class: bolum -->

# 12. Choosing a File Organisation

<!-- Speaker note: The closing section turns everything this week covered into one decision table. -->

---

# Comparison table (1/2)

| Structure | Search | Insert |
| --- | --- | --- |
| Sorted file (Wk 13) | O(log(n/B)) | O(n/B) shifts |
| Bucket hash (Wk 13) | ~O(1) + overflow | ~O(1) + overflow |
| Primary/secondary index | O(1) page + free scan | Expensive |
| ISAM | O(L) + overflow chain | O(L) + append |

<!-- Speaker note: The index rows assume a mostly-static file; ISAM's overflow area is what makes inserts survivable at all. -->

---

# Comparison table (2/2)

| Structure | Range query | Reorganise? |
| --- | --- | --- |
| B-tree | Repeated descents | Never |
| B+-tree | Excellent (chain) | Never |
| Extendible hashing | Poor (no order) | Never |
| Linear hashing | Poor (no order) | Never |

<!-- Speaker note: "Never reorganise" is the B-tree family's other great property, alongside logarithmic search. -->

---

# The one big decision

- Do you need ORDER (range queries, sorted iteration)?
- Or only ever EXACT-MATCH lookups?
- Order matters: a B+-tree's leaf chain is very hard to beat
- Exact-match only, ever-growing file: hashing usually wins

<!-- Speaker note: This is the exact same question Week 13 first raised — sharpened now by everything this week added. -->

---

# Summary (1/2)

- **Indexes:** primary (sparse), secondary (dense), ISAM
- ISAM adds index LEVELS and an OVERFLOW AREA
- **B-trees** (Bayer/McCreight 1972): split, search, borrow/merge
- **B+-trees:** leaf CHAIN makes range queries fast

<!-- Speaker note: Every B-tree-family operation keeps the tree balanced as it goes — no separate rebalancing pass, ever. -->

---

# Summary (2/2)

- **Extendible hashing** (Fagin et al. 1979): directory, doubled
- **Linear hashing** (Litwin 1980): no directory, round-robin splits
- **External merge sort:** small runs, k-way merge, few buffers
- **Replacement selection:** ~2x longer runs from the same RAM

<!-- Speaker note: Both hashing schemes grow one bucket at a time, on demand, with no reorganisation pass. -->

---

<!-- _class: bolum -->

# Self-Check Quiz Recap

<!-- Speaker note: Ten questions, restated from the week's notes, one per slide pair. -->

---

# 1. Why does a primary index cost ZERO disk I/O to scan?

<!-- Speaker note: Recall Section 1. -->

---

# It is small enough to stay resident in memory — one entry per PAGE, not per record.

<!-- Speaker note: Only the one data page it points to is a real disk read. -->

---

# 2. Why must a dense index be sorted by the SECONDARY key?

<!-- Speaker note: Recall Section 2. -->

---

# The data file's own order tells you nothing about where matching records are — only the index's own sort order does.

<!-- Speaker note: This is what makes duplicate values cluster together in a dense index. -->

---

# 3. What does ISAM's overflow area let a file avoid doing immediately?

<!-- Speaker note: Recall Section 3. -->

---

# Re-splitting or reorganising the whole file on every insert — at the cost of degrading search as chains grow.

<!-- Speaker note: This trade-off is exactly why real ISAM files need periodic reorganisation. -->

---

# 4. Why does a B-tree split always push exactly ONE key up?

<!-- Speaker note: Recall Section 4. -->

---

# The median is the one key that fits cleanly into NEITHER half after the split — so it is promoted.

<!-- Speaker note: Half the keys stay, half move to a new sibling, and the median separates them in the parent. -->

---

# 5. Why does B-tree search cost at most (height + 1) reads?

<!-- Speaker note: Recall Section 5. -->

---

# Every leaf sits at exactly the same depth — insertion only ever grows the tree from the root, never a leaf.

<!-- Speaker note: A search either finds its key early, or walks to a leaf — never past one. -->

---

# 6. Why does a B-tree prefer borrowing over merging?

<!-- Speaker note: Recall Section 6. -->

---

# Borrowing touches only 3 pages and resolves immediately; merging can cascade further up the tree.

<!-- Speaker note: A B-tree only merges when NO sibling has a spare key to lend. -->

---

# 7. What ONE structural change makes a B+-tree's range queries fast?

<!-- Speaker note: Recall Section 7. -->

---

# Every leaf holds a next pointer to its right neighbour — a chain that needs no climbing back to the root.

<!-- Speaker note: A plain B-tree has no such shortcut between neighbouring leaves. -->

---

# 8. Why must extendible hashing's directory sometimes double?

<!-- Speaker note: Recall Section 8. -->

---

# Only when the overflowing bucket's local_depth has caught up to global_depth — other buckets are unaffected.

<!-- Speaker note: Doubling creates the spare, more-specific slots a split then needs to redirect. -->

---

# 9. Why can linear hashing split a bucket OTHER than the one that overflowed?

<!-- Speaker note: Recall Section 9. -->

---

# It commits in advance to a fixed round-robin split order, independent of which bucket happens to overflow.

<!-- Speaker note: This predictability is exactly what removes the need for any directory. -->

---

# 10. Why does replacement selection typically double the window size m?

<!-- Speaker note: Recall Section 11. -->

---

# The window keeps refilling: roughly half stays CURRENT-tagged at any moment, letting the run grow to ~2m.

<!-- Speaker note: A classical result analysed in Knuth's TAOCP, Volume 3. -->

---

<!-- _class: baslik -->

# Next week

**Week 15 — Final Project Demonstrations**

No new algorithms this week: teams present
their project's file-organisation or storage
component, before Week 16's final exam period.

<!-- Speaker note: Every structure from this week remains in daily production use — B+-trees in almost every relational database, external merge sort in every database's sort/index-build utility. -->

---

# References (1/2)

- Course syllabus, Week 14: `CEN207-2026-2027-Guz-Izlence.en.md`
- Bayer, McCreight (1972). "Organization and Maintenance
  of Large Ordered Indexes"
- Fagin, Nievergelt, Pippenger, Strong (1979).
  "Extendible Hashing"
- Litwin (1980). "Linear Hashing: A New Tool for
  File and Table Addressing"

<!-- Speaker note: These are the same references listed at the end of the week's written notes. -->

---

# References (2/2)

- Knuth. *TAOCP, Vol. 3: Sorting and Searching*, 2nd ed
- Cormen, Leiserson, Rivest, Stein. *Introduction
  to Algorithms*. MIT Press
- Sedgewick, Wayne. *Algorithms*, 4th ed. Addison-Wesley
- williamfiset/Algorithms · Programiz DSA

<!-- Speaker note: The historical references — Bayer/McCreight, Fagin et al., Litwin — are what today's "short history" slides drew on. -->
