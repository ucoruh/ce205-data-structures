/* Unit tests for week-03 c/hanoi.c */
#define main program_main
#include "../../c/hanoi.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* -- base case: 0 disks means no moves at all -- */
    move_count = 0;
    tower_of_hanoi(0, 'A', 'C', 'B');
    CHECK_EQ_INT(move_count, 0);

    /* -- one disk: a single, direct move -- */
    move_count = 0;
    tower_of_hanoi(1, 'A', 'C', 'B');
    CHECK_EQ_INT(move_count, 1);

    /* -- two disks: exactly 3 moves (2^2 - 1) -- */
    move_count = 0;
    tower_of_hanoi(2, 'A', 'C', 'B');
    CHECK_EQ_INT(move_count, 3);

    /* -- move count follows 2^n - 1 for n = 1..10, checked against an independent
     *    formula (not the recursive algorithm itself) -- */
    for (int n = 1; n <= 10; n++) {
        move_count = 0;
        tower_of_hanoi(n, 'A', 'C', 'B');
        int expected = 1;
        for (int i = 0; i < n; i++) expected *= 2;   /* 2^n, computed independently */
        expected -= 1;
        CHECK_EQ_INT(move_count, expected);
    }

    /* -- the program's own three presets, by name -- */
    move_count = 0;
    tower_of_hanoi(4, 'A', 'C', 'B');
    CHECK_EQ_INT(move_count, 15);
    move_count = 0;
    tower_of_hanoi(5, 'A', 'C', 'B');
    CHECK_EQ_INT(move_count, 31);
    move_count = 0;
    tower_of_hanoi(1, 'A', 'C', 'B');
    CHECK_EQ_INT(move_count, 1);

    /* -- move_disk itself: it increments move_count on every call, one call per move -- */
    move_count = 0;
    move_disk(3, 'A', 'C');
    CHECK_EQ_INT(move_count, 1);
    move_disk(2, 'A', 'B');
    CHECK_EQ_INT(move_count, 2);

    /* -- the largest disk (n) always makes exactly ONE move in the whole recursion:
     *    the move count right before and right after the middle move_disk call for
     *    the outermost n differs by exactly 1 -- verified indirectly through the
     *    total: total moves for n disks minus 2 * (moves for n-1 disks) must equal 1,
     *    the historic "move the biggest disk once" invariant. -- */
    for (int n = 1; n <= 8; n++) {
        move_count = 0; tower_of_hanoi(n, 'A', 'C', 'B');
        int total = move_count;
        move_count = 0; tower_of_hanoi(n - 1, 'A', 'C', 'B');   /* n=1 -> 0 disks -> 0 moves */
        int sub = move_count;
        CHECK_EQ_INT(total - 2 * sub, 1);
    }

    /* -- run() resets move_count itself and prints, exercised for integration/coverage -- */
    run("unit-test integration", 3);
    CHECK_EQ_INT(move_count, 7);   /* 2^3 - 1 */

    TEST_SUMMARY();
}
