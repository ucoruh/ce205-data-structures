/* Unit tests for week-12 c/longest_common_subsequence.c */
#define main program_main
#include "../../c/longest_common_subsequence.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    static int dp[MAXN][MAXM];
    char out[MAXN];

    /* -- identical strings: LCS is the whole string -- */
    CHECK_EQ_INT(lcs_length("CAT", 3, "CAT", 3, dp), 3);
    traceback("CAT", 3, "CAT", 3, dp, out);
    CHECK(strcmp(out, "CAT") == 0);

    /* -- one empty string: LCS length 0 -- */
    CHECK_EQ_INT(lcs_length("", 0, "ABC", 3, dp), 0);
    CHECK_EQ_INT(lcs_length("ABC", 3, "", 0, dp), 0);

    /* -- no shared letters at all -- */
    CHECK_EQ_INT(lcs_length("ABCDE", 5, "FGHIJ", 5, dp), 0);
    traceback("ABCDE", 5, "FGHIJ", 5, dp, out);
    CHECK(strcmp(out, "") == 0);

    /* -- classic example: ABCBDAB / BDCABA, length 4 -- */
    CHECK_EQ_INT(lcs_length("ABCBDAB", 7, "BDCABA", 6, dp), 4);
    traceback("ABCBDAB", 7, "BDCABA", 6, dp, out);
    CHECK_EQ_INT((int) strlen(out), 4);

    /* -- classic example: AGGTAB / GXTXAYB, length 4 -- */
    CHECK_EQ_INT(lcs_length("AGGTAB", 6, "GXTXAYB", 7, dp), 4);
    traceback("AGGTAB", 6, "GXTXAYB", 7, dp, out);
    CHECK(strcmp(out, "GTAB") == 0);

    /* -- one string fully contained as a subsequence of the other -- */
    CHECK_EQ_INT(lcs_length("ACEG", 4, "ABCDEFGH", 8, dp), 4);
    traceback("ACEG", 4, "ABCDEFGH", 8, dp, out);
    CHECK(strcmp(out, "ACEG") == 0);

    /* -- a traced LCS must be a genuine subsequence of BOTH inputs -- */
    lcs_length("ABCBDAB", 7, "BDCABA", 6, dp);
    traceback("ABCBDAB", 7, "BDCABA", 6, dp, out);
    {
        int oi = 0, ai = 0;
        while (out[oi] != '\0') {
            while (ai < 7 && "ABCBDAB"[ai] != out[oi]) ai++;
            CHECK(ai < 7);   /* every LCS character was found, in order, in a */
            ai++; oi++;
        }
    }

    /* -- single shared character -- */
    CHECK_EQ_INT(lcs_length("A", 1, "A", 1, dp), 1);
    CHECK_EQ_INT(lcs_length("A", 1, "B", 1, dp), 0);

    /* -- symmetry: LCS(a,b) has the same length as LCS(b,a) -- */
    int len1 = lcs_length("AGGTAB", 6, "GXTXAYB", 7, dp);
    int len2 = lcs_length("GXTXAYB", 7, "AGGTAB", 6, dp);
    CHECK_EQ_INT(len1, len2);

    /* -- non-ASCII bytes: only byte equality matters, any value works -- */
    CHECK_EQ_INT(lcs_length("caf" "\xc3" "\xa9", 5, "caf", 3, dp), 3);
    traceback("caf" "\xc3" "\xa9", 5, "caf", 3, dp, out);
    CHECK(strcmp(out, "caf") == 0);

    /* -- integration: run_scenario drives the real DP + traceback path -- */
    run_scenario("unit-test integration", "ABCBDAB", "BDCABA");

    TEST_SUMMARY();
}
