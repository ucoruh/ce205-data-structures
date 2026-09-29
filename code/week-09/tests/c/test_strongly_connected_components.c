/* Unit tests for week-09 c/strongly_connected_components.c */
#define main program_main
#include "../../c/strongly_connected_components.c"
#undef main
#include "../../../test_check.h"

static Graph g;
static void reset(void) { free_graph(&g); g.vertex_count = 0; for (int i = 0; i < MAX_V; i++) { g.adj[i] = NULL; g.adjT[i] = NULL; } }
static void edge(const char *a, const char *b) {
    int x = find_or_add_vertex(&g, a), y = find_or_add_vertex(&g, b);
    if (x == y) return;
    add_sorted(&g, g.adj, x, y);
    add_sorted(&g, g.adjT, y, x);
}

int main(void) {
    /* -- empty graph: 0 vertices, 0 components -- */
    reset();
    CHECK_EQ_INT(kosaraju(&g), 0);

    /* -- single vertex: its own component -- */
    reset();
    find_or_add_vertex(&g, "A");
    CHECK_EQ_INT(kosaraju(&g), 1);
    CHECK_EQ_INT(comp_of[0], 0);

    /* -- 2 vertices, one edge, no cycle: 2 components -- */
    reset();
    edge("A", "B");
    CHECK_EQ_INT(kosaraju(&g), 2);
    CHECK(comp_of[0] != comp_of[1]);

    /* -- 2-cycle: A>B, B>A -- one component -- */
    reset();
    edge("A", "B"); edge("B", "A");
    CHECK_EQ_INT(kosaraju(&g), 1);
    CHECK_EQ_INT(comp_of[0], comp_of[1]);

    /* -- 3-cycle: A>B>C>A -- one component -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "A");
    CHECK_EQ_INT(kosaraju(&g), 1);
    CHECK_EQ_INT(comp_of[0], comp_of[1]);
    CHECK_EQ_INT(comp_of[1], comp_of[2]);

    /* -- pure DAG: A>B>C -- every vertex its own component -- */
    reset();
    edge("A", "B"); edge("B", "C");
    CHECK_EQ_INT(kosaraju(&g), 3);
    CHECK(comp_of[0] != comp_of[1]);
    CHECK(comp_of[1] != comp_of[2]);

    /* -- two disjoint cycles: A<->B and X<->Y -- 2 components -- */
    reset();
    edge("A", "B"); edge("B", "A"); edge("X", "Y"); edge("Y", "X");
    CHECK_EQ_INT(kosaraju(&g), 2);
    CHECK_EQ_INT(comp_of[0], comp_of[1]);
    int x = find_or_add_vertex(&g, "X"), y = find_or_add_vertex(&g, "Y");
    CHECK_EQ_INT(comp_of[x], comp_of[y]);
    CHECK(comp_of[0] != comp_of[x]);

    /* -- a cycle plus a one-way tail: A>B>C>A, C>D -- D is its own component -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "A"); edge("C", "D");
    CHECK_EQ_INT(kosaraju(&g), 2);
    int d = find_or_add_vertex(&g, "D");
    CHECK(comp_of[d] != comp_of[0]);

    /* -- a one-way tail INTO a cycle: D>A, A>B>C>A -- D still separate (D can't be reached back) -- */
    reset();
    edge("D", "A"); edge("A", "B"); edge("B", "C"); edge("C", "A");
    CHECK_EQ_INT(kosaraju(&g), 2);

    /* -- fully connected 4-cycle with a chord: A>B>C>D>A, A>C -- still one component -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "D"); edge("D", "A"); edge("A", "C");
    CHECK_EQ_INT(kosaraju(&g), 1);

    free_graph(&g);
    TEST_SUMMARY();
}
