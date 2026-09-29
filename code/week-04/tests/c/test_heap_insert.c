/* Unit tests for week-04 c/heap_insert.c
 * Independent oracle: is_valid_heap() re-checks the parent/child order directly from kind_is_max (not by
 * calling better()), and expected root values are the hand-tracked running min/max of the values
 * inserted so far -- neither reuses insert()'s own logic. */
#define main program_main
#include "../../c/heap_insert.c"
#undef main
#include "../../../test_check.h"

static int is_valid_heap(void) {
    for (int i = 1; i < size; i++) {
        int p = (i - 1) / 2;
        if (kind_is_max ? (heap[i] > heap[p]) : (heap[i] < heap[p])) return 0;
    }
    return 1;
}

static int multiset_matches(const int *expected, int n) {
    int sorted_heap[MAX_CAP], sorted_exp[MAX_CAP];
    for (int i = 0; i < n; i++) { sorted_heap[i] = heap[i]; sorted_exp[i] = expected[i]; }
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            if (sorted_heap[j] < sorted_heap[i]) { int t = sorted_heap[i]; sorted_heap[i] = sorted_heap[j]; sorted_heap[j] = t; }
            if (sorted_exp[j] < sorted_exp[i]) { int t = sorted_exp[i]; sorted_exp[i] = sorted_exp[j]; sorted_exp[j] = t; }
        }
    for (int i = 0; i < n; i++) if (sorted_heap[i] != sorted_exp[i]) return 0;
    return 1;
}

int main(void) {
    /* -- normal: min-heap, track the running minimum by hand after every single insert -- */
    int normal[] = {15, 7, 22, 3, 18, 9, 30, 1, 25, 12};
    int running_min[] = {15, 7, 7, 3, 3, 3, 3, 1, 1, 1};
    size = 0; kind_is_max = false;
    for (int i = 0; i < 10; i++) {
        insert(normal[i]);
        CHECK_EQ_INT(size, i + 1);
        CHECK_EQ_INT(heap[0], running_min[i]);
        CHECK(is_valid_heap());
    }
    CHECK(multiset_matches(normal, 10));

    /* -- single insert into a fresh heap -- */
    size = 0; kind_is_max = true;
    insert(99);
    CHECK_EQ_INT(size, 1);
    CHECK_EQ_INT(heap[0], 99);

    /* -- small hand-traced max-heap: insert 1, 2, 3 -- each floats all the way to the root -- */
    size = 0; kind_is_max = true;
    insert(1); insert(2); insert(3);
    CHECK_EQ_INT(heap[0], 3);
    CHECK_EQ_INT(heap[1], 1);
    CHECK_EQ_INT(heap[2], 2);
    CHECK(is_valid_heap());

    /* -- hard: max-heap, 14 ascending values -- final root must be the maximum, 14 -- */
    int hard[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
    size = 0; kind_is_max = true;
    for (int i = 0; i < 14; i++) insert(hard[i]);
    CHECK_EQ_INT(size, 14);
    CHECK_EQ_INT(heap[0], 14);
    CHECK(is_valid_heap());
    CHECK(multiset_matches(hard, 14));

    /* -- edge: all equal values -- every element is 7, heap property trivially holds -- */
    int all_equal[] = {7, 7, 7, 7, 7, 7, 7, 7, 7, 7};
    size = 0; kind_is_max = false;
    for (int i = 0; i < 10; i++) insert(all_equal[i]);
    CHECK_EQ_INT(size, 10);
    CHECK_EQ_INT(heap[0], 7);
    CHECK(is_valid_heap());
    for (int i = 0; i < 10; i++) CHECK_EQ_INT(heap[i], 7);

    /* -- edge: extreme values, min-heap -- INT_MIN must end up at the root -- */
    int extreme[] = {2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1};
    size = 0; kind_is_max = false;
    for (int i = 0; i < 11; i++) insert(extreme[i]);
    CHECK_EQ_INT(size, 11);
    CHECK_EQ_INT(heap[0], -2147483648);
    CHECK(is_valid_heap());
    CHECK(multiset_matches(extreme, 11));

    TEST_SUMMARY();
}
