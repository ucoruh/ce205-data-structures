/* Unit tests for week-12 c/suffix_array.c */
#include <string.h>

#define main program_main
#include "../../c/suffix_array.c"
#undef main
#include "../../../test_check.h"

static void check_sorted(const char *text, const int sa[], int n) {
    for (int i = 0; i + 1 < n; i++) {
        CHECK(strcmp(text + sa[i], text + sa[i + 1]) < 0);   /* each suffix < the next */
    }
}

int main(void) {
    int sa[MAXN];

    /* -- one character: trivially sorted -- */
    build_suffix_array("A", 1, sa);
    CHECK_EQ_INT(sa[0], 0);

    /* -- two characters, already ascending -- */
    build_suffix_array("AB", 2, sa);
    CHECK_EQ_INT(sa[0], 0);
    CHECK_EQ_INT(sa[1], 1);

    /* -- two characters, descending: one shift needed -- */
    build_suffix_array("BA", 2, sa);
    CHECK_EQ_INT(sa[0], 1);   /* "A" < "BA" */
    CHECK_EQ_INT(sa[1], 0);

    /* -- classic example: BANANA -- */
    build_suffix_array("BANANA", 6, sa);
    /* suffixes: A(5) ANA(3) ANANA(1) BANANA(0) NA(4) NANA(2) */
    CHECK_EQ_INT(sa[0], 5);
    CHECK_EQ_INT(sa[1], 3);
    CHECK_EQ_INT(sa[2], 1);
    CHECK_EQ_INT(sa[3], 0);
    CHECK_EQ_INT(sa[4], 4);
    CHECK_EQ_INT(sa[5], 2);
    check_sorted("BANANA", sa, 6);

    /* -- every character identical: a shorter suffix always sorts first (prefix rule) -- */
    build_suffix_array("AAAA", 4, sa);
    CHECK_EQ_INT(sa[0], 3);
    CHECK_EQ_INT(sa[1], 2);
    CHECK_EQ_INT(sa[2], 1);
    CHECK_EQ_INT(sa[3], 0);

    /* -- already ascending: no shifting needed at all -- */
    build_suffix_array("ABCDE", 5, sa);
    for (int i = 0; i < 5; i++) CHECK_EQ_INT(sa[i], i);

    /* -- descending: maximal shifting, but still ends up fully sorted -- */
    build_suffix_array("EDCBA", 5, sa);
    check_sorted("EDCBA", sa, 5);
    CHECK_EQ_INT(sa[0], 4);   /* "A" is smallest */
    CHECK_EQ_INT(sa[4], 0);   /* "EDCBA" is largest */

    /* -- compare_suffix itself: sign matches strcmp -- */
    CHECK(compare_suffix("BANANA", 0, 5) > 0);   /* "BANANA" > "A" */
    CHECK(compare_suffix("BANANA", 5, 0) < 0);   /* "A" < "BANANA" */
    CHECK(compare_suffix("BANANA", 0, 0) == 0);  /* a suffix compared with itself */

    /* -- longer, realistic case: MISSISSIPPI, verify fully sorted -- */
    build_suffix_array("MISSISSIPPI", 11, sa);
    check_sorted("MISSISSIPPI", sa, 11);
    CHECK_EQ_INT(sa[0], 10);   /* "I" is the smallest suffix */
    CHECK_EQ_INT(sa[10], 2);   /* "SSISSIPPI" is the largest */

    /* -- empty text: nothing to sort, must not crash -- */
    build_suffix_array("", 0, sa);

    /* -- non-ASCII bytes: strcmp compares raw byte values, any value sorts correctly -- */
    {
        const char *text = "caf" "\xc3" "\xa9";   /* "caf" + a 2-byte UTF-8 e-acute */
        int nn = (int) strlen(text);
        build_suffix_array(text, nn, sa);
        check_sorted(text, sa, nn);
    }

    /* -- integration: run_scenario drives the real build path without crashing -- */
    run_scenario("unit-test integration", "ABAB");

    TEST_SUMMARY();
}
