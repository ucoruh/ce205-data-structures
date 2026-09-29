/* Unit tests for week-04 c/heap_extract.c
 * Independent oracle: a plain "remaining values" list (not the heap) is scanned linearly for the true
 * min/max before each extract() call, and one matching occurrence is removed from it -- this never calls
 * extract(), better(), or sift_down_at() to compute its own expected value. */
#define main program_main
#include "../../c/heap_extract.c"
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
    for (int i = 0; i < remaining_n; i++) {
        if (remaining[i] == v) { remaining[i] = remaining[--remaining_n]; return; }
    }
}
static int is_valid_heap(void) {
    for (int i = 1; i < size; i++) {
        int p = (i - 1) / 2;
        if (kind_is_max ? (heap[i] > heap[p]) : (heap[i] < heap[p])) return 0;
    }
    return 1;
}

static void run_and_check(const char *label, bool is_max, const int *values, int n, int extracts) {
    (void) label;
    kind_is_max = is_max;
    heapify_prepare(values, n);
    CHECK_EQ_INT(size, n);
    CHECK(is_valid_heap());
    remaining_init(values, n);
    for (int k = 0; k < extracts; k++) {
        int expected = remaining_best();
        int actual = extract();
        CHECK_EQ_INT(actual, expected);
        remaining_remove_one(expected);
        CHECK_EQ_INT(size, n - k - 1);
        CHECK(is_valid_heap());
    }
}

int main(void) {
    /* -- single element: extract must return it and leave size 0 -- */
    int single[] = { 42 };
    kind_is_max = false;
    heapify_prepare(single, 1);
    CHECK_EQ_INT(extract(), 42);
    CHECK_EQ_INT(size, 0);

    /* -- two elements, min-heap: extract returns the smaller first -- */
    int two[] = { 9, 3 };
    kind_is_max = false;
    heapify_prepare(two, 2);
    CHECK_EQ_INT(heap[0], 3);
    CHECK_EQ_INT(extract(), 3);
    CHECK_EQ_INT(size, 1);
    CHECK_EQ_INT(extract(), 9);
    CHECK_EQ_INT(size, 0);

    /* -- normal: min-heap, 3 extractions from 12 values, checked one at a time against the independent
     *    "scan for the true minimum" oracle -- */
    int normal[] = {15, 7, 22, 3, 18, 9, 30, 1, 25, 12, 20, 6};
    run_and_check("normal", false, normal, 12, 3);

    /* -- hard: max-heap, 5 extractions from 16 values -- */
    int hard[] = {40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29, 3, 44};
    run_and_check("hard", true, hard, 16, 5);

    /* -- edge: drain fully -- all 10 values extracted; the extracted sequence, independently sorted
     *    here, must come out in ascending order for a min-heap -- */
    int drain[] = {31, 5, 17, 26, 9, 44, 13, 2, 38, 20};
    int sorted_drain[10];
    for (int i = 0; i < 10; i++) sorted_drain[i] = drain[i];
    for (int i = 0; i < 10; i++)
        for (int j = i + 1; j < 10; j++)
            if (sorted_drain[j] < sorted_drain[i]) { int t = sorted_drain[i]; sorted_drain[i] = sorted_drain[j]; sorted_drain[j] = t; }
    kind_is_max = false;
    heapify_prepare(drain, 10);
    for (int i = 0; i < 10; i++) {
        int got = extract();
        CHECK_EQ_INT(got, sorted_drain[i]);
    }
    CHECK_EQ_INT(size, 0);

    /* -- edge: all duplicates -- every extract returns the same value, heap stays valid throughout -- */
    int dup[] = {5, 5, 5, 5, 5};
    kind_is_max = false;
    heapify_prepare(dup, 5);
    for (int i = 0; i < 5; i++) {
        CHECK_EQ_INT(extract(), 5);
        CHECK(is_valid_heap());
    }
    CHECK_EQ_INT(size, 0);

    TEST_SUMMARY();
}
