/* Unit tests for code/week-01/c/space_recursive_vs_iterative.c: sum_recursive() and sum_iterative().
 * Expected sums are hand-computed, independent of the two functions under test.
 */
#define main program_main
#include "../../c/space_recursive_vs_iterative.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* normal: 10 positive values, sum = 10+20+...+100 = 550 */
    {
        int arr[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        CHECK_EQ_INT(sum_recursive(arr, 10), 550);
        CHECK_EQ_INT(sum_iterative(arr, 10), 550);
    }

    /* empty input: n = 0, both must return 0 without touching arr */
    {
        CHECK_EQ_INT(sum_recursive(NULL, 0), 0);
        CHECK_EQ_INT(sum_iterative(NULL, 0), 0);
    }

    /* one element: sum equals that element */
    {
        int arr[] = {7};
        CHECK_EQ_INT(sum_recursive(arr, 1), 7);
        CHECK_EQ_INT(sum_iterative(arr, 1), 7);
    }

    /* two elements */
    {
        int arr[] = {3, 4};
        CHECK_EQ_INT(sum_recursive(arr, 2), 7);
        CHECK_EQ_INT(sum_iterative(arr, 2), 7);
    }

    /* mixed signs (hard scenario): sum = 5-3+12+8-7+15+22-10+6+18+9-4+11+27-15+3+19-8+14+7 = 129 */
    {
        int arr[] = {5, -3, 12, 8, -7, 15, 22, -10, 6, 18, 9, -4, 11, 27, -15, 3, 19, -8, 14, 7};
        CHECK_EQ_INT(sum_recursive(arr, 20), 129);
        CHECK_EQ_INT(sum_iterative(arr, 20), 129);
    }

    /* all negative: sum = -5-10-15-20-25-30-35-40-45-50 = -275 */
    {
        int arr[] = {-5, -10, -15, -20, -25, -30, -35, -40, -45, -50};
        CHECK_EQ_INT(sum_recursive(arr, 10), -275);
        CHECK_EQ_INT(sum_iterative(arr, 10), -275);
    }

    /* deep recursion: 22 values 1..22, sum = 22*23/2 = 253 (also exercises 22 stack frames safely) */
    {
        int arr[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22};
        CHECK_EQ_INT(sum_recursive(arr, 22), 253);
        CHECK_EQ_INT(sum_iterative(arr, 22), 253);
    }

    /* deeper recursion still, to confirm no crash / stack corruption well beyond the note's example:
     * 200 values, all 1s, sum = 200 */
    {
        int arr[200];
        for (int i = 0; i < 200; i++) arr[i] = 1;
        CHECK_EQ_INT(sum_recursive(arr, 200), 200);
        CHECK_EQ_INT(sum_iterative(arr, 200), 200);
    }

    /* duplicates: repeated values sum correctly */
    {
        int arr[] = {5, 5, 5, 5, 5};
        CHECK_EQ_INT(sum_recursive(arr, 5), 25);
        CHECK_EQ_INT(sum_iterative(arr, 5), 25);
    }

    /* zeros sum to zero */
    {
        int arr[] = {0, 0, 0, 0};
        CHECK_EQ_INT(sum_recursive(arr, 4), 0);
        CHECK_EQ_INT(sum_iterative(arr, 4), 0);
    }

    /* both versions agree with each other on every prefix of a fixed array (cross-check) */
    {
        int arr[] = {6, -2, 9, 14, -20, 3, 7, -1, 8, 0};
        for (int n = 0; n <= 10; n++)
            CHECK_EQ_INT(sum_recursive(arr, n), sum_iterative(arr, n));
    }

    /* large values near INT_MAX/2, no overflow for this small n */
    {
        int arr[] = {1000000000, 1000000000};
        CHECK_EQ_INT(sum_recursive(arr, 2), 2000000000);
        CHECK_EQ_INT(sum_iterative(arr, 2), 2000000000);
    }

    TEST_SUMMARY();
}
