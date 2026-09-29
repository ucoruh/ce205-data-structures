---
marp: true
theme: cen207
paginate: true
lang: en
title: "CEN207 Week 9 — Graph Algorithms"
author: "Asst. Prof. Dr. Uğur CORUH"
header: "CEN207 Data Structures · Week 9"
footer: "RTEU Computer Engineering · Fall 2026–2027"
---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Week 9
## Graph Algorithms

Order · Weights · Cycles · Backtracking

<!-- Speaker note: Welcome back after the midterm week. This week extends every Week 5 graph tool with order, weight, and cycle awareness, and closes with backtracking. -->

---

# Today's map

- Order: topological sort (2 ways), cycle detection
- Track groups: union-find
- Cheapest connections: Kruskal, Prim (MST)
- Cheapest paths: Dijkstra, Bellman-Ford, Floyd-Warshall
- Reachability: strongly connected components, bipartite
- Beyond paths: max flow, backtracking

<!-- Speaker note: Eleven algorithms, ten sections — some sections pair two algorithms that solve the same problem two ways. -->

---

# Before we start: what you know

- Week 5: adjacency list, alphabetical neighbours
- BFS: queue, fewest edges
- DFS: recursion or explicit stack
- Connected components: BFS/DFS from every unvisited vertex

<!-- Speaker note: Every algorithm this week extends BFS or DFS with one or two extra arrays. Nothing here replaces Week 5 — it builds on it directly. -->

---

# The one new ingredient: weights

- 6 of today's algorithms attach a **number** to every edge
- A distance, a cost, a capacity
- The question changes from "reachable?" to **"cheapest?"**

<!-- Speaker note: Kruskal, Prim, Dijkstra, Bellman-Ford, Floyd-Warshall, Edmonds-Karp all need weights. The other five stay unweighted. -->

---

# What this week reuses from Week 5

| Week 5 tool | Reused by |
| --- | --- |
| Adjacency list, alphabetical order | Every algorithm this week |
| BFS queue | Bipartite check, max-flow's augmenting path |
| DFS recursion | Topo-sort, cycle detection, SCC, backtracking |
| Circle layout | Every animation's graph drawing |

<!-- Speaker note: Nothing about the graph representation changes -- only what we compute over it. -->

---

<!-- _class: bolum -->
# 1. Topological Sort

---

# A question to start

Socks before shoes. Shirt before jacket.
No order between socks and shirt.

**Is there always one order obeying every rule?**

<!-- Speaker note: This is exactly the build-system / package-manager dependency problem. -->

---

# A short history

- **A. B. Kahn**, 1962 — in-degree + queue
- Build systems, package installers use this daily
- The DFS-based alternative falls out of **Tarjan**'s 1970s DFS framework

<!-- Speaker note: Kahn's paper is literally titled "Topological sorting of large networks". -->

---

# Kahn's idea

- A vertex with **in-degree 0** has no unmet prerequisite
- Place it now; this removes its outgoing edges
- Every neighbour's in-degree drops by one
- Newly-zero neighbours become eligible — enqueue them

<!-- Speaker note: The queue holds every vertex currently eligible to be placed, all at once. -->

---

# Kahn's code (C) — part 1/2

```c
int topo_sort_kahn(Graph *g) {
    for (int i=0;i<g->vertex_count;i++) indeg[i]=0;
    for (int u=0;u<g->vertex_count;u++)
        for (AdjNode *n=g->adj[u]; n; n=n->next)
            indeg[n->to]++;
    front=rear=0; order_len=0;
    for (int v=0;v<g->vertex_count;v++)
        if (indeg[v]==0) enqueue(v);
```

<!-- Speaker note: Count in-degrees, then seed the queue with every vertex that already has in-degree 0. -->

---

# Kahn's code (C) — part 2/2

```c
    while (front<rear) {
        int u=dequeue();
        order[order_len++]=u;
        for (AdjNode *n=g->adj[u]; n; n=n->next) {
            indeg[n->to]--;
            if (indeg[n->to]==0) enqueue(n->to);
        }
    }
    return order_len==g->vertex_count;
}
```

<!-- Speaker note: Relax every dequeued vertex's neighbours, enqueueing any that newly reach in-degree 0. -->

---

# Kahn's code (Java) — part 1/2

```java
static boolean topoSortKahn(Graph g) {
    for (int i=0;i<g.vertexCount;i++) indeg[i]=0;
    for (int u=0;u<g.vertexCount;u++)
        for (AdjNode n=g.adj[u]; n!=null; n=n.next)
            indeg[n.to]++;
    front=rear=0; orderLen=0;
    for (int v=0;v<g.vertexCount;v++)
        if (indeg[v]==0) enqueue(v);
```

<!-- Speaker note: Identical shape to the C version so far. -->

---

# Kahn's code (Java) — part 2/2

```java
    while (front<rear) {
        int u=dequeue();
        order[orderLen]=u; orderLen++;
        for (AdjNode n=g.adj[u]; n!=null; n=n.next) {
            indeg[n.to]--;
            if (indeg[n.to]==0) enqueue(n.to);
        }
    }
    return orderLen==g.vertexCount;
}
```

<!-- Speaker note: Same shape as the C version, line for line -- that parity is why the code panel's line numbers stay meaningful in both languages. -->

---

# Kahn's algorithm

<iframe class="dsanim" src="anim/topological-sort-kahn.html?yer=slayt&lang=en" title="Topological sort: Kahn's algorithm"></iframe>

<!-- Speaker note: Watch the queue and the order row fill together. Try the cycle edge case next. -->

---

# Edge case: a cycle

<iframe class="dsanim" src="anim/topological-sort-kahn.html?yer=slayt&lang=en&example=cycle" title="Topological sort: a cycle blocks the order"></iframe>

<!-- Speaker note: The queue empties early — the leftover vertices are locked in a cycle with each other. -->

---

# Real output: Kahn's algorithm

```text
-- normal: 8 vertices, 10 edges, a valid DAG --
order: A B C D F E G H
all 8 vertices placed: a valid topological order

-- edge: 10 edges but a cycle exists, no full order --
order:
only 0 of 7 vertices placed -- a cycle exists
```

<!-- Speaker note: Real captured output from the compiled C program, byte-identical to the Java program's output. -->

---

# The DFS idea

- Run recursive DFS (Week 5's DFS, one array added)
- Record every vertex's **finish time**
- Read finish times **largest to smallest**
- A vertex finishes only after everything it points to

<!-- Speaker note: A back edge to a still-open (grey) vertex means a cycle — caught for free. -->

---

# DFS topo-sort code (C) — dfs_visit

```c
void dfs_visit(int u) {
    color_of[u]=1;
    for (AdjNode *n=cur_g->adj[u]; n; n=n->next) {
        if (color_of[n->to]==0) dfs_visit(n->to);
        else if (color_of[n->to]==1) has_cycle=1;
    }
    color_of[u]=2;
    finish[finish_len++]=u;
}
```

<!-- Speaker note: The finish[] array fills bottom-up; the caller reads it back to front for the topological order. -->

---

# DFS topo-sort code (C) — the driver

```c
void topo_sort_dfs(Graph *g) {
    cur_g=g;
    for (int i=0;i<g->vertex_count;i++) color_of[i]=0;
    finish_len=0; has_cycle=0;
    for (int v=0;v<g->vertex_count;v++)
        if (color_of[v]==0) dfs_visit(v);
}
```

<!-- Speaker note: One dfs_visit call per unvisited vertex -- this is what covers a disconnected DAG. -->

---

# DFS topo-sort code (Java) — dfsVisit

```java
static void dfsVisit(int u) {
    colorOf[u]=1;
    for (AdjNode n=curG.adj[u]; n!=null; n=n.next) {
        if (colorOf[n.to]==0) dfsVisit(n.to);
        else if (colorOf[n.to]==1) hasCycle=true;
    }
    colorOf[u]=2;
    finish[finishLen]=u; finishLen++;
}
```

<!-- Speaker note: hasCycle is set the moment a back edge is seen, but the loop keeps going to finish every vertex. -->

---

# DFS topo-sort code (Java) — the driver

```java
static void topoSortDfs(Graph g) {
    curG=g;
    for (int i=0;i<g.vertexCount;i++) colorOf[i]=0;
    finishLen=0; hasCycle=false;
    for (int v=0;v<g.vertexCount;v++)
        if (colorOf[v]==0) dfsVisit(v);
}
```

<!-- Speaker note: Same shape as the C driver, line for line. -->

---

# DFS topological sort

<iframe class="dsanim" src="anim/topological-sort-dfs.html?yer=slayt&lang=en" title="Topological sort: DFS finish order"></iframe>

<!-- Speaker note: Same graph as Kahn's — compare the two valid orders. -->

---

# Complexity & mistake

- **O(V + E)** — both algorithms, one pass
- Mistake: a topological order is **not unique**
- Compare **positions**, never hard-code the exact sequence

<!-- Speaker note: Two correct algorithms on the same DAG can (and do) disagree on the exact order. -->

---

# Mini question

Why does Kahn's algorithm use a **queue**, not just one recursive call?

*(answer on the next slide)*

<!-- Speaker note: Give the audience 20 seconds. -->

---

# Answer

A DAG can have **several independent sources** at once.

The queue lets the algorithm interleave them in one pass, instead of finishing one branch before starting another.

<!-- Speaker note: This is also why more than one valid order usually exists. -->

---

<!-- _class: bolum -->
# 2. Cycle Detection (Directed)

---

# A question to start

Section 1's DFS detects **that** a cycle exists (a back edge).

**Which vertices** form it, in what order?

<!-- Speaker note: Kahn's algorithm can't answer this at all — only "some vertices never reach 0". -->

---

# 3-colour DFS with a path

- White / **gray** (on the path) / black (finished)
- Keep the current path in `on_path[]`
- A back edge to a **gray** vertex: that vertex is an open ancestor
- The path slice from there to here **IS** the cycle

<!-- Speaker note: We can read the cycle directly off the path array. -->

---

# Cycle detection code (C) — part 1/2

```c
int dfs_cycle(int u) {
    color_of[u]=1;
    on_path[path_top++]=u;
    for (AdjNode *n=cur_g->adj[u]; n; n=n->next) {
        if (color_of[n->to]==0) {
            if (dfs_cycle(n->to)) return 1;
        } else if (color_of[n->to]==1) {
```

<!-- Speaker note: A white neighbour recurses; a grey neighbour is an ancestor -- the cycle-found branch continues next slide. -->

---

# Cycle detection code (C) — part 2/2

```c
            int i=path_top-1;
            while (on_path[i]!=n->to) i--;
            cycle_len=0;
            for (; i<path_top; i++)
                cycle[cycle_len++]=on_path[i];
            return 1;
        }
    }
    path_top--; color_of[u]=2;
    return 0;
}
```

<!-- Speaker note: The extraction loop walks back from the top of the path to the grey ancestor. -->

---

# Cycle detection code (Java) — part 1/2

```java
static boolean dfsCycle(int u) {
    colorOf[u]=1;
    onPath[pathTop]=u; pathTop++;
    for (AdjNode n=curG.adj[u]; n!=null; n=n.next) {
        if (colorOf[n.to]==0) {
            if (dfsCycle(n.to)) return true;
        } else if (colorOf[n.to]==1) {
```

<!-- Speaker note: Same shape as the C version so far. -->

---

# Cycle detection code (Java) — part 2/2

```java
            int i=pathTop-1;
            while (onPath[i]!=n.to) i--;
            cycleLen=0;
            for (; i<pathTop; i++) {
                cycle[cycleLen]=onPath[i]; cycleLen++;
            }
            return true;
        }
    }
    pathTop--; colorOf[u]=2;
    return false;
}
```

<!-- Speaker note: onPath[] is a plain array used as a stack -- push on entry, pop on the way back out. -->

---

# Cycle detection, directed graph

<iframe class="dsanim" src="anim/cycle-detection-directed.html?yer=slayt&lang=en" title="Cycle detection in a directed graph"></iframe>

<!-- Speaker note: Watch the cycle vertices turn red and get boxed below the graph. -->

---

# Edge case: no cycle at all

<iframe class="dsanim" src="anim/cycle-detection-directed.html?yer=slayt&lang=en&example=acyclic" title="Cycle detection: an acyclic graph"></iframe>

<!-- Speaker note: Every vertex turns black, no back edge is ever found. -->

---

# Real output: cycle detection

```text
-- normal: 8 vertices, 10 edges, one cycle: C-D-F-C --
cycle found: D F C -> D

-- edge: 10 edges, entirely cycle-free (a DAG) --
no cycle found

-- edge: the smallest cycle, A-B-A (2 edges) --
cycle found: A B -> A
```

<!-- Speaker note: A 2-vertex cycle is the smallest possible directed cycle -- a single edge can never be one. -->

---

# Complexity & mistake

- **O(V + E)** — one DFS, plus O(V) to extract a found cycle
- Mistake: checking "not white" instead of "**gray**"
- A black neighbour is finished and safe — not a cycle

<!-- Speaker note: This is the same trap as Section 1's forward/cross edges. -->

---

# Mini question

Section 1's DFS topo-sort just sets `has_cycle = 1`. Why does THIS algorithm need the extra `on_path[]` stack at all?

*(answer on the next slide)*

---

# Answer

Knowing a cycle exists is not the same as knowing **which vertices** form it.

`on_path[]` keeps the current root-to-here chain available, so the moment a back edge is found, the cycle can be read straight off it.

<!-- Speaker note: This trade-off — a bit more bookkeeping for a lot more information — recurs all week. -->

---

<!-- _class: bolum -->
# 3. Union-Find

---

# A question to start

Kruskal's algorithm (coming up) must ask, over and over:

**"Are these two vertices already connected by edges I picked?"**

A fresh BFS every time would be correct — but slow.

<!-- Speaker note: We need a structure built specifically for "same group?" queries. -->

---

# A forest of parent pointers

- `find(v)` walks parent pointers up to the **root**
- Same root = same group
- `union(a, b)` merges two groups: root points to root

<!-- Speaker note: Each group is a tiny tree; the root IS the group's identity. -->

---

# Two tricks

- **Union by rank**: shorter tree hangs under the taller
- **Path compression**: `find` re-points every visited node straight at the root
- Together: **O(α(n))** per operation — for all practical `n`, this is O(1)

<!-- Speaker note: α is the inverse Ackermann function — under 5 for any n you could ever build. -->

---

# Union-find code (C) — find

```c
int find(int v) {
    int root=v;
    while (parent_of[root]!=root) root=parent_of[root];
    while (parent_of[v]!=root) {
        int next=parent_of[v];
        parent_of[v]=root;
        v=next;
    }
    return root;
}
```

<!-- Speaker note: The second while loop is the path compression step -- it re-points every visited node at the root. -->

---

# Union-find code (C) — union_sets

```c
void union_sets(int a, int b) {
    int ra=find(a), rb=find(b);
    if (ra==rb) return;
    if (rank_of[ra]<rank_of[rb]) parent_of[ra]=rb;
    else if (rank_of[ra]>rank_of[rb]) parent_of[rb]=ra;
    else { parent_of[rb]=ra; rank_of[ra]++; }
}
```

<!-- Speaker note: Merging by ROOT, never by the raw a/b arguments, is the one rule that must never be broken here. -->

---

# Union-find code (Java) — find

```java
static int find(int v) {
    int root=v;
    while (parentOf[root]!=root) root=parentOf[root];
    while (parentOf[v]!=root) {
        int next=parentOf[v];
        parentOf[v]=root;
        v=next;
    }
    return root;
}
```

<!-- Speaker note: Identical shape to the C version -- union-find translates almost line for line between languages. -->

---

# Union-find code (Java) — unionSets

```java
static void unionSets(int a, int b) {
    int ra=find(a), rb=find(b);
    if (ra==rb) return;
    if (rankOf[ra]<rankOf[rb]) parentOf[ra]=rb;
    else if (rankOf[ra]>rankOf[rb]) parentOf[rb]=ra;
    else { parentOf[rb]=ra; rankOf[ra]++; }
}
```

<!-- Speaker note: Same rank-comparison ladder as the C version. -->

---

# Real output: union-find

```text
union(A, B): merged, new root = A
union(C, D): merged, new root = C
union(A, C): merged, new root = A
find(D) = A
union(B, H): already the same set (A)
final sets: A->A B->A C->A D->A E->A F->A G->A H->A
```

<!-- Speaker note: "already the same set" is not an error -- union() on an already-merged pair is always safe, a no-op. -->

---

# Union-find: rank + path compression

<iframe class="dsanim" src="anim/union-find.html?yer=slayt&lang=en" title="Union-find: union by rank + path compression"></iframe>

<!-- Speaker note: Watch a genuine depth-2 chain flatten to depth 1 in one find() call. -->

---

# Complexity & mistake

- **~O(1) amortised** per operation, with both tricks
- Mistake: `union(a, b)` comparing `a`, `b` directly
- Must merge **roots** — `find(a)`, `find(b)` — never raw arguments

<!-- Speaker note: Merging raw arguments can create a node with two parents. -->

---

# Mini question

Rank counts **height**, not the number of elements in a set. Why not just track set size instead?

*(answer on the next slide)*

---

# Answer

Size works too, and is a common alternative — "union by size" hangs the smaller **set** under the larger one.

Both give the same O(α(n)) guarantee; rank is the classical presentation because it directly bounds tree height, which is what `find` actually pays for.

<!-- Speaker note: Some textbooks use "union by size" exclusively — both are correct, this course picks rank for the height argument. -->

---

<!-- _class: bolum -->
# 4. Minimum Spanning Trees

---

# A question to start

Connect `n` towns with power lines. Any pair could link directly, at a cost.

**What is the cheapest set of lines that still connects everything?**

<!-- Speaker note: Not every pair needs a direct line — just everyone reachable from everyone. -->

---

# A short history

- **Joseph Kruskal**, 1956
- **Robert Prim**, 1957 (rediscovering Jarník, 1930)
- Same problem, two structurally different greedy solutions
- Both provably safe: the **cut property**

<!-- Speaker note: The cheapest edge crossing any partition of the vertices must belong to some MST. -->

---

# Kruskal's idea

- Sort **all** edges by weight, once
- Scan cheapest-first; add an edge unless it **closes a cycle**
- Cycle check: union-find, near O(1)
- Disconnected graph → a spanning **forest**

<!-- Speaker note: Kruskal doesn't care where the tree "is" — it just avoids cycles globally. -->

---

# Prim's idea

- Grow **one** tree from a start vertex
- Add the cheapest edge from **inside** to **outside**
- `key[v]` = cheapest edge connecting v to the tree so far
- Never reaches a different component: key stays "infinite"

<!-- Speaker note: This is the same "priority queue as a row" idea we'll reuse for Dijkstra. -->

---

# Kruskal's code (C) — part 1/2

```c
int kruskal_mst(Edge *sorted, int edge_count,
                 Edge *mst_out, int *total_out) {
    for (int v=0;v<vertex_count;v++)
        { parent_of[v]=v; rank_of[v]=0; }
    qsort(sorted, edge_count, sizeof(Edge), cmp_weight);
    int mst_len=0, total=0;
```

<!-- Speaker note: A fresh union-find, then one global sort by weight -- exactly as described a slide ago. -->

---

# Kruskal's code (C) — part 2/2

```c
    for (int i=0;i<edge_count;i++) {
        if (find(sorted[i].a)==find(sorted[i].b))
            continue;
        union_sets(sorted[i].a, sorted[i].b);
        mst_out[mst_len++]=sorted[i];
        total+=sorted[i].w;
    }
    *total_out=total;
    return mst_len;
}
```

<!-- Speaker note: find and union_sets are exactly Section 3's union-find, unchanged. -->

---

# Kruskal's code (Java) — part 1/2

```java
static int kruskalMst(Edge[] sorted,
                       Edge[] mstOut, int[] totalOut) {
    for (int v=0;v<vertexCount;v++)
        { parentOf[v]=v; rankOf[v]=0; }
    Arrays.sort(sorted, Comparator.comparingInt(
        (Edge e) -> e.w).thenComparingInt(e -> e.idx));
    int mstLen=0, total=0;
```

<!-- Speaker note: Java's Comparator chain replaces C's qsort + comparator function -- same tie-break, different syntax. -->

---

# Kruskal's code (Java) — part 2/2

```java
    for (Edge e : sorted) {
        if (find(e.a)==find(e.b)) continue;
        unionSets(e.a, e.b);
        mstOut[mstLen]=e; mstLen++;
        total+=e.w;
    }
    totalOut[0]=total;
    return mstLen;
}
```

<!-- Speaker note: Same loop shape as the C version's second half. -->

---

# Kruskal's MST

<iframe class="dsanim" src="anim/kruskal-mst.html?yer=slayt&lang=en" title="Kruskal's minimum spanning tree"></iframe>

<!-- Speaker note: The sorted-edges row and the parent[] row grow together. -->

---

# Edge case: a spanning forest

<iframe class="dsanim" src="anim/kruskal-mst.html?yer=slayt&lang=en&example=disconnected" title="Kruskal: a disconnected graph"></iframe>

<!-- Speaker note: Two components in, two trees out — no error, just a forest. -->

---

# Real output: Kruskal's MST

```text
-- normal: 7 vertices, 10 edges, one component --
MST edges: B-C:1 A-C:2 D-E:2 E-F:3 B-D:5 E-G:7
total weight = 20
components = 1

-- edge: 10 edges, 2 components -- a spanning FOREST --
MST edges: C-D:1 A-B:2 F-G:2 D-E:3 H-I:3 B-C:4 I-J:4 G-H:6
total weight = 25
components = 2 (a spanning forest)
```

<!-- Speaker note: Two components in, two separate trees out, added together into one edge list. -->

---

# Prim's code (C) — part 1/2

```c
int prim_mst(Graph *g, int start,
             Edge *mst_out, int *total_out) {
    for (int v=0;v<g->vertex_count;v++)
        { key_of[v]=INF; in_mst[v]=0; parent_of[v]=-1; }
    key_of[start]=0;
    int mst_len=0, total=0;
    for (int count=0;count<g->vertex_count;count++) {
        int u=min_key_vertex(g->vertex_count);
        if (u==-1 || key_of[u]==INF) break;
        in_mst[u]=1;
```

<!-- Speaker note: key_of[] IS the priority-queue row shown below the graph in the animation. -->

---

# Prim's code (C) — part 2/2

```c
        if (parent_of[u]!=-1) {
            mst_out[mst_len].a=parent_of[u];
            mst_out[mst_len].b=u;
            mst_out[mst_len].w=key_of[u];
            mst_len++; total+=key_of[u];
        }
        for (AdjNode *n=g->adj[u]; n; n=n->next)
            if (!in_mst[n->to] && n->weight<key_of[n->to])
                { key_of[n->to]=n->weight;
                  parent_of[n->to]=u; }
    }
    *total_out=total;
    return mst_len;
}
```

<!-- Speaker note: Record the edge that just brought u into the tree, then relax u's neighbours. -->

---

# Prim's code (Java) — part 1/2

```java
static int primMst(Graph g, int start,
                    Edge[] mstOut, int[] totalOut) {
    for (int v=0;v<g.vertexCount;v++)
        { keyOf[v]=INF; inMst[v]=false; parentOf[v]=-1; }
    keyOf[start]=0;
    int mstLen=0, total=0;
    for (int count=0;count<g.vertexCount;count++) {
        int u=minKeyVertex(g.vertexCount);
        if (u==-1 || keyOf[u]==INF) break;
        inMst[u]=true;
```

<!-- Speaker note: Same shape as the C version so far. -->

---

# Prim's code (Java) — part 2/2

```java
        if (parentOf[u]!=-1) {
            mstOut[mstLen]=new Edge();
            mstOut[mstLen].a=parentOf[u];
            mstOut[mstLen].b=u;
            mstOut[mstLen].w=keyOf[u];
            mstLen++; total+=keyOf[u];
        }
        for (AdjNode n=g.adj[u]; n!=null; n=n.next)
            if (!inMst[n.to] && n.weight<keyOf[n.to])
                { keyOf[n.to]=n.weight; parentOf[n.to]=u; }
    }
    totalOut[0]=total;
    return mstLen;
}
```

<!-- Speaker note: Java allocates a new Edge object per MST edge; C fills a pre-allocated array slot -- the only real difference. -->

---

# Prim's MST

<iframe class="dsanim" src="anim/prim-mst.html?yer=slayt&lang=en" title="Prim's minimum spanning tree"></iframe>

<!-- Speaker note: Same "normal" graph as Kruskal's — compare the two MSTs: same total weight. -->

---

# Real output: Prim's MST

```text
-- normal: 7 vertices, 10 edges, starts at A --
MST edges: A-C:2 C-B:1 B-D:5 D-E:2 E-F:3 E-G:7
total weight = 20

-- edge: 2 components, starts at A -- F..J never reached --
MST edges: A-B:2 B-C:4 C-D:1 D-E:3
total weight = 10
unreached: F G H I J
```

<!-- Speaker note: total weight = 20, matching Kruskal's on the same normal graph -- a nice cross-check to show live. -->

---

# Complexity table

| Algorithm | Time | Note |
| --- | --- | --- |
| Kruskal | O(E log E) | sort dominates |
| Prim (array) | O(V^2) | matches Dijkstra's shape |
| Prim (heap) | O(E log V) | better on dense graphs |

<!-- Speaker note: We use the array version so the priority queue is a visible, simple row. -->

---

# Mini question

Could Prim ever pick a **more expensive** edge than Kruskal, on the same graph?

*(answer: no — see next slide)*

---

# Answer

**No.** Both are provably optimal (cut property).

Every MST of a graph has the same **total** weight — they can differ only in *which* edges they pick, when weights tie.

<!-- Speaker note: Total weight is invariant; the specific edge set is not, under ties. -->

---

<!-- _class: bolum -->
# 5. Single-Source Shortest Paths

---

# A question to start

A road network, weighted by distance. Starting from one city,

**what is the cheapest way to reach every other city?**

<!-- Speaker note: Not "fewest edges" (Week 5's BFS) — cheapest total weight. -->

---

# A short history

- **Edsger Dijkstra**, 1956 (published 1959)
- A 20-minute exercise to demo a new computer
- Still the standard answer when every weight is **non-negative**

<!-- Speaker note: Dijkstra later said he designed it without pencil and paper, on a terrace in Amsterdam. -->

---

# Dijkstra's idea

- `dist[v]` = cheapest **total path** found so far
- Pick the not-yet-finished vertex with smallest `dist`
- Once picked: **final**, can never shrink again
- Only true because no edge weight is negative

<!-- Speaker note: Prim's algorithm with one change: "cheapest edge in" becomes "cheapest path so far". -->

---

# Why negative weights break it

A vertex popped "final" early could later be beaten by a path through a very negative edge — discovered **after** it was already finalised.

<!-- Speaker note: This is exactly why Dijkstra refuses negative input in our program. -->

---

# Dijkstra's code (C) — part 1/2

```c
void dijkstra(Graph *g, int start) {
    for (int v=0;v<g->vertex_count;v++)
        { dist_of[v]=INF; done[v]=0; parent_of[v]=-1; }
    dist_of[start]=0;
    for (int count=0;count<g->vertex_count;count++) {
        int u=min_dist_vertex(g->vertex_count);
        if (u==-1 || dist_of[u]==INF) break;
        done[u]=1;
```

<!-- Speaker note: min_dist_vertex is the "priority queue" step, shown as a row in the animation. -->

---

# Dijkstra's code (C) — part 2/2

```c
        for (AdjNode *n=g->adj[u]; n; n=n->next) {
            int cand=dist_of[u]+n->weight;
            if (!done[n->to] && cand<dist_of[n->to])
                { dist_of[n->to]=cand; parent_of[n->to]=u; }
        }
    }
}
```

<!-- Speaker note: Relax every not-yet-done neighbour of the just-finalised vertex u. -->

---

# Dijkstra's code (Java) — part 1/2

```java
static void dijkstra(Graph g, int start) {
    for (int v=0;v<g.vertexCount;v++)
        { distOf[v]=INF; done[v]=false; parentOf[v]=-1; }
    distOf[start]=0;
    for (int count=0;count<g.vertexCount;count++) {
        int u=minDistVertex(g.vertexCount);
        if (u==-1 || distOf[u]==INF) break;
        done[u]=true;
```

<!-- Speaker note: Same shape as the C version so far. -->

---

# Dijkstra's code (Java) — part 2/2

```java
        for (AdjNode n=g.adj[u]; n!=null; n=n.next) {
            int cand=distOf[u]+n.weight;
            if (!done[n.to] && cand<distOf[n.to])
                { distOf[n.to]=cand; parentOf[n.to]=u; }
        }
    }
}
```

<!-- Speaker note: minDistVertex is a small linear scan -- the Java and C versions are effectively identical. -->

---

# Dijkstra's shortest path

<iframe class="dsanim" src="anim/dijkstra.html?yer=slayt&lang=en" title="Dijkstra's shortest path"></iframe>

<!-- Speaker note: The priority queue row is a plain sorted array, not a heap. -->

---

# Real output: Dijkstra

```text
-- normal: 8 vertices, 10 edges, starts at A --
distances: A=0 B=3 C=2 D=8 E=10 F=13 G=17

-- edge: F..J never reachable via the directed edges --
distances: A=0 B=2 C=5 D=6 E=9 F=inf G=inf H=inf I=inf J=inf
```

<!-- Speaker note: "inf" prints exactly when a vertex was never reached -- the program's own sentinel, not a crash. -->

---

# Bellman-Ford: negative weights OK

- **Bellman** & **Ford**, late 1950s
- Give up "pop the minimum" entirely
- Relax **every** edge, fixed order, up to `V - 1` rounds
- A `V`-th round that still improves = a **negative cycle**

<!-- Speaker note: V-1 rounds are exactly enough for the longest possible shortest path to propagate. -->

---

# Bellman-Ford's code (C) — part 1/2

```c
int bellman_ford(Graph *g, int start) {
    for (int v=0;v<g->vertex_count;v++)
        { dist_of[v]=INF; parent_of[v]=-1; }
    dist_of[start]=0;
    for (int p=1;p<=g->vertex_count-1;p++) {
        int changed=0;
        for (int u=0;u<g->vertex_count;u++) {
            if (dist_of[u]==INF) continue;
```

<!-- Speaker note: Up to V-1 rounds, skipping any vertex not yet reached at all. -->

---

# Bellman-Ford's code (C) — part 2/2

```c
            for (AdjNode *n=g->adj[u]; n; n=n->next) {
                int cand=dist_of[u]+n->weight;
                if (cand<dist_of[n->to])
                    { dist_of[n->to]=cand;
                      parent_of[n->to]=u; changed=1; }
            }
        }
        if (!changed) break;
    }
    /* one more pass detects a negative cycle */
}
```

<!-- Speaker note: The early-exit "if (!changed) break" is a common, correct optimisation. -->

---

# Bellman-Ford's code (Java) — part 1/2

```java
static boolean bellmanFord(Graph g, int start) {
    for (int v=0;v<g.vertexCount;v++)
        { distOf[v]=INF; parentOf[v]=-1; }
    distOf[start]=0;
    for (int pass=1;pass<=g.vertexCount-1;pass++) {
        boolean changed=false;
        for (int u=0;u<g.vertexCount;u++) {
            if (distOf[u]==INF) continue;
```

<!-- Speaker note: Same shape as the C version so far. -->

---

# Bellman-Ford's code (Java) — part 2/2

```java
            for (AdjNode n=g.adj[u]; n!=null; n=n.next) {
                int cand=distOf[u]+n.weight;
                if (cand<distOf[n.to])
                    { distOf[n.to]=cand;
                      parentOf[n.to]=u; changed=true; }
            }
        }
        if (!changed) break;
    }
    /* one more pass detects a negative cycle */
}
```

<!-- Speaker note: boolean replaces C's int flag -- otherwise line-for-line identical. -->

---

# Bellman-Ford shortest path

<iframe class="dsanim" src="anim/bellman-ford.html?yer=slayt&lang=en" title="Bellman-Ford shortest path"></iframe>

<!-- Speaker note: Watch the round counter and the detection round at the end. -->

---

# Required edge case: negative cycle

<iframe class="dsanim" src="anim/bellman-ford.html?yer=slayt&lang=en&example=negative-cycle" title="Bellman-Ford: a negative cycle"></iframe>

<!-- Speaker note: A-B-C-A sums to -1. The detection round finds a still-relaxable edge. -->

---

# Real output: Bellman-Ford

```text
-- normal: 7 vertices, all positive, starts at A --
distances: A=0 B=3 C=2 D=8 E=10 F=13 G=17
no negative cycle

-- edge: A-B-C-A is a negative cycle (total -1) --
distances: A=-4 B=-2 C=0 D=0 E=1
negative cycle detected
```

<!-- Speaker note: Same starting graph shape as Dijkstra's -- compare the two "distances:" lines side by side. -->

---

# Complexity table

| Algorithm | Time | Handles negatives? |
| --- | --- | --- |
| Dijkstra | O(V^2) | No |
| Bellman-Ford | O(V*E) | Yes |

<!-- Speaker note: Bellman-Ford's price for tolerating negatives is a much slower worst case. -->

---

# Mini question

Why exactly `V - 1` rounds for Bellman-Ford, not `V` or `V/2`?

*(answer on the next slide)*

---

# Answer

A shortest path (no negative cycle) never repeats a vertex — at most `V - 1` edges.

Each round extends every path's "confirmed" prefix by one edge. `V - 1` rounds confirm the longest possible shortest path.

<!-- Speaker note: Repeating a vertex means looping through non-negative extra weight — never an improvement. -->

---

<!-- _class: bolum -->
# 6. All-Pairs Shortest Paths

---

# A question to start

A flight-booking system needs the cheapest fare between **every pair** of ~20 cities, at once.

Running Dijkstra 20 times works — is there a way to **share** the work?

<!-- Speaker note: 20 * O(V^2) vs. one shared O(V^3) computation. -->

---

# A short history

- **Robert Floyd** & **Stephen Warshall**, both 1962
- Independent, closely related matrix algorithms
- Combined algorithm carries both names

<!-- Speaker note: Warshall's was for reachability; Floyd's for shortest distances. -->

---

# The idea

- An `N x N` matrix `dist[i][j]`
- For **every** vertex `k`: is `i -> k -> j` shorter than `dist[i][j]`?
- Try every vertex as an intermediate stop
- Update **in place** — safe, since `dist[i][k]`/`dist[k][j]` never change mid-pass

<!-- Speaker note: This in-place safety is a rare, pleasant simplification. -->

---

# Floyd-Warshall's code (C)

```c
void floyd_warshall(int vertex_cnt) {
    for (int k=0;k<vertex_cnt;k++) {
        for (int i=0;i<vertex_cnt;i++) {
            for (int j=0;j<vertex_cnt;j++) {
                if (dist[i][k]==INF || dist[k][j]==INF)
                    continue;
                int through=dist[i][k]+dist[k][j];
                if (through<dist[i][j])
                    dist[i][j]=through;
            }
        }
    }
}
```

<!-- Speaker note: k must be the OUTERMOST loop — that's the whole correctness argument. -->

---

# Floyd-Warshall's code (Java)

```java
static void floydWarshall(int vertexCnt) {
    for (int k=0;k<vertexCnt;k++) {
        for (int i=0;i<vertexCnt;i++) {
            for (int j=0;j<vertexCnt;j++) {
                if (dist[i][k]==INF || dist[k][j]==INF)
                    continue;
                int through=dist[i][k]+dist[k][j];
                if (through<dist[i][j])
                    dist[i][j]=through;
            }
        }
    }
}
```

<!-- Speaker note: dist is a Java 2-D array here, vs. C's dist[i][k] on a fixed-size static array -- same access pattern. -->

---

# Floyd-Warshall: the matrix fills in

<iframe class="dsanim" src="anim/floyd-warshall.html?yer=slayt&lang=en" title="Floyd-Warshall all-pairs shortest paths"></iframe>

<!-- Speaker note: One step per intermediate vertex k — not per (i,j) pair, or this would be far too many steps. -->

---

# Real output: Floyd-Warshall

```text
-- normal: 5 vertices, negative edges but no negative cycle --
      A   B   C   E   D
  A   0   1  -3  -4   2
  B   3   0  -4  -2   1
  C   7   4   0   2   5
no negative cycle

-- edge: A-B-C-A is a negative cycle --
negative cycle at: A B C
```

<!-- Speaker note: A negative diagonal entry (dist[A][A] < 0) is exactly what flags a negative cycle through that vertex. -->

---

# Complexity & mistake

- **O(V^3)** time, **O(V^2)** space
- Practical for a few hundred vertices, not more
- Mistake: `k` as the **innermost** loop silently computes garbage
- Mistake: forgetting the `== INF` guard → integer overflow

<!-- Speaker note: INF + INF can wrap around to a large negative number without the guard. -->

---

# Mini question

Bellman-Ford finds negative cycles reachable **from one start**. Floyd-Warshall's diagonal check finds them differently — how?

*(answer on the next slide)*

---

# Answer

Any `dist[v][v]` that drops **below zero** means: a path leaves `v` and comes back cheaper than staying put.

Since Floyd-Warshall computes **every** pair, this check runs for every vertex at once — no separate start vertex needed.

<!-- Speaker note: This is a nice payoff of solving the harder, more general problem: some questions become simpler, not harder. -->

---

<!-- _class: bolum -->
# 7. Strongly Connected Components

---

# A question to start

Which groups of vertices can reach each other **and get back**, respecting edge direction?

Web pages linking in a cycle. Mutually-recursive functions.

<!-- Speaker note: Week 5's connected components ignore direction entirely — this is the directed version. -->

---

# Kosaraju's idea

- **Sergei Kosaraju**, ~1978 (credited via Micali & Vazirani, 1981)
- Phase 1: DFS, record every vertex's **finish time**
- Phase 2: DFS the **transpose** (edges reversed)
- Visit roots in **decreasing** finish-time order
- Each DFS tree in phase 2 = one SCC

<!-- Speaker note: Chosen over Tarjan's one-pass algorithm because it reuses Section 1's exact DFS + finish time. -->

---

# Kosaraju's code (C)

```c
void dfs1(int u) {            /* phase 1 */
    visited[u]=1;
    for (AdjNode *n=cur_g->adj[u]; n; n=n->next)
        if (!visited[n->to]) dfs1(n->to);
    finish[finish_len++]=u;
}

void dfs2(int u, int id) {    /* phase 2, on adjT */
    visited[u]=1; comp_of[u]=id;
    for (AdjNode *n=cur_g->adjT[u]; n; n=n->next)
        if (!visited[n->to]) dfs2(n->to, id);
}
```

<!-- Speaker note: dfs1 and dfs2 look almost identical — the only difference is adj vs adjT. -->

---

# Kosaraju's code (Java)

```java
static void dfs1(int u) {            // phase 1
    visited[u]=1;
    for (AdjNode n=curG.adj[u]; n!=null; n=n.next)
        if (visited[n.to]==0) dfs1(n.to);
    finish[finishLen]=u; finishLen++;
}

static void dfs2(int u, int id) {    // phase 2, on adjT
    visited[u]=1; compOf[u]=id;
    for (AdjNode n=curG.adjT[u]; n!=null; n=n.next)
        if (visited[n.to]==0) dfs2(n.to, id);
}
```

<!-- Speaker note: adjT is the transpose graph, built once alongside adj when the Graph is constructed. -->

---

# Strongly connected components

<iframe class="dsanim" src="anim/strongly-connected-components.html?yer=slayt&lang=en" title="Strongly connected components (Kosaraju)"></iframe>

<!-- Speaker note: Watch phase 1's finish order, then phase 2's transpose-graph DFS trees. -->

---

# Edge case: one big cycle

<iframe class="dsanim" src="anim/strongly-connected-components.html?yer=slayt&lang=en&example=one-big-scc" title="SCC: the whole graph is one component"></iframe>

<!-- Speaker note: When everything can reach everything, there is exactly one SCC. -->

---

# Real output: strongly connected components

```text
-- normal: 8 vertices, 2 cyclic components + 2 singletons --
4 components:
  A B C
  D E F
  G
  H

-- edge: everything is one big cycle --
1 component:
  A B C D E F G H
```

<!-- Speaker note: A single vertex with no cycle through it is still a valid SCC -- just a component of size one. -->

---

# Complexity & mistake

- **O(V + E)** — two full DFS passes
- Mistake: running phase 2 in the **same** order as phase 1
- Must be **reversed** — the single most common bug here

<!-- Speaker note: Forgetting to reset visited[] between the two phases is the second most common bug. -->

---

# Mini question

On a **DAG** (no cycles at all), how many strongly connected components does Kosaraju's algorithm find?

*(answer on the next slide)*

---

# Answer

Exactly **V** — one per vertex.

With no cycle anywhere, no vertex can return to itself through any path, so every component is a singleton. This is the last edge case in this week's SCC animation.

<!-- Speaker note: It's a useful sanity check: SCC count == vertex count if and only if the graph is a DAG. -->

---

<!-- _class: bolum -->
# 8. Bipartite Graphs

---

# A question to start

Schedule exams so no student has two at once. Courses sharing a student → an edge.

**Can this graph be 2-coloured** — the simplest possible timetable?

<!-- Speaker note: A much faster question than general graph colouring (Section 10). -->

---

# BFS with two colours

- Colour the start `0`; every neighbour the **opposite** colour
- A same-coloured neighbour already queued? **Conflict** — not bipartite
- One BFS per component (like Week 5's components loop)

---

# The odd-cycle equivalence

**A graph is bipartite if and only if it has no odd-length cycle.**

An even cycle alternates colours perfectly. An odd one cannot close up consistently.

<!-- Speaker note: This equivalence is provable directly from the BFS coloring argument. -->

---

# Bipartite check code (C) — part 1/2

```c
int is_bipartite(Graph *g) {
    for (int i=0;i<g->vertex_count;i++) color_of[i]=-1;
    for (int s=0;s<g->vertex_count;s++) {
        if (color_of[s]!=-1) continue;
        color_of[s]=0; front=rear=0; enqueue(s);
        while (front<rear) {
            int u=dequeue();
```

<!-- Speaker note: The outer for-s loop is what makes this correct on a disconnected graph -- reused from components. -->

---

# Bipartite check code (C) — part 2/2

```c
            for (AdjNode *n=g->adj[u]; n; n=n->next) {
                if (color_of[n->to]==-1)
                    { color_of[n->to]=1-color_of[u];
                      enqueue(n->to); }
                else if (color_of[n->to]==color_of[u])
                    return 0;
            }
        }
    }
    return 1;
}
```

<!-- Speaker note: The colour assignment happens at enqueue time, not dequeue time — deliberately. -->

---

# Bipartite check code (Java) — part 1/2

```java
static boolean isBipartite(Graph g) {
    for (int i=0;i<g.vertexCount;i++) colorOf[i]=-1;
    for (int s=0;s<g.vertexCount;s++) {
        if (colorOf[s]!=-1) continue;
        colorOf[s]=0; front=rear=0; enqueue(s);
        while (front<rear) {
            int u=dequeue();
```

<!-- Speaker note: Same shape as the C version so far. -->

---

# Bipartite check code (Java) — part 2/2

```java
            for (AdjNode n=g.adj[u]; n!=null; n=n.next) {
                if (colorOf[n.to]==-1)
                    { colorOf[n.to]=1-colorOf[u];
                      enqueue(n.to); }
                else if (colorOf[n.to]==colorOf[u])
                    return false;
            }
        }
    }
    return true;
}
```

<!-- Speaker note: The outer for-s loop is what makes this correct on a disconnected graph -- Section 3's components idea, reused. -->

---

# Bipartite graph check

<iframe class="dsanim" src="anim/bipartite-check.html?yer=slayt&lang=en" title="Bipartite graph check"></iframe>

<!-- Speaker note: Watch a conflicting edge flash red the moment BFS reaches it. -->

---

# Edge case: an odd cycle

<iframe class="dsanim" src="anim/bipartite-check.html?yer=slayt&lang=en&example=odd-cycle" title="Bipartite check: a 5-cycle is NOT bipartite"></iframe>

<!-- Speaker note: The function returns immediately — later vertices stay uncoloured, and that's expected. -->

---

# Real output: bipartite check

```text
-- normal: an even cycle plus 2 safe diagonals --
colors: A=0 B=1 C=0 D=1 E=0 F=1 G=0 H=1
bipartite

-- edge: A-B-C-D-E-A is a 5-cycle (odd) --
colors: A=0 B=1 C=0 D=-1 E=1 F=1 G=-1 H=-1
NOT bipartite
```

<!-- Speaker note: color -1 means "never reached by BFS" -- the search stopped the instant it found the conflict. -->

---

# Complexity & mistake

- **O(V + E)** — one BFS
- Mistake: not handling **disconnected** graphs
- An odd cycle isolated in a second component is invisible without a per-component loop

<!-- Speaker note: A tree is always bipartite (no cycles at all) — a useful sanity check, not a shortcut. -->

---

# Mini question

Why does a **conflict edge** ("same colour as its neighbour") always exist within one BFS layer or between two adjacent layers — never skip a layer?

*(answer on the next slide)*

---

# Answer

BFS colours strictly by **distance parity** from the source — even distance gets colour 0, odd gets colour 1.

Any edge connects vertices whose BFS distances differ by exactly 0 or 1 (never 2+, or it wouldn't be a direct edge) — so a conflict can only appear exactly there.

<!-- Speaker note: This is the same distance-parity idea that proves the odd-cycle equivalence two slides back. -->

---

<!-- _class: bolum -->
# 9. Maximum Flow

---

# A question to start

A water network: source, destination, pipes with capacities.

**What is the largest total flow the network can deliver at once?**

---

# A short history

- **Ford** & **Fulkerson**, 1956 — the general method
- **Edmonds** & **Karp**, 1972 — always use the **shortest** augmenting path
- Proved: this choice guarantees polynomial time

<!-- Speaker note: Ford-Fulkerson with an arbitrary path choice can be pathologically slow. -->

---

# The idea

- Find any **augmenting path**, s to t, with spare capacity
- Push the **bottleneck** (smallest capacity on the path)
- Pushing forward opens a **reverse** edge — a later path can "undo"
- The graph of "still usable" is the **residual graph**

<!-- Speaker note: The reverse edge is what lets Edmonds-Karp beat a naive greedy approach. -->

---

# Max-flow min-cut

Max flow **equals** the cheapest cut — the smallest total capacity separating s from t.

No augmenting path left = BFS's reachable set from s **is** that cut.

<!-- Speaker note: This is why running out of augmenting paths proves optimality, not just termination. -->

---

# Edmonds-Karp code (C) — part 1/2

```c
int edmonds_karp(int vertex_cnt, int s, int t) {
    int max_flow=0;
    while (bfs_augmenting_path(vertex_cnt, s, t)) {
        int bottleneck=INF;
        for (int v=t; v!=s; v=parent_of[v])
            if (cap_of[parent_of[v]][v]<bottleneck)
                bottleneck=cap_of[parent_of[v]][v];
```

<!-- Speaker note: First walk back along parent_of[] from t to s: find the smallest residual capacity on the path. -->

---

# Edmonds-Karp code (C) — part 2/2

```c
        for (int v=t; v!=s; v=parent_of[v]) {
            int u=parent_of[v];
            cap_of[u][v]-=bottleneck;
            cap_of[v][u]+=bottleneck;
        }
        max_flow+=bottleneck;
    }
    return max_flow;
}
```

<!-- Speaker note: Second walk: apply the bottleneck, opening a reverse residual edge as it goes. -->

---

# Edmonds-Karp code (Java) — part 1/2

```java
static int edmondsKarp(int vertexCnt, int s, int t) {
    int maxFlow=0;
    while (bfsAugmentingPath(vertexCnt, s, t)) {
        int bottleneck=INF;
        for (int v=t; v!=s; v=parentOf[v]) {
            int u=parentOf[v];
            if (capOf[u][v]<bottleneck)
                bottleneck=capOf[u][v];
        }
```

<!-- Speaker note: Same two-walk shape as the C version. -->

---

# Edmonds-Karp code (Java) — part 2/2

```java
        for (int v=t; v!=s; v=parentOf[v]) {
            int u=parentOf[v];
            capOf[u][v]-=bottleneck;
            capOf[v][u]+=bottleneck;
        }
        maxFlow+=bottleneck;
    }
    return maxFlow;
}
```

<!-- Speaker note: capOf is a plain int[][] matrix in Java, matching C's 2-D array exactly. -->

---

# Edmonds-Karp maximum flow

<iframe class="dsanim" src="anim/max-flow-edmonds-karp.html?yer=slayt&lang=en" title="Edmonds-Karp maximum flow"></iframe>

<!-- Speaker note: Every edge shows flow/capacity; the residual row lists every positive residual pair. -->

---

# Real output: Edmonds-Karp

```text
-- normal: 6 vertices, 10 edges, A to F --
max flow from A to F = 9

-- edge: A and J are in two separate components --
max flow from A to J = 0
```

<!-- Speaker note: Max flow 0 is a perfectly valid answer -- it's what "no augmenting path exists at all" looks like. -->

---

# Complexity & mistake

- **O(V * E^2)** for Edmonds-Karp specifically
- Mistake: forgetting the **reverse** edge update
- Without it: plain Ford-Fulkerson, can get stuck short of optimal

<!-- Speaker note: DFS instead of BFS is still correct but loses the polynomial-time guarantee. -->

---

# Mini question

Section 3's union-find could answer "0 flow, s and t disconnected" **instantly**. Why does this section still run a full BFS first?

*(answer on the next slide)*

---

# Answer

Union-find only knows **reachability**, not **capacity**.

Even when s and t ARE connected, the actual max flow depends on the bottleneck capacities along the way — something union-find's parent pointers never recorded.

<!-- Speaker note: A nice callback that also previews why max-flow is strictly harder than plain connectivity. -->

---

<!-- _class: bolum -->
# 10. Backtracking

---

# A question to start

Colour a map so no two neighbours share a colour, with as few colours as possible.

**No known formula.** How do you search systematically?

<!-- Speaker note: N-queens, seating charts, and Hamiltonian paths all share this shape. -->

---

# The idea: try, recurse, undo

- Extend a partial solution by one decision
- Still consistent? **Recurse** and keep extending
- Inconsistent, or every extension fails? **Undo** and try the next option

<!-- Speaker note: "Backtracking" refers specifically to the undo step. -->

---

# Why graph colouring, not Hamiltonian path?

Colouring reuses Section 8's exact `color[]` row and neighbour-conflict check.

A Hamiltonian path needs an entirely new "path so far" convention — for comparatively little extra insight.

---

# Backtracking code (C)

```c
int color_graph(int v, int k) {
    if (v==cur_g->vertex_count) return 1;
    for (int c=1;c<=k;c++) {
        if (safe(v,c)) {
            color_of[v]=c;
            if (color_graph(v+1,k)) return 1;
            color_of[v]=0;   /* backtrack */
        }
    }
    return 0;
}
```

<!-- Speaker note: Four lines carry the whole idea: try, recurse, undo, and the safety check does the pruning. -->

---

# Backtracking code (Java)

```java
static boolean colorGraph(int v, int k) {
    if (v==curG.vertexCount) return true;
    for (int c=1;c<=k;c++) {
        if (safe(v,c)) {
            colorOf[v]=c;
            if (colorGraph(v+1,k)) return true;
            colorOf[v]=0;   // backtrack
        }
    }
    return false;
}
```

<!-- Speaker note: safe(v,c) is a short neighbour scan, the same shape as Section 8's bipartite conflict check. -->

---

# Backtracking: graph colouring

<iframe class="dsanim" src="anim/backtracking-graph-coloring.html?yer=slayt&lang=en" title="Backtracking: graph colouring"></iframe>

<!-- Speaker note: A rejected colour flashes red; an undone colour clears back to empty. -->

---

# Required edge case: K4, unsolvable

<iframe class="dsanim" src="anim/backtracking-graph-coloring.html?yer=slayt&lang=en&example=impossible" title="Backtracking: K4 needs 4 colours, not 3"></iframe>

<!-- Speaker note: Every combination is tried and found unsafe — proven failure, not a lucky success. -->

---

# Real output: backtracking graph colouring

```text
-- normal: 6 vertices, 10 edges, k=3 --
colouring: A=1 B=2 C=3 D=1 E=2 F=3

-- edge: K4 is UNSOLVABLE with k=3 --
no valid colouring with k=3
```

<!-- Speaker note: "no valid colouring" only prints after every branch has been tried and undone -- a proven negative. -->

---

# Complexity & mistake

- Worst case **O(k^V)** — a last-resort technique
- `safe()` prunes huge swaths early — why it's usable at all
- Mistake: forgetting the **undo** step corrupts later branches

<!-- Speaker note: This is the whole reason backtracking works despite the exponential bound. -->

---

# Mini question

K4 needs 4 colours. How many **vertices** does the algorithm actually try to colour before reporting "unsolvable" with k=3?

*(answer on the next slide)*

---

# Answer

All of them, **every time** it backtracks past vertex 0 — but the failure is detected at vertex 3, the 4th vertex of K4, since the first 3 already used all 3 available colours between them.

`safe()` then rejects every colour for vertex 3, forcing a chain of undos all the way back to the start.

<!-- Speaker note: Worth tracing live on the animation slide if time allows — watching the full backtrack chain is the point of this algorithm. -->

---

# How each program was checked

- Every C program compiles with `-Wall -Wextra -Werror`
- Every Java program compiles with `-Xlint:all -Werror`
- C and Java output diffed **byte-identical**, same scenarios
- Every unit test file also rebuilt under **AddressSanitizer**

<!-- Speaker note: This is the run_tests.py pipeline used for every program this week, not just a few. -->

---

# One sentence per algorithm

- **Kahn / DFS topo-sort**: order respecting every "before" rule
- **Cycle detection**: which vertices, not just whether
- **Union-find**: "same group?" in near-constant time
- **Kruskal / Prim**: cheapest way to connect everything
- **Dijkstra / Bellman-Ford**: cheapest path from one start
- **Floyd-Warshall**: cheapest path between every pair at once

<!-- Speaker note: First half of the week, one line each. -->

---

# One sentence per algorithm (cont.)

- **Kosaraju SCC**: mutual reachability, directed
- **Bipartite check**: can this be split into exactly two teams?
- **Edmonds-Karp**: the largest flow a network can carry
- **Backtracking**: try, recurse, undo — for problems with no formula

<!-- Speaker note: Second half. Together, eleven algorithms, ten problems (topo-sort has two solutions). -->

---

# Summary table (1/3)

| Problem | Algorithm | Time |
| --- | --- | --- |
| Order | Kahn / DFS topo-sort | O(V+E) |
| Cycle? | 3-colour DFS | O(V+E) |
| Groups | Union-find | ~O(1) amortised |

<!-- Speaker note: This table mirrors the note's summary table exactly, split across three slides to fit. -->

---

# Summary table (2/3)

| Problem | Algorithm | Time |
| --- | --- | --- |
| Cheapest connect | Kruskal / Prim | O(E log E) / O(V^2) |
| Cheapest path | Dijkstra / Bellman-Ford | O(V^2) / O(V*E) |
| All-pairs paths | Floyd-Warshall | O(V^3) |

---

# Summary table (3/3)

| Problem | Algorithm | Time |
| --- | --- | --- |
| Mutual reach | Kosaraju SCC | O(V+E) |
| 2-team split | Bipartite check | O(V+E) |
| Max flow | Edmonds-Karp | O(V*E^2) |
| No formula | Backtracking | O(k^V) worst case |

<!-- Speaker note: Four rows here since this closes out the list -- still comfortably within the slide. -->

---

# Exercises (pick a few)

- Trace Kahn's algorithm by hand on a 5-edge DAG
- Build a graph with a negative edge but no negative cycle
- Modify SCC to flag trivial (single-vertex) components
- Prove every tree is bipartite

<!-- Speaker note: Full ten-exercise list is in this week's notes. -->

---

# Self-check: 3 quick questions

1. Why does Dijkstra fail on a negative edge?
2. What's the ONE new idea Kosaraju adds over topological-sort DFS?
3. What does a reverse residual edge let a later augmenting path do?

<!-- Speaker note: Full ten-question quiz, with answers, is in this week's notes. -->

---

# Looking ahead

**Week 10: Advanced Tree Structures**

AVL trees, red-black trees, B-trees — the self-balancing machinery that keeps `O(log n)` from collapsing to `O(n)` on unlucky insertions.

<!-- Speaker note: This week mostly worked on arrays and adjacency lists — Week 10 returns to balanced trees. -->

---

<!-- _class: baslik -->
<!-- _paginate: false -->

# Questions?

CEN207 Data Structures · Week 9 · Graph Algorithms

<!-- Speaker note: Open floor for questions before the self-check quiz. -->
