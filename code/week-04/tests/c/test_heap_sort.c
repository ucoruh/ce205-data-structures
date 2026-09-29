/* Unit tests for week-04 c/heap_sort.c
 * Independent oracle: a plain bubble sort (ascending or descending, matching kind_is_max) computed
 * directly on a copy of the input -- never calls heap_sort() or better() to derive its own answer. */
#define main program_main
#include "../../c/heap_sort.c"
#undef main
#include "../../../test_check.h"

static void bubble_sort(int *a, int cnt, bool ascending) {
    for (int i = 0; i < cnt; i++)
        for (int j = i + 1; j < cnt; j++)
            if (ascending ? a[j] < a[i] : a[j] > a[i]) { int t = a[i]; a[i] = a[j]; a[j] = t; }
}
static void check_sorted(const int *values, int cnt, bool is_max) {
    int got[MAX_CAP], expected[MAX_CAP];
    for (int i = 0; i < cnt; i++) { got[i] = values[i]; expected[i] = values[i]; }
    kind_is_max = is_max;
    heap_sort(got, cnt);
    bubble_sort(expected, cnt, is_max /* max-heap -> ascending, min-heap -> descending */);
    for (int i = 0; i < cnt; i++) CHECK_EQ_INT(got[i], expected[i]);
}

int main(void) {
    /* -- empty array: nothing to do -- */
    int empty_arr[1];
    kind_is_max = true;
    heap_sort(empty_arr, 0);
    CHECK(true);

    /* -- single element -- */
    int one[] = { 5 };
    check_sorted(one, 1, true);

    /* -- two elements, out of order -- */
    int two[] = { 9, 2 };
    check_sorted(two, 2, true);

    /* -- normal: ascending sort with a max-heap, 10 values -- */
    int normal[] = {16, 14, 10, 8, 7, 9, 3, 2, 4, 1};
    check_sorted(normal, 10, true);

    /* -- hard: descending sort with a min-heap, 14 values -- */
    int hard[] = {40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29};
    check_sorted(hard, 14, false);

    /* -- edge: already ascending input, sorted with a max-heap (still ascending) -- */
    int already_sorted[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
    check_sorted(already_sorted, 12, true);

    /* -- edge: reverse-sorted input, sorted with a max-heap -- exercises maximum sifting -- */
    int reverse_sorted[] = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
    check_sorted(reverse_sorted, 12, true);

    /* -- edge: all duplicates -- */
    int dup[] = {8, 8, 8, 8, 8, 8, 8, 8};
    check_sorted(dup, 8, true);
    { int arr8[8]; kind_is_max = true; for (int i = 0; i < 8; i++) arr8[i] = 8; heap_sort(arr8, 8);
      for (int i = 0; i < 8; i++) CHECK_EQ_INT(arr8[i], 8); }

    /* -- edge: extreme values (INT_MIN, INT_MAX, 0), min-heap descending sort -- */
    int extreme[] = { -2147483648, 2147483647, 0, 5, -5 };
    check_sorted(extreme, 5, false);

    TEST_SUMMARY();
}
