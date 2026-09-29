/* Unit tests for week-01 java/ArrayVsLinkedPreview.java: runScenario() only prints, so stdout is
 * captured. Expected lines are hand-computed (base + i*4 offsets, node numbering, hop counts), mirroring
 * code/week-01/tests/c/test_array_vs_linked_preview.c.
 */
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class ArrayVsLinkedPreviewTest {
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
        // normal: 10 values, k = 4
        {
            int[] values = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
            String out = capture(() -> ArrayVsLinkedPreview.runScenario("normal: 10 values, k = 4 (in the middle)", values, 4));
            check(out.contains("array (contiguous, indexed access):"), "array header");
            check(out.contains("arr[0] = 10 at base+0"), "offset 0");
            check(out.contains("arr[4] = 50 at base+16"), "offset 4 (base + 4*4)");
            check(out.contains("arr[9] = 100 at base+36"), "offset 9 (base + 9*4)");
            check(out.contains("array access: arr[4] = 50, ONE index calculation (base + 4*4). O(1)."), "access line");
            check(out.contains("node #0: data = 10, next -> node #1"), "node 0");
            check(out.contains("node #4: data = 50, next -> node #5"), "node 4");
            check(out.contains("node #9: data = 100, next -> NULL"), "last node terminates");
            check(out.contains("linked access: reached node with data = 50 after 4 hops. O(n)."), "hop count");
        }

        // edge: k = 0, zero hops
        {
            int[] values = {7, 14, 21, 28, 35, 42, 49, 56, 63, 70};
            String out = capture(() -> ArrayVsLinkedPreview.runScenario("edge: k = 0, the first element", values, 0));
            check(out.contains("reached node with data = 7 after 0 hops. O(n)."), "zero hops");
        }

        // edge: k = n-1, the most hops
        {
            int[] values = {3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36};
            String out = capture(() -> ArrayVsLinkedPreview.runScenario("edge: k = the last index, the most hops", values, 11));
            check(out.contains("arr[11] = 36 at base+44"), "last offset");
            check(out.contains("node #11: data = 36, next -> NULL"), "last node");
            check(out.contains("reached node with data = 36 after 11 hops. O(n)."), "max hops");
        }

        // one element
        {
            int[] values = {99};
            String out = capture(() -> ArrayVsLinkedPreview.runScenario("one element", values, 0));
            check(out.contains("node #0: data = 99, next -> NULL"), "single node");
            check(out.contains("reached node with data = 99 after 0 hops. O(n)."), "single node hops");
        }

        // two elements, exactly one hop -- singular wording
        {
            int[] values = {1, 2};
            String out = capture(() -> ArrayVsLinkedPreview.runScenario("two elements", values, 1));
            check(out.contains("after 1 hop. O(n)."), "singular hop");
            check(!out.contains("after 1 hops. O(n)."), "not plural for one hop");
        }

        // duplicates: distinct node numbers despite equal data
        {
            int[] values = {5, 5, 5, 5};
            String out = capture(() -> ArrayVsLinkedPreview.runScenario("duplicates", values, 2));
            check(out.contains("node #0: data = 5, next -> node #1"), "dup node 0");
            check(out.contains("node #2: data = 5, next -> node #3"), "dup node 2");
            check(out.contains("reached node with data = 5 after 2 hops. O(n)."), "dup hops");
        }

        // negative values
        {
            int[] values = {-1, -2, -3};
            String out = capture(() -> ArrayVsLinkedPreview.runScenario("negative values", values, 2));
            check(out.contains("arr[2] = -3 at base+8"), "negative offset");
            check(out.contains("node #2: data = -3, next -> NULL"), "negative node value");
        }

        // no duplicated "(k = N)" suffix in the banner (the same bug fixed in the C version)
        {
            int[] values = {1, 2, 3};
            String out = capture(() -> ArrayVsLinkedPreview.runScenario("normal: 10 values, k = 4 (in the middle)", values, 1));
            check(out.contains("-- normal: 10 values, k = 4 (in the middle) --"), "banner exact");
            check(!out.contains("(in the middle) (k ="), "no duplicated k suffix");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
