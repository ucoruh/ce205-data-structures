/* Unit tests for week-09 c/kruskal_mst.c */
#define main program_main
#include "../../c/kruskal_mst.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    Edge sorted[MAX_E], mst[MAX_E];
    int total;

    /* -- single edge: trivially the whole MST -- */
    vertex_count = 2;
    sorted[0] = (Edge) { 0, 1, 5, 0 };
    CHECK_EQ_INT(kruskal_mst(sorted, 1, mst, &total), 1);
    CHECK_EQ_INT(total, 5);
    CHECK_EQ_INT(mst[0].w, 5);

    /* -- triangle: the heaviest edge is always rejected (would close a cycle) -- */
    vertex_count = 3;
    sorted[0] = (Edge) { 0, 1, 1, 0 };
    sorted[1] = (Edge) { 1, 2, 2, 1 };
    sorted[2] = (Edge) { 0, 2, 3, 2 };
    CHECK_EQ_INT(kruskal_mst(sorted, 3, mst, &total), 2);
    CHECK_EQ_INT(total, 3);

    /* -- unsorted input: kruskal_mst sorts internally, same result either order -- */
    vertex_count = 3;
    sorted[0] = (Edge) { 0, 2, 3, 0 };
    sorted[1] = (Edge) { 0, 1, 1, 1 };
    sorted[2] = (Edge) { 1, 2, 2, 2 };
    CHECK_EQ_INT(kruskal_mst(sorted, 3, mst, &total), 2);
    CHECK_EQ_INT(total, 3);

    /* -- square with a diagonal: 4 vertices, cheapest 3 edges chosen -- */
    vertex_count = 4;
    sorted[0] = (Edge) { 0, 1, 1, 0 };
    sorted[1] = (Edge) { 1, 2, 2, 1 };
    sorted[2] = (Edge) { 2, 3, 1, 2 };
    sorted[3] = (Edge) { 3, 0, 4, 3 };
    sorted[4] = (Edge) { 0, 2, 3, 4 };   /* diagonal, rejected: closes a cycle */
    CHECK_EQ_INT(kruskal_mst(sorted, 5, mst, &total), 3);
    CHECK_EQ_INT(total, 4);   /* 1+2+1 */

    /* -- disconnected: 2 components (0-1) and (2-3) -- a spanning FOREST of 2 edges -- */
    vertex_count = 4;
    sorted[0] = (Edge) { 0, 1, 7, 0 };
    sorted[1] = (Edge) { 2, 3, 2, 1 };
    CHECK_EQ_INT(kruskal_mst(sorted, 2, mst, &total), 2);
    CHECK_EQ_INT(total, 9);

    /* -- tie-break: equal weights keep input order (idx) -- lower idx wins the tie -- */
    vertex_count = 3;
    sorted[0] = (Edge) { 0, 1, 5, 0 };
    sorted[1] = (Edge) { 1, 2, 5, 1 };
    sorted[2] = (Edge) { 0, 2, 5, 2 };
    CHECK_EQ_INT(kruskal_mst(sorted, 3, mst, &total), 2);
    CHECK_EQ_INT(mst[0].a, 0); CHECK_EQ_INT(mst[0].b, 1);   /* idx 0 processed first */
    CHECK_EQ_INT(mst[1].a, 1); CHECK_EQ_INT(mst[1].b, 2);   /* idx 1 next; idx 2 (0-2) closes a cycle, skipped */

    /* -- no edges at all: MST is empty, total 0 -- */
    vertex_count = 3;
    CHECK_EQ_INT(kruskal_mst(sorted, 0, mst, &total), 0);
    CHECK_EQ_INT(total, 0);

    /* -- 0 vertices, 0 edges: MST is empty too -- */
    vertex_count = 0;
    CHECK_EQ_INT(kruskal_mst(sorted, 0, mst, &total), 0);
    CHECK_EQ_INT(total, 0);

    /* -- a negative-weight edge is picked first: Kruskal has no non-negative requirement -- */
    vertex_count = 3;
    sorted[0] = (Edge) { 0, 1, -2, 0 };
    sorted[1] = (Edge) { 1, 2, 5, 1 };
    sorted[2] = (Edge) { 0, 2, 5, 2 };
    CHECK_EQ_INT(kruskal_mst(sorted, 3, mst, &total), 2);
    CHECK_EQ_INT(total, 3);        /* -2 + 5; the 0-2 tie loses because 1-2 already connects it */
    CHECK_EQ_INT(mst[0].w, -2);    /* the negative edge is used first (smallest weight) */

    /* -- cmp_weight itself: ascending by weight, then by idx on a tie -- */
    Edge e1 = { 0, 1, 3, 5 }, e2 = { 1, 2, 7, 1 }, e3 = { 0, 2, 3, 2 };
    CHECK(cmp_weight(&e1, &e2) < 0);
    CHECK(cmp_weight(&e2, &e1) > 0);
    CHECK(cmp_weight(&e1, &e3) > 0);   /* same weight, e1.idx(5) > e3.idx(2) */

    TEST_SUMMARY();
}
