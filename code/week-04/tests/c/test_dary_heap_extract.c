/* Unit tests for week-04 c/dary_heap_extract.c
 * Independent oracle: a plain "remaining values" list scanned linearly for the true min/max (mirrors
 * test_heap_extract.c), plus a D-ary valid-heap check using parent = (i-1)/D directly, not via extract()
 * or better(). */
#define main program_main
#include "../../c/dary_heap_extract.c"
#undef main
#include "../../../test_check.h"

#define MAXN 20
static int remaining[MAXN], remaining_n;

static void remaining_init(const int *values, int n) {
    for (int i = 0; i < n; i++) remaining[i] = values[i];
    remaining_n = n;
}
static int remaining_best(void) {
    int best = remaining[0];
    for (int i = 1; i < remaining_n; i++) if (kind_is_max ? remaining[i] > best : remaining[i] < best) best = remaining[i];
    return best;
}
static void remaining_remove_one(int v) {
    for (int i = 0; i < remaining_n; i++) if (remaining[i] == v) { remaining[i] = remaining[--remaining_n]; return; }
}
static int is_valid_dary_heap(void) {
    for (int i = 1; i < size; i++) {
        int p = (i - 1) / D;
        if (kind_is_max ? (heap[i] > heap[p]) : (heap[i] < heap[p])) return 0;
    }
    return 1;
}

static void run_and_check(int d, bool is_max, const int *values, int n, int extracts) {
    D = d;
    kind_is_max = is_max;
    heapify_prepare(values, n);
    CHECK_EQ_INT(size, n);
    CHECK(is_valid_dary_heap());
    remaining_init(values, n);
    for (int k = 0; k < extracts; k++) {
        int expected = remaining_best();
        int actual = extract();
        CHECK_EQ_INT(actual, expected);
        remaining_remove_one(expected);
        CHECK_EQ_INT(size, n - k - 1);
        CHECK(is_valid_dary_heap());
    }
}

int main(void) {
    /* -- single element, D=3 -- */
    int single[] = { 42 };
    D = 3; kind_is_max = false;
    heapify_prepare(single, 1);
    CHECK_EQ_INT(extract(), 42);
    CHECK_EQ_INT(size, 0);

    /* -- D=3, 4 elements, min-heap: root is the smallest, all 3 others are its children -- */
    int four[] = { 9, 3, 7, 5 };
    D = 3; kind_is_max = false;
    heapify_prepare(four, 4);
    CHECK_EQ_INT(heap[0], 3);
    CHECK(is_valid_dary_heap());

    /* -- normal: D=3, min-heap, 3 extractions from 12 values -- */
    int normal[] = {15, 7, 22, 3, 18, 9, 30, 1, 25, 12, 20, 6};
    run_and_check(3, false, normal, 12, 3);

    /* -- hard: D=4, max-heap, 5 extractions from 16 values -- */
    int hard[] = {40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29, 3, 44};
    run_and_check(4, true, hard, 16, 5);

    /* -- edge: D=3, drain fully -- extracted sequence must be ascending (min-heap) -- */
    int drain[] = {31, 5, 17, 26, 9, 44, 13, 2, 38, 20};
    int sorted_drain[10];
    for (int i = 0; i < 10; i++) sorted_drain[i] = drain[i];
    for (int i = 0; i < 10; i++)
        for (int j = i + 1; j < 10; j++)
            if (sorted_drain[j] < sorted_drain[i]) { int t = sorted_drain[i]; sorted_drain[i] = sorted_drain[j]; sorted_drain[j] = t; }
    D = 3; kind_is_max = false;
    heapify_prepare(drain, 10);
    for (int i = 0; i < 10; i++) CHECK_EQ_INT(extract(), sorted_drain[i]);
    CHECK_EQ_INT(size, 0);

    /* -- edge: D=4, all duplicates -- */
    int dup[] = {5, 5, 5, 5, 5};
    D = 4; kind_is_max = false;
    heapify_prepare(dup, 5);
    for (int i = 0; i < 5; i++) { CHECK_EQ_INT(extract(), 5); CHECK(is_valid_dary_heap()); }
    CHECK_EQ_INT(size, 0);

    TEST_SUMMARY();
}
