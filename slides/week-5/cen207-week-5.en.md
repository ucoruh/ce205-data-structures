---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 5 — Graphs and Traversals"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 5"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---


<!-- _class: baslik -->
<!-- _paginate: false -->

# Graphs and Traversals

**CEN207 Data Structures — Week 5**

Asst. Prof. Dr. Uğur CORUH · Fall 2026–2027

<!--
Speaker note: A tree let one node point at several children, but never back up and never sideways. Drop both of those restrictions — let any node point at any node — and a tree becomes a graph, the most general shape in this course.
-->

---

# Today's plan (3 hours)

| Hour | Topic |
| --- | --- |
| 1 | Why graphs, vocabulary **Anim 1** · matrix vs. list **Anim 2–3** |
| 2 | BFS **Anim 4** · DFS recursive **Anim 5** · DFS iterative **Anim 6** |
| 3 | Connected components **Anim 7** · shortest path **Anim 8** |

**Learning outcomes:** LO.1 (explain fundamental data structures) · LO.2 (analyze complexity) · LO.7 (choose the right structure)

<!-- Speaker note: Eight short animations carry the whole lecture; each appears once, exactly where its idea is introduced, and every one gets a second look at a harder or edge-case input. -->

---

# This week's concepts — where

| Concept | Where |
| --- | --- |
| Why graphs, vocabulary | Sections 1–2 |
| Adjacency matrix vs. adjacency list | Section 3 |
| BFS, DFS (recursive and iterative) | Sections 4–6 |
| Connected components, shortest path | Sections 7–8 |

<!-- Speaker note: Every term gets a full definition the first time it appears; this table just says where to find it again. -->

---

# How the code examples work

- Every idea has a complete **C** and **Java** program
- C: `gcc -std=c11 -Wall -Wextra -o /tmp/x file.c && /tmp/x`
- Java: `javac -d /tmp/j File.java && java -cp /tmp/j File`
- Sources: `code/week-05/c/` and `code/week-05/java/`
- Each program's expected output is in the week notes

<!-- Speaker note: Open a terminal now if you want to run these live; every snippet on today's slides compiles and runs exactly as shown. -->

---

# Recap — stacks, queues, recursion (Week 3)

- A **stack** (LIFO): last pushed, first popped
- A **queue** (FIFO): first enqueued, first dequeued
- **Recursion** *is* a stack: a call pushes, a return pops
- Today: the very same stack and queue, holding graph vertices

<!-- Speaker note: Nothing about the machinery is new this week — only a new shape for the data these two structures will hold. -->

---

# Recap — trees are special graphs (Week 4)

- A tree: one root, no cycles, exactly one path to any node
- A graph: **no** root required, cycles allowed, many paths allowed
- Every tree **is** a graph; not every graph is a tree
- Traversals (pre/in/post/level) generalize to graph search today

<!-- Speaker note: Last week's "n nodes, n-1 edges, no cycle" rule was a special case; today that restriction is lifted entirely. -->

---

# Map of the week — at a glance

| Foundations | Traversal & applications |
| --- | --- |
| Why graphs, vocabulary | BFS, DFS (recursive, iterative) |
| Matrix vs. list | Connected components |
| — | Shortest path (unweighted) |

<!-- Speaker note: Every box on this map gets its own slides below, most with a short animation and a complete C/Java program. -->

---

<!-- _class: bolum -->

# 1. Why Graphs? From Bridges to Networks

<!-- Speaker note: Section 1 motivates the whole week with the single oldest problem in graph theory, then shows the same shape hiding in maps, friendships, and the web. -->

---

# A question to start

A city has four landmasses joined by seven
bridges. Can you walk through the city crossing
**every** bridge exactly once, and return home?

<!-- Speaker note: This is the actual question a small city asked itself in the 1700s — and it produced an entirely new branch of mathematics. -->

---

# A short history

- **1736** — Leonhard Euler solves the Königsberg bridge puzzle
- Königsberg (today Kaliningrad): 4 landmasses, 7 bridges
- Euler's paper is the **first** graph-theory paper ever written
- He answered "no" — and explained exactly why, for any city

<!-- Speaker note: Euler never drew a single bridge in his paper — he threw away everything except which landmasses connect to which, which is precisely the idea of a graph. -->

---

# The bridges, restated

- Each **landmass** becomes a **vertex** (4 of them)
- Each **bridge** becomes an **edge** (7 of them)
- The walk becomes: trace every edge once, never lifting your pen
- This is an **Eulerian path** — named after Euler himself

<!-- Speaker note: Stripping away the map and keeping only "what connects to what" is the single most important move in this entire course. -->

---

# Euler's insight: degree parity

- Every time you **pass through** a vertex, you use 2 edges
- Only your start and end vertex may use an **odd** number
- An Eulerian walk needs **0 or 2** odd-degree vertices, no more
- Königsberg has **4** odd-degree vertices — so no walk exists

<!-- Speaker note: This single counting argument, degree parity, is why the answer is "no" for any city shaped like Königsberg, not just that one. -->

---

# Why it matters

- One puzzle, solved by counting, founded **graph theory**
- The same vertex/edge idea now models almost any relationship
- Modern uses: maps, social networks, the web, and much more
- The next three slides show three of them

<!-- Speaker note: "Vertices and edges" turned out to be one of the most reusable ideas in all of computer science. -->

---

# Graphs are everywhere — road maps

- **Vertices:** intersections, cities, addresses
- **Edges:** roads, with a **weight** — distance or drive time
- GPS routing asks: shortest weighted path from A to B
- Week 9's Dijkstra's algorithm answers exactly that question

<!-- Speaker note: Every "get directions" button you have ever tapped ran some form of a graph shortest-path algorithm underneath. -->

---

# Graphs are everywhere — social networks

- **Vertices:** people or accounts
- **Edges:** "follows" (directed) or "is friends with" (undirected)
- "Friends of friends" — reachable in exactly 2 edges
- Section 4's BFS answers that question, one level at a time

<!-- Speaker note: A friend suggestion feature is, underneath, almost always a short breadth-first search from your own vertex. -->

---

# Graphs are everywhere — the web

- **Vertices:** web pages; **edges:** hyperlinks (directed)
- `A>B` means page `A` links **to** page `B`
- A crawler visits every reachable page exactly once
- Section 6's DFS is a classic way to write a web crawler

<!-- Speaker note: PageRank, the original Google ranking idea, is fundamentally a computation performed on this exact directed graph of links. -->

---

# Graph vs. tree, revisited

| Tree (Week 4) | Graph (this week) |
| --- | --- |
| One root | No required root |
| No cycles allowed | Cycles allowed |
| Exactly one path between any two nodes | Zero, one, or many paths |

<!-- Speaker note: Keep this table in mind for the rest of the week — every traversal idea below is a tree idea with these three restrictions removed. -->

---

# Common mistakes

- Assuming a graph must be **connected** — it may not be
- Assuming an edge always goes **both ways** — only if undirected
- Forgetting a single vertex with no edges is still a valid graph

<!-- Speaker note: Every one of today's algorithms must work correctly even on the awkward cases this slide lists — that is exactly what the "edge case" animations below test. -->

---

# Mini-quiz

A city has exactly **two** odd-degree landmasses,
the rest even. Can a walk crossing every bridge
once exist? Where would it have to start?

<!-- Speaker note: Apply the parity rule from a few slides back. -->

---

# Answer

**Yes.** With exactly two odd-degree vertices,
an Eulerian **path** (not a full round trip) exists,
starting at one odd vertex and ending at the other.

<!-- Speaker note: Zero odd vertices gives a round trip back to the start; exactly two gives a one-way walk — anything else, no walk at all. -->

---

<!-- _class: bolum -->

# 2. Graph Vocabulary

<!-- Speaker note: Section 2 builds the vocabulary every later section leans on — vertex, edge, degree, path, cycle — all on one worked example. -->

---

# A question to start

A graph is just two sets: **V**, the vertices,
and **E**, the edges. How much structure can
really come from an idea that small?

<!-- Speaker note: Almost everything this week — surprisingly, this two-set definition is the entire foundation. -->

---

# A graph, formally

- A graph `G = (V, E)`: a set of vertices, a set of edges
- Each edge connects **two** vertices (possibly the same one)
- `|V|` vertices, `|E|` edges — common shorthand: `V` and `E`
- Everything below is built from just these two sets

<!-- Speaker note: This formal definition looks sparse on purpose — its power is exactly how few assumptions it makes. -->

---

# Vocabulary (1/4)

| Term | Meaning |
| --- | --- |
| **Vertex** (node) | A single point in the graph |
| **Edge** | A connection between two vertices |
| **Undirected** | Edge `A-B` usable in either direction |
| **Directed** | Edge `A>B` usable only `A` to `B` |

<!-- Speaker note: Every one of these is pointed at, one at a time, in the animation right after this table. -->

---

# Vocabulary (2/4)

| Term | Meaning |
| --- | --- |
| **Weighted** | Every edge carries a number, its weight |
| **Unweighted** | Edges only say "connected", no number |
| **Degree** (undirected) | Edges touching a vertex |

<!-- Speaker note: An unweighted edge is really just a weighted edge whose weight always happens to be 1. -->

---

# Vocabulary (3/4)

| Term | Meaning |
| --- | --- |
| **In-degree** | Edges pointing **into** a vertex (directed) |
| **Out-degree** | Edges pointing **out of** a vertex (directed) |
| **Path** | An edge sequence, no repeated vertex |
| **Cycle** | A path that returns to its start |

<!-- Speaker note: Degree splits into two only once direction exists — an undirected graph never needs "in" or "out" at all. -->

---

# Vocabulary (4/4)

| Term | Meaning |
| --- | --- |
| **Connected** | Every vertex reachable from every other |
| **Self-loop** | An edge from a vertex to itself |
| **Multi-edge** | More than one edge between the same pair |

<!-- Speaker note: A graph that allows self-loops and multi-edges is sometimes specifically called a multigraph. -->

---

# Sparse vs. dense

- **Sparse:** `E` close to `V` — few edges per vertex
- **Dense:** `E` close to `V²` — most pairs connected
- A road map: sparse (a city has few roads per intersection)
- A "who follows whom" graph on a small team: often dense

<!-- Speaker note: This distinction matters a great deal in Section 3, when choosing how to store a graph. -->

---

# What can we ask a graph?

| Operation | What it answers |
| --- | --- |
| `has_edge(a, b)` | Are `a` and `b` directly connected? |
| `neighbors(v)` | Which vertices does `v` connect to? |
| `degree(v)` | How many edges touch `v`? |

<!-- Speaker note: Every algorithm this week is built entirely out of these three small questions, asked over and over. -->

---

# Graph vocabulary, one term at a time

<iframe class="dsanim" src="anim/graph-terminology.html?yer=slayt&lang=en" title="Graph vocabulary"></iframe>

<!-- Speaker note: Normal example: 8 vertices, weighted, with a cycle, a self-loop, a multi-edge, and 2 components — every term from this section, on one graph. -->

---

# Edge case — directed, multiple cycles, a self-loop

<iframe class="dsanim" src="anim/graph-terminology.html?yer=slayt&lang=en&example=hard" title="Graph vocabulary: directed, hard"></iframe>

<!-- Speaker note: 8 vertices, directed, with two separate cycles, a self-loop, a multi-edge and 2 weak components — in-degree and out-degree now genuinely differ per vertex. -->

---

# Code — the Edge and Graph structs

```c
typedef struct Edge {
    int to;             /* other endpoint */
    int weight;         /* 1 if unweighted */
    struct Edge *next;
} Edge;

typedef struct Graph {
    Edge *adj[MAX_V];   /* one list per vertex */
    int vertex_count;
    int directed;        /* 0 or 1 */
} Graph;
```

<!-- Speaker note: One struct for an edge, one for the whole graph — every algorithm this week is built on exactly these two shapes. -->

---

# Code — out_degree()

```c
int out_degree(Graph *g, int v) {
    int d = 0;
    for (Edge *e = g->adj[v]; e; e = e->next)
        d++;
    return d;
}
```

<!-- Speaker note: In an undirected graph this single function already counts everything a vertex needs — no separate "in" version required. -->

---

# Code — in_degree() (directed only)

```c
int in_degree(Graph *g, int v) {
    int d = 0;
    for (int u = 0; u < g->vertex_count; u++)
        for (Edge *e = g->adj[u]; e; e = e->next)
            if (e->to == v) d++;
    return d;
}
```

<!-- Speaker note: Finding who points AT v means scanning every OTHER vertex's list — there is no shortcut without extra bookkeeping. -->

---

# Complexity

- `out_degree`: walk one list — **O(degree of v)**
- `in_degree`: scan **every** vertex's list — **O(V + E)**
- Directed graphs make "in" strictly more expensive than "out"

<!-- Speaker note: This asymmetry is a direct consequence of storing only outgoing edges, the adjacency-list choice Section 3 explains. -->

---

# Common mistakes

- Confusing **degree** with **number of neighbors** on a multigraph
- Forgetting a self-loop counts **twice** toward degree
- Assuming in-degree and out-degree are always equal — only in special cases

<!-- Speaker note: The hard-preset animation above was built specifically to make in-degree and out-degree disagree on most vertices. -->

---

# Mini-quiz

A directed graph has a self-loop at vertex `X`.
By how much does that self-loop raise `X`'s
in-degree? Its out-degree?

<!-- Speaker note: Think about which direction a self-loop's single edge "points" in. -->

---

# Answer

**By 1 each.** A self-loop `X>X` counts once
as an edge **into** `X` and once as an edge
**out of** `X` — both in-degree and out-degree rise by 1.

<!-- Speaker note: In an undirected graph, that same self-loop instead raises plain degree by 2, not 1 — direction changes the counting rule. -->

---

<!-- _class: bolum -->

# 3. Representing a Graph: Matrix vs. List

<!-- Speaker note: A graph is an idea; a program needs one concrete way to store it. This section builds the two standard choices, side by side, on the very same graphs. -->

---

# A question to start

`has_edge(a, b)` and `neighbors(v)` are the two
questions every algorithm this week will ask.
What is the simplest structure that answers both?

<!-- Speaker note: There is no single best answer — the two structures below trade one operation's speed for the other's memory. -->

---

# Two representations at a glance

| | Adjacency matrix | Adjacency list |
| --- | --- | --- |
| Stores | A `V x V` table | One list per vertex |
| Best for | Dense graphs | Sparse graphs |
| `has_edge` | O(1) | O(degree) |

<!-- Speaker note: Both sections below build these from the exact same edge lists, so the two representations can be compared directly. -->

---

# Adjacency matrix — the idea

A `V x V` table. `matrix[i][j]` holds **1** (or
the weight) if an edge runs from vertex `i` to
vertex `j`, **0** otherwise. Undirected graphs
fill both `matrix[i][j]` and `matrix[j][i]`.

<!-- Speaker note: An undirected graph's matrix is always symmetric across its diagonal — that symmetry is what "either direction" means, written as numbers. -->

---

# Adjacency matrix, step by step

<iframe class="dsanim" src="anim/adjacency-matrix.html?yer=slayt&lang=en" title="Adjacency matrix"></iframe>

<!-- Speaker note: Normal example: 7 vertices, undirected, unweighted, 10 edges — watch the matrix fill in, one symmetric pair of cells at a time. -->

---

# Edge case — a complete graph

<iframe class="dsanim" src="anim/adjacency-matrix.html?yer=slayt&lang=en&example=dense" title="Adjacency matrix: complete graph"></iframe>

<!-- Speaker note: 5 vertices, every pair connected, 10 edges — the maximum possible for 5 vertices, and the matrix ends up completely full off the diagonal. -->

---

# Code — add_edge() (matrix)

```c
void add_edge(int a, int b, int w, int dir) {
    matrix[a][b] = w;
    if (!dir)
        matrix[b][a] = w;  /* mirror the diagonal */
}
```

<!-- Speaker note: One assignment for a directed edge, two — mirrored — for an undirected one; that single "if" is the whole difference. -->

---

# Code — build_adjacency_matrix()

```c
void build_adjacency_matrix(Edge *edges, int n,
                             int directed) {
    for (int i = 0; i < MAX_V; i++)
        for (int j = 0; j < MAX_V; j++)
            matrix[i][j] = 0;
    for (int k = 0; k < n; k++)
        add_edge(edges[k].a, edges[k].b,
                 edges[k].weight, directed);
}
```

<!-- Speaker note: Zero the whole table first, then add one edge at a time — order does not matter, since each edge only touches its own two cells. -->

---

# Complexity — matrix

- `has_edge(a, b)`: one lookup — **O(1)**
- Space: always **O(V²)** cells, dense or sparse alike
- `neighbors(v)`: scan a whole row — **O(V)**, even if v has 1 edge

<!-- Speaker note: The matrix's cost never depends on how many edges actually exist — only on how many vertices could possibly exist. -->

---

# Adjacency list — the idea

One linked list **per vertex**, holding only
its actual neighbors. An undirected edge
`A-B` appends `B` to `A`'s list **and** `A`
to `B`'s list — two nodes, two lists.

<!-- Speaker note: This is the exact same linked-list node from Week 2, just reused: one field for the neighbor's id, one for "next". -->

---

# Adjacency list, step by step

<iframe class="dsanim" src="anim/adjacency-list.html?yer=slayt&lang=en" title="Adjacency list"></iframe>

<!-- Speaker note: Same normal example as the matrix: 7 vertices, undirected, unweighted, 10 edges — watch each edge append to one or two lists. -->

---

# Edge case — directed, an empty list

<iframe class="dsanim" src="anim/adjacency-list.html?yer=slayt&lang=en&example=hard" title="Adjacency list: directed, empty list"></iframe>

<!-- Speaker note: 8 vertices, directed, weighted, 10 edges including a reversed pair `P>R` and `R>P` — some vertices end up with an empty list, having no outgoing edge at all. -->

---

# Code — append() (list)

```c
void append(int v, int neighbour) {
    AdjNode *n = malloc(sizeof(AdjNode));
    n->to = neighbour;
    n->next = NULL;
    if (adj[v] == NULL) { adj[v] = n; return; }
    AdjNode *cur = adj[v];
    while (cur->next) cur = cur->next;
    cur->next = n;
}
```

<!-- Speaker note: Exactly Week 2's singly linked list append: walk to the tail, then attach — nothing about graphs changes this pattern at all. -->

---

# Code — add_edge() (list)

```c
void add_edge(int a, int b, int directed) {
    append(a, b);
    if (!directed && a != b)
        append(b, a);
}
```

<!-- Speaker note: The self-loop check, `a != b`, exists so an undirected self-loop is not appended twice to the very same list. -->

---

# Complexity — list

- Space: **O(V + E)** — only real edges take room
- `neighbors(v)`: walk its own list — **O(degree of v)**
- `has_edge(a, b)`: walk `a`'s list looking for `b` — **O(degree)**

<!-- Speaker note: has_edge is the one operation where the matrix strictly wins — the list must search, the matrix never does. -->

---

# Memory & time, side by side

| | Matrix | List |
| --- | --- | --- |
| Space | O(V²) | O(V + E) |
| `has_edge` | O(1) | O(degree) |
| `neighbors` | O(V) | O(degree) |

<!-- Speaker note: Three rows, and every later algorithm's complexity traces straight back to this one small table. -->

---

# Sparse graphs: pick the list

- A road map, the web, a friendship graph: all **sparse**
- `E` is close to `V`, far below `V²`
- The list's O(V + E) space stays small; the matrix wastes O(V²)
- Every algorithm from Section 4 onward uses the **list**

<!-- Speaker note: This is not a close call for the graphs this course actually cares about — the list wins by a wide margin. -->

---

# Dense graphs: matrix can win

- A small, densely connected graph: `E` close to `V²`
- The matrix's "wasted" O(V²) space is barely wasted at all
- `has_edge` at O(1) can matter more than saving memory
- Rule of thumb: dense and small → matrix; sparse or large → list

<!-- Speaker note: Both structures store the exact same information — this choice is purely an engineering trade-off, never a correctness one. -->

---

# Common mistakes

- Using a matrix for a large, sparse graph — wastes huge memory
- Forgetting the list needs **two** appends for one undirected edge
- Reading `matrix[a][b]` as symmetric on a **directed** graph

<!-- Speaker note: A directed matrix's two "mirror" cells, matrix[a][b] and matrix[b][a], can legitimately hold two completely different values. -->

---

# Mini-quiz

A graph has 1,000 vertices and only 2,000
edges. Roughly how many cells would its
adjacency matrix need? Is that graph sparse?

<!-- Speaker note: Square the vertex count, then compare that to the edge count. -->

---

# Answer

**About 1,000,000 cells** (1000²), for only
2,000 real edges — almost all of it wasted.
Yes, **very sparse**: an adjacency list is the
clear choice here.

<!-- Speaker note: This is exactly the situation Section 3's "sparse vs. dense" rule of thumb was written for. -->

---

<!-- _class: bolum -->

# 4. Breadth-First Search (BFS)

<!-- Speaker note: BFS is level order, from Week 4, generalized from a tree to any graph — a queue, and nothing else, drives the whole algorithm. -->

---

# A question to start

Starting from one person, who are their direct
friends? Their friends-of-friends? Visit
everyone, **nearest first** — how?

<!-- Speaker note: "Nearest first" is the whole idea; the algorithm below is built to guarantee exactly that order. -->

---

# A short history

- **1959** — Edward F. Moore publishes "The shortest path through a maze"
- Independently rediscovered soon after, in different fields
- The queue-based method here is essentially Moore's algorithm
- Now one of the most widely used graph algorithms in practice

<!-- Speaker note: Moore was solving a physical maze-wiring problem — the same queue-based idea turned out to generalize to any graph at all. -->

---

# Intuition — ripples on a pond

- Drop a stone: the first ripple reaches the nearest points
- The next ripple reaches everything one step further out
- BFS visits a graph the same way — ring by ring, outward
- Each "ring" here is called a **level**

<!-- Speaker note: No ripple ever overtakes an earlier one — that ordering guarantee is exactly what makes BFS find shortest paths. -->

---

# The BFS idea

- Use a **queue** (FIFO) — Week 3's structure, holding vertices
- Start vertex: enqueue it, mark visited, level 0
- Dequeue a vertex, enqueue its unvisited neighbors, level + 1
- The visited edges form a **BFS tree**, rooted at the start

<!-- Speaker note: The BFS tree records, for every vertex, exactly one edge that first reached it — that is the parent pointer Section 8 reuses. -->

---

# BFS, step by step

<iframe class="dsanim" src="anim/bfs.html?yer=slayt&lang=en" title="Breadth-first search"></iframe>

<!-- Speaker note: Normal example: 7 vertices, undirected, starting at A, 10 edges — watch the queue and the level[] row fill in together. -->

---

# Edge case — a disconnected graph

<iframe class="dsanim" src="anim/bfs.html?yer=slayt&lang=en&example=disconnected" title="BFS: disconnected graph"></iframe>

<!-- Speaker note: 9 vertices, 2 components — G, H, I are simply unreachable from A, the starting vertex, and stay grey for the whole run. -->

---

# Code — enqueue / dequeue

```c
void enqueue(int v) {
    queue_data[rear] = v;
    rear = (rear + 1) % MAX_V;
    count++;
}
int dequeue(void) {
    int v = queue_data[front];
    front = (front + 1) % MAX_V;
    count--;
    return v;
}
```

<!-- Speaker note: The exact circular queue from Week 3 — only the element type changed, from int scores to graph vertex ids. -->

---

# Code — bfs() main loop

```c
visited[start] = 1;
level_of[start] = 0;
enqueue(start);
while (count > 0) {
    int u = dequeue();
    for (Edge *e = g->adj[u]; e; e = e->next) {
        if (!visited[e->to]) {
            visited[e->to] = 1;
            level_of[e->to] = level_of[u] + 1;
            parent_of[e->to] = u;
            enqueue(e->to);
        }
    }
}
```

<!-- Speaker note: Every unvisited neighbor gets marked, leveled, and given a parent pointer, all in the same instant it is first enqueued. -->

---

# Complexity

- Every vertex enqueued once, dequeued once — **O(V)**
- Every edge examined at most twice (once per endpoint) — **O(E)**
- Total: **O(V + E)** — the same bound as every list operation

<!-- Speaker note: This O(V + E) bound is the single most common complexity result in graph algorithms, and it recurs all through this week. -->

---

# BFS tree and shortest paths

- The BFS tree's root-to-vertex path uses the **fewest edges**
- `level_of[v]` is exactly that shortest edge-count from the start
- This only holds for **unweighted** graphs — Section 8 uses it directly
- Weighted shortest paths need Dijkstra's algorithm, Week 9

<!-- Speaker note: BFS is secretly already solving the unweighted shortest-path problem; Section 8 just makes that fact explicit. -->

---

# Applications

- "Friends of friends" — Section 4's social-network motivation
- Web crawling level by level, nearest pages first
- Puzzle solvers: fewest moves to solve a maze or a sliding puzzle
- Network broadcast: reach every machine in the fewest hops

<!-- Speaker note: Any time the question is "fewest steps", not "shortest weighted distance", BFS is usually the right first tool to reach for. -->

---

# Common mistakes

- Using a **stack** instead of a queue — silently becomes depth-first
- Forgetting to mark a vertex visited **at enqueue time**, not dequeue
- Re-enqueuing an already-visited vertex — wastes work, may loop

<!-- Speaker note: Marking "visited" too late is the single most common BFS bug — the same vertex can be enqueued more than once. -->

---

# Mini-quiz

In an unweighted graph, BFS from `A` gives
`B` level 2. How many edges are on the
**shortest** path from `A` to `B`?

<!-- Speaker note: Recall exactly what "level" was defined to mean, a few slides back. -->

---

# Answer

**Exactly 2 edges.** BFS's level is defined
as the fewest edges from the start — that
is precisely the shortest-path edge count.

<!-- Speaker note: This is the fact Section 8 turns into a full algorithm: level IS shortest-path length, for unweighted graphs. -->

---

<!-- _class: bolum -->

# 5. Depth-First Search (DFS) — Recursive

<!-- Speaker note: DFS is preorder, from Week 4, generalized from a tree to any graph — recursion, and nothing else, drives the whole algorithm. -->

---

# A question to start

A maze has many branching paths. Instead of
exploring every direction a little at a time,
what if you committed to **one** path, all
the way, before ever backtracking?

<!-- Speaker note: "Commit, then backtrack" is depth-first search in one sentence — the opposite strategy from BFS's ring-by-ring approach. -->

---

# Intuition — a maze, go deep first

- Pick a direction, walk it as far as it goes
- Dead end? Back up to the last choice, try the next direction
- "Back up" is exactly what a **stack** (or recursion) does for you
- Depth-first, not breadth-first — one branch, fully, before the next

<!-- Speaker note: Recursion IS a stack, from Week 3 — every recursive dfs_visit call pushes a frame, and every return pops one. -->

---

# Colors and times

- **White** (0): not yet discovered
- **Gray** (1): discovered, still exploring its neighbors
- **Black** (2): finished, every neighbor explored
- `disc[v]` / `fin[v]`: the clock tick each color change happens at

<!-- Speaker note: A vertex is gray for exactly as long as it sits on the call stack — the moment it returns, it turns black. -->

---

# Edge types

| Type | Meaning |
| --- | --- |
| **Tree edge** | Leads to a new, white vertex |
| **Back edge** | Leads to a gray **ancestor** — a cycle! |
| **Forward / cross** | Leads to a finished, black vertex (directed only) |

<!-- Speaker note: Forward and cross edges cannot happen in an undirected graph — there, every non-tree edge you find is a back edge. -->

---

# DFS recursive, step by step

<iframe class="dsanim" src="anim/dfs-recursive.html?yer=slayt&lang=en" title="DFS recursive"></iframe>

<!-- Speaker note: Normal example: 7 vertices, undirected, 4 back edges, 10 edges — watch the call stack column and disc/fin[] fill in together. -->

---

# Edge case — all four edge types at once

<iframe class="dsanim" src="anim/dfs-recursive.html?yer=slayt&lang=en&example=hard" title="DFS recursive: all edge types"></iframe>

<!-- Speaker note: 6 vertices, directed, built specifically so a tree, a back, a forward, and a cross edge all appear in one single run. -->

---

# Code — dfs_visit(): discovery

```c
void dfs_visit(Graph *g, int u) {
    color_of[u] = 1;         /* gray */
    disc_time[u] = ++clock_;
    for (Edge *e = g->adj[u]; e; e = e->next) {
        int v = e->to;
        /* ... classify the edge to v ... */
    }
    color_of[u] = 2;         /* black */
    fin_time[u] = ++clock_;
}
```

<!-- Speaker note: One shared clock counts up on every discovery AND every finish — that is what makes disc/fin intervals nest correctly. -->

---

# Code — classifying an edge

```c
if (color_of[v] == 0) {
    parent_of[v] = u;
    dfs_visit(g, v);     /* tree edge */
} else if (color_of[v] == 1) {
    /* back edge: v is an ancestor */
} else {
    /* v is black: forward or cross */
}
```

<!-- Speaker note: Three colors, three branches — the entire edge-classification idea from a few slides back, written as one if/else chain. -->

---

# Code — one tree per component

```c
void dfs(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++)
        color_of[i] = 0;
    for (int i = 0; i < g->vertex_count; i++)
        if (color_of[i] == 0)
            dfs_visit(g, i);
}
```

<!-- Speaker note: A disconnected graph's DFS produces not one tree but a DFS FOREST — one tree per component, exactly like Section 7's components. -->

---

# Complexity

- Every vertex colored white → gray → black **once** — O(V)
- Every edge examined exactly once (twice if undirected) — O(E)
- Total: **O(V + E)** — identical to BFS's bound

<!-- Speaker note: BFS and DFS visit the very same set of vertices and edges — only the ORDER differs, never the total work. -->

---

# Recursion depth: a hidden risk

- Each `dfs_visit` call adds one frame to the **call stack**
- A long chain graph can recurse as deep as `V` calls
- A very large or very "stringy" graph can **overflow** that stack
- Section 6 rebuilds DFS with an explicit stack to avoid exactly this

<!-- Speaker note: This is not a hypothetical: a million-vertex chain graph really can crash a naive recursive DFS in practice. -->

---

# Common mistakes

- Forgetting to skip the edge straight back to your own **parent**
- Treating every non-tree edge as a "cycle" on a **directed** graph
- Reusing `color_of` across runs without resetting it to white

<!-- Speaker note: On an undirected graph, the edge back to your immediate parent is not a real back edge — it is the same edge you just arrived on. -->

---

# Mini-quiz

In an undirected graph, DFS finds an edge to
a vertex that is currently **gray**. What does
that tell you about the graph?

<!-- Speaker note: Recall exactly what "gray" means, and where a gray vertex currently sits. -->

---

# Answer

**The graph has a cycle.** A gray vertex is
still on the call stack — it is an **ancestor**
of the current vertex, so this edge is a back edge.

<!-- Speaker note: This is exactly how graph-terminology.js detected the cycle it reported back in Section 2's animation. -->

---

<!-- _class: bolum -->

# 6. DFS — Iterative (Explicit Stack)

<!-- Speaker note: Section 5's recursion risk motivates this section directly: the same algorithm, the same visit order, but with our own array-based stack instead of the call stack. -->

---

# A question to start

Section 5 ended on a warning: deep recursion
can overflow the call stack. Can the *exact
same* traversal be written without recursion?

<!-- Speaker note: Yes — and the technique is one this course has already used once before, back in Week 4's iterative inorder traversal. -->

---

# Why go iterative?

- Recursion's call stack has a fixed size, set by the OS
- Our **own** stack (Week 3's array-based one) can be sized as needed
- Same algorithm, same visit order — only the bookkeeping moves
- No memory saved overall, just moved somewhere safer

<!-- Speaker note: This is the exact same motivation as Week 4's iterative inorder traversal, now applied to a graph instead of a tree. -->

---

# The reverse-order trick

- Neighbors must be visited in **alphabetical** order, like recursion
- Pushing them alphabetically would pop them **backwards**
- Fix: push neighbors in **reverse** alphabetical order
- Popping a reversed-push order restores the original order

<!-- Speaker note: This single trick is the whole difference between "an explicit stack" and "an explicit stack that matches recursion exactly". -->

---

# DFS iterative, step by step

<iframe class="dsanim" src="anim/dfs-iterative.html?yer=slayt&lang=en" title="DFS iterative"></iframe>

<!-- Speaker note: Same normal example as Section 5: 7 vertices, undirected, 4 back edges, 10 edges — the visit order comes out identical. -->

---

# Edge case — a DFS forest

<iframe class="dsanim" src="anim/dfs-iterative.html?yer=slayt&lang=en&example=forest" title="DFS iterative: forest"></iframe>

<!-- Speaker note: 10 vertices, 2 separate components — a fresh stack starts from each unvisited vertex, producing one tree per component, exactly as in Section 5. -->

---

# Code — push / pop

```c
void push(int v) { stack_data[++top] = v; }
int  pop(void)   { return stack_data[top--]; }
```

<!-- Speaker note: The plainest possible array-based stack — one increment on push, one decrement on pop, nothing else. -->

---

# Code — dfs_iterative() main loop

```c
push(start);
while (top >= 0) {
    int u = pop();
    if (visited[u]) continue;   /* stale entry */
    visited[u] = 1;
    for (int i = deg[u] - 1; i >= 0; i--)
        if (!visited[adj[u][i]])
            push(adj[u][i]);
}
```

<!-- Speaker note: The "if (visited[u]) continue" line matters: a vertex can be pushed more than once, and only the FIRST pop should count. -->

---

# Complexity

- Every vertex pushed and popped a bounded number of times — O(V)
- Every edge examined once (twice if undirected) — O(E)
- Total: **O(V + E)** — no better, no worse than the recursive version

<!-- Speaker note: The whole point was never speed — it was avoiding a call-stack overflow that the recursive version risks on deep graphs. -->

---

# Recursive vs. iterative, side by side

| | Recursive (Sec. 5) | Iterative (Sec. 6) |
| --- | --- | --- |
| Stack | The call stack | Our own array |
| Visit order | Alphabetical | Alphabetical (reversed pushes) |
| Deep-graph risk | Can overflow | Bounded by array size |

<!-- Speaker note: Same order, same complexity, same output — this table is really about which stack does the remembering. -->

---

# Common mistakes

- Pushing neighbors in **forward**, not reverse, alphabetical order
- Forgetting the stale-entry check — double-visits, wrong disc/fin
- Assuming a popped, unvisited vertex is always freshly discovered

<!-- Speaker note: Skipping the stale-entry check is the single most common bug when converting recursion to an explicit stack by hand. -->

---

# Mini-quiz

A vertex is pushed **twice**, from two
different neighbors, before either pop
happens. How many times is it actually visited?

<!-- Speaker note: Recall what the stale-entry check on the previous code slide is specifically there to prevent. -->

---

# Answer

**Once.** The first `pop()` visits it and
marks it visited; the second `pop()` finds
`visited[u]` already true and is discarded.

<!-- Speaker note: That discard is exactly the "stale entry" case the code's `if (visited[u]) continue` line handles. -->

---

<!-- _class: bolum -->

# 7. Connected Components

<!-- Speaker note: Section 7 reuses BFS itself, unchanged, as a subroutine — the only new idea is calling it once per unvisited vertex and giving each run its own label. -->

---

# A question to start

A graph may not be one connected piece —
it can be several separate pieces. How many?
Which vertices belong to which piece?

<!-- Speaker note: Section 1 already warned that a graph need not be connected; this section answers "how disconnected, exactly?". -->

---

# The idea

- Every unvisited vertex starts a **new** BFS, with a new id
- That BFS labels everything **it can reach** with that same id
- Once the queue empties, the next unvisited vertex starts the next
- Direction is **ignored** — this finds **weak** connectivity

<!-- Speaker note: "Weak" connectivity means we treat every directed edge as if it were undirected, just for this one question. -->

---

# Connected components, step by step

<iframe class="dsanim" src="anim/connected-components.html?yer=slayt&lang=en" title="Connected components"></iframe>

<!-- Speaker note: Normal example: 10 vertices, undirected, 2 components (two separate 5-cycles), 10 edges — watch each BFS claim its own circle. -->

---

# Edge case — many small components

<iframe class="dsanim" src="anim/connected-components.html?yer=slayt&lang=en&example=many" title="Connected components: many small"></iframe>

<!-- Speaker note: 12 vertices, undirected, 4 separate triangle components, 12 edges — the most components this section's animation ever shows at once. -->

---

# Code — bfs_label()

```c
void bfs_label(Graph *g, int start, int id) {
    int q[MAX_V], front = 0, rear = 0;
    comp_of[start] = id;
    q[rear++] = start;
    while (front < rear) {
        int u = q[front++];
        for (Edge *e = g->adj[u]; e; e = e->next)
            if (comp_of[e->to] == -1) {
                comp_of[e->to] = id;
                q[rear++] = e->to;
            }
    }
}
```

<!-- Speaker note: This is Section 4's plain BFS, completely unchanged, except that "visited" is now "comp_of == -1" and the mark left behind is an id, not just true/false. -->

---

# Code — count_components()

```c
int count_components(Graph *g) {
    int next_id = 0;
    for (int i = 0; i < g->vertex_count; i++)
        comp_of[i] = -1;
    for (int i = 0; i < g->vertex_count; i++)
        if (comp_of[i] == -1)
            bfs_label(g, i, next_id++);
    return next_id;
}
```

<!-- Speaker note: next_id both counts the components AND becomes each new component's label — one variable, two jobs. -->

---

# Complexity

- Every vertex enters exactly one `bfs_label` call — O(V)
- Every edge examined at most twice total, across all calls — O(E)
- Total: **O(V + E)** — the cost of one BFS, done once per component

<!-- Speaker note: Running BFS several times, once per component, still adds up to the same O(V + E) as one single BFS over the whole graph. -->

---

# Applications

- Social networks: which friend circles exist, and who is in each
- Image processing: which pixels form one connected region
- Networking: which machines can currently reach each other
- Puzzle games: "flood fill" — the paint-bucket tool, essentially

<!-- Speaker note: Flood fill is worth naming specifically — it is exactly this algorithm, run on a grid of pixels instead of a graph of vertices. -->

---

# Common mistakes

- Forgetting direction is **ignored** here — this is weak connectivity
- Reusing `comp_of` values across separate graphs without resetting
- Assuming a single-vertex graph has **zero** components — it has one

<!-- Speaker note: Strong connectivity (respecting direction) is a genuinely harder problem, needing more than plain BFS — outside this week's scope. -->

---

# Mini-quiz

A directed graph has an edge `A>B` but no
edge `B>A`. Weakly, are `A` and `B` in the
same component?

<!-- Speaker note: Recall exactly what "direction is ignored" was said to mean, a few slides back. -->

---

# Answer

**Yes.** Weak connectivity ignores direction
entirely, so `A>B` alone is enough to place
`A` and `B` in the same component.

<!-- Speaker note: Strong connectivity would require BOTH A>B and a path back from B to A — a stricter, different question entirely. -->

---

<!-- _class: bolum -->

# 8. Shortest Path in Unweighted Graphs

<!-- Speaker note: Section 4 already computed every vertex's level; this section makes that fact fully explicit by reconstructing the actual shortest path, not just its length. -->

---

# A question to start

BFS already knows the fewest edges from `A`
to every vertex. Can it also report the
**exact route** — not just the distance?

<!-- Speaker note: Yes — and the mechanism is one already sitting inside BFS's output: the parent pointer, recorded the instant each vertex is first reached. -->

---

# The idea

- Run BFS from `s`, recording each vertex's **parent** as usual
- To find the path to `t`: start at `t`, follow `parent` backward
- Stop when you reach `s` — then **reverse** the collected list
- The result is the shortest `s`-to-`t` path, by edge count

<!-- Speaker note: Nothing here is new machinery — it is Section 4's BFS, plus one short walk backward through the parent pointers it already built. -->

---

# Path-finding BFS, step by step

<iframe class="dsanim" src="anim/path-finding-bfs.html?yer=slayt&lang=en" title="Shortest path with BFS"></iframe>

<!-- Speaker note: Normal example: 7 vertices, undirected, s=A, t=F, 10 edges — watch parent[] fill in during BFS, then get walked backward at the end. -->

---

# Edge case — no path exists

<iframe class="dsanim" src="anim/path-finding-bfs.html?yer=slayt&lang=en&example=no-path" title="Shortest path: no path exists"></iframe>

<!-- Speaker note: 9 vertices, s=A, t=H, in 2 separate components — the queue empties with t never visited, so no path can be reported at all. -->

---

# Code — bfs_shortest_path(): the search

```c
visited[s] = 1;
queue_data[rear++] = s;
while (front < rear) {
    int u = queue_data[front++];
    for (Edge *e = g->adj[u]; e; e = e->next)
        if (!visited[e->to]) {
            visited[e->to] = 1;
            parent_of[e->to] = u;
            queue_data[rear++] = e->to;
        }
}
```

<!-- Speaker note: Identical to Section 4's BFS loop, with one difference: this version's ONLY goal is filling in parent_of correctly. -->

---

# Code — walking back the path

```c
if (!visited[t]) return -1;      /* no path */
int len = 0, v = t;
while (v != s) {
    path_out[len++] = v;
    v = parent_of[v];
}
path_out[len++] = s;
/* ... reverse path_out[0..len) in place ... */
return len - 1;                  /* edges */
```

<!-- Speaker note: The walk builds the path backward, from t to s, purely because that is the only direction the parent pointers go — reversing at the end fixes the order. -->

---

# Complexity

- The BFS itself: **O(V + E)**, exactly as in Section 4
- Walking the path back: **O(path length)**, at most O(V)
- Total: still **O(V + E)** — the walk-back never dominates

<!-- Speaker note: Reconstructing the actual path is essentially free on top of a BFS you would often be running anyway. -->

---

# Multiple shortest paths can exist

- BFS reports **one** shortest path, not necessarily the only one
- A different neighbor-visiting order can produce a different, equally short path
- All correct shortest paths share the same **length**, never necessarily the same route

<!-- Speaker note: Only the LENGTH is guaranteed unique — the exact sequence of vertices depends on tie-breaking choices like alphabetical order. -->

---

# Preview: weighted graphs need Dijkstra

- This section only works because every edge secretly has weight 1
- A **weighted** graph needs to compare actual distances, not edge counts
- **Dijkstra's algorithm** (Week 9) solves that, using a **priority queue**
- That priority queue is exactly the one Week 4 built from a heap

<!-- Speaker note: BFS's plain queue always expands the nearest UNVISITED vertex by edge count; Dijkstra swaps in a priority queue so it expands by actual distance instead. -->

---

# Common mistakes

- Forgetting to check `visited[t]` before walking the path back
- Walking `parent` forward instead of backward, from `t` to `s`
- Forgetting the final reversal — the path prints from `t` to `s`

<!-- Speaker note: Every one of these three mistakes still runs without crashing — the bug only shows up in the printed path itself. -->

---

# Mini-quiz

BFS from `s` never visits `t` at all. What
should `bfs_shortest_path` return, and why?

<!-- Speaker note: Recall the very first check the walk-back code makes, on the slide a few back. -->

---

# Answer

**`-1`.** If `t` was never visited, no path
exists at all — the `visited[t]` check catches
exactly this case before any walk-back begins.

<!-- Speaker note: This is precisely the situation the "no-path" edge-case animation above was built to demonstrate. -->

---

# Summary — vocabulary and representations

| Idea | Key fact |
| --- | --- |
| Graph | `V` vertices, `E` edges, directed or not |
| Degree | Undirected: 1 value; directed: in and out |
| Matrix | O(V²) space, O(1) `has_edge` |
| List | O(V + E) space, O(degree) `has_edge` |

<!-- Speaker note: Two representations, one table of trade-offs — every later algorithm's complexity traces back to this row. -->

---

# Summary — traversals and applications

| Idea | Key fact |
| --- | --- |
| BFS | Queue, level order, shortest unweighted path |
| DFS (recursive / iterative) | Stack, deep first, same visit order both ways |
| Components | Repeated BFS, one label per reachable set |
| Shortest path | BFS + parent pointers, walked backward |

<!-- Speaker note: Every one of these four rows is built from the same two moves: enqueue/dequeue, or push/pop. -->

---

# The big picture

Drop a tree's "one root, no cycles" rule and
you get a graph. Two structures store it; two
traversals, BFS and DFS, explore it; both
answer real questions — components, distance.

<!-- Speaker note: If a student remembers only one sentence from today, this is the one worth remembering. -->

---

# Self-check round

Four short questions. Think before the answer
appears on the next slide. Full exercises and
a ten-question quiz are in the week notes.

<!-- Speaker note: These mirror the self-check quiz at the end of the written notes, one question per slide, with a shorter set here. -->

---

# 1. A graph has 6 vertices and is a complete graph (every pair connected). How many edges does it have?

<!-- Speaker note: Ask, wait, then advance. -->

---

# `6 * 5 / 2 = 15` edges — every pair counted once, since the graph is undirected.

<!-- Speaker note: For n vertices, a complete undirected graph always has n(n-1)/2 edges. -->

---

# 2. Why does BFS need a queue instead of a stack?

<!-- Speaker note: Recall Section 4's ripples-on-a-pond intuition. -->

---

# A queue's FIFO order visits the nearest vertices first; a stack would go deep immediately, becoming DFS instead.

<!-- Speaker note: Swapping the data structure alone is the entire difference between these two traversal orders. -->

---

# 3. What does a "back edge" during DFS tell you about the graph?

<!-- Speaker note: Recall Section 5's edge-type table. -->

---

# The graph contains a cycle — a back edge always points to a gray ancestor still on the call stack.

<!-- Speaker note: This is exactly the cycle-detection technique graph-terminology.js used back in Section 2. -->

---

# 4. Connected components treats a directed graph as if it were undirected. What is this called?

<!-- Speaker note: Recall Section 7's terminology, a few slides back. -->

---

# Weak connectivity — direction is ignored; strong connectivity, requiring a path back too, is a harder, different question.

<!-- Speaker note: This distinction is worth remembering precisely, since the two give genuinely different answers on the same graph. -->

---

<!-- _class: baslik -->

# Next week

**Week 6 — Search and Hashing**

BFS and DFS both walk an entire graph to
find something. What if you could look an
item up directly, in close to O(1) time?

<!-- Speaker note: Hashing trades the "explore everything" idea of this week for a completely different one: compute exactly where to look, in one step. -->

---

# References (1/2)

- Course syllabus, Week 5: `docs/syllabus/syllabus.en.md`
- Cormen, Leiserson, Rivest, Stein. *Introduction to
  Algorithms*, 4th ed. MIT Press
- Sedgewick, Wayne. *Algorithms*, 4th ed. Addison-Wesley
- Euler, L. (1736). *Solutio problematis ad geometriam
  situs pertinentis*

<!-- Speaker note: These are the same references listed at the end of the week's written notes. -->

---

# References (2/2)

- Moore, E. F. (1959). "The shortest path through a maze"
- Hopcroft, J., Tarjan, R. (1973) — DFS edge classification
- Knuth. *The Art of Computer Programming, Vol. 1*, 3rd ed.
- williamfiset/Algorithms · Programiz DSA

<!-- Speaker note: The historical references — Euler, Moore, Hopcroft and Tarjan — are what today's "short history" slides drew on. -->
