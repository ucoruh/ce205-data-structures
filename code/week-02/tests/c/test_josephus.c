/* Unit tests for code/week-02/c/josephus.c: josephus().
   Independent oracle: the classic recurrence J(1)=0, J(n)=(J(n-1)+k)%n (0-indexed survivor position),
   survivor = J(n)+1 -- a closed-form recurrence, not the linked-list simulation the program itself uses. */
#define main program_main
#include "../../c/josephus.c"
#undef main
#include "../../../test_check.h"

static int brute_survivor(int n, int k) {
    int j = 0;                       /* J(1) = 0 */
    for (int i = 2; i <= n; i++)
        j = (j + k) % i;
    return j + 1;                    /* convert to 1-indexed id */
}

int main(void) {
    /* the program's own scenarios, cross-checked against the recurrence */
    CHECK_EQ_INT(josephus(10, 3), brute_survivor(10, 3));
    CHECK_EQ_INT(josephus(12, 5), brute_survivor(12, 5));
    CHECK_EQ_INT(josephus(10, 1), brute_survivor(10, 1));
    CHECK_EQ_INT(josephus(1, 3), brute_survivor(1, 3));

    /* n = 1: nobody to eliminate, survivor is always 1 regardless of k */
    CHECK_EQ_INT(josephus(1, 1), 1);
    CHECK_EQ_INT(josephus(1, 100), 1);

    /* n = 2: both possible k parities */
    CHECK_EQ_INT(josephus(2, 1), brute_survivor(2, 1));
    CHECK_EQ_INT(josephus(2, 1), 2);
    CHECK_EQ_INT(josephus(2, 2), brute_survivor(2, 2));
    CHECK_EQ_INT(josephus(2, 2), 1);

    /* k = 1: elimination happens in plain order, the LAST person (id n) always survives */
    CHECK_EQ_INT(josephus(5, 1), 5);
    CHECK_EQ_INT(josephus(20, 1), 20);

    /* k = n: every count-off wraps exactly once around the full remaining circle */
    CHECK_EQ_INT(josephus(6, 6), brute_survivor(6, 6));

    /* k > n: still well-defined via modulo counting, matches the recurrence */
    CHECK_EQ_INT(josephus(5, 2), brute_survivor(5, 2));
    CHECK_EQ_INT(josephus(5, 17), brute_survivor(5, 17));

    /* the classic textbook instance: n = 41, k = 3 -> survivor 31 */
    CHECK_EQ_INT(josephus(41, 3), 31);
    CHECK_EQ_INT(josephus(41, 3), brute_survivor(41, 3));

    /* a range of small n with k = 2, cross-checked exhaustively */
    for (int n = 1; n <= 15; n++)
        CHECK_EQ_INT(josephus(n, 2), brute_survivor(n, 2));

    TEST_SUMMARY();
}
