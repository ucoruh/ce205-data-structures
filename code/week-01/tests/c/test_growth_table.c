/* Unit tests for code/week-01/c/growth_table.c: pow2_decimal(n, out) -- exact decimal digits of 2^n.
 * Independent oracle for n <= 63: sprintf("%llu", 1ULL << n) using the C library's own unsigned-to-decimal
 * conversion (a completely different code path from the hand-rolled doubling in pow2_decimal). For n > 63
 * (beyond a 64-bit integer) the expected strings are well-known constants, hand-verified, typed in below.
 */
#define main program_main
#include "../../c/growth_table.c"
#undef main
#include "../../../test_check.h"

static void check_small(int n) {
    char out[MAX_DIGITS];
    char expected[32];
    pow2_decimal(n, out);
    sprintf(expected, "%llu", 1ULL << n);
    CHECK(strcmp(out, expected) == 0);
}

int main(void) {
    /* n = 0: 2^0 = 1 (the smallest input the table ever uses) */
    {
        char out[MAX_DIGITS];
        pow2_decimal(0, out);
        CHECK(strcmp(out, "1") == 0);
    }

    /* one element: n = 1 */
    check_small(1);

    /* small powers, independently verified via 1ULL << n */
    check_small(2);
    check_small(4);
    check_small(8);
    check_small(16);
    check_small(32);
    check_small(63); /* largest n that still fits in an unsigned long long (edge of the oracle's range) */

    /* the exact values the animation and the note table print (hand-verified constants, an oracle that
     * does not call pow2_decimal a second time) */
    {
        char out[MAX_DIGITS];
        pow2_decimal(64, out);
        CHECK(strcmp(out, "18446744073709551616") == 0); /* 2^64, beyond unsigned long long range */
    }
    {
        char out[MAX_DIGITS];
        pow2_decimal(128, out);
        CHECK(strcmp(out, "340282366920938463463374607431768211456") == 0); /* 2^128 */
    }
    {
        char out[MAX_DIGITS];
        pow2_decimal(512, out);
        CHECK(strcmp(out,
              "134078079299425970995740249982058461274793658205923933777235614437217640300735469768018742981669"
              "03427690031858186486050853753882811946569946433649006084096") == 0); /* 2^512, the table's largest n */
    }

    /* digit-count sanity: 2^n has floor(n*log10(2))+1 decimal digits (an independent formula check) */
    {
        char out[MAX_DIGITS];
        pow2_decimal(10, out);
        CHECK_EQ_INT((int) strlen(out), 4); /* 2^10 = 1024, four digits */
        pow2_decimal(100, out);
        CHECK_EQ_INT((int) strlen(out), 31); /* 2^100 has 31 decimal digits */
    }

    /* every scenario n the program actually runs, cross-checked against the oracle where possible */
    {
        long ns[] = {1, 3, 5, 9, 14, 20, 27, 35, 44, 54};
        for (int i = 0; i < 10; i++) {
            char out[MAX_DIGITS];
            pow2_decimal((int) ns[i], out);
            if (ns[i] <= 63) {
                char expected[32];
                sprintf(expected, "%llu", 1ULL << ns[i]);
                CHECK(strcmp(out, expected) == 0);
            }
        }
    }

    /* first digit of a large power is never '0' (no leading zero in the decimal representation) */
    {
        char out[MAX_DIGITS];
        pow2_decimal(256, out);
        CHECK(out[0] != '0');
        CHECK_EQ_INT((int) strlen(out), 78); /* 2^256 has 78 decimal digits */
    }

    TEST_SUMMARY();
}
