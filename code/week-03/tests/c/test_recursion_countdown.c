/* Unit tests for week-03 c/recursion_countdown.c
 * countdown() only prints; there is no return value or global state to inspect, so
 * these tests capture stdout (redirected to a temp file with freopen, with the
 * original file descriptor saved/restored via dup/dup2) and check the printed
 * lines against an independent, hand-built expectation. */
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define main program_main
#include "../../c/recursion_countdown.c"
#undef main
#include "../../../test_check.h"

#define CAPTURE_FILE "test_recursion_countdown.tmp"

/* Runs countdown(n) with stdout redirected to CAPTURE_FILE, restores real stdout,
 * then opens CAPTURE_FILE for the caller to read line by line. Returns NULL on any
 * setup failure (the caller then just skips the detailed checks). */
static FILE *capture_countdown(int n) {
    int saved_fd = dup(fileno(stdout));
    if (saved_fd < 0) return NULL;
    if (freopen(CAPTURE_FILE, "w", stdout) == NULL) { close(saved_fd); return NULL; }

    countdown(n);
    fflush(stdout);

    dup2(saved_fd, fileno(stdout));
    close(saved_fd);
    clearerr(stdout);

    return fopen(CAPTURE_FILE, "r");
}

static void expect_line(FILE *in, const char *expected) {
    char line[64];
    CHECK(fgets(line, sizeof line, in) != NULL);
    CHECK(strcmp(line, expected) == 0);
}

int main(void) {
    /* -- countdown(3): 3, 2, 1, Liftoff! and nothing more -- */
    FILE *in = capture_countdown(3);
    CHECK(in != NULL);
    if (in) {
        expect_line(in, "3\n");
        expect_line(in, "2\n");
        expect_line(in, "1\n");
        expect_line(in, "Liftoff!\n");
        char line[64];
        CHECK(fgets(line, sizeof line, in) == NULL);   /* nothing more is printed */
        fclose(in);
    }

    /* -- countdown(1): a single line, then Liftoff! -- */
    in = capture_countdown(1);
    if (in) {
        expect_line(in, "1\n");
        expect_line(in, "Liftoff!\n");
        fclose(in);
    }

    /* -- the fixed base case, n = 0: straight to Liftoff!, no countdown line at all -- */
    in = capture_countdown(0);
    if (in) {
        expect_line(in, "Liftoff!\n");
        char line[64];
        CHECK(fgets(line, sizeof line, in) == NULL);
        fclose(in);
    }

    /* -- negative input still stops in one call: the base case is `n <= 0`, not
     *    `n == 0`, so it must not recurse forever on negative n -- */
    in = capture_countdown(-4);
    if (in) {
        expect_line(in, "Liftoff!\n");
        char line[64];
        CHECK(fgets(line, sizeof line, in) == NULL);
        fclose(in);
    }
    in = capture_countdown(-1000000);   /* deeply negative: still one call, not a hang */
    if (in) {
        expect_line(in, "Liftoff!\n");
        fclose(in);
    }

    /* -- countdown(15), the program's own "hard" preset: a deeper call stack, still
     *    counts down one integer per line, in order, down to 1 -- */
    in = capture_countdown(15);
    if (in) {
        for (int n = 15; n >= 1; n--) {
            char expected[16];
            snprintf(expected, sizeof expected, "%d\n", n);
            expect_line(in, expected);
        }
        expect_line(in, "Liftoff!\n");
        fclose(in);
    }

    remove(CAPTURE_FILE);
    TEST_SUMMARY();
}
