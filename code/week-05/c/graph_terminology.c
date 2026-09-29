/* Week 5 -- Graphs and Traversals
 * Graph vocabulary: vertex, edge, directed/undirected, weighted, degree,
 * in/out-degree, self-loop, parallel (multi-) edge, connected component,
 * cycle. Builds a Graph as an adjacency list (Edge structs, one linked
 * list per vertex) and reports these properties for each scenario.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAX_V   16
#define MAX_LBL 4

typedef struct Edge {
    int to;               /* index of the other endpoint */
    int weight;           /* 1 if the graph is unweighted */
    struct Edge *next;
} Edge;

typedef struct Graph {
    char label[MAX_V][MAX_LBL];
    Edge *adj[MAX_V];     /* adjacency list, one linked list per vertex */
    int vertex_count;
    int directed;         /* 0 = undirected, 1 = directed */
} Graph;

int out_degree(Graph *g, int v) {
    int d = 0;
    for (Edge *e = g->adj[v]; e != NULL; e = e->next)
        d++;              /* undirected: this already counts BOTH ends written once each -> degree */
    return d;
}

int in_degree(Graph *g, int v) {   /* directed only: how many edges point INTO v */
    int d = 0;
    for (int u = 0; u < g->vertex_count; u++)
        for (Edge *e = g->adj[u]; e != NULL; e = e->next)
            if (e->to == v) d++;
    return d;
}

/* ---- construction helpers: not part of the lecture code panel above, but
 * needed to actually build a Graph from a list of (label, label, weight)
 * edges the way the animation's input box accepts them. ---- */

typedef struct { const char *a, *b; int weight; } EdgeIn;

static int find_or_add_vertex(Graph *g, const char *lbl) {
    for (int i = 0; i < g->vertex_count; i++)
        if (strcmp(g->label[i], lbl) == 0) return i;
    strncpy(g->label[g->vertex_count], lbl, MAX_LBL - 1);
    g->label[g->vertex_count][MAX_LBL - 1] = '\0';
    g->adj[g->vertex_count] = NULL;
    return g->vertex_count++;
}

static void append(Graph *g, int v, int neighbour, int weight) {
    Edge *n = malloc(sizeof(Edge));
    n->to = neighbour;
    n->weight = weight;
    n->next = NULL;
    if (g->adj[v] == NULL) { g->adj[v] = n; return; }
    Edge *cur = g->adj[v];
    while (cur->next != NULL) cur = cur->next;
    cur->next = n;
}

static void add_edge_labelled(Graph *g, const char *a, const char *b, int weight) {
    int ia = find_or_add_vertex(g, a), ib = find_or_add_vertex(g, b);
    append(g, ia, ib, weight);
    if (!g->directed && ia != ib) append(g, ib, ia, weight);
}

static void reset_graph(Graph *g, int directed) {
    g->vertex_count = 0;
    g->directed = directed;
    for (int i = 0; i < MAX_V; i++) g->adj[i] = NULL;
}

static void free_graph(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++) {
        Edge *e = g->adj[i];
        while (e) { Edge *nx = e->next; free(e); e = nx; }
        g->adj[i] = NULL;
    }
}

/* ---- analysis: components (BFS, direction ignored) and cycle (DFS) ---- */

static int undirected_neighbours(Graph *g, int v, int out[]) {
    int n = 0;
    for (Edge *e = g->adj[v]; e; e = e->next)
        if (e->to != v) out[n++] = e->to;             /* v's own out-edges (self-loops excluded here) */
    if (g->directed)
        for (int u = 0; u < g->vertex_count; u++)
            if (u != v)
                for (Edge *e = g->adj[u]; e; e = e->next)
                    if (e->to == v) out[n++] = u;      /* edges pointing INTO v, walked backwards */
    return n;
}

static int count_components(Graph *g, int comp_of[]) {
    int queue_data[MAX_V];
    for (int i = 0; i < g->vertex_count; i++) comp_of[i] = -1;
    int next_id = 0;
    for (int s = 0; s < g->vertex_count; s++) {
        if (comp_of[s] != -1) continue;
        int front = 0, rear = 0;
        comp_of[s] = next_id;
        queue_data[rear++] = s;
        while (front < rear) {
            int u = queue_data[front++];
            int nb[2 * MAX_V];
            int n = undirected_neighbours(g, u, nb);
            for (int i = 0; i < n; i++)
                if (comp_of[nb[i]] == -1) { comp_of[nb[i]] = next_id; queue_data[rear++] = nb[i]; }
        }
        next_id++;
    }
    return next_id;
}

static int color[MAX_V];

static int dfs_has_cycle(Graph *g, int u, int parent) {
    color[u] = 1;
    int skipped_parent = 0;
    for (Edge *e = g->adj[u]; e; e = e->next) {
        int v = e->to;
        if (v == u) return 1;                                        /* self-loop: trivially a cycle */
        if (!g->directed && v == parent && !skipped_parent) { skipped_parent = 1; continue; }
        if (color[v] == 0) { if (dfs_has_cycle(g, v, u)) return 1; }
        else if (color[v] == 1) return 1;                            /* back edge: an ancestor -> a cycle */
    }
    color[u] = 2;
    return 0;
}

static int has_cycle(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++) color[i] = 0;
    for (int i = 0; i < g->vertex_count; i++)
        if (color[i] == 0 && dfs_has_cycle(g, i, -1)) return 1;
    return 0;
}

static void run_scenario(const char *label, int directed, EdgeIn edges[], int n) {
    printf("-- %s --\n", label);
    Graph g;
    reset_graph(&g, directed);
    for (int i = 0; i < n; i++) add_edge_labelled(&g, edges[i].a, edges[i].b, edges[i].weight);

    printf("%s, %d vertices, %d edges\n", directed ? "directed" : "undirected", g.vertex_count, n);

    int self_loops = 0;
    for (int i = 0; i < n; i++)
        if (strcmp(edges[i].a, edges[i].b) == 0) { printf("self-loop: %s-%s\n", edges[i].a, edges[i].b); self_loops++; }
    if (!self_loops) printf("self-loops: none\n");

    int multi_found = 0;
    for (int i = 0; i < n && !multi_found; i++) {
        if (strcmp(edges[i].a, edges[i].b) == 0) continue;
        for (int j = i + 1; j < n; j++) {
            int same = directed
                ? (strcmp(edges[i].a, edges[j].a) == 0 && strcmp(edges[i].b, edges[j].b) == 0)
                : ((strcmp(edges[i].a, edges[j].a) == 0 && strcmp(edges[i].b, edges[j].b) == 0) ||
                   (strcmp(edges[i].a, edges[j].b) == 0 && strcmp(edges[i].b, edges[j].a) == 0));
            if (same) { printf("multi-edge: %s%s%s (%d copies)\n", edges[i].a, directed ? ">" : "-", edges[i].b, 2); multi_found = 1; break; }
        }
    }
    if (!multi_found) printf("multi-edges: none\n");

    if (!directed) {
        printf("degree (list-length, via out-degree):");
        for (int i = 0; i < g.vertex_count; i++) printf(" %s=%d", g.label[i], out_degree(&g, i));
        printf("\n");
    } else {
        printf("in-degree: ");
        for (int i = 0; i < g.vertex_count; i++) printf(" %s=%d", g.label[i], in_degree(&g, i));
        printf("\n");
        printf("out-degree:");
        for (int i = 0; i < g.vertex_count; i++) printf(" %s=%d", g.label[i], out_degree(&g, i));
        printf("\n");
    }

    int comp_of[MAX_V];
    int comps = count_components(&g, comp_of);
    printf("connected components: %d\n", comps);

    int cyc = has_cycle(&g);
    printf("has cycle: %s\n", cyc ? "yes" : "no");

    free_graph(&g);
    printf("\n");
}

int main(void) {
    /* normal: 8 vertices, weighted, a cycle, a self-loop, a multi-edge and 2 components */
    EdgeIn normal[] = {
        {"A", "B", 3}, {"B", "C", 5}, {"C", "A", 2}, {"C", "D", 4},
        {"D", "E", 1}, {"E", "F", 6}, {"E", "F", 9}, {"D", "D", 7},
        {"G", "H", 2}, {"F", "C", 8}
    };
    run_scenario("normal: 8 vertices, weighted, a cycle, a self-loop, a multi-edge and 2 components", 0, normal, 10);

    /* hard: 8 vertices, directed, two cycles, a self-loop, a multi-edge and 2 weak components */
    EdgeIn hard[] = {
        {"P", "Q", 3}, {"Q", "R", 1}, {"R", "P", 4}, {"R", "S", 2},
        {"S", "T", 5}, {"T", "U", 1}, {"T", "U", 1}, {"U", "U", 6},
        {"Q", "S", 2}, {"S", "Q", 3}, {"V", "W", 2}, {"W", "V", 3}
    };
    run_scenario("hard: 8 vertices, directed, two cycles, a self-loop, a multi-edge and 2 weak components", 1, hard, 12);

    /* edge: an 11-vertex chain, no cycle, unweighted, connected */
    EdgeIn no_cycle[] = {
        {"V1", "V2", 1}, {"V2", "V3", 1}, {"V3", "V4", 1}, {"V4", "V5", 1}, {"V5", "V6", 1},
        {"V6", "V7", 1}, {"V7", "V8", 1}, {"V8", "V9", 1}, {"V9", "V10", 1}, {"V10", "V11", 1}
    };
    run_scenario("edge: an 11-vertex chain, no cycle, unweighted, connected", 0, no_cycle, 10);

    /* edge: a single vertex, shown with a self-loop */
    EdgeIn single[] = { {"A", "A", 1} };
    run_scenario("edge: a single vertex, shown with a self-loop", 0, single, 1);

    return 0;
}
