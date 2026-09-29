/* Unit tests for week-05 c/adjacency_matrix.c
 * Independent oracle: expected matrix cells are hand-computed from the edge list (never read back from
 * the matrix itself before the assertion), and collect_labels/index_of are checked against a hand-sorted
 * expected label order. */
#define main program_main
#include "../../c/adjacency_matrix.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* -- collect_labels: alphabetical order regardless of edge insertion order -- */
    {
        EdgeIn edges[] = { {"C", "A", 1}, {"B", "C", 1}, {"A", "B", 1} };
        char labels[MAX_V][MAX_LBL];
        int n = collect_labels(edges, 3, labels);
        CHECK_EQ_INT(n, 3);
        CHECK(strcmp(labels[0], "A") == 0);
        CHECK(strcmp(labels[1], "B") == 0);
        CHECK(strcmp(labels[2], "C") == 0);
        CHECK_EQ_INT(index_of(labels, n, "B"), 1);
        CHECK_EQ_INT(index_of(labels, n, "Z"), -1);   /* not found */
    }

    /* -- build_adjacency_matrix zeroes stale data from a previous scenario -- */
    matrix[0][0] = 99;
    build_adjacency_matrix(NULL, 0, 0);
    CHECK_EQ_INT(matrix[0][0], 0);
    for (int i = 0; i < MAX_V; i++)
        for (int j = 0; j < MAX_V; j++)
            CHECK_EQ_INT(matrix[i][j], 0);   /* empty input: whole matrix stays zero */

    /* -- add_edge, undirected: mirrors across the diagonal -- */
    build_adjacency_matrix(NULL, 0, 0);
    add_edge(0, 1, 7, 0);
    CHECK_EQ_INT(matrix[0][1], 7);
    CHECK_EQ_INT(matrix[1][0], 7);

    /* -- add_edge, directed: does NOT mirror -- */
    build_adjacency_matrix(NULL, 0, 1);
    add_edge(0, 1, 7, 1);
    CHECK_EQ_INT(matrix[0][1], 7);
    CHECK_EQ_INT(matrix[1][0], 0);

    /* -- add_edge, self-loop: single cell on the diagonal -- */
    build_adjacency_matrix(NULL, 0, 0);
    add_edge(2, 2, 3, 0);
    CHECK_EQ_INT(matrix[2][2], 3);

    /* -- add_edge, duplicate/overwrite: the later call wins (matrix stores the last weight, not a count) -- */
    build_adjacency_matrix(NULL, 0, 0);
    add_edge(0, 1, 2, 0);
    add_edge(0, 1, 9, 0);
    CHECK_EQ_INT(matrix[0][1], 9);
    CHECK_EQ_INT(matrix[1][0], 9);

    /* -- add_edge, negative weight -- */
    build_adjacency_matrix(NULL, 0, 1);
    add_edge(0, 1, -5, 1);
    CHECK_EQ_INT(matrix[0][1], -5);

    /* -- add_edge, extreme weight (INT_MAX) -- */
    build_adjacency_matrix(NULL, 0, 1);
    add_edge(0, 1, 2147483647, 1);
    CHECK_EQ_INT(matrix[0][1], 2147483647);

    /* -- directed reversed pair: P->Q and Q->P keep independent weights -- */
    build_adjacency_matrix(NULL, 0, 1);
    add_edge(0, 1, 3, 1);
    add_edge(1, 0, 5, 1);
    CHECK_EQ_INT(matrix[0][1], 3);
    CHECK_EQ_INT(matrix[1][0], 5);

    /* -- full end-to-end: normal scenario, undirected, unweighted, 10 edges over 7 vertices --
     * hand-computed expected matrix: a 7-cycle (A..G-A) plus 3 chords (A-D, B-E, C-F) */
    {
        EdgeIn in_edges[] = {
            {"A", "B", 1}, {"B", "C", 1}, {"C", "D", 1}, {"D", "E", 1},
            {"E", "F", 1}, {"F", "G", 1}, {"G", "A", 1},
            {"A", "D", 1}, {"B", "E", 1}, {"C", "F", 1}
        };
        char labels[MAX_V][MAX_LBL];
        int v = collect_labels(in_edges, 10, labels);
        CHECK_EQ_INT(v, 7);
        Edge edges[10];
        for (int i = 0; i < 10; i++) {
            edges[i].a = index_of(labels, v, in_edges[i].a);
            edges[i].b = index_of(labels, v, in_edges[i].b);
            edges[i].weight = in_edges[i].weight;
        }
        build_adjacency_matrix(NULL, 0, 0);
        for (int k = 0; k < 10; k++) add_edge(edges[k].a, edges[k].b, edges[k].weight, 0);

        int expected[7][7] = {
            /*      A  B  C  D  E  F  G */
            /* A */{0, 1, 0, 1, 0, 0, 1},
            /* B */{1, 0, 1, 0, 1, 0, 0},
            /* C */{0, 1, 0, 1, 0, 1, 0},
            /* D */{1, 0, 1, 0, 1, 0, 0},
            /* E */{0, 1, 0, 1, 0, 1, 0},
            /* F */{0, 0, 1, 0, 1, 0, 1},
            /* G */{1, 0, 0, 0, 0, 1, 0},
        };
        int all_match = 1;
        for (int i = 0; i < 7; i++)
            for (int j = 0; j < 7; j++)
                if (matrix[i][j] != expected[i][j]) all_match = 0;
        CHECK(all_match);
        CHECK_EQ_INT(matrix[0][1], 1);   /* A-B */
        CHECK_EQ_INT(matrix[0][2], 0);   /* A-C: not an edge */
    }

    /* -- one-vertex, one self-loop edge: a 1x1 matrix -- */
    {
        EdgeIn in_edges[] = { {"A", "A", 1} };
        char labels[MAX_V][MAX_LBL];
        int v = collect_labels(in_edges, 1, labels);
        CHECK_EQ_INT(v, 1);
        build_adjacency_matrix(NULL, 0, 0);
        add_edge(0, 0, 1, 0);
        CHECK_EQ_INT(matrix[0][0], 1);
    }

    /* -- two vertices, single directed edge -- */
    build_adjacency_matrix(NULL, 0, 1);
    add_edge(0, 1, 4, 1);
    CHECK_EQ_INT(matrix[0][1], 4);
    CHECK_EQ_INT(matrix[1][0], 0);
    CHECK_EQ_INT(matrix[1][1], 0);

    TEST_SUMMARY();
}
