/* Unit tests for code/week-01/c/array_vs_linked_preview.c: run_scenario() prints, it does not return a value,
 * so these tests capture stdout (redirecting the fd, not calling the function twice) and check the exact
 * lines against hand-computed expectations (base + i*4 offsets, node numbering, hop counts).
 */
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define main program_main
#include "../../c/array_vs_linked_preview.c"
#undef main
#include "../../../test_check.h"

static FILE *cap_file;
static int cap_saved_fd;

static void capture_start(void) {
    fflush(stdout);
    cap_saved_fd = dup(fileno(stdout));
    cap_file = fopen("test_avlp_capture.tmp", "w+");
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
    remove("test_avlp_capture.tmp");
}

int main(void) {
    char buf[4096];

    /* normal: 10 values, k = 4 -- check the header, one array line (base+16 = 4*4), the access-cost line,
     * the middle node's neighbours, the last node's NULL terminator, and the hop count */
    {
        int values[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        capture_start();
        run_scenario("normal: 10 values, k = 4 (in the middle)", values, 10, 4);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "array (contiguous, indexed access):") != NULL);
        CHECK(strstr(buf, "arr[0] = 10 at base+0") != NULL);
        CHECK(strstr(buf, "arr[4] = 50 at base+16") != NULL);   /* base + 4*4 */
        CHECK(strstr(buf, "arr[9] = 100 at base+36") != NULL);  /* base + 9*4 */
        CHECK(strstr(buf, "array access: arr[4] = 50, ONE index calculation (base + 4*4). O(1).") != NULL);
        CHECK(strstr(buf, "node #0: data = 10, next -> node #1") != NULL);
        CHECK(strstr(buf, "node #4: data = 50, next -> node #5") != NULL);
        CHECK(strstr(buf, "node #9: data = 100, next -> NULL") != NULL); /* last node terminates the list */
        CHECK(strstr(buf, "linked access: reached node with data = 50 after 4 hops. O(n).") != NULL);
    }

    /* edge: k = 0 -- zero hops (the plural "hops" still applies to zero, only 1 is singular) */
    {
        int values[] = {7, 14, 21, 28, 35, 42, 49, 56, 63, 70};
        capture_start();
        run_scenario("edge: k = 0, the first element", values, 10, 0);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "linked access: reached node with data = 7 after 0 hops. O(n).") != NULL);
    }

    /* edge: k = n - 1 -- the most hops, reaches the very last node */
    {
        int values[] = {3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36};
        capture_start();
        run_scenario("edge: k = the last index, the most hops", values, 12, 11);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "arr[11] = 36 at base+44") != NULL); /* base + 11*4 */
        CHECK(strstr(buf, "node #11: data = 36, next -> NULL") != NULL);
        CHECK(strstr(buf, "linked access: reached node with data = 36 after 11 hops. O(n).") != NULL);
    }

    /* one element, k = 0: the only node is both head and tail (next -> NULL), zero hops */
    {
        int values[] = {99};
        capture_start();
        run_scenario("one element", values, 1, 0);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "arr[0] = 99 at base+0") != NULL);
        CHECK(strstr(buf, "node #0: data = 99, next -> NULL") != NULL);
        CHECK(strstr(buf, "reached node with data = 99 after 0 hops. O(n).") != NULL);
    }

    /* two elements, k = 1: exactly ONE hop -- singular "hop", not "hops" */
    {
        int values[] = {1, 2};
        capture_start();
        run_scenario("two elements", values, 2, 1);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "node #0: data = 1, next -> node #1") != NULL);
        CHECK(strstr(buf, "node #1: data = 2, next -> NULL") != NULL);
        CHECK(strstr(buf, "after 1 hop. O(n).") != NULL);       /* singular */
        CHECK(strstr(buf, "after 1 hops. O(n).") == NULL);      /* must NOT say "1 hops" */
    }

    /* duplicate values: each occurrence still gets its own, distinct node number */
    {
        int values[] = {5, 5, 5, 5};
        capture_start();
        run_scenario("duplicates", values, 4, 2);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "node #0: data = 5, next -> node #1") != NULL);
        CHECK(strstr(buf, "node #1: data = 5, next -> node #2") != NULL);
        CHECK(strstr(buf, "node #2: data = 5, next -> node #3") != NULL);
        CHECK(strstr(buf, "node #3: data = 5, next -> NULL") != NULL);
        CHECK(strstr(buf, "reached node with data = 5 after 2 hops. O(n).") != NULL);
    }

    /* negative values: offsets and node data print correctly for negative numbers too */
    {
        int values[] = {-1, -2, -3};
        capture_start();
        run_scenario("negative values", values, 3, 2);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "arr[2] = -3 at base+8") != NULL);
        CHECK(strstr(buf, "node #2: data = -3, next -> NULL") != NULL);
    }

    /* the scenario label line has no duplicated "(k = N)" suffix (a real bug found and fixed in this
     * pass -- the label already states k in prose, so run_scenario must print it exactly once) */
    {
        int values[] = {1, 2, 3};
        capture_start();
        run_scenario("normal: 10 values, k = 4 (in the middle)", values, 3, 1);
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "-- normal: 10 values, k = 4 (in the middle) --") != NULL);
        CHECK(strstr(buf, "(in the middle) (k =") == NULL); /* no second "(k = ...)" tacked on */
    }

    TEST_SUMMARY();
}
