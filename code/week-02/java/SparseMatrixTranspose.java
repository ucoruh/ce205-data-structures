/* Week 2 -- Linked Lists, Arrays and Matrices
 * Sparse matrix transpose, the fast way: count how many nonzeros sit in
 * each column, turn that into starting positions with a prefix sum, then
 * place every triplet directly at its final spot in one more pass. Matches
 * the sparse-matrix-transpose.js animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class SparseMatrixTranspose {
    static class Triplet {
        int row, col, value;
        Triplet(int row, int col, int value) { this.row = row; this.col = col; this.value = value; }
    }

    static Triplet[] fastTranspose(Triplet[] a, int cols) {
        int[] count = new int[cols];
        int[] pos = new int[cols];

        for (Triplet e : a)
            count[e.col]++;                 // how many nonzeros in each column

        pos[0] = 0;
        for (int c = 1; c < cols; c++)
            pos[c] = pos[c - 1] + count[c - 1];   // where column c starts in b

        Triplet[] b = new Triplet[a.length];
        for (Triplet e : a) {
            int p = pos[e.col]++;
            b[p] = new Triplet(e.col, e.row, e.value);   // row and col swap ...
        }
        return b;
    }

    static Triplet[] toTriplets(int[][] mat) {
        int rows = mat.length, cols = mat[0].length;
        Triplet[] out = new Triplet[rows * cols];
        int k = 0;
        for (int i = 0; i < rows; i++)
            for (int j = 0; j < cols; j++)
                if (mat[i][j] != 0)
                    out[k++] = new Triplet(i, j, mat[i][j]);
        Triplet[] trimmed = new Triplet[k];
        System.arraycopy(out, 0, trimmed, 0, k);
        return trimmed;
    }

    static void runScenario(String label, int[][] mat) {
        System.out.println("-- " + label + " --");
        int rows = mat.length, cols = mat[0].length;
        Triplet[] a = toTriplets(mat);
        System.out.println("rows=" + rows + " cols=" + cols + " nnz=" + a.length);
        System.out.println("a[] (original):");
        for (Triplet t : a) System.out.println("  (" + t.row + ", " + t.col + ", " + t.value + ")");
        Triplet[] b = fastTranspose(a, cols);
        System.out.println("b[] (transpose):");
        for (Triplet t : b) System.out.println("  (" + t.row + ", " + t.col + ", " + t.value + ")");
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 4x5 (same example matrix), 5 nonzero
        int[][] normal = { {0, 0, 3, 0, 4}, {0, 0, 5, 7, 0}, {0, 0, 0, 0, 0}, {6, 0, 0, 0, 0} };
        runScenario("normal: 4x5 (same example matrix), 5 nonzero", normal);

        // hard: 6x6, 9 nonzero (negatives included)
        int[][] hard = {
            {0, -3, 0, 0, 0, 5}, {0, 0, 0, 9, 0, 0}, {7, 0, 0, 0, 0, 0},
            {0, 0, -12, 0, 4, 0}, {0, 0, 0, 0, 0, 0}, {2, 0, 0, -6, 0, 11}
        };
        runScenario("hard: 6x6, 9 nonzero (negatives included)", hard);

        // edge: 4x4, all zero: the transpose stays empty too
        int[][] allZero = { {0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0} };
        runScenario("edge: 4x4, all zero: the transpose stays empty too", allZero);

        // edge: 4x3, all nonzero: every cell enters the transpose
        int[][] fullyDense = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9}, {10, 11, 12} };
        runScenario("edge: 4x3, all nonzero: every cell enters the transpose", fullyDense);
    }
}
