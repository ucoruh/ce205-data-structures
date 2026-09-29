/* Unit tests for code/week-01/c/hello_workshop.c -- the semester's first program. It has no logic beyond
 * one printf, so these tests check its output byte for byte (and that it behaves the same every time it
 * is run), rather than testing a function that does not exist.
 */
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define main program_main
#include "../../c/hello_workshop.c"
#undef main
#include "../../../test_check.h"

static const char EXPECTED[] = "Hello, Data Structures!\n";

static FILE *cap_file;
static int cap_saved_fd;

static void capture_start(void) {
    fflush(stdout);
    cap_saved_fd = dup(fileno(stdout));
    cap_file = fopen("test_hw_capture.tmp", "w+");
    dup2(fileno(cap_file), fileno(stdout));
}

static void capture_end(char *buf, size_t bufsize) {
    fflush(stdout);
    dup2(cap_saved_fd, fileno(stdout));
    close(cap_saved_fd);
    long sz = ftell(cap_file);
    rewind(cap_file);
    size_t want = (size_t) sz < bufsize - 1 ? (size_t) sz : bufsize - 1;
    size_t n = fread(buf, 1, want, cap_file);
    buf[n] = '\0';
    fclose(cap_file);
    remove("test_hw_capture.tmp");
}

int main(void) {
    char buf[256];

    /* exact output, byte for byte, hand-written independent of the program */
    capture_start();
    int rc = program_main();
    capture_end(buf, sizeof buf);
    CHECK_EQ_INT(rc, 0);
    CHECK_EQ_INT((int) strlen(buf), (int) strlen(EXPECTED));
    CHECK(strcmp(buf, EXPECTED) == 0);

    /* the exact substrings a student is told to expect */
    CHECK(strstr(buf, "Hello, Data Structures!") != NULL);
    CHECK(strstr(buf, "Hello") == buf); /* starts with "Hello", not preceded by anything */

    /* exactly one line, terminated with a newline (not two lines, not missing the newline) */
    {
        int newlines = 0;
        for (const char *c = buf; *c; c++)
            if (*c == '\n') newlines++;
        CHECK_EQ_INT(newlines, 1);
        CHECK_EQ_INT(buf[strlen(buf) - 1], '\n');
    }

    /* no stray whitespace before the message, no trailing text after the newline */
    CHECK(buf[0] == 'H');
    CHECK_EQ_INT(buf[strlen(EXPECTED)], '\0'); /* nothing after the expected text */

    /* purely English identifiers/text: no Turkish-specific characters leaked into the English program */
    {
        int has_turkish_chars = 0;
        for (const unsigned char *c = (const unsigned char *) buf; *c; c++)
            if (*c >= 0x80) has_turkish_chars = 1;
        CHECK(!has_turkish_chars);
    }

    /* exact byte count: "Hello, Data Structures!\n" is 24 characters, counted by hand */
    CHECK_EQ_INT((int) strlen(EXPECTED), 24);

    /* the three words appear, in order, each only once */
    {
        const char *h = strstr(buf, "Hello");
        const char *d = h ? strstr(h, "Data") : NULL;
        const char *s = d ? strstr(d, "Structures") : NULL;
        CHECK(h != NULL);
        CHECK(d != NULL);
        CHECK(s != NULL);
    }

    /* common near-typos are NOT what gets printed (guards against a regression that drops the comma
     * or the exclamation mark) */
    CHECK(strcmp(buf, "Hello Data Structures!\n") != 0);   /* missing comma */
    CHECK(strcmp(buf, "Hello, Data Structures\n") != 0);   /* missing "!" */
    CHECK(strcmp(buf, "hello, data structures!\n") != 0);  /* wrong case */

    /* deterministic: running it many times in a row always produces the identical bytes */
    {
        int all_same = 1;
        for (int i = 0; i < 10; i++) {
            char again[256];
            capture_start();
            program_main();
            capture_end(again, sizeof again);
            if (strcmp(again, EXPECTED) != 0) all_same = 0;
        }
        CHECK(all_same);
    }

    TEST_SUMMARY();
}
