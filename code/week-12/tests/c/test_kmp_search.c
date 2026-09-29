/* Unit tests for week-12 c/kmp_search.c */
#define main program_main
#include "../../c/kmp_search.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int lps[64], occ[MAXOCC];
    int count;

    /* -- classic example: one match with a mid-search fallback -- */
    compute_lps("ABABCABAB", 9, lps);
    count = kmp_search("ABABDABACDABABCABAB", 19, "ABABCABAB", 9, lps, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 10);

    /* -- not found: must still terminate and report 0 -- */
    compute_lps("ZEBRA", 5, lps);
    count = kmp_search("THEQUICKBROWNFOX", 16, "ZEBRA", 5, lps, occ);
    CHECK_EQ_INT(count, 0);

    /* -- overlapping matches: KMP must find every one, like naive search -- */
    compute_lps("AAA", 3, lps);
    count = kmp_search("AAAAAAAAAA", 10, "AAA", 3, lps, occ);
    CHECK_EQ_INT(count, 8);
    for (int i = 0; i < 8; i++) CHECK_EQ_INT(occ[i], i);

    /* -- text == pattern -- */
    compute_lps("HELLO", 5, lps);
    count = kmp_search("HELLO", 5, "HELLO", 5, lps, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);

    /* -- single-character pattern -- */
    compute_lps("A", 1, lps);
    count = kmp_search("BANANA", 6, "A", 1, lps, occ);
    CHECK_EQ_INT(count, 3);
    CHECK_EQ_INT(occ[0], 1);
    CHECK_EQ_INT(occ[1], 3);
    CHECK_EQ_INT(occ[2], 5);

    /* -- pattern longer than text: immediately no matches, no crash -- */
    compute_lps("ABCDE", 5, lps);
    count = kmp_search("AB", 2, "ABCDE", 5, lps, occ);
    CHECK_EQ_INT(count, 0);

    /* -- KMP and naive search must agree on a shared example -- */
    compute_lps("AAAAB", 5, lps);
    count = kmp_search("AAAAAAAAAAAAAAAB", 16, "AAAAB", 5, lps, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 11);

    /* -- two non-overlapping occurrences -- */
    compute_lps("ABC", 3, lps);
    count = kmp_search("ABCABC", 6, "ABC", 3, lps, occ);
    CHECK_EQ_INT(count, 2);
    CHECK_EQ_INT(occ[0], 0);
    CHECK_EQ_INT(occ[1], 3);

    /* -- empty pattern: matches at every position, including one past the end -- */
    compute_lps("", 0, lps);
    count = kmp_search("HELLO", 5, "", 0, lps, occ);
    CHECK_EQ_INT(count, 6);
    for (int i = 0; i <= 5; i++) CHECK_EQ_INT(occ[i], i);

    /* -- empty text, non-empty pattern: no possible match -- */
    compute_lps("AB", 2, lps);
    count = kmp_search("", 0, "AB", 2, lps, occ);
    CHECK_EQ_INT(count, 0);

    /* -- both empty: the only possible match, position 0 -- */
    compute_lps("", 0, lps);
    count = kmp_search("", 0, "", 0, lps, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);

    /* -- non-ASCII bytes: the algorithm only compares byte values, any value works -- */
    {
        const char *text = "caf" "\xc3" "\xa9" "z";
        const char *pattern = "\xc3" "\xa9";
        int nn = (int) strlen(text), mm = (int) strlen(pattern);
        compute_lps(pattern, mm, lps);
        count = kmp_search(text, nn, pattern, mm, lps, occ);
        CHECK_EQ_INT(count, 1);
        CHECK_EQ_INT(occ[0], 3);
    }

    /* -- integration: run_scenario drives the real search path -- */
    run_scenario("unit-test integration", "ABABDABACDABABCABAB", "ABABCABAB");

    TEST_SUMMARY();
}
