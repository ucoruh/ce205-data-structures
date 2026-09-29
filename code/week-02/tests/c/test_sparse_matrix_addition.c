/* Unit tests for code/week-02/c/sparse_matrix_addition.c: add_sparse().
   Independent oracle: every expected output list below is hand-computed cell by cell (row-major merge,
   summing shared cells and dropping cells that cancel to zero), never read back from add_sparse()'s own
   output. Covers the boundary cases the caller specifically asked for: one/both inputs empty, a shared cell
   that cancels to zero (partial and total cancellation), and a fully dense (every cell shared) overlap. */
#define main program_main
#include "../../c/sparse_matrix_addition.c"
#undef main
#include "../../../test_check.h"

static void assert_triplets(const char *label, Triplet out[], int k, const Triplet expected[], int expected_n) {
    test_checks++;
    if (k != expected_n) { test_failures++; fprintf(stderr, "%s: k = %d, expected %d\n", label, k, expected_n); return; }
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
    Triplet out[64];
    int k;

    /* normal: some shared cells (summed), some cells unique to a or b */
    Triplet a1[] = { {0, 0, 4}, {0, 3, 2}, {1, 1, 5} };
    Triplet b1[] = { {0, 0, 6}, {0, 1, 3}, {1, 1, -2} };
    k = add_sparse(a1, 3, b1, 3, out);
    Triplet e1[] = { {0, 0, 10}, {0, 1, 3}, {0, 3, 2}, {1, 1, 3} };
    assert_triplets("normal", out, k, e1, 4);

    /* boundary: a is empty (na=0) -- output is exactly b, copied through */
    Triplet b2[] = { {0, 0, 1}, {1, 2, 3}, {2, 0, -5} };
    k = add_sparse(NULL, 0, b2, 3, out);
    assert_triplets("a empty", out, k, b2, 3);

    /* boundary: b is empty (nb=0) -- output is exactly a, copied through */
    Triplet a3[] = { {0, 1, 7}, {3, 2, -8} };
    k = add_sparse(a3, 2, NULL, 0, out);
    assert_triplets("b empty", out, k, a3, 2);

    /* boundary: both empty -- output is empty */
    k = add_sparse(NULL, 0, NULL, 0, out);
    CHECK_EQ_INT(k, 0);

    /* boundary: TOTAL cancellation -- every shared cell sums to zero, output is empty despite 4 input triplets */
    Triplet a5[] = { {0, 0, 5}, {1, 1, -3} };
    Triplet b5[] = { {0, 0, -5}, {1, 1, 3} };
    k = add_sparse(a5, 2, b5, 2, out);
    CHECK_EQ_INT(k, 0);

    /* boundary: PARTIAL cancellation -- two of three shared cells cancel, one does not */
    Triplet a6[] = { {0, 0, 5}, {0, 1, 3}, {1, 0, -2} };
    Triplet b6[] = { {0, 0, -5}, {0, 1, 3}, {1, 0, 2} };
    k = add_sparse(a6, 3, b6, 3, out);
    Triplet e6[] = { {0, 1, 6} };
    assert_triplets("partial cancellation", out, k, e6, 1);

    /* no shared cells at all: a plain interleaved merge */
    Triplet a7[] = { {0, 0, 1}, {1, 1, 2} };
    Triplet b7[] = { {0, 1, 3}, {1, 0, 4} };
    k = add_sparse(a7, 2, b7, 2, out);
    Triplet e7[] = { {0, 0, 1}, {0, 1, 3}, {1, 0, 4}, {1, 1, 2} };
    assert_triplets("no shared cells", out, k, e7, 4);

    /* boundary: fully dense overlap -- every cell of a small matrix is shared and none cancels */
    Triplet a8[] = { {0, 0, 1}, {0, 1, 2}, {1, 0, 3}, {1, 1, 4} };
    Triplet b8[] = { {0, 0, 10}, {0, 1, 20}, {1, 0, 30}, {1, 1, 40} };
    k = add_sparse(a8, 4, b8, 4, out);
    Triplet e8[] = { {0, 0, 11}, {0, 1, 22}, {1, 0, 33}, {1, 1, 44} };
    assert_triplets("fully dense overlap", out, k, e8, 4);

    /* INT_MIN/INT_MAX values on a shared cell (no overflow expected: within the range still) */
    Triplet a9[] = { {0, 0, 2147483647} };
    Triplet b9[] = { {0, 0, -1} };
    k = add_sparse(a9, 1, b9, 1, out);
    Triplet e9[] = { {0, 0, 2147483646} };
    assert_triplets("near INT_MAX sum", out, k, e9, 1);

    TEST_SUMMARY();
}
