/* Unit tests for week-05 c/dfs_iterative.c
 * Independent oracle: expected visit orders below are hand-traced by simulating the explicit LIFO stack
 * on paper, push by push and pop by pop (cross-checked against the same graphs' recursive DFS preorder
 * hand-traced independently in test_dfs_recursive.c, since the file's own comment claims they match),
 * never read back from dfs()'s own output. */
#define main program_main
#include "../../c/dfs_iterative.c"
#undef main
#include "../../../test_check.h"

static int order_matches(Graph *g, const char *expected[], int n) {
    if (order_len != n) return 0;
    for (int i = 0; i < n; i++) if (strcmp(g->label[order[i]], expected[i]) != 0) return 0;
    return 1;
}

int main(void) {
    /* -- push/pop: basic LIFO -- */
    top = -1;
    push(7); push(8); push(9);
    CHECK_EQ_INT(pop(), 9);
    CHECK_EQ_INT(pop(), 8);
    CHECK_EQ_INT(pop(), 7);
    CHECK_EQ_INT(top, -1);

    /* -- add_neighbour_sorted: adjacency row stays ascending regardless of insertion order -- */
    {
        Graph g;
        g.vertex_count = 0;
        int v = find_or_add_vertex(&g, "V");
        find_or_add_vertex(&g, "C");
        find_or_add_vertex(&g, "A");
        find_or_add_vertex(&g, "B");
        add_neighbour_sorted(&g, v, 1);   /* "C" */
        add_neighbour_sorted(&g, v, 3);   /* "B" */
        add_neighbour_sorted(&g, v, 2);   /* "A" */
        CHECK_EQ_INT(g.adj_count[v], 3);
        CHECK(strcmp(g.label[g.adj[v][0]], "A") == 0);
        CHECK(strcmp(g.label[g.adj[v][1]], "B") == 0);
        CHECK(strcmp(g.label[g.adj[v][2]], "C") == 0);
    }

    /* -- normal: 7 vertices, undirected -- hand-traced stack order matches dfs_recursive's preorder -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
            {"E", "F"}, {"F", "G"}, {"G", "A"},
            {"A", "D"}, {"B", "E"}, {"C", "F"}
        };
        Graph g;
        build_graph(&g, 0, edges, 10);
        top = -1;
        order_len = 0;
        dfs(&g);
        const char *expected[] = {"A", "B", "C", "D", "E", "F", "G"};
        CHECK(order_matches(&g, expected, 7));
        for (int i = 0; i < g.vertex_count; i++) CHECK(visited[i]);
    }

    /* -- hard: 6 vertices, directed, includes real branching at D (two unvisited neighbours at once) -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"A", "D"}, {"A", "E"},
            {"B", "C"}, {"C", "A"},
            {"D", "E"}, {"D", "F"},
            {"E", "B"}, {"E", "F"}, {"F", "C"}
        };
        Graph g;
        build_graph(&g, 1, edges, 10);
        top = -1;
        order_len = 0;
        dfs(&g);
        const char *expected[] = {"A", "B", "C", "D", "E", "F"};
        CHECK(order_matches(&g, expected, 6));
    }

    /* -- edge: 10 vertices, undirected, 2 components (a triangle-containing second component: real
     * branching at G and H) -- a DFS FOREST -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"}, {"E", "F"},
            {"G", "H"}, {"H", "I"}, {"I", "G"}, {"G", "J"}, {"H", "J"}
        };
        Graph g;
        build_graph(&g, 0, edges, 10);
        top = -1;
        order_len = 0;
        dfs(&g);
        const char *expected[] = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"};
        CHECK(order_matches(&g, expected, 10));
        for (int i = 0; i < g.vertex_count; i++) CHECK(visited[i]);
    }

    /* -- edge: a single vertex with a self-loop -- must not push itself again (visited is set before the
     * neighbour scan) and must not infinite-loop -- */
    {
        EdgeIn edges[] = { {"A", "A"} };
        Graph g;
        build_graph(&g, 0, edges, 1);
        CHECK_EQ_INT(g.vertex_count, 1);
        top = -1;
        order_len = 0;
        dfs(&g);
        CHECK_EQ_INT(order_len, 1);
        CHECK(strcmp(g.label[order[0]], "A") == 0);
        CHECK(visited[0]);
    }

    /* -- two vertices, single directed edge: only the source has an outgoing edge -- */
    {
        EdgeIn edges[] = { {"A", "B"} };
        Graph g;
        build_graph(&g, 1, edges, 1);
        top = -1;
        order_len = 0;
        dfs(&g);
        const char *expected[] = {"A", "B"};
        CHECK(order_matches(&g, expected, 2));
    }

    TEST_SUMMARY();
}
