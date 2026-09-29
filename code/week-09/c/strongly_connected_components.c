/* Week 9 -- Graph Algorithms
 * Strongly connected components by KOSARAJU's algorithm: (1) DFS on the
 * graph, recording every vertex's FINISH time; (2) DFS again on the
 * TRANSPOSE graph, visiting unvisited roots in DECREASING finish-time
 * order -- each resulting DFS tree is exactly one strongly connected
 * component.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAX_V   32
#define MAX_LBL 4

typedef struct AdjNode { int to; struct AdjNode *next; } AdjNode;
typedef struct Graph {
    char label[MAX_V][MAX_LBL];
    AdjNode *adj[MAX_V];
    AdjNode *adjT[MAX_V];          /* transpose: every edge reversed */
    int vertex_count;
} Graph;

int visited[MAX_V];
int finish[MAX_V], finish_len;
int comp_of[MAX_V], comp_count;
Graph *cur_g;

void dfs1(int u) {                                     /* phase 1: order by finish time */
    visited[u] = 1;
    for (AdjNode *n = cur_g->adj[u]; n != NULL; n = n->next)   /* alphabetical order */
        if (!visited[n->to]) dfs1(n->to);
    finish[finish_len] = u; finish_len++;
}

void dfs2(int u, int id) {                              /* phase 2: collect one component */
    visited[u] = 1;
    comp_of[u] = id;
    for (AdjNode *n = cur_g->adjT[u]; n != NULL; n = n->next)  /* alphabetical order, on the TRANSPOSE */
        if (!visited[n->to]) dfs2(n->to, id);
}

int kosaraju(Graph *g) {
    cur_g = g;
    for (int i = 0; i < g->vertex_count; i++) visited[i] = 0;
    finish_len = 0;
    for (int v = 0; v < g->vertex_count; v++)          /* alphabetical order */
        if (!visited[v]) dfs1(v);
    for (int i = 0; i < g->vertex_count; i++) visited[i] = 0;
    comp_count = 0;
    for (int i = finish_len - 1; i >= 0; i--) {         /* decreasing finish time */
        int v = finish[i];
        if (!visited[v]) { dfs2(v, comp_count); comp_count++; }
    }
    return comp_count;
}

/* ---- construction: build Graph (and its transpose) from a DIRECTED edge list. ---- */

typedef struct { const char *a, *b; } EdgeIn;

static int find_or_add_vertex(Graph *g, const char *lbl) {
    for (int i = 0; i < g->vertex_count; i++)
        if (strcmp(g->label[i], lbl) == 0) return i;
    strncpy(g->label[g->vertex_count], lbl, MAX_LBL - 1);
    g->label[g->vertex_count][MAX_LBL - 1] = '\0';
    g->adj[g->vertex_count] = NULL;
    g->adjT[g->vertex_count] = NULL;
    return g->vertex_count++;
}

static AdjNode *new_node(int to) { AdjNode *n = malloc(sizeof(AdjNode)); n->to = to; n->next = NULL; return n; }

static void add_sorted(Graph *g, AdjNode *adj[], int v, int neighbour) {
    AdjNode *n = new_node(neighbour);
    if (adj[v] == NULL || strcmp(g->label[adj[v]->to], g->label[neighbour]) > 0) {
        n->next = adj[v]; adj[v] = n; return;
    }
    AdjNode *cur = adj[v];
    while (cur->next != NULL && strcmp(g->label[cur->next->to], g->label[neighbour]) <= 0) cur = cur->next;
    n->next = cur->next; cur->next = n;
}

static void build_graph(Graph *g, EdgeIn edges[], int n) {
    g->vertex_count = 0;
    for (int i = 0; i < MAX_V; i++) { g->adj[i] = NULL; g->adjT[i] = NULL; }
    for (int i = 0; i < n; i++) {
        int a = find_or_add_vertex(g, edges[i].a), b = find_or_add_vertex(g, edges[i].b);
        if (a == b) continue;
        add_sorted(g, g->adj, a, b);
        add_sorted(g, g->adjT, b, a);
    }
}

static void free_graph(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++) {
        AdjNode *cur = g->adj[i]; while (cur) { AdjNode *nx = cur->next; free(cur); cur = nx; } g->adj[i] = NULL;
        cur = g->adjT[i]; while (cur) { AdjNode *nx = cur->next; free(cur); cur = nx; } g->adjT[i] = NULL;
    }
}

static void run_scenario(const char *label_txt, EdgeIn edges[], int n) {
    printf("-- %s --\n", label_txt);
    Graph g;
    build_graph(&g, edges, n);

    int cc = kosaraju(&g);
    printf("%d component%s:\n", cc, cc == 1 ? "" : "s");
    for (int id = 0; id < cc; id++) {
        printf(" ");
        for (int v = 0; v < g.vertex_count; v++) if (comp_of[v] == id) printf(" %s", g.label[v]);
        printf("\n");
    }

    free_graph(&g);
    printf("\n");
}

int main(void) {
    EdgeIn normal[] = {
        {"A", "B"}, {"B", "C"}, {"C", "A"}, {"C", "D"}, {"D", "E"},
        {"E", "F"}, {"F", "D"}, {"F", "G"}, {"G", "H"}, {"E", "G"}
    };
    run_scenario("normal: 8 vertices, 10 edges, 2 cyclic components + 2 singletons", normal, 10);

    EdgeIn hard[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "A"}, {"B", "D"},
        {"C", "B"}, {"D", "E"}, {"E", "F"}, {"F", "E"}, {"F", "G"},
        {"G", "H"}, {"H", "I"}, {"I", "G"}, {"I", "J"}
    };
    run_scenario("hard: 10 vertices, 14 edges, 3 components (one large)", hard, 14);

    EdgeIn one_big_scc[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"}, {"E", "F"},
        {"F", "G"}, {"G", "H"}, {"H", "A"}, {"C", "A"}, {"F", "D"}
    };
    run_scenario("edge: everything is one big cycle, the whole graph is one component", one_big_scc, 10);

    EdgeIn dag[] = {
        {"A", "B"}, {"A", "C"}, {"B", "D"}, {"C", "D"}, {"D", "E"},
        {"C", "F"}, {"E", "G"}, {"F", "G"}, {"G", "H"}, {"B", "E"}
    };
    run_scenario("edge: a cycle-free graph (a DAG), every vertex is its own component", dag, 10);

    return 0;
}
