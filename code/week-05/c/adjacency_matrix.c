/* Week 5 -- Graphs and Traversals
 * Graph representation: adjacency matrix. Builds a V x V table from an
 * edge list, one edge at a time (undirected mirrors both cells across the
 * diagonal), and prints the whole matrix after every edge is added.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>

#define MAX_V   16
#define MAX_LBL 4

int matrix[MAX_V][MAX_V];      /* all cells start at 0 */

typedef struct { int a, b, weight; } Edge;

void add_edge(int a, int b, int weight, int directed) {
    matrix[a][b] = weight;      /* 1 if the graph is unweighted */
    if (!directed)
        matrix[b][a] = weight;  /* undirected: mirror across the diagonal */
}

void build_adjacency_matrix(Edge *edges, int edge_count, int directed) {
    for (int i = 0; i < MAX_V; i++)
        for (int j = 0; j < MAX_V; j++)
            matrix[i][j] = 0;
    for (int k = 0; k < edge_count; k++)
        add_edge(edges[k].a, edges[k].b, edges[k].weight, directed);
}

/* ---- construction helpers: turn a (label, label, weight) edge list into
 * the (index, index, weight) Edge array build_adjacency_matrix() expects,
 * with vertex indices assigned in alphabetical label order. ---- */

typedef struct { const char *a, *b; int weight; } EdgeIn;

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
    /* simple insertion sort, alphabetical -- matches the vertex order the animation uses */
    for (int i = 1; i < count; i++) {
        char key[MAX_LBL];
        strcpy(key, labels[i]);
        int j = i - 1;
        while (j >= 0 && strcmp(labels[j], key) > 0) { strcpy(labels[j + 1], labels[j]); j--; }
        strcpy(labels[j + 1], key);
    }
    return count;
}

static void print_matrix(char labels[][MAX_LBL], int n) {
    printf("    ");
    for (int j = 0; j < n; j++) printf("%3s", labels[j]);
    printf("\n");
    for (int i = 0; i < n; i++) {
        printf("%3s ", labels[i]);
        for (int j = 0; j < n; j++) printf("%3d", matrix[i][j]);
        printf("\n");
    }
}

static void run_scenario(const char *label, int directed, EdgeIn in_edges[], int n) {
    printf("-- %s --\n", label);
    char labels[MAX_V][MAX_LBL];
    int v = collect_labels(in_edges, n, labels);

    Edge edges[MAX_V];
    for (int i = 0; i < n; i++) {
        edges[i].a = index_of(labels, v, in_edges[i].a);
        edges[i].b = index_of(labels, v, in_edges[i].b);
        edges[i].weight = in_edges[i].weight;
    }

    build_adjacency_matrix(NULL, 0, directed);   /* zero the matrix first */
    printf("%d vertices, empty matrix:\n", v);
    print_matrix(labels, v);

    for (int k = 0; k < n; k++) {
        add_edge(edges[k].a, edges[k].b, edges[k].weight, directed);
        printf("add_edge(%s, %s, %d)%s\n", in_edges[k].a, in_edges[k].b, in_edges[k].weight,
               (!directed && edges[k].a != edges[k].b) ? " [mirrored]" : "");
        print_matrix(labels, v);
    }
    printf("\n");
}

int main(void) {
    /* normal: 7 vertices, undirected, unweighted, 10 edges */
    EdgeIn normal[] = {
        {"A", "B", 1}, {"B", "C", 1}, {"C", "D", 1}, {"D", "E", 1},
        {"E", "F", 1}, {"F", "G", 1}, {"G", "A", 1},
        {"A", "D", 1}, {"B", "E", 1}, {"C", "F", 1}
    };
    run_scenario("normal: 7 vertices, undirected, unweighted, 10 edges", 0, normal, 10);

    /* hard: 8 vertices, directed, weighted, 10 edges including a reversed pair */
    EdgeIn hard[] = {
        {"P", "Q", 3}, {"Q", "R", 1}, {"R", "S", 4}, {"S", "T", 2},
        {"T", "U", 5}, {"U", "V", 1}, {"V", "W", 3}, {"W", "P", 2},
        {"P", "R", 6}, {"R", "P", 7}
    };
    run_scenario("hard: 8 vertices, directed, weighted, 10 edges including a reversed pair", 1, hard, 10);

    /* edge: 5 vertices, a complete graph (every pair connected), 10 edges */
    EdgeIn dense[] = {
        {"A", "B", 1}, {"A", "C", 1}, {"A", "D", 1}, {"A", "E", 1},
        {"B", "C", 1}, {"B", "D", 1}, {"B", "E", 1},
        {"C", "D", 1}, {"C", "E", 1}, {"D", "E", 1}
    };
    run_scenario("edge: 5 vertices, a complete graph (every pair connected), 10 edges", 0, dense, 10);

    /* edge: a single vertex, shown with a self-loop -- a 1x1 matrix */
    EdgeIn single[] = { {"A", "A", 1} };
    run_scenario("edge: a single vertex, shown with a self-loop -- a 1x1 matrix", 0, single, 1);

    return 0;
}
