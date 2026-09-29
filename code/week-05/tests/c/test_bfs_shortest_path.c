/* Unit tests for week-05 c/bfs_shortest_path.c
 * Independent oracle: expected shortest paths are hand-traced by walking the alphabetically-sorted
 * adjacency lists breadth by breadth on paper (same graphs as test_bfs.c, whose level numbers cross-check
 * the path lengths here), never read back from bfs_shortest_path()'s own output. */
#define main program_main
#include "../../c/bfs_shortest_path.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* -- normal: 7 vertices, undirected, A to F -- hand-traced: A -> G -> F, length 2 -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
            {"E", "F"}, {"F", "G"}, {"G", "A"},
            {"A", "D"}, {"B", "E"}, {"C", "F"}
        };
        Graph g;
        build_graph(&g, 0, edges, 10);
        int s = find_or_add_vertex(&g, "A"), t = find_or_add_vertex(&g, "F");
        int path[MAX_V];
        int len = bfs_shortest_path(&g, s, t, path);
        CHECK_EQ_INT(len, 2);
        CHECK_EQ_INT(path[0], find_or_add_vertex(&g, "A"));
        CHECK_EQ_INT(path[1], find_or_add_vertex(&g, "G"));
        CHECK_EQ_INT(path[2], find_or_add_vertex(&g, "F"));
        free_graph(&g);
    }

    /* -- hard: 8 vertices, directed, P to W -- hand-traced: P -> R -> U -> W, length 3 -- */
    {
        EdgeIn edges[] = {
            {"P", "Q"}, {"P", "R"}, {"Q", "S"}, {"R", "S"},
            {"S", "T"}, {"T", "U"}, {"T", "V"}, {"U", "W"},
            {"V", "W"}, {"Q", "T"}, {"R", "U"}, {"W", "P"}
        };
        Graph g;
        build_graph(&g, 1, edges, 12);
        int s = find_or_add_vertex(&g, "P"), t = find_or_add_vertex(&g, "W");
        int path[MAX_V];
        int len = bfs_shortest_path(&g, s, t, path);
        CHECK_EQ_INT(len, 3);
        CHECK_EQ_INT(path[0], find_or_add_vertex(&g, "P"));
        CHECK_EQ_INT(path[1], find_or_add_vertex(&g, "R"));
        CHECK_EQ_INT(path[2], find_or_add_vertex(&g, "U"));
        CHECK_EQ_INT(path[3], find_or_add_vertex(&g, "W"));
        free_graph(&g);
    }

    /* -- edge: 9 vertices, NO PATH from A to H (2 separate components) -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
            {"E", "F"}, {"F", "A"}, {"A", "D"},
            {"G", "H"}, {"H", "I"}, {"I", "G"}
        };
        Graph g;
        build_graph(&g, 0, edges, 9);
        int s = find_or_add_vertex(&g, "A"), t = find_or_add_vertex(&g, "H");
        int path[MAX_V];
        CHECK_EQ_INT(bfs_shortest_path(&g, s, t, path), -1);
        free_graph(&g);
    }

    /* -- s == t, multi-vertex graph: length 0, single-element path -- */
    {
        EdgeIn edges[] = { {"A", "B"}, {"B", "C"} };
        Graph g;
        build_graph(&g, 0, edges, 2);
        int s = find_or_add_vertex(&g, "A"), t = s;
        int path[MAX_V];
        int len = bfs_shortest_path(&g, s, t, path);
        CHECK_EQ_INT(len, 0);
        CHECK_EQ_INT(path[0], s);
        free_graph(&g);
    }

    /* -- edge: single vertex with a self-loop, s == t: length 0 -- */
    {
        EdgeIn edges[] = { {"A", "A"} };
        Graph g;
        build_graph(&g, 0, edges, 1);
        int s = find_or_add_vertex(&g, "A"), t = find_or_add_vertex(&g, "A");
        int path[MAX_V];
        int len = bfs_shortest_path(&g, s, t, path);
        CHECK_EQ_INT(len, 0);
        CHECK_EQ_INT(path[0], 0);
        free_graph(&g);
    }

    /* -- 3 vertices, A-B connected, C isolated (added directly, no edge): not found -- */
    {
        EdgeIn edges[] = { {"A", "B"} };
        Graph g;
        build_graph(&g, 0, edges, 1);
        int c = find_or_add_vertex(&g, "C");   /* isolated: never connected to A or B */
        int s = find_or_add_vertex(&g, "A");
        int path[MAX_V];
        CHECK_EQ_INT(bfs_shortest_path(&g, s, c, path), -1);
        free_graph(&g);
    }

    /* -- two vertices, single undirected edge: length 1 -- */
    {
        EdgeIn edges[] = { {"A", "B"} };
        Graph g;
        build_graph(&g, 0, edges, 1);
        int s = find_or_add_vertex(&g, "A"), t = find_or_add_vertex(&g, "B");
        int path[MAX_V];
        int len = bfs_shortest_path(&g, s, t, path);
        CHECK_EQ_INT(len, 1);
        CHECK_EQ_INT(path[0], s);
        CHECK_EQ_INT(path[1], t);
        free_graph(&g);
    }

    /* -- directed: forward path exists A->B->C, but the REVERSE has none (direction matters) -- */
    {
        EdgeIn edges[] = { {"A", "B"}, {"B", "C"} };
        Graph g;
        build_graph(&g, 1, edges, 2);
        int a = find_or_add_vertex(&g, "A"), c = find_or_add_vertex(&g, "C");
        int path[MAX_V];
        CHECK_EQ_INT(bfs_shortest_path(&g, a, c, path), 2);          /* forward: A -> B -> C */
        CHECK_EQ_INT(bfs_shortest_path(&g, c, a, path), -1);         /* reverse: unreachable */
        free_graph(&g);
    }

    TEST_SUMMARY();
}
