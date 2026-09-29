/* Week 5 -- Graphs and Traversals
 * Breadth-first search (BFS) from a chosen start vertex, using a circular
 * queue. Neighbours are examined in ALPHABETICAL order, so the visit
 * order is reproducible. Prints every dequeue and the vertices it enqueues.
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

int visited[MAX_V], level_of[MAX_V], parent_of[MAX_V];
int queue_data[MAX_V], front, rear, count;

void enqueue(int v) { queue_data[rear] = v; rear = (rear + 1) % MAX_V; count++; }
int  dequeue(void)  { int v = queue_data[front]; front = (front + 1) % MAX_V; count--; return v; }

void bfs(Graph *g, int start) {
    for (int i = 0; i < g->vertex_count; i++) visited[i] = 0;
    visited[start] = 1;
    level_of[start] = 0;
    enqueue(start);
    while (count > 0) {
        int u = dequeue();
        printf("visit %s (level %d)\n", g->label[u], level_of[u]);
        for (AdjNode *n = g->adj[u]; n != NULL; n = n->next) {  /* neighbours: alphabetical order */
            if (!visited[n->to]) {
                visited[n->to] = 1;
                level_of[n->to] = level_of[u] + 1;
                parent_of[n->to] = u;
                enqueue(n->to);
            }
        }
    }
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

static void run_scenario(const char *label, int directed, const char *start_label, EdgeIn edges[], int n) {
    printf("-- %s --\n", label);
    Graph g;
    build_graph(&g, directed, edges, n);
    int start = find_or_add_vertex(&g, start_label);

    front = rear = count = 0;
    bfs(&g, start);

    int unreached = 0;
    printf("levels:");
    for (int i = 0; i < g.vertex_count; i++) {
        if (visited[i]) printf(" %s=%d", g.label[i], level_of[i]);
        else { printf(" %s=unreached", g.label[i]); unreached = 1; }
    }
    printf("\n");
    if (!unreached) printf("all vertices reached\n");

    free_graph(&g);
    printf("\n");
}

int main(void) {
    /* normal: 7 vertices, undirected, starts at A, 10 edges */
    EdgeIn normal[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
        {"E", "F"}, {"F", "G"}, {"G", "A"},
        {"A", "D"}, {"B", "E"}, {"C", "F"}
    };
    run_scenario("normal: 7 vertices, undirected, starts at A, 10 edges", 0, "A", normal, 10);

    /* hard: 8 vertices, directed, starts at P, with a cycle, 12 edges */
    EdgeIn hard[] = {
        {"P", "Q"}, {"P", "R"}, {"Q", "S"}, {"R", "S"},
        {"S", "T"}, {"T", "U"}, {"T", "V"}, {"U", "W"},
        {"V", "W"}, {"Q", "T"}, {"R", "U"}, {"W", "P"}
    };
    run_scenario("hard: 8 vertices, directed, starts at P, with a cycle, 12 edges", 1, "P", hard, 12);

    /* edge: 9 vertices, 2 components: G, H, I are unreachable from A */
    EdgeIn disconnected[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
        {"E", "F"}, {"F", "A"}, {"A", "D"},
        {"G", "H"}, {"H", "I"}, {"I", "G"}
    };
    run_scenario("edge: 9 vertices, 2 components: G, H, I are unreachable from A", 0, "A", disconnected, 9);

    /* edge: a single vertex, shown with a self-loop */
    EdgeIn single[] = { {"A", "A"} };
    run_scenario("edge: a single vertex, shown with a self-loop", 0, "A", single, 1);

    return 0;
}
