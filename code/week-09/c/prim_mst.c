/* Week 9 -- Graph Algorithms
 * Prim's minimum spanning tree: grow ONE tree from a start vertex. Every
 * vertex not yet in the tree keeps a "key" (the cheapest edge weight
 * connecting it to the tree so far); each round the smallest key is picked
 * and its neighbours' keys are relaxed. Unlike Kruskal, Prim only grows
 * from `start`: a vertex in another component is never reached (key stays
 * "infinite").
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAX_V   32
#define MAX_LBL 4
#define INF 1000000000

typedef struct AdjNode { int to, weight; struct AdjNode *next; } AdjNode;
typedef struct Graph {
    char label[MAX_V][MAX_LBL];
    AdjNode *adj[MAX_V];
    int vertex_count;
} Graph;

int key_of[MAX_V], parent_of[MAX_V], in_mst[MAX_V];

int min_key_vertex(int vertex_count) {
    int best = -1, best_key = INF;
    for (int v = 0; v < vertex_count; v++)
        if (!in_mst[v] && key_of[v] < best_key) { best_key = key_of[v]; best = v; }
    return best;
}

typedef struct { int a, b, w; } Edge;

int prim_mst(Graph *g, int start, Edge *mst_out, int *total_out) {
    for (int v = 0; v < g->vertex_count; v++) { key_of[v] = INF; in_mst[v] = 0; parent_of[v] = -1; }
    key_of[start] = 0;
    int mst_len = 0, total = 0;
    for (int count = 0; count < g->vertex_count; count++) {
        int u = min_key_vertex(g->vertex_count);
        if (u == -1 || key_of[u] == INF) break;         /* nothing left reachable */
        in_mst[u] = 1;
        if (parent_of[u] != -1) {
            mst_out[mst_len].a = parent_of[u]; mst_out[mst_len].b = u; mst_out[mst_len].w = key_of[u];
            mst_len++; total += key_of[u];
        }
        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next)      /* alphabetical order */
            if (!in_mst[n->to] && n->weight < key_of[n->to]) { key_of[n->to] = n->weight; parent_of[n->to] = u; }
    }
    *total_out = total;
    return mst_len;
}

/* ---- construction: build Graph from a (label, label, weight) UNDIRECTED edge list. ---- */

typedef struct { const char *a, *b; int w; } EdgeIn;

static int find_or_add_vertex(Graph *g, const char *lbl) {
    for (int i = 0; i < g->vertex_count; i++)
        if (strcmp(g->label[i], lbl) == 0) return i;
    strncpy(g->label[g->vertex_count], lbl, MAX_LBL - 1);
    g->label[g->vertex_count][MAX_LBL - 1] = '\0';
    g->adj[g->vertex_count] = NULL;
    return g->vertex_count++;
}

static AdjNode *new_node(int to, int w) {
    AdjNode *n = malloc(sizeof(AdjNode));
    n->to = to; n->weight = w; n->next = NULL;
    return n;
}

static void add_neighbour_sorted(Graph *g, int v, int neighbour, int w) {
    AdjNode *n = new_node(neighbour, w);
    if (g->adj[v] == NULL || strcmp(g->label[g->adj[v]->to], g->label[neighbour]) > 0) {
        n->next = g->adj[v];
        g->adj[v] = n;
        return;
    }
    AdjNode *cur = g->adj[v];
    while (cur->next != NULL && strcmp(g->label[cur->next->to], g->label[neighbour]) <= 0)
        cur = cur->next;
    n->next = cur->next;
    cur->next = n;
}

static void build_graph(Graph *g, EdgeIn edges[], int n) {
    g->vertex_count = 0;
    for (int i = 0; i < MAX_V; i++) g->adj[i] = NULL;
    for (int i = 0; i < n; i++) {
        int a = find_or_add_vertex(g, edges[i].a), b = find_or_add_vertex(g, edges[i].b);
        add_neighbour_sorted(g, a, b, edges[i].w);
        add_neighbour_sorted(g, b, a, edges[i].w);
    }
}

static void free_graph(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++) {
        AdjNode *cur = g->adj[i];
        while (cur) { AdjNode *nx = cur->next; free(cur); cur = nx; }
        g->adj[i] = NULL;
    }
}

static void run_scenario(const char *label_txt, const char *start_label, EdgeIn edges[], int n) {
    printf("-- %s --\n", label_txt);
    Graph g;
    build_graph(&g, edges, n);
    int start = find_or_add_vertex(&g, start_label);

    Edge mst[MAX_V]; int total = 0;
    int mst_len = prim_mst(&g, start, mst, &total);

    printf("MST edges:");
    for (int i = 0; i < mst_len; i++) printf(" %s-%s:%d", g.label[mst[i].a], g.label[mst[i].b], mst[i].w);
    printf("\ntotal weight = %d\n", total);

    int unreached = 0;
    for (int v = 0; v < g.vertex_count; v++) if (!in_mst[v]) unreached = 1;
    if (unreached) {
        printf("unreached:");
        for (int v = 0; v < g.vertex_count; v++) if (!in_mst[v]) printf(" %s", g.label[v]);
        printf("\n");
    }

    free_graph(&g);
    printf("\n");
}

int main(void) {
    EdgeIn normal[] = {
        {"A", "B", 4}, {"A", "C", 2}, {"B", "C", 1}, {"B", "D", 5},
        {"C", "D", 8}, {"C", "E", 10}, {"D", "E", 2}, {"D", "F", 6},
        {"E", "F", 3}, {"E", "G", 7}
    };
    run_scenario("normal: 7 vertices, 10 edges, starts at A", "A", normal, 10);

    EdgeIn hard[] = {
        {"A", "B", 3}, {"A", "C", 3}, {"B", "C", 3}, {"B", "D", 5},
        {"C", "D", 3}, {"C", "E", 6}, {"D", "E", 3}, {"D", "F", 4},
        {"E", "F", 3}, {"F", "G", 2}, {"F", "H", 3}, {"G", "H", 1},
        {"H", "I", 3}, {"G", "I", 5}
    };
    run_scenario("hard: 9 vertices, 14 edges, starts at E, many tied weights", "E", hard, 14);

    EdgeIn disconnected[] = {
        {"A", "B", 2}, {"B", "C", 4}, {"A", "C", 5}, {"C", "D", 1}, {"D", "E", 3},
        {"F", "G", 2}, {"G", "H", 6}, {"F", "H", 7}, {"H", "I", 3}, {"I", "J", 4}
    };
    run_scenario("edge: 2 components, starts at A -- F..J are never reached", "A", disconnected, 10);

    EdgeIn two_vertices[] = { {"A", "B", 9} };
    run_scenario("edge: 2 vertices, 1 edge", "A", two_vertices, 1);

    return 0;
}
