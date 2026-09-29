// Unit tests for code/week-02/java/MatrixRowMajor.java: addr().
// Independent oracle: row-major offset is i*cols+j, column-major is j*rows+i -- computed by hand below.
public class MatrixRowMajorTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }

    public static void main(String[] args) {
        MatrixRowMajor.rows = 3; MatrixRowMajor.cols = 4; MatrixRowMajor.rowMajor = true;
        checkEq(MatrixRowMajor.addr(0, 0), 0, "row-major (0,0)");
        checkEq(MatrixRowMajor.addr(0, 3), 3, "row-major (0,3)");
        checkEq(MatrixRowMajor.addr(1, 0), 4, "row-major (1,0)");
        checkEq(MatrixRowMajor.addr(1, 2), 6, "row-major (1,2)");
        checkEq(MatrixRowMajor.addr(2, 3), 11, "row-major last cell");

        MatrixRowMajor.rowMajor = false;
        checkEq(MatrixRowMajor.addr(0, 0), 0, "col-major (0,0)");
        checkEq(MatrixRowMajor.addr(0, 3), 9, "col-major (0,3)");
        checkEq(MatrixRowMajor.addr(1, 0), 1, "col-major (1,0)");
        checkEq(MatrixRowMajor.addr(2, 3), 11, "col-major last cell");

        MatrixRowMajor.rows = 1; MatrixRowMajor.cols = 1; MatrixRowMajor.rowMajor = true;
        checkEq(MatrixRowMajor.addr(0, 0), 0, "1x1 row-major");
        MatrixRowMajor.rowMajor = false;
        checkEq(MatrixRowMajor.addr(0, 0), 0, "1x1 col-major");

        MatrixRowMajor.rows = 1; MatrixRowMajor.cols = 5; MatrixRowMajor.rowMajor = true;
        for (int j = 0; j < 5; j++) checkEq(MatrixRowMajor.addr(0, j), j, "single row-major j=" + j);
        MatrixRowMajor.rowMajor = false;
        for (int j = 0; j < 5; j++) checkEq(MatrixRowMajor.addr(0, j), j, "single row col-major j=" + j);

        MatrixRowMajor.rows = 5; MatrixRowMajor.cols = 1; MatrixRowMajor.rowMajor = true;
        for (int i = 0; i < 5; i++) checkEq(MatrixRowMajor.addr(i, 0), i, "single column i=" + i);

        MatrixRowMajor.rows = 4; MatrixRowMajor.cols = 4; MatrixRowMajor.rowMajor = true;
        int prev = -1;
        for (int i = 0; i < 4; i++)
            for (int j = 0; j < 4; j++) {
                int expected = i * 4 + j;
                checkEq(MatrixRowMajor.addr(i, j), expected, "4x4 row-major (" + i + "," + j + ")");
                if (prev >= 0) check(expected - prev == 1, "4x4 row-major adjacency at (" + i + "," + j + ")");
                prev = expected;
            }

        MatrixRowMajor.rowMajor = false;
        prev = -1;
        for (int j = 0; j < 4; j++)
            for (int i = 0; i < 4; i++) {
                int expected = j * 4 + i;
                checkEq(MatrixRowMajor.addr(i, j), expected, "4x4 col-major (" + i + "," + j + ")");
                if (prev >= 0) check(expected - prev == 1, "4x4 col-major adjacency at (" + i + "," + j + ")");
                prev = expected;
            }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
