/* Unit tests for week-10 java/SortingComparison.java */
public class SortingComparisonTest {
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
        int[] want10 = {3, 6, 9, 10, 15, 27, 31, 38, 43, 82};
        int[] src = {38, 27, 43, 3, 9, 82, 10, 15, 31, 6};

        int[] a1 = src.clone(); SortingComparison.bubble(a1, 10);
        check(arraysEqual(a1, want10), "bubble matches expected");
        int[] a2 = src.clone(); SortingComparison.selection(a2, 10);
        check(arraysEqual(a2, want10), "selection matches expected");
        int[] a3 = src.clone(); SortingComparison.insertion(a3, 10);
        check(arraysEqual(a3, want10), "insertion matches expected");
        int[] a4 = src.clone(); SortingComparison.mergeSortTop(a4, 10);
        check(arraysEqual(a4, want10), "merge matches expected");
        int[] a5 = src.clone(); SortingComparison.quickSortTop(a5, 10);
        check(arraysEqual(a5, want10), "quick matches expected");

        int[] a6 = src.clone(); SortingComparison.comparisons = 0; SortingComparison.bubble(a6, 10);
        checkEq(SortingComparison.comparisons, 45, "bubble hand-computed comparisons");
        int[] a7 = src.clone(); SortingComparison.comparisons = 0; SortingComparison.selection(a7, 10);
        checkEq(SortingComparison.comparisons, 45, "selection hand-computed comparisons");
        int[] a8 = src.clone(); SortingComparison.comparisons = 0; SortingComparison.insertion(a8, 10);
        checkEq(SortingComparison.comparisons, 33, "insertion hand-computed comparisons");

        int[] sorted12 = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12};
        int[] b1 = sorted12.clone(); SortingComparison.comparisons = 0; SortingComparison.bubble(b1, 12);
        int cb = SortingComparison.comparisons;
        int[] b2 = sorted12.clone(); SortingComparison.comparisons = 0; SortingComparison.quickSortTop(b2, 12);
        int cq = SortingComparison.comparisons;
        checkEq(cb, 11, "already-sorted bubble comparisons"); checkEq(cq, 66, "already-sorted quick worst-case comparisons");
        check(cb < cq, "bubble beats quick on already-sorted input");

        int[] empty = {}; SortingComparison.comparisons = 0; SortingComparison.bubble(empty, 0);
        checkEq(SortingComparison.comparisons, 0, "empty array comparisons");
        int[] one = {7}; SortingComparison.quickSortTop(one, 1);
        checkEq(one[0], 7, "one element unchanged");

        int[] revWant = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int[] rev1 = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; SortingComparison.bubble(rev1, 10);
        check(arraysEqual(rev1, revWant), "reverse sorted bubble");
        int[] rev2 = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; SortingComparison.selection(rev2, 10);
        check(arraysEqual(rev2, revWant), "reverse sorted selection");
        int[] rev3 = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; SortingComparison.insertion(rev3, 10);
        check(arraysEqual(rev3, revWant), "reverse sorted insertion");
        int[] rev4 = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; SortingComparison.mergeSortTop(rev4, 10);
        check(arraysEqual(rev4, revWant), "reverse sorted mergeSortTop");
        int[] rev5 = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1}; SortingComparison.quickSortTop(rev5, 10);
        check(arraysEqual(rev5, revWant), "reverse sorted quickSortTop");

        int[] eqWant = {4, 4, 4, 4, 4, 4};
        int[] eq1 = {4, 4, 4, 4, 4, 4}; SortingComparison.bubble(eq1, 6);
        check(arraysEqual(eq1, eqWant), "all equal bubble");
        int[] eq2 = {4, 4, 4, 4, 4, 4}; SortingComparison.selection(eq2, 6);
        check(arraysEqual(eq2, eqWant), "all equal selection");
        int[] eq3 = {4, 4, 4, 4, 4, 4}; SortingComparison.insertion(eq3, 6);
        check(arraysEqual(eq3, eqWant), "all equal insertion");
        int[] eq4 = {4, 4, 4, 4, 4, 4}; SortingComparison.mergeSortTop(eq4, 6);
        check(arraysEqual(eq4, eqWant), "all equal mergeSortTop");
        int[] eq5 = {4, 4, 4, 4, 4, 4}; SortingComparison.quickSortTop(eq5, 6);
        check(arraysEqual(eq5, eqWant), "all equal quickSortTop");

        int[] dup = {5, 3, 5, 1, 3, 5, 1, 3, 5}; SortingComparison.selection(dup, 9);
        check(arraysEqual(dup, new int[]{1, 1, 3, 3, 3, 5, 5, 5, 5}), "duplicates sorted");

        int[] extreme = {Integer.MAX_VALUE, 0, Integer.MIN_VALUE, 1, -1}; SortingComparison.mergeSortTop(extreme, 5);
        check(arraysEqual(extreme, new int[]{Integer.MIN_VALUE, -1, 0, 1, Integer.MAX_VALUE}), "extreme values sorted");

        SortingComparison.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
