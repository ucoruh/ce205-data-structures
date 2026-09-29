/* Unit tests for week-10 java/InsertionSort.java */
public class InsertionSortTest {
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
        int[] a0 = {}; InsertionSort.comparisons = 0; InsertionSort.shifts = 0; InsertionSort.insertionSort(a0);
        checkEq(InsertionSort.comparisons, 0, "empty comparisons");

        int[] a1 = {42}; InsertionSort.insertionSort(a1);
        checkEq(a1[0], 42, "one element");

        int[] a2 = {1, 2}; InsertionSort.comparisons = 0; InsertionSort.shifts = 0; InsertionSort.insertionSort(a2);
        check(arraysEqual(a2, new int[]{1, 2}), "two ordered"); checkEq(InsertionSort.comparisons, 1, "two ordered comparisons"); checkEq(InsertionSort.shifts, 0, "two ordered shifts");

        int[] a3 = {2, 1}; InsertionSort.comparisons = 0; InsertionSort.shifts = 0; InsertionSort.insertionSort(a3);
        check(arraysEqual(a3, new int[]{1, 2}), "two unordered"); checkEq(InsertionSort.shifts, 1, "two unordered shifts");

        int[] a4 = {31, 12, 25, 8, 19, 40, 3, 27, 15, 22}; InsertionSort.insertionSort(a4);
        check(arraysEqual(a4, new int[]{3, 8, 12, 15, 19, 22, 25, 27, 31, 40}), "normal sorted");

        int[] a5 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; InsertionSort.comparisons = 0; InsertionSort.shifts = 0; InsertionSort.insertionSort(a5);
        checkEq(InsertionSort.comparisons, 11, "already sorted comparisons"); checkEq(InsertionSort.shifts, 0, "already sorted shifts");

        int[] a6 = {5, 4, 3, 2, 1}; InsertionSort.comparisons = 0; InsertionSort.shifts = 0; InsertionSort.insertionSort(a6);
        check(arraysEqual(a6, new int[]{1, 2, 3, 4, 5}), "reverse sorted result"); checkEq(InsertionSort.shifts, 10, "reverse sorted shifts");

        int[] a7 = {5, 3, 5, 1, 3, 5, 1, 3, 5, 1}; InsertionSort.insertionSort(a7);
        check(arraysEqual(a7, new int[]{1, 1, 1, 3, 3, 3, 5, 5, 5, 5}), "duplicates sorted");

        int[] a8 = {6, 6, 6, 6, 6}; InsertionSort.comparisons = 0; InsertionSort.shifts = 0; InsertionSort.insertionSort(a8);
        checkEq(InsertionSort.shifts, 0, "all equal shifts");

        int[] a9 = {-5, 3, -1, -100, 42, 0}; InsertionSort.insertionSort(a9);
        check(arraysEqual(a9, new int[]{-100, -5, -1, 0, 3, 42}), "negative values sorted");

        int[] a10 = {Integer.MAX_VALUE, 0, Integer.MIN_VALUE, 1, -1}; InsertionSort.insertionSort(a10);
        check(arraysEqual(a10, new int[]{Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE}), "extreme values sorted");

        int[] a11 = {0, 2147483647, -2147483648, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1};
        InsertionSort.insertionSort(a11);
        check(arraysEqual(a11, new int[]{-2147483648, -2147483647, -1000000, -5, -1, 0, 1, 5, 1000000, 2147483646, 2147483647}), "extreme preset sorted");

        InsertionSort.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
