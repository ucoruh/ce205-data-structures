/* Week 12 -- Strings: Structures and Algorithms
 * Growable string buffer: characters are appended one at a time; when full, a new block double the size is
 * allocated, every existing byte is copied across (realloc), then the new character is written. Appending is
 * O(1) most of the time and O(len) only on the rare growth step -- amortized O(1) overall.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    char *buf;
    int len;
    int cap;
    int growths;
} Builder;

static void builder_init(Builder *b, int init_cap) {
    b->cap = init_cap;
    b->buf = malloc((size_t) b->cap);
    b->len = 0;
    b->growths = 0;
}

static void builder_append(Builder *b, char c) {
    if (b->len == b->cap) {              /* full: grow before writing */
        b->cap = b->cap * 2;
        b->buf = realloc(b->buf, (size_t) b->cap);   /* copies every old byte across */
        b->growths++;
    }
    b->buf[b->len] = c;
    b->len++;
}

static void builder_free(Builder *b) {
    free(b->buf);
    b->buf = NULL;
}

static void run_scenario(const char *label, int init_cap, const char *chars) {
    printf("-- %s --\n", label);
    printf("initCap = %d, appending \"%s\" (%d letters)\n", init_cap, chars, (int) strlen(chars));
    Builder b;
    builder_init(&b, init_cap);
    for (int i = 0; chars[i] != '\0'; i++) builder_append(&b, chars[i]);
    printf("result: \"%.*s\", len = %d, finalCap = %d, growths = %d\n\n", b.len, b.buf, b.len, b.cap, b.growths);
    builder_free(&b);
}

int main(void) {
    run_scenario("normal: initCap=4", 4, "HELLOWORLD");
    run_scenario("hard: initCap=2, many growths back to back", 2, "ALGORITHMSDATA");
    run_scenario("edge: initCap=10, exact fit, no growth at all", 10, "ABCDEFGHIJ");
    run_scenario("edge: initCap=1, the smallest possible start", 1, "ABCDEFGHIJ");
    run_scenario("edge: initCap=9, a single growth right at the boundary", 9, "ABCDEFGHIJ");
    return 0;
}
