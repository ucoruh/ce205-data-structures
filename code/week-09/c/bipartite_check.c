/* Week 9 -- Graph Algorithms
 * Bipartite check by 2-colouring: BFS colours the start vertex 0, every
 * neighbour the OPPOSITE colour, and queues it. If an already-coloured
 * neighbour has the SAME colour, that edge closes an odd cycle -- the graph
 * is not bipartite. One BFS per component.
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

int color_of[MAX_V];        /* -1 = uncoloured, 0/1 = the two sides */
int queue_data[MAX_V], front, rear;

void enqueue(int v) { queue_data[rear] = v; rear++; }
int  dequeue(void)  { int v = queue_data[front]; front++; return v; }

int is_bipartite(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++) color_of[i] = -1;
    for (int s = 0; s < g->vertex_count; s++) {          /* alphabetical: one BFS per component */
        if (color_of[s] != -1) continue;
        color_of[s] = 0; front = rear = 0; enqueue(s);
        while (front < rear) {
            int u = dequeue();
            for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* alphabetical order */
                if (color_of[n->to] == -1) { color_of[n->to] = 1 - color_of[u]; enqueue(n->to); }
                else if (color_of[n->to] == color_of[u]) return 0;  /* same colour -> an odd cycle */
            }
        }
    }
    return 1;
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

static void run_scenario(const char *label_txt, EdgeIn edges[], int n) {
    printf("-- %s --\n", label_txt);
    Graph g;
    build_graph(&g, edges, n);

    int ok = is_bipartite(&g);
    printf("colors:");
    for (int v = 0; v < g.vertex_count; v++) printf(" %s=%d", g.label[v], color_of[v]);
    printf("\n%s\n", ok ? "bipartite" : "NOT bipartite");

    free_graph(&g);
    printf("\n");
}

int main(void) {
    EdgeIn normal[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"}, {"E", "F"},
        {"F", "G"}, {"G", "H"}, {"H", "A"}, {"A", "D"}, {"C", "F"}
    };
    run_scenario("normal: 8 vertices, an even cycle plus 2 safe diagonals, bipartite", normal, 10);

    EdgeIn hard[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"}, {"E", "F"}, {"F", "A"}, {"A", "D"},
        {"G", "H"}, {"H", "I"}, {"I", "J"}, {"J", "G"}
    };
    run_scenario("hard: 10 vertices, 2 components, both bipartite", hard, 11);

    EdgeIn odd_cycle[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"}, {"E", "A"},
        {"A", "F"}, {"F", "G"}, {"G", "H"}, {"H", "F"}, {"B", "F"}
    };
    run_scenario("edge: A-B-C-D-E-A is a 5-cycle (odd), NOT bipartite", odd_cycle, 10);

    EdgeIn two_vertices[] = { {"A", "B"} };
    run_scenario("edge: 2 vertices, 1 edge", two_vertices, 1);

    return 0;
}
