/* Unit tests for code/week-01/c/debug_average.c: average_buggy() and average_fixed().
 * Expected values are hand-computed (sum / n, done by hand, not by calling the function).
 */
#define main program_main
#include "../../c/debug_average.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* normal: sum = 7+8+8+9+6+10+7+8+9+9 = 81, 81/10 = 8.1 -> buggy truncates to 8, fixed = 8.10 */
    {
        int arr[] = {7, 8, 8, 9, 6, 10, 7, 8, 9, 9};
        CHECK_EQ_INT(average_buggy(arr, 10), 8);
        CHECK(average_fixed(arr, 10) > 8.09 && average_fixed(arr, 10) < 8.11);
    }

    /* empty array: n = 0, guarded, must not read arr (pass NULL) */
    {
        CHECK_EQ_INT(average_buggy(NULL, 0), 0);
        CHECK(average_fixed(NULL, 0) == 0.0);
    }

    /* one element: average is the element itself, exactly, both versions agree */
    {
        int arr[] = {7};
        CHECK_EQ_INT(average_buggy(arr, 1), 7);
        CHECK(average_fixed(arr, 1) == 7.0);
    }

    /* two elements, evenly divisible: both versions agree exactly */
    {
        int arr[] = {4, 6};
        CHECK_EQ_INT(average_buggy(arr, 2), 5);
        CHECK(average_fixed(arr, 2) == 5.0);
    }

    /* two elements, NOT evenly divisible: this is exactly the bug -- buggy truncates, fixed does not */
    {
        int arr[] = {1, 2}; /* sum 3, 3/2 = 1.5 */
        CHECK_EQ_INT(average_buggy(arr, 2), 1); /* truncated */
        CHECK(average_fixed(arr, 2) == 1.5);    /* exact */
    }

    /* negative values: sum = -5+3-8+12-1+7-10+4+9-6+2-3+8-7+1+5 = 11, 11/16 = 0.6875 -> buggy truncates to 0 */
    {
        int arr[] = {-5, 3, -8, 12, -1, 7, -10, 4, 9, -6, 2, -3, 8, -7, 1, 5};
        CHECK_EQ_INT(average_buggy(arr, 16), 0);
        CHECK(average_fixed(arr, 16) > 0.68 && average_fixed(arr, 16) < 0.69);
    }

    /* all-negative average: sum = -30, n = 5, avg = -6 exactly (evenly divisible, both agree) */
    {
        int arr[] = {-10, -5, -5, -5, -5};
        CHECK_EQ_INT(average_buggy(arr, 5), -6);
        CHECK(average_fixed(arr, 5) == -6.0);
    }

    /* negative sum, not evenly divisible: C truncates integer division toward zero, e.g. -7/2 == -3 */
    {
        int arr[] = {-3, -4}; /* sum -7, -7/2 == -3 (truncation toward zero, not -4) */
        CHECK_EQ_INT(average_buggy(arr, 2), -3);
        CHECK(average_fixed(arr, 2) == -3.5);
    }

    /* duplicates: all the same value -> average equals that value exactly for both versions */
    {
        int arr[] = {9, 9, 9, 9, 9};
        CHECK_EQ_INT(average_buggy(arr, 5), 9);
        CHECK(average_fixed(arr, 5) == 9.0);
    }

    /* zeros: average of all zeros is 0 */
    {
        int arr[] = {0, 0, 0, 0};
        CHECK_EQ_INT(average_buggy(arr, 4), 0);
        CHECK(average_fixed(arr, 4) == 0.0);
    }

    /* large magnitude values, near INT_MAX, sum still fits in int for n = 2 */
    {
        int arr[] = {1000000000, 1000000000}; /* sum 2000000000, safely within INT_MAX (2147483647) */
        CHECK_EQ_INT(average_buggy(arr, 2), 1000000000);
        CHECK(average_fixed(arr, 2) == 1000000000.0);
    }

    /* sixteen elements (hard scenario size), independent hand sum check for average_fixed only */
    {
        int arr[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16}; /* sum 136, avg 8.5 */
        CHECK_EQ_INT(average_buggy(arr, 16), 8);
        CHECK(average_fixed(arr, 16) == 8.5);
    }

    TEST_SUMMARY();
}
