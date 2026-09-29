/* Week 9 -- Graph Algorithms
 * Backtracking: colour every vertex with one of k colours so that no edge
 * joins two same-coloured vertices. Vertices are tried in alphabetical
 * order, colours 1..k in order; when no colour works, we UNDO (colour 0)
 * and let the caller try its next colour.
 * CEN207 Data Structures (CS50-style lecture notes)
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
    int vertex_count;
} Graph;

int color_of[MAX_V];        /* 0 = uncoloured */
Graph *cur_g;

int safe(int v, int c) {
    for (AdjNode *n = cur_g->adj[v]; n != NULL; n = n->next)   /* alphabetical order */
        if (color_of[n->to] == c) return 0;      /* a neighbour already has this colour */
    return 1;
}

int color_graph(int v, int k) {                    /* try to colour v, v+1, ... with k colours */
    if (v == cur_g->vertex_count) return 1;         /* every vertex coloured: success */
    for (int c = 1; c <= k; c++) {
        if (safe(v, c)) {
            color_of[v] = c;                         /* try colour c */
            if (color_graph(v + 1, k)) return 1;
            color_of[v] = 0;                          /* backtrack: undo, try the next colour */
        }
    }
    return 0;                                        /* no colour works for v: fail, backtrack further */
}

/* ---- construction: build Graph from a (label, label) UNDIRECTED edge list. ---- */

typedef struct { const char *a, *b; } EdgeIn;

static int find_or_add_vertex(Graph *g, const char *lbl) {
    for (int i = 0; i < g->vertex_count; i++)
        if (strcmp(g->label[i], lbl) == 0) return i;
    strncpy(g->label[g->vertex_count], lbl, MAX_LBL - 1);
    g->label[g->vertex_count][MAX_LBL - 1] = '\0';
    g->adj[g->vertex_count] = NULL;
    return g->vertex_count++;
}

static AdjNode *new_node(int to) { AdjNode *n = malloc(sizeof(AdjNode)); n->to = to; n->next = NULL; return n; }

static void add_neighbour_sorted(Graph *g, int v, int neighbour) {
    AdjNode *n = new_node(neighbour);
    if (g->adj[v] == NULL || strcmp(g->label[g->adj[v]->to], g->label[neighbour]) > 0) {
        n->next = g->adj[v]; g->adj[v] = n; return;
    }
    AdjNode *cur = g->adj[v];
    while (cur->next != NULL && strcmp(g->label[cur->next->to], g->label[neighbour]) <= 0) cur = cur->next;
    n->next = cur->next; cur->next = n;
}

static void build_graph(Graph *g, EdgeIn edges[], int n) {
    g->vertex_count = 0;
    for (int i = 0; i < MAX_V; i++) g->adj[i] = NULL;
    for (int i = 0; i < n; i++) {
        int a = find_or_add_vertex(g, edges[i].a), b = find_or_add_vertex(g, edges[i].b);
        if (a == b) continue;
        add_neighbour_sorted(g, a, b);
        add_neighbour_sorted(g, b, a);
    }
}

static void free_graph(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++) {
        AdjNode *cur = g->adj[i];
        while (cur) { AdjNode *nx = cur->next; free(cur); cur = nx; }
        g->adj[i] = NULL;
    }
}

static void run_scenario(const char *label_txt, int k, EdgeIn edges[], int n) {
    printf("-- %s --\n", label_txt);
    Graph g;
    build_graph(&g, edges, n);
    cur_g = &g;
    for (int i = 0; i < g.vertex_count; i++) color_of[i] = 0;

    int ok = color_graph(0, k);
    if (ok) {
        printf("colouring:");
        for (int v = 0; v < g.vertex_count; v++) printf(" %s=%d", g.label[v], color_of[v]);
        printf("\n");
    } else {
        printf("no valid colouring with k=%d\n", k);
    }

    free_graph(&g);
    printf("\n");
}

int main(void) {
    EdgeIn normal[] = {
        {"A", "B"}, {"A", "C"}, {"B", "C"}, {"B", "D"}, {"C", "D"},
        {"C", "E"}, {"D", "E"}, {"D", "F"}, {"E", "F"}, {"A", "F"}
    };
    run_scenario("normal: 6 vertices, 10 edges, solvable with k=3 colours", 3, normal, 10);

    EdgeIn hard[] = {
        {"A", "B"}, {"A", "C"}, {"A", "E"}, {"A", "G"}, {"B", "C"},
        {"B", "E"}, {"B", "F"}, {"C", "D"}, {"C", "F"}, {"D", "E"},
        {"E", "F"}, {"F", "G"}
    };
    run_scenario("hard: 7 vertices, 12 edges, k=3, needs a fair amount of backtracking", 3, hard, 12);

    EdgeIn impossible[] = {
        {"A", "B"}, {"A", "C"}, {"A", "D"}, {"B", "C"}, {"B", "D"}, {"C", "D"},
        {"D", "E"}, {"E", "F"}, {"F", "D"}, {"E", "A"}
    };
    run_scenario("edge: K4 (4 mutually connected vertices) is UNSOLVABLE with k=3 (10 edges)", 3, impossible, 10);

    EdgeIn trivial[] = { {"A", "B"} };
    run_scenario("edge: 2 vertices, 1 edge, k=2 (the minimum needed)", 2, trivial, 1);

    return 0;
}
