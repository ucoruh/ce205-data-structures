/* Unit tests for week-05 c/connected_components.c
 * Independent oracle: expected component groupings and counts are hand-computed from the edge list
 * (which vertices are reachable from which, treating direction as ignored, exactly as the program's own
 * comment promises), never read back from count_components()'s own output. */
#define main program_main
#include "../../c/connected_components.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* -- bfs_label, called directly: labels only the reachable component, leaves the rest untouched (-1) -- */
    {
        EdgeIn edges[] = { {"A", "B"}, {"B", "C"}, {"D", "E"} };   /* two components: {A,B,C} and {D,E} */
        Graph g;
        build_graph(&g, edges, 3);
        for (int i = 0; i < g.vertex_count; i++) comp_of[i] = -1;
        int a = find_or_add_vertex(&g, "A");
        bfs_label(&g, a, 42);
        CHECK_EQ_INT(comp_of[find_or_add_vertex(&g, "A")], 42);
        CHECK_EQ_INT(comp_of[find_or_add_vertex(&g, "B")], 42);
        CHECK_EQ_INT(comp_of[find_or_add_vertex(&g, "C")], 42);
        CHECK_EQ_INT(comp_of[find_or_add_vertex(&g, "D")], -1);   /* untouched: different component */
        CHECK_EQ_INT(comp_of[find_or_add_vertex(&g, "E")], -1);
        free_graph(&g);
    }

    /* -- normal: 10 vertices, undirected, 2 components (two separate 5-cycles) -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"}, {"E", "A"},
            {"F", "G"}, {"G", "H"}, {"H", "I"}, {"I", "J"}, {"J", "F"}
        };
        Graph g;
        build_graph(&g, edges, 10);
        int total = count_components(&g);
        CHECK_EQ_INT(total, 2);
        int a = find_or_add_vertex(&g, "A"), e = find_or_add_vertex(&g, "E");
        int f = find_or_add_vertex(&g, "F"), j = find_or_add_vertex(&g, "J");
        CHECK_EQ_INT(comp_of[a], comp_of[e]);       /* A..E all in the same 5-cycle */
        CHECK_EQ_INT(comp_of[f], comp_of[j]);       /* F..J all in the other 5-cycle */
        CHECK(comp_of[a] != comp_of[f]);            /* the two cycles are different components */
        CHECK_EQ_INT(comp_of[a], 0);                /* A, first vertex created, starts component 0 */
        free_graph(&g);
    }

    /* -- hard: 10 vertices, DIRECTED, 3 weak components (each a directed cycle) -- direction is ignored -- */
    {
        EdgeIn edges[] = {
            {"P", "Q"}, {"Q", "R"}, {"R", "S"}, {"S", "P"},
            {"T", "U"}, {"U", "V"}, {"V", "T"},
            {"W", "X"}, {"X", "Y"}, {"Y", "W"}
        };
        Graph g;
        build_graph(&g, edges, 10);
        int total = count_components(&g);
        CHECK_EQ_INT(total, 3);
        int p = find_or_add_vertex(&g, "P"), s = find_or_add_vertex(&g, "S");
        int t = find_or_add_vertex(&g, "T"), w = find_or_add_vertex(&g, "W");
        CHECK_EQ_INT(comp_of[p], comp_of[s]);
        CHECK(comp_of[p] != comp_of[t]);
        CHECK(comp_of[t] != comp_of[w]);
        CHECK(comp_of[p] != comp_of[w]);
        free_graph(&g);
    }

    /* -- edge: 12 vertices, undirected, 4 separate triangle components -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"B", "C"}, {"C", "A"},
            {"D", "E"}, {"E", "F"}, {"F", "D"},
            {"G", "H"}, {"H", "I"}, {"I", "G"},
            {"J", "K"}, {"K", "L"}, {"L", "J"}
        };
        Graph g;
        build_graph(&g, edges, 12);
        int total = count_components(&g);
        CHECK_EQ_INT(total, 4);
        int labels_ids[12];
        const char *names[] = {"A","B","C","D","E","F","G","H","I","J","K","L"};
        for (int i = 0; i < 12; i++) labels_ids[i] = comp_of[find_or_add_vertex(&g, names[i])];
        for (int i = 0; i < 3; i++) CHECK_EQ_INT(labels_ids[i], labels_ids[0]);         /* A,B,C together */
        for (int i = 3; i < 6; i++) CHECK_EQ_INT(labels_ids[i], labels_ids[3]);         /* D,E,F together */
        for (int i = 6; i < 9; i++) CHECK_EQ_INT(labels_ids[i], labels_ids[6]);         /* G,H,I together */
        for (int i = 9; i < 12; i++) CHECK_EQ_INT(labels_ids[i], labels_ids[9]);        /* J,K,L together */
        CHECK(labels_ids[0] != labels_ids[3]);
        CHECK(labels_ids[0] != labels_ids[6]);
        CHECK(labels_ids[0] != labels_ids[9]);
        CHECK(labels_ids[3] != labels_ids[6]);
        free_graph(&g);
    }

    /* -- edge: a single vertex with a self-loop: one component -- */
    {
        EdgeIn edges[] = { {"A", "A"} };
        Graph g;
        build_graph(&g, edges, 1);
        CHECK_EQ_INT(g.vertex_count, 1);
        CHECK_EQ_INT(count_components(&g), 1);
        free_graph(&g);
    }

    /* -- mixed: a connected pair plus a fully isolated vertex added directly (no edge at all) -- */
    {
        EdgeIn edges[] = { {"A", "B"} };
        Graph g;
        build_graph(&g, edges, 1);
        int z = find_or_add_vertex(&g, "Z");   /* isolated: never appears in any edge */
        int total = count_components(&g);
        CHECK_EQ_INT(total, 2);
        int a = find_or_add_vertex(&g, "A"), b = find_or_add_vertex(&g, "B");
        CHECK_EQ_INT(comp_of[a], comp_of[b]);
        CHECK(comp_of[a] != comp_of[z]);
        free_graph(&g);
    }

    TEST_SUMMARY();
}
