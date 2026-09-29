/* Unit tests for week-10 c/merge_sort.c */
#include <limits.h>

#define main program_main
#include "../../c/merge_sort.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    int tmp[32];

    /* -- empty array -- */
    { int a[1] = {0}; comparisons = 0; moves = 0; merge_sort(a, 0, 0, tmp);
      CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(moves, 0); }

    /* -- one element: base case, no merges -- */
    { int a[] = {42}; comparisons = 0; moves = 0; merge_sort(a, 0, 1, tmp);
      CHECK_EQ_INT(a[0], 42); CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(moves, 0); }

    /* -- two elements, already ordered: one merge, one comparison -- */
    { int a[] = {1, 2}; comparisons = 0; moves = 0; merge_sort(a, 0, 2, tmp);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(comparisons, 1); CHECK_EQ_INT(moves, 2); }

    /* -- two elements, out of order -- */
    { int a[] = {2, 1}; comparisons = 0; moves = 0; merge_sort(a, 0, 2, tmp);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(comparisons, 1); CHECK_EQ_INT(moves, 2); }

    /* -- normal case -- */
    { int a[] = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6}; comparisons = 0; moves = 0;
      merge_sort(a, 0, 10, tmp);
      int want[] = {3, 6, 9, 10, 15, 27, 31, 38, 43, 82};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- already sorted -- */
    { int a[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; comparisons = 0; moves = 0;
      merge_sort(a, 0, 12, tmp);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
      CHECK(arrays_equal(a, want, 12)); }

    /* -- reverse sorted -- */
    { int a[] = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; comparisons = 0; moves = 0;
      merge_sort(a, 0, 12, tmp);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
      CHECK(arrays_equal(a, want, 12)); }

    /* -- duplicates -- */
    { int a[] = {5, 3, 5, 1, 3, 5, 1, 3, 5, 1}; comparisons = 0; moves = 0;
      merge_sort(a, 0, 10, tmp);
      int want[] = {1, 1, 1, 3, 3, 3, 5, 5, 5, 5};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- all equal -- */
    { int a[] = {7, 7, 7, 7, 7, 7}; comparisons = 0; moves = 0;
      merge_sort(a, 0, 6, tmp);
      int want[] = {7, 7, 7, 7, 7, 7};
      CHECK(arrays_equal(a, want, 6)); }

    /* -- always exactly n moves per merge round: total moves for n=8 is n*log2(n) = 24 -- */
    { int a[] = {8, 7, 6, 5, 4, 3, 2, 1}; comparisons = 0; moves = 0;
      merge_sort(a, 0, 8, tmp);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8};
      CHECK(arrays_equal(a, want, 8));
      CHECK_EQ_INT(moves, 24); /* 3 rounds, 8 moves each */ }

    /* -- negative values -- */
    { int a[] = {-5, 3, -1, -100, 42, 0}; comparisons = 0; moves = 0;
      merge_sort(a, 0, 6, tmp);
      int want[] = {-100, -5, -1, 0, 3, 42};
      CHECK(arrays_equal(a, want, 6)); }

    /* -- INT_MIN / INT_MAX -- */
    { int a[] = {INT_MAX, 0, INT_MIN, 1, -1}; comparisons = 0; moves = 0;
      merge_sort(a, 0, 5, tmp);
      int want[] = {INT_MIN, -1, 0, 1, INT_MAX};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- odd size (uneven splits), matches the animation's uneven-split note -- */
    { int a[] = {45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20}; comparisons = 0; moves = 0;
      merge_sort(a, 0, 14, tmp);
      int want[] = {2, 6, 9, 11, 14, 18, 20, 24, 29, 33, 36, 38, 41, 45};
      CHECK(arrays_equal(a, want, 14)); }

    /* -- integration -- */
    program_main();

    TEST_SUMMARY();
}
