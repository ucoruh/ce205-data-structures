/* Unit tests for code/week-11/c/fenwick_tree.c: update(), query(). */
#define main program_main
#include "../../c/fenwick_tree.c"
#undef main
#include "../../../test_check.h"

static void reset(int size) {
    n = size;
    for (int i = 0; i <= n; i++) bit[i] = 0;
}

int main(void) {
    reset(10);
    update(3, 5);
    CHECK_EQ_INT(query(10), 5);
    CHECK_EQ_INT(query(2), 0);        /* prefix stops before index 3 */
    CHECK_EQ_INT(query(3), 5);
    update(7, 2);
    CHECK_EQ_INT(query(10), 7);
    CHECK_EQ_INT(query(6), 5);
    CHECK_EQ_INT(query(7), 7);

    /* prefix sum for the FULL array equals the sum of all deltas applied */
    reset(10);
    int deltas[] = {3, -1, 4, 1, -5, 9, 2, -6, 5, 3};
    int total = 0;
    for (int i = 1; i <= 10; i++) { update(i, deltas[i - 1]); total += deltas[i - 1]; }
    CHECK_EQ_INT(query(10), total);
    CHECK_EQ_INT(query(1), deltas[0]);

    /* i & -i chain length: update(1) on n=16 touches 5 cells (1,2,4,8,16) */
    reset(16);
    update(1, 7);
    CHECK_EQ_INT(query(16), 7);
    CHECK_EQ_INT(query(1), 7);
    CHECK_EQ_INT(query(15), 7);       /* index 1's contribution still reaches every prefix >= 1 */

    /* update(16) on n=16 touches only 1 cell -- does not affect query(15) */
    reset(16);
    update(16, 100);
    CHECK_EQ_INT(query(15), 0);
    CHECK_EQ_INT(query(16), 100);

    /* negative deltas can push a running sum below zero */
    reset(10);
    update(4, -9);
    update(8, 2);
    CHECK_EQ_INT(query(10), -7);
    update(1, -3);
    CHECK_EQ_INT(query(4), -12);
    CHECK_EQ_INT(query(10), -10);

    /* repeated updates to the same index accumulate */
    reset(10);
    update(5, 1);
    update(5, 1);
    update(5, 1);
    CHECK_EQ_INT(query(10), 3);
    CHECK_EQ_INT(query(4), 0);

    /* n = 1: the smallest possible Fenwick tree */
    reset(1);
    update(1, 9);
    CHECK_EQ_INT(query(1), 9);

    /* query(0) is defined as the empty prefix: 0 */
    reset(10);
    update(5, 8);
    CHECK_EQ_INT(query(0), 0);

    TEST_SUMMARY();
}
