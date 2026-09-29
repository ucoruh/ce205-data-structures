/* Unit tests for code/week-01/c/leak_demo.c. Captures stdout and checks every deterministic value and
 * message; addresses are compared to each other (equal / not-equal), never to a hard-coded value, since
 * an allocator's real address cannot be predicted.
 */
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define main program_main
#include "../../c/leak_demo.c"
#undef main
#include "../../../test_check.h"

static FILE *cap_file;
static int cap_saved_fd;

static void capture_start(void) {
    fflush(stdout);
    cap_saved_fd = dup(fileno(stdout));
    cap_file = fopen("test_ld_capture.tmp", "w+");
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
    remove("test_ld_capture.tmp");
}

static void extract_after(const char *hay, const char *prefix, char *out, size_t outsz) {
    const char *p = strstr(hay, prefix);
    out[0] = '\0';
    if (!p) return;
    p += strlen(prefix);
    size_t i = 0;
    while (*p && *p != ',' && *p != ' ' && *p != ')' && *p != '\n' && i + 1 < outsz)
        out[i++] = *p++;
    out[i] = '\0';
}

int main(void) {
    char buf[4096];
    int rc;

    capture_start();
    rc = program_main();
    capture_end(buf, sizeof buf);

    CHECK_EQ_INT(rc, 0);

    /* deterministic values and messages, exactly as the program is supposed to print them */
    CHECK(strstr(buf, "*a = 1") != NULL);                                   /* freshly allocated and set */
    CHECK(strstr(buf, "a and b point to the same block: true") != NULL);    /* b is an alias, not a copy */
    CHECK(strstr(buf, "after *b = 99: *a = 99") != NULL);                   /* write through b, read through a */
    CHECK(strstr(buf, "freed and cleared: a = ") != NULL);

    /* "a" before free and "a" after free (now NULL) must be DIFFERENT tokens -- freeing really changed
     * the pointer's value, it did not leave the old address behind */
    {
        char before[64], after[64];
        extract_after(buf, "a = ", before, sizeof before);       /* first "a = ...": the malloc'd address */
        const char *tail = strstr(buf, "freed and cleared: ");
        CHECK(tail != NULL);
        extract_after(tail, "a = ", after, sizeof after);        /* second "a = ...": after free + NULL */
        CHECK(before[0] != '\0');
        CHECK(after[0] != '\0');
        CHECK(strcmp(before, after) != 0);
    }

    /* after being cleared, "a" and "b" print the SAME token as each other: both are NULL, and a NULL
     * pointer always prints the same way twice in the same program */
    {
        const char *tail = strstr(buf, "freed and cleared: ");
        CHECK(tail != NULL);
        char a_after[64], b_after[64];
        extract_after(tail, "a = ", a_after, sizeof a_after);
        const char *btail = strstr(tail, "b = ");
        CHECK(btail != NULL);
        extract_after(btail, "b = ", b_after, sizeof b_after);
        CHECK(strcmp(a_after, b_after) == 0);
    }

    /* four lines of output total (one per printf/two-value printf call) */
    {
        int newlines = 0;
        for (const char *c = buf; *c; c++)
            if (*c == '\n') newlines++;
        CHECK_EQ_INT(newlines, 4);
    }

    /* the program frees exactly what it allocates: running it repeatedly must not crash or hang
     * (a coarse leak/UAF smoke test -- AddressSanitizer, run separately, catches the rest) */
    {
        for (int i = 0; i < 20; i++) {
            capture_start();
            int rc2 = program_main();
            capture_end(buf, sizeof buf);
            CHECK_EQ_INT(rc2, 0);
        }
    }

    TEST_SUMMARY();
}
