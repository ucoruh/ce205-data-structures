/* Unit tests for code/week-01/c/pointer_basics.c. The program prints a real address, which cannot be
 * predicted or reproduced (see the note's own caveat), so these tests capture stdout and check: (a) every
 * deterministic value (x, *p, x after *p = 5), exactly, and (b) the one thing that IS guaranteed about the
 * address even though its value is not -- the SAME address is printed for "&x" and for "p", because p = &x.
 */
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define main program_main
#include "../../c/pointer_basics.c"
#undef main
#include "../../../test_check.h"

static FILE *cap_file;
static int cap_saved_fd;

static void capture_start(void) {
    fflush(stdout);
    cap_saved_fd = dup(fileno(stdout));
    cap_file = fopen("test_pb_capture.tmp", "w+");
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
    remove("test_pb_capture.tmp");
}

/* Copies the token right after `prefix` in `hay`, stopping at the first space, comma, ')' or newline. */
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

    capture_start();
    int rc = program_main();
    capture_end(buf, sizeof buf);

    CHECK_EQ_INT(rc, 0);

    /* deterministic values: x starts at 3, *p reads 3 through the pointer, and after *p = 5 both
     * "x" and what the pointer reaches have become 5 (independent of what address any of this lives at) */
    CHECK(strstr(buf, "x = 3, stored at address ") != NULL);
    CHECK(strstr(buf, "*p = 3 (dereferencing p reads the value at that address)") != NULL);
    CHECK(strstr(buf, "after *p = 5: x = 5") != NULL);

    /* four lines, in this exact order (a structural check independent of the address values) */
    {
        const char *l1 = strstr(buf, "x = 3, stored at address ");
        const char *l2 = l1 ? strstr(l1, "p = ") : NULL;
        const char *l3 = l2 ? strstr(l2, "*p = 3") : NULL;
        const char *l4 = l3 ? strstr(l3, "after *p = 5") : NULL;
        CHECK(l1 != NULL);
        CHECK(l2 != NULL);
        CHECK(l3 != NULL);
        CHECK(l4 != NULL);
    }

    /* the address printed for "&x" and the address printed for "p" must be IDENTICAL, because the
     * program sets p = &x -- this is true no matter what the actual address value is on this machine */
    {
        char addr_of_x[64], addr_in_p[64];
        extract_after(buf, "stored at address ", addr_of_x, sizeof addr_of_x);
        extract_after(buf, "p = ", addr_in_p, sizeof addr_in_p);
        CHECK(addr_of_x[0] != '\0');
        CHECK(addr_in_p[0] != '\0');
        CHECK(strcmp(addr_of_x, addr_in_p) == 0);
    }

    /* running the program twice in the same process still prints the same DETERMINISTIC values both
     * times (only the address may differ from run to run, never the numbers) */
    {
        char buf2[4096];
        capture_start();
        program_main();
        capture_end(buf2, sizeof buf2);
        CHECK(strstr(buf2, "x = 3, stored at address ") != NULL);
        CHECK(strstr(buf2, "after *p = 5: x = 5") != NULL);
    }

    /* exactly four lines of output (one per printf call), an independent structural count via '\n' */
    {
        int newlines = 0;
        for (const char *c = buf; *c; c++)
            if (*c == '\n') newlines++;
        CHECK_EQ_INT(newlines, 4);
    }

    /* the address token is plausible hex text (only hex digits, and an optional "0x"/"X" marker) --
     * checked structurally, never against a specific value */
    {
        char addr[64];
        extract_after(buf, "stored at address ", addr, sizeof addr);
        CHECK(strlen(addr) >= 1);
        int all_hexish = 1;
        for (size_t i = 0; addr[i]; i++) {
            char c = addr[i];
            int is_hex_digit = (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
            if (!is_hex_digit && c != 'x' && c != 'X')
                all_hexish = 0;
        }
        CHECK(all_hexish);
    }

    TEST_SUMMARY();
}
