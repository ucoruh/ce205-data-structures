/* Week 5 -- Graphs and Traversals
 * Depth-first search (DFS), iterative: an explicit stack (LIFO) replaces
 * the recursive call stack. A vertex's neighbours are pushed in REVERSE
 * alphabetical order, so popping them later processes them in alphabetical
 * order -- exactly the order dfs_recursive.c visits them in. A vertex may
 * be pushed more than once; a stale entry (already visited when popped)
 * is simply discarded. Same graphs as dfs_recursive.c.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>

#define MAX_V      32
#define MAX_LBL    4
#define MAX_STACK  256

typedef struct Graph {
    char label[MAX_V][MAX_LBL];
    int adj[MAX_V][MAX_V];    /* array-based adjacency, each row in ascending (alphabetical) order */
    int adj_count[MAX_V];
    int vertex_count;
} Graph;

int visited[MAX_V];
int stack_data[MAX_STACK], top = -1;
int order[MAX_V], order_len;   /* visit order, for the final summary line only */

void push(int v) { stack_data[++top] = v; }
int  pop(void)   { return stack_data[top--]; }

void dfs_iterative(Graph *g, int start) {
    push(start);
    while (top >= 0) {
        int u = pop();
        if (visited[u]) { printf("pop %s: stale, already visited -- discarded\n", g->label[u]); continue; }
        visited[u] = 1;
        order[order_len++] = u;
        printf("pop %s: visit\n", g->label[u]);
        for (int i = g->adj_count[u] - 1; i >= 0; i--)   /* push in REVERSE alphabetical order */
            if (!visited[g->adj[u][i]]) { push(g->adj[u][i]); printf("  push %s\n", g->label[g->adj[u][i]]); }
    }
}

void dfs(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++) visited[i] = 0;
    for (int i = 0; i < g->vertex_count; i++)
        if (!visited[i]) dfs_iterative(g, i);   /* one tree per component */
}

/* ---- construction: build Graph from a (label, label) edge list, each
 * vertex's adjacency row kept sorted alphabetically to match the
 * animation's neighbour order. ---- */

typedef struct { const char *a, *b; } EdgeIn;

static int find_or_add_vertex(Graph *g, const char *lbl) {
    for (int i = 0; i < g->vertex_count; i++)
        if (strcmp(g->label[i], lbl) == 0) return i;
    strncpy(g->label[g->vertex_count], lbl, MAX_LBL - 1);
    g->label[g->vertex_count][MAX_LBL - 1] = '\0';
    g->adj_count[g->vertex_count] = 0;
    return g->vertex_count++;
}

static void add_neighbour_sorted(Graph *g, int v, int neighbour) {
    int n = g->adj_count[v], i = n;
    while (i > 0 && strcmp(g->label[g->adj[v][i - 1]], g->label[neighbour]) > 0) {
        g->adj[v][i] = g->adj[v][i - 1];
        i--;
    }
    g->adj[v][i] = neighbour;
    g->adj_count[v] = n + 1;
}

static void build_graph(Graph *g, int directed, EdgeIn edges[], int n) {
    g->vertex_count = 0;
    for (int i = 0; i < n; i++) {
        int a = find_or_add_vertex(g, edges[i].a), b = find_or_add_vertex(g, edges[i].b);
        if (a == b) { add_neighbour_sorted(g, a, a); continue; }   /* self-loop: one entry, a->a */
        add_neighbour_sorted(g, a, b);
        if (!directed) add_neighbour_sorted(g, b, a);
    }
}

static void run_scenario(const char *label, int directed, EdgeIn edges[], int n) {
    printf("-- %s --\n", label);
    Graph g;
    build_graph(&g, directed, edges, n);
    top = -1;
    order_len = 0;
    dfs(&g);

    printf("visit order:");
    for (int i = 0; i < order_len; i++) printf(" %s", g.label[order[i]]);
    printf("\n\n");
}

int main(void) {
    /* normal: 7 vertices, undirected, 4 back edges (cycles), 10 edges */
    EdgeIn normal[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
        {"E", "F"}, {"F", "G"}, {"G", "A"},
        {"A", "D"}, {"B", "E"}, {"C", "F"}
    };
    run_scenario("normal: 7 vertices, undirected, 4 back edges (cycles), 10 edges", 0, normal, 10);

    /* hard: 6 vertices, directed, with a cycle, 10 edges */
    EdgeIn hard[] = {
        {"A", "B"}, {"A", "D"}, {"A", "E"},
        {"B", "C"}, {"C", "A"},
        {"D", "E"}, {"D", "F"},
        {"E", "B"}, {"E", "F"}, {"F", "C"}
    };
    run_scenario("hard: 6 vertices, directed, with a cycle, 10 edges", 1, hard, 10);

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
