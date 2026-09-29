/* Unit tests for week-05 c/dfs_recursive.c
 * Independent oracle: every disc_time/fin_time/parent_of value and the preorder below is hand-traced by
 * walking the alphabetically-sorted adjacency lists on paper (recursion order, clock tick by clock tick),
 * never read back from dfs()'s own output. The edge classification itself is only printed (not stored),
 * so these tests check the state dfs_visit() actually computes: discovery/finish times, parent pointers
 * and the derived preorder, which together fully determine which edges were tree/back/forward/cross. */
#define main program_main
#include "../../c/dfs_recursive.c"
#undef main
#include "../../../test_check.h"

static void preorder_of(Graph *g, int order_out[]) {
    for (int i = 0; i < g->vertex_count; i++) order_out[i] = i;
    for (int i = 1; i < g->vertex_count; i++) {
        int key = order_out[i], j = i - 1;
        while (j >= 0 && disc_time[order_out[j]] > disc_time[key]) { order_out[j + 1] = order_out[j]; j--; }
        order_out[j + 1] = key;
    }
}

int main(void) {
    /* -- normal: 7 vertices, undirected, one long recursive chain A..G -- hand-traced disc/fin -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"},
            {"E", "F"}, {"F", "G"}, {"G", "A"},
            {"A", "D"}, {"B", "E"}, {"C", "F"}
        };
        Graph g;
        build_graph(&g, 0, edges, 10);
        clock_ = 0;
        dfs(&g);
        int A = find_or_add_vertex(&g, "A"), B = find_or_add_vertex(&g, "B"), C = find_or_add_vertex(&g, "C");
        int D = find_or_add_vertex(&g, "D"), E = find_or_add_vertex(&g, "E"), F = find_or_add_vertex(&g, "F");
        int G = find_or_add_vertex(&g, "G");
        CHECK_EQ_INT(disc_time[A], 1); CHECK_EQ_INT(fin_time[A], 14);
        CHECK_EQ_INT(disc_time[B], 2); CHECK_EQ_INT(fin_time[B], 13);
        CHECK_EQ_INT(disc_time[C], 3); CHECK_EQ_INT(fin_time[C], 12);
        CHECK_EQ_INT(disc_time[D], 4); CHECK_EQ_INT(fin_time[D], 11);
        CHECK_EQ_INT(disc_time[E], 5); CHECK_EQ_INT(fin_time[E], 10);
        CHECK_EQ_INT(disc_time[F], 6); CHECK_EQ_INT(fin_time[F], 9);
        CHECK_EQ_INT(disc_time[G], 7); CHECK_EQ_INT(fin_time[G], 8);
        CHECK_EQ_INT(parent_of[B], A); CHECK_EQ_INT(parent_of[C], B); CHECK_EQ_INT(parent_of[D], C);
        CHECK_EQ_INT(parent_of[E], D); CHECK_EQ_INT(parent_of[F], E); CHECK_EQ_INT(parent_of[G], F);
        int order[MAX_V];
        preorder_of(&g, order);
        int expected_order[] = {A, B, C, D, E, F, G};
        int order_ok = 1;
        for (int i = 0; i < 7; i++) if (order[i] != expected_order[i]) order_ok = 0;
        CHECK(order_ok);
        for (int i = 0; i < g.vertex_count; i++) CHECK_EQ_INT(color_of[i], 2);   /* every vertex finished black */
        free_graph(&g);
    }

    /* -- hard: 6 vertices, directed, tree/back/forward/cross edges all present -- hand-traced disc/fin -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"A", "D"}, {"A", "E"},
            {"B", "C"}, {"C", "A"},
            {"D", "E"}, {"D", "F"},
            {"E", "B"}, {"E", "F"}, {"F", "C"}
        };
        Graph g;
        build_graph(&g, 1, edges, 10);
        clock_ = 0;
        dfs(&g);
        int A = find_or_add_vertex(&g, "A"), B = find_or_add_vertex(&g, "B"), C = find_or_add_vertex(&g, "C");
        int D = find_or_add_vertex(&g, "D"), E = find_or_add_vertex(&g, "E"), F = find_or_add_vertex(&g, "F");
        CHECK_EQ_INT(disc_time[A], 1);  CHECK_EQ_INT(fin_time[A], 12);
        CHECK_EQ_INT(disc_time[B], 2);  CHECK_EQ_INT(fin_time[B], 5);
        CHECK_EQ_INT(disc_time[C], 3);  CHECK_EQ_INT(fin_time[C], 4);
        CHECK_EQ_INT(disc_time[D], 6);  CHECK_EQ_INT(fin_time[D], 11);
        CHECK_EQ_INT(disc_time[E], 7);  CHECK_EQ_INT(fin_time[E], 10);
        CHECK_EQ_INT(disc_time[F], 8);  CHECK_EQ_INT(fin_time[F], 9);
        CHECK_EQ_INT(parent_of[B], A); CHECK_EQ_INT(parent_of[C], B); CHECK_EQ_INT(parent_of[D], A);
        CHECK_EQ_INT(parent_of[E], D); CHECK_EQ_INT(parent_of[F], E);
        int order[MAX_V];
        preorder_of(&g, order);
        int expected_order[] = {A, B, C, D, E, F};
        int order_ok = 1;
        for (int i = 0; i < 6; i++) if (order[i] != expected_order[i]) order_ok = 0;
        CHECK(order_ok);
        free_graph(&g);
    }

    /* -- edge: 10 vertices, undirected, 2 components -- a DFS FOREST -- hand-traced disc/fin -- */
    {
        EdgeIn edges[] = {
            {"A", "B"}, {"B", "C"}, {"C", "D"}, {"D", "E"}, {"E", "F"},
            {"G", "H"}, {"H", "I"}, {"I", "G"}, {"G", "J"}, {"H", "J"}
        };
        Graph g;
        build_graph(&g, 0, edges, 10);
        clock_ = 0;
        dfs(&g);
        int A = find_or_add_vertex(&g, "A"), F = find_or_add_vertex(&g, "F");
        int G = find_or_add_vertex(&g, "G"), H = find_or_add_vertex(&g, "H");
        int I = find_or_add_vertex(&g, "I"), J = find_or_add_vertex(&g, "J");
        CHECK_EQ_INT(disc_time[A], 1);  CHECK_EQ_INT(fin_time[A], 12);
        CHECK_EQ_INT(disc_time[F], 6);  CHECK_EQ_INT(fin_time[F], 7);
        CHECK_EQ_INT(disc_time[G], 13); CHECK_EQ_INT(fin_time[G], 20);   /* second tree starts a fresh clock run */
        CHECK_EQ_INT(disc_time[H], 14); CHECK_EQ_INT(fin_time[H], 19);
        CHECK_EQ_INT(disc_time[I], 15); CHECK_EQ_INT(fin_time[I], 16);
        CHECK_EQ_INT(disc_time[J], 17); CHECK_EQ_INT(fin_time[J], 18);
        CHECK_EQ_INT(parent_of[H], G);   /* second tree: G is the root, H its child */
        CHECK_EQ_INT(parent_of[I], H);
        CHECK_EQ_INT(parent_of[J], H);   /* G's OTHER child, visited after I's whole subtree finished */
        int order[MAX_V];
        preorder_of(&g, order);
        char *expected_labels[] = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"};
        int order_ok = 1;
        for (int i = 0; i < 10; i++) if (strcmp(g.label[order[i]], expected_labels[i]) != 0) order_ok = 0;
        CHECK(order_ok);
        for (int i = 0; i < g.vertex_count; i++) CHECK_EQ_INT(color_of[i], 2);
        free_graph(&g);
    }

    /* -- edge: a single vertex with a self-loop -- must classify it as a BACK edge (a trivial cycle) and
     * terminate, never recurse infinitely -- */
    {
        EdgeIn edges[] = { {"A", "A"} };
        Graph g;
        build_graph(&g, 0, edges, 1);
        CHECK_EQ_INT(g.vertex_count, 1);
        clock_ = 0;
        dfs(&g);
        CHECK_EQ_INT(disc_time[0], 1);
        CHECK_EQ_INT(fin_time[0], 2);
        CHECK_EQ_INT(color_of[0], 2);
        free_graph(&g);
    }

    TEST_SUMMARY();
}
