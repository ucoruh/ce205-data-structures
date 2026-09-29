/* Unit tests for code/week-02/c/array_rotation.c: rotate_left() (and its reverse() helper).
   Independent oracle: rotating left by d means result[i] = original[(i+d) % n] for every i --
   computed by hand into an `expected[]` array below, never by calling rotate_left() itself. */
#define main program_main
#include "../../c/array_rotation.c"
#undef main
#include "../../../test_check.h"
#include <string.h>

static void check_rotation(const char *label, int arr[], int n, int d, const int expected[]) {
    rotate_left(arr, n, d);
    for (int i = 0; i < n; i++) {
        test_checks++;
        if (arr[i] != expected[i]) {
            test_failures++;
            fprintf(stderr, "%s: index %d = %d, expected %d\n", label, i, arr[i], expected[i]);
        }
    }
}

int main(void) {
    /* normal: 12 values, d = 4 */
    int normal[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120};
    int normal_expected[] = {50, 60, 70, 80, 90, 100, 110, 120, 10, 20, 30, 40};
    check_rotation("normal d=4", normal, 12, 4, normal_expected);

    /* d = 0: no change */
    int d_zero[] = {4, 9, 15, 23, 2, 31, 8, 19, 6, 27};
    int d_zero_expected[] = {4, 9, 15, 23, 2, 31, 8, 19, 6, 27};
    check_rotation("d=0", d_zero, 10, 0, d_zero_expected);

    /* d = n: d % n = 0, still no change */
    int d_eq_n[] = {5, 12, 18, 24, 3, 30, 9, 21, 15, 6};
    int d_eq_n_expected[] = {5, 12, 18, 24, 3, 30, 9, 21, 15, 6};
    check_rotation("d=n", d_eq_n, 10, 10, d_eq_n_expected);

    /* d > n: reduced by d%n (d=23, n=10 -> effective d=3) */
    int d_gt_n[] = {7, 14, 21, 2, 28, 9, 35, 16, 4, 22};
    int d_gt_n_expected[] = {2, 28, 9, 35, 16, 4, 22, 7, 14, 21};
    check_rotation("d>n", d_gt_n, 10, 23, d_gt_n_expected);

    /* empty array: n = 0 must not crash (division-by-zero guard) regardless of d */
    int empty[1];
    rotate_left(empty, 0, 5);
    CHECK(1);   /* reaching here means no crash */
    rotate_left(empty, 0, 0);
    CHECK(1);

    /* one element: rotating never changes it, for any d */
    int one[] = {77};
    int one_expected[] = {77};
    check_rotation("one element d=0", one, 1, 0, one_expected);
    int one2[] = {77};
    check_rotation("one element d=1", one2, 1, 1, one_expected);
    int one3[] = {77};
    check_rotation("one element large d", one3, 1, 999, one_expected);

    /* two elements: d=1 swaps them */
    int two[] = {1, 2};
    int two_expected[] = {2, 1};
    check_rotation("two elements d=1", two, 2, 1, two_expected);

    /* duplicates and negatives, d near half */
    int hard[] = {3, -8, 15, 3, 22, -1, 40, 9, -17, 26, 5, -30, 11, 3, 18};
    int hard_expected[15];
    for (int i = 0; i < 15; i++) hard_expected[i] = hard[(i + 7) % 15];
    check_rotation("hard d=7", hard, 15, 7, hard_expected);

    /* INT_MIN/INT_MAX among the values */
    int extreme[] = {2147483647, -2147483648, 0, 5, -5};
    int extreme_expected[5];
    for (int i = 0; i < 5; i++) extreme_expected[i] = extreme[(i + 2) % 5];
    check_rotation("extreme values d=2", extreme, 5, 2, extreme_expected);

    /* reverse-sorted input */
    int rev[] = {50, 40, 30, 20, 10};
    int rev_expected[5];
    for (int i = 0; i < 5; i++) rev_expected[i] = rev[(i + 3) % 5];
    check_rotation("reverse-sorted d=3", rev, 5, 3, rev_expected);

    TEST_SUMMARY();
}
