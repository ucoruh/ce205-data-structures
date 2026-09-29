/* Unit tests for week-10 java/MergeSortBottomUp.java */
public class MergeSortBottomUpTest {
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
        int[] a0 = {0}; MergeSortBottomUp.comparisons = 0; MergeSortBottomUp.moves = 0; MergeSortBottomUp.mergeSortBottomUp(a0, 0, new int[1]);
        checkEq(MergeSortBottomUp.comparisons, 0, "empty comparisons");

        int[] a1 = {42}; MergeSortBottomUp.mergeSortBottomUp(a1, 1, new int[1]);
        checkEq(a1[0], 42, "one element");

        int[] a2 = {1, 2}; MergeSortBottomUp.comparisons = 0; MergeSortBottomUp.mergeSortBottomUp(a2, 2, new int[2]);
        check(arraysEqual(a2, new int[]{1, 2}), "two ordered"); checkEq(MergeSortBottomUp.comparisons, 1, "two ordered comparisons");

        int[] a3 = {2, 1}; MergeSortBottomUp.comparisons = 0; MergeSortBottomUp.mergeSortBottomUp(a3, 2, new int[2]);
        check(arraysEqual(a3, new int[]{1, 2}), "two unordered"); checkEq(MergeSortBottomUp.comparisons, 1, "two unordered comparisons");

        int[] a4 = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6}; MergeSortBottomUp.mergeSortBottomUp(a4, 10, new int[10]);
        check(arraysEqual(a4, new int[]{3, 6, 9, 10, 15, 27, 31, 38, 43, 82}), "normal sorted");

        int[] a5 = {16, 3, 9, 14, 1, 12, 7, 10, 5, 15, 2, 11, 8, 13, 4, 6}; MergeSortBottomUp.comparisons = 0; MergeSortBottomUp.moves = 0; MergeSortBottomUp.mergeSortBottomUp(a5, 16, new int[16]);
        check(arraysEqual(a5, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16}), "power-of-two sorted"); checkEq(MergeSortBottomUp.moves, 64, "power-of-two moves");

        int[] a6 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; MergeSortBottomUp.mergeSortBottomUp(a6, 12, new int[12]);
        check(arraysEqual(a6, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}), "already sorted stays sorted");

        int[] a7 = {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; MergeSortBottomUp.mergeSortBottomUp(a7, 12, new int[12]);
        check(arraysEqual(a7, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}), "reverse sorted result");

        int[] a8 = {5, 3, 5, 1, 3, 5, 1, 3, 5, 1}; MergeSortBottomUp.mergeSortBottomUp(a8, 10, new int[10]);
        check(arraysEqual(a8, new int[]{1, 1, 1, 3, 3, 3, 5, 5, 5, 5}), "duplicates sorted");

        int[] a9 = {-5, 3, -1, -100, 42, 0}; MergeSortBottomUp.mergeSortBottomUp(a9, 6, new int[6]);
        check(arraysEqual(a9, new int[]{-100, -5, -1, 0, 3, 42}), "negative values sorted");

        int[] a9b = {7, 7, 7, 7, 7, 7}; MergeSortBottomUp.mergeSortBottomUp(a9b, 6, new int[6]);
        check(arraysEqual(a9b, new int[]{7, 7, 7, 7, 7, 7}), "all equal sorted");

        int[] a10 = {Integer.MAX_VALUE, 0, Integer.MIN_VALUE, 1, -1}; MergeSortBottomUp.mergeSortBottomUp(a10, 5, new int[5]);
        check(arraysEqual(a10, new int[]{Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE}), "extreme values sorted");

        int[] a11 = {45, 2, 38, 9, 33, 14, 29, 6, 41, 18, 24, 11, 36, 20}; MergeSortBottomUp.mergeSortBottomUp(a11, 14, new int[14]);
        check(arraysEqual(a11, new int[]{2, 6, 9, 11, 14, 18, 20, 24, 29, 33, 36, 38, 41, 45}), "non-power-of-two sorted");

        MergeSortBottomUp.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
