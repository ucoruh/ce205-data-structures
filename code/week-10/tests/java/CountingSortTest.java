/* Unit tests for week-10 java/CountingSort.java */
public class CountingSortTest {
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
        int[] a0 = {7}; int w0 = CountingSort.countingSort(a0, 1, 9);
        checkEq(a0[0], 7, "one element"); checkEq(w0, 2, "one element writes");

        int[] a1 = {1, 2}; CountingSort.countingSort(a1, 2, 9);
        check(arraysEqual(a1, new int[]{1, 2}), "two ordered");

        int[] a2 = {2, 1}; CountingSort.countingSort(a2, 2, 9);
        check(arraysEqual(a2, new int[]{1, 2}), "two unordered");

        int[] a3 = {4, 2, 2, 8, 3, 3, 1, 4, 2, 7}; CountingSort.countingSort(a3, 10, 9);
        check(arraysEqual(a3, new int[]{1, 2, 2, 2, 3, 3, 4, 4, 7, 8}), "normal sorted");

        int[] a4 = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9}; CountingSort.countingSort(a4, 10, 9);
        check(arraysEqual(a4, new int[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}), "already sorted stays sorted");

        int[] a5 = {9, 8, 7, 6, 5, 4, 3, 2, 1, 0}; CountingSort.countingSort(a5, 10, 9);
        check(arraysEqual(a5, new int[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}), "reverse sorted result");

        int[] a6 = {5, 5, 5, 5, 5}; int w6 = CountingSort.countingSort(a6, 5, 9);
        check(arraysEqual(a6, new int[]{5, 5, 5, 5, 5}), "all same value sorted"); checkEq(w6, 10, "all same value writes");

        int[] a7 = {40, 20, 41, 20, 42}; CountingSort.countingSort(a7, 5, 49);
        check(arraysEqual(a7, new int[]{20, 20, 40, 41, 42}), "encoded key/tag sorted");

        int[] a8 = {0, 15, 3, 12, 6, 9, 1, 14, 7, 8}; CountingSort.countingSort(a8, 10, 15);
        check(arraysEqual(a8, new int[]{0, 1, 3, 6, 7, 8, 9, 12, 14, 15}), "sparse range sorted");

        int[] a9 = {9, 0, 9, 0, 5}; CountingSort.countingSort(a9, 5, 9);
        check(arraysEqual(a9, new int[]{0, 0, 5, 9, 9}), "boundary values sorted");

        int[] a10 = {5, 1, 5, 9, 2, 5, 1, 9, 5, 2, 1, 9, 5, 0}; CountingSort.countingSort(a10, 14, 9);
        check(arraysEqual(a10, new int[]{0, 1, 1, 1, 2, 2, 5, 5, 5, 5, 5, 9, 9, 9}), "hard preset sorted");

        int[] a11 = {3, 3, 3, 1, 1, 9, 9, 9, 9, 5}; CountingSort.countingSort(a11, 10, 9);
        check(arraysEqual(a11, new int[]{1, 1, 3, 3, 3, 5, 9, 9, 9, 9}), "uneven duplicates sorted");

        int[] a12 = {6}; CountingSort.countingSort(a12, 1, 6);
        checkEq(a12[0], 6, "single-value array");

        CountingSort.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
