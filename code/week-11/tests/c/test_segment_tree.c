/* Unit tests for code/week-11/c/segment_tree.c: build(), query(). */
#define main program_main
#include "../../c/segment_tree.c"
#undef main
#include "../../../test_check.h"

static long brute(int arr[], int l, int r) {
    long s = 0;
    for (int i = l; i <= r; i++) s += arr[i];
    return s;
}

int main(void) {
    int a[] = {5, 3, 8, 2, 9, 1, 7, 4, 6, 10};
    build(1, 0, 9, a);
    CHECK_EQ_INT(query(1, 0, 9, 0, 9), brute(a, 0, 9));      /* full range */
    CHECK_EQ_INT(query(1, 0, 9, 2, 5), brute(a, 2, 5));      /* partial range */
    CHECK_EQ_INT(query(1, 0, 9, 7, 7), a[7]);                /* single point */
    CHECK_EQ_INT(query(1, 0, 9, 0, 0), a[0]);                /* first element */
    CHECK_EQ_INT(query(1, 0, 9, 9, 9), a[9]);                /* last element */

    /* negative values */
    int b[] = {4, -7, 12, 3, -2, 9, -5, 8, 1, -3, 6, 0, -9, 11};
    build(1, 0, 13, b);
    CHECK_EQ_INT(query(1, 0, 13, 0, 13), brute(b, 0, 13));
    CHECK_EQ_INT(query(1, 0, 13, 3, 8), brute(b, 3, 8));
    CHECK_EQ_INT(query(1, 0, 13, 6, 6), b[6]);

    /* all values equal */
    int c[] = {5, 5, 5, 5, 5, 5, 5, 5, 5, 5};
    build(1, 0, 9, c);
    CHECK_EQ_INT(query(1, 0, 9, 0, 9), 50);
    CHECK_EQ_INT(query(1, 0, 9, 3, 3), 5);

    /* single-element array */
    int single[] = {42};
    build(1, 0, 0, single);
    CHECK_EQ_INT(query(1, 0, 0, 0, 0), 42);

    /* two-element array */
    int two[] = {10, -3};
    build(1, 0, 1, two);
    CHECK_EQ_INT(query(1, 0, 1, 0, 1), 7);
    CHECK_EQ_INT(query(1, 0, 1, 0, 0), 10);
    CHECK_EQ_INT(query(1, 0, 1, 1, 1), -3);

    /* extreme values */
    int ext[] = {2147483647, -2147483647, 0, 100000, -100000, 1, -1, 2, -2, 3};
    build(1, 0, 9, ext);
    CHECK_EQ_INT(query(1, 0, 9, 0, 1), 0);                   /* MAX + (-MAX) roughly cancels */
    CHECK_EQ_INT(query(1, 0, 9, 0, 9), brute(ext, 0, 9));
    CHECK_EQ_INT(query(1, 0, 9, 2, 9), brute(ext, 2, 9));
    CHECK_EQ_INT(query(1, 0, 9, 5, 9), brute(ext, 5, 9));

    TEST_SUMMARY();
}
