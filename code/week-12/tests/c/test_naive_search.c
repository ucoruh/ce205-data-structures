/* Unit tests for week-12 c/naive_search.c */
#define main program_main
#include "../../c/naive_search.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int occ[MAXOCC];
    int count;

    /* -- one match in the middle -- */
    count = naive_search("ABABAABABC", 10, "ABABC", 5, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 5);

    /* -- not found: pattern absent entirely -- */
    count = naive_search("THEQUICKFOX", 11, "ZEBRA", 5, occ);
    CHECK_EQ_INT(count, 0);

    /* -- worst case: many almost-matches, none complete -- */
    count = naive_search("AAAAAAAAAA", 10, "AAAB", 4, occ);
    CHECK_EQ_INT(count, 0);

    /* -- overlapping matches: every shift matches -- */
    count = naive_search("AAAAAAAAAA", 10, "AAA", 3, occ);
    CHECK_EQ_INT(count, 8);
    for (int i = 0; i < 8; i++) CHECK_EQ_INT(occ[i], i);

    /* -- text == pattern: exactly one shift, found at 0 -- */
    count = naive_search("HELLO", 5, "HELLO", 5, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);

    /* -- pattern longer than text: no shift is even possible -- */
    count = naive_search("AB", 2, "ABCDE", 5, occ);
    CHECK_EQ_INT(count, 0);

    /* -- single-character pattern: matches at every occurrence of that letter -- */
    count = naive_search("BANANA", 6, "A", 1, occ);
    CHECK_EQ_INT(count, 3);
    CHECK_EQ_INT(occ[0], 1);
    CHECK_EQ_INT(occ[1], 3);
    CHECK_EQ_INT(occ[2], 5);

    /* -- match at the very last possible shift -- */
    count = naive_search("XXXXXABC", 8, "ABC", 3, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 5);

    /* -- two occurrences, non-overlapping -- */
    count = naive_search("ABCABC", 6, "ABC", 3, occ);
    CHECK_EQ_INT(count, 2);
    CHECK_EQ_INT(occ[0], 0);
    CHECK_EQ_INT(occ[1], 3);

    /* -- empty pattern: matches at every position, including one past the end -- */
    count = naive_search("HELLO", 5, "", 0, occ);
    CHECK_EQ_INT(count, 6);
    for (int i = 0; i <= 5; i++) CHECK_EQ_INT(occ[i], i);

    /* -- empty text, non-empty pattern: no possible shift -- */
    count = naive_search("", 0, "AB", 2, occ);
    CHECK_EQ_INT(count, 0);

    /* -- both empty: the only possible shift, position 0 -- */
    count = naive_search("", 0, "", 0, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);

    /* -- non-ASCII bytes: the algorithm only compares byte values, any value works -- */
    {
        const char *text = "caf" "\xc3" "\xa9" "z";      /* "caf", UTF-8 bytes for an accented e, "z" */
        const char *pattern = "\xc3" "\xa9";
        int nn = (int) strlen(text), mm = (int) strlen(pattern);
        count = naive_search(text, nn, pattern, mm, occ);
        CHECK_EQ_INT(count, 1);
        CHECK_EQ_INT(occ[0], 3);
    }

    /* -- integration: run_scenario drives the real search path -- */
    run_scenario("unit-test integration", "ABABAABABC", "ABABC");

    TEST_SUMMARY();
}
