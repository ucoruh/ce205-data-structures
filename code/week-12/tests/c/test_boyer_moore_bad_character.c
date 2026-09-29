/* Unit tests for week-12 c/boyer_moore_bad_character.c */
#define main program_main
#include "../../c/boyer_moore_bad_character.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int last[256], occ[MAXOCC], count;

    /* -- bad-character table: only pattern letters get a real index, everything else -1 -- */
    bad_char_table("ABC", 3, last);
    CHECK_EQ_INT(last[(unsigned char) 'A'], 0);
    CHECK_EQ_INT(last[(unsigned char) 'B'], 1);
    CHECK_EQ_INT(last[(unsigned char) 'C'], 2);
    CHECK_EQ_INT(last[(unsigned char) 'Z'], -1);

    /* -- a repeated letter keeps its RIGHTMOST position -- */
    bad_char_table("ABAC", 4, last);
    CHECK_EQ_INT(last[(unsigned char) 'A'], 2);   /* not 0 */

    /* -- normal: one match after a couple of jumps -- */
    bad_char_table("ABC", 3, last);
    count = boyer_moore_bad_char("ABAAABCDAB", 10, "ABC", 3, last, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 4);

    /* -- never found -- */
    bad_char_table("ZEBRA", 5, last);
    count = boyer_moore_bad_char("THEQUICKBROWNFOX", 16, "ZEBRA", 5, last, occ);
    CHECK_EQ_INT(count, 0);

    /* -- character absent from the pattern entirely: jumps by the full pattern length -- */
    bad_char_table("ABC", 3, last);
    count = boyer_moore_bad_char("ZZZZZZZZZZ", 10, "ABC", 3, last, occ);
    CHECK_EQ_INT(count, 0);

    /* -- match right at the end -- */
    bad_char_table("ABC", 3, last);
    count = boyer_moore_bad_char("XXXXXXXABC", 10, "ABC", 3, last, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 7);

    /* -- low-diversity text: still terminates and correctly reports no match -- */
    bad_char_table("AAAB", 4, last);
    count = boyer_moore_bad_char("AAAAAAAAAA", 10, "AAAB", 4, last, occ);
    CHECK_EQ_INT(count, 0);

    /* -- text == pattern -- */
    bad_char_table("HELLO", 5, last);
    count = boyer_moore_bad_char("HELLO", 5, "HELLO", 5, last, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);

    /* -- overlapping matches: every shift matches, like naive and KMP search -- */
    bad_char_table("AAA", 3, last);
    count = boyer_moore_bad_char("AAAAAAAAAA", 10, "AAA", 3, last, occ);
    CHECK_EQ_INT(count, 8);

    /* -- two non-overlapping matches -- */
    bad_char_table("ABC", 3, last);
    count = boyer_moore_bad_char("ABCABC", 6, "ABC", 3, last, occ);
    CHECK_EQ_INT(count, 2);
    CHECK_EQ_INT(occ[0], 0);
    CHECK_EQ_INT(occ[1], 3);

    /* -- empty pattern: matches at every position, including one past the end -- */
    bad_char_table("", 0, last);
    count = boyer_moore_bad_char("HELLO", 5, "", 0, last, occ);
    CHECK_EQ_INT(count, 6);
    for (int i = 0; i <= 5; i++) CHECK_EQ_INT(occ[i], i);

    /* -- empty text, non-empty pattern: no possible match -- */
    bad_char_table("AB", 2, last);
    count = boyer_moore_bad_char("", 0, "AB", 2, last, occ);
    CHECK_EQ_INT(count, 0);

    /* -- both empty: the only possible match, position 0 -- */
    bad_char_table("", 0, last);
    count = boyer_moore_bad_char("", 0, "", 0, last, occ);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);

    /* -- non-ASCII bytes: last[] is indexed by unsigned char, so every byte value 0..255 is safe -- */
    {
        const char *text = "caf" "\xc3" "\xa9" "z";
        const char *pattern = "\xc3" "\xa9";
        int nn = (int) strlen(text), mm = (int) strlen(pattern);
        bad_char_table(pattern, mm, last);
        count = boyer_moore_bad_char(text, nn, pattern, mm, last, occ);
        CHECK_EQ_INT(count, 1);
        CHECK_EQ_INT(occ[0], 3);
    }

    /* -- integration: run_scenario drives the real bad-character path -- */
    run_scenario("unit-test integration", "ABAAABCDAB", "ABC");

    TEST_SUMMARY();
}
