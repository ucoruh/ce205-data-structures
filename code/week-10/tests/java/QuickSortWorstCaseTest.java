/* Unit tests for week-10 java/QuickSortWorstCase.java */
public class QuickSortWorstCaseTest {
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
    static boolean isSorted(int[] a) {
        for (int i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false;
        return true;
    }

    public static void main(String[] args) {
        int[] a = {9, 1, 5};
        checkEq(QuickSortWorstCase.choosePivotFirst(a, 0, 2), 0, "choosePivotFirst lo=0");
        checkEq(QuickSortWorstCase.choosePivotFirst(a, 1, 2), 1, "choosePivotFirst lo=1");

        int[] zeros = new int[10];
        checkEq(QuickSortWorstCase.choosePivotMiddle(zeros, 0, 9), 4, "choosePivotMiddle 0..9");
        checkEq(QuickSortWorstCase.choosePivotMiddle(zeros, 2, 5), 3, "choosePivotMiddle 2..5");

        int[] a3 = {5, 100, 1}; // lo=0(5), mid=1(100), hi=2(1); median is 5
        int p3 = QuickSortWorstCase.choosePivotMedian3(a3, 0, 2);
        checkEq(p3, 1, "median3 position"); checkEq(a3[p3], 5, "median3 value");

        int[] a4 = {5, 2, 8, 1, 9, 3};
        QuickSortWorstCase.comparisons[0] = 0;
        int p4 = QuickSortWorstCase.partitionWith(a4, 0, 5, 5);
        checkEq(a4[p4], 3, "partition pivot value");
        boolean ok = true;
        for (int i = 0; i < p4; i++) if (a4[i] > 3) ok = false;
        for (int i = p4 + 1; i < 6; i++) if (a4[i] <= 3) ok = false;
        check(ok, "partition invariant");

        int[] a5 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        QuickSortWorstCase.comparisons[0] = 0; QuickSortWorstCase.calls[0] = 0; QuickSortWorstCase.maxDepth[0] = 0;
        QuickSortWorstCase.qs(a5, 0, 9, QuickSortWorstCase::choosePivotFirst, 0);
        check(isSorted(a5), "first-pivot sorted"); checkEq(QuickSortWorstCase.comparisons[0], 45, "first-pivot worst-case comparisons");
        checkEq(QuickSortWorstCase.calls[0], 9, "first-pivot calls"); checkEq(QuickSortWorstCase.maxDepth[0], 9, "first-pivot depth");

        int[] a5r = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
        QuickSortWorstCase.comparisons[0] = 0; QuickSortWorstCase.calls[0] = 0; QuickSortWorstCase.maxDepth[0] = 0;
        QuickSortWorstCase.qs(a5r, 0, 9, QuickSortWorstCase::choosePivotFirst, 0);
        check(isSorted(a5r), "first-pivot reverse-sorted sorted"); checkEq(QuickSortWorstCase.comparisons[0], 45, "first-pivot reverse-sorted worst-case comparisons");
        checkEq(QuickSortWorstCase.calls[0], 9, "first-pivot reverse-sorted calls"); checkEq(QuickSortWorstCase.maxDepth[0], 9, "first-pivot reverse-sorted depth");

        int[] a6 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        QuickSortWorstCase.comparisons[0] = 0; QuickSortWorstCase.calls[0] = 0; QuickSortWorstCase.maxDepth[0] = 0;
        QuickSortWorstCase.qs(a6, 0, 9, QuickSortWorstCase::choosePivotMedian3, 0);
        check(isSorted(a6), "median3 sorted"); check(QuickSortWorstCase.calls[0] < 9, "median3 fewer calls"); check(QuickSortWorstCase.maxDepth[0] < 9, "median3 shallower depth");

        int[] a7 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        QuickSortWorstCase.comparisons[0] = 0;
        QuickSortWorstCase.qs(a7, 0, 9, QuickSortWorstCase::choosePivotMiddle, 0);
        check(isSorted(a7), "middle-pivot sorted"); check(QuickSortWorstCase.comparisons[0] < 45, "middle-pivot fewer comparisons");

        int[] a8 = {0}; QuickSortWorstCase.calls[0] = 0;
        QuickSortWorstCase.qs(a8, 0, -1, QuickSortWorstCase::choosePivotFirst, 0);
        checkEq(QuickSortWorstCase.calls[0], 0, "empty range calls");

        int[] a9 = {42};
        QuickSortWorstCase.qs(a9, 0, 0, QuickSortWorstCase::choosePivotFirst, 0);
        checkEq(a9[0], 42, "one element");

        int[] a10 = {4, 4, 4, 4, 4, 4};
        QuickSortWorstCase.qs(a10, 0, 5, QuickSortWorstCase::choosePivotMedian3, 0);
        check(arraysEqual(a10, new int[]{4, 4, 4, 4, 4, 4}), "all equal sorted");

        int[] a11 = {-5, 3, -1, -100, 42, 0};
        QuickSortWorstCase.qs(a11, 0, 5, QuickSortWorstCase::choosePivotMiddle, 0);
        check(arraysEqual(a11, new int[]{-100, -5, -1, 0, 3, 42}), "negative values sorted");

        int[] a12 = {Integer.MAX_VALUE, 0, Integer.MIN_VALUE, 1, -1};
        QuickSortWorstCase.qs(a12, 0, 4, QuickSortWorstCase::choosePivotFirst, 0);
        check(arraysEqual(a12, new int[]{Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE}), "extreme values sorted");

        QuickSortWorstCase.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
