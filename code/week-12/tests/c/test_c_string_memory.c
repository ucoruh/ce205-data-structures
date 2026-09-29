/* Unit tests for week-12 c/c_string_memory.c */
#include <string.h>

#define main program_main
#include "../../c/c_string_memory.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    int overflow;
    int written;

    /* -- normal fit: short string into a generous buffer -- */
    written = safe_store("HI", 5, &overflow);
    CHECK_EQ_INT(written, 2);
    CHECK(overflow == 0);
    CHECK(strcmp(buf, "HI") == 0);
    CHECK_EQ_INT((int) strlen(buf), 2);

    /* -- exact fit: cap-1 characters use every byte, 0 bytes slack -- */
    written = safe_store("ABC", 4, &overflow);
    CHECK_EQ_INT(written, 3);
    CHECK(overflow == 0);
    CHECK(strcmp(buf, "ABC") == 0);

    /* -- overflow: flagged, and the write NEVER goes past index cap-1 -- */
    written = safe_store("ABCDE", 3, &overflow);
    CHECK_EQ_INT(written, 3);      /* buf[0..2] were safely written (all of cap) */
    CHECK(overflow == 1);
    CHECK_EQ_INT(buf[0], 'A');
    CHECK_EQ_INT(buf[1], 'B');
    CHECK_EQ_INT(buf[2], 'C');     /* the 'D' and 'E' were never copied */

    /* -- empty source: the loop never runs, no overflow -- */
    written = safe_store("", 5, &overflow);
    CHECK_EQ_INT(written, 0);
    CHECK(overflow == 0);
    CHECK_EQ_INT((int) strlen(buf), 0);

    /* -- cap = 0: overflow is flagged on the very first character, nothing is ever written -- */
    written = safe_store("X", 0, &overflow);
    CHECK_EQ_INT(written, 0);
    CHECK(overflow == 1);

    /* -- cap = 1: a single character exactly fits (0 bytes slack) -- */
    written = safe_store("X", 1, &overflow);
    CHECK_EQ_INT(written, 1);
    CHECK(overflow == 0);
    CHECK(strcmp(buf, "X") == 0);

    /* -- cap = 1, 2-character source: overflow after the first character -- */
    written = safe_store("XY", 1, &overflow);
    CHECK_EQ_INT(written, 1);
    CHECK(overflow == 1);
    CHECK_EQ_INT(buf[0], 'X');     /* the first byte was still safely written */

    /* -- duplicates: a run of identical characters is stored correctly -- */
    written = safe_store("AAAAAAAAAA", MAX_CAP, &overflow);
    CHECK_EQ_INT(written, 10);
    CHECK(overflow == 0);
    CHECK(strcmp(buf, "AAAAAAAAAA") == 0);

    /* -- no out-of-bounds write ever happens: sentinel bytes past cap stay untouched -- */
    for (int k = 0; k < MAX_CAP; k++) buf[k] = 'Z';
    written = safe_store("ABCDEFGHIJKLMNOP", 5, &overflow);   /* far longer than cap */
    CHECK_EQ_INT(written, 5);
    CHECK(overflow == 1);
    for (int k = 5; k < MAX_CAP; k++) CHECK_EQ_INT(buf[k], 'Z');   /* every byte past cap is still 'Z' */

    /* -- boundary: cap == MAX_CAP exactly still works and does not overflow the real array -- */
    written = safe_store("HELLOWORLD", MAX_CAP, &overflow);
    CHECK_EQ_INT(written, 10);
    CHECK(overflow == 0);

    /* -- non-ASCII bytes: safe_store just copies bytes, any value works -- */
    written = safe_store("caf" "\xc3" "\xa9", MAX_CAP, &overflow);
    CHECK_EQ_INT(written, 5);
    CHECK(overflow == 0);
    CHECK_EQ_INT(buf[3], (char) 0xC3);
    CHECK_EQ_INT(buf[4], (char) 0xA9);

    /* -- integration: run_scenario drives the real safe_store path and prints without crashing -- */
    run_scenario("unit-test integration", "TEST", 8);
    CHECK(strcmp(buf, "TEST") == 0);

    TEST_SUMMARY();
}
