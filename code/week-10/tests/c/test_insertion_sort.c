/* Unit tests for week-10 c/insertion_sort.c */
#include <limits.h>

#define main program_main
#include "../../c/insertion_sort.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    int comparisons, shifts;

    /* -- empty array -- */
    { int a[1] = {0}; comparisons = 0; shifts = 0; insertion_sort(a, 0, &comparisons, &shifts);
      CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(shifts, 0); }

    /* -- one element -- */
    { int a[] = {42}; comparisons = 0; shifts = 0; insertion_sort(a, 1, &comparisons, &shifts);
      CHECK_EQ_INT(a[0], 42); CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(shifts, 0); }

    /* -- two elements, already ordered: 1 comparison, 0 shifts -- */
    { int a[] = {1, 2}; comparisons = 0; shifts = 0; insertion_sort(a, 2, &comparisons, &shifts);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(comparisons, 1); CHECK_EQ_INT(shifts, 0); }

    /* -- two elements, out of order: 1 comparison, 1 shift -- */
    { int a[] = {2, 1}; comparisons = 0; shifts = 0; insertion_sort(a, 2, &comparisons, &shifts);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(shifts, 1); }

    /* -- normal case -- */
    { int a[] = {31, 12, 25, 8, 19, 40, 3, 27, 15, 22}; comparisons = 0; shifts = 0;
      insertion_sort(a, 10, &comparisons, &shifts);
      int want[] = {3, 8, 12, 15, 19, 22, 25, 27, 31, 40};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- already sorted: best case, exactly one comparison per i (n-1), zero shifts -- */
    { int a[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; comparisons = 0; shifts = 0;
      insertion_sort(a, 12, &comparisons, &shifts);
      CHECK_EQ_INT(comparisons, 11);
      CHECK_EQ_INT(shifts, 0); }

    /* -- reverse sorted: worst case, hand-computed n*(n-1)/2 shifts -- */
    { int a[] = {5, 4, 3, 2, 1}; comparisons = 0; shifts = 0;
      insertion_sort(a, 5, &comparisons, &shifts);
      int want[] = {1, 2, 3, 4, 5};
      CHECK(arrays_equal(a, want, 5));
      CHECK_EQ_INT(shifts, 10); /* 5*4/2 */ }

    /* -- duplicates: stable, a tie stops the shift immediately -- */
    { int a[] = {5, 3, 5, 1, 3, 5, 1, 3, 5, 1}; comparisons = 0; shifts = 0;
      insertion_sort(a, 10, &comparisons, &shifts);
      int want[] = {1, 1, 1, 3, 3, 3, 5, 5, 5, 5};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- all equal: zero shifts, since a[j] <= key is true immediately -- */
    { int a[] = {6, 6, 6, 6, 6}; comparisons = 0; shifts = 0;
      insertion_sort(a, 5, &comparisons, &shifts);
      CHECK_EQ_INT(shifts, 0); }

    /* -- negative values -- */
    { int a[] = {-5, 3, -1, -100, 42, 0}; comparisons = 0; shifts = 0;
      insertion_sort(a, 6, &comparisons, &shifts);
      int want[] = {-100, -5, -1, 0, 3, 42};
      CHECK(arrays_equal(a, want, 6)); }

    /* -- INT_MIN / INT_MAX -- */
    { int a[] = {INT_MAX, 0, INT_MIN, 1, -1}; comparisons = 0; shifts = 0;
      insertion_sort(a, 5, &comparisons, &shifts);
      int want[] = {INT_MIN, -1, 0, 1, INT_MAX};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- extreme preset (11 values) -- */
    { int a[] = {0, 2147483647, -2147483648, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1};
      comparisons = 0; shifts = 0; insertion_sort(a, 11, &comparisons, &shifts);
      int want[] = {-2147483648, -2147483647, -1000000, -5, -1, 0, 1, 5, 1000000, 2147483646, 2147483647};
      CHECK(arrays_equal(a, want, 11)); }

    /* -- integration -- */
    program_main();

    TEST_SUMMARY();
}
