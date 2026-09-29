/* Week 9 -- Graph Algorithms
 * Topological sort by DFS: run recursive DFS, record every vertex's FINISH
 * time, then read the finish order back to front. A back edge (to a grey,
 * still-open ancestor) means the graph has a cycle, so no topological order
 * exists.
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
int finish[MAX_V], finish_len;
int has_cycle;
Graph *cur_g;

void dfs_visit(int u) {
    color_of[u] = 1;                                /* gray: in progress */
    for (AdjNode *n = cur_g->adj[u]; n != NULL; n = n->next) {  /* alphabetical order */
        if (color_of[n->to] == 0) dfs_visit(n->to);      /* tree edge */
        else if (color_of[n->to] == 1) has_cycle = 1;       /* back edge -> a cycle */
    }
    color_of[u] = 2;                                /* black: done */
    finish[finish_len] = u; finish_len++;
}

void topo_sort_dfs(Graph *g) {
    cur_g = g;
    for (int i = 0; i < g->vertex_count; i++) color_of[i] = 0;
    finish_len = 0; has_cycle = 0;
    for (int v = 0; v < g->vertex_count; v++)         /* alphabetical order */
        if (color_of[v] == 0) dfs_visit(v);
    /* topological order = finish[] read back to front */
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
        if (a == b) continue;
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

    topo_sort_dfs(&g);
    printf("finish order:");
    for (int i = 0; i < finish_len; i++) printf(" %s", g.label[finish[i]]);
    printf("\n");
    if (has_cycle) {
        printf("a back edge was found: NOT a valid topological order (the graph has a cycle)\n");
    } else {
        printf("topo order:");
        for (int i = finish_len - 1; i >= 0; i--) printf(" %s", g.label[finish[i]]);
        printf("\n");
    }

    free_graph(&g);
    printf("\n");
}

int main(void) {
    EdgeIn normal[] = {
        {"A", "B"}, {"A", "C"}, {"B", "D"}, {"C", "D"}, {"D", "E"},
        {"C", "F"}, {"E", "G"}, {"F", "G"}, {"G", "H"}, {"B", "E"}
    };
    run_scenario("normal: 8 vertices, 10 edges, a valid DAG", normal, 10);

    EdgeIn hard[] = {
        {"A", "D"}, {"B", "D"}, {"C", "E"}, {"D", "F"}, {"E", "F"},
        {"D", "G"}, {"F", "H"}, {"G", "H"}, {"H", "I"}, {"I", "J"},
        {"G", "J"}, {"B", "E"}, {"A", "G"}, {"C", "F"}
    };
    run_scenario("hard: 10 vertices, 14 edges, a DAG with several sources", hard, 14);

    EdgeIn cycle[] = {
        {"A", "B"}, {"B", "C"}, {"C", "A"}, {"C", "D"}, {"D", "E"},
        {"E", "F"}, {"A", "D"}, {"F", "G"}, {"D", "F"}, {"B", "D"}
    };
    run_scenario("edge: 10 edges but a cycle exists, a back edge is found", cycle, 10);

    EdgeIn single[] = { {"A", "A"} };
    run_scenario("edge: a single vertex, no edges (self-loop is ignored)", single, 1);

    return 0;
}
