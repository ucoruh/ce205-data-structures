/* Week 9 -- Graph Algorithms
 * Cycle detection in a DIRECTED graph: 3-colour DFS (white/gray/black) with
 * an explicit "on the current path" stack. A back edge to a GREY vertex
 * means that vertex is still an open ancestor -- the path from it down to
 * here, plus the back edge, IS the cycle.
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
    int vertex_count;
} Graph;

int color_of[MAX_V];        /* 0 white, 1 gray, 2 black */
int on_path[MAX_V], path_top;
int cycle[MAX_V], cycle_len;
Graph *cur_g;

int dfs_cycle(int u) {
    color_of[u] = 1;                                 /* gray: on the current path */
    on_path[path_top] = u; path_top++;
    for (AdjNode *n = cur_g->adj[u]; n != NULL; n = n->next) {  /* alphabetical order */
        if (color_of[n->to] == 0) {
            if (dfs_cycle(n->to)) return 1;
        } else if (color_of[n->to] == 1) {
            int i = path_top - 1;                     /* n->to is a grey ancestor: extract the cycle */
            while (on_path[i] != n->to) i--;
            cycle_len = 0;
            for (; i < path_top; i++) { cycle[cycle_len] = on_path[i]; cycle_len++; }
            return 1;
        }
    }
    path_top--;                                       /* leaving the path: no cycle through u */
    color_of[u] = 2;
    return 0;
}

int has_cycle_directed(Graph *g) {
    cur_g = g;
    for (int i = 0; i < g->vertex_count; i++) color_of[i] = 0;
    path_top = 0; cycle_len = 0;
    for (int v = 0; v < g->vertex_count; v++)          /* alphabetical order */
        if (color_of[v] == 0 && dfs_cycle(v)) return 1;
    return 0;
}

/* ---- construction: build Graph from a (label, label) DIRECTED edge list. ---- */

typedef struct { const char *a, *b; } EdgeIn;

static int find_or_add_vertex(Graph *g, const char *lbl) {
    for (int i = 0; i < g->vertex_count; i++)
        if (strcmp(g->label[i], lbl) == 0) return i;
    strncpy(g->label[g->vertex_count], lbl, MAX_LBL - 1);
    g->label[g->vertex_count][MAX_LBL - 1] = '\0';
    g->adj[g->vertex_count] = NULL;
    return g->vertex_count++;
}

static AdjNode *new_node(int to) {
    AdjNode *n = malloc(sizeof(AdjNode));
    n->to = to;
    n->next = NULL;
    return n;
}

static void add_neighbour_sorted(Graph *g, int v, int neighbour) {
    AdjNode *n = new_node(neighbour);
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
        add_neighbour_sorted(g, a, b);
    }
}

static void free_graph(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++) {
        AdjNode *cur = g->adj[i];
        while (cur) { AdjNode *nx = cur->next; free(cur); cur = nx; }
        g->adj[i] = NULL;
    }
}

static void run_scenario(const char *label, EdgeIn edges[], int n) {
    printf("-- %s --\n", label);
    Graph g;
    build_graph(&g, edges, n);

    int found = has_cycle_directed(&g);
    if (found) {
        printf("cycle found:");
        for (int i = 0; i < cycle_len; i++) printf(" %s", g.label[cycle[i]]);
        printf(" -> %s\n", g.label[cycle[0]]);
    } else {
        printf("no cycle found\n");
    }

    free_graph(&g);
    printf("\n");
}

int main(void) {
    EdgeIn normal[] = {
        {"A", "B"}, {"A", "C"}, {"B", "D"}, {"C", "D"}, {"D", "F"},
        {"F", "C"}, {"D", "E"}, {"F", "G"}, {"E", "G"}, {"G", "H"}
    };
    run_scenario("normal: 8 vertices, 10 edges, one cycle: C-D-F-C", normal, 10);

    EdgeIn hard[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "B"}, {"D", "E"},
        {"E", "F"}, {"F", "D"}, {"F", "G"}, {"G", "H"}, {"H", "I"},
        {"I", "J"}, {"A", "E"}, {"C", "F"}, {"B", "G"}
    };
    run_scenario("hard: 10 vertices, 14 edges, two overlapping cycles", hard, 14);

    EdgeIn acyclic[] = {
        {"A", "B"}, {"A", "C"}, {"B", "D"}, {"C", "D"}, {"D", "E"},
        {"C", "F"}, {"E", "G"}, {"F", "G"}, {"G", "H"}, {"B", "E"}
    };
    run_scenario("edge: 10 edges, entirely cycle-free (a DAG)", acyclic, 10);

    EdgeIn min_cycle[] = {
        {"A", "B"}, {"B", "A"}, {"C", "D"}, {"D", "E"}, {"E", "F"},
        {"C", "E"}, {"F", "G"}, {"G", "H"}, {"D", "G"}, {"H", "I"}
    };
    run_scenario("edge: the smallest cycle, A-B-A (2 edges), among 10 edges", min_cycle, 10);

    return 0;
}
