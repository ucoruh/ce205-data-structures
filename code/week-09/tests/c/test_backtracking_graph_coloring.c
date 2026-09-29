/* Unit tests for week-09 c/backtracking_graph_coloring.c */
#define main program_main
#include "../../c/backtracking_graph_coloring.c"
#undef main
#include "../../../test_check.h"

static Graph g;
static void reset(void) { free_graph(&g); g.vertex_count = 0; for (int i = 0; i < MAX_V; i++) g.adj[i] = NULL; cur_g = &g; }
static void edge(const char *a, const char *b) {
    int x = find_or_add_vertex(&g, a), y = find_or_add_vertex(&g, b);
    if (x == y) return;
    add_neighbour_sorted(&g, x, y);
    add_neighbour_sorted(&g, y, x);
}
static void clear_colors(void) { for (int i = 0; i < g.vertex_count; i++) color_of[i] = 0; }

int main(void) {
    /* -- empty graph: 0 vertices, trivially colourable with any k >= 1 -- */
    reset();
    CHECK(color_graph(0, 3) == 1);

    /* -- single vertex, k=1: trivially colourable -- */
    reset();
    find_or_add_vertex(&g, "A");
    clear_colors();
    CHECK(color_graph(0, 1) == 1);
    CHECK_EQ_INT(color_of[0], 1);

    /* -- single edge, k=1: impossible (both endpoints need the same colour) -- */
    reset();
    edge("A", "B");
    clear_colors();
    CHECK(color_graph(0, 1) == 0);

    /* -- single edge, k=2: solvable, endpoints differ -- */
    reset();
    edge("A", "B");
    clear_colors();
    CHECK(color_graph(0, 2) == 1);
    CHECK(color_of[0] != color_of[1]);

    /* -- triangle, k=2: impossible (an odd cycle needs 3 colours) -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "A");
    clear_colors();
    CHECK(color_graph(0, 2) == 0);

    /* -- triangle, k=3: solvable, all three colours used -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "A");
    clear_colors();
    CHECK(color_graph(0, 3) == 1);
    CHECK(color_of[0] != color_of[1]);
    CHECK(color_of[1] != color_of[2]);
    CHECK(color_of[0] != color_of[2]);

    /* -- K4 (4 mutually connected vertices), k=3: impossible -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("A", "D"); edge("B", "C"); edge("B", "D"); edge("C", "D");
    clear_colors();
    CHECK(color_graph(0, 3) == 0);

    /* -- K4, k=4: solvable -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("A", "D"); edge("B", "C"); edge("B", "D"); edge("C", "D");
    clear_colors();
    CHECK(color_graph(0, 4) == 1);

    /* -- safe(): a colour already used by a neighbour is rejected -- */
    reset();
    edge("A", "B");
    clear_colors();
    color_of[1] = 2;   /* B is colour 2 */
    CHECK(safe(0, 2) == 0);
    CHECK(safe(0, 1) == 1);

    /* -- a bipartite graph (even cycle) needs only k=2 -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "D"); edge("D", "A");
    clear_colors();
    CHECK(color_graph(0, 2) == 1);
    CHECK_EQ_INT(color_of[0], color_of[2]);
    CHECK_EQ_INT(color_of[1], color_of[3]);

    /* -- a disconnected graph: each component is coloured independently -- */
    reset();
    edge("A", "B");
    edge("X", "Y"); edge("Y", "Z"); edge("Z", "X");
    clear_colors();
    CHECK(color_graph(0, 3) == 1);   /* triangle X-Y-Z needs 3; A-B alone needs only 2 */

    free_graph(&g);
    TEST_SUMMARY();
}
