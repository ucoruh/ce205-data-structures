/* Week 9 -- Graph Algorithms
 * Bellman-Ford shortest path: single source, NEGATIVE weights allowed. Relax
 * every edge, in a fixed alphabetical vertex order, for up to V-1 rounds
 * (stopping early once a round changes nothing). A final extra round that
 * still finds an improvement means a NEGATIVE CYCLE reaches that vertex --
 * its distance is not well defined.
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

int dist_of[MAX_V], parent_of[MAX_V];

int bellman_ford(Graph *g, int start) {
    for (int v = 0; v < g->vertex_count; v++) { dist_of[v] = INF; parent_of[v] = -1; }
    dist_of[start] = 0;
    for (int pass = 1; pass <= g->vertex_count - 1; pass++) {
        int changed = 0;
        for (int u = 0; u < g->vertex_count; u++) {           /* alphabetical order */
            if (dist_of[u] == INF) continue;
            for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {
                int cand = dist_of[u] + n->weight;
                if (cand < dist_of[n->to]) { dist_of[n->to] = cand; parent_of[n->to] = u; changed = 1; }
            }
        }
        if (!changed) break;                                  /* nothing changed: done early */
    }
    int neg_cycle = 0;
    for (int u = 0; u < g->vertex_count; u++) {                /* one more pass: detect a negative cycle */
        if (dist_of[u] == INF) continue;
        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next)
            if (dist_of[u] + n->weight < dist_of[n->to]) neg_cycle = 1;
    }
    return neg_cycle;
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

    int neg_cycle = bellman_ford(&g, start);

    printf("distances:");
    for (int v = 0; v < g.vertex_count; v++) {
        if (dist_of[v] == INF) printf(" %s=inf", g.label[v]);
        else printf(" %s=%d", g.label[v], dist_of[v]);
    }
    printf("\n%s\n", neg_cycle ? "negative cycle detected" : "no negative cycle");

    free_graph(&g);
    printf("\n");
}

int main(void) {
    EdgeIn normal[] = {
        {"A", "B", 4}, {"A", "C", 2}, {"C", "B", 1}, {"B", "D", 5},
        {"C", "D", 8}, {"C", "E", 10}, {"D", "E", 2}, {"D", "F", 6},
        {"E", "F", 3}, {"E", "G", 7}
    };
    run_scenario("normal: 7 vertices, 10 edges, all positive, starts at A", "A", normal, 10);

    EdgeIn hard[] = {
        {"A", "B", 6}, {"A", "C", 4}, {"B", "D", -3}, {"C", "D", 2},
        {"C", "E", 5}, {"D", "E", -2}, {"D", "F", 4}, {"E", "F", 1},
        {"E", "G", -4}, {"F", "G", 2}, {"F", "H", 3}
    };
    run_scenario("hard: 8 vertices, 11 edges, negative edges present but no cycle (a DAG), starts at A", "A", hard, 11);

    EdgeIn negative_cycle[] = {
        {"A", "B", 1}, {"B", "C", 2}, {"C", "A", -4},
        {"A", "D", 3}, {"D", "E", 2}, {"B", "D", 5}, {"C", "E", 1}, {"D", "A", 6},
        {"E", "B", 2}, {"E", "C", 3}
    };
    run_scenario("edge: A-B-C-A is a negative cycle (total -1), starts at A", "A", negative_cycle, 10);

    EdgeIn two_vertices[] = { {"A", "B", -5} };
    run_scenario("edge: 2 vertices, 1 negative edge", "A", two_vertices, 1);

    return 0;
}
