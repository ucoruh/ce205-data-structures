// Unit tests for code/week-02/java/SparseMatrixTranspose.java: fastTranspose().
// Independent oracle: transposing means swap (row,col) on every triplet, then list them sorted by new row
// then new col -- equivalently, group the ORIGINAL triplets by column (preserving row order within a group)
// and concatenate groups by increasing column index. Computed by hand below.
// Covers the boundary cases: all-zero (nnz=0) and fully dense.
public class SparseMatrixTransposeTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static SparseMatrixTranspose.Triplet t(int row, int col, int value) {
        return new SparseMatrixTranspose.Triplet(row, col, value);
    }

    static void assertTriplets(String label, SparseMatrixTranspose.Triplet[] out, int[][] expected) {
        check(out.length == expected.length, label + ": length (got " + out.length + ", expected " + expected.length + ")");
        for (int i = 0; i < Math.min(out.length, expected.length); i++)
            check(out[i].row == expected[i][0] && out[i].col == expected[i][1] && out[i].value == expected[i][2],
                    label + ": [" + i + "] = (" + out[i].row + "," + out[i].col + "," + out[i].value + "), expected ("
                            + expected[i][0] + "," + expected[i][1] + "," + expected[i][2] + ")");
    }

    public static void main(String[] args) {
        SparseMatrixTranspose.Triplet[] normalA = { t(0, 2, 3), t(0, 4, 4), t(1, 2, 5), t(1, 3, 7), t(3, 0, 6) };
        SparseMatrixTranspose.Triplet[] b = SparseMatrixTranspose.fastTranspose(normalA, 5);
        assertTriplets("normal", b, new int[][]{{0, 3, 6}, {2, 0, 3}, {2, 1, 5}, {3, 1, 7}, {4, 0, 4}});

        SparseMatrixTranspose.Triplet[] emptyA = {};
        b = SparseMatrixTranspose.fastTranspose(emptyA, 4);
        check(b.length == 0, "all-zero: no crash, empty result");

        SparseMatrixTranspose.Triplet[] denseA = { t(0, 0, 1), t(0, 1, 2), t(1, 0, 3), t(1, 1, 4) };
        b = SparseMatrixTranspose.fastTranspose(denseA, 2);
        assertTriplets("fully dense 2x2", b, new int[][]{{0, 0, 1}, {0, 1, 3}, {1, 0, 2}, {1, 1, 4}});

        SparseMatrixTranspose.Triplet[] singleColA = { t(0, 0, 10), t(1, 0, 20), t(2, 0, 30) };
        b = SparseMatrixTranspose.fastTranspose(singleColA, 1);
        assertTriplets("single column -> single row", b, new int[][]{{0, 0, 10}, {0, 1, 20}, {0, 2, 30}});

        SparseMatrixTranspose.Triplet[] negA = { t(0, 1, -5), t(1, 1, -10), t(2, 0, 7) };
        b = SparseMatrixTranspose.fastTranspose(negA, 2);
        assertTriplets("negative values, shared column", b, new int[][]{{0, 2, 7}, {1, 0, -5}, {1, 1, -10}});

        SparseMatrixTranspose.Triplet[] extremeA = { t(0, 0, Integer.MAX_VALUE), t(1, 0, Integer.MIN_VALUE) };
        b = SparseMatrixTranspose.fastTranspose(extremeA, 1);
        assertTriplets("INT_MIN/INT_MAX", b, new int[][]{{0, 0, Integer.MAX_VALUE}, {0, 1, Integer.MIN_VALUE}});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
