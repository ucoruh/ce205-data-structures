/* Unit tests for week-10 c/radix_sort_lsd.c */
#define main program_main
#include "../../c/radix_sort_lsd.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    /* -- get_digit: hand-computed digit extraction -- */
    CHECK_EQ_INT(get_digit(329, 1), 9);
    CHECK_EQ_INT(get_digit(329, 10), 2);
    CHECK_EQ_INT(get_digit(329, 100), 3);
    CHECK_EQ_INT(get_digit(5, 10), 0);

    /* -- empty array (also exercises the n<=0 guard: a[0] must never be read) -- */
    { int a[1] = {0}; int writes = 0; radix_sort_lsd(a, 0, &writes);
      CHECK_EQ_INT(writes, 0); }

    /* -- one element -- */
    { int a[] = {7}; int writes = 0; radix_sort_lsd(a, 1, &writes);
      CHECK_EQ_INT(a[0], 7); }

    /* -- two elements, already ordered -- */
    { int a[] = {1, 2}; int writes = 0; radix_sort_lsd(a, 2, &writes);
      int want[] = {1, 2}; CHECK(arrays_equal(a, want, 2)); }

    /* -- two elements, out of order -- */
    { int a[] = {20, 3}; int writes = 0; radix_sort_lsd(a, 2, &writes);
      int want[] = {3, 20}; CHECK(arrays_equal(a, want, 2)); }

    /* -- normal case (3-digit values) -- */
    { int a[] = {329, 457, 657, 839, 436, 720, 355, 21, 8, 100}; int writes = 0;
      radix_sort_lsd(a, 10, &writes);
      int want[] = {8, 21, 100, 329, 355, 436, 457, 657, 720, 839};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- already sorted -- */
    { int a[] = {1, 12, 23, 34, 45, 56, 67, 78, 89, 90}; int writes = 0;
      radix_sort_lsd(a, 10, &writes);
      int want[] = {1, 12, 23, 34, 45, 56, 67, 78, 89, 90};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- reverse sorted -- */
    { int a[] = {90, 89, 78, 67, 56, 45, 34, 23, 12, 1}; int writes = 0;
      radix_sort_lsd(a, 10, &writes);
      int want[] = {1, 12, 23, 34, 45, 56, 67, 78, 89, 90};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- all single-digit: only one place, hand-computed writes = 2n -- */
    { int a[] = {4, 2, 9, 1, 7, 3, 8, 0, 6, 5}; int writes = 0;
      radix_sort_lsd(a, 10, &writes);
      int want[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
      CHECK(arrays_equal(a, want, 10));
      CHECK_EQ_INT(writes, 20); }

    /* -- all same value -- */
    { int a[] = {77, 77, 77, 77}; int writes = 0; radix_sort_lsd(a, 4, &writes);
      int want[] = {77, 77, 77, 77};
      CHECK(arrays_equal(a, want, 4)); }

    /* -- mixed digit lengths: shorter numbers act as if left-padded with 0 -- */
    { int a[] = {5, 45, 802, 3, 66, 913, 27, 8, 150, 999}; int writes = 0;
      radix_sort_lsd(a, 10, &writes);
      int want[] = {3, 5, 8, 27, 45, 66, 150, 802, 913, 999};
      CHECK(arrays_equal(a, want, 10)); }

    /* -- zero itself sorts correctly (digit 0 at every place) -- */
    { int a[] = {0, 100, 0, 50}; int writes = 0; radix_sort_lsd(a, 4, &writes);
      int want[] = {0, 0, 50, 100};
      CHECK(arrays_equal(a, want, 4)); }

    /* -- 4-digit values (extra pass) -- */
    { int a[] = {9999, 1, 5000, 2500, 100}; int writes = 0; radix_sort_lsd(a, 5, &writes);
      int want[] = {1, 100, 2500, 5000, 9999};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- integration -- */
    program_main();

    TEST_SUMMARY();
}
