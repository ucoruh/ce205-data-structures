/* Unit tests for week-09 c/cycle_detection_directed.c */
#define main program_main
#include "../../c/cycle_detection_directed.c"
#undef main
#include "../../../test_check.h"

static Graph g;
static void reset(void) { free_graph(&g); g.vertex_count = 0; for (int i = 0; i < MAX_V; i++) g.adj[i] = NULL; }
static void edge(const char *a, const char *b) {
    int x = find_or_add_vertex(&g, a), y = find_or_add_vertex(&g, b);
    add_neighbour_sorted(&g, x, y);
}

int main(void) {
    /* -- empty graph: no cycle -- */
    reset();
    CHECK(!has_cycle_directed(&g));

    /* -- single vertex, no edges -- */
    reset();
    find_or_add_vertex(&g, "A");
    CHECK(!has_cycle_directed(&g));

    /* -- 2 vertices, one edge: no cycle -- */
    reset();
    edge("A", "B");
    CHECK(!has_cycle_directed(&g));

    /* -- smallest cycle: A>B, B>A -- */
    reset();
    edge("A", "B"); edge("B", "A");
    CHECK(has_cycle_directed(&g));
    CHECK_EQ_INT(cycle_len, 2);

    /* -- 3-cycle: A>B>C>A -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "A");
    CHECK(has_cycle_directed(&g));
    CHECK_EQ_INT(cycle_len, 3);
    CHECK_EQ_INT(cycle[0], find_or_add_vertex(&g, "A"));

    /* -- DAG (no cycle): diamond A>B, A>C, B>D, C>D -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D");
    CHECK(!has_cycle_directed(&g));

    /* -- forward edge only (not a back edge): A>B, A>C, B>C -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("B", "C");
    CHECK(!has_cycle_directed(&g));

    /* -- cross edge in a directed graph without cycle: A>C, B>C, B>D -- */
    reset();
    edge("A", "C"); edge("B", "C"); edge("B", "D");
    CHECK(!has_cycle_directed(&g));

    /* -- cycle appears only in the SECOND (alphabetically later) component -- */
    reset();
    edge("A", "B"); edge("X", "Y"); edge("Y", "X");
    CHECK(has_cycle_directed(&g));

    /* -- disconnected, both acyclic: A>B, X>Y -- */
    reset();
    edge("A", "B"); edge("X", "Y");
    CHECK(!has_cycle_directed(&g));

    /* -- long chain with a back edge to the middle: A>B>C>D>E, E>C -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "D"); edge("D", "E"); edge("E", "C");
    CHECK(has_cycle_directed(&g));
    CHECK_EQ_INT(cycle_len, 3);  /* C, D, E */
    CHECK_EQ_INT(cycle[0], find_or_add_vertex(&g, "C"));

    /* -- larger DAG matching the program's "acyclic" scenario -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D"); edge("D", "E");
    edge("C", "F"); edge("E", "G"); edge("F", "G"); edge("G", "H"); edge("B", "E");
    CHECK(!has_cycle_directed(&g));

    /* -- self-loop: NOT supported by parse_dag input, but a raw edge(A,A) via add_neighbour_sorted
     *    (bypassing input validation) must still be recognised as a 1-vertex cycle -- */
    reset();
    edge("A", "A");
    CHECK(has_cycle_directed(&g));
    CHECK_EQ_INT(cycle_len, 1);

    free_graph(&g);
    TEST_SUMMARY();
}
