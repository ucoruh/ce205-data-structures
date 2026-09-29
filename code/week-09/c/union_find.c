/* Week 9 -- Graph Algorithms
 * Disjoint-set union-find with UNION BY RANK and PATH COMPRESSION. A
 * sequence of operations is replayed: "union A B" merges the sets
 * containing A and B; "find A" finds A's root and compresses the path from
 * A to it.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <string.h>

#define MAX_V   32
#define MAX_LBL 4

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

void make_set(int v) { parent_of[v] = v; rank_of[v] = 0; }

int find(int v) {
    int root = v;
    while (parent_of[root] != root) root = parent_of[root];  /* walk up to the root */
    while (parent_of[v] != root) {           /* path compression: relink every node on the way */
        int next = parent_of[v];
        parent_of[v] = root;
        v = next;
    }
    return root;
}

void union_sets(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return;                    /* already in the same set */
    if (rank_of[ra] < rank_of[rb]) {          /* union by rank: shorter tree hangs under the taller one */
        parent_of[ra] = rb;
    } else if (rank_of[ra] > rank_of[rb]) {
        parent_of[rb] = ra;
    } else {
        parent_of[rb] = ra;
        rank_of[ra]++;
    }
}

typedef struct { int is_find; const char *a, *b; } Op;

static void run_scenario(const char *label_txt, Op ops[], int n) {
    printf("-- %s --\n", label_txt);
    vertex_count = 0;

    /* discover every vertex mentioned, then make_set each one */
    for (int i = 0; i < n; i++) {
        find_or_add_vertex(ops[i].a);
        if (ops[i].b) find_or_add_vertex(ops[i].b);
    }
    for (int i = 0; i < vertex_count; i++) make_set(i);

    for (int i = 0; i < n; i++) {
        if (ops[i].is_find) {
            int a = find_or_add_vertex(ops[i].a);
            int root = find(a);
            printf("find(%s) = %s\n", ops[i].a, label[root]);
        } else {
            int a = find_or_add_vertex(ops[i].a), b = find_or_add_vertex(ops[i].b);
            int ra = find(a), rb = find(b);
            union_sets(a, b);
            if (ra == rb) printf("union(%s, %s): already the same set (%s)\n", ops[i].a, ops[i].b, label[ra]);
            else printf("union(%s, %s): merged, new root = %s\n", ops[i].a, ops[i].b, label[find(a)]);
        }
    }

    printf("final sets:");
    for (int i = 0; i < vertex_count; i++) printf(" %s->%s", label[i], label[find(i)]);
    printf("\n\n");
}

int main(void) {
    Op normal[] = {
        {0, "A", "B"}, {0, "C", "D"}, {0, "A", "C"},
        {0, "E", "F"}, {0, "G", "H"}, {0, "E", "G"},
        {1, "D", NULL}, {0, "A", "E"}, {1, "D", NULL}, {1, "H", NULL}, {0, "B", "H"}
    };
    run_scenario("normal: 8 elements, merges two rank-1 trees into a deeper chain, then flattens it with find (11 ops)", normal, 11);

    Op hard[] = {
        {0, "A", "B"}, {0, "C", "D"}, {0, "E", "F"}, {0, "G", "H"},
        {0, "A", "C"}, {0, "E", "G"}, {1, "F", NULL}, {0, "I", "J"},
        {0, "A", "E"}, {0, "B", "D"}, {1, "H", NULL}, {0, "A", "I"},
        {1, "J", NULL}, {0, "C", "F"}, {1, "B", NULL}
    };
    run_scenario("hard: 10 elements, nested merges and some already-same-set unions (15 ops)", hard, 15);

    Op noop[] = {
        {0, "A", "B"}, {0, "A", "B"}, {0, "B", "A"},
        {0, "C", "D"}, {0, "A", "C"}, {0, "D", "B"},
        {0, "A", "D"}, {1, "D", NULL}, {0, "C", "A"}, {1, "B", NULL}
    };
    run_scenario("edge: repeatedly unioning the same set with itself (10 ops)", noop, 10);

    Op single[] = { {1, "A", NULL} };
    run_scenario("edge: a single element, no unions, only a find", single, 1);

    return 0;
}
