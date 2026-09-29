/* Unit tests for week-01 java/HeapNoFree.java: showFrame(depth) and the program's heap section.
 * "local" is deterministic (depth * 10, hand-computed); mirrors code/week-01/tests/c/test_stack_vs_heap.c.
 */
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class HeapNoFreeTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
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

    static int countOccurrences(String hay, String needle) {
        int n = 0, i = 0;
        while ((i = hay.indexOf(needle, i)) != -1) { n++; i++; }
        return n;
    }

    public static void main(String[] args) {
        // showFrame(0): recurses 0 -> 1 -> 2 -> 3, four lines, local = depth * 10
        {
            String out = capture(() -> HeapNoFree.showFrame(0));
            check(out.contains("depth 0: local = 0"), "depth 0");
            check(out.contains("depth 1: local = 10"), "depth 1");
            check(out.contains("depth 2: local = 20"), "depth 2");
            check(out.contains("depth 3: local = 30"), "depth 3");
            checkEq(countOccurrences(out, "depth "), 4, "four lines from showFrame(0)");
        }

        // showFrame(3): base case reached directly, exactly one line
        {
            String out = capture(() -> HeapNoFree.showFrame(3));
            check(out.contains("depth 3: local = 30"), "base case depth 3");
            checkEq(countOccurrences(out, "depth "), 1, "one line from showFrame(3)");
        }

        // showFrame(5): still a base case (5 < 3 is false), confirms the guard is "< 3", not "== 3"
        {
            String out = capture(() -> HeapNoFree.showFrame(5));
            check(out.contains("depth 5: local = 50"), "base case depth 5");
            checkEq(countOccurrences(out, "depth "), 1, "one line from showFrame(5)");
        }

        // showFrame(1): recurses 1 -> 2 -> 3, three lines
        {
            String out = capture(() -> HeapNoFree.showFrame(1));
            checkEq(countOccurrences(out, "depth "), 3, "three lines from showFrame(1)");
            check(out.contains("depth 1: local = 10"), "depth 1 from showFrame(1)");
            check(out.contains("depth 2: local = 20"), "depth 2 from showFrame(1)");
        }

        // the whole program: heap section values are deterministic ((i+1)*100)
        {
            String out = capture(() -> HeapNoFree.main(new String[0]));
            check(out.contains("-- call frames: same idea as C, one per active call --"), "stack banner");
            check(out.contains("-- heap: `new` allocates, nothing frees it by hand --"), "heap banner");
            check(out.contains("block[0..2] = 100 200 300"), "heap block values");
            check(out.contains("reference dropped: block = null"), "dropped reference prints null");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
