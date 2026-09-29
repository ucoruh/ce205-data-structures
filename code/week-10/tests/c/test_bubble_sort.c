/* Unit tests for week-10 c/bubble_sort.c */
#include <limits.h>

#define main program_main
#include "../../c/bubble_sort.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    int comparisons, swaps;

    /* -- empty array: nothing to do, counters stay 0 -- */
    { int a[1] = {0}; comparisons = 0; swaps = 0; bubble_sort(a, 0, &comparisons, &swaps);
      CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(swaps, 0); }

    /* -- one element: already sorted, no comparisons possible -- */
    { int a[] = {42}; comparisons = 0; swaps = 0; bubble_sort(a, 1, &comparisons, &swaps);
      CHECK_EQ_INT(a[0], 42); CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(swaps, 0); }

    /* -- two elements, already in order: one comparison, no swap -- */
    { int a[] = {1, 2}; comparisons = 0; swaps = 0; bubble_sort(a, 2, &comparisons, &swaps);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(comparisons, 1); CHECK_EQ_INT(swaps, 0); }

    /* -- two elements, out of order: one comparison, one swap -- */
    { int a[] = {2, 1}; comparisons = 0; swaps = 0; bubble_sort(a, 2, &comparisons, &swaps);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(comparisons, 1); CHECK_EQ_INT(swaps, 1); }

    /* -- normal case: hand-computed expected sorted array -- */
    { int a[] = {5, 2, 9, 1, 7, 3, 8, 4, 6, 0}; comparisons = 0; swaps = 0;
      bubble_sort(a, 10, &comparisons, &swaps);
      int want[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- already sorted (12 values): early exit after exactly one pass, so
     *    exactly n-1 comparisons and zero swaps -- an independent hand count -- */
    { int a[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; comparisons = 0; swaps = 0;
      bubble_sort(a, 12, &comparisons, &swaps);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
      CHECK(arrays_equal(a, want, 12));
      CHECK_EQ_INT(comparisons, 11);
      CHECK_EQ_INT(swaps, 0); }

    /* -- reverse sorted: worst case, hand-computed swap count = n*(n-1)/2 -- */
    { int a[] = {5, 4, 3, 2, 1}; comparisons = 0; swaps = 0;
      bubble_sort(a, 5, &comparisons, &swaps);
      int want[] = {1, 2, 3, 4, 5};
      CHECK(arrays_equal(a, want, 5));
      CHECK_EQ_INT(swaps, 10); /* 5*4/2 */ }

    /* -- duplicates: multiset preserved, result sorted -- */
    { int a[] = {7, 3, 7, 1, 3, 9, 1, 7, 9, 3}; comparisons = 0; swaps = 0;
      bubble_sort(a, 10, &comparisons, &swaps);
      int want[] = {1, 1, 3, 3, 3, 7, 7, 7, 9, 9};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- all equal: zero swaps ever (never strictly greater) -- */
    { int a[] = {4, 4, 4, 4, 4}; comparisons = 0; swaps = 0;
      bubble_sort(a, 5, &comparisons, &swaps);
      CHECK_EQ_INT(swaps, 0); }

    /* -- negative values -- */
    { int a[] = {-5, 3, -1, -100, 42, 0}; comparisons = 0; swaps = 0;
      bubble_sort(a, 6, &comparisons, &swaps);
      int want[] = {-100, -5, -1, 0, 3, 42};
      CHECK(arrays_equal(a, want, 6)); }

    /* -- INT_MIN / INT_MAX round-trip correctly -- */
    { int a[] = {INT_MAX, 0, INT_MIN, 1, -1}; comparisons = 0; swaps = 0;
      bubble_sort(a, 5, &comparisons, &swaps);
      int want[] = {INT_MIN, -1, 0, 1, INT_MAX};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- extreme values (11), matches the animation's extreme preset -- */
    { int a[] = {2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1};
      comparisons = 0; swaps = 0; bubble_sort(a, 11, &comparisons, &swaps);
      int want[] = {-2147483648, -2147483647, -1000000, -5, -1, 0, 1, 5, 1000000, 2147483646, 2147483647};
      CHECK(arrays_equal(a, want, 11)); }

    /* -- integration: the real main() runs without crashing (exercises print paths) -- */
    program_main();

    TEST_SUMMARY();
}
