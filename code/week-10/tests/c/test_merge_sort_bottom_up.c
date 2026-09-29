/* Unit tests for week-10 c/merge_sort_bottom_up.c */
#include <limits.h>

#define main program_main
#include "../../c/merge_sort_bottom_up.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    int tmp[32];

    /* -- empty array: width(1) < n(0) never holds -- */
    { int a[1] = {0}; comparisons = 0; moves = 0; merge_sort_bottom_up(a, 0, tmp);
      CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(moves, 0); }

    /* -- one element: width(1) < n(1) never holds -- */
    { int a[] = {42}; comparisons = 0; moves = 0; merge_sort_bottom_up(a, 1, tmp);
      CHECK_EQ_INT(a[0], 42); CHECK_EQ_INT(comparisons, 0); }

    /* -- two elements, already ordered -- */
    { int a[] = {1, 2}; comparisons = 0; moves = 0; merge_sort_bottom_up(a, 2, tmp);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(comparisons, 1); }

    /* -- two elements, out of order -- */
    { int a[] = {2, 1}; comparisons = 0; moves = 0; merge_sort_bottom_up(a, 2, tmp);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); }

    /* -- normal case -- */
    { int a[] = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6}; comparisons = 0; moves = 0;
      merge_sort_bottom_up(a, 10, tmp);
      int want[] = {3, 6, 9, 10, 15, 27, 31, 38, 43, 82};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- power-of-two (16): exact rounds, hand-computed moves = n*log2(n) = 64 -- */
    { int a[] = {16, 3, 9, 14, 1, 12, 7, 10, 5, 15, 2, 11, 8, 13, 4, 6}; comparisons = 0; moves = 0;
      merge_sort_bottom_up(a, 16, tmp);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16};
      CHECK(arrays_equal(a, want, 16));
      CHECK_EQ_INT(moves, 64); /* 4 rounds, 16 moves each */ }

    /* -- already sorted -- */
    { int a[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; comparisons = 0; moves = 0;
      merge_sort_bottom_up(a, 12, tmp);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
      CHECK(arrays_equal(a, want, 12)); }

    /* -- reverse sorted -- */
    { int a[] = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; comparisons = 0; moves = 0;
      merge_sort_bottom_up(a, 12, tmp);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
      CHECK(arrays_equal(a, want, 12)); }

    /* -- duplicates -- */
    { int a[] = {5, 3, 5, 1, 3, 5, 1, 3, 5, 1}; comparisons = 0; moves = 0;
      merge_sort_bottom_up(a, 10, tmp);
      int want[] = {1, 1, 1, 3, 3, 3, 5, 5, 5, 5};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- all equal -- */
    { int a[] = {7, 7, 7, 7, 7, 7}; comparisons = 0; moves = 0;
      merge_sort_bottom_up(a, 6, tmp);
      int want[] = {7, 7, 7, 7, 7, 7};
      CHECK(arrays_equal(a, want, 6)); }

    /* -- negative values -- */
    { int a[] = {-5, 3, -1, -100, 42, 0}; comparisons = 0; moves = 0;
      merge_sort_bottom_up(a, 6, tmp);
      int want[] = {-100, -5, -1, 0, 3, 42};
      CHECK(arrays_equal(a, want, 6)); }

    /* -- INT_MIN / INT_MAX -- */
    { int a[] = {INT_MAX, 0, INT_MIN, 1, -1}; comparisons = 0; moves = 0;
      merge_sort_bottom_up(a, 5, tmp);
      int want[] = {INT_MIN, -1, 0, 1, INT_MAX};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- non-power-of-two (14): a final partial run -- */
    { int a[] = {45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20}; comparisons = 0; moves = 0;
      merge_sort_bottom_up(a, 14, tmp);
      int want[] = {2, 6, 9, 11, 14, 18, 20, 24, 29, 33, 36, 38, 41, 45};
      CHECK(arrays_equal(a, want, 14)); }

    /* -- integration -- */
    program_main();

    TEST_SUMMARY();
}
