// Unit tests for code/week-02/java/SparseMatrixTriplet.java: toTriplets().
// Independent oracle: every expected triplet list below is hand-counted from the matrix literal, never
// read back from toTriplets()'s own output. Covers the boundary cases: all-zero (nnz=0) and fully dense
// (nnz = rows*cols).
public class SparseMatrixTripletTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void assertTriplets(String label, SparseMatrixTriplet.Triplet[] out, int[][] expected) {
        check(out.length == expected.length, label + ": nnz (got " + out.length + ", expected " + expected.length + ")");
        for (int i = 0; i < Math.min(out.length, expected.length); i++)
            check(out[i].row == expected[i][0] && out[i].col == expected[i][1] && out[i].value == expected[i][2],
                    label + ": [" + i + "] = (" + out[i].row + "," + out[i].col + "," + out[i].value + "), expected ("
                            + expected[i][0] + "," + expected[i][1] + "," + expected[i][2] + ")");
    }

    public static void main(String[] args) {
        int[][] normal = { {0, 5, 0}, {3, 0, 0}, {0, 0, -7} };
        SparseMatrixTriplet.Triplet[] out = SparseMatrixTriplet.toTriplets(normal);
        assertTriplets("normal", out, new int[][]{{0, 1, 5}, {1, 0, 3}, {2, 2, -7}});

        int[][] allZero = { {0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0} };
        out = SparseMatrixTriplet.toTriplets(allZero);
        check(out.length == 0, "all-zero: nnz == 0");

        int[][] dense = { {1, 2, 3}, {4, 5, 6} };
        out = SparseMatrixTriplet.toTriplets(dense);
        assertTriplets("fully dense", out, new int[][]{{0, 0, 1}, {0, 1, 2}, {0, 2, 3}, {1, 0, 4}, {1, 1, 5}, {1, 2, 6}});

        int[][] oneZero = { {0} };
        out = SparseMatrixTriplet.toTriplets(oneZero);
        check(out.length == 0, "1x1 zero: nnz == 0");

        int[][] oneNonzero = { {99} };
        out = SparseMatrixTriplet.toTriplets(oneNonzero);
        assertTriplets("1x1 nonzero", out, new int[][]{{0, 0, 99}});

        int[][] singleRow = { {0, 4, 0, -6, 0, 8} };
        out = SparseMatrixTriplet.toTriplets(singleRow);
        assertTriplets("single row", out, new int[][]{{0, 1, 4}, {0, 3, -6}, {0, 5, 8}});

        int[][] singleCol = { {0}, {7}, {0}, {0}, {-2} };
        out = SparseMatrixTriplet.toTriplets(singleCol);
        assertTriplets("single column", out, new int[][]{{1, 0, 7}, {4, 0, -2}});

        int[][] extreme = { {Integer.MAX_VALUE, 0, Integer.MIN_VALUE} };
        out = SparseMatrixTriplet.toTriplets(extreme);
        assertTriplets("INT_MIN/INT_MAX", out, new int[][]{{0, 0, Integer.MAX_VALUE}, {0, 2, Integer.MIN_VALUE}});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
