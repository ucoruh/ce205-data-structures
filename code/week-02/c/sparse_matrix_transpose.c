/* Week 2 -- Linked Lists, Arrays and Matrices
 * Sparse matrix transpose, the fast way: count how many nonzeros sit in
 * each column, turn that into starting positions with a prefix sum, then
 * place every triplet directly at its final spot in one more pass. Matches
 * the sparse-matrix-transpose.js animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

#define MAX_ROWS 6
#define MAX_COLS 6
#define MAX_NNZ (MAX_ROWS * MAX_COLS)

typedef struct {
    int row, col, value;
} Triplet;

static int cols;

/* Builds the triplets of the transpose in ONE pass, already sorted in
   row-major order of the transpose -- no re-sorting needed afterwards. */
void fast_transpose(Triplet a[], int nnz, Triplet b[]) {
    int count[MAX_COLS] = {0};
    int pos[MAX_COLS];

    for (int i = 0; i < nnz; i++)
        count[a[i].col]++;             /* how many nonzeros in each column */

    pos[0] = 0;
    for (int c = 1; c < cols; c++)
        pos[c] = pos[c - 1] + count[c - 1];   /* where column c starts in b */

    for (int i = 0; i < nnz; i++) {
        int c = a[i].col;
        int p = pos[c]++;
        b[p].row = a[i].col;            /* row and col swap ... */
        b[p].col = a[i].row;
        b[p].value = a[i].value;
    }
}

static int to_triplets(int rows, int c, int mat[MAX_ROWS][MAX_COLS], Triplet out[]) {
    int k = 0;
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < c; j++)
            if (mat[i][j] != 0) { out[k].row = i; out[k].col = j; out[k].value = mat[i][j]; k++; }
    return k;
}

static void run_scenario(const char *label, int rows, int c, int mat[MAX_ROWS][MAX_COLS]) {
    printf("-- %s --\n", label);
    cols = c;
    Triplet a[MAX_NNZ], b[MAX_NNZ];
    int nnz = to_triplets(rows, c, mat, a);
    printf("rows=%d cols=%d nnz=%d\n", rows, c, nnz);
    printf("a[] (original):\n");
    for (int i = 0; i < nnz; i++) printf("  (%d, %d, %d)\n", a[i].row, a[i].col, a[i].value);
    fast_transpose(a, nnz, b);
    printf("b[] (transpose):\n");
    for (int i = 0; i < nnz; i++) printf("  (%d, %d, %d)\n", b[i].row, b[i].col, b[i].value);
    printf("\n");
}

int main(void) {
    /* normal: 4x5 (same example matrix), 5 nonzero */
    int normal[MAX_ROWS][MAX_COLS] = { {0, 0, 3, 0, 4}, {0, 0, 5, 7, 0}, {0, 0, 0, 0, 0}, {6, 0, 0, 0, 0} };
    run_scenario("normal: 4x5 (same example matrix), 5 nonzero", 4, 5, normal);

    /* hard: 6x6, 9 nonzero (negatives included) */
    int hard[MAX_ROWS][MAX_COLS] = {
        {0, -3, 0, 0, 0, 5}, {0, 0, 0, 9, 0, 0}, {7, 0, 0, 0, 0, 0},
        {0, 0, -12, 0, 4, 0}, {0, 0, 0, 0, 0, 0}, {2, 0, 0, -6, 0, 11}
    };
    run_scenario("hard: 6x6, 9 nonzero (negatives included)", 6, 6, hard);

    /* edge: 4x4, all zero: the transpose stays empty too */
    int all_zero[MAX_ROWS][MAX_COLS] = { {0} };
    run_scenario("edge: 4x4, all zero: the transpose stays empty too", 4, 4, all_zero);

    /* edge: 4x3, all nonzero: every cell enters the transpose */
    int fully_dense[MAX_ROWS][MAX_COLS] = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9}, {10, 11, 12} };
    run_scenario("edge: 4x3, all nonzero: every cell enters the transpose", 4, 3, fully_dense);

    return 0;
}
