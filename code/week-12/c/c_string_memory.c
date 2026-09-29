/* Week 12 -- Strings: Structures and Algorithms
 * C string memory: a char array plus the '\0' convention, strlen(), and a buffer-overflow edge case that is
 * FLAGGED but never executed (no out-of-bounds write is ever performed -- the guard `if (i == cap) break;`
 * stops the copy one write before it would happen).
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <string.h>

#define MAX_CAP 16

static char buf[MAX_CAP];

/* Copies src into buf, character by character, but never writes past index cap-1. If src needs more than
 * cap bytes (cap-1 characters plus the terminator), the copy stops as soon as it WOULD go out of bounds and
 * *overflow is set to 1 -- the out-of-bounds write is flagged, never executed. Returns the number of bytes
 * actually written (== cap on overflow, since buf[0..cap-1] are all filled and all valid). */
static int safe_store(const char *src, int cap, int *overflow) {
    int i = 0;
    while (src[i] != '\0') {
        if (i == cap) break;      /* would need buf[cap]: out of bounds -- stop, never write it */
        buf[i] = src[i];
        i++;
    }
    *overflow = (src[i] != '\0');
    if (!*overflow) buf[i] = '\0';
    return i;
}

static void run_scenario(const char *label, const char *text, int cap) {
    printf("-- %s --\n", label);
    printf("cap = %d, source = \"%s\" (%d letters)\n", cap, text, (int) strlen(text));
    int overflow = 0;
    int written = safe_store(text, cap, &overflow);
    if (overflow) {
        printf("overflow flagged after %d bytes: buf[%d] would be out of bounds (valid indices 0..%d) -- stopped, never executed\n", written, cap, cap - 1);
    } else {
        size_t len = strlen(buf);
        printf("stored \"%s\", strlen = %zu\n", buf, len);
    }
    printf("\n");
}

int main(void) {
    run_scenario("normal: cap=16, comfortable fit", "HELLOWORLD", 16);
    run_scenario("hard: cap=12, 1 byte of slack", "ALGORITHMS", 12);
    run_scenario("edge: cap=11, exact fit (0 bytes slack)", "ALGORITHMS", 11);
    run_scenario("edge: cap=8, overflow -- flagged, never executed", "STRUCTURES", 8);
    run_scenario("edge: cap=16, repeated character", "AAAAAAAAAA", 16);
    return 0;
}
