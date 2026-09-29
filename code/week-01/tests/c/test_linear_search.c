/* Unit tests for code/week-01/c/linear_search.c: linear_search(arr, n, target, &comparisons).
 * Every expected value below is hand-computed from the array contents, independent of the function.
 */
#define main program_main
#include "../../c/linear_search.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* normal data: target in the middle, hand count: index 4, 5 comparisons (i = 0..4) */
    {
        int arr[] = {4, 8, 15, 16, 23, 27, 31, 38, 42, 50, 61};
        int cmp = 0;
        int idx = linear_search(arr, 11, 23, &cmp);
        CHECK_EQ_INT(idx, 4);
        CHECK_EQ_INT(cmp, 5);
    }

    /* empty input: n = 0, must not read arr, not found, 0 comparisons */
    {
        int cmp = 0;
        int idx = linear_search(NULL, 0, 42, &cmp);
        CHECK_EQ_INT(idx, -1);
        CHECK_EQ_INT(cmp, 0);
    }

    /* one element, found: index 0, 1 comparison */
    {
        int arr[] = {42};
        int cmp = 0;
        int idx = linear_search(arr, 1, 42, &cmp);
        CHECK_EQ_INT(idx, 0);
        CHECK_EQ_INT(cmp, 1);
    }

    /* one element, not found: -1, 1 comparison (still has to check the only element) */
    {
        int arr[] = {42};
        int cmp = 0;
        int idx = linear_search(arr, 1, 7, &cmp);
        CHECK_EQ_INT(idx, -1);
        CHECK_EQ_INT(cmp, 1);
    }

    /* two elements, target is the second: index 1, 2 comparisons */
    {
        int arr[] = {5, 9};
        int cmp = 0;
        int idx = linear_search(arr, 2, 9, &cmp);
        CHECK_EQ_INT(idx, 1);
        CHECK_EQ_INT(cmp, 2);
    }

    /* best case: target is the first element -> index 0, exactly 1 comparison */
    {
        int arr[] = {5, 13, 21, 34, 42, 55, 67, 78, 89, 91};
        int cmp = 0;
        int idx = linear_search(arr, 10, 5, &cmp);
        CHECK_EQ_INT(idx, 0);
        CHECK_EQ_INT(cmp, 1);
    }

    /* worst case: target is the last element -> index n-1, n comparisons */
    {
        int arr[] = {5, 13, 21, 34, 42, 55, 67, 78, 89, 91};
        int cmp = 0;
        int idx = linear_search(arr, 10, 91, &cmp);
        CHECK_EQ_INT(idx, 9);
        CHECK_EQ_INT(cmp, 10);
    }

    /* not found, full scan: -1, n comparisons */
    {
        int arr[] = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20};
        int cmp = 0;
        int idx = linear_search(arr, 10, 7, &cmp);
        CHECK_EQ_INT(idx, -1);
        CHECK_EQ_INT(cmp, 10);
    }

    /* duplicates: first match wins (index of the FIRST occurrence, not the second) */
    {
        int arr[] = {12, 47, 3, 88, 25, 61, 9, 34, 77, 15, 52, 6, 41, 18, 63, 99, 5, 29, 99, 71};
        int cmp = 0;
        int idx = linear_search(arr, 20, 99, &cmp);
        CHECK_EQ_INT(idx, 15); /* first 99 is at index 15, not 18 */
        CHECK_EQ_INT(cmp, 16);
    }

    /* negative values, target is negative */
    {
        int arr[] = {-5, -10, -15, -20, -25};
        int cmp = 0;
        int idx = linear_search(arr, 5, -20, &cmp);
        CHECK_EQ_INT(idx, 3);
        CHECK_EQ_INT(cmp, 4);
    }

    /* reverse-sorted array: linear search does not care about order */
    {
        int arr[] = {90, 83, 75, 68, 60, 53, 47, 41, 34, 29, 23, 19, 15, 11, 7, 3};
        int cmp = 0;
        int idx = linear_search(arr, 16, 3, &cmp);
        CHECK_EQ_INT(idx, 15);
        CHECK_EQ_INT(cmp, 16);
    }

    /* INT_MIN and INT_MAX as ordinary values in the array */
    {
        int arr[] = {0, 1, -1, 2147483647, -2147483648, 5};
        int cmp = 0;
        int idxMax = linear_search(arr, 6, 2147483647, &cmp);
        CHECK_EQ_INT(idxMax, 3);
        cmp = 0;
        int idxMin = linear_search(arr, 6, -2147483648, &cmp);
        CHECK_EQ_INT(idxMin, 4);
        CHECK_EQ_INT(cmp, 5);
    }

    /* target value 0 works like any other value (not confused with "not found") */
    {
        int arr[] = {3, 0, 7};
        int cmp = 0;
        int idx = linear_search(arr, 3, 0, &cmp);
        CHECK_EQ_INT(idx, 1);
    }

    /* comparisons is only incremented, never reset by the function itself (caller owns it) */
    {
        int arr[] = {1, 2, 3};
        int cmp = 10; /* pre-existing value */
        int idx = linear_search(arr, 3, 2, &cmp);
        CHECK_EQ_INT(idx, 1);
        CHECK_EQ_INT(cmp, 12); /* 10 + 2 comparisons */
    }

    TEST_SUMMARY();
}
