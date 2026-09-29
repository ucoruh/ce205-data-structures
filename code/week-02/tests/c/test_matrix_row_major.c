/* Unit tests for code/week-02/c/matrix_row_major.c: addr().
   Independent oracle: row-major offset is i*cols+j, column-major is j*rows+i -- computed by hand below,
   never by calling addr() itself. */
#define main program_main
#include "../../c/matrix_row_major.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* row-major, 3x4: normal interior/first/last cells */
    rows = 3; cols = 4; row_major = 1;
    CHECK_EQ_INT(addr(0, 0), 0);
    CHECK_EQ_INT(addr(0, 3), 3);
    CHECK_EQ_INT(addr(1, 0), 4);
    CHECK_EQ_INT(addr(1, 2), 6);
    CHECK_EQ_INT(addr(2, 3), 11);          /* last cell: (rows-1)*cols + (cols-1) = 2*4+3 */

    /* column-major, same 3x4 shape */
    rows = 3; cols = 4; row_major = 0;
    CHECK_EQ_INT(addr(0, 0), 0);
    CHECK_EQ_INT(addr(0, 3), 9);           /* j*rows+i = 3*3+0 */
    CHECK_EQ_INT(addr(1, 0), 1);
    CHECK_EQ_INT(addr(2, 3), 11);          /* 3*3+2 */

    /* 1x1 matrix: only one cell, both layouts agree */
    rows = 1; cols = 1; row_major = 1;
    CHECK_EQ_INT(addr(0, 0), 0);
    row_major = 0;
    CHECK_EQ_INT(addr(0, 0), 0);

    /* a single row (1 x n): row-major is just j; column-major is also j since rows=1 */
    rows = 1; cols = 5; row_major = 1;
    for (int j = 0; j < 5; j++) CHECK_EQ_INT(addr(0, j), j);
    row_major = 0;
    for (int j = 0; j < 5; j++) CHECK_EQ_INT(addr(0, j), j);  /* j*1+0 = j */

    /* a single column (n x 1): row-major is i (cols=1); column-major is also i (rows counted) */
    rows = 5; cols = 1; row_major = 1;
    for (int i = 0; i < 5; i++) CHECK_EQ_INT(addr(i, 0), i);  /* i*1+0 */

    /* square 4x4: verify every cell of both layouts against the formula, adjacency claim included */
    rows = 4; cols = 4;
    row_major = 1;
    int prev = -1;
    for (int i = 0; i < 4; i++)
        for (int j = 0; j < 4; j++) {
            int expected = i * 4 + j;
            CHECK_EQ_INT(addr(i, j), expected);
            if (prev >= 0) CHECK(expected - prev == 1);   /* row-major, row-by-row: always adjacent */
            prev = expected;
        }

    row_major = 0;
    prev = -1;
    for (int j = 0; j < 4; j++)
        for (int i = 0; i < 4; i++) {
            int expected = j * 4 + i;
            CHECK_EQ_INT(addr(i, j), expected);
            if (prev >= 0) CHECK(expected - prev == 1);   /* column-major, column-by-column: adjacent */
            prev = expected;
        }

    TEST_SUMMARY();
}
