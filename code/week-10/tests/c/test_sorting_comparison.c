/* Unit tests for week-10 c/sorting_comparison.c */
#include <limits.h>

#define main program_main
#include "../../c/sorting_comparison.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    int want10[] = {3, 6, 9, 10, 15, 27, 31, 38, 43, 82};
    int src[] = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};

    /* -- every algorithm produces the SAME sorted result on the same input -- */
    { int a[10]; for (int i = 0; i < 10; i++) a[i] = src[i]; int c = 0, w = 0;
      bubble(a, 10, &c, &w); CHECK(arrays_equal(a, want10, 10)); }
    { int a[10]; for (int i = 0; i < 10; i++) a[i] = src[i]; int c = 0, w = 0;
      selection(a, 10, &c, &w); CHECK(arrays_equal(a, want10, 10)); }
    { int a[10]; for (int i = 0; i < 10; i++) a[i] = src[i]; int c = 0, w = 0;
      insertion(a, 10, &c, &w); CHECK(arrays_equal(a, want10, 10)); }
    { int a[10]; for (int i = 0; i < 10; i++) a[i] = src[i]; int c = 0, w = 0;
      merge_sort_top(a, 10, &c, &w); CHECK(arrays_equal(a, want10, 10)); }
    { int a[10]; for (int i = 0; i < 10; i++) a[i] = src[i]; int c = 0, w = 0;
      quick_sort_top(a, 10, &c, &w); CHECK(arrays_equal(a, want10, 10)); }

    /* -- hand-computed comparison counts on this exact input (an independent
     *    check that the shared counted primitives are wired correctly) -- */
    { int a[10]; for (int i = 0; i < 10; i++) a[i] = src[i]; int c = 0, w = 0;
      bubble(a, 10, &c, &w); CHECK_EQ_INT(c, 45); }
    { int a[10]; for (int i = 0; i < 10; i++) a[i] = src[i]; int c = 0, w = 0;
      selection(a, 10, &c, &w); CHECK_EQ_INT(c, 45); }
    { int a[10]; for (int i = 0; i < 10; i++) a[i] = src[i]; int c = 0, w = 0;
      insertion(a, 10, &c, &w); CHECK_EQ_INT(c, 33); }

    /* -- on already-sorted input, bubble's early exit beats quick's worst case:
     *    an independent, hand-derived relationship between the two counts -- */
    { int a1[12], a2[12];
      int sorted12[] = {1,2,3,4,5,6,7,8,9,10,11,12};
      for (int i = 0; i < 12; i++) { a1[i] = sorted12[i]; a2[i] = sorted12[i]; }
      int cb = 0, wb = 0, cq = 0, wq = 0;
      bubble(a1, 12, &cb, &wb);
      quick_sort_top(a2, 12, &cq, &wq);
      CHECK_EQ_INT(cb, 11);   /* one pass, early exit */
      CHECK_EQ_INT(cq, 66);   /* 11+10+...+1, worst case */
      CHECK(cb < cq); }

    /* -- empty and one-element arrays: every algorithm handles them -- */
    { int a[1] = {0}; int c = 0, w = 0; bubble(a, 0, &c, &w); CHECK_EQ_INT(c, 0); }
    { int a[] = {7}; int c = 0, w = 0; quick_sort_top(a, 1, &c, &w); CHECK_EQ_INT(a[0], 7); }

    /* -- reverse sorted: all five agree -- */
    { int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
      int rev[] = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
      int a[10]; for (int i = 0; i < 10; i++) a[i] = rev[i]; int c = 0, w = 0;
      bubble(a, 10, &c, &w); CHECK(arrays_equal(a, want, 10)); }
    { int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
      int rev[] = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
      int a[10]; for (int i = 0; i < 10; i++) a[i] = rev[i]; int c = 0, w = 0;
      selection(a, 10, &c, &w); CHECK(arrays_equal(a, want, 10)); }
    { int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
      int rev[] = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
      int a[10]; for (int i = 0; i < 10; i++) a[i] = rev[i]; int c = 0, w = 0;
      insertion(a, 10, &c, &w); CHECK(arrays_equal(a, want, 10)); }
    { int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
      int rev[] = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
      int a[10]; for (int i = 0; i < 10; i++) a[i] = rev[i]; int c = 0, w = 0;
      merge_sort_top(a, 10, &c, &w); CHECK(arrays_equal(a, want, 10)); }
    { int want[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
      int rev[] = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
      int a[10]; for (int i = 0; i < 10; i++) a[i] = rev[i]; int c = 0, w = 0;
      quick_sort_top(a, 10, &c, &w); CHECK(arrays_equal(a, want, 10)); }

    /* -- all equal: all five agree, zero writes needed -- */
    { int eq[] = {4, 4, 4, 4, 4, 4};
      int a[6]; for (int i = 0; i < 6; i++) a[i] = eq[i]; int c = 0, w = 0;
      bubble(a, 6, &c, &w); CHECK(arrays_equal(a, eq, 6)); }
    { int eq[] = {4, 4, 4, 4, 4, 4};
      int a[6]; for (int i = 0; i < 6; i++) a[i] = eq[i]; int c = 0, w = 0;
      selection(a, 6, &c, &w); CHECK(arrays_equal(a, eq, 6)); }
    { int eq[] = {4, 4, 4, 4, 4, 4};
      int a[6]; for (int i = 0; i < 6; i++) a[i] = eq[i]; int c = 0, w = 0;
      /* writes here counts every final placement too (not just shifts): one
       * per i=1..5, zero of which are preceded by an actual shift -- 5 total */
      insertion(a, 6, &c, &w); CHECK(arrays_equal(a, eq, 6)); CHECK_EQ_INT(w, 5); }
    { int eq[] = {4, 4, 4, 4, 4, 4};
      int a[6]; for (int i = 0; i < 6; i++) a[i] = eq[i]; int c = 0, w = 0;
      merge_sort_top(a, 6, &c, &w); CHECK(arrays_equal(a, eq, 6)); }
    { int eq[] = {4, 4, 4, 4, 4, 4};
      int a[6]; for (int i = 0; i < 6; i++) a[i] = eq[i]; int c = 0, w = 0;
      quick_sort_top(a, 6, &c, &w); CHECK(arrays_equal(a, eq, 6)); }

    /* -- duplicates: all five agree -- */
    { int want[] = {1, 1, 3, 3, 3, 5, 5, 5, 5};
      int d[] = {5, 3, 5, 1, 3, 5, 1, 3, 5}; int a[9]; int c = 0, w = 0;
      for (int i = 0; i < 9; i++) a[i] = d[i];
      selection(a, 9, &c, &w);
      CHECK(arrays_equal(a, want, 9)); }

    /* -- negative and extreme values -- */
    { int a[] = {INT_MAX, 0, INT_MIN, 1, -1}; int c = 0, w = 0;
      merge_sort_top(a, 5, &c, &w);
      int want[] = {INT_MIN, -1, 0, 1, INT_MAX};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- integration -- */
    program_main();

    TEST_SUMMARY();
}
