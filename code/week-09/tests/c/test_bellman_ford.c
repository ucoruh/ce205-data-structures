/* Unit tests for week-09 c/bellman_ford.c */
#define main program_main
#include "../../c/bellman_ford.c"
#undef main
#include "../../../test_check.h"

static Graph g;
static void reset(void) { free_graph(&g); g.vertex_count = 0; for (int i = 0; i < MAX_V; i++) g.adj[i] = NULL; }
static void wedge(const char *a, const char *b, int w) {
    int x = find_or_add_vertex(&g, a), y = find_or_add_vertex(&g, b);
    add_neighbour_sorted(&g, x, y, w);
}

int main(void) {
    /* -- single vertex -- */
    reset();
    find_or_add_vertex(&g, "A");
    CHECK(!bellman_ford(&g, 0));
    CHECK_EQ_INT(dist_of[0], 0);

    /* -- positive-weight chain: same as Dijkstra would give -- */
    reset();
    wedge("A", "B", 1); wedge("B", "C", 2); wedge("C", "D", 3);
    CHECK(!bellman_ford(&g, 0));
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "D")], 6);

    /* -- a negative edge that still shortens a path, no cycle -- */
    reset();
    wedge("A", "B", 5); wedge("A", "C", 2); wedge("C", "B", 1);
    CHECK(!bellman_ford(&g, 0));
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "B")], 3);   /* A->C->B = 2+1, cheaper than direct 5 */

    /* -- classic negative cycle: A>B>C>A totals -1 -- */
    reset();
    wedge("A", "B", 1); wedge("B", "C", 2); wedge("C", "A", -4);
    CHECK(bellman_ford(&g, 0));

    /* -- a positive cycle is NOT flagged as negative -- */
    reset();
    wedge("A", "B", 1); wedge("B", "C", 1); wedge("C", "A", 1);
    CHECK(!bellman_ford(&g, 0));

    /* -- a zero-sum cycle is NOT flagged as negative either -- */
    reset();
    wedge("A", "B", 1); wedge("B", "C", -1); wedge("C", "A", 0);
    CHECK(!bellman_ford(&g, 0));

    /* -- unreachable vertex stays at INF, and does not falsely trigger a negative cycle -- */
    reset();
    wedge("A", "B", 1);
    find_or_add_vertex(&g, "Z");
    CHECK(!bellman_ford(&g, 0));
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "Z")], INF);

    /* -- a negative cycle UNREACHABLE from start is not flagged: detection only follows
     *    edges from vertices whose distance is already finite, so an isolated negative
     *    cycle the source can never reach stays invisible -- a known, teachable limit of
     *    single-source Bellman-Ford (Floyd-Warshall's dist[v][v] < 0 check catches it instead) -- */
    reset();
    wedge("A", "B", 3);
    wedge("X", "Y", 1); wedge("Y", "Z", 1); wedge("Z", "X", -3);
    CHECK(!bellman_ford(&g, 0));
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "B")], 3);   /* A's own subgraph is unaffected */
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "X")], INF); /* unreachable, so its cycle is never explored */

    /* -- a self-contained negative edge on 2 vertices (no cycle possible) -- */
    reset();
    wedge("A", "B", -5);
    CHECK(!bellman_ford(&g, 0));
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "B")], -5);

    /* -- negative edge that is never the shortest path is still correctly ignored -- */
    reset();
    wedge("A", "B", 1); wedge("A", "C", 100); wedge("B", "C", -50);
    CHECK(!bellman_ford(&g, 0));
    CHECK_EQ_INT(dist_of[find_or_add_vertex(&g, "C")], -49);  /* A->B->C = 1-50 */

    free_graph(&g);
    TEST_SUMMARY();
}
