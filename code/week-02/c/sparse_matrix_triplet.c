/* Week 2 -- Linked Lists, Arrays and Matrices
 * A sparse matrix (mostly zeros) wastes memory if stored densely. Scan it
 * row-major and record only the nonzero cells as (row, col, value)
 * triplets. Matches the sparse-matrix-triplet.js animation. The animation
 * bakes ROWS/COLS into the source text per preset; this program keeps
 * runtime globals `rows`/`cols` set per scenario, so to_triplets is
 * otherwise identical to the animation's code panel.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

#define MAX_ROWS 6
#define MAX_COLS 6
#define MAX_NNZ (MAX_ROWS * MAX_COLS)

typedef struct {
    int row, col, value;
} Triplet;

static int rows, cols;

int to_triplets(int mat[MAX_ROWS][MAX_COLS], Triplet out[]) {
    int k = 0;
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            if (mat[i][j] != 0) {
                out[k].row = i;
                out[k].col = j;
                out[k].value = mat[i][j];
                k++;
            }
    return k;
}

static void run_scenario(const char *label, int r, int c, int mat[MAX_ROWS][MAX_COLS]) {
    printf("-- %s --\n", label);
    rows = r; cols = c;
    Triplet out[MAX_NNZ];
    int nnz = to_triplets(mat, out);
    printf("rows=%d cols=%d cells=%d nnz=%d\n", rows, cols, rows * cols, nnz);
    for (int i = 0; i < nnz; i++)
        printf("  (%d, %d, %d)\n", out[i].row, out[i].col, out[i].value);
    printf("\n");
}

int main(void) {
    /* normal: 5x6 (30 cells), only 6 nonzero */
    int normal[MAX_ROWS][MAX_COLS] = {
        {0, 0, 3, 0, 0, 0}, {0, 0, 0, 0, 4, 0}, {0, 5, 0, 0, 0, 0}, {0, 0, 0, 0, 0, 7}, {6, 0, 0, 8, 0, 0}
    };
    run_scenario("normal: 5x6 (30 cells), only 6 nonzero", 5, 6, normal);

    /* hard: 6x6 (36 cells), 9 nonzero (negatives included) */
    int hard[MAX_ROWS][MAX_COLS] = {
        {0, -3, 0, 0, 0, 5}, {0, 0, 0, 9, 0, 0}, {7, 0, 0, 0, 0, 0},
        {0, 0, -12, 0, 4, 0}, {0, 0, 0, 0, 0, 0}, {2, 0, 0, -6, 0, 11}
    };
    run_scenario("hard: 6x6 (36 cells), 9 nonzero (negatives included)", 6, 6, hard);

    /* edge: 4x4 (16 cells), all zero: the triplet table stays empty */
    int all_zero[MAX_ROWS][MAX_COLS] = { {0} };
    run_scenario("edge: 4x4 (16 cells), all zero: the triplet table stays empty", 4, 4, all_zero);

    /* edge: 4x3 (12 cells), all nonzero: the triplet table grows as large as the array */
    int fully_dense[MAX_ROWS][MAX_COLS] = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9}, {10, 11, 12} };
    run_scenario("edge: 4x3 (12 cells), all nonzero: the triplet table grows as large as the array", 4, 3, fully_dense);

    return 0;
}
