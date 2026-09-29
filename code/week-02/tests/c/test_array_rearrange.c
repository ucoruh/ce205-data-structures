/* Unit tests for code/week-02/c/array_rearrange.c: segregate().
   Independent oracle: two invariants checked WITHOUT re-running segregate's own two-pointer logic --
   (1) the multiset of values is unchanged (verified by insertion-sorting a copy of the original and a copy
   of the result, a different algorithm from segregate's partition scan, and comparing them element-wise);
   (2) every negative value in the result sits before every non-negative value. */
#define main program_main
#include "../../c/array_rearrange.c"
#undef main
#include "../../../test_check.h"

static void insertion_sort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}

static void check_segregation(const char *label, int arr[], int n) {
    int original[64], result_sorted[64], original_sorted[64];
    for (int i = 0; i < n; i++) original[i] = arr[i];

    segregate(arr, n);

    /* invariant 1: same multiset of values before and after */
    for (int i = 0; i < n; i++) { original_sorted[i] = original[i]; result_sorted[i] = arr[i]; }
    insertion_sort(original_sorted, n);
    insertion_sort(result_sorted, n);
    for (int i = 0; i < n; i++) {
        test_checks++;
        if (original_sorted[i] != result_sorted[i]) {
            test_failures++;
            fprintf(stderr, "%s: multiset mismatch at sorted index %d\n", label, i);
        }
    }

    /* invariant 2: no negative value appears after a non-negative value */
    int seen_nonnegative = 0;
    int violated = 0;
    for (int i = 0; i < n; i++) {
        if (arr[i] >= 0) seen_nonnegative = 1;
        else if (seen_nonnegative) violated = 1;
    }
    test_checks++;
    if (violated) { test_failures++; fprintf(stderr, "%s: a negative value follows a non-negative one\n", label); }
}

int main(void) {
    int normal[] = {12, -7, 5, -3, 9, -1, -8, 6, 15, -20, 3, -4};
    check_segregation("normal", normal, 12);

    int hard[] = {0, -5, 3, -5, 0, 8, -12, 0, 4, -3, 7, -7, 0, 9, -2};
    check_segregation("hard (zeros/duplicates)", hard, 15);

    int all_negative[] = {-3, -8, -1, -15, -22, -4, -9, -17, -2, -6};
    check_segregation("all negative", all_negative, 10);

    int all_nonnegative[] = {4, 0, 9, 15, 2, 8, 0, 11, 6, 3};
    check_segregation("all non-negative (incl. zero)", all_nonnegative, 10);

    int already[] = {-5, -3, -8, -1, -9, 2, 4, 6, 8, 10, 12, 14};
    check_segregation("already segregated", already, 12);

    /* empty array */
    int empty[1];
    check_segregation("empty", empty, 0);

    /* one element: negative, zero, positive */
    int one_neg[] = {-5};
    check_segregation("one element negative", one_neg, 1);
    int one_zero[] = {0};
    check_segregation("one element zero", one_zero, 1);
    int one_pos[] = {5};
    check_segregation("one element positive", one_pos, 1);

    /* two elements: every sign combination */
    int two_nn[] = {-3, -8};
    check_segregation("two negative", two_nn, 2);
    int two_pp[] = {3, 8};
    check_segregation("two non-negative", two_pp, 2);
    int two_np[] = {-3, 8};
    check_segregation("negative then non-negative", two_np, 2);
    int two_pn[] = {3, -8};
    check_segregation("non-negative then negative", two_pn, 2);

    /* INT_MIN/INT_MAX present */
    int extreme[] = {2147483647, -2147483648, 0, -1, 1};
    check_segregation("INT_MIN/INT_MAX", extreme, 5);

    TEST_SUMMARY();
}
