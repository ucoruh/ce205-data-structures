/* Unit tests for week-01 java/ArrayIndexing.java: runIntScenario/runDoubleScenario/runCharScenario.
 * They only print, so stdout is captured; expected addr = base + k*sizeof(type) lines are hand-computed,
 * mirroring code/week-01/tests/c/test_pointer_arithmetic.c.
 */
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class ArrayIndexingTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }

    interface Action { void run(); }

    static String capture(Action a) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintStream old = System.out;
        System.setOut(new PrintStream(baos));
        try {
            a.run();
        } finally {
            System.out.flush();
            System.setOut(old);
        }
        return baos.toString();
    }

    public static void main(String[] args) {
        // int array: stride 4
        {
            int[] values = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
            int[] offsets = {0, 1, 2, 4, 9};
            String out = capture(() -> ArrayIndexing.runIntScenario("normal", 1000, values, offsets));
            check(out.contains("(type = int, sizeof = 4)"), "int header");
            check(out.contains("p + 0 = 1000, a[0] = 10"), "int offset 0");
            check(out.contains("p + 1 = 1004, a[1] = 20"), "int offset 1");
            check(out.contains("p + 4 = 1016, a[4] = 50"), "int offset 4");
            check(out.contains("p + 9 = 1036, a[9] = 100"), "int offset 9");
        }

        // out-of-range offsets: Java's own wording, ArrayIndexOutOfBoundsException
        {
            int[] values = {4, 8, 15, 16, 23, 42, 8, 9, 15, 3};
            int[] offsets = {-1, 0, 5, 10, 15};
            String out = capture(() -> ArrayIndexing.runIntScenario("edge", 1000, values, offsets));
            check(out.contains("a[-1] -> out of range: throws ArrayIndexOutOfBoundsException in real Java"), "negative offset guard");
            check(out.contains("a[10] -> out of range: throws ArrayIndexOutOfBoundsException in real Java"), "beyond-N offset guard");
            check(out.contains("a[15] -> out of range: throws ArrayIndexOutOfBoundsException in real Java"), "far beyond-N offset guard");
            check(out.contains("p + 0 = 1000, a[0] = 4"), "in-range offset still prints");
        }

        // double array: stride 8
        {
            double[] values = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
            int[] offsets = {0, 2, 5};
            String out = capture(() -> ArrayIndexing.runDoubleScenario("hard", 2000, values, offsets));
            check(out.contains("(type = double, sizeof = 8)"), "double header");
            check(out.contains("p + 0 = 2000, a[0] = 1"), "double offset 0");
            check(out.contains("p + 2 = 2016, a[2] = 3"), "double offset 2");
            check(out.contains("p + 5 = 2040, a[5] = 6"), "double offset 5");
        }

        // char array: stride 1
        {
            char[] values = {65, 66, 67, 68, 69};
            int[] offsets = {0, 1, 4};
            String out = capture(() -> ArrayIndexing.runCharScenario("edge", 500, values, offsets));
            check(out.contains("(type = char, sizeof = 1)"), "char header");
            check(out.contains("p + 0 = 500, a[0] = 65"), "char offset 0");
            check(out.contains("p + 1 = 501, a[1] = 66"), "char offset 1, stride of exactly 1");
            check(out.contains("p + 4 = 504, a[4] = 69"), "char offset 4");
        }

        // one valid offset only, no out-of-range noise
        {
            int[] values = {42};
            int[] offsets = {0};
            String out = capture(() -> ArrayIndexing.runIntScenario("one element", 100, values, offsets));
            check(out.contains("p + 0 = 100, a[0] = 42"), "single element");
            check(!out.contains("out of range"), "no out-of-range noise");
        }

        // boundary: offset n-1 valid, offset n out of range
        {
            int[] values = {1, 2, 3};
            int[] offsets = {2, 3};
            String out = capture(() -> ArrayIndexing.runIntScenario("boundary", 0, values, offsets));
            check(out.contains("p + 2 = 8, a[2] = 3"), "last valid index");
            check(out.contains("a[3] -> out of range: throws ArrayIndexOutOfBoundsException in real Java"), "one past the end");
        }

        // negative base still adds correctly
        {
            int[] values = {7, 8, 9};
            int[] offsets = {1};
            String out = capture(() -> ArrayIndexing.runIntScenario("negative base", -100, values, offsets));
            check(out.contains("p + 1 = -96, a[1] = 8"), "negative base arithmetic");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
