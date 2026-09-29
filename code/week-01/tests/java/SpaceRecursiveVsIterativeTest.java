/* Unit tests for week-01 java/SpaceRecursiveVsIterative.java: sumRecursive() and sumIterative().
 * Expected sums are hand-computed, independent of the two methods under test.
 */
public class SpaceRecursiveVsIterativeTest {
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
        // normal: 10 positive values, sum = 550
        {
            int[] arr = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
            checkEq(SpaceRecursiveVsIterative.sumRecursive(arr, 10), 550, "normal recursive");
            checkEq(SpaceRecursiveVsIterative.sumIterative(arr, 10), 550, "normal iterative");
        }

        // empty input
        checkEq(SpaceRecursiveVsIterative.sumRecursive(new int[0], 0), 0, "empty recursive");
        checkEq(SpaceRecursiveVsIterative.sumIterative(new int[0], 0), 0, "empty iterative");

        // one element
        checkEq(SpaceRecursiveVsIterative.sumRecursive(new int[] {7}, 1), 7, "one element recursive");
        checkEq(SpaceRecursiveVsIterative.sumIterative(new int[] {7}, 1), 7, "one element iterative");

        // two elements
        checkEq(SpaceRecursiveVsIterative.sumRecursive(new int[] {3, 4}, 2), 7, "two elements recursive");
        checkEq(SpaceRecursiveVsIterative.sumIterative(new int[] {3, 4}, 2), 7, "two elements iterative");

        // mixed signs (hard scenario): sum = 129
        {
            int[] arr = {5, -3, 12, 8, -7, 15, 22, -10, 6, 18, 9, -4, 11, 27, -15, 3, 19, -8, 14, 7};
            checkEq(SpaceRecursiveVsIterative.sumRecursive(arr, 20), 129, "mixed signs recursive");
            checkEq(SpaceRecursiveVsIterative.sumIterative(arr, 20), 129, "mixed signs iterative");
        }

        // all negative: sum = -275
        {
            int[] arr = {-5, -10, -15, -20, -25, -30, -35, -40, -45, -50};
            checkEq(SpaceRecursiveVsIterative.sumRecursive(arr, 10), -275, "all negative recursive");
            checkEq(SpaceRecursiveVsIterative.sumIterative(arr, 10), -275, "all negative iterative");
        }

        // deep recursion: 22 values 1..22, sum = 253
        {
            int[] arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22};
            checkEq(SpaceRecursiveVsIterative.sumRecursive(arr, 22), 253, "deep recursion recursive");
            checkEq(SpaceRecursiveVsIterative.sumIterative(arr, 22), 253, "deep recursion iterative");
        }

        // deeper still: 200 ones, sum = 200, confirms no stack overflow well beyond the note's example
        {
            int[] arr = new int[200];
            java.util.Arrays.fill(arr, 1);
            checkEq(SpaceRecursiveVsIterative.sumRecursive(arr, 200), 200, "200 frames recursive");
            checkEq(SpaceRecursiveVsIterative.sumIterative(arr, 200), 200, "200 frames iterative");
        }

        // duplicates
        checkEq(SpaceRecursiveVsIterative.sumRecursive(new int[] {5, 5, 5, 5, 5}, 5), 25, "duplicates recursive");
        checkEq(SpaceRecursiveVsIterative.sumIterative(new int[] {5, 5, 5, 5, 5}, 5), 25, "duplicates iterative");

        // zeros
        checkEq(SpaceRecursiveVsIterative.sumRecursive(new int[] {0, 0, 0, 0}, 4), 0, "zeros recursive");

        // both versions agree on every prefix of a fixed array (cross-check)
        {
            int[] arr = {6, -2, 9, 14, -20, 3, 7, -1, 8, 0};
            for (int n = 0; n <= 10; n++)
                checkEq(SpaceRecursiveVsIterative.sumRecursive(arr, n), SpaceRecursiveVsIterative.sumIterative(arr, n),
                        "cross-check prefix " + n);
        }

        // large values near Integer.MAX_VALUE / 2, no overflow for n = 2
        checkEq(SpaceRecursiveVsIterative.sumRecursive(new int[] {1000000000, 1000000000}, 2), 2000000000, "large recursive");
        checkEq(SpaceRecursiveVsIterative.sumIterative(new int[] {1000000000, 1000000000}, 2), 2000000000, "large iterative");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
