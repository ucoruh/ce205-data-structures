/* Unit tests for week-10 java/MergeSort.java */
public class MergeSortTest {
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
        int[] a0 = {0}; MergeSort.comparisons = 0; MergeSort.moves = 0; MergeSort.mergeSort(a0, 0, 0, new int[1]);
        checkEq(MergeSort.comparisons, 0, "empty comparisons");

        int[] a1 = {42}; MergeSort.mergeSort(a1, 0, 1, new int[1]);
        checkEq(a1[0], 42, "one element");

        int[] a2 = {1, 2}; MergeSort.comparisons = 0; MergeSort.moves = 0; MergeSort.mergeSort(a2, 0, 2, new int[2]);
        check(arraysEqual(a2, new int[]{1, 2}), "two ordered"); checkEq(MergeSort.comparisons, 1, "two ordered comparisons"); checkEq(MergeSort.moves, 2, "two ordered moves");

        int[] a3 = {2, 1}; MergeSort.comparisons = 0; MergeSort.moves = 0; MergeSort.mergeSort(a3, 0, 2, new int[2]);
        check(arraysEqual(a3, new int[]{1, 2}), "two unordered");

        int[] a4 = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6}; MergeSort.mergeSort(a4, 0, 10, new int[10]);
        check(arraysEqual(a4, new int[]{3, 6, 9, 10, 15, 27, 31, 38, 43, 82}), "normal sorted");

        int[] a5 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; MergeSort.mergeSort(a5, 0, 12, new int[12]);
        check(arraysEqual(a5, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}), "already sorted stays sorted");

        int[] a6 = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; MergeSort.mergeSort(a6, 0, 12, new int[12]);
        check(arraysEqual(a6, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}), "reverse sorted result");

        int[] a7 = {5, 3, 5, 1, 3, 5, 1, 3, 5, 1}; MergeSort.mergeSort(a7, 0, 10, new int[10]);
        check(arraysEqual(a7, new int[]{1, 1, 1, 3, 3, 3, 5, 5, 5, 5}), "duplicates sorted");

        int[] a8 = {8, 7, 6, 5, 4, 3, 2, 1}; MergeSort.comparisons = 0; MergeSort.moves = 0; MergeSort.mergeSort(a8, 0, 8, new int[8]);
        check(arraysEqual(a8, new int[]{1, 2, 3, 4, 5, 6, 7, 8}), "power-of-two sorted"); checkEq(MergeSort.moves, 24, "power-of-two moves");

        int[] a9 = {-5, 3, -1, -100, 42, 0}; MergeSort.mergeSort(a9, 0, 6, new int[6]);
        check(arraysEqual(a9, new int[]{-100, -5, -1, 0, 3, 42}), "negative values sorted");

        int[] a9b = {7, 7, 7, 7, 7, 7}; MergeSort.mergeSort(a9b, 0, 6, new int[6]);
        check(arraysEqual(a9b, new int[]{7, 7, 7, 7, 7, 7}), "all equal sorted");

        int[] a10 = {Integer.MAX_VALUE, 0, Integer.MIN_VALUE, 1, -1}; MergeSort.mergeSort(a10, 0, 5, new int[5]);
        check(arraysEqual(a10, new int[]{Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE}), "extreme values sorted");

        int[] a11 = {45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20}; MergeSort.mergeSort(a11, 0, 14, new int[14]);
        check(arraysEqual(a11, new int[]{2, 6, 9, 11, 14, 18, 20, 24, 29, 33, 36, 38, 41, 45}), "uneven split sorted");

        MergeSort.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
