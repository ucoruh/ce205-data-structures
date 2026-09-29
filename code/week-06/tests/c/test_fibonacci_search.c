/* Unit tests for week-06 c/fibonacci_search.c
 * Independent oracle: a plain left-to-right linear scan, coded fresh in this file -- never calls
 * fibonacci_search() or any of its internals to derive its own expectation. */
#define main program_main
#include "../../c/fibonacci_search.c"
#undef main
#include "../../../test_check.h"

static int linear_find(const int arr[], int n, int target) {
    for (int i = 0; i < n; i++) if (arr[i] == target) return i;
    return -1;
}

static void check_search(const char *label, const int arr[], int n, int target) {
    (void) label;
    int comparisons = -999;
    int got = fibonacci_search(arr, n, target, &comparisons);
    int expected = linear_find(arr, n, target);
    if (expected == -1) {
        CHECK_EQ_INT(got, -1);
    } else {
        CHECK(got >= 0 && got < n);
        if (got >= 0 && got < n) CHECK_EQ_INT(arr[got], target);
    }
    CHECK(comparisons >= 0);
    if (n > 0) CHECK(comparisons <= n);
}

int main(void) {
    int normal[] = {3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63};
    int n = 16;

    /* -- empty input: fib stays 1 (fib>1 loop never runs), must not touch arr, -1 with 0 comparisons -- */
    {
        int comparisons = -1;
        int got = fibonacci_search(normal, 0, 39, &comparisons);
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

    /* -- three elements: smallest n where fib > 1 loop body runs with a genuine split -- */
    {
        int three[] = {1, 2, 3};
        check_search("three, first", three, 3, 1);
        check_search("three, mid", three, 3, 2);
        check_search("three, last", three, 3, 3);
        check_search("three, missing", three, 3, 5);
    }

    /* -- normal -- */
    check_search("normal, middle", normal, n, 39);
    check_search("normal, first element", normal, n, 3);
    check_search("normal, last element", normal, n, 63);
    check_search("normal, near-end target (several splits)", normal, n, 59);
    check_search("normal, beyond last", normal, n, 999);
    check_search("normal, below first", normal, n, 0);
    check_search("normal, in range but absent", normal, n, 40);

    /* -- the leftover-element branch (fib1==1, one element past offset) -- */
    {
        /* n = 17 is one more than fib(7)=13's covering range in a way that can leave a leftover probe;
           check both an in-range hit and a genuine leftover-element miss/hit at various sizes. */
        int seventeen[17];
        for (int i = 0; i < 17; i++) seventeen[i] = i * 3;
        for (int t = 0; t < 17; t++) {
            char label[32];
            snprintf(label, sizeof label, "n=17 target idx %d", t);
            check_search(label, seventeen, 17, seventeen[t]);
        }
        check_search("n=17, not found", seventeen, 17, 100);
    }

    /* -- duplicates -- */
    {
        int dup[] = {2, 2, 2, 5, 5, 8, 8, 8, 8, 11, 14, 14, 20, 20, 20, 25};
        check_search("duplicates, found run", dup, 16, 8);
        check_search("duplicates, found single", dup, 16, 11);
        check_search("duplicates, not found", dup, 16, 6);
    }

    /* -- all equal -- */
    {
        int all_same[] = {7, 7, 7, 7, 7, 7, 7, 7, 7, 7};
        check_search("all equal, found", all_same, 10, 7);
        check_search("all equal, not found", all_same, 10, 3);
    }

    /* -- extreme values -- */
    {
        int extreme[] = {-2147483647 - 1, -1000, -1, 0, 1, 1000, 2147483647};
        check_search("extreme, INT_MIN", extreme, 7, -2147483647 - 1);
        check_search("extreme, INT_MAX", extreme, 7, 2147483647);
        check_search("extreme, zero", extreme, 7, 0);
        check_search("extreme, not found", extreme, 7, 500);
    }

    /* -- larger n to exercise several fib shrink steps -- */
    {
        int big[64];
        for (int i = 0; i < 64; i++) big[i] = i * 2;
        for (int t = 0; t < 64; t += 7) check_search("big n scan", big, 64, big[t]);
        check_search("big n, absent", big, 64, 99);
    }

    TEST_SUMMARY();
}
