/* Week 5 -- Graphs and Traversals
 * Connected components: repeated BFS. Every unvisited vertex starts a new
 * BFS that labels everything it reaches with the same component id;
 * direction is ignored (weak connectivity).
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
    AdjNode *adj[MAX_V];    /* undirected adjacency: direction always ignored here */
    int vertex_count;
} Graph;

int comp_of[MAX_V];   /* -1 = not yet labelled */

void bfs_label(Graph *g, int start, int id) {
    int queue_data[MAX_V], front = 0, rear = 0;
    comp_of[start] = id;
    queue_data[rear++] = start;
    while (front < rear) {
        int u = queue_data[front++];
        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* direction ignored: treated as undirected */
            if (comp_of[n->to] == -1) { comp_of[n->to] = id; queue_data[rear++] = n->to; }
        }
    }
}

int count_components(Graph *g) {
    int next_id = 0;
    for (int i = 0; i < g->vertex_count; i++) comp_of[i] = -1;
    for (int i = 0; i < g->vertex_count; i++)
        if (comp_of[i] == -1) { printf("unvisited %s: new component %d\n", g->label[i], next_id); bfs_label(g, i, next_id++); }  /* unvisited vertex starts a new component */
    return next_id;
}

/* ---- construction: build Graph from a (label, label) edge list, ignoring
 * direction entirely (both endpoints get each other appended), neighbour
 * lists kept in alphabetical (insertion) order. ---- */

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
        if (a == b) continue;                 /* self-loop: no traversal edge to add */
        add_neighbour_sorted(g, a, b);
        add_neighbour_sorted(g, b, a);         /* direction always ignored: mirror both ways */
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

    int total = count_components(&g);

    printf("component of each vertex:");
    for (int i = 0; i < g.vertex_count; i++) printf(" %s=%d", g.label[i], comp_of[i]);
    printf("\n");
    printf("total components: %d\n", total);

    free_graph(&g);
    printf("\n");
}

int main(void) {
    /* normal: 10 vertices, undirected, 2 components (two separate 5-cycles), 10 edges */
    EdgeIn normal[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"}, {"E", "A"},
        {"F", "G"}, {"G", "H"}, {"H", "I"}, {"I", "J"}, {"J", "F"}
    };
    run_scenario("normal: 10 vertices, undirected, 2 components (two separate 5-cycles), 10 edges", normal, 10);

    /* hard: 10 vertices, directed, 3 weak components (each a cycle), 10 edges */
    EdgeIn hard[] = {
        {"P", "Q"}, {"Q", "R"}, {"R", "S"}, {"S", "P"},
        {"T", "U"}, {"U", "V"}, {"V", "T"},
        {"W", "X"}, {"X", "Y"}, {"Y", "W"}
    };
    run_scenario("hard: 10 vertices, directed, 3 weak components (each a cycle), 10 edges", hard, 10);

    /* edge: 12 vertices, undirected, 4 separate triangle components, 12 edges */
    EdgeIn many[] = {
        {"A", "B"}, {"B", "C"}, {"C", "A"},
        {"D", "E"}, {"E", "F"}, {"F", "D"},
        {"G", "H"}, {"H", "I"}, {"I", "G"},
        {"J", "K"}, {"K", "L"}, {"L", "J"}
    };
    run_scenario("edge: 12 vertices, undirected, 4 separate triangle components, 12 edges", many, 12);

    /* edge: a single vertex, shown with a self-loop: one component */
    EdgeIn single[] = { {"A", "A"} };
    run_scenario("edge: a single vertex, shown with a self-loop: one component", single, 1);

    return 0;
}
