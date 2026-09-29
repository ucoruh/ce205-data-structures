/* Unit tests for week-09 c/topological_sort_dfs.c */
#define main program_main
#include "../../c/topological_sort_dfs.c"
#undef main
#include "../../../test_check.h"

static Graph g;
static void reset(void) { free_graph(&g); g.vertex_count = 0; for (int i = 0; i < MAX_V; i++) g.adj[i] = NULL; }
static void edge(const char *a, const char *b) {
    int x = find_or_add_vertex(&g, a), y = find_or_add_vertex(&g, b);
    if (x != y) add_neighbour_sorted(&g, x, y);
}

int main(void) {
    /* -- empty graph -- */
    reset();
    topo_sort_dfs(&g);
    CHECK_EQ_INT(finish_len, 0);
    CHECK(!has_cycle);

    /* -- single vertex -- */
    reset();
    find_or_add_vertex(&g, "A");
    topo_sort_dfs(&g);
    CHECK_EQ_INT(finish_len, 1);
    CHECK(!has_cycle);

    /* -- self-loop only: still a single vertex, no cycle flagged (self-loop not added as an edge) -- */
    reset();
    edge("A", "A");
    topo_sort_dfs(&g);
    CHECK_EQ_INT(finish_len, 1);
    CHECK(!has_cycle);

    /* -- simple chain A>B>C: finish order is C,B,A (C finishes first) -- */
    reset();
    edge("A", "B"); edge("B", "C");
    topo_sort_dfs(&g);
    CHECK(!has_cycle);
    CHECK_EQ_INT(finish_len, 3);
    CHECK_EQ_INT(finish[0], 2); CHECK_EQ_INT(finish[1], 1); CHECK_EQ_INT(finish[2], 0);

    /* -- diamond: A>B, A>C, B>D, C>D -- topo order (finish reversed) starts at A, ends at D -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D");
    topo_sort_dfs(&g);
    CHECK(!has_cycle);
    CHECK_EQ_INT(finish[finish_len - 1], 0);  /* A finishes last -> first in topo order */
    CHECK_EQ_INT(finish[0], 3);               /* D finishes first -> last in topo order */

    /* -- 3-cycle: A>B>C>A -- a back edge is found -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("C", "A");
    topo_sort_dfs(&g);
    CHECK(has_cycle);

    /* -- 2-cycle: A>B, B>A -- */
    reset();
    edge("A", "B"); edge("B", "A");
    topo_sort_dfs(&g);
    CHECK(has_cycle);

    /* -- acyclic graph with a shared descendant is NOT flagged as a cycle -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("B", "C");
    topo_sort_dfs(&g);
    CHECK(!has_cycle);

    /* -- disconnected: A>B and X>Y, two DFS trees -- */
    reset();
    edge("A", "B"); edge("X", "Y");
    topo_sort_dfs(&g);
    CHECK(!has_cycle);
    CHECK_EQ_INT(finish_len, 4);

    /* -- forward edge in a directed graph (not a cycle): A>B, A>C, B>C -- */
    reset();
    edge("A", "B"); edge("B", "C"); edge("A", "C");
    topo_sort_dfs(&g);
    CHECK(!has_cycle);
    CHECK_EQ_INT(finish_len, 3);

    /* -- larger DAG matching the program's "normal" scenario -- */
    reset();
    edge("A", "B"); edge("A", "C"); edge("B", "D"); edge("C", "D"); edge("D", "E");
    edge("C", "F"); edge("E", "G"); edge("F", "G"); edge("G", "H"); edge("B", "E");
    topo_sort_dfs(&g);
    CHECK(!has_cycle);
    CHECK_EQ_INT(finish_len, 8);
    int pos[MAX_V];
    for (int i = 0; i < finish_len; i++) pos[finish[finish_len - 1 - i]] = i;  /* topo position */
    CHECK(pos[find_or_add_vertex(&g, "A")] < pos[find_or_add_vertex(&g, "B")]);
    CHECK(pos[find_or_add_vertex(&g, "G")] < pos[find_or_add_vertex(&g, "H")]);

    free_graph(&g);
    TEST_SUMMARY();
}
