/* Unit tests for week-04 c/build_heap.c
 * Independent oracle: is_valid_heap() re-derives the parent/child order rule from kind_is_max directly
 * (not via better()); expected roots are the hand/library-computed min or max of the input. */
#define main program_main
#include "../../c/build_heap.c"
#undef main
#include "../../../test_check.h"

static int is_valid_heap_of(int *a, int cnt) {
    for (int i = 1; i < cnt; i++) {
        int p = (i - 1) / 2;
        if (kind_is_max ? (a[i] > a[p]) : (a[i] < a[p])) return 0;
    }
    return 1;
}
static int multiset_matches(int *a, const int *expected, int cnt) {
    int sa[MAX_CAP], se[MAX_CAP];
    for (int i = 0; i < cnt; i++) { sa[i] = a[i]; se[i] = expected[i]; }
    for (int i = 0; i < cnt; i++)
        for (int j = i + 1; j < cnt; j++) {
            if (sa[j] < sa[i]) { int t = sa[i]; sa[i] = sa[j]; sa[j] = t; }
            if (se[j] < se[i]) { int t = se[i]; se[i] = se[j]; se[j] = t; }
        }
    for (int i = 0; i < cnt; i++) if (sa[i] != se[i]) return 0;
    return 1;
}
static int find_extreme(const int *values, int cnt, bool want_max) {
    int best = values[0];
    for (int i = 1; i < cnt; i++) if (want_max ? values[i] > best : values[i] < best) best = values[i];
    return best;
}

int main(void) {
    /* -- empty array: nothing to do, must not crash -- */
    int empty_arr[1];
    kind_is_max = true;
    build_heap(empty_arr, 0);   /* no observable state; just must return without touching memory */
    CHECK(true);

    /* -- single element: trivially a valid heap of one -- */
    int one[] = { 77 };
    kind_is_max = false;
    build_heap(one, 1);
    CHECK_EQ_INT(one[0], 77);
    CHECK(is_valid_heap_of(one, 1));

    /* -- two elements: the better one must end up first -- */
    int two[] = { 3, 9 };
    kind_is_max = true;
    build_heap(two, 2);
    CHECK_EQ_INT(two[0], 9);
    CHECK(is_valid_heap_of(two, 2));

    /* -- normal: max-heap, 10 values in arbitrary order -- */
    int normal[] = {4, 1, 3, 2, 16, 9, 10, 14, 8, 7};
    kind_is_max = true;
    build_heap(normal, 10);
    CHECK_EQ_INT(normal[0], find_extreme((int[]){4, 1, 3, 2, 16, 9, 10, 14, 8, 7}, 10, true));
    CHECK(is_valid_heap_of(normal, 10));
    { int orig[] = {4, 1, 3, 2, 16, 9, 10, 14, 8, 7}; CHECK(multiset_matches(normal, orig, 10)); }

    /* -- hard: min-heap, 14 values in REVERSE order (maximum sifting) -- */
    int hard[] = {14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
    kind_is_max = false;
    build_heap(hard, 14);
    CHECK_EQ_INT(hard[0], 1);
    CHECK(is_valid_heap_of(hard, 14));
    { int orig[] = {14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; CHECK(multiset_matches(hard, orig, 14)); }

    /* -- edge: input already a valid max-heap, 11 values -- build_heap must leave it a valid heap
     *    (not necessarily byte-identical, but the root must stay the true maximum) -- */
    int already_heap[] = {30, 25, 22, 18, 20, 9, 12, 1, 3, 7, 15};
    kind_is_max = true;
    build_heap(already_heap, 11);
    CHECK_EQ_INT(already_heap[0], 30);
    CHECK(is_valid_heap_of(already_heap, 11));
    { int orig[] = {30, 25, 22, 18, 20, 9, 12, 1, 3, 7, 15}; CHECK(multiset_matches(already_heap, orig, 11)); }

    /* -- edge: already sorted ascending, built as a min-heap (root must stay the smallest) -- */
    int ascending[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    kind_is_max = false;
    build_heap(ascending, 10);
    CHECK_EQ_INT(ascending[0], 1);
    CHECK(is_valid_heap_of(ascending, 10));
    { int orig[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}; CHECK(multiset_matches(ascending, orig, 10)); }

    /* -- edge: all duplicates -- heap property trivially holds either way -- */
    int dup[] = {6, 6, 6, 6, 6, 6};
    kind_is_max = true;
    build_heap(dup, 6);
    CHECK_EQ_INT(dup[0], 6);
    CHECK(is_valid_heap_of(dup, 6));
    for (int i = 0; i < 6; i++) CHECK_EQ_INT(dup[i], 6);

    TEST_SUMMARY();
}
