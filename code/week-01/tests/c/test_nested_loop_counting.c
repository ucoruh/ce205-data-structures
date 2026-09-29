/* Unit tests for code/week-01/c/nested_loop_counting.c: t_square, t_triangle, t_halving.
 * Expected counts are hand-computed closed forms (n^2, n(n-1)/2, and a hand-simulated doubling count),
 * never obtained by calling the functions a second time.
 */
#define main program_main
#include "../../c/nested_loop_counting.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* t_square: T(n) = n^2 (the inner body runs once per (i, j) pair, n*n pairs total) */
    {
        long ops = 0;
        CHECK_EQ_INT(t_square(0, &ops), 0);
        CHECK_EQ_INT(ops, 0);
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_square(1, &ops), 1);
        CHECK_EQ_INT(ops, 1);
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_square(2, &ops), 4);
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_square(10, &ops), 100);
        CHECK_EQ_INT(ops, 100);
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_square(25, &ops), 625);
    }

    /* t_triangle: T(n) = n(n-1)/2 (outer i contributes i inner iterations, sum 0..n-1) */
    {
        long ops = 0;
        CHECK_EQ_INT(t_triangle(0, &ops), 0);
        CHECK_EQ_INT(ops, 0);
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_triangle(1, &ops), 0); /* only i = 0, inner loop j < 0 never runs */
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_triangle(2, &ops), 1); /* i=0: 0, i=1: 1 -> total 1 */
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_triangle(4, &ops), 6); /* 0+1+2+3 = 6 */
        CHECK_EQ_INT(ops, 6);
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_triangle(50, &ops), 1225); /* 50*49/2 = 1225 */
    }

    /* t_halving: inner loop doubles j from 1 while j < n; hand-simulated counts below (independent of
     * the function: worked out by listing 1, 2, 4, 8, ... by hand for each n, not by calling t_halving). */
    {
        long ops = 0;
        CHECK_EQ_INT(t_halving(1, &ops), 0); /* j=1, 1<1 is false: zero executions (the edge case) */
        CHECK_EQ_INT(ops, 0);
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_halving(2, &ops), 2); /* one outer iteration (i=0..1), inner runs once each: 2*1 */
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_halving(3, &ops), 6); /* inner: j=1,2 (2 runs) per outer i, 3 outer i's: 3*2 */
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_halving(8, &ops), 24); /* inner: j=1,2,4 (3 runs), 8 outer i's: 8*3 */
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_halving(16, &ops), 64); /* inner: j=1,2,4,8 (4 runs), 16 outer i's: 16*4 */
    }
    {
        long ops = 0;
        CHECK_EQ_INT(t_halving(512, &ops), 4608); /* inner: j=1,2,4,...,256 (9 runs), 512*9 */
        CHECK_EQ_INT(ops, 4608);
    }

    /* invariant that must hold for every counting function regardless of shape: the returned count and
     * the *operations output parameter always agree (both count the same inner-body executions) */
    {
        int ns[] = {0, 1, 2, 5, 10, 17, 33, 64, 100};
        for (int i = 0; i < 9; i++) {
            long opsA = 0, opsB = 0, opsC = 0;
            long a = t_square(ns[i], &opsA);
            long b = t_triangle(ns[i], &opsB);
            long c = t_halving(ns[i], &opsC);
            CHECK_EQ_INT(a, opsA);
            CHECK_EQ_INT(b, opsB);
            CHECK_EQ_INT(c, opsC);
        }
    }

    /* T(n) is monotonically non-decreasing in n for every shape (a sanity property, independent of the
     * exact closed form) */
    {
        long opsA1 = 0, opsA2 = 0;
        CHECK(t_square(9, &opsA1) <= t_square(10, &opsA2));
        long opsB1 = 0, opsB2 = 0;
        CHECK(t_triangle(9, &opsB1) <= t_triangle(10, &opsB2));
        long opsC1 = 0, opsC2 = 0;
        CHECK(t_halving(9, &opsC1) <= t_halving(10, &opsC2));
    }

    TEST_SUMMARY();
}
