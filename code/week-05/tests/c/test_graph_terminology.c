/* Unit tests for week-05 c/graph_terminology.c
 * Independent oracle: expected degrees/cycle/component values below are hand-traced from the edge list
 * used to build each graph, never obtained by calling out_degree/in_degree/has_cycle/count_components
 * themselves. count_components is cross-checked with a separate union-find implementation written only
 * for this test (a different algorithm from the BFS the program uses). */
#define main program_main
#include "../../c/graph_terminology.c"
#undef main
#include "../../../test_check.h"

/* independent union-find, used only to cross-check count_components on undirected graphs */
static int uf_parent[MAX_V];
static int uf_find(int x) { while (uf_parent[x] != x) x = uf_parent[x]; return x; }
static void uf_union(int a, int b) { a = uf_find(a); b = uf_find(b); if (a != b) uf_parent[a] = b; }

static int uf_count_components(Graph *g, EdgeIn edges[], int n) {
    /* pass 1: create every vertex first, so uf_parent can be initialised for all of them before any union */
    for (int i = 0; i < n; i++) { find_or_add_vertex(g, edges[i].a); find_or_add_vertex(g, edges[i].b); }
    for (int i = 0; i < g->vertex_count; i++) uf_parent[i] = i;
    /* pass 2: union the endpoints of every edge */
    for (int i = 0; i < n; i++) {
        int ia = find_or_add_vertex(g, edges[i].a), ib = find_or_add_vertex(g, edges[i].b);
        uf_union(ia, ib);
    }
    int roots = 0;
    for (int i = 0; i < g->vertex_count; i++) if (uf_find(i) == i) roots++;
    return roots;
}

int main(void) {
    Graph g;

    /* -- directed path A->B->C plus an isolated vertex Z: hand-counted in/out degree -- */
    reset_graph(&g, 1);
    int a = find_or_add_vertex(&g, "A"), b = find_or_add_vertex(&g, "B"), c = find_or_add_vertex(&g, "C");
    int z = find_or_add_vertex(&g, "Z");
    append(&g, a, b, 1);
    append(&g, b, c, 1);
    CHECK_EQ_INT(out_degree(&g, a), 1);
    CHECK_EQ_INT(out_degree(&g, b), 1);
    CHECK_EQ_INT(out_degree(&g, c), 0);
    CHECK_EQ_INT(out_degree(&g, z), 0);
    CHECK_EQ_INT(in_degree(&g, a), 0);
    CHECK_EQ_INT(in_degree(&g, b), 1);
    CHECK_EQ_INT(in_degree(&g, c), 1);
    CHECK_EQ_INT(in_degree(&g, z), 0);
    free_graph(&g);

    /* -- undirected self-loop: A-A adds ONE edge entry (append is not mirrored for a==b) -- */
    reset_graph(&g, 0);
    add_edge_labelled(&g, "A", "A", 1);
    CHECK_EQ_INT(out_degree(&g, 0), 1);
    CHECK(has_cycle(&g));
    free_graph(&g);

    /* -- undirected multi-edge: A-B added twice -- both endpoints see degree 2 -- */
    reset_graph(&g, 0);
    add_edge_labelled(&g, "A", "B", 1);
    add_edge_labelled(&g, "A", "B", 5);
    CHECK_EQ_INT(out_degree(&g, 0), 2);
    CHECK_EQ_INT(out_degree(&g, 1), 2);
    free_graph(&g);

    /* -- has_cycle: undirected triangle -- */
    reset_graph(&g, 0);
    add_edge_labelled(&g, "A", "B", 1);
    add_edge_labelled(&g, "B", "C", 1);
    add_edge_labelled(&g, "C", "A", 1);
    CHECK(has_cycle(&g));
    free_graph(&g);

    /* -- has_cycle: undirected simple path -- no cycle -- */
    reset_graph(&g, 0);
    add_edge_labelled(&g, "A", "B", 1);
    add_edge_labelled(&g, "B", "C", 1);
    CHECK(!has_cycle(&g));
    free_graph(&g);

    /* -- has_cycle: directed cycle A->B->C->A -- */
    reset_graph(&g, 1);
    add_edge_labelled(&g, "A", "B", 1);
    add_edge_labelled(&g, "B", "C", 1);
    add_edge_labelled(&g, "C", "A", 1);
    CHECK(has_cycle(&g));
    free_graph(&g);

    /* -- has_cycle: directed acyclic path A->B->C -- no cycle even though the undirected version above IS one -- */
    reset_graph(&g, 1);
    add_edge_labelled(&g, "A", "B", 1);
    add_edge_labelled(&g, "B", "C", 1);
    CHECK(!has_cycle(&g));
    free_graph(&g);

    /* -- has_cycle: empty graph (0 vertices) -- */
    reset_graph(&g, 0);
    CHECK(!has_cycle(&g));
    {
        int comp_of[MAX_V];
        CHECK_EQ_INT(count_components(&g, comp_of), 0);
    }
    free_graph(&g);

    /* -- count_components: two disjoint triangles plus one isolated vertex -- hand count: 3 -- */
    reset_graph(&g, 0);
    add_edge_labelled(&g, "A", "B", 1);
    add_edge_labelled(&g, "B", "C", 1);
    add_edge_labelled(&g, "C", "A", 1);
    add_edge_labelled(&g, "D", "E", 1);
    add_edge_labelled(&g, "E", "F", 1);
    add_edge_labelled(&g, "F", "D", 1);
    find_or_add_vertex(&g, "Z");   /* isolated, no edges */
    {
        int comp_of[MAX_V];
        CHECK_EQ_INT(count_components(&g, comp_of), 3);
        CHECK(comp_of[0] == comp_of[1] && comp_of[1] == comp_of[2]);       /* A, B, C together */
        CHECK(comp_of[3] == comp_of[4] && comp_of[4] == comp_of[5]);       /* D, E, F together */
        CHECK(comp_of[0] != comp_of[3]);                                  /* different components */
        CHECK(comp_of[6] != comp_of[0] && comp_of[6] != comp_of[3]);      /* Z on its own */
    }
    free_graph(&g);

    /* -- count_components: single isolated vertex, no edges -- */
    reset_graph(&g, 0);
    find_or_add_vertex(&g, "Solo");
    {
        int comp_of[MAX_V];
        CHECK_EQ_INT(count_components(&g, comp_of), 1);
    }
    free_graph(&g);

    /* -- count_components: chain of 10 vertices -- connected, 1 component -- */
    reset_graph(&g, 0);
    {
        char prev[8] = "V1";
        find_or_add_vertex(&g, prev);
        for (int i = 2; i <= 10; i++) {
            char cur[8];
            snprintf(cur, sizeof cur, "V%d", i);
            add_edge_labelled(&g, prev, cur, 1);
            strcpy(prev, cur);
        }
        int comp_of[MAX_V];
        CHECK_EQ_INT(count_components(&g, comp_of), 1);
        CHECK(!has_cycle(&g));
    }
    free_graph(&g);

    /* -- count_components cross-checked against an independent union-find on a fresh 12-edge graph -- */
    {
        EdgeIn many[] = {
            {"A", "B", 1}, {"B", "C", 1}, {"C", "A", 1},
            {"D", "E", 1}, {"E", "F", 1}, {"F", "D", 1},
            {"G", "H", 1}, {"H", "I", 1}, {"I", "G", 1},
            {"J", "K", 1}, {"K", "L", 1}, {"L", "J", 1}
        };
        Graph g1, g2;
        reset_graph(&g1, 0);
        for (int i = 0; i < 12; i++) add_edge_labelled(&g1, many[i].a, many[i].b, many[i].weight);
        int comp_of[MAX_V];
        int found = count_components(&g1, comp_of);
        reset_graph(&g2, 0);
        int expected = uf_count_components(&g2, many, 12);
        CHECK_EQ_INT(found, expected);
        CHECK_EQ_INT(found, 4);
        free_graph(&g1);
        free_graph(&g2);
    }

    /* -- weak connectivity on a DIRECTED graph: two separate directed 3-cycles -- 2 components via undirected_neighbours -- */
    reset_graph(&g, 1);
    add_edge_labelled(&g, "P", "Q", 1);
    add_edge_labelled(&g, "Q", "R", 1);
    add_edge_labelled(&g, "R", "P", 1);
    add_edge_labelled(&g, "X", "Y", 1);
    add_edge_labelled(&g, "Y", "Z", 1);
    add_edge_labelled(&g, "Z", "X", 1);
    {
        int comp_of[MAX_V];
        CHECK_EQ_INT(count_components(&g, comp_of), 2);
        CHECK(has_cycle(&g));
    }
    free_graph(&g);

    /* -- full boundary: exactly MAX_V (16) vertices in a chain -- must not overflow -- */
    reset_graph(&g, 0);
    {
        char prev[8] = "N1";
        find_or_add_vertex(&g, prev);
        for (int i = 2; i <= MAX_V; i++) {
            char cur[8];
            snprintf(cur, sizeof cur, "N%d", i);
            add_edge_labelled(&g, prev, cur, 1);
            strcpy(prev, cur);
        }
        CHECK_EQ_INT(g.vertex_count, MAX_V);
        int comp_of[MAX_V];
        CHECK_EQ_INT(count_components(&g, comp_of), 1);
        CHECK(!has_cycle(&g));
    }
    free_graph(&g);

    /* -- undirected_neighbours: direct check of the neighbour list for a mid-degree vertex -- */
    reset_graph(&g, 0);
    add_edge_labelled(&g, "A", "B", 1);
    add_edge_labelled(&g, "A", "C", 1);
    add_edge_labelled(&g, "A", "D", 1);
    {
        int nb[2 * MAX_V];
        int n = undirected_neighbours(&g, 0, nb);
        CHECK_EQ_INT(n, 3);
    }
    free_graph(&g);

    TEST_SUMMARY();
}
