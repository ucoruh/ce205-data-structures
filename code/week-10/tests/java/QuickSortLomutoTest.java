/* Unit tests for week-10 java/QuickSortLomuto.java */
public class QuickSortLomutoTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) { checks++; if (!cond) { failures++; System.out.println("FAIL: " + label); } }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static boolean arraysEqual(int[] a, int[] b) {
        if (a.length != b.length) return false;
        for (int i = 0; i < a.length; i++) if (a[i] != b[i]) return false;
        return true;
    }

    public static void main(String[] args) {
        int[] a0 = {0}; QuickSortLomuto.comparisons = 0; QuickSortLomuto.swaps = 0; QuickSortLomuto.quickSortLomuto(a0, 0, -1);
        checkEq(QuickSortLomuto.comparisons, 0, "empty comparisons");

        int[] a1 = {42}; QuickSortLomuto.quickSortLomuto(a1, 0, 0);
        checkEq(a1[0], 42, "one element");

        int[] a2 = {1, 2}; QuickSortLomuto.comparisons = 0; QuickSortLomuto.quickSortLomuto(a2, 0, 1);
        check(arraysEqual(a2, new int[]{1, 2}), "two ordered"); checkEq(QuickSortLomuto.comparisons, 1, "two ordered comparisons");

        int[] a3 = {2, 1}; QuickSortLomuto.quickSortLomuto(a3, 0, 1);
        check(arraysEqual(a3, new int[]{1, 2}), "two unordered");

        // partitionLomuto directly: hand-computed pivot position
        int[] a4 = {5, 2, 8, 1, 9, 3}; // pivot = a[5] = 3
        QuickSortLomuto.comparisons = 0; QuickSortLomuto.swaps = 0;
        int p = QuickSortLomuto.partitionLomuto(a4, 0, 5);
        checkEq(a4[p], 3, "partition pivot value");
        boolean leftOk = true, rightOk = true;
        for (int i = 0; i < p; i++) if (a4[i] > 3) leftOk = false;
        for (int i = p + 1; i < 6; i++) if (a4[i] <= 3) rightOk = false;
        check(leftOk, "partition left side <= pivot"); check(rightOk, "partition right side > pivot");

        int[] a5 = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6}; QuickSortLomuto.quickSortLomuto(a5, 0, 9);
        check(arraysEqual(a5, new int[]{3, 6, 9, 10, 15, 27, 31, 38, 43, 82}), "normal sorted");

        int[] a6 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}; QuickSortLomuto.comparisons = 0; QuickSortLomuto.quickSortLomuto(a6, 0, 9);
        check(arraysEqual(a6, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}), "already sorted stays sorted"); checkEq(QuickSortLomuto.comparisons, 45, "already sorted worst-case comparisons");

        int[] a7 = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; QuickSortLomuto.comparisons = 0; QuickSortLomuto.quickSortLomuto(a7, 0, 9);
        check(arraysEqual(a7, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}), "reverse sorted result"); checkEq(QuickSortLomuto.comparisons, 45, "reverse sorted worst-case comparisons");

        int[] a8 = {5, 5, 5, 5, 5, 5, 5, 5, 5, 5}; QuickSortLomuto.quickSortLomuto(a8, 0, 9);
        check(arraysEqual(a8, new int[]{5, 5, 5, 5, 5, 5, 5, 5, 5, 5}), "all equal sorted");

        int[] a9 = {7, 2, 7, 9, 2, 7, 4, 9, 2, 4, 7, 9}; QuickSortLomuto.quickSortLomuto(a9, 0, 11);
        check(arraysEqual(a9, new int[]{2, 2, 2, 4, 4, 7, 7, 7, 7, 9, 9, 9}), "repeated keys sorted");

        int[] a10 = {-5, 3, -1, -100, 42, 0}; QuickSortLomuto.quickSortLomuto(a10, 0, 5);
        check(arraysEqual(a10, new int[]{-100, -5, -1, 0, 3, 42}), "negative values sorted");

        int[] a11 = {Integer.MAX_VALUE, 0, Integer.MIN_VALUE, 1, -1}; QuickSortLomuto.quickSortLomuto(a11, 0, 4);
        check(arraysEqual(a11, new int[]{Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE}), "extreme values sorted");

        QuickSortLomuto.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
