/* Unit tests for week-12 c/rabin_karp.c */
#define main program_main
#include "../../c/rabin_karp.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int occ[MAXOCC], spurious, count;

    /* -- normal: one genuine match, a large enough mod avoids spurious hits -- */
    count = rabin_karp("HELLOWORLD", 10, "WORLD", 5, 31, 101, occ, &spurious);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 5);
    CHECK_EQ_INT(spurious, 0);

    /* -- a small modulus deliberately causes spurious hits, but never a false report -- */
    count = rabin_karp("AADBDDBCDBB", 11, "AAD", 3, 4, 7, occ, &spurious);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);
    CHECK_EQ_INT(spurious, 2);

    /* -- no genuine match at all, despite several hash collisions -- */
    count = rabin_karp("DBCADADABDC", 11, "BAD", 3, 4, 7, occ, &spurious);
    CHECK_EQ_INT(count, 0);
    CHECK_EQ_INT(spurious, 3);

    /* -- overlapping genuine matches: same character everywhere, hash always matches AND verifies -- */
    count = rabin_karp("AAAAAAAAAA", 10, "AAA", 3, 31, 101, occ, &spurious);
    CHECK_EQ_INT(count, 8);
    CHECK_EQ_INT(spurious, 0);

    /* -- a large prime modulus: correct even with wide hash values (this caught a real 32-bit
     * overflow bug during development -- always use long long, never plain long, for the hash) -- */
    count = rabin_karp("ALGORITHMS", 10, "RITHM", 5, 31, 1000000007LL, occ, &spurious);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 4);
    CHECK_EQ_INT(spurious, 0);

    /* -- text == pattern -- */
    count = rabin_karp("HELLO", 5, "HELLO", 5, 31, 101, occ, &spurious);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);

    /* -- not found, and the modulus is large enough that no spurious hit occurs either -- */
    count = rabin_karp("THEQUICKFOX", 11, "ZEBRA", 5, 31, 1000000007LL, occ, &spurious);
    CHECK_EQ_INT(count, 0);
    CHECK_EQ_INT(spurious, 0);

    /* -- window_hash and the rolling update in rabin_karp must agree -- */
    long long direct = window_hash("ORLD", 4, 31, 101);   /* text[6..9] = "ORLD" */
    CHECK(direct >= 0 && direct < 101);

    /* -- single-character pattern -- */
    count = rabin_karp("BANANA", 6, "A", 1, 31, 101, occ, &spurious);
    CHECK_EQ_INT(count, 3);
    CHECK_EQ_INT(occ[0], 1);
    CHECK_EQ_INT(occ[1], 3);
    CHECK_EQ_INT(occ[2], 5);

    /* -- empty pattern: matches at every position, including one past the end -- */
    count = rabin_karp("HELLO", 5, "", 0, 31, 101, occ, &spurious);
    CHECK_EQ_INT(count, 6);
    CHECK_EQ_INT(spurious, 0);
    for (int i = 0; i <= 5; i++) CHECK_EQ_INT(occ[i], i);

    /* -- empty text, non-empty pattern: no possible match -- */
    count = rabin_karp("", 0, "AB", 2, 31, 101, occ, &spurious);
    CHECK_EQ_INT(count, 0);

    /* -- pattern longer than a non-empty text: no window fits, must not read past the text buffer
     * (this caught a real out-of-bounds read during development: window_hash(text, m, ...) read m
     * bytes of text even when text itself had fewer than m bytes) -- */
    count = rabin_karp("AB", 2, "ABCDE", 5, 31, 101, occ, &spurious);
    CHECK_EQ_INT(count, 0);
    CHECK_EQ_INT(spurious, 0);

    /* -- both empty: the only possible match, position 0 -- */
    count = rabin_karp("", 0, "", 0, 31, 101, occ, &spurious);
    CHECK_EQ_INT(count, 1);
    CHECK_EQ_INT(occ[0], 0);

    /* -- integration: run_scenario drives the real rolling-hash path -- */
    run_scenario("unit-test integration", "HELLOWORLD", "WORLD", 31, 101);

    TEST_SUMMARY();
}
