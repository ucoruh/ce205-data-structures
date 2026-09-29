/* Week 5 -- Graphs and Traversals
 * Graph representation: adjacency list. Builds an array of linked lists
 * from an edge list (undirected appends a node to BOTH endpoints' lists,
 * unless it is a self-loop) and prints every list after each edge is
 * added. Same graphs as adjacency_matrix.c, so the two representations
 * can be compared directly.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAX_V   16
#define MAX_LBL 4

typedef struct AdjNode {
    int to;                 /* neighbour's vertex index */
    struct AdjNode *next;
} AdjNode;

AdjNode *adj[MAX_V];         /* one linked list per vertex, all start NULL */

void append(int v, int neighbour) {
    AdjNode *n = malloc(sizeof(AdjNode));
    n->to = neighbour;
    n->next = NULL;
    if (adj[v] == NULL) { adj[v] = n; return; }
    AdjNode *cur = adj[v];
    while (cur->next != NULL)
        cur = cur->next;    /* walk to the tail */
    cur->next = n;
}

void add_edge(int a, int b, int directed) {
    append(a, b);
    if (!directed && a != b)
        append(b, a);
}

/* ---- construction helpers: turn a (label, label) edge list into the
 * (index, index) pairs add_edge() expects, with vertex indices assigned
 * in alphabetical label order. ---- */

typedef struct { const char *a, *b; } EdgeIn;

static int index_of(char labels[][MAX_LBL], int n, const char *lbl) {
    for (int i = 0; i < n; i++) if (strcmp(labels[i], lbl) == 0) return i;
    return -1;
}

static int collect_labels(EdgeIn edges[], int n, char labels[][MAX_LBL]) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (index_of(labels, count, edges[i].a) < 0) strcpy(labels[count++], edges[i].a);
        if (index_of(labels, count, edges[i].b) < 0) strcpy(labels[count++], edges[i].b);
    }
    for (int i = 1; i < count; i++) {
        char key[MAX_LBL];
        strcpy(key, labels[i]);
        int j = i - 1;
        while (j >= 0 && strcmp(labels[j], key) > 0) { strcpy(labels[j + 1], labels[j]); j--; }
        strcpy(labels[j + 1], key);
    }
    return count;
}

static void print_lists(char labels[][MAX_LBL], int n) {
    for (int i = 0; i < n; i++) {
        printf("%s:", labels[i]);
        for (AdjNode *cur = adj[i]; cur != NULL; cur = cur->next)
            printf(" -> %s", labels[cur->to]);
        printf(" -> NULL\n");
    }
}

static void free_lists(int n) {
    for (int i = 0; i < n; i++) {
        AdjNode *cur = adj[i];
        while (cur) { AdjNode *nx = cur->next; free(cur); cur = nx; }
        adj[i] = NULL;
    }
}

static void run_scenario(const char *label, int directed, EdgeIn in_edges[], int n) {
    printf("-- %s --\n", label);
    char labels[MAX_V][MAX_LBL];
    int v = collect_labels(in_edges, n, labels);
    for (int i = 0; i < MAX_V; i++) adj[i] = NULL;

    printf("%d vertices, empty lists:\n", v);
    print_lists(labels, v);

    for (int k = 0; k < n; k++) {
        int ia = index_of(labels, v, in_edges[k].a), ib = index_of(labels, v, in_edges[k].b);
        add_edge(ia, ib, directed);
        printf("add_edge(%s, %s)%s\n", in_edges[k].a, in_edges[k].b,
               (!directed && ia != ib) ? " [both lists updated]" : "");
        print_lists(labels, v);
    }
    free_lists(v);
    printf("\n");
}

int main(void) {
    /* normal: 7 vertices, undirected, unweighted, 10 edges */
    EdgeIn normal[] = {
        {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
        {"E", "F"}, {"F", "G"}, {"G", "A"},
        {"A", "D"}, {"B", "E"}, {"C", "F"}
    };
    run_scenario("normal: 7 vertices, undirected, unweighted, 10 edges", 0, normal, 10);

    /* hard: 8 vertices, directed, weighted, 10 edges including a reversed pair */
    EdgeIn hard[] = {
        {"P", "Q"}, {"Q", "R"}, {"R", "S"}, {"S", "T"},
        {"T", "U"}, {"U", "V"}, {"V", "W"}, {"W", "P"},
        {"P", "R"}, {"R", "P"}
    };
    run_scenario("hard: 8 vertices, directed, weighted, 10 edges including a reversed pair", 1, hard, 10);

    /* edge: 5 vertices, a complete graph (every pair connected), 10 edges */
    EdgeIn dense[] = {
        {"A", "B"}, {"A", "C"}, {"A", "D"}, {"A", "E"},
        {"B", "C"}, {"B", "D"}, {"B", "E"},
        {"C", "D"}, {"C", "E"}, {"D", "E"}
    };
    run_scenario("edge: 5 vertices, a complete graph (every pair connected), 10 edges", 0, dense, 10);

    /* edge: a single vertex, shown with a self-loop -- a one-vertex list */
    EdgeIn single[] = { {"A", "A"} };
    run_scenario("edge: a single vertex, shown with a self-loop -- a one-vertex list", 0, single, 1);

    return 0;
}
