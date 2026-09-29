/* Unit tests for week-10 java/BubbleSort.java */
public class BubbleSortTest {
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
        // -- empty array --
        int[] a0 = {}; BubbleSort.comparisons = 0; BubbleSort.swaps = 0; BubbleSort.bubbleSort(a0);
        checkEq(BubbleSort.comparisons, 0, "empty comparisons"); checkEq(BubbleSort.swaps, 0, "empty swaps");

        // -- one element --
        int[] a1 = {42}; BubbleSort.comparisons = 0; BubbleSort.swaps = 0; BubbleSort.bubbleSort(a1);
        checkEq(a1[0], 42, "one element value"); checkEq(BubbleSort.comparisons, 0, "one element comparisons");

        // -- two elements, already in order --
        int[] a2 = {1, 2}; BubbleSort.comparisons = 0; BubbleSort.swaps = 0; BubbleSort.bubbleSort(a2);
        check(arraysEqual(a2, new int[]{1, 2}), "two ordered"); checkEq(BubbleSort.comparisons, 1, "two ordered comparisons"); checkEq(BubbleSort.swaps, 0, "two ordered swaps");

        // -- two elements, out of order --
        int[] a3 = {2, 1}; BubbleSort.comparisons = 0; BubbleSort.swaps = 0; BubbleSort.bubbleSort(a3);
        check(arraysEqual(a3, new int[]{1, 2}), "two unordered"); checkEq(BubbleSort.swaps, 1, "two unordered swaps");

        // -- normal case --
        int[] a4 = {5, 2, 9, 1, 7, 3, 8, 4, 6, 0}; BubbleSort.bubbleSort(a4);
        check(arraysEqual(a4, new int[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}), "normal sorted");

        // -- already sorted: early exit, n-1 comparisons, zero swaps --
        int[] a5 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}; BubbleSort.comparisons = 0; BubbleSort.swaps = 0; BubbleSort.bubbleSort(a5);
        check(arraysEqual(a5, new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}), "already sorted stays sorted");
        checkEq(BubbleSort.comparisons, 11, "already sorted comparisons"); checkEq(BubbleSort.swaps, 0, "already sorted swaps");

        // -- reverse sorted: hand-computed swap count n*(n-1)/2 --
        int[] a6 = {5, 4, 3, 2, 1}; BubbleSort.comparisons = 0; BubbleSort.swaps = 0; BubbleSort.bubbleSort(a6);
        check(arraysEqual(a6, new int[]{1, 2, 3, 4, 5}), "reverse sorted result"); checkEq(BubbleSort.swaps, 10, "reverse sorted swaps");

        // -- duplicates --
        int[] a7 = {7, 3, 7, 1, 3, 9, 1, 7, 9, 3}; BubbleSort.bubbleSort(a7);
        check(arraysEqual(a7, new int[]{1, 1, 3, 3, 3, 7, 7, 7, 9, 9}), "duplicates sorted");

        // -- all equal: zero swaps --
        int[] a8 = {4, 4, 4, 4, 4}; BubbleSort.comparisons = 0; BubbleSort.swaps = 0; BubbleSort.bubbleSort(a8);
        checkEq(BubbleSort.swaps, 0, "all equal swaps");

        // -- negative values --
        int[] a9 = {-5, 3, -1, -100, 42, 0}; BubbleSort.bubbleSort(a9);
        check(arraysEqual(a9, new int[]{-100, -5, -1, 0, 3, 42}), "negative values sorted");

        // -- Integer.MIN_VALUE / MAX_VALUE round trip --
        int[] a10 = {Integer.MAX_VALUE, 0, Integer.MIN_VALUE, 1, -1}; BubbleSort.bubbleSort(a10);
        check(arraysEqual(a10, new int[]{Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE}), "extreme values sorted");

        // -- extreme preset (11 values), matches the animation --
        int[] a11 = {2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1};
        BubbleSort.bubbleSort(a11);
        check(arraysEqual(a11, new int[]{-2147483648, -2147483647, -1000000, -5, -1, 0, 1, 5, 1000000, 2147483646, 2147483647}), "extreme preset sorted");

        // -- integration: the real main() runs without crashing --
        BubbleSort.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
