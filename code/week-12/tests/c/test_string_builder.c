/* Unit tests for week-12 c/string_builder.c */
#include <string.h>

#define main program_main
#include "../../c/string_builder.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    Builder b;

    /* -- empty builder: nothing appended yet -- */
    builder_init(&b, 4);
    CHECK_EQ_INT(b.len, 0);
    CHECK_EQ_INT(b.cap, 4);
    CHECK_EQ_INT(b.growths, 0);
    builder_free(&b);

    /* -- a single character, well within capacity: no growth -- */
    builder_init(&b, 4);
    builder_append(&b, 'X');
    CHECK_EQ_INT(b.len, 1);
    CHECK_EQ_INT(b.cap, 4);
    CHECK_EQ_INT(b.growths, 0);
    CHECK_EQ_INT(b.buf[0], 'X');
    builder_free(&b);

    /* -- exact fit: appending exactly cap characters triggers no growth at all -- */
    builder_init(&b, 4);
    for (int i = 0; i < 4; i++) builder_append(&b, (char) ('A' + i));
    CHECK_EQ_INT(b.len, 4);
    CHECK_EQ_INT(b.cap, 4);
    CHECK_EQ_INT(b.growths, 0);
    CHECK(strncmp(b.buf, "ABCD", 4) == 0);
    builder_free(&b);

    /* -- one character past capacity: exactly one growth, capacity doubles -- */
    builder_init(&b, 4);
    for (int i = 0; i < 5; i++) builder_append(&b, (char) ('A' + i));
    CHECK_EQ_INT(b.len, 5);
    CHECK_EQ_INT(b.cap, 8);          /* doubled from 4 */
    CHECK_EQ_INT(b.growths, 1);
    CHECK(strncmp(b.buf, "ABCDE", 5) == 0);
    builder_free(&b);

    /* -- every existing byte survives a growth, not just the new one -- */
    builder_init(&b, 2);
    for (int i = 0; i < 10; i++) builder_append(&b, (char) ('A' + i));
    CHECK_EQ_INT(b.len, 10);
    CHECK(strncmp(b.buf, "ABCDEFGHIJ", 10) == 0);
    builder_free(&b);

    /* -- the smallest possible start: initCap = 1, many growths back to back -- */
    builder_init(&b, 1);
    for (int i = 0; i < 10; i++) builder_append(&b, (char) ('A' + i));
    CHECK_EQ_INT(b.len, 10);
    CHECK_EQ_INT(b.cap, 16);         /* 1 -> 2 -> 4 -> 8 -> 16 */
    CHECK_EQ_INT(b.growths, 4);
    CHECK(strncmp(b.buf, "ABCDEFGHIJ", 10) == 0);
    builder_free(&b);

    /* -- capacity doubles every time it grows, checked at each step -- */
    builder_init(&b, 2);
    int expected_cap = 2;
    for (int i = 0; i < 20; i++) {
        int was_full = (b.len == b.cap);
        builder_append(&b, 'Q');
        if (was_full) expected_cap *= 2;
        CHECK_EQ_INT(b.cap, expected_cap);
    }
    builder_free(&b);

    /* -- all-equal characters: a long run of the same byte -- */
    builder_init(&b, 4);
    for (int i = 0; i < 12; i++) builder_append(&b, 'Z');
    CHECK_EQ_INT(b.len, 12);
    for (int i = 0; i < 12; i++) CHECK_EQ_INT(b.buf[i], 'Z');
    builder_free(&b);

    /* -- non-ASCII bytes: the builder just stores bytes, any value works -- */
    builder_init(&b, 2);
    builder_append(&b, 'c');
    builder_append(&b, 'a');
    builder_append(&b, 'f');
    builder_append(&b, (char) 0xC3);
    builder_append(&b, (char) 0xA9);
    CHECK_EQ_INT(b.len, 5);
    CHECK_EQ_INT(b.buf[3], (char) 0xC3);
    CHECK_EQ_INT(b.buf[4], (char) 0xA9);
    builder_free(&b);

    /* -- a single-element initial capacity holding exactly one character: no growth -- */
    builder_init(&b, 1);
    builder_append(&b, 'Q');
    CHECK_EQ_INT(b.len, 1);
    CHECK_EQ_INT(b.cap, 1);
    CHECK_EQ_INT(b.growths, 0);
    builder_free(&b);

    /* -- growths counter matches the number of doublings, not the number of appends -- */
    builder_init(&b, 10);
    for (int i = 0; i < 10; i++) builder_append(&b, 'M');   /* exact fit, no growth */
    CHECK_EQ_INT(b.growths, 0);
    builder_append(&b, 'M');                                 /* the 11th forces exactly one growth */
    CHECK_EQ_INT(b.growths, 1);
    CHECK_EQ_INT(b.cap, 20);
    builder_free(&b);

    /* -- integration: run_scenario drives the real append/growth path without crashing -- */
    run_scenario("unit-test integration", 4, "HELLOWORLD");

    TEST_SUMMARY();
}
