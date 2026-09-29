/* Unit tests for week-06 c/hash_division.c
 * Independent oracle: hand-computed k mod m values (standard non-negative-remainder math),
 * never derived by calling hash_division() itself. */
#define main program_main
#include "../../c/hash_division.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* -- normal positive keys -- */
    CHECK_EQ_INT(hash_division(23, 11), 1);     /* 23 = 2*11 + 1 */
    CHECK_EQ_INT(hash_division(44, 11), 0);     /* 44 = 4*11 + 0 */
    CHECK_EQ_INT(hash_division(15, 11), 4);
    CHECK_EQ_INT(hash_division(77, 11), 0);     /* 77 = 7*11 */
    CHECK_EQ_INT(hash_division(8, 11), 8);      /* key < m: itself */
    CHECK_EQ_INT(hash_division(62, 11), 7);     /* 62 = 5*11 + 7 */

    /* -- key == m, key == 2m: must wrap to 0 -- */
    CHECK_EQ_INT(hash_division(11, 11), 0);
    CHECK_EQ_INT(hash_division(22, 11), 0);

    /* -- key == 0 -- */
    CHECK_EQ_INT(hash_division(0, 11), 0);
    CHECK_EQ_INT(hash_division(0, 1), 0);

    /* -- m == 1: every key maps to bucket 0 (single-bucket table) -- */
    CHECK_EQ_INT(hash_division(0, 1), 0);
    CHECK_EQ_INT(hash_division(5, 1), 0);
    CHECK_EQ_INT(hash_division(-5, 1), 0);
    CHECK_EQ_INT(hash_division(999999, 1), 0);

    /* -- negative keys: result must stay in [0, m-1], never negative -- */
    CHECK_EQ_INT(hash_division(-3, 11), 8);      /* -3 mod 11 = 8 (since -3 = -1*11 + 8) */
    CHECK_EQ_INT(hash_division(-15, 11), 7);     /* -15 = -2*11 + 7 */
    CHECK_EQ_INT(hash_division(-11, 11), 0);     /* exact multiple, negative */
    CHECK_EQ_INT(hash_division(-1, 11), 10);
    CHECK_EQ_INT(hash_division(-22, 11), 0);

    /* -- power-of-10 keys against m = 10: catastrophic clustering, all land on 0 -- */
    for (int k = 10; k <= 110; k += 10) CHECK_EQ_INT(hash_division(k, 10), 0);

    /* -- same keys against a prime m = 13: spread out (hand-computed) -- */
    CHECK_EQ_INT(hash_division(10, 13), 10);
    CHECK_EQ_INT(hash_division(20, 13), 7);
    CHECK_EQ_INT(hash_division(30, 13), 4);
    CHECK_EQ_INT(hash_division(110, 13), 6);    /* 110 = 8*13 + 6 */

    /* -- result is always within [0, m-1] over a wide range (brute-force property check) -- */
    for (int m = 1; m <= 17; m++) {
        for (int k = -50; k <= 50; k++) {
            int r = hash_division(k, m);
            CHECK(r >= 0 && r < m);
            /* independent re-derivation via a manual normalize loop (not the tested formula) */
            int expected = k % m;
            while (expected < 0) expected += m;
            while (expected >= m) expected -= m;
            CHECK_EQ_INT(r, expected);
        }
    }

    /* -- extreme key values -- */
    CHECK_EQ_INT(hash_division(2147483647, 11), 2147483647 % 11);
    {
        int r = hash_division(-2147483647 - 1, 11);
        CHECK(r >= 0 && r < 11);
    }

    TEST_SUMMARY();
}
