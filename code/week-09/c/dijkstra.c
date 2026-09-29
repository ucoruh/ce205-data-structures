/* Week 9 -- Graph Algorithms
 * Dijkstra's shortest path: single source, non-negative weights only. Every
 * not-yet-finished vertex keeps a "dist" (its current best distance from
 * the start); each round the smallest is picked (it is now final) and its
 * outgoing edges are relaxed.
 * CEN207 Data Structures (formerly CE205)
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

int dist_of[MAX_V], parent_of[MAX_V], done[MAX_V];

int min_dist_vertex(int vertex_count) {
    int best = -1, best_dist = INF;
    for (int v = 0; v < vertex_count; v++)
        if (!done[v] && dist_of[v] < best_dist) { best_dist = dist_of[v]; best = v; }
    return best;
}

void dijkstra(Graph *g, int start) {
    for (int v = 0; v < g->vertex_count; v++) { dist_of[v] = INF; done[v] = 0; parent_of[v] = -1; }
    dist_of[start] = 0;
    for (int count = 0; count < g->vertex_count; count++) {
        int u = min_dist_vertex(g->vertex_count);
        if (u == -1 || dist_of[u] == INF) break;      /* nothing left reachable */
        done[u] = 1;
        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {   /* alphabetical order */
            int cand = dist_of[u] + n->weight;
            if (!done[n->to] && cand < dist_of[n->to]) { dist_of[n->to] = cand; parent_of[n->to] = u; }
        }
    }
}

/* ---- construction: build Graph from a (label, label, weight) DIRECTED edge list. ---- */

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

    dijkstra(&g, start);

    printf("distances:");
    for (int v = 0; v < g.vertex_count; v++) {
        if (dist_of[v] == INF) printf(" %s=inf", g.label[v]);
        else printf(" %s=%d", g.label[v], dist_of[v]);
    }
    printf("\n");

    free_graph(&g);
    printf("\n");
}

int main(void) {
    EdgeIn normal[] = {
        {"A", "B", 4}, {"A", "C", 2}, {"C", "B", 1}, {"B", "D", 5},
        {"C", "D", 8}, {"C", "E", 10}, {"D", "E", 2}, {"D", "F", 6},
        {"E", "F", 3}, {"E", "G", 7}
    };
    run_scenario("normal: 8 vertices, 10 edges, starts at A", "A", normal, 10);

    EdgeIn hard[] = {
        {"A", "B", 2}, {"A", "C", 2}, {"B", "D", 3}, {"C", "D", 3},
        {"B", "E", 6}, {"C", "F", 6}, {"D", "G", 2}, {"E", "G", 3},
        {"F", "G", 3}, {"G", "H", 1}, {"H", "I", 4}, {"H", "J", 4},
        {"E", "H", 2}, {"F", "H", 2}
    };
    run_scenario("hard: 10 vertices, 14 edges, starts at A, many tied distances", "A", hard, 14);

    EdgeIn unreachable[] = {
        {"A", "B", 2}, {"B", "C", 4}, {"A", "C", 5}, {"C", "D", 1}, {"D", "E", 3},
        {"F", "G", 2}, {"G", "H", 6}, {"H", "F", 7}, {"H", "I", 3}, {"I", "J", 4}
    };
    run_scenario("edge: starts at A, F..J are never reachable via the directed edges", "A", unreachable, 10);

    EdgeIn two_vertices[] = { {"A", "B", 9} };
    run_scenario("edge: 2 vertices, 1 edge", "A", two_vertices, 1);

    return 0;
}
