/* Unit tests for week-10 c/quick_sort_lomuto.c */
#include <limits.h>

#define main program_main
#include "../../c/quick_sort_lomuto.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    /* -- empty range: lo > hi, nothing happens -- */
    { int a[1] = {0}; comparisons = 0; swaps = 0; quick_sort_lomuto(a, 0, -1);
      CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(swaps, 0); }

    /* -- one element: lo == hi, lo < hi is false -- */
    { int a[] = {42}; comparisons = 0; swaps = 0; quick_sort_lomuto(a, 0, 0);
      CHECK_EQ_INT(a[0], 42); CHECK_EQ_INT(comparisons, 0); }

    /* -- two elements, already ordered -- */
    { int a[] = {1, 2}; comparisons = 0; swaps = 0; quick_sort_lomuto(a, 0, 1);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(comparisons, 1); }

    /* -- two elements, out of order -- */
    { int a[] = {2, 1}; comparisons = 0; swaps = 0; quick_sort_lomuto(a, 0, 1);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); }

    /* -- partition_lomuto directly: hand-computed pivot position -- */
    { int a[] = {5, 2, 8, 1, 9, 3}; /* pivot = a[5] = 3 */
      comparisons = 0; swaps = 0;
      int p = partition_lomuto(a, 0, 5);
      CHECK_EQ_INT(a[p], 3);
      for (int i = 0; i < p; i++) CHECK(a[i] <= 3);
      for (int i = p + 1; i < 6; i++) CHECK(a[i] > 3); }

    /* -- normal case -- */
    { int a[] = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6}; comparisons = 0; swaps = 0;
      quick_sort_lomuto(a, 0, 9);
      int want[] = {3, 6, 9, 10, 15, 27, 31, 38, 43, 82};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- already sorted: worst case, hand-computed comparisons = n*(n-1)/2 -- */
    { int a[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}; comparisons = 0; swaps = 0;
      quick_sort_lomuto(a, 0, 9);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
      CHECK(arrays_equal(a, want, 10));
      CHECK_EQ_INT(comparisons, 45); /* 9+8+...+1 */ }

    /* -- reverse sorted: also worst case -- */
    { int a[] = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; comparisons = 0; swaps = 0;
      quick_sort_lomuto(a, 0, 9);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
      CHECK(arrays_equal(a, want, 10));
      CHECK_EQ_INT(comparisons, 45); }

    /* -- all equal: every element <= pivot, one swap into place per level -- */
    { int a[] = {5, 5, 5, 5, 5, 5, 5, 5, 5, 5}; comparisons = 0; swaps = 0;
      quick_sort_lomuto(a, 0, 9);
      int want[] = {5, 5, 5, 5, 5, 5, 5, 5, 5, 5};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- repeated keys -- */
    { int a[] = {7, 2, 7, 9, 2, 7, 4, 9, 2, 4, 7, 9}; comparisons = 0; swaps = 0;
      quick_sort_lomuto(a, 0, 11);
      int want[] = {2, 2, 2, 4, 4, 7, 7, 7, 7, 9, 9, 9};
      CHECK(arrays_equal(a, want, 12)); }

    /* -- negative values -- */
    { int a[] = {-5, 3, -1, -100, 42, 0}; comparisons = 0; swaps = 0;
      quick_sort_lomuto(a, 0, 5);
      int want[] = {-100, -5, -1, 0, 3, 42};
      CHECK(arrays_equal(a, want, 6)); }

    /* -- INT_MIN / INT_MAX -- */
    { int a[] = {INT_MAX, 0, INT_MIN, 1, -1}; comparisons = 0; swaps = 0;
      quick_sort_lomuto(a, 0, 4);
      int want[] = {INT_MIN, -1, 0, 1, INT_MAX};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- integration -- */
    program_main();

    TEST_SUMMARY();
}
