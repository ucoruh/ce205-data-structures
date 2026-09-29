/* Unit tests for week-10 c/selection_sort.c */
#include <limits.h>

#define main program_main
#include "../../c/selection_sort.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    int comparisons, swaps;

    /* -- empty array -- */
    { int a[1] = {0}; comparisons = 0; swaps = 0; selection_sort(a, 0, &comparisons, &swaps);
      CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(swaps, 0); }

    /* -- one element -- */
    { int a[] = {42}; comparisons = 0; swaps = 0; selection_sort(a, 1, &comparisons, &swaps);
      CHECK_EQ_INT(a[0], 42); CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(swaps, 0); }

    /* -- two elements, already ordered: 1 comparison, 0 swaps -- */
    { int a[] = {1, 2}; comparisons = 0; swaps = 0; selection_sort(a, 2, &comparisons, &swaps);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(comparisons, 1); CHECK_EQ_INT(swaps, 0); }

    /* -- two elements, out of order: 1 comparison, 1 swap -- */
    { int a[] = {2, 1}; comparisons = 0; swaps = 0; selection_sort(a, 2, &comparisons, &swaps);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(swaps, 1); }

    /* -- normal case -- */
    { int a[] = {29, 10, 14, 37, 14, 22, 5, 41, 18, 33}; comparisons = 0; swaps = 0;
      selection_sort(a, 10, &comparisons, &swaps);
      int want[] = {5, 10, 14, 14, 18, 22, 29, 33, 37, 41};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- always O(n^2) comparisons regardless of input: hand-computed n(n-1)/2 -- */
    { int a[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; comparisons = 0; swaps = 0;
      selection_sort(a, 12, &comparisons, &swaps);
      CHECK_EQ_INT(comparisons, 66); /* 12*11/2 */
      CHECK_EQ_INT(swaps, 0); /* already sorted: every min_idx == i */ }

    /* -- reverse sorted: at most n-1 swaps -- */
    { int a[] = {5, 4, 3, 2, 1}; comparisons = 0; swaps = 0;
      selection_sort(a, 5, &comparisons, &swaps);
      int want[] = {1, 2, 3, 4, 5};
      CHECK(arrays_equal(a, want, 5));
      CHECK_EQ_INT(comparisons, 10); /* 5*4/2 */
      CHECK(swaps <= 4); }

    /* -- duplicates: ties keep the first minimum found -- */
    { int a[] = {4, 4, 2, 4, 2, 4, 2, 4, 4, 2}; comparisons = 0; swaps = 0;
      selection_sort(a, 10, &comparisons, &swaps);
      int want[] = {2, 2, 2, 2, 4, 4, 4, 4, 4, 4};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- all equal: minimum is always the current i, zero swaps -- */
    { int a[] = {7, 7, 7, 7, 7}; comparisons = 0; swaps = 0;
      selection_sort(a, 5, &comparisons, &swaps);
      CHECK_EQ_INT(swaps, 0); }

    /* -- negative values -- */
    { int a[] = {-5, 3, -1, -100, 42, 0}; comparisons = 0; swaps = 0;
      selection_sort(a, 6, &comparisons, &swaps);
      int want[] = {-100, -5, -1, 0, 3, 42};
      CHECK(arrays_equal(a, want, 6)); }

    /* -- INT_MIN / INT_MAX -- */
    { int a[] = {INT_MAX, 0, INT_MIN, 1, -1}; comparisons = 0; swaps = 0;
      selection_sort(a, 5, &comparisons, &swaps);
      int want[] = {INT_MIN, -1, 0, 1, INT_MAX};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- extreme preset (11 values) -- */
    { int a[] = {2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1};
      comparisons = 0; swaps = 0; selection_sort(a, 11, &comparisons, &swaps);
      int want[] = {-2147483648, -2147483647, -1000000, -5, -1, 0, 1, 5, 1000000, 2147483646, 2147483647};
      CHECK(arrays_equal(a, want, 11)); }

    /* -- integration: main() runs without crashing -- */
    program_main();

    TEST_SUMMARY();
}
