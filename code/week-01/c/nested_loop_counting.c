/* Week 1 -- Introduction to Data Structures
 * Count the operations of a nested loop to build T(n) by hand, for three loop shapes:
 * square (j < n), triangle (j < i), and halving (j *= 2).
 * Runs the same normal / hard / edge-case scenarios as the nested-loop-counting animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

long t_square(int n, long *operations) {
    long count = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            count++;
            (*operations)++;
        }
    }
    return count;
}

long t_triangle(int n, long *operations) {
    long count = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            count++;
            (*operations)++;
        }
    }
    return count;
}

long t_halving(int n, long *operations) {
    long count = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 1; j < n; j *= 2) {
            count++;
            (*operations)++;
        }
    }
    return count;
}

typedef long (*counter_fn)(int, long *);

static void run_scenario(const char *label, counter_fn f, const char *shape, const int ns[], int count) {
    printf("-- %s (%s) --\n", label, shape);
    for (int k = 0; k < count; k++) {
        int n = ns[k];
        long operations = 0;
        long total = f(n, &operations);
        printf("n = %d: inner body ran %ld times, total = %ld\n", n, operations, total);
    }
    printf("\n");
}

int main(void) {
    /* normal: square loop, n = 3 in detail, then 9 more n values */
    int normalNs[] = {3, 4, 5, 6, 8, 10, 12, 16, 20, 25};
    run_scenario("normal: square loop", t_square, "square, j < n", normalNs, 10);

    /* hard: triangle loop, n = 4 in detail, then 10 more n values */
    int hardNs[] = {4, 5, 6, 8, 10, 14, 18, 24, 32, 40, 50};
    run_scenario("hard: triangle loop", t_triangle, "triangle, j < i", hardNs, 11);

    /* edge: halving loop, n = 1: zero executions */
    int halvingNs[] = {1, 2, 4, 8, 16, 32, 64, 128, 256, 512};
    run_scenario("edge: halving loop, n = 1 (zero executions)", t_halving, "halving, j *= 2", halvingNs, 10);

    /* edge: square loop, n = 2 in detail, Fibonacci-spaced n values */
    int fibNs[] = {2, 3, 5, 8, 13, 21, 34, 55, 89, 144};
    run_scenario("edge: square loop, Fibonacci-spaced n values", t_square, "square, j < n", fibNs, 10);

    return 0;
}
