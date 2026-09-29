/* Unit tests for week-06 c/jump_search.c
 * Independent oracle: a plain left-to-right linear scan, coded fresh in this file -- never calls
 * jump_search() or any of its internals to derive its own expectation. */
#define main program_main
#include "../../c/jump_search.c"
#undef main
#include "../../../test_check.h"

static int linear_find(const int arr[], int n, int target) {
    for (int i = 0; i < n; i++) if (arr[i] == target) return i;
    return -1;
}

static void check_search(const char *label, const int arr[], int n, int target) {
    (void) label;
    int comparisons = -999;
    int got = jump_search(arr, n, target, &comparisons);
    int expected = linear_find(arr, n, target);
    if (expected == -1) {
        CHECK_EQ_INT(got, -1);
    } else {
        CHECK(got >= 0 && got < n);
        if (got >= 0 && got < n) CHECK_EQ_INT(arr[got], target);
    }
    CHECK(comparisons >= 0);
    if (n > 0) CHECK(comparisons <= n + 32);
}

int main(void) {
    int normal[] = {2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62};
    int n = 16;

    /* -- empty input: block clamps to 1, but step>n clamps the scan range to empty; must not read arr, -1/0 -- */
    {
        int comparisons = -1;
        int got = jump_search(normal, 0, 42, &comparisons);
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

    /* -- three/four elements: exercise small block sizes (sqrt(3)=1, sqrt(4)=2) -- */
    {
        int three[] = {1, 4, 7};
        for (int t = 0; t < 3; t++) check_search("three scan", three, 3, three[t]);
        check_search("three, absent", three, 3, 5);
        int four[] = {1, 4, 7, 10};
        for (int t = 0; t < 4; t++) check_search("four scan", four, 4, four[t]);
        check_search("four, absent", four, 4, 5);
    }

    /* -- normal -- */
    check_search("normal, second block", normal, n, 42);
    check_search("normal, near last block", normal, n, 58);
    check_search("normal, first element", normal, n, 2);
    check_search("normal, last element", normal, n, 62);
    check_search("normal, smaller than every value", normal, n, 1);
    check_search("normal, larger than every value", normal, n, 999);
    check_search("normal, in range but absent", normal, n, 45);

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

    /* -- larger n, exercise many jumps and the final linear scan inside the block -- */
    {
        int big[81];
        for (int i = 0; i < 81; i++) big[i] = i * 3;
        for (int t = 0; t < 81; t += 11) check_search("big n scan", big, 81, big[t]);
        check_search("big n, absent", big, 81, 5);
        check_search("big n, last", big, 81, big[80]);
    }

    TEST_SUMMARY();
}
