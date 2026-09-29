/* Unit tests for week-06 c/interpolation_search.c
 * Independent oracle: a plain left-to-right linear scan, coded fresh in this file -- never calls
 * interpolation_search() or any of its internals to derive its own expectation. */
#define main program_main
#include "../../c/interpolation_search.c"
#undef main
#include "../../../test_check.h"

static int linear_find(const int arr[], int n, int target) {
    for (int i = 0; i < n; i++) if (arr[i] == target) return i;
    return -1;
}

static void check_search(const char *label, const int arr[], int n, int target) {
    (void) label;
    int probes = -999;
    int got = interpolation_search(arr, n, target, &probes);
    int expected = linear_find(arr, n, target);
    if (expected == -1) {
        CHECK_EQ_INT(got, -1);
    } else {
        CHECK(got >= 0 && got < n);
        if (got >= 0 && got < n) CHECK_EQ_INT(arr[got], target);
    }
    CHECK(probes >= 0);
    if (n > 0) CHECK(probes <= n);
}

int main(void) {
    int normal[] = {10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85};
    int all_equal[] = {42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42};
    int skewed[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1000000};

    /* -- empty input: short-circuit (lo<=hi false), must not touch arr, -1 with 0 probes -- */
    {
        int probes = -1;
        int got = interpolation_search(normal, 0, 55, &probes);
        CHECK_EQ_INT(got, -1);
        CHECK_EQ_INT(probes, 0);
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

    /* -- normal: uniformly spread -- */
    check_search("normal, single-probe hit", normal, 16, 55);
    check_search("normal, first element", normal, 16, 10);
    check_search("normal, last element", normal, 16, 85);
    check_search("normal, outside range below", normal, 16, -5);
    check_search("normal, outside range above", normal, 16, 999);
    check_search("normal, in range but absent", normal, 16, 22);

    /* -- hard: slightly uneven spacing -- */
    {
        int hard[] = {10, 13, 21, 24, 33, 36, 44, 48, 55, 61, 68, 74, 81, 87, 94, 100};
        check_search("hard, several probes", hard, 16, 81);
        check_search("hard, first", hard, 16, 10);
        check_search("hard, last", hard, 16, 100);
        check_search("hard, absent", hard, 16, 82);
    }

    /* -- edge: skewed data, division-heavy formula -- */
    check_search("skewed, small value many probes", skewed, 16, 8);
    check_search("skewed, huge last value", skewed, 16, 1000000);
    check_search("skewed, absent", skewed, 16, 500);

    /* -- edge: all values equal, guard triggers on the very first probe -- */
    {
        int probes = -1;
        int got = interpolation_search(all_equal, 16, 42, &probes);
        CHECK_EQ_INT(got, 0);   /* the guard always returns lo, which starts at 0 */
        CHECK_EQ_INT(probes, 1);
        check_search("all equal, not found", all_equal, 16, 7);
    }

    /* -- edge: two equal values only (still trips the guard, smallest case) -- */
    {
        int two_eq[] = {9, 9};
        int probes = -1;
        int got = interpolation_search(two_eq, 2, 9, &probes);
        CHECK_EQ_INT(got, 0);
        CHECK_EQ_INT(probes, 1);
    }

    /* -- duplicates (not all equal) -- */
    {
        int dup[] = {2, 2, 2, 5, 5, 8, 8, 8, 8, 11, 14, 14, 20, 20, 20, 25};
        check_search("duplicates, found run", dup, 16, 8);
        check_search("duplicates, found single", dup, 16, 11);
        check_search("duplicates, not found", dup, 16, 6);
    }

    /* -- extreme values -- */
    {
        int extreme[] = {-2147483647 - 1, -1000, -1, 0, 1, 1000, 2147483647};
        check_search("extreme, INT_MIN", extreme, 7, -2147483647 - 1);
        check_search("extreme, INT_MAX", extreme, 7, 2147483647);
        check_search("extreme, zero", extreme, 7, 0);
        check_search("extreme, not found", extreme, 7, 500);
    }

    TEST_SUMMARY();
}
