/* Unit tests for code/week-01/c/binary_search.c: binary_search(arr, n, target, &comparisons).
 * Every expected value below is hand-computed / brute-force verified, independent of the function.
 */
#define main program_main
#include "../../c/binary_search.c"
#undef main
#include "../../../test_check.h"

/* Independent brute-force oracle: linear scan (never shares code with binary_search). */
static int brute_index(const int arr[], int n, int target) {
    for (int i = 0; i < n; i++)
        if (arr[i] == target)
            return i;
    return -1;
}

int main(void) {
    /* normal: 16 values, target found. Hand trace: lo=0 hi=15 mid=7(34)<47 lo=8; mid=11(60)>47 hi=10;
     * mid=9(47)==47 -> index 9, 3 comparisons. */
    {
        int arr[] = {3, 7, 11, 15, 19, 23, 29, 34, 41, 47, 53, 60, 68, 75, 83, 90};
        int cmp = 0;
        int idx = binary_search(arr, 16, 47, &cmp);
        CHECK_EQ_INT(idx, 9);
        CHECK_EQ_INT(cmp, 3);
        CHECK_EQ_INT(idx, brute_index(arr, 16, 47));
    }

    /* empty input: n = 0, never touches arr, not found, 0 comparisons (loop body never runs) */
    {
        int cmp = 0;
        int idx = binary_search(NULL, 0, 5, &cmp);
        CHECK_EQ_INT(idx, -1);
        CHECK_EQ_INT(cmp, 0);
    }

    /* one element, found */
    {
        int arr[] = {42};
        int cmp = 0;
        int idx = binary_search(arr, 1, 42, &cmp);
        CHECK_EQ_INT(idx, 0);
        CHECK_EQ_INT(cmp, 1);
    }

    /* one element, not found (smaller) */
    {
        int arr[] = {42};
        int cmp = 0;
        int idx = binary_search(arr, 1, 10, &cmp);
        CHECK_EQ_INT(idx, -1);
        CHECK_EQ_INT(cmp, 1);
    }

    /* two elements, target is the second */
    {
        int arr[] = {5, 9};
        int cmp = 0;
        int idx = binary_search(arr, 2, 9, &cmp);
        CHECK_EQ_INT(idx, 1);
    }

    /* two elements, target is the first */
    {
        int arr[] = {5, 9};
        int cmp = 0;
        int idx = binary_search(arr, 2, 5, &cmp);
        CHECK_EQ_INT(idx, 0);
    }

    /* not found: lo > hi at the end (target smaller than every value that gets probed) */
    {
        int arr[] = {2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62,
                     66, 70, 74, 78, 82, 86, 90, 94, 98, 102, 106, 110, 114, 118, 122};
        int cmp = 0;
        int idx = binary_search(arr, 31, 5, &cmp);
        CHECK_EQ_INT(idx, -1);
        CHECK_EQ_INT(idx, brute_index(arr, 31, 5));
    }

    /* edge: target smaller than every value -> immediately goes left, not found */
    {
        int arr[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        int cmp = 0;
        int idx = binary_search(arr, 10, 1, &cmp);
        CHECK_EQ_INT(idx, -1);
    }

    /* edge: target larger than every value -> immediately goes right, not found */
    {
        int arr[] = {15, 25, 35, 45, 55, 65, 75, 85, 95, 105};
        int cmp = 0;
        int idx = binary_search(arr, 10, 999, &cmp);
        CHECK_EQ_INT(idx, -1);
    }

    /* duplicates: some index holding the target value is returned (binary search makes no first/last
     * promise on duplicates -- check membership and value, not a specific position) */
    {
        int arr[] = {5, 5, 5, 10, 15, 20, 20, 25, 30, 35};
        int cmp = 0;
        int idx = binary_search(arr, 10, 20, &cmp);
        CHECK(idx == 5 || idx == 6);
        CHECK_EQ_INT(arr[idx], 20);
    }

    /* first index of the array (index 0) */
    {
        int arr[] = {1, 4, 9, 16, 25, 36, 49};
        int cmp = 0;
        int idx = binary_search(arr, 7, 1, &cmp);
        CHECK_EQ_INT(idx, 0);
    }

    /* last index of the array */
    {
        int arr[] = {1, 4, 9, 16, 25, 36, 49};
        int cmp = 0;
        int idx = binary_search(arr, 7, 49, &cmp);
        CHECK_EQ_INT(idx, 6);
    }

    /* negative values, sorted ascending (negatives sort before positives) */
    {
        int arr[] = {-25, -20, -15, -10, -5, 0, 5, 10};
        int cmp = 0;
        int idx = binary_search(arr, 8, -15, &cmp);
        CHECK_EQ_INT(idx, 2);
    }

    /* INT_MIN / INT_MAX at the ends of a sorted array */
    {
        int arr[] = {-2147483648, -1, 0, 1, 2147483647};
        int cmp = 0;
        CHECK_EQ_INT(binary_search(arr, 5, -2147483648, &cmp), 0);
        CHECK_EQ_INT(binary_search(arr, 5, 2147483647, &cmp), 4);
    }

    /* comparisons never exceeds ceil(log2(n)) + 1 for a 16-element array (sanity bound) */
    {
        int arr[] = {3, 7, 11, 15, 19, 23, 29, 34, 41, 47, 53, 60, 68, 75, 83, 90};
        for (int t = 0; t < 16; t++) {
            int cmp = 0;
            binary_search(arr, 16, arr[t], &cmp);
            CHECK(cmp <= 5);
        }
    }

    TEST_SUMMARY();
}
