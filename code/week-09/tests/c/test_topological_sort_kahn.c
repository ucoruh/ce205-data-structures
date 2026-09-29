/* Unit tests for week-09 c/topological_sort_kahn.c */
#define main program_main
#include "../../c/topological_sort_kahn.c"
#undef main
#include "../../../test_check.h"

static Graph g;
static void reset(void) { free_graph(&g); g.vertex_count = 0; for (int i = 0; i < MAX_V; i++) g.adj[i] = NULL; }
static void edge(const char *a, const char *b) {
    int x = find_or_add_vertex(&g, a), y = find_or_add_vertex(&g, b);
    if (x != y) add_neighbour_sorted(&g, x, y);
}

int main(void) {
    /* -- empty graph: 0 vertices -- */
    reset();
    CHECK(topo_sort_kahn(&g) == 1);
    CHECK_EQ_INT(order_len, 0);

    /* -- single vertex, no edges -- */
    reset();
    find_or_add_vertex(&g, "A");
    CHECK(topo_sort_kahn(&g) == 1);
    CHECK_EQ_INT(order_len, 1);
    CHECK_EQ_INT(order[0], 0);

    /* -- single vertex via self-loop (ignored) -- */
    reset();
    edge("A", "A");
    CHECK(topo_sort_kahn(&g) == 1);
    CHECK_EQ_INT(order_len, 1);

    /* -- simple chain A>B>C -- */
    reset();
    edge("A", "B"); edge("B", "C");
    CHECK(topo_sort_kahn(&g) == 1);
    CHECK_EQ_INT(order_len, 3);
    CHECK_EQ_INT(order[0], 0); CHECK_EQ_INT(order[1], 1); CHECK_EQ_INT(order[2], 2);

    /* -- diamond: A>B, A>C, B>D, C>D -- ties broken alphabetically -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D");
    CHECK(topo_sort_kahn(&g) == 1);
    CHECK_EQ_INT(order_len, 4);
    CHECK_EQ_INT(order[0], 0);  /* A first */
    CHECK_EQ_INT(order[1], 1);  /* B before C (alphabetical) */
    CHECK_EQ_INT(order[2], 2);
    CHECK_EQ_INT(order[3], 3);  /* D last */

    /* -- 2 disconnected chains: A>B and X>Y -- both fully placed -- */
    reset();
    edge("A", "B"); edge("X", "Y");
    CHECK(topo_sort_kahn(&g) == 1);
    CHECK_EQ_INT(order_len, 4);

    /* -- a 3-cycle: A>B>C>A -- unsolvable, partial order -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "A");
    CHECK(topo_sort_kahn(&g) == 0);
    CHECK_EQ_INT(order_len, 0);   /* every vertex has indegree 1: nothing starts at 0 */

    /* -- cycle with a clean tail: A>B>C>A, C>D -- D never placed since it depends on C -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "A"); edge("C", "D");
    CHECK(topo_sort_kahn(&g) == 0);
    CHECK_EQ_INT(order_len, 0);

    /* -- duplicated edge A>B twice: indegree accounting must still balance -- */
    reset();
    edge("A", "B"); edge("A", "B"); edge("B", "C");
    CHECK(topo_sort_kahn(&g) == 1);
    CHECK_EQ_INT(order_len, 3);

    /* -- larger DAG matching the program's "normal" scenario -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D"); edge("D", "E");
    edge("C", "F"); edge("E", "G"); edge("F", "G"); edge("G", "H"); edge("B", "E");
    CHECK(topo_sort_kahn(&g) == 1);
    CHECK_EQ_INT(order_len, 8);
    /* every prerequisite must appear before its dependents */
    int pos[MAX_V];
    for (int i = 0; i < order_len; i++) pos[order[i]] = i;
    CHECK(pos[find_or_add_vertex(&g, "A")] < pos[find_or_add_vertex(&g, "B")]);
    CHECK(pos[find_or_add_vertex(&g, "D")] < pos[find_or_add_vertex(&g, "E")]);
    CHECK(pos[find_or_add_vertex(&g, "G")] < pos[find_or_add_vertex(&g, "H")]);

    free_graph(&g);
    TEST_SUMMARY();
}
