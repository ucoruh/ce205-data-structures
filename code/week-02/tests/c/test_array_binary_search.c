/* Unit tests for code/week-02/c/array_binary_search.c: binary_search().
   Precondition: arr[] must already be sorted ascending (documented in the note). */
#define main program_main
#include "../../c/array_binary_search.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int a[] = {1, 3, 5, 7, 9, 11, 13};   /* n = 7, the program's own example */

    /* found: first, middle, last element */
    CHECK_EQ_INT(binary_search(a, 7, 1), 0);
    CHECK_EQ_INT(binary_search(a, 7, 7), 3);
    CHECK_EQ_INT(binary_search(a, 7, 13), 6);

    /* not found: below range, above range, between two elements */
    CHECK_EQ_INT(binary_search(a, 7, 0), -1);
    CHECK_EQ_INT(binary_search(a, 7, 14), -1);
    CHECK_EQ_INT(binary_search(a, 7, 4), -1);

    /* empty array */
    CHECK_EQ_INT(binary_search(a, 0, 1), -1);
    CHECK_EQ_INT(binary_search(a, 0, 0), -1);

    /* one element: found and not found */
    int one[] = {42};
    CHECK_EQ_INT(binary_search(one, 1, 42), 0);
    CHECK_EQ_INT(binary_search(one, 1, 7), -1);

    /* two elements: found first, found second, not found */
    int two[] = {10, 20};
    CHECK_EQ_INT(binary_search(two, 2, 10), 0);
    CHECK_EQ_INT(binary_search(two, 2, 20), 1);
    CHECK_EQ_INT(binary_search(two, 2, 15), -1);

    /* even-length array: check both middle candidates resolve correctly */
    int four[] = {2, 4, 6, 8};
    CHECK_EQ_INT(binary_search(four, 4, 2), 0);
    CHECK_EQ_INT(binary_search(four, 4, 4), 1);
    CHECK_EQ_INT(binary_search(four, 4, 6), 2);
    CHECK_EQ_INT(binary_search(four, 4, 8), 3);

    /* duplicates: binary search returns SOME matching index, not necessarily the first --
       assert the invariant that matters: the value at the returned index equals target */
    int dup[] = {1, 3, 3, 3, 3, 5, 7};
    int r = binary_search(dup, 7, 3);
    CHECK(r >= 1 && r <= 4 && dup[r] == 3);

    /* negative values and INT_MIN/INT_MAX in a sorted array */
    int extreme[] = {-2147483648, -100, 0, 17, 2147483647};
    CHECK_EQ_INT(binary_search(extreme, 5, -2147483648), 0);
    CHECK_EQ_INT(binary_search(extreme, 5, -100), 1);
    CHECK_EQ_INT(binary_search(extreme, 5, 2147483647), 4);
    CHECK_EQ_INT(binary_search(extreme, 5, 12345), -1);

    /* searching only a sorted prefix of a larger array */
    int big[] = {1, 2, 3, 4, 5, 6, 7};
    CHECK_EQ_INT(binary_search(big, 3, 5), -1);   /* 5 sits past index 3, must not be found */
    CHECK_EQ_INT(binary_search(big, 3, 2), 1);

    TEST_SUMMARY();
}
