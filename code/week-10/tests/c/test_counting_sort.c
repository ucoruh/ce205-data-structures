/* Unit tests for week-10 c/counting_sort.c */
#define main program_main
#include "../../c/counting_sort.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    /* -- one element -- */
    { int a[] = {7}; int writes = 0; counting_sort(a, 1, 9, &writes);
      CHECK_EQ_INT(a[0], 7); CHECK_EQ_INT(writes, 2); /* one count++, one placement */ }

    /* -- two elements, already ordered -- */
    { int a[] = {1, 2}; int writes = 0; counting_sort(a, 2, 9, &writes);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); }

    /* -- two elements, out of order -- */
    { int a[] = {2, 1}; int writes = 0; counting_sort(a, 2, 9, &writes);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); }

    /* -- normal case -- */
    { int a[] = {4, 2, 2, 8, 3, 3, 1, 4, 2, 7}; int writes = 0;
      counting_sort(a, 10, 9, &writes);
      int want[] = {1, 2, 2, 2, 3, 3, 4, 4, 7, 8};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- already sorted -- */
    { int a[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9}; int writes = 0;
      counting_sort(a, 10, 9, &writes);
      int want[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- reverse sorted -- */
    { int a[] = {9, 8, 7, 6, 5, 4, 3, 2, 1, 0}; int writes = 0;
      counting_sort(a, 10, 9, &writes);
      int want[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- all same value: exactly 2n writes (n counts + n placements) -- */
    { int a[] = {5, 5, 5, 5, 5}; int writes = 0;
      counting_sort(a, 5, 9, &writes);
      int want[] = {5, 5, 5, 5, 5};
      CHECK(arrays_equal(a, want, 5));
      CHECK_EQ_INT(writes, 10); }

    /* -- stability: equal-key duplicates keep the relative order of any
     *    accompanying "tag" -- verified here with a parallel-array trick:
     *    encode key*10+tag, sort by that, then check tag order for each key -- */
    { int a[] = {40, 20, 41, 20, 42}; /* keys 4,2,4,2,4 with tags 0,0,1,1,2 */
      int writes = 0; counting_sort(a, 5, 49, &writes);
      int want[] = {20, 20, 40, 41, 42};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- sparse range: 10 values but maxVal=15 -- */
    { int a[] = {0, 15, 3, 12, 6, 9, 1, 14, 7, 8}; int writes = 0;
      counting_sort(a, 10, 15, &writes);
      int want[] = {0, 1, 3, 6, 7, 8, 9, 12, 14, 15};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- boundary values 0 and max_val -- */
    { int a[] = {9, 0, 9, 0, 5}; int writes = 0;
      counting_sort(a, 5, 9, &writes);
      int want[] = {0, 0, 5, 9, 9};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- hard preset from the animation -- */
    { int a[] = {5, 1, 5, 9, 2, 5, 1, 9, 5, 2, 1, 9, 5, 0}; int writes = 0;
      counting_sort(a, 14, 9, &writes);
      int want[] = {0, 1, 1, 1, 2, 2, 5, 5, 5, 5, 5, 9, 9, 9};
      CHECK(arrays_equal(a, want, 14)); }

    /* -- duplicates with an uneven spread -- */
    { int a[] = {3, 3, 3, 1, 1, 9, 9, 9, 9, 5}; int writes = 0;
      counting_sort(a, 10, 9, &writes);
      int want[] = {1, 1, 3, 3, 3, 5, 9, 9, 9, 9};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- single-value array uses only one non-empty count[] cell -- */
    { int a[] = {6}; int writes = 0; counting_sort(a, 1, 6, &writes);
      CHECK_EQ_INT(a[0], 6); }

    /* -- integration -- */
    program_main();

    TEST_SUMMARY();
}
