/* Week 2 -- Linked Lists, Arrays and Matrices
 * A 2D matrix is really flat, 1D memory underneath. Row-major storage
 * places mat[i][j] at word offset i*COLS+j (column-major: j*ROWS+i).
 * Matches the matrix-row-major.js animation. The animation bakes the
 * layout into the source text per preset; this program keeps a runtime
 * flag `row_major` so addr/traverse_row_major/traverse_col_major are
 * otherwise identical to the animation's code panel.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

#define MAX_ROWS 4
#define MAX_COLS 5

static int rows, cols;
static int row_major;   /* 1 = row-major layout, 0 = column-major layout */

/* address of mat[i][j], counted in ints from the start of the array */
int addr(int i, int j) {
    return row_major ? i * cols + j : j * rows + i;
}

void traverse_row_major(int mat[MAX_ROWS][MAX_COLS]) {
    int prev = -1;
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++) {
            int a = addr(i, j);
            printf("  M[%d][%d]=%d addr=%d%s\n", i, j, mat[i][j], a,
                   prev < 0 ? "" : (a - prev == 1 ? " (adjacent)" : " (jump)"));
            prev = a;
        }
}

void traverse_col_major(int mat[MAX_ROWS][MAX_COLS]) {
    int prev = -1;
    for (int j = 0; j < cols; j++)
        for (int i = 0; i < rows; i++) {
            int a = addr(i, j);
            printf("  M[%d][%d]=%d addr=%d%s\n", i, j, mat[i][j], a,
                   prev < 0 ? "" : (a - prev == 1 ? " (adjacent)" : " (jump)"));
            prev = a;
        }
}

static void run_scenario(const char *label, int r, int c, int mat[MAX_ROWS][MAX_COLS], int layout_row_major, int traversal_row) {
    printf("-- %s --\n", label);
    rows = r; cols = c; row_major = layout_row_major;
    printf("layout=%s traversal=%s\n", row_major ? "row-major" : "column-major", traversal_row ? "row" : "column");
    if (traversal_row) traverse_row_major(mat); else traverse_col_major(mat);
    printf("\n");
}

int main(void) {
    /* normal: 3x4 row-major, row-by-row traversal: always adjacent */
    int normal[MAX_ROWS][MAX_COLS] = {{8, 16, 24, 32}, {40, 48, 56, 64}, {72, 80, 88, 96}};
    run_scenario("normal: 3x4 row-major, row-by-row traversal: always adjacent", 3, 4, normal, 1, 1);

    /* hard: 4x4 row-major, column-by-column traversal: a jump on every step */
    int hard[MAX_ROWS][MAX_COLS] = {{3, -7, 15, 22}, {9, -14, 31, 6}, {18, -2, 27, 11}, {5, -19, 33, 8}};
    run_scenario("hard: 4x4 row-major, column-by-column traversal: a jump on every step", 4, 4, hard, 1, 0);

    /* edge: 3x5 column-major, row-by-row traversal: jumpy */
    int col_row[MAX_ROWS][MAX_COLS] = {{4, 9, -3, 16, 21}, {7, -12, 25, 2, 18}, {-6, 14, 8, -20, 30}};
    run_scenario("edge: 3x5 column-major, row-by-row traversal: jumpy", 3, 5, col_row, 0, 1);

    /* edge: 3x4 column-major, column-by-column traversal: adjacent again */
    int col_col[MAX_ROWS][MAX_COLS] = {{2, 5, -8, 13}, {19, -4, 7, 22}, {10, -15, 26, 1}};
    run_scenario("edge: 3x4 column-major, column-by-column traversal: adjacent again", 3, 4, col_col, 0, 0);

    return 0;
}
