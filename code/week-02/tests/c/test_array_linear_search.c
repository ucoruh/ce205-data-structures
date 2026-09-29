/* Unit tests for code/week-02/c/array_linear_search.c: linear_search(). */
#define main program_main
#include "../../c/array_linear_search.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* normal: target in the middle */
    int a[] = {5, 2, 9, 1, 7};
    CHECK_EQ_INT(linear_search(a, 5, 9), 2);

    /* first element */
    CHECK_EQ_INT(linear_search(a, 5, 5), 0);

    /* last element */
    CHECK_EQ_INT(linear_search(a, 5, 7), 4);

    /* not found (value absent) */
    CHECK_EQ_INT(linear_search(a, 5, 4), -1);

    /* empty array: always not found */
    CHECK_EQ_INT(linear_search(a, 0, 5), -1);
    CHECK_EQ_INT(linear_search(a, 0, 0), -1);

    /* one element: found and not found */
    int one[] = {42};
    CHECK_EQ_INT(linear_search(one, 1, 42), 0);
    CHECK_EQ_INT(linear_search(one, 1, 7), -1);

    /* two elements: found first, found second, not found */
    int two[] = {10, 20};
    CHECK_EQ_INT(linear_search(two, 2, 10), 0);
    CHECK_EQ_INT(linear_search(two, 2, 20), 1);
    CHECK_EQ_INT(linear_search(two, 2, 30), -1);

    /* duplicates: the FIRST occurrence wins */
    int dup[] = {3, 8, 3, 8, 3};
    CHECK_EQ_INT(linear_search(dup, 5, 3), 0);
    CHECK_EQ_INT(linear_search(dup, 5, 8), 1);

    /* negative values and INT_MIN/INT_MAX */
    int extreme[] = {-100, 0, 2147483647, -2147483648, 17};
    CHECK_EQ_INT(linear_search(extreme, 5, -100), 0);
    CHECK_EQ_INT(linear_search(extreme, 5, 2147483647), 2);
    CHECK_EQ_INT(linear_search(extreme, 5, -2147483648), 3);
    CHECK_EQ_INT(linear_search(extreme, 5, 17), 4);

    /* sorted array */
    int sorted[] = {1, 3, 5, 7, 9};
    CHECK_EQ_INT(linear_search(sorted, 5, 7), 3);
    CHECK_EQ_INT(linear_search(sorted, 5, 2), -1);

    /* reverse-sorted array */
    int rev[] = {9, 7, 5, 3, 1};
    CHECK_EQ_INT(linear_search(rev, 5, 1), 4);
    CHECK_EQ_INT(linear_search(rev, 5, 9), 0);

    /* searching only a prefix of a larger array (n < array's real length) */
    int big[] = {1, 2, 3, 4, 5, 6, 7};
    CHECK_EQ_INT(linear_search(big, 3, 5), -1);   /* 5 sits past index 3, must not be found */
    CHECK_EQ_INT(linear_search(big, 3, 2), 1);

    TEST_SUMMARY();
}
