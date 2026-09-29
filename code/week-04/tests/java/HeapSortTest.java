/* Unit tests for week-04 java/HeapSort.java, mirroring tests/c/test_heap_sort.c */
public class HeapSortTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static void bubbleSort(int[] a, boolean ascending) {
        for (int i = 0; i < a.length; i++)
            for (int j = i + 1; j < a.length; j++)
                if (ascending ? a[j] < a[i] : a[j] > a[i]) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    }
    static void checkSorted(int[] values, boolean isMax) {
        int[] got = values.clone(), expected = values.clone();
        HeapSort.kindIsMax = isMax;
        HeapSort.heapSort(got, got.length);
        bubbleSort(expected, isMax);
        for (int i = 0; i < values.length; i++) checkEq(got[i], expected[i], "element " + i);
    }

    public static void main(String[] args) {
        // -- empty array --
        int[] emptyArr = new int[0];
        HeapSort.kindIsMax = true;
        HeapSort.heapSort(emptyArr, 0);
        check(true, "empty heap_sort does not crash");

        // -- single element --
        checkSorted(new int[]{5}, true);

        // -- two elements, out of order --
        checkSorted(new int[]{9, 2}, true);

        // -- normal: ascending sort with a max-heap, 10 values --
        checkSorted(new int[]{16, 14, 10, 8, 7, 9, 3, 2, 4, 1}, true);

        // -- hard: descending sort with a min-heap, 14 values --
        checkSorted(new int[]{40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29}, false);

        // -- edge: already ascending input, sorted with a max-heap --
        checkSorted(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}, true);

        // -- edge: reverse-sorted input, sorted with a max-heap --
        checkSorted(new int[]{12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1}, true);

        // -- edge: all duplicates --
        checkSorted(new int[]{8, 8, 8, 8, 8, 8, 8, 8}, true);
        int[] arr8 = new int[8];
        java.util.Arrays.fill(arr8, 8);
        HeapSort.kindIsMax = true;
        HeapSort.heapSort(arr8, 8);
        for (int i = 0; i < 8; i++) checkEq(arr8[i], 8, "dup element " + i);

        // -- edge: extreme values, min-heap descending sort --
        checkSorted(new int[]{Integer.MIN_VALUE, Integer.MAX_VALUE, 0, 5, -5}, false);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
