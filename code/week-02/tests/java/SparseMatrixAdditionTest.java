// Unit tests for code/week-02/java/SparseMatrixAddition.java: addSparse().
// Independent oracle: every expected output list below is hand-computed cell by cell (row-major merge,
// summing shared cells and dropping cells that cancel to zero), never read back from addSparse()'s own
// output. Covers the boundary cases: one/both inputs empty, a shared cell that cancels to zero (partial and
// total cancellation), and a fully dense (every cell shared) overlap.
public class SparseMatrixAdditionTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static SparseMatrixAddition.Triplet t(int row, int col, int value) {
        return new SparseMatrixAddition.Triplet(row, col, value);
    }

    static void assertTriplets(String label, SparseMatrixAddition.Triplet[] out, int[][] expected) {
        check(out.length == expected.length, label + ": length (got " + out.length + ", expected " + expected.length + ")");
        for (int i = 0; i < Math.min(out.length, expected.length); i++)
            check(out[i].row == expected[i][0] && out[i].col == expected[i][1] && out[i].value == expected[i][2],
                    label + ": [" + i + "] = (" + out[i].row + "," + out[i].col + "," + out[i].value + "), expected ("
                            + expected[i][0] + "," + expected[i][1] + "," + expected[i][2] + ")");
    }

    public static void main(String[] args) {
        SparseMatrixAddition.Triplet[] a1 = { t(0, 0, 4), t(0, 3, 2), t(1, 1, 5) };
        SparseMatrixAddition.Triplet[] b1 = { t(0, 0, 6), t(0, 1, 3), t(1, 1, -2) };
        SparseMatrixAddition.Triplet[] out = SparseMatrixAddition.addSparse(a1, b1);
        assertTriplets("normal", out, new int[][]{{0, 0, 10}, {0, 1, 3}, {0, 3, 2}, {1, 1, 3}});

        SparseMatrixAddition.Triplet[] b2 = { t(0, 0, 1), t(1, 2, 3), t(2, 0, -5) };
        out = SparseMatrixAddition.addSparse(new SparseMatrixAddition.Triplet[0], b2);
        assertTriplets("a empty", out, new int[][]{{0, 0, 1}, {1, 2, 3}, {2, 0, -5}});

        SparseMatrixAddition.Triplet[] a3 = { t(0, 1, 7), t(3, 2, -8) };
        out = SparseMatrixAddition.addSparse(a3, new SparseMatrixAddition.Triplet[0]);
        assertTriplets("b empty", out, new int[][]{{0, 1, 7}, {3, 2, -8}});

        out = SparseMatrixAddition.addSparse(new SparseMatrixAddition.Triplet[0], new SparseMatrixAddition.Triplet[0]);
        check(out.length == 0, "both empty");

        SparseMatrixAddition.Triplet[] a5 = { t(0, 0, 5), t(1, 1, -3) };
        SparseMatrixAddition.Triplet[] b5 = { t(0, 0, -5), t(1, 1, 3) };
        out = SparseMatrixAddition.addSparse(a5, b5);
        check(out.length == 0, "total cancellation: output empty");

        SparseMatrixAddition.Triplet[] a6 = { t(0, 0, 5), t(0, 1, 3), t(1, 0, -2) };
        SparseMatrixAddition.Triplet[] b6 = { t(0, 0, -5), t(0, 1, 3), t(1, 0, 2) };
        out = SparseMatrixAddition.addSparse(a6, b6);
        assertTriplets("partial cancellation", out, new int[][]{{0, 1, 6}});

        SparseMatrixAddition.Triplet[] a7 = { t(0, 0, 1), t(1, 1, 2) };
        SparseMatrixAddition.Triplet[] b7 = { t(0, 1, 3), t(1, 0, 4) };
        out = SparseMatrixAddition.addSparse(a7, b7);
        assertTriplets("no shared cells", out, new int[][]{{0, 0, 1}, {0, 1, 3}, {1, 0, 4}, {1, 1, 2}});

        SparseMatrixAddition.Triplet[] a8 = { t(0, 0, 1), t(0, 1, 2), t(1, 0, 3), t(1, 1, 4) };
        SparseMatrixAddition.Triplet[] b8 = { t(0, 0, 10), t(0, 1, 20), t(1, 0, 30), t(1, 1, 40) };
        out = SparseMatrixAddition.addSparse(a8, b8);
        assertTriplets("fully dense overlap", out, new int[][]{{0, 0, 11}, {0, 1, 22}, {1, 0, 33}, {1, 1, 44}});

        SparseMatrixAddition.Triplet[] a9 = { t(0, 0, Integer.MAX_VALUE) };
        SparseMatrixAddition.Triplet[] b9 = { t(0, 0, -1) };
        out = SparseMatrixAddition.addSparse(a9, b9);
        assertTriplets("near INT_MAX sum", out, new int[][]{{0, 0, Integer.MAX_VALUE - 1}});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
