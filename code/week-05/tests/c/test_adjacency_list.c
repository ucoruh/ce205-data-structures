/* Unit tests for week-05 c/adjacency_list.c
 * Independent oracle: expected list contents are hand-computed from the edge list, never read back from
 * the adjacency lists themselves before the assertion. Every allocation is released with free_lists() so
 * the test stays clean under AddressSanitizer/LeakSanitizer. */
#define main program_main
#include "../../c/adjacency_list.c"
#undef main
#include "../../../test_check.h"

static int list_len(int v) {
    int n = 0;
    for (AdjNode *cur = adj[v]; cur != NULL; cur = cur->next) n++;
    return n;
}

static int list_contains(int v, int target, int times) {
    int n = 0;
    for (AdjNode *cur = adj[v]; cur != NULL; cur = cur->next) if (cur->to == target) n++;
    return n == times;
}

int main(void) {
    for (int i = 0; i < MAX_V; i++) adj[i] = NULL;

    /* -- collect_labels: alphabetical order regardless of edge insertion order -- */
    {
        EdgeIn edges[] = { {"C", "A"}, {"B", "C"}, {"A", "B"} };
        char labels[MAX_V][MAX_LBL];
        int n = collect_labels(edges, 3, labels);
        CHECK_EQ_INT(n, 3);
        CHECK(strcmp(labels[0], "A") == 0);
        CHECK(strcmp(labels[1], "B") == 0);
        CHECK(strcmp(labels[2], "C") == 0);
        CHECK_EQ_INT(index_of(labels, n, "B"), 1);
        CHECK_EQ_INT(index_of(labels, n, "Z"), -1);   /* not found */
    }

    /* -- append: single append into an empty list -- */
    append(0, 5);
    CHECK(adj[0] != NULL);
    CHECK_EQ_INT(adj[0]->to, 5);
    CHECK(adj[0]->next == NULL);
    free_lists(1);

    /* -- append: preserves INSERTION order (tail-appends, does not sort) -- */
    append(0, 3);
    append(0, 1);
    append(0, 2);
    CHECK_EQ_INT(adj[0]->to, 3);
    CHECK_EQ_INT(adj[0]->next->to, 1);
    CHECK_EQ_INT(adj[0]->next->next->to, 2);
    CHECK(adj[0]->next->next->next == NULL);
    CHECK_EQ_INT(list_len(0), 3);
    free_lists(1);

    /* -- add_edge, undirected: appends to BOTH endpoints -- */
    add_edge(0, 1, 0);
    CHECK_EQ_INT(list_len(0), 1);
    CHECK_EQ_INT(list_len(1), 1);
    CHECK(list_contains(0, 1, 1));
    CHECK(list_contains(1, 0, 1));
    free_lists(2);

    /* -- add_edge, self-loop: only ONE entry, in the single vertex's own list -- */
    add_edge(0, 0, 0);
    CHECK_EQ_INT(list_len(0), 1);
    CHECK(list_contains(0, 0, 1));
    free_lists(1);

    /* -- add_edge, directed: only the source vertex's list is updated -- */
    add_edge(0, 1, 1);
    CHECK_EQ_INT(list_len(0), 1);
    CHECK_EQ_INT(list_len(1), 0);
    free_lists(2);

    /* -- add_edge, duplicate: NOT deduplicated -- two separate nodes -- */
    add_edge(0, 1, 1);
    add_edge(0, 1, 1);
    CHECK_EQ_INT(list_len(0), 2);
    CHECK(list_contains(0, 1, 2));
    free_lists(2);

    /* -- full end-to-end: same normal scenario as adjacency_matrix, 7 vertices, 10 undirected edges;
     * hand-computed expected neighbour SETS (order not checked here, only membership and count) -- */
    {
        EdgeIn in_edges[] = {
            {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
            {"E", "F"}, {"F", "G"}, {"G", "A"},
            {"A", "D"}, {"B", "E"}, {"C", "F"}
        };
        char labels[MAX_V][MAX_LBL];
        int v = collect_labels(in_edges, 10, labels);
        CHECK_EQ_INT(v, 7);
        for (int i = 0; i < MAX_V; i++) adj[i] = NULL;
        for (int k = 0; k < 10; k++) {
            int ia = index_of(labels, v, in_edges[k].a), ib = index_of(labels, v, in_edges[k].b);
            add_edge(ia, ib, 0);
        }
        /* A (index 0) must be adjacent to B, G, D -- degree 3 */
        CHECK_EQ_INT(list_len(0), 3);
        CHECK(list_contains(0, index_of(labels, v, "B"), 1));
        CHECK(list_contains(0, index_of(labels, v, "G"), 1));
        CHECK(list_contains(0, index_of(labels, v, "D"), 1));
        /* every vertex has degree 3 in this graph (7-cycle + 3 chords touching A,B,C,D,E,F but not G doubly) */
        CHECK_EQ_INT(list_len(index_of(labels, v, "G")), 2);   /* G only touches F and A */
        free_lists(v);
    }

    /* -- one-vertex, one self-loop: a one-vertex list -- */
    {
        EdgeIn in_edges[] = { {"A", "A"} };
        char labels[MAX_V][MAX_LBL];
        int v = collect_labels(in_edges, 1, labels);
        CHECK_EQ_INT(v, 1);
        for (int i = 0; i < MAX_V; i++) adj[i] = NULL;
        add_edge(0, 0, 0);
        CHECK_EQ_INT(list_len(0), 1);
        free_lists(v);
    }

    /* -- two vertices, single directed edge -- */
    add_edge(0, 1, 1);
    CHECK_EQ_INT(list_len(0), 1);
    CHECK_EQ_INT(list_len(1), 0);
    free_lists(2);

    TEST_SUMMARY();
}
