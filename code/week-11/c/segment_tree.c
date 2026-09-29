/* Week 11 -- Advanced Trees
 * Segment tree: build once from an array, then answer range-sum queries in O(log n).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

#define MAXN 32

long tree[4 * MAXN];

void build(int i, int lo, int hi, int arr[]) {
    if (lo == hi) { tree[i] = arr[lo]; return; }
    int mid = (lo + hi) / 2;
    build(2 * i,     lo,      mid, arr);
    build(2 * i + 1, mid + 1, hi,  arr);
    tree[i] = tree[2 * i] + tree[2 * i + 1];
}

long query(int i, int lo, int hi, int l, int r) {
    if (r < lo || hi < l)   return 0;                  /* no overlap: outside [l, r] */
    if (l <= lo && hi <= r) return tree[i];             /* fully inside: precomputed sum */
    int mid = (lo + hi) / 2;                            /* partial overlap: check both halves */
    return query(2 * i, lo, mid, l, r) + query(2 * i + 1, mid + 1, hi, l, r);
}

static void run_scenario(const char *label, int arr[], int n, int queries[][2], int nq) {
    printf("-- %s --\n", label);
    build(1, 0, n - 1, arr);
    printf("built from %d values\n", n);
    for (int i = 0; i < nq; i++) {
        long s = query(1, 0, n - 1, queries[i][0], queries[i][1]);
        printf("query(%d,%d) = %ld\n", queries[i][0], queries[i][1], s);
    }
    printf("\n");
}

int main(void) {
    int normal[] = {5, 3, 8, 2, 9, 1, 7, 4, 6, 10};
    int normal_q[][2] = {{0, 9}, {2, 5}, {7, 7}};
    run_scenario("normal: 10 values, 3 queries: full range, partial, a single point", normal, 10, normal_q, 3);

    int hard[] = {4, -7, 12, 3, -2, 9, -5, 8, 1, -3, 6, 0, -9, 11};
    int hard_q[][2] = {{0, 13}, {3, 8}, {10, 10}, {1, 2}};
    run_scenario("hard: 14 values including negatives, 4 queries", hard, 14, hard_q, 4);

    int full[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int full_q[][2] = {{0, 9}};
    run_scenario("edge: the query spans the whole array", full, 10, full_q, 1);

    int points[] = {11, 22, 33, 44, 55, 66, 77, 88, 99, 100};
    int points_q[][2] = {{0, 0}, {9, 9}, {4, 4}};
    run_scenario("edge: three single-point queries", points, 10, points_q, 3);

    int single[] = {42};
    int single_q[][2] = {{0, 0}};
    run_scenario("edge: a single-element array", single, 1, single_q, 1);

    return 0;
}
