/* Unit tests for week-10 java/BucketSort.java */
public class BucketSortTest {
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
        int[] aEmpty = {}; BucketSort.comparisons = 0; BucketSort.moves = 0; BucketSort.bucketSort(aEmpty, 0, 99);
        checkEq(BucketSort.comparisons, 0, "empty array comparisons"); checkEq(BucketSort.moves, 0, "empty array moves");

        int[] a0 = {50}; BucketSort.bucketSort(a0, 1, 99);
        checkEq(a0[0], 50, "one element");

        int[] a1 = {10, 20}; BucketSort.bucketSort(a1, 2, 99);
        check(arraysEqual(a1, new int[]{10, 20}), "two ordered");

        int[] a2 = {15, 11}; BucketSort.comparisons = 0; BucketSort.moves = 0; BucketSort.bucketSort(a2, 2, 99);
        check(arraysEqual(a2, new int[]{11, 15}), "two unordered, same bucket"); checkEq(BucketSort.comparisons, 1, "two unordered comparisons");

        int[] a3 = {42, 8, 77, 15, 91, 33, 56, 24, 68, 5}; BucketSort.bucketSort(a3, 10, 99);
        check(arraysEqual(a3, new int[]{5, 8, 15, 24, 33, 42, 56, 68, 77, 91}), "normal sorted");

        int[] a4 = {2, 12, 22, 33, 44, 55, 66, 77, 88, 99}; BucketSort.bucketSort(a4, 10, 99);
        check(arraysEqual(a4, new int[]{2, 12, 22, 33, 44, 55, 66, 77, 88, 99}), "already sorted stays sorted");

        int[] a5 = {99, 88, 77, 66, 55, 44, 33, 22, 12, 2}; BucketSort.bucketSort(a5, 10, 99);
        check(arraysEqual(a5, new int[]{2, 12, 22, 33, 44, 55, 66, 77, 88, 99}), "reverse sorted result");

        int[] a6 = {49, 48, 47, 46, 45, 44, 43, 42, 41, 40}; BucketSort.comparisons = 0; BucketSort.moves = 0; BucketSort.bucketSort(a6, 10, 99);
        check(arraysEqual(a6, new int[]{40, 41, 42, 43, 44, 45, 46, 47, 48, 49}), "single bucket worst case sorted");
        checkEq(BucketSort.comparisons, 45, "single bucket worst-case comparisons");

        int[] a7 = {23, 23, 23, 23}; BucketSort.bucketSort(a7, 4, 99);
        check(arraysEqual(a7, new int[]{23, 23, 23, 23}), "all same value sorted");

        int[] a8 = {23, 23, 25, 23, 25, 61, 61, 61, 8, 8}; BucketSort.bucketSort(a8, 10, 99);
        check(arraysEqual(a8, new int[]{8, 8, 23, 23, 23, 25, 25, 61, 61, 61}), "duplicates sorted");

        int[] a9 = {99, 0, 50, 0, 99}; BucketSort.bucketSort(a9, 5, 99);
        check(arraysEqual(a9, new int[]{0, 0, 50, 99, 99}), "boundary values sorted");

        int[] a10 = {42, 45, 8, 77, 71, 15, 91, 33, 38, 56, 24, 68, 5, 3}; BucketSort.bucketSort(a10, 14, 99);
        check(arraysEqual(a10, new int[]{3, 5, 8, 15, 24, 33, 38, 42, 45, 56, 68, 71, 77, 91}), "hard preset sorted");

        int[] a11 = {5, 95}; BucketSort.comparisons = 0; BucketSort.bucketSort(a11, 2, 99);
        check(arraysEqual(a11, new int[]{5, 95}), "different buckets sorted"); checkEq(BucketSort.comparisons, 0, "different buckets zero comparisons");

        int[] a12 = {3}; BucketSort.bucketSort(a12, 1, 9);
        checkEq(a12[0], 3, "single value small max_val");

        BucketSort.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
