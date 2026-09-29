/* Week 5 -- Graphs and Traversals
 * Depth-first search (DFS), recursive: every visit() call pushes a call-
 * stack frame, walks neighbours in ALPHABETICAL order, and pops before
 * returning. Unvisited vertices (alphabetical order) each start their own
 * tree -- a disconnected graph becomes a DFS FOREST. Edges are classified
 * as tree, back (a cycle), and -- directed graphs only -- forward/cross.
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
    int directed;
} Graph;

int color_of[MAX_V];        /* 0 white, 1 gray, 2 black */
int disc_time[MAX_V], fin_time[MAX_V], parent_of[MAX_V];
int clock_ = 0;

void dfs_visit(Graph *g, int u) {
    color_of[u] = 1;                 /* gray: discovered, still exploring */
    disc_time[u] = ++clock_;
    printf("visit %s (disc=%d)\n", g->label[u], disc_time[u]);
    for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* neighbours: alphabetical order */
        int v = n->to;
        if (color_of[v] == 0) {
            parent_of[v] = u;
            printf("  edge %s-%s: TREE edge\n", g->label[u], g->label[v]);
            dfs_visit(g, v);
        }
        else if (color_of[v] == 1) {
            printf("  edge %s-%s: BACK edge (a cycle)\n", g->label[u], g->label[v]); /* v is an ancestor -> a cycle */
        }
        else if (g->directed) {
            if (disc_time[u] < disc_time[v])
                printf("  edge %s-%s: FORWARD edge\n", g->label[u], g->label[v]);
            else
                printf("  edge %s-%s: CROSS edge\n", g->label[u], g->label[v]);
        }
    }
    color_of[u] = 2;                 /* black: finished */
    fin_time[u] = ++clock_;
    printf("finish %s (fin=%d)\n", g->label[u], fin_time[u]);
}

void dfs(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++) color_of[i] = 0;
    for (int i = 0; i < g->vertex_count; i++)
        if (color_of[i] == 0) dfs_visit(g, i);  /* one tree per component */
}

/* ---- construction: build Graph from a (label, label) edge list, neighbour
 * lists kept in alphabetical (insertion) order to match the animation. ---- */

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

static void build_graph(Graph *g, int directed, EdgeIn edges[], int n) {
    g->vertex_count = 0;
    g->directed = directed;
    for (int i = 0; i < MAX_V; i++) g->adj[i] = NULL;
    for (int i = 0; i < n; i++) {
        int a = find_or_add_vertex(g, edges[i].a), b = find_or_add_vertex(g, edges[i].b);
        if (a == b) { add_neighbour_sorted(g, a, a); continue; }   /* self-loop: one entry, a->a */
        add_neighbour_sorted(g, a, b);
        if (!directed) add_neighbour_sorted(g, b, a);
    }
}

static void free_graph(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++) {
        AdjNode *cur = g->adj[i];
        while (cur) { AdjNode *nx = cur->next; free(cur); cur = nx; }
        g->adj[i] = NULL;
    }
}

static void run_scenario(const char *label, int directed, EdgeIn edges[], int n) {
    printf("-- %s --\n", label);
    Graph g;
    build_graph(&g, directed, edges, n);
    clock_ = 0;
    dfs(&g);

    printf("preorder (discovery order):");
    /* rebuild the discovery order from disc_time, cheaper than tracking a
     * separate array: sort vertex indices by disc_time */
    int order[MAX_V];
    for (int i = 0; i < g.vertex_count; i++) order[i] = i;
    for (int i = 1; i < g.vertex_count; i++) {
        int key = order[i], j = i - 1;
        while (j >= 0 && disc_time[order[j]] > disc_time[key]) { order[j + 1] = order[j]; j--; }
        order[j + 1] = key;
    }
    for (int i = 0; i < g.vertex_count; i++) printf(" %s", g.label[order[i]]);
    printf("\n");

    free_graph(&g);
    printf("\n");
}

int main(void) {
    /* normal: 7 vertices, undirected, 4 back edges (cycles), 10 edges */
    EdgeIn normal[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
        {"E", "F"}, {"F", "G"}, {"G", "A"},
        {"A", "D"}, {"B", "E"}, {"C", "F"}
    };
    run_scenario("normal: 7 vertices, undirected, 4 back edges (cycles), 10 edges", 0, normal, 10);

    /* hard: 6 vertices, directed: tree, back, forward AND cross edges all in one graph, 10 edges */
    EdgeIn hard[] = {
        {"A", "B"}, {"A", "D"}, {"A", "E"},
        {"B", "C"}, {"C", "A"},
        {"D", "E"}, {"D", "F"},
        {"E", "B"}, {"E", "F"}, {"F", "C"}
    };
    run_scenario("hard: 6 vertices, directed: tree, back, forward AND cross edges all in one graph, 10 edges", 1, hard, 10);

    /* edge: 10 vertices, undirected, 2 separate components: a DFS FOREST */
    EdgeIn forest[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"}, {"E", "F"},
        {"G", "H"}, {"H", "I"}, {"I", "G"}, {"G", "J"}, {"H", "J"}
    };
    run_scenario("edge: 10 vertices, undirected, 2 separate components: a DFS FOREST", 0, forest, 10);

    /* edge: a single vertex, shown with a self-loop */
    EdgeIn single[] = { {"A", "A"} };
    run_scenario("edge: a single vertex, shown with a self-loop", 0, single, 1);

    return 0;
}
