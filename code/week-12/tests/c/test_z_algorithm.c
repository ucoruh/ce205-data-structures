/* Unit tests for week-12 c/z_algorithm.c */
#define main program_main
#include "../../c/z_algorithm.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int z[MAXN], occ[MAXOCC], count;

    /* -- Z[0] is conventionally left as whatever it initializes to (never used); check from Z[1] -- */
    z_array("AAAA", 4, z);
    CHECK_EQ_INT(z[1], 3);
    CHECK_EQ_INT(z[2], 2);
    CHECK_EQ_INT(z[3], 1);

    /* -- no self-similarity at all -- */
    z_array("ABCDE", 5, z);
    CHECK_EQ_INT(z[1], 0);
    CHECK_EQ_INT(z[2], 0);
    CHECK_EQ_INT(z[3], 0);
    CHECK_EQ_INT(z[4], 0);

    /* -- periodic string: AB repeated -- */
    z_array("ABABAB", 6, z);
    CHECK_EQ_INT(z[1], 0);
    CHECK_EQ_INT(z[2], 4);
    CHECK_EQ_INT(z[3], 0);
    CHECK_EQ_INT(z[4], 2);
    CHECK_EQ_INT(z[5], 0);

    /* -- normal search: matches at every other position -- */
    count = z_search("AB", 2, "ABABABABAB", 10, occ);
    CHECK_EQ_INT(count, 5);
    CHECK_EQ_INT(occ[0], 0);
    CHECK_EQ_INT(occ[1], 2);
    CHECK_EQ_INT(occ[2], 4);

    /* -- overlapping matches -- */
    count = z_search("AAA", 3, "AAAAAAAAAA", 10, occ);
    CHECK_EQ_INT(count, 8);

    /* -- no match at all -- */
    count = z_search("XYZ", 3, "ABCDEFGHIJ", 10, occ);
    CHECK_EQ_INT(count, 0);

    /* -- match only at the first position -- */
    count = z_search("ABC", 3, "ABCDEFGHIJ", 10, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);

    /* -- single-character pattern (the m=1 boundary) -- */
    count = z_search("A", 1, "BABABABABA", 10, occ);
    CHECK_EQ_INT(count, 5);
    CHECK_EQ_INT(occ[0], 1);
    CHECK_EQ_INT(occ[1], 3);

    /* -- text == pattern -- */
    count = z_search("HELLO", 5, "HELLO", 5, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);

    /* -- two non-overlapping matches -- */
    count = z_search("ABC", 3, "ABCABC", 6, occ);
    CHECK_EQ_INT(count, 2);
    CHECK_EQ_INT(occ[0], 0);
    CHECK_EQ_INT(occ[1], 3);

    /* -- empty pattern: matches at every position, including one past the end -- */
    count = z_search("", 0, "HELLO", 5, occ);
    CHECK_EQ_INT(count, 6);
    for (int i = 0; i <= 5; i++) CHECK_EQ_INT(occ[i], i);

    /* -- empty text, non-empty pattern: no possible match -- */
    count = z_search("AB", 2, "", 0, occ);
    CHECK_EQ_INT(count, 0);

    /* -- both empty: the only possible match, position 0 -- */
    count = z_search("", 0, "", 0, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);

    /* -- non-ASCII bytes: the algorithm only compares byte values, any value works -- */
    {
        const char *pattern = "\xc3" "\xa9";
        const char *text = "caf" "\xc3" "\xa9" "z";
        int mm = (int) strlen(pattern), nn = (int) strlen(text);
        count = z_search(pattern, mm, text, nn, occ);
        CHECK_EQ_INT(count, 1);
        CHECK_EQ_INT(occ[0], 3);
    }

    /* -- integration: run_scenario drives the real combined-string path -- */
    run_scenario("unit-test integration", "AB", "ABABABABAB");

    TEST_SUMMARY();
}
