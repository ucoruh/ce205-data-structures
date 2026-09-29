/* Unit tests for week-10 c/bucket_sort.c */
#define main program_main
#include "../../c/bucket_sort.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    /* -- empty array -- */
    { int a[1] = {0}; int comparisons = 0, moves = 0; bucket_sort(a, 0, 99, &comparisons, &moves);
      CHECK_EQ_INT(comparisons, 0); CHECK_EQ_INT(moves, 0); }

    /* -- one element -- */
    { int a[] = {50}; int comparisons = 0, moves = 0; bucket_sort(a, 1, 99, &comparisons, &moves);
      CHECK_EQ_INT(a[0], 50); }

    /* -- two elements, already ordered -- */
    { int a[] = {10, 20}; int comparisons = 0, moves = 0; bucket_sort(a, 2, 99, &comparisons, &moves);
      int want[] = {10, 20}; CHECK(arrays_equal(a, want, 2)); }

    /* -- two elements, out of order, same bucket -- */
    { int a[] = {15, 11}; int comparisons = 0, moves = 0; bucket_sort(a, 2, 99, &comparisons, &moves);
      int want[] = {11, 15}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(comparisons, 1); }

    /* -- normal case, spread across buckets -- */
    { int a[] = {42, 8, 77, 15, 91, 33, 56, 24, 68, 5}; int comparisons = 0, moves = 0;
      bucket_sort(a, 10, 99, &comparisons, &moves);
      int want[] = {5, 8, 15, 24, 33, 42, 56, 68, 77, 91};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- already sorted -- */
    { int a[] = {2, 12, 22, 33, 44, 55, 66, 77, 88, 99}; int comparisons = 0, moves = 0;
      bucket_sort(a, 10, 99, &comparisons, &moves);
      int want[] = {2, 12, 22, 33, 44, 55, 66, 77, 88, 99};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- reverse sorted -- */
    { int a[] = {99, 88, 77, 66, 55, 44, 33, 22, 12, 2}; int comparisons = 0, moves = 0;
      bucket_sort(a, 10, 99, &comparisons, &moves);
      int want[] = {2, 12, 22, 33, 44, 55, 66, 77, 88, 99};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- worst case: all 10 values in ONE bucket, degrades to plain
     *    insertion sort on all n; hand-computed comparisons for reverse
     *    order within the bucket = n*(n-1)/2 = 45 -- */
    { int a[] = {49, 48, 47, 46, 45, 44, 43, 42, 41, 40}; int comparisons = 0, moves = 0;
      bucket_sort(a, 10, 99, &comparisons, &moves);
      int want[] = {40, 41, 42, 43, 44, 45, 46, 47, 48, 49};
      CHECK(arrays_equal(a, want, 10));
      CHECK_EQ_INT(comparisons, 45); }

    /* -- all same value: zero comparisons across the whole sort (a single
     *    bucket with 1-element runs needing no shifting once sorted) --
     *    not literally zero (insertion sort still compares once per pair),
     *    but zero swaps/shifts since nothing is ever out of order -- */
    { int a[] = {23, 23, 23, 23}; int comparisons = 0, moves = 0;
      bucket_sort(a, 4, 99, &comparisons, &moves);
      int want[] = {23, 23, 23, 23};
      CHECK(arrays_equal(a, want, 4)); }

    /* -- duplicates inside the same bucket -- */
    { int a[] = {23, 23, 25, 23, 25, 61, 61, 61, 8, 8}; int comparisons = 0, moves = 0;
      bucket_sort(a, 10, 99, &comparisons, &moves);
      int want[] = {8, 8, 23, 23, 23, 25, 25, 61, 61, 61};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- boundary values: 0 and max_val (99) -- */
    { int a[] = {99, 0, 50, 0, 99}; int comparisons = 0, moves = 0;
      bucket_sort(a, 5, 99, &comparisons, &moves);
      int want[] = {0, 0, 50, 99, 99};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- hard preset with several bucket collisions -- */
    { int a[] = {42, 45, 8, 77, 71, 15, 91, 33, 38, 56, 24, 68, 5, 3}; int comparisons = 0, moves = 0;
      bucket_sort(a, 14, 99, &comparisons, &moves);
      int want[] = {3, 5, 8, 15, 24, 33, 38, 42, 45, 56, 68, 71, 77, 91};
      CHECK(arrays_equal(a, want, 14)); }

    /* -- two elements, different buckets: no comparison ever needed
     *    (each bucket has only one element) -- */
    { int a[] = {5, 95}; int comparisons = 0, moves = 0; bucket_sort(a, 2, 99, &comparisons, &moves);
      int want[] = {5, 95}; CHECK(arrays_equal(a, want, 2)); CHECK_EQ_INT(comparisons, 0); }

    /* -- single value, small max_val (bucket count still fixed at 10) -- */
    { int a[] = {3}; int comparisons = 0, moves = 0; bucket_sort(a, 1, 9, &comparisons, &moves);
      CHECK_EQ_INT(a[0], 3); }

    /* -- integration -- */
    program_main();

    TEST_SUMMARY();
}
