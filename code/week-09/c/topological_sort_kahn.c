/* Week 9 -- Graph Algorithms
 * Topological sort by KAHN's algorithm: count every vertex's in-degree, seed
 * a queue with the vertices that have in-degree 0, then repeatedly dequeue
 * one, print it, and decrement its neighbours' in-degree. If a cycle exists,
 * the queue empties before every vertex is placed.
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

int indeg[MAX_V];
int queue_data[MAX_V], front, rear;
int order[MAX_V], order_len;

void enqueue(int v) { queue_data[rear] = v; rear++; }
int  dequeue(void)  { int v = queue_data[front]; front++; return v; }

int topo_sort_kahn(Graph *g) {
    for (int i = 0; i < g->vertex_count; i++) indeg[i] = 0;
    for (int u = 0; u < g->vertex_count; u++)
        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next)
            indeg[n->to]++;
    front = rear = 0; order_len = 0;
    for (int v = 0; v < g->vertex_count; v++)          /* alphabetical order */
        if (indeg[v] == 0) enqueue(v);
    while (front < rear) {
        int u = dequeue();
        order[order_len] = u; order_len++;
        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* alphabetical order */
            indeg[n->to]--;
            if (indeg[n->to] == 0) enqueue(n->to);
        }
    }
    return order_len == g->vertex_count;               /* 0 -> a cycle exists */
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
        if (a == b) continue;                       /* self-loop: only used to seed a lone vertex */
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

    int ok = topo_sort_kahn(&g);
    printf("order:");
    for (int i = 0; i < order_len; i++) printf(" %s", g.label[order[i]]);
    printf("\n");
    if (ok) {
        printf("all %d vertices placed: a valid topological order\n", g.vertex_count);
    } else {
        printf("only %d of %d vertices placed -- a cycle exists, unplaced:", order_len, g.vertex_count);
        for (int i = 0; i < g.vertex_count; i++) {
            int placed = 0;
            for (int j = 0; j < order_len; j++) if (order[j] == i) placed = 1;
            if (!placed) printf(" %s", g.label[i]);
        }
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
    run_scenario("edge: 10 edges but a cycle exists, no full order", cycle, 10);

    EdgeIn single[] = { {"A", "A"} };
    run_scenario("edge: a single vertex, no edges (self-loop is ignored)", single, 1);

    return 0;
}
