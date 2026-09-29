/* Unit tests for week-10 java/QuickSortHoare.java */
public class QuickSortHoareTest {
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
    static boolean isSorted(int[] a) {
        for (int i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false;
        return true;
    }

    public static void main(String[] args) {
        int[] a0 = {0}; QuickSortHoare.comparisons = 0; QuickSortHoare.swaps = 0; QuickSortHoare.quickSortHoare(a0, 0, -1);
        checkEq(QuickSortHoare.comparisons, 0, "empty comparisons");

        int[] a1 = {42}; QuickSortHoare.quickSortHoare(a1, 0, 0);
        checkEq(a1[0], 42, "one element");

        int[] a2 = {1, 2}; QuickSortHoare.quickSortHoare(a2, 0, 1);
        check(arraysEqual(a2, new int[]{1, 2}), "two ordered");

        int[] a3 = {2, 1}; QuickSortHoare.comparisons = 0; QuickSortHoare.swaps = 0; QuickSortHoare.quickSortHoare(a3, 0, 1);
        check(arraysEqual(a3, new int[]{1, 2}), "two unordered"); check(QuickSortHoare.swaps >= 1, "two unordered swaps");

        // partitionHoare directly: Hoare's actual invariant
        int[] a4 = {5, 2, 8, 1, 9, 3}; // pivot = a[0] = 5
        QuickSortHoare.comparisons = 0; QuickSortHoare.swaps = 0;
        int p = QuickSortHoare.partitionHoare(a4, 0, 5);
        boolean okLeft = true, okRight = true;
        for (int i = 0; i <= p; i++) if (a4[i] > 5) okLeft = false;
        for (int i = p + 1; i < 6; i++) if (a4[i] < 5) okRight = false;
        check(okLeft, "partition left <= pivot"); check(okRight, "partition right >= pivot");

        int[] a5 = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6}; QuickSortHoare.quickSortHoare(a5, 0, 9);
        check(arraysEqual(a5, new int[]{3, 6, 9, 10, 15, 27, 31, 38, 43, 82}), "normal sorted");

        int[] a6 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}; QuickSortHoare.quickSortHoare(a6, 0, 9);
        check(isSorted(a6), "already sorted stays sorted");

        int[] a7 = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; QuickSortHoare.quickSortHoare(a7, 0, 9);
        check(arraysEqual(a7, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}), "reverse sorted result");

        int[] a8 = {5, 5, 5, 5, 5, 5, 5, 5, 5, 5}; QuickSortHoare.quickSortHoare(a8, 0, 9);
        check(isSorted(a8), "all equal sorted");

        int[] a9 = {7, 2, 7, 9, 2, 7, 4, 9, 2, 4, 7, 9}; QuickSortHoare.quickSortHoare(a9, 0, 11);
        check(arraysEqual(a9, new int[]{2, 2, 2, 4, 4, 7, 7, 7, 7, 9, 9, 9}), "repeated keys sorted");

        int[] a10 = {-5, 3, -1, -100, 42, 0}; QuickSortHoare.quickSortHoare(a10, 0, 5);
        check(arraysEqual(a10, new int[]{-100, -5, -1, 0, 3, 42}), "negative values sorted");

        int[] a11 = {Integer.MAX_VALUE, 0, Integer.MIN_VALUE, 1, -1}; QuickSortHoare.quickSortHoare(a11, 0, 4);
        check(arraysEqual(a11, new int[]{Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE}), "extreme values sorted");

        int[] a12 = {3, 3}; QuickSortHoare.quickSortHoare(a12, 0, 1);
        check(arraysEqual(a12, new int[]{3, 3}), "duplicate pair sorted");

        QuickSortHoare.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
