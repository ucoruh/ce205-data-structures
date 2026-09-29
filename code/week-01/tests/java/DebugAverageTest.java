/* Unit tests for week-01 java/DebugAverage.java: averageBuggy() and averageFixed().
 * Expected values are hand-computed sums, independent of the methods under test.
 */
public class DebugAverageTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static void checkEqD(double actual, double expected, String label) {
        checks++;
        if (Math.abs(actual - expected) > 1e-9) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        // normal: sum = 81, 81/10 = 8.1 -> buggy truncates to 8
        {
            int[] arr = {7, 8, 8, 9, 6, 10, 7, 8, 9, 9};
            checkEq(DebugAverage.averageBuggy(arr), 8, "normal buggy");
            checkEqD(DebugAverage.averageFixed(arr), 8.1, "normal fixed");
        }

        // empty array
        checkEq(DebugAverage.averageBuggy(new int[0]), 0, "empty buggy");
        checkEqD(DebugAverage.averageFixed(new int[0]), 0.0, "empty fixed");

        // one element
        checkEq(DebugAverage.averageBuggy(new int[] {7}), 7, "one element buggy");
        checkEqD(DebugAverage.averageFixed(new int[] {7}), 7.0, "one element fixed");

        // two elements, evenly divisible
        checkEq(DebugAverage.averageBuggy(new int[] {4, 6}), 5, "even divide buggy");
        checkEqD(DebugAverage.averageFixed(new int[] {4, 6}), 5.0, "even divide fixed");

        // two elements, NOT evenly divisible -- this is the bug
        checkEq(DebugAverage.averageBuggy(new int[] {1, 2}), 1, "the bug: truncated");
        checkEqD(DebugAverage.averageFixed(new int[] {1, 2}), 1.5, "the fix: exact");

        // negative values: sum = 11, 11/16 = 0.6875 -> buggy truncates to 0
        {
            int[] arr = {-5, 3, -8, 12, -1, 7, -10, 4, 9, -6, 2, -3, 8, -7, 1, 5};
            checkEq(DebugAverage.averageBuggy(arr), 0, "negatives buggy");
            checkEqD(DebugAverage.averageFixed(arr), 0.6875, "negatives fixed");
        }

        // all-negative, evenly divisible
        checkEq(DebugAverage.averageBuggy(new int[] {-10, -5, -5, -5, -5}), -6, "all negative buggy");
        checkEqD(DebugAverage.averageFixed(new int[] {-10, -5, -5, -5, -5}), -6.0, "all negative fixed");

        // negative sum, truncation toward zero: -7/2 == -3, not -4
        checkEq(DebugAverage.averageBuggy(new int[] {-3, -4}), -3, "truncation toward zero");
        checkEqD(DebugAverage.averageFixed(new int[] {-3, -4}), -3.5, "truncation toward zero fixed");

        // duplicates
        checkEq(DebugAverage.averageBuggy(new int[] {9, 9, 9, 9, 9}), 9, "duplicates buggy");
        checkEqD(DebugAverage.averageFixed(new int[] {9, 9, 9, 9, 9}), 9.0, "duplicates fixed");

        // zeros
        checkEq(DebugAverage.averageBuggy(new int[] {0, 0, 0, 0}), 0, "zeros buggy");

        // large values, no overflow for n = 2
        checkEq(DebugAverage.averageBuggy(new int[] {1000000000, 1000000000}), 1000000000, "large values buggy");
        checkEqD(DebugAverage.averageFixed(new int[] {1000000000, 1000000000}), 1000000000.0, "large values fixed");

        // sixteen elements, half-integer average
        {
            int[] arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16}; // sum 136, avg 8.5
            checkEq(DebugAverage.averageBuggy(arr), 8, "sixteen elements buggy");
            checkEqD(DebugAverage.averageFixed(arr), 8.5, "sixteen elements fixed");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
