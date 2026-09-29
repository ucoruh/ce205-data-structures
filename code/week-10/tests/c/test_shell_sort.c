/* Unit tests for week-10 c/shell_sort.c */
#include <limits.h>

#define main program_main
#include "../../c/shell_sort.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    int comparisons, shifts;

    /* -- empty array: n/2 == 0, no round ever runs -- */
    { int a[1] = {0}; comparisons = 0; shifts = 0; shell_sort(a, 0, &comparisons, &shifts);
      CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(shifts, 0); }

    /* -- one element: n/2 == 0, no round ever runs -- */
    { int a[] = {42}; comparisons = 0; shifts = 0; shell_sort(a, 1, &comparisons, &shifts);
      CHECK_EQ_INT(a[0], 42); CHECK_EQ_INT(comparisons, 0); }

    /* -- two elements, already ordered -- */
    { int a[] = {1, 2}; comparisons = 0; shifts = 0; shell_sort(a, 2, &comparisons, &shifts);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); }

    /* -- two elements, out of order -- */
    { int a[] = {2, 1}; comparisons = 0; shifts = 0; shell_sort(a, 2, &comparisons, &shifts);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); CHECK(shifts >= 1); }

    /* -- normal case -- */
    { int a[] = {23, 9, 41, 5, 33, 17, 2, 46, 12, 28}; comparisons = 0; shifts = 0;
      shell_sort(a, 10, &comparisons, &shifts);
      int want[] = {2, 5, 9, 12, 17, 23, 28, 33, 41, 46};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- already sorted: zero shifts at every gap -- */
    { int a[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; comparisons = 0; shifts = 0;
      shell_sort(a, 12, &comparisons, &shifts);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
      CHECK(arrays_equal(a, want, 12));
      CHECK_EQ_INT(shifts, 0); }

    /* -- reverse sorted -- */
    { int a[] = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; comparisons = 0; shifts = 0;
      shell_sort(a, 12, &comparisons, &shifts);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
      CHECK(arrays_equal(a, want, 12)); }

    /* -- duplicates -- */
    { int a[] = {6, 2, 6, 2, 6, 2, 6, 2, 6, 2}; comparisons = 0; shifts = 0;
      shell_sort(a, 10, &comparisons, &shifts);
      int want[] = {2, 2, 2, 2, 2, 6, 6, 6, 6, 6};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- all equal: never strictly greater, so zero shifts -- */
    { int a[] = {4, 4, 4, 4, 4, 4}; comparisons = 0; shifts = 0;
      shell_sort(a, 6, &comparisons, &shifts);
      CHECK_EQ_INT(shifts, 0); }

    /* -- negative values -- */
    { int a[] = {-5, 3, -1, -100, 42, 0}; comparisons = 0; shifts = 0;
      shell_sort(a, 6, &comparisons, &shifts);
      int want[] = {-100, -5, -1, 0, 3, 42};
      CHECK(arrays_equal(a, want, 6)); }

    /* -- INT_MIN / INT_MAX -- */
    { int a[] = {INT_MAX, 0, INT_MIN, 1, -1}; comparisons = 0; shifts = 0;
      shell_sort(a, 5, &comparisons, &shifts);
      int want[] = {INT_MIN, -1, 0, 1, INT_MAX};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- power-of-two size (16): exercises the full 8,4,2,1 gap sequence -- */
    { int a[] = {16, 3, 9, 14, 1, 12, 7, 10, 5, 15, 2, 11, 8, 13, 4, 6}; comparisons = 0; shifts = 0;
      shell_sort(a, 16, &comparisons, &shifts);
      int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16};
      CHECK(arrays_equal(a, want, 16)); }

    /* -- extreme preset (11 values), matches the animation's extreme preset -- */
    { int a[] = {0, 2147483647, -2147483648, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1};
      comparisons = 0; shifts = 0; shell_sort(a, 11, &comparisons, &shifts);
      int want[] = {-2147483648, -2147483647, -1000000, -5, -1, 0, 1, 5, 1000000, 2147483646, 2147483647};
      CHECK(arrays_equal(a, want, 11)); }

    /* -- integration -- */
    program_main();

    TEST_SUMMARY();
}
