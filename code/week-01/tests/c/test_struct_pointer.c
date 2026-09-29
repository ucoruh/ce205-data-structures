/* Unit tests for code/week-01/c/struct_pointer.c. The whole program is main(); it prints no addresses
 * (only struct field values), so its captured stdout is fully deterministic and checked byte for byte
 * against hand-written expected lines.
 */
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define main program_main
#include "../../c/struct_pointer.c"
#undef main
#include "../../../test_check.h"

static FILE *cap_file;
static int cap_saved_fd;

static void capture_start(void) {
    fflush(stdout);
    cap_saved_fd = dup(fileno(stdout));
    cap_file = fopen("test_sp_capture.tmp", "w+");
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
    remove("test_sp_capture.tmp");
}

int main(void) {
    char buf[4096];

    /* the whole program's output, exactly, hand-written independent of the source */
    {
        capture_start();
        int rc = program_main();
        capture_end(buf, sizeof buf);
        CHECK_EQ_INT(rc, 0);
        CHECK(strcmp(buf,
            "a = (3, 4)\n"
            "(*p).x = 3, p->x = 3 (same value, -> is shorthand)\n"
            "after p->x = 10: a = (10, 4)\n") == 0);
    }

    /* individual lines, checked separately too (so a future partial edit still gets pinpointed) */
    {
        capture_start();
        program_main();
        capture_end(buf, sizeof buf);
        CHECK(strstr(buf, "a = (3, 4)") != NULL);                 /* the original struct, before any writes */
        CHECK(strstr(buf, "(*p).x = 3, p->x = 3") != NULL);       /* (*p).x and p->x agree: same value */
        CHECK(strstr(buf, "after p->x = 10: a = (10, 4)") != NULL); /* writing through p->x changed a.x, not a.y */
    }

    /* the Point struct itself: directly exercise the aliasing property the program demonstrates,
     * with fresh values independent of the ones main() happens to use */
    {
        Point a = {7, -2};
        Point *p = &a;
        CHECK_EQ_INT(a.x, 7);
        CHECK_EQ_INT(a.y, -2);
        CHECK_EQ_INT((*p).x, p->x);   /* the two spellings always agree */
        CHECK_EQ_INT((*p).y, p->y);
        p->x = 100;
        CHECK_EQ_INT(a.x, 100);       /* writing through p really does change a: p is not a copy */
        CHECK_EQ_INT(a.y, -2);        /* y is untouched */
    }

    /* zero and negative coordinates work the same way */
    {
        Point a = {0, 0};
        Point *p = &a;
        p->x = -5;
        p->y = -9;
        CHECK_EQ_INT(a.x, -5);
        CHECK_EQ_INT(a.y, -9);
    }

    /* two different Points are independent: writing through one pointer never touches the other */
    {
        Point a = {1, 1};
        Point b = {2, 2};
        Point *pa = &a;
        pa->x = 999;
        CHECK_EQ_INT(a.x, 999);
        CHECK_EQ_INT(b.x, 2); /* b is untouched */
    }

    /* sizeof(Point) is exactly two ints (no hidden padding surprises for this simple struct on this ABI) */
    {
        CHECK_EQ_INT((int) sizeof(Point), 2 * (int) sizeof(int));
    }

    TEST_SUMMARY();
}
