/* Unit tests for week-09 c/dijkstra.c */
#define main program_main
#include "../../c/dijkstra.c"
#undef main
#include "../../../test_check.h"

static Graph g;
static void reset(void) { free_graph(&g); g.vertex_count = 0; for (int i = 0; i < MAX_V; i++) g.adj[i] = NULL; }
static void wedge(const char *a, const char *b, int w) {
    int x = find_or_add_vertex(&g, a), y = find_or_add_vertex(&g, b);
    add_neighbour_sorted(&g, x, y, w);
}

int main(void) {
    /* -- single vertex: distance to itself is 0 -- */
    reset();
    find_or_add_vertex(&g, "A");
    dijkstra(&g, 0);
    CHECK_EQ_INT(dist_of[0], 0);

    /* -- 2 vertices, 1 edge -- */
    reset();
    wedge("A", "B", 9);
    dijkstra(&g, 0);
    CHECK_EQ_INT(dist_of[1], 9);

    /* -- a shortcut beats a longer direct edge: A>C direct 10, A>B>C = 2+1 = 3 -- */
    reset();
    wedge("A", "B", 2); wedge("B", "C", 1); wedge("A", "C", 10);
    dijkstra(&g, 0);
    int c = find_or_add_vertex(&g, "C");
    CHECK_EQ_INT(dist_of[c], 3);
    CHECK_EQ_INT(parent_of[c], find_or_add_vertex(&g, "B"));

    /* -- unreachable vertex stays at INF -- */
    reset();
    wedge("A", "B", 1);
    find_or_add_vertex(&g, "Z");   /* no edge in */
    dijkstra(&g, 0);
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "Z")], INF);

    /* -- zero-weight edge is valid and does not break relaxation -- */
    reset();
    wedge("A", "B", 0); wedge("B", "C", 5);
    dijkstra(&g, 0);
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "C")], 5);

    /* -- diamond: two equal-length paths, both give the same shortest distance -- */
    reset();
    wedge("A", "B", 2); wedge("A", "C", 2); wedge("B", "D", 3); wedge("C", "D", 3);
    dijkstra(&g, 0);
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "D")], 5);

    /* -- min_dist_vertex returns -1 when everyone is done -- */
    for (int i = 0; i < MAX_V; i++) { dist_of[i] = INF; done[i] = 0; }
    done[0] = 1;
    CHECK_EQ_INT(min_dist_vertex(1), -1);

    /* -- min_dist_vertex ignores INF entries -- */
    for (int i = 0; i < MAX_V; i++) done[i] = 0;
    dist_of[0] = INF; dist_of[1] = 4; dist_of[2] = INF;
    CHECK_EQ_INT(min_dist_vertex(3), 1);

    /* -- larger graph: a 5-vertex chain accumulates distance correctly, and the parent
     *    chain, walked backwards from E, retraces the whole path to A -- */
    reset();
    wedge("A", "B", 1); wedge("B", "C", 2); wedge("C", "D", 3); wedge("D", "E", 4);
    dijkstra(&g, 0);
    int e = find_or_add_vertex(&g, "E"), d = find_or_add_vertex(&g, "D");
    CHECK_EQ_INT(dist_of[e], 10);
    CHECK_EQ_INT(parent_of[e], d);
    CHECK_EQ_INT(parent_of[d], find_or_add_vertex(&g, "C"));

    /* -- min_dist_vertex: everything still INF (nothing reachable yet) also returns -1 -- */
    for (int i = 0; i < MAX_V; i++) { dist_of[i] = INF; done[i] = 0; }
    CHECK_EQ_INT(min_dist_vertex(3), -1);

    /* -- starting from a non-A vertex still works -- */
    reset();
    wedge("A", "B", 1); wedge("B", "C", 1);
    int b = find_or_add_vertex(&g, "B");
    dijkstra(&g, b);
    CHECK_EQ_INT(dist_of[b], 0);
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "C")], 1);
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "A")], INF);   /* directed: can't go backwards */

    free_graph(&g);
    TEST_SUMMARY();
}
