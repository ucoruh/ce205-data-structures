/* Unit tests for code/week-02/c/sparse_matrix_triplet.c: to_triplets().
   Independent oracle: every expected triplet list below is hand-counted from the matrix literal, never
   read back from to_triplets()'s own output. Covers the boundary cases the algorithm must get right:
   all-zero (nnz=0) and fully dense (nnz = rows*cols). */
#define main program_main
#include "../../c/sparse_matrix_triplet.c"
#undef main
#include "../../../test_check.h"

static void assert_triplets(const char *label, Triplet out[], int nnz, const Triplet expected[], int expected_n) {
    test_checks++;
    if (nnz != expected_n) { test_failures++; fprintf(stderr, "%s: nnz = %d, expected %d\n", label, nnz, expected_n); return; }
    for (int i = 0; i < expected_n; i++) {
        test_checks++;
        if (out[i].row != expected[i].row || out[i].col != expected[i].col || out[i].value != expected[i].value) {
            test_failures++;
            fprintf(stderr, "%s: [%d] = (%d,%d,%d), expected (%d,%d,%d)\n", label, i,
                    out[i].row, out[i].col, out[i].value, expected[i].row, expected[i].col, expected[i].value);
        }
    }
}

int main(void) {
    Triplet out[MAX_NNZ];

    /* normal: 3x3, mixed nonzero/zero */
    int normal[MAX_ROWS][MAX_COLS] = { {0, 5, 0}, {3, 0, 0}, {0, 0, -7} };
    rows = 3; cols = 3;
    int nnz = to_triplets(normal, out);
    Triplet normal_expected[] = { {0, 1, 5}, {1, 0, 3}, {2, 2, -7} };
    assert_triplets("normal", out, nnz, normal_expected, 3);

    /* boundary: all-zero matrix -> nnz = 0 */
    int all_zero[MAX_ROWS][MAX_COLS] = { {0} };
    rows = 4; cols = 4;
    nnz = to_triplets(all_zero, out);
    CHECK_EQ_INT(nnz, 0);

    /* boundary: fully dense -> nnz = rows*cols, every cell present in row-major order */
    int dense[MAX_ROWS][MAX_COLS] = { {1, 2, 3}, {4, 5, 6} };
    rows = 2; cols = 3;
    nnz = to_triplets(dense, out);
    Triplet dense_expected[] = { {0, 0, 1}, {0, 1, 2}, {0, 2, 3}, {1, 0, 4}, {1, 1, 5}, {1, 2, 6} };
    assert_triplets("fully dense", out, nnz, dense_expected, 6);

    /* 1x1 matrix: zero and nonzero */
    int one_zero[MAX_ROWS][MAX_COLS] = { {0} };
    rows = 1; cols = 1;
    nnz = to_triplets(one_zero, out);
    CHECK_EQ_INT(nnz, 0);

    int one_nonzero[MAX_ROWS][MAX_COLS] = { {99} };
    rows = 1; cols = 1;
    nnz = to_triplets(one_nonzero, out);
    Triplet one_expected[] = { {0, 0, 99} };
    assert_triplets("1x1 nonzero", out, nnz, one_expected, 1);

    /* single row, several columns */
    int single_row[MAX_ROWS][MAX_COLS] = { {0, 4, 0, -6, 0, 8} };
    rows = 1; cols = 6;
    nnz = to_triplets(single_row, out);
    Triplet single_row_expected[] = { {0, 1, 4}, {0, 3, -6}, {0, 5, 8} };
    assert_triplets("single row", out, nnz, single_row_expected, 3);

    /* single column, several rows */
    int single_col[MAX_ROWS][MAX_COLS] = { {0}, {7}, {0}, {0}, {-2} };
    rows = 5; cols = 1;
    nnz = to_triplets(single_col, out);
    Triplet single_col_expected[] = { {1, 0, 7}, {4, 0, -2} };
    assert_triplets("single column", out, nnz, single_col_expected, 2);

    /* negative values and INT_MIN/INT_MAX */
    int extreme[MAX_ROWS][MAX_COLS] = { {2147483647, 0, -2147483648} };
    rows = 1; cols = 3;
    nnz = to_triplets(extreme, out);
    Triplet extreme_expected[] = { {0, 0, 2147483647}, {0, 2, -2147483648} };
    assert_triplets("INT_MIN/INT_MAX", out, nnz, extreme_expected, 2);

    TEST_SUMMARY();
}
