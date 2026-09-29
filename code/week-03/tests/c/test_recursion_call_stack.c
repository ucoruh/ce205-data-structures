/* Unit tests for week-03 c/recursion_call_stack.c
 * Special focus: fact(13) must reproduce the documented silent-wraparound answer
 * (1932053504) WITHOUT signed-integer-overflow undefined behavior -- the sanitized
 * build (run_tests.py --sanitize) is what actually proves the "without UB" half;
 * this file proves the numeric value is still exactly what the note claims. */
#define main program_main
#include "../../c/recursion_call_stack.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* -- base case -- */
    CHECK_EQ_INT(fact(0), 1);

    /* -- small values, hand-computed -- */
    CHECK_EQ_INT(fact(1), 1);
    CHECK_EQ_INT(fact(2), 2);
    CHECK_EQ_INT(fact(3), 6);
    CHECK_EQ_INT(fact(4), 24);
    CHECK_EQ_INT(fact(5), 120);

    /* -- against an independent iterative oracle (not the recursive algorithm
     *    itself) for every n from 0 to 12, all safely within int range -- */
    for (int n = 0; n <= 12; n++) {
        long long oracle = 1;
        for (int i = 2; i <= n; i++) oracle *= i;
        CHECK_EQ_INT(fact(n), (int) oracle);
    }

    /* -- the program's own normal/hard presets -- */
    CHECK_EQ_INT(fact(10), 3628800);
    CHECK_EQ_INT(fact(12), 479001600);

    /* -- the overflow edge case: 13! = 6227020800 does not fit in a 32-bit int
     *    (max 2147483647); computed independently as 6227020800 mod 2^32 =
     *    6227020800 - 4294967296 = 1932053504 -- the exact value the note documents
     *    as the silent wraparound answer, with no crash and no warning -- */
    CHECK_EQ_INT(fact(13), 1932053504);

    /* -- one call further still does not crash (14! also wraps, no assertion on the
     *    exact value beyond "it returns, it does not abort") -- */
    (void) fact(14);

    /* -- run() is exercised for integration/coverage -- */
    run("unit-test integration", 5);

    TEST_SUMMARY();
}
