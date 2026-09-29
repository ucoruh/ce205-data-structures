// Unit tests for code/week-02/java/ArrayRearrange.java: segregate().
// Independent oracle: two invariants checked WITHOUT re-running segregate's own two-pointer logic --
// (1) the multiset of values is unchanged (insertion-sort a copy of the original and of the result, a
// different algorithm from segregate's partition scan, and compare them element-wise);
// (2) every negative value in the result sits before every non-negative value.
public class ArrayRearrangeTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }

    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i], j = i - 1;
            while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
            a[j + 1] = key;
        }
    }

    static void checkSegregation(String label, int[] arr) {
        int[] original = arr.clone();
        ArrayRearrange.segregate(arr);

        int[] originalSorted = original.clone();
        int[] resultSorted = arr.clone();
        insertionSort(originalSorted);
        insertionSort(resultSorted);
        for (int i = 0; i < arr.length; i++)
            check(originalSorted[i] == resultSorted[i], label + ": multiset mismatch at sorted index " + i);

        boolean seenNonnegative = false, violated = false;
        for (int v : arr) {
            if (v >= 0) seenNonnegative = true;
            else if (seenNonnegative) violated = true;
        }
        check(!violated, label + ": a negative value follows a non-negative one");
    }

    public static void main(String[] args) {
        checkSegregation("normal", new int[]{12, -7, 5, -3, 9, -1, -8, 6, 15, -20, 3, -4});
        checkSegregation("hard (zeros/duplicates)", new int[]{0, -5, 3, -5, 0, 8, -12, 0, 4, -3, 7, -7, 0, 9, -2});
        checkSegregation("all negative", new int[]{-3, -8, -1, -15, -22, -4, -9, -17, -2, -6});
        checkSegregation("all non-negative (incl. zero)", new int[]{4, 0, 9, 15, 2, 8, 0, 11, 6, 3});
        checkSegregation("already segregated", new int[]{-5, -3, -8, -1, -9, 2, 4, 6, 8, 10, 12, 14});
        checkSegregation("empty", new int[]{});
        checkSegregation("one element negative", new int[]{-5});
        checkSegregation("one element zero", new int[]{0});
        checkSegregation("one element positive", new int[]{5});
        checkSegregation("two negative", new int[]{-3, -8});
        checkSegregation("two non-negative", new int[]{3, 8});
        checkSegregation("negative then non-negative", new int[]{-3, 8});
        checkSegregation("non-negative then negative", new int[]{3, -8});
        checkSegregation("INT_MIN/INT_MAX", new int[]{Integer.MAX_VALUE, Integer.MIN_VALUE, 0, -1, 1});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
