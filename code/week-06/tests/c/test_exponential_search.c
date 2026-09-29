/* Unit tests for week-06 c/exponential_search.c
 * Independent oracle: a plain left-to-right linear scan, coded fresh in this file -- never calls
 * exponential_search() or any of its internals to derive its own expectation. */
#define main program_main
#include "../../c/exponential_search.c"
#undef main
#include "../../../test_check.h"

/* Independent oracle: first index i with arr[i] == target, or -1. */
static int linear_find(const int arr[], int n, int target) {
    for (int i = 0; i < n; i++) if (arr[i] == target) return i;
    return -1;
}

static void check_search(const char *label, const int arr[], int n, int target) {
    (void) label;
    int comparisons = -999;
    int got = exponential_search(arr, n, target, &comparisons);
    int expected = linear_find(arr, n, target);
    if (expected == -1) {
        CHECK_EQ_INT(got, -1);
    } else {
        /* duplicates may make several indices valid: check the VALUE at the returned index,
           not the exact index (the oracle only guarantees SOME match exists). */
        CHECK(got >= 0 && got < n);
        if (got >= 0 && got < n) CHECK_EQ_INT(arr[got], target);
    }
    CHECK(comparisons >= 0);
    if (n > 0) CHECK(comparisons <= n + 32); /* sanity upper bound, generous for the doubling phase */
}

int main(void) {
    int normal[] = {3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63};
    int n = 16;

    /* -- empty input: must not read arr[0], must return -1 with 0 comparisons -- */
    {
        int comparisons = -1;
        int got = exponential_search(normal, 0, 39, &comparisons);
        CHECK_EQ_INT(got, -1);
        CHECK_EQ_INT(comparisons, 0);
    }

    /* -- one element -- */
    {
        int one[] = {42};
        check_search("one, found", one, 1, 42);
        check_search("one, not found", one, 1, 7);
    }

    /* -- two elements -- */
    {
        int two[] = {5, 9};
        check_search("two, first", two, 2, 5);
        check_search("two, last", two, 2, 9);
        check_search("two, missing", two, 2, 7);
    }

    /* -- normal: found at various positions -- */
    check_search("normal, middle", normal, n, 39);
    check_search("normal, first element", normal, n, 3);
    check_search("normal, last element", normal, n, 63);
    check_search("normal, beyond last (bound overshoots n)", normal, n, 999);
    check_search("normal, below first", normal, n, 0);
    check_search("normal, in range but absent", normal, n, 40);
    check_search("normal, near-end target (several doublings)", normal, n, 59);

    /* -- full array probe: target exactly the last index n-1 -- */
    check_search("full, target is arr[n-1]", normal, n, 63);

    /* -- duplicates -- */
    {
        int dup[] = {2, 2, 2, 5, 5, 8, 8, 8, 8, 11, 14, 14, 20, 20, 20, 25};
        check_search("duplicates, found run", dup, 16, 8);
        check_search("duplicates, found single", dup, 16, 11);
        check_search("duplicates, not found", dup, 16, 6);
    }

    /* -- all values equal -- */
    {
        int all_same[] = {7, 7, 7, 7, 7, 7, 7, 7, 7, 7};
        check_search("all equal, found", all_same, 10, 7);
        check_search("all equal, not found", all_same, 10, 3);
    }

    /* -- negative and extreme values -- */
    {
        int extreme[] = {-2147483647 - 1, -1000, -1, 0, 1, 1000, 2147483647};
        check_search("extreme, INT_MIN", extreme, 7, -2147483647 - 1);
        check_search("extreme, INT_MAX", extreme, 7, 2147483647);
        check_search("extreme, zero", extreme, 7, 0);
        check_search("extreme, not found between values", extreme, 7, 500);
    }

    /* -- large-ish n to exercise several bound doublings -- */
    {
        int big[64];
        for (int i = 0; i < 64; i++) big[i] = i * 2;
        check_search("big n, target near end", big, 64, 124);
        check_search("big n, target at start", big, 64, 0);
        check_search("big n, target absent (odd value)", big, 64, 99);
    }

    TEST_SUMMARY();
}
