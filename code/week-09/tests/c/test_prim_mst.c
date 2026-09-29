/* Unit tests for week-09 c/prim_mst.c */
#define main program_main
#include "../../c/prim_mst.c"
#undef main
#include "../../../test_check.h"

static Graph g;
static void reset(void) { free_graph(&g); g.vertex_count = 0; for (int i = 0; i < MAX_V; i++) g.adj[i] = NULL; }
static void wedge(const char *a, const char *b, int w) {
    int x = find_or_add_vertex(&g, a), y = find_or_add_vertex(&g, b);
    add_neighbour_sorted(&g, x, y, w);
    add_neighbour_sorted(&g, y, x, w);
}

int main(void) {
    Edge mst[MAX_V]; int total;

    /* -- single vertex, no edges: MST is empty -- */
    reset();
    find_or_add_vertex(&g, "A");
    CHECK_EQ_INT(prim_mst(&g, 0, mst, &total), 0);
    CHECK_EQ_INT(total, 0);

    /* -- 2 vertices, 1 edge -- */
    reset();
    wedge("A", "B", 9);
    CHECK_EQ_INT(prim_mst(&g, 0, mst, &total), 1);
    CHECK_EQ_INT(total, 9);
    CHECK_EQ_INT(mst[0].w, 9);

    /* -- triangle: the heaviest edge is never needed -- */
    reset();
    wedge("A", "B", 1); wedge("B", "C", 2); wedge("A", "C", 3);
    CHECK_EQ_INT(prim_mst(&g, 0, mst, &total), 2);
    CHECK_EQ_INT(total, 3);

    /* -- square with a diagonal: 4 vertices, cheapest 3 edges chosen -- */
    reset();
    wedge("A", "B", 1); wedge("B", "C", 2); wedge("C", "D", 1); wedge("D", "A", 4); wedge("A", "C", 3);
    CHECK_EQ_INT(prim_mst(&g, 0, mst, &total), 3);
    CHECK_EQ_INT(total, 4);

    /* -- disconnected: start only reaches its own component -- */
    reset();
    wedge("A", "B", 5);
    wedge("X", "Y", 2);
    CHECK_EQ_INT(prim_mst(&g, 0, mst, &total), 1);
    CHECK_EQ_INT(total, 5);
    CHECK(!in_mst[find_or_add_vertex(&g, "X")]);
    CHECK(!in_mst[find_or_add_vertex(&g, "Y")]);

    /* -- starting vertex reachable from itself trivially (key = 0) -- */
    reset();
    wedge("A", "B", 6);
    CHECK_EQ_INT(key_of[find_or_add_vertex(&g, "A")], 0);

    /* -- min_key_vertex returns -1 when everyone is already in the MST -- */
    reset();
    find_or_add_vertex(&g, "A");
    for (int i = 0; i < MAX_V; i++) { key_of[i] = INF; in_mst[i] = 0; }
    in_mst[0] = 1;
    CHECK_EQ_INT(min_key_vertex(1), -1);

    /* -- min_key_vertex picks the smallest key among the not-yet-included -- */
    for (int i = 0; i < MAX_V; i++) in_mst[i] = 0;
    key_of[0] = 7; key_of[1] = 2; key_of[2] = 9;
    CHECK_EQ_INT(min_key_vertex(3), 1);

    /* -- tied minimum weights: the vertex with the smaller index wins (scan order) -- */
    key_of[0] = 4; key_of[1] = 4; key_of[2] = 9;
    CHECK_EQ_INT(min_key_vertex(3), 0);

    /* -- a negative-weight edge is still the cheapest choice: Prim has no non-negative requirement -- */
    reset();
    wedge("A", "B", -3); wedge("B", "C", 5); wedge("A", "C", 5);
    CHECK_EQ_INT(prim_mst(&g, 0, mst, &total), 2);
    CHECK_EQ_INT(total, 2);   /* -3 + 5 */
    CHECK_EQ_INT(mst[0].w, -3);

    /* -- 5-vertex path graph: total weight is the sum of all 4 edges -- */
    reset();
    wedge("A", "B", 3); wedge("B", "C", 1); wedge("C", "D", 4); wedge("D", "E", 2);
    CHECK_EQ_INT(prim_mst(&g, 0, mst, &total), 4);
    CHECK_EQ_INT(total, 10);

    free_graph(&g);
    TEST_SUMMARY();
}
