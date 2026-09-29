/* Week 2 -- Linked Lists, Arrays and Matrices
 * A sparse matrix (mostly zeros) wastes memory if stored densely. Scan it
 * row-major and record only the nonzero cells as (row, col, value)
 * triplets. Matches the sparse-matrix-triplet.js animation.
 * CEN207 Data Structures (formerly CE205)
 */
public class SparseMatrixTriplet {
    static class Triplet {
        int row, col, value;
        Triplet(int row, int col, int value) { this.row = row; this.col = col; this.value = value; }
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
        Triplet[] out = toTriplets(mat);
        System.out.println("rows=" + rows + " cols=" + cols + " cells=" + (rows * cols) + " nnz=" + out.length);
        for (Triplet t : out)
            System.out.println("  (" + t.row + ", " + t.col + ", " + t.value + ")");
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 5x6 (30 cells), only 6 nonzero
        int[][] normal = {
            {0, 0, 3, 0, 0, 0}, {0, 0, 0, 0, 4, 0}, {0, 5, 0, 0, 0, 0}, {0, 0, 0, 0, 0, 7}, {6, 0, 0, 8, 0, 0}
        };
        runScenario("normal: 5x6 (30 cells), only 6 nonzero", normal);

        // hard: 6x6 (36 cells), 9 nonzero (negatives included)
        int[][] hard = {
            {0, -3, 0, 0, 0, 5}, {0, 0, 0, 9, 0, 0}, {7, 0, 0, 0, 0, 0},
            {0, 0, -12, 0, 4, 0}, {0, 0, 0, 0, 0, 0}, {2, 0, 0, -6, 0, 11}
        };
        runScenario("hard: 6x6 (36 cells), 9 nonzero (negatives included)", hard);

        // edge: 4x4 (16 cells), all zero: the triplet table stays empty
        int[][] allZero = { {0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0} };
        runScenario("edge: 4x4 (16 cells), all zero: the triplet table stays empty", allZero);

        // edge: 4x3 (12 cells), all nonzero: the triplet table grows as large as the array
        int[][] fullyDense = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9}, {10, 11, 12} };
        runScenario("edge: 4x3 (12 cells), all nonzero: the triplet table grows as large as the array", fullyDense);
    }
}
