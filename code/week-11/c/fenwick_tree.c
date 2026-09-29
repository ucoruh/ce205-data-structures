/* Week 11 -- Advanced Trees
 * Fenwick tree (binary indexed tree, BIT): prefix sums and i & -i.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

#define MAXN 32

int bit[MAXN + 1];    /* 1-indexed; bit[0] is unused */
int n;

void update(int i, int delta) {
    while (i <= n) {
        bit[i] += delta;
        i += i & (-i);        /* move to the next responsible index */
    }
}

int query(int i) {             /* prefix sum: v[1] + v[2] + ... + v[i] */
    int sum = 0;
    while (i > 0) {
        sum += bit[i];
        i -= i & (-i);        /* move to the previous responsible index */
    }
    return sum;
}

typedef struct { int is_query; int i; int delta; } Op;

static void run_scenario(const char *label, int size, Op ops[], int nops) {
    printf("-- %s --\n", label);
    n = size;
    for (int i = 0; i <= n; i++) bit[i] = 0;
    for (int k = 0; k < nops; k++) {
        if (ops[k].is_query) {
            printf("query(%d) = %d\n", ops[k].i, query(ops[k].i));
        } else {
            update(ops[k].i, ops[k].delta);
            printf("update(%d, %d)\n", ops[k].i, ops[k].delta);
        }
    }
    printf("\n");
}

int main(void) {
    Op normal[] = {
        {0, 3, 5}, {0, 7, 2}, {1, 10, 0}, {0, 1, 4}, {1, 5, 0}, {0, 10, 3}, {1, 10, 0}, {1, 1, 0}
    };
    run_scenario("normal: n=10, 8 operations: updates and queries mixed", 10, normal, 8);

    Op hard[] = {
        {0, 5, 8}, {0, 12, -3}, {1, 16, 0}, {0, 1, 6}, {0, 16, 4}, {1, 8, 0}, {0, 9, -5}, {1, 16, 0}, {1, 12, 0}, {0, 8, 2}
    };
    run_scenario("hard: n=16, 10 operations, including negative deltas", 16, hard, 10);

    Op chain[] = { {0, 1, 7}, {1, 16, 0} };
    run_scenario("edge: n=16, update(1) takes 5 steps, query(16) takes only 1", 16, chain, 2);

    Op neg[] = { {0, 4, -9}, {0, 8, 2}, {1, 10, 0}, {0, 1, -3}, {1, 4, 0}, {1, 10, 0} };
    run_scenario("edge: negative deltas can push the sum below zero", 10, neg, 6);

    Op point[] = { {0, 1, 9}, {1, 1, 0} };
    run_scenario("edge: an update immediately queried at the same point", 10, point, 2);

    return 0;
}
