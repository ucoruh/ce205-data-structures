/* Week 2 -- Linked Lists, Arrays and Matrices
 * A 2D matrix is really flat, 1D memory underneath. Row-major storage
 * places mat[i][j] at word offset i*COLS+j (column-major: j*ROWS+i).
 * Matches the matrix-row-major.js animation. The animation bakes the
 * layout into the source text per preset; this program keeps a runtime
 * flag `rowMajor` so addr/traverseRowMajor/traverseColMajor are otherwise
 * identical to the animation's code panel.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class MatrixRowMajor {
    static int rows, cols;
    static boolean rowMajor;   // true = row-major layout, false = column-major layout

    // address of mat[i][j], counted in ints from the start of the array
    static int addr(int i, int j) {
        return rowMajor ? i * cols + j : j * rows + i;
    }

    static void traverseRowMajor(int[][] mat) {
        int prev = -1;
        for (int i = 0; i < rows; i++)
            for (int j = 0; j < cols; j++) {
                int a = addr(i, j);
                System.out.println("  M[" + i + "][" + j + "]=" + mat[i][j] + " addr=" + a
                        + (prev < 0 ? "" : (a - prev == 1 ? " (adjacent)" : " (jump)")));
                prev = a;
            }
    }

    static void traverseColMajor(int[][] mat) {
        int prev = -1;
        for (int j = 0; j < cols; j++)
            for (int i = 0; i < rows; i++) {
                int a = addr(i, j);
                System.out.println("  M[" + i + "][" + j + "]=" + mat[i][j] + " addr=" + a
                        + (prev < 0 ? "" : (a - prev == 1 ? " (adjacent)" : " (jump)")));
                prev = a;
            }
    }

    static void runScenario(String label, int[][] mat, boolean layoutRowMajor, boolean traversalRow) {
        System.out.println("-- " + label + " --");
        rows = mat.length; cols = mat[0].length; rowMajor = layoutRowMajor;
        System.out.println("layout=" + (rowMajor ? "row-major" : "column-major") + " traversal=" + (traversalRow ? "row" : "column"));
        if (traversalRow) traverseRowMajor(mat); else traverseColMajor(mat);
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 3x4 row-major, row-by-row traversal: always adjacent
        int[][] normal = {{8, 16, 24, 32}, {40, 48, 56, 64}, {72, 80, 88, 96}};
        runScenario("normal: 3x4 row-major, row-by-row traversal: always adjacent", normal, true, true);

        // hard: 4x4 row-major, column-by-column traversal: a jump on every step
        int[][] hard = {{3, -7, 15, 22}, {9, -14, 31, 6}, {18, -2, 27, 11}, {5, -19, 33, 8}};
        runScenario("hard: 4x4 row-major, column-by-column traversal: a jump on every step", hard, true, false);

        // edge: 3x5 column-major, row-by-row traversal: jumpy
        int[][] colRow = {{4, 9, -3, 16, 21}, {7, -12, 25, 2, 18}, {-6, 14, 8, -20, 30}};
        runScenario("edge: 3x5 column-major, row-by-row traversal: jumpy", colRow, false, true);

        // edge: 3x4 column-major, column-by-column traversal: adjacent again
        int[][] colCol = {{2, 5, -8, 13}, {19, -4, 7, 22}, {10, -15, 26, 1}};
        runScenario("edge: 3x4 column-major, column-by-column traversal: adjacent again", colCol, false, false);
    }
}
