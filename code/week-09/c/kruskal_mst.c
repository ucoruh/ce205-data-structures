/* Week 9 -- Graph Algorithms
 * Kruskal's minimum spanning tree: sort every edge by weight, then scan it
 * in that order and add it to the tree with UNION-FIND (union by rank +
 * path compression) unless it would close a cycle. Ties keep the input
 * order (a stable sort). If the graph is disconnected, Kruskal still
 * finishes and produces a minimum spanning FOREST.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAX_V 32
#define MAX_E 64
#define MAX_LBL 4

typedef struct { int a, b, w, idx; } Edge;   /* idx = original input position, an explicit tie-break */

char label[MAX_V][MAX_LBL];
int vertex_count;
int parent_of[MAX_V], rank_of[MAX_V];

static int find_or_add_vertex(const char *lbl) {
    for (int i = 0; i < vertex_count; i++)
        if (strcmp(label[i], lbl) == 0) return i;
    strncpy(label[vertex_count], lbl, MAX_LBL - 1);
    label[vertex_count][MAX_LBL - 1] = '\0';
    return vertex_count++;
}

int find(int v) {
    int root = v;
    while (parent_of[root] != root) root = parent_of[root];
    while (parent_of[v] != root) { int next = parent_of[v]; parent_of[v] = root; v = next; }
    return root;
}

void union_sets(int a, int b) {
    int ra = find(a), rb = find(b);
    if (rank_of[ra] < rank_of[rb]) parent_of[ra] = rb;
    else if (rank_of[ra] > rank_of[rb]) parent_of[rb] = ra;
    else { parent_of[rb] = ra; rank_of[ra]++; }
}

int cmp_weight(const void *x, const void *y) {
    const Edge *ex = x, *ey = y;
    if (ex->w != ey->w) return ex->w - ey->w;
    return ex->idx - ey->idx;               /* explicit tie-break: qsort is not guaranteed stable */
}

int kruskal_mst(Edge *sorted, int edge_count, Edge *mst_out, int *total_out) {
    for (int v = 0; v < vertex_count; v++) { parent_of[v] = v; rank_of[v] = 0; }
    qsort(sorted, (size_t) edge_count, sizeof(Edge), cmp_weight);   /* ascending by weight, stable ties */
    int mst_len = 0, total = 0;
    for (int i = 0; i < edge_count; i++) {
        if (find(sorted[i].a) == find(sorted[i].b)) continue;    /* would close a cycle */
        union_sets(sorted[i].a, sorted[i].b);
        mst_out[mst_len] = sorted[i]; mst_len++;
        total += sorted[i].w;
    }
    *total_out = total;
    return mst_len;
}

typedef struct { const char *a, *b; int w; } EdgeIn;

static void run_scenario(const char *label_txt, EdgeIn edges[], int n) {
    printf("-- %s --\n", label_txt);
    vertex_count = 0;
    Edge sorted[MAX_E];
    for (int i = 0; i < n; i++) sorted[i] = (Edge) { find_or_add_vertex(edges[i].a), find_or_add_vertex(edges[i].b), edges[i].w, i };

    Edge mst[MAX_E]; int total = 0;
    int mst_len = kruskal_mst(sorted, n, mst, &total);

    printf("MST edges:");
    for (int i = 0; i < mst_len; i++) printf(" %s-%s:%d", label[mst[i].a], label[mst[i].b], mst[i].w);
    printf("\ntotal weight = %d\n", total);

    int roots = 0;
    for (int i = 0; i < vertex_count; i++) if (find(i) == i) roots++;
    printf("components = %d%s\n\n", roots, roots > 1 ? " (a spanning forest)" : "");
}

int main(void) {
    EdgeIn normal[] = {
        {"A", "B", 4}, {"A", "C", 2}, {"B", "C", 1}, {"B", "D", 5},
        {"C", "D", 8}, {"C", "E", 10}, {"D", "E", 2}, {"D", "F", 6},
        {"E", "F", 3}, {"E", "G", 7}
    };
    run_scenario("normal: 7 vertices, 10 edges, one component", normal, 10);

    EdgeIn hard[] = {
        {"A", "B", 3}, {"A", "C", 3}, {"B", "C", 3}, {"B", "D", 5},
        {"C", "D", 3}, {"C", "E", 6}, {"D", "E", 3}, {"D", "F", 4},
        {"E", "F", 3}, {"F", "G", 2}, {"F", "H", 3}, {"G", "H", 1},
        {"H", "I", 3}, {"G", "I", 5}
    };
    run_scenario("hard: 9 vertices, 14 edges, many tied weights (input order breaks ties)", hard, 14);

    EdgeIn disconnected[] = {
        {"A", "B", 2}, {"B", "C", 4}, {"A", "C", 5}, {"C", "D", 1}, {"D", "E", 3},
        {"F", "G", 2}, {"G", "H", 6}, {"F", "H", 7}, {"H", "I", 3}, {"I", "J", 4}
    };
    run_scenario("edge: 10 edges, 2 components -- the result is a spanning FOREST", disconnected, 10);

    EdgeIn two_vertices[] = { {"A", "B", 9} };
    run_scenario("edge: 2 vertices, 1 edge", two_vertices, 1);

    return 0;
}
