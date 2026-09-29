/* Unit tests for week-10 java/ShellSort.java */
public class ShellSortTest {
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
        int[] a0 = {}; ShellSort.comparisons = 0; ShellSort.shifts = 0; ShellSort.shellSort(a0);
        checkEq(ShellSort.comparisons, 0, "empty comparisons");

        int[] a1 = {42}; ShellSort.shellSort(a1);
        checkEq(a1[0], 42, "one element");

        int[] a2 = {1, 2}; ShellSort.shellSort(a2);
        check(arraysEqual(a2, new int[]{1, 2}), "two ordered");

        int[] a3 = {2, 1}; ShellSort.comparisons = 0; ShellSort.shifts = 0; ShellSort.shellSort(a3);
        check(arraysEqual(a3, new int[]{1, 2}), "two unordered"); check(ShellSort.shifts >= 1, "two unordered shifts positive");

        int[] a4 = {23, 9, 41, 5, 33, 17, 2, 46, 12, 28}; ShellSort.shellSort(a4);
        check(arraysEqual(a4, new int[]{2, 5, 9, 12, 17, 23, 28, 33, 41, 46}), "normal sorted");

        int[] a5 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; ShellSort.comparisons = 0; ShellSort.shifts = 0; ShellSort.shellSort(a5);
        check(arraysEqual(a5, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}), "already sorted stays sorted"); checkEq(ShellSort.shifts, 0, "already sorted shifts");

        int[] a6 = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; ShellSort.shellSort(a6);
        check(arraysEqual(a6, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}), "reverse sorted result");

        int[] a7 = {6, 2, 6, 2, 6, 2, 6, 2, 6, 2}; ShellSort.shellSort(a7);
        check(arraysEqual(a7, new int[]{2, 2, 2, 2, 2, 6, 6, 6, 6, 6}), "duplicates sorted");

        int[] a8 = {4, 4, 4, 4, 4, 4}; ShellSort.comparisons = 0; ShellSort.shifts = 0; ShellSort.shellSort(a8);
        checkEq(ShellSort.shifts, 0, "all equal shifts");

        int[] a9 = {-5, 3, -1, -100, 42, 0}; ShellSort.shellSort(a9);
        check(arraysEqual(a9, new int[]{-100, -5, -1, 0, 3, 42}), "negative values sorted");

        int[] a10 = {Integer.MAX_VALUE, 0, Integer.MIN_VALUE, 1, -1}; ShellSort.shellSort(a10);
        check(arraysEqual(a10, new int[]{Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE}), "extreme values sorted");

        int[] a11 = {16, 3, 9, 14, 1, 12, 7, 10, 5, 15, 2, 11, 8, 13, 4, 6}; ShellSort.shellSort(a11);
        check(arraysEqual(a11, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16}), "power-of-two sorted");

        int[] a12 = {0, 2147483647, -2147483648, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1};
        ShellSort.shellSort(a12);
        check(arraysEqual(a12, new int[]{-2147483648, -2147483647, -1000000, -5, -1, 0, 1, 5, 1000000, 2147483646, 2147483647}), "extreme preset sorted");

        ShellSort.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
