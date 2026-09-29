/* Unit tests for week-10 c/quick_sort_worst_case.c */
#include <limits.h>

#define main program_main
#include "../../c/quick_sort_worst_case.c"
#undef main
#include "../../../test_check.h"

static int arrays_equal(const int a[], const int b[], int n) {
    for (int i = 0; i < n; i++) if (a[i] != b[i]) return 0;
    return 1;
}
static int is_sorted(const int a[], int n) {
    for (int i = 1; i < n; i++) if (a[i - 1] > a[i]) return 0;
    return 1;
}

int main(void) {
    /* -- choose_pivot_first always returns lo, regardless of values -- */
    { int a[] = {9, 1, 5}; CHECK_EQ_INT(choose_pivot_first(a, 0, 2), 0);
      CHECK_EQ_INT(choose_pivot_first(a, 1, 2), 1); }

    /* -- choose_pivot_middle: hand-computed midpoint -- */
    { int a[] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
      CHECK_EQ_INT(choose_pivot_middle(a, 0, 9), 4);   /* lo=0,hi=9 -> 0+9/2=4 */
      CHECK_EQ_INT(choose_pivot_middle(a, 2, 5), 3); }

    /* -- choose_pivot_median3: the median of a[lo], a[mid], a[hi] ends up at mid -- */
    { int a[] = {5, 100, 1}; /* lo=0(5), mid=1(100), hi=2(1); median is 5 */
      int p = choose_pivot_median3(a, 0, 2);
      CHECK_EQ_INT(p, 1);
      CHECK_EQ_INT(a[p], 5); }

    /* -- partition_with: every element before/at the returned index is <= pivot,
     *    everything after is > pivot (independent, hand-checked invariant) -- */
    { int a[] = {5, 2, 8, 1, 9, 3}; int comparisons = 0;
      int p = partition_with(a, 0, 5, 5, &comparisons); /* pivot_idx=5 -> value 3 */
      CHECK_EQ_INT(a[p], 3);
      int ok = 1;
      for (int i = 0; i < p; i++) if (a[i] > 3) ok = 0;
      for (int i = p + 1; i < 6; i++) if (a[i] <= 3) ok = 0;
      CHECK(ok); }

    /* -- qs with first-element pivot on ALREADY-SORTED input: the classic worst
     *    case, hand-computed comparisons = n*(n-1)/2 for n=10 -- */
    { int a[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
      int comparisons = 0, calls = 0, max_depth = 0;
      qs(a, 0, 9, choose_pivot_first, &comparisons, &calls, 0, &max_depth);
      CHECK(is_sorted(a, 10));
      CHECK_EQ_INT(comparisons, 45);
      CHECK_EQ_INT(calls, 9);
      CHECK_EQ_INT(max_depth, 9); }

    /* -- qs with first-element pivot on REVERSE-SORTED input: also the worst
     *    case (the pivot is always the largest remaining value, so the split
     *    is n-1/0 every time too) -- same hand-computed n*(n-1)/2 = 45 -- */
    { int a[10] = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
      int comparisons = 0, calls = 0, max_depth = 0;
      qs(a, 0, 9, choose_pivot_first, &comparisons, &calls, 0, &max_depth);
      CHECK(is_sorted(a, 10));
      CHECK_EQ_INT(comparisons, 45);
      CHECK_EQ_INT(calls, 9);
      CHECK_EQ_INT(max_depth, 9); }

    /* -- qs with median-of-3 pivot on the SAME sorted input: far fewer calls
     *    and a much shallower recursion (independent expectation from the
     *    balanced-split arithmetic, not from re-running the "first" strategy) -- */
    { int a[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
      int comparisons = 0, calls = 0, max_depth = 0;
      qs(a, 0, 9, choose_pivot_median3, &comparisons, &calls, 0, &max_depth);
      CHECK(is_sorted(a, 10));
      CHECK(calls < 9);
      CHECK(max_depth < 9); }

    /* -- qs with middle-index pivot on sorted input: also balanced here -- */
    { int a[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
      int comparisons = 0, calls = 0, max_depth = 0;
      qs(a, 0, 9, choose_pivot_middle, &comparisons, &calls, 0, &max_depth);
      CHECK(is_sorted(a, 10));
      CHECK(comparisons < 45); }

    /* -- empty range -- */
    { int a[1] = {0}; int comparisons = 0, calls = 0, max_depth = 0;
      qs(a, 0, -1, choose_pivot_first, &comparisons, &calls, 0, &max_depth);
      CHECK_EQ_INT(calls, 0); }

    /* -- one element -- */
    { int a[] = {42}; int comparisons = 0, calls = 0, max_depth = 0;
      qs(a, 0, 0, choose_pivot_first, &comparisons, &calls, 0, &max_depth);
      CHECK_EQ_INT(a[0], 42); CHECK_EQ_INT(calls, 0); }

    /* -- duplicates / all equal: every strategy still sorts correctly -- */
    { int a[] = {4, 4, 4, 4, 4, 4}; int comparisons = 0, calls = 0, max_depth = 0;
      qs(a, 0, 5, choose_pivot_median3, &comparisons, &calls, 0, &max_depth);
      int want[] = {4, 4, 4, 4, 4, 4};
      CHECK(arrays_equal(a, want, 6)); }

    /* -- negative values -- */
    { int a[] = {-5, 3, -1, -100, 42, 0}; int comparisons = 0, calls = 0, max_depth = 0;
      qs(a, 0, 5, choose_pivot_middle, &comparisons, &calls, 0, &max_depth);
      int want[] = {-100, -5, -1, 0, 3, 42};
      CHECK(arrays_equal(a, want, 6)); }

    /* -- INT_MIN / INT_MAX -- */
    { int a[] = {INT_MAX, 0, INT_MIN, 1, -1}; int comparisons = 0, calls = 0, max_depth = 0;
      qs(a, 0, 4, choose_pivot_first, &comparisons, &calls, 0, &max_depth);
      int want[] = {INT_MIN, -1, 0, 1, INT_MAX};
      CHECK(arrays_equal(a, want, 5)); }

    /* -- integration -- */
    program_main();

    TEST_SUMMARY();
}
