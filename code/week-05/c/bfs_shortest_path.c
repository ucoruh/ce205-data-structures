/* Week 5 -- Graphs and Traversals
 * Shortest path by EDGE COUNT from s to t, using BFS parent pointers
 * walked back to reconstruct the path. Neighbours are examined in
 * alphabetical order (as in bfs.c).
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

int visited[MAX_V], parent_of[MAX_V];

/* returns the path length in edges, or -1 if t is unreachable; fills path_out[0..len] with s..t */
int bfs_shortest_path(Graph *g, int s, int t, int *path_out) {
    int queue_data[MAX_V], front = 0, rear = 0;
    for (int i = 0; i < g->vertex_count; i++) visited[i] = 0;
    visited[s] = 1;
    queue_data[rear++] = s;
    while (front < rear) {
        int u = queue_data[front++];
        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {   /* alphabetical order */
            if (!visited[n->to]) { visited[n->to] = 1; parent_of[n->to] = u; queue_data[rear++] = n->to; }
        }
    }
    if (!visited[t]) return -1;                    /* no path */
    int len = 0, v = t;
    while (v != s) { path_out[len++] = v; v = parent_of[v]; }
    path_out[len++] = s;
    for (int i = 0; i < len / 2; i++) {             /* path_out was built backwards, from t to s */
        int tmp = path_out[i]; path_out[i] = path_out[len - 1 - i]; path_out[len - 1 - i] = tmp;
    }
    return len - 1;                                 /* path length, in edges */
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
    for (int i = 0; i < MAX_V; i++) g->adj[i] = NULL;
    for (int i = 0; i < n; i++) {
        int a = find_or_add_vertex(g, edges[i].a), b = find_or_add_vertex(g, edges[i].b);
        if (a == b) continue;                       /* self-loop: no traversal edge to add */
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

static void run_scenario(const char *label, int directed, const char *s_label, const char *t_label, EdgeIn edges[], int n) {
    printf("-- %s --\n", label);
    Graph g;
    build_graph(&g, directed, edges, n);
    int s = find_or_add_vertex(&g, s_label), t = find_or_add_vertex(&g, t_label);

    int path[MAX_V];
    int len = bfs_shortest_path(&g, s, t, path);

    if (len < 0) {
        printf("no path from %s to %s\n", s_label, t_label);
    } else {
        printf("path from %s to %s (length %d):", s_label, t_label, len);
        for (int i = 0; i <= len; i++) printf(" %s", g.label[path[i]]);
        printf("\n");
    }

    free_graph(&g);
    printf("\n");
}

int main(void) {
    /* normal: 7 vertices, undirected, A to F, 10 edges */
    EdgeIn normal[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
        {"E", "F"}, {"F", "G"}, {"G", "A"},
        {"A", "D"}, {"B", "E"}, {"C", "F"}
    };
    run_scenario("normal: 7 vertices, undirected, A to F, 10 edges", 0, "A", "F", normal, 10);

    /* hard: 8 vertices, directed, P to W, 12 edges */
    EdgeIn hard[] = {
        {"P", "Q"}, {"P", "R"}, {"Q", "S"}, {"R", "S"},
        {"S", "T"}, {"T", "U"}, {"T", "V"}, {"U", "W"},
        {"V", "W"}, {"Q", "T"}, {"R", "U"}, {"W", "P"}
    };
    run_scenario("hard: 8 vertices, directed, P to W, 12 edges", 1, "P", "W", hard, 12);

    /* edge: 9 vertices, NO PATH from A to H (2 separate components) */
    EdgeIn no_path[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
        {"E", "F"}, {"F", "A"}, {"A", "D"},
        {"G", "H"}, {"H", "I"}, {"I", "G"}
    };
    run_scenario("edge: 9 vertices, NO PATH from A to H (2 separate components)", 0, "A", "H", no_path, 9);

    /* edge: a single vertex, shown with a self-loop: s = t, length 0 */
    EdgeIn single[] = { {"A", "A"} };
    run_scenario("edge: a single vertex, shown with a self-loop: s = t, length 0", 0, "A", "A", single, 1);

    return 0;
}
