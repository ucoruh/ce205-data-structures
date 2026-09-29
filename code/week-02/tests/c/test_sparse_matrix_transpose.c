/* Unit tests for code/week-02/c/sparse_matrix_transpose.c: fast_transpose().
   Independent oracle: transposing means swap (row,col) on every triplet, then list them sorted by new row
   then new col -- equivalently, group the ORIGINAL triplets by column (preserving their row order within a
   group, which is already row-major) and concatenate groups by increasing column index. This is a different
   description of "transpose" from the count/prefix-sum/scatter algorithm under test, computed by hand below.
   Covers the boundary cases: all-zero (nnz=0) and fully dense. */
#define main program_main
#include "../../c/sparse_matrix_transpose.c"
#undef main
#include "../../../test_check.h"

static void assert_triplets(const char *label, Triplet out[], int n, const Triplet expected[], int expected_n) {
    test_checks++;
    if (n != expected_n) { test_failures++; fprintf(stderr, "%s: n = %d, expected %d\n", label, n, expected_n); return; }
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
    Triplet b[MAX_NNZ];

    /* normal: same example matrix as the program's own "normal" scenario, 4x5, 5 nonzero */
    Triplet normal_a[] = { {0, 2, 3}, {0, 4, 4}, {1, 2, 5}, {1, 3, 7}, {3, 0, 6} };
    cols = 5;
    fast_transpose(normal_a, 5, b);
    Triplet normal_expected[] = { {0, 3, 6}, {2, 0, 3}, {2, 1, 5}, {3, 1, 7}, {4, 0, 4} };
    assert_triplets("normal", b, 5, normal_expected, 5);

    /* boundary: all-zero -> nnz = 0, fast_transpose must not touch b[] or crash */
    Triplet empty_a[1];
    cols = 4;
    fast_transpose(empty_a, 0, b);
    CHECK(1);   /* reaching here means no crash on an empty triplet list */

    /* boundary: fully dense 2x2 */
    Triplet dense_a[] = { {0, 0, 1}, {0, 1, 2}, {1, 0, 3}, {1, 1, 4} };
    cols = 2;
    fast_transpose(dense_a, 4, b);
    Triplet dense_expected[] = { {0, 0, 1}, {0, 1, 3}, {1, 0, 2}, {1, 1, 4} };
    assert_triplets("fully dense 2x2", b, 4, dense_expected, 4);

    /* a single column entirely nonzero (transposes to a single fully-populated row) */
    Triplet single_col_a[] = { {0, 0, 10}, {1, 0, 20}, {2, 0, 30} };
    cols = 1;
    fast_transpose(single_col_a, 3, b);
    Triplet single_col_expected[] = { {0, 0, 10}, {0, 1, 20}, {0, 2, 30} };
    assert_triplets("single column -> single row", b, 3, single_col_expected, 3);

    /* negative values, multiple entries sharing a column (order preserved within the new row) */
    Triplet neg_a[] = { {0, 1, -5}, {1, 1, -10}, {2, 0, 7} };
    cols = 2;
    fast_transpose(neg_a, 3, b);
    Triplet neg_expected[] = { {0, 2, 7}, {1, 0, -5}, {1, 1, -10} };
    assert_triplets("negative values, shared column", b, 3, neg_expected, 3);

    /* INT_MIN/INT_MAX values */
    Triplet extreme_a[] = { {0, 0, 2147483647}, {1, 0, -2147483648} };
    cols = 1;
    fast_transpose(extreme_a, 2, b);
    Triplet extreme_expected[] = { {0, 0, 2147483647}, {0, 1, -2147483648} };
    assert_triplets("INT_MIN/INT_MAX", b, 2, extreme_expected, 2);

    TEST_SUMMARY();
}
