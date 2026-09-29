/* Unit tests for code/week-01/c/pointer_arithmetic.c: run_int_scenario/run_double_scenario/run_char_scenario.
 * They only print, so stdout is captured (redirecting the fd) and checked against hand-computed
 * addr = base + k * sizeof(type) lines and the out-of-range (UB-guard) message.
 */
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define main program_main
#include "../../c/pointer_arithmetic.c"
#undef main
#include "../../../test_check.h"

static FILE *cap_file;
static int cap_saved_fd;

static void capture_start(void) {
    fflush(stdout);
    cap_saved_fd = dup(fileno(stdout));
    cap_file = fopen("test_pa_capture.tmp", "w+");
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
    remove("test_pa_capture.tmp");
}

int main(void) {
    char buf[4096];

    /* int array: addr = base + k*4 (sizeof(int) = 4), value is the array element at that offset */
    {
        int values[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        int offsets[] = {0, 1, 2, 4, 9};
        capture_start();
        run_int_scenario("normal", 1000, values, 10, offsets, 5);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "(type = int, sizeof = 4)") != NULL);
        CHECK(strstr(buf, "p + 0 = 1000, *(p + 0) = 10") != NULL);   /* base + 0*4 = 1000 */
        CHECK(strstr(buf, "p + 1 = 1004, *(p + 1) = 20") != NULL);   /* base + 1*4 = 1004 */
        CHECK(strstr(buf, "p + 4 = 1016, *(p + 4) = 50") != NULL);   /* base + 4*4 = 1016 */
        CHECK(strstr(buf, "p + 9 = 1036, *(p + 9) = 100") != NULL);  /* base + 9*4 = 1036 */
    }

    /* out-of-range offsets (negative and >= n) report UB instead of reading -- the guard this program
     * exists to demonstrate */
    {
        int values[] = {4, 8, 15, 16, 23, 42, 8, 9, 15, 3};
        int offsets[] = {-1, 0, 5, 10, 15};
        capture_start();
        run_int_scenario("edge", 1000, values, 10, offsets, 5);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "p + -1 -> out of range (UB): 0 <= k < 10 required") != NULL);
        CHECK(strstr(buf, "p + 10 -> out of range (UB): 0 <= k < 10 required") != NULL);
        CHECK(strstr(buf, "p + 15 -> out of range (UB): 0 <= k < 10 required") != NULL);
        CHECK(strstr(buf, "p + 0 = 1000, *(p + 0) = 4") != NULL); /* the one in-range offset still prints */
    }

    /* double array: sizeof(double) = 8, so the stride is 8 bytes per index, not 4 */
    {
        double values[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        int offsets[] = {0, 2, 5};
        capture_start();
        run_double_scenario("hard", 2000, values, 12, offsets, 3);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "(type = double, sizeof = 8)") != NULL);
        CHECK(strstr(buf, "p + 0 = 2000, *(p + 0) = 1") != NULL);  /* base + 0*8 */
        CHECK(strstr(buf, "p + 2 = 2016, *(p + 2) = 3") != NULL);  /* base + 2*8 = 2016 */
        CHECK(strstr(buf, "p + 5 = 2040, *(p + 5) = 6") != NULL);  /* base + 5*8 = 2040 */
    }

    /* char array: sizeof(char) = 1, so p + k coincides with "k bytes" (the one type where byte offset
     * and element offset are the same number) */
    {
        char values[] = {65, 66, 67, 68, 69};
        int offsets[] = {0, 1, 4};
        capture_start();
        run_char_scenario("edge: char array", 500, values, 5, offsets, 3);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "(type = char, sizeof = 1)") != NULL);
        CHECK(strstr(buf, "p + 0 = 500, *(p + 0) = 65") != NULL);
        CHECK(strstr(buf, "p + 1 = 501, *(p + 1) = 66") != NULL); /* stride of exactly 1 */
        CHECK(strstr(buf, "p + 4 = 504, *(p + 4) = 69") != NULL);
    }

    /* one valid offset only (n = 1, offset 0): the smallest legal scenario, no out-of-range noise */
    {
        int values[] = {42};
        int offsets[] = {0};
        capture_start();
        run_int_scenario("one element", 100, values, 1, offsets, 1);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "p + 0 = 100, *(p + 0) = 42") != NULL);
        CHECK(strstr(buf, "out of range") == NULL);
    }

    /* offset exactly n (one past the end) is out of range, offset n - 1 (the last valid one) is not */
    {
        int values[] = {1, 2, 3};
        int offsets[] = {2, 3};
        capture_start();
        run_int_scenario("boundary", 0, values, 3, offsets, 2);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "p + 2 = 8, *(p + 2) = 3") != NULL);   /* last valid index: base 0 + 2*4 = 8 */
        CHECK(strstr(buf, "p + 3 -> out of range (UB): 0 <= k < 3 required") != NULL);
    }

    /* negative base still adds correctly (base is just an integer offset, not a real address) */
    {
        int values[] = {7, 8, 9};
        int offsets[] = {1};
        capture_start();
        run_int_scenario("negative base", -100, values, 3, offsets, 1);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "p + 1 = -96, *(p + 1) = 8") != NULL); /* -100 + 1*4 = -96 */
    }

    TEST_SUMMARY();
}
