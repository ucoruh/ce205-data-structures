/* Unit tests for week-12 c/kmp_failure_function.c */
#define main program_main
#include "../../c/kmp_failure_function.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int lps[64];

    /* -- single character: always 0 -- */
    compute_lps("A", 1, lps);
    CHECK_EQ_INT(lps[0], 0);

    /* -- no repetition: every entry is 0 -- */
    compute_lps("ABCDE", 5, lps);
    for (int i = 0; i < 5; i++) CHECK_EQ_INT(lps[i], 0);

    /* -- all identical characters: lps[i] = i -- */
    compute_lps("AAAA", 4, lps);
    CHECK_EQ_INT(lps[0], 0);
    CHECK_EQ_INT(lps[1], 1);
    CHECK_EQ_INT(lps[2], 2);
    CHECK_EQ_INT(lps[3], 3);

    /* -- classic CLRS-style example -- */
    compute_lps("ABABCABAB", 9, lps);
    int expect1[] = {0, 0, 1, 2, 0, 1, 2, 3, 4};
    for (int i = 0; i < 9; i++) CHECK_EQ_INT(lps[i], expect1[i]);

    /* -- oscillating pattern -- */
    compute_lps("ABABAB", 6, lps);
    int expect2[] = {0, 0, 1, 2, 3, 4};
    for (int i = 0; i < 6; i++) CHECK_EQ_INT(lps[i], expect2[i]);

    /* -- fallback chases a chain: lps[len-1] used, not a reset to 0 -- */
    compute_lps("AABAACAABAA", 11, lps);
    int expect3[] = {0, 1, 0, 1, 2, 0, 1, 2, 3, 4, 5};
    for (int i = 0; i < 11; i++) CHECK_EQ_INT(lps[i], expect3[i]);

    /* -- two characters, no match -- */
    compute_lps("AB", 2, lps);
    CHECK_EQ_INT(lps[0], 0);
    CHECK_EQ_INT(lps[1], 0);

    /* -- two identical characters -- */
    compute_lps("AA", 2, lps);
    CHECK_EQ_INT(lps[0], 0);
    CHECK_EQ_INT(lps[1], 1);

    /* -- every lps value must be strictly less than its own index (a proper prefix) -- */
    compute_lps("AABAACAABAA", 11, lps);
    for (int i = 0; i < 11; i++) CHECK(lps[i] < i + 1);

    /* -- empty pattern: no characters to compare, must not crash -- */
    compute_lps("", 0, lps);

    /* -- non-ASCII bytes: the algorithm only compares byte values, any value works -- */
    {
        const char *pattern = "\xc3\xa9" "AB" "\xc3\xa9";   /* e-acute, A, B, e-acute (UTF-8, 2 bytes each) */
        int mm = (int) strlen(pattern);
        compute_lps(pattern, mm, lps);
        CHECK_EQ_INT(lps[0], 0);
        CHECK_EQ_INT(lps[1], 0);          /* second byte of the first e-acute: no self-overlap yet */
        CHECK_EQ_INT(lps[mm - 2], 1);     /* the trailing e-acute's first byte reuses the leading one */
        CHECK_EQ_INT(lps[mm - 1], 2);     /* both bytes of the trailing e-acute match the leading one */
    }

    /* -- integration: run_scenario drives the real compute_lps path -- */
    run_scenario("unit-test integration", "ABABCABABA");

    TEST_SUMMARY();
}
