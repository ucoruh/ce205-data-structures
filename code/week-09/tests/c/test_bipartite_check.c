/* Unit tests for week-09 c/bipartite_check.c */
#define main program_main
#include "../../c/bipartite_check.c"
#undef main
#include "../../../test_check.h"

static Graph g;
static void reset(void) { free_graph(&g); g.vertex_count = 0; for (int i = 0; i < MAX_V; i++) g.adj[i] = NULL; }
static void edge(const char *a, const char *b) {
    int x = find_or_add_vertex(&g, a), y = find_or_add_vertex(&g, b);
    if (x == y) return;
    add_neighbour_sorted(&g, x, y);
    add_neighbour_sorted(&g, y, x);
}

int main(void) {
    /* -- empty graph: 0 vertices, vacuously bipartite (the loop never runs) -- */
    reset();
    CHECK(is_bipartite(&g));

    /* -- single vertex, no edges: trivially bipartite -- */
    reset();
    find_or_add_vertex(&g, "A");
    CHECK(is_bipartite(&g));
    CHECK_EQ_INT(color_of[0], 0);

    /* -- single edge: 2-colourable -- */
    reset();
    edge("A", "B");
    CHECK(is_bipartite(&g));
    CHECK(color_of[0] != color_of[1]);

    /* -- triangle (3-cycle, odd): NOT bipartite -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "A");
    CHECK(!is_bipartite(&g));

    /* -- 4-cycle (even): bipartite -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "D"); edge("D", "A");
    CHECK(is_bipartite(&g));
    CHECK_EQ_INT(color_of[0], color_of[2]);   /* opposite corners share a colour */
    CHECK_EQ_INT(color_of[1], color_of[3]);
    CHECK(color_of[0] != color_of[1]);

    /* -- 5-cycle (odd): NOT bipartite -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "D"); edge("D", "E"); edge("E", "A");
    CHECK(!is_bipartite(&g));

    /* -- a tree is always bipartite -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("B", "E"); edge("C", "F");
    CHECK(is_bipartite(&g));

    /* -- disconnected: one bipartite component + one odd cycle -- overall NOT bipartite -- */
    reset();
    edge("A", "B");
    edge("X", "Y"); edge("Y", "Z"); edge("Z", "X");
    CHECK(!is_bipartite(&g));

    /* -- disconnected: two separate bipartite components -- overall bipartite -- */
    reset();
    edge("A", "B"); edge("B", "C");
    edge("X", "Y");
    CHECK(is_bipartite(&g));

    /* -- star graph (one hub, many leaves): always bipartite -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("A", "D"); edge("A", "E");
    CHECK(is_bipartite(&g));
    for (int i = 1; i <= 4; i++) CHECK(color_of[i] != color_of[0]);

    /* -- two triangles sharing an edge: still NOT bipartite (each triangle is odd) -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "A"); edge("C", "D"); edge("D", "B");
    CHECK(!is_bipartite(&g));

    free_graph(&g);
    TEST_SUMMARY();
}
