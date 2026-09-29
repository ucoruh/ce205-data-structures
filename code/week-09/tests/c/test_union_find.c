/* Unit tests for week-09 c/union_find.c */
#define main program_main
#include "../../c/union_find.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* -- make_set: a fresh element is its own root, rank 0 -- */
    make_set(0);
    CHECK_EQ_INT(parent_of[0], 0);
    CHECK_EQ_INT(rank_of[0], 0);

    /* -- find on a singleton returns itself -- */
    CHECK_EQ_INT(find(0), 0);

    /* -- union of two singletons: rank tie -> first argument's root wins, rank increases -- */
    make_set(0); make_set(1);
    union_sets(0, 1);
    CHECK_EQ_INT(find(0), find(1));
    CHECK_EQ_INT(find(1), 0);
    CHECK_EQ_INT(rank_of[0], 1);

    /* -- union of the same set twice: idempotent, no rank change -- */
    union_sets(0, 1);
    CHECK_EQ_INT(rank_of[0], 1);

    /* -- union by rank: a rank-0 set joins a rank-1 root directly, no rank change on the taller tree -- */
    make_set(0); make_set(1); make_set(2);
    union_sets(0, 1);           /* 0 is root, rank 1 */
    union_sets(2, 0);           /* rank(2)=0 < rank(0)=1 -> 2 hangs under 0 */
    CHECK_EQ_INT(find(2), 0);
    CHECK_EQ_INT(rank_of[0], 1);

    /* -- path compression: a depth-2 chain flattens after find() -- */
    make_set(0); make_set(1); make_set(2); make_set(3);
    union_sets(0, 1);           /* 0 root rank 1, parent[1]=0 */
    union_sets(2, 3);           /* 2 root rank 1, parent[3]=2 */
    union_sets(0, 2);           /* rank tie -> parent[2]=0, rank[0]=2; parent[3] still 2 (depth 2 from 0) */
    CHECK_EQ_INT(parent_of[3], 2);   /* not yet compressed */
    CHECK_EQ_INT(find(3), 0);        /* find walks 3->2->0 and compresses */
    CHECK_EQ_INT(parent_of[3], 0);   /* now points directly at the root */

    /* -- 5 singletons chained by 4 unions: all in one set -- */
    for (int i = 0; i < 5; i++) make_set(i);
    union_sets(0, 1); union_sets(1, 2); union_sets(2, 3); union_sets(3, 4);
    int root = find(0);
    for (int i = 1; i < 5; i++) CHECK_EQ_INT(find(i), root);

    /* -- two disjoint pairs stay disjoint until explicitly unioned -- */
    for (int i = 0; i < 4; i++) make_set(i);
    union_sets(0, 1);
    union_sets(2, 3);
    CHECK(find(0) != find(2));
    union_sets(1, 3);
    CHECK_EQ_INT(find(0), find(2));

    /* -- rank grows only on an equal-rank merge, never on a lower-rank merge -- */
    for (int i = 0; i < 4; i++) make_set(i);
    union_sets(0, 1);   /* rank(0) = 1 */
    union_sets(2, 0);   /* rank(2)=0 < rank(0)=1: no rank change */
    CHECK_EQ_INT(rank_of[0], 1);
    union_sets(3, 0);   /* still rank(3)=0 < rank(0)=1 */
    CHECK_EQ_INT(rank_of[0], 1);
    CHECK_EQ_INT(find(3), 0);

    TEST_SUMMARY();
}
