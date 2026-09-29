/* Unit tests for week-05 c/bfs.c
 * Independent oracle: BFS levels below are hand-traced by walking the alphabetically-sorted adjacency
 * lists breadth by breadth on paper, never read back from bfs()'s own output. The circular-queue wrap
 * test drives enqueue/dequeue directly, independent of bfs(). */
#define main program_main
#include "../../c/bfs.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* -- enqueue/dequeue: basic FIFO -- */
    front = rear = count = 0;
    enqueue(10); enqueue(20); enqueue(30);
    CHECK_EQ_INT(dequeue(), 10);
    CHECK_EQ_INT(dequeue(), 20);
    CHECK_EQ_INT(dequeue(), 30);
    CHECK_EQ_INT(count, 0);

    /* -- enqueue/dequeue: circular wraparound past MAX_V -- */
    front = rear = 30; count = 0;   /* MAX_V == 32: rear will wrap 30,31,0,1,2 */
    enqueue(100); enqueue(101); enqueue(102); enqueue(103); enqueue(104);
    CHECK_EQ_INT(rear, 3);          /* (30 + 5) % 32 == 3 */
    CHECK_EQ_INT(dequeue(), 100);
    CHECK_EQ_INT(dequeue(), 101);
    CHECK_EQ_INT(dequeue(), 102);
    CHECK_EQ_INT(dequeue(), 103);
    CHECK_EQ_INT(dequeue(), 104);
    CHECK_EQ_INT(count, 0);

    /* -- normal: 7 vertices, undirected, start A -- hand-traced BFS levels -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
            {"E", "F"}, {"F", "G"}, {"G", "A"},
            {"A", "D"}, {"B", "E"}, {"C", "F"}
        };
        Graph g;
        build_graph(&g, 0, edges, 10);
        int start = find_or_add_vertex(&g, "A");
        front = rear = count = 0;
        bfs(&g, start);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "A")], 0);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "B")], 1);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "D")], 1);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "G")], 1);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "C")], 2);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "E")], 2);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "F")], 2);
        for (int i = 0; i < g.vertex_count; i++) CHECK(visited[i]);
        free_graph(&g);
    }

    /* -- hard: 8 vertices, DIRECTED, start P -- hand-traced BFS levels, only forward edges followed -- */
    {
        EdgeIn edges[] = {
            {"P", "Q"}, {"P", "R"}, {"Q", "S"}, {"R", "S"},
            {"S", "T"}, {"T", "U"}, {"T", "V"}, {"U", "W"},
            {"V", "W"}, {"Q", "T"}, {"R", "U"}, {"W", "P"}
        };
        Graph g;
        build_graph(&g, 1, edges, 12);
        int start = find_or_add_vertex(&g, "P");
        front = rear = count = 0;
        bfs(&g, start);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "P")], 0);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "Q")], 1);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "R")], 1);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "S")], 2);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "T")], 2);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "U")], 2);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "V")], 3);
        CHECK_EQ_INT(level_of[find_or_add_vertex(&g, "W")], 3);
        for (int i = 0; i < g.vertex_count; i++) CHECK(visited[i]);
        free_graph(&g);
    }

    /* -- edge: 9 vertices, 2 components -- G, H, I never visited from A -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
            {"E", "F"}, {"F", "A"}, {"A", "D"},
            {"G", "H"}, {"H", "I"}, {"I", "G"}
        };
        Graph g;
        build_graph(&g, 0, edges, 9);
        int start = find_or_add_vertex(&g, "A");
        front = rear = count = 0;
        bfs(&g, start);
        CHECK(visited[find_or_add_vertex(&g, "A")]);
        CHECK(visited[find_or_add_vertex(&g, "F")]);
        CHECK(!visited[find_or_add_vertex(&g, "G")]);
        CHECK(!visited[find_or_add_vertex(&g, "H")]);
        CHECK(!visited[find_or_add_vertex(&g, "I")]);
        free_graph(&g);
    }

    /* -- edge: single vertex with a self-loop -- self-loop adds no traversal edge; the lone vertex is
     * still level 0 and reached by starting there -- */
    {
        EdgeIn edges[] = { {"A", "A"} };
        Graph g;
        build_graph(&g, 0, edges, 1);
        CHECK_EQ_INT(g.vertex_count, 1);
        int start = find_or_add_vertex(&g, "A");
        front = rear = count = 0;
        bfs(&g, start);
        CHECK_EQ_INT(level_of[0], 0);
        CHECK(visited[0]);
        free_graph(&g);
    }

    TEST_SUMMARY();
}
