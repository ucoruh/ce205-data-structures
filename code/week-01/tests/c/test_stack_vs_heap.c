/* Unit tests for code/week-01/c/stack_vs_heap.c: show_frame(depth) directly, plus the captured output of
 * the whole program for the heap section. "local" is deterministic (depth * 10); addresses are only ever
 * compared to each other (distinct per frame), never to a hard-coded value.
 */
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define main program_main
#include "../../c/stack_vs_heap.c"
#undef main
#include "../../../test_check.h"

static FILE *cap_file;
static int cap_saved_fd;

static void capture_start(void) {
    fflush(stdout);
    cap_saved_fd = dup(fileno(stdout));
    cap_file = fopen("test_svh_capture.tmp", "w+");
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
    remove("test_svh_capture.tmp");
}

static int count_lines_starting_with(const char *hay, const char *needle) {
    int n = 0;
    for (const char *p = hay; (p = strstr(p, needle)) != NULL; p++) n++;
    return n;
}

int main(void) {
    char buf[4096];

    /* show_frame(0): recurses 0 -> 1 -> 2 -> 3, stopping because 3 < 3 is false. Exactly four lines,
     * local = depth * 10 each time (hand-computed, independent of the function). */
    {
        capture_start();
        show_frame(0);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "depth 0: local = 0, stored at ") != NULL);
        CHECK(strstr(buf, "depth 1: local = 10, stored at ") != NULL);
        CHECK(strstr(buf, "depth 2: local = 20, stored at ") != NULL);
        CHECK(strstr(buf, "depth 3: local = 30, stored at ") != NULL);
        CHECK_EQ_INT(count_lines_starting_with(buf, "depth "), 4);
    }

    /* show_frame(3): the base case reached directly -- exactly one line, no recursion (3 < 3 is false) */
    {
        capture_start();
        show_frame(3);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "depth 3: local = 30, stored at ") != NULL);
        CHECK_EQ_INT(count_lines_starting_with(buf, "depth "), 1);
    }

    /* show_frame(5): still a base case (5 < 3 is false) even though main() never starts this high --
     * confirms the guard is "depth < 3", not "depth == 3" */
    {
        capture_start();
        show_frame(5);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "depth 5: local = 50, stored at ") != NULL);
        CHECK_EQ_INT(count_lines_starting_with(buf, "depth "), 1);
    }

    /* show_frame(1): recurses 1 -> 2 -> 3, three lines, locals 10, 20, 30 */
    {
        capture_start();
        show_frame(1);
        capture_end(buf, sizeof buf);
        CHECK_EQ_INT(count_lines_starting_with(buf, "depth "), 3);
        CHECK(strstr(buf, "depth 1: local = 10, stored at ") != NULL);
        CHECK(strstr(buf, "depth 2: local = 20, stored at ") != NULL);
    }

    /* every recursive call gets ITS OWN stack frame: the four addresses printed by show_frame(0) must
     * be four DIFFERENT addresses (never comparing to a fixed value, only to each other) */
    {
        capture_start();
        show_frame(0);
        capture_end(buf, sizeof buf);
        char addrs[4][64];
        const char *p = buf;
        for (int i = 0; i < 4; i++) {
            p = strstr(p, "stored at ");
            CHECK(p != NULL);
            p += strlen("stored at ");
            size_t k = 0;
            while (*p && *p != '\n' && k + 1 < sizeof addrs[0]) addrs[i][k++] = *p++;
            addrs[i][k] = '\0';
        }
        for (int i = 0; i < 4; i++)
            for (int j = i + 1; j < 4; j++)
                CHECK(strcmp(addrs[i], addrs[j]) != 0);
    }

    /* the whole program: the heap section prints the three values we stored, in order, and a
     * deterministic "freed" line at the end */
    {
        capture_start();
        int rc = program_main();
        capture_end(buf, sizeof buf);
        CHECK_EQ_INT(rc, 0);
        CHECK(strstr(buf, "-- stack: one frame per call, freed automatically on return --") != NULL);
        CHECK(strstr(buf, "-- heap: a block we must ask for and give back ourselves --") != NULL);
        CHECK(strstr(buf, "block[0..2] = 100 200 300") != NULL); /* (i+1)*100 for i = 0,1,2 */
        CHECK(strstr(buf, "freed and set to NULL: block = ") != NULL);
    }

    TEST_SUMMARY();
}
