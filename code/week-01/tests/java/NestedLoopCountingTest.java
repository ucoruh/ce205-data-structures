/* Unit tests for week-01 java/NestedLoopCounting.java: tSquare, tTriangle, tHalving.
 * Expected counts are hand-computed closed forms, mirrors code/week-01/tests/c/test_nested_loop_counting.c.
 */
public class NestedLoopCountingTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        // tSquare: T(n) = n^2
        checkEq(NestedLoopCounting.tSquare(0), 0, "square n=0");
        checkEq(NestedLoopCounting.tSquare(1), 1, "square n=1");
        checkEq(NestedLoopCounting.tSquare(2), 4, "square n=2");
        checkEq(NestedLoopCounting.tSquare(10), 100, "square n=10");
        checkEq(NestedLoopCounting.tSquare(25), 625, "square n=25");

        // tTriangle: T(n) = n(n-1)/2
        checkEq(NestedLoopCounting.tTriangle(0), 0, "triangle n=0");
        checkEq(NestedLoopCounting.tTriangle(1), 0, "triangle n=1");
        checkEq(NestedLoopCounting.tTriangle(2), 1, "triangle n=2");
        checkEq(NestedLoopCounting.tTriangle(4), 6, "triangle n=4");
        checkEq(NestedLoopCounting.tTriangle(50), 1225, "triangle n=50");

        // tHalving: hand-simulated doubling counts (see the C test for the by-hand derivation)
        checkEq(NestedLoopCounting.tHalving(1), 0, "halving n=1 (zero executions)");
        checkEq(NestedLoopCounting.tHalving(2), 2, "halving n=2");
        checkEq(NestedLoopCounting.tHalving(3), 6, "halving n=3");
        checkEq(NestedLoopCounting.tHalving(8), 24, "halving n=8");
        checkEq(NestedLoopCounting.tHalving(16), 64, "halving n=16");
        checkEq(NestedLoopCounting.tHalving(512), 4608, "halving n=512");

        // T(n) is monotonically non-decreasing in n for every shape
        check(NestedLoopCounting.tSquare(9) <= NestedLoopCounting.tSquare(10), "square monotonic");
        check(NestedLoopCounting.tTriangle(9) <= NestedLoopCounting.tTriangle(10), "triangle monotonic");
        check(NestedLoopCounting.tHalving(9) <= NestedLoopCounting.tHalving(10), "halving monotonic");

        // cross-shape sanity: for n >= 2, triangle <= square (fewer total inner iterations)
        for (int n : new int[] {2, 5, 10, 17, 33, 64, 100})
            check(NestedLoopCounting.tTriangle(n) <= NestedLoopCounting.tSquare(n), "triangle <= square for n=" + n);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
