/* Unit tests for week-10 java/SelectionSort.java */
public class SelectionSortTest {
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
        int[] a0 = {}; SelectionSort.comparisons = 0; SelectionSort.swaps = 0; SelectionSort.selectionSort(a0);
        checkEq(SelectionSort.comparisons, 0, "empty comparisons");

        int[] a1 = {42}; SelectionSort.selectionSort(a1);
        checkEq(a1[0], 42, "one element");

        int[] a2 = {1, 2}; SelectionSort.comparisons = 0; SelectionSort.swaps = 0; SelectionSort.selectionSort(a2);
        check(arraysEqual(a2, new int[]{1, 2}), "two ordered"); checkEq(SelectionSort.comparisons, 1, "two ordered comparisons"); checkEq(SelectionSort.swaps, 0, "two ordered swaps");

        int[] a3 = {2, 1}; SelectionSort.comparisons = 0; SelectionSort.swaps = 0; SelectionSort.selectionSort(a3);
        check(arraysEqual(a3, new int[]{1, 2}), "two unordered"); checkEq(SelectionSort.swaps, 1, "two unordered swaps");

        int[] a4 = {29, 10, 14, 37, 14, 22, 5, 41, 18, 33}; SelectionSort.selectionSort(a4);
        check(arraysEqual(a4, new int[]{5, 10, 14, 14, 18, 22, 29, 33, 37, 41}), "normal sorted");

        int[] a5 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; SelectionSort.comparisons = 0; SelectionSort.swaps = 0; SelectionSort.selectionSort(a5);
        checkEq(SelectionSort.comparisons, 66, "already sorted comparisons"); checkEq(SelectionSort.swaps, 0, "already sorted swaps");

        int[] a6 = {5, 4, 3, 2, 1}; SelectionSort.comparisons = 0; SelectionSort.swaps = 0; SelectionSort.selectionSort(a6);
        check(arraysEqual(a6, new int[]{1, 2, 3, 4, 5}), "reverse sorted result"); checkEq(SelectionSort.comparisons, 10, "reverse sorted comparisons"); check(SelectionSort.swaps <= 4, "reverse sorted swaps bound");

        int[] a7 = {4, 4, 2, 4, 2, 4, 2, 4, 4, 2}; SelectionSort.selectionSort(a7);
        check(arraysEqual(a7, new int[]{2, 2, 2, 2, 4, 4, 4, 4, 4, 4}), "duplicates sorted");

        int[] a8 = {7, 7, 7, 7, 7}; SelectionSort.comparisons = 0; SelectionSort.swaps = 0; SelectionSort.selectionSort(a8);
        checkEq(SelectionSort.swaps, 0, "all equal swaps");

        int[] a9 = {-5, 3, -1, -100, 42, 0}; SelectionSort.selectionSort(a9);
        check(arraysEqual(a9, new int[]{-100, -5, -1, 0, 3, 42}), "negative values sorted");

        int[] a10 = {Integer.MAX_VALUE, 0, Integer.MIN_VALUE, 1, -1}; SelectionSort.selectionSort(a10);
        check(arraysEqual(a10, new int[]{Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE}), "extreme values sorted");

        int[] a11 = {2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1};
        SelectionSort.selectionSort(a11);
        check(arraysEqual(a11, new int[]{-2147483648, -2147483647, -1000000, -5, -1, 0, 1, 5, 1000000, 2147483646, 2147483647}), "extreme preset sorted");

        SelectionSort.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
