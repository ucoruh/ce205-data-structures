/* Unit tests for week-10 java/RadixSortLsd.java */
public class RadixSortLsdTest {
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
        checkEq(RadixSortLsd.getDigit(329, 1), 9, "digit ones");
        checkEq(RadixSortLsd.getDigit(329, 10), 2, "digit tens");
        checkEq(RadixSortLsd.getDigit(329, 100), 3, "digit hundreds");
        checkEq(RadixSortLsd.getDigit(5, 10), 0, "digit beyond value is 0");

        int[] aEmpty = {}; int writesEmpty = RadixSortLsd.radixSortLsd(aEmpty, 0);
        checkEq(writesEmpty, 0, "empty array writes");

        int[] a0 = {7}; RadixSortLsd.radixSortLsd(a0, 1);
        checkEq(a0[0], 7, "one element");

        int[] a1 = {1, 2}; RadixSortLsd.radixSortLsd(a1, 2);
        check(arraysEqual(a1, new int[]{1, 2}), "two ordered");

        int[] a2 = {20, 3}; RadixSortLsd.radixSortLsd(a2, 2);
        check(arraysEqual(a2, new int[]{3, 20}), "two unordered");

        int[] a3 = {329, 457, 657, 839, 436, 720, 355, 21, 8, 100}; RadixSortLsd.radixSortLsd(a3, 10);
        check(arraysEqual(a3, new int[]{8, 21, 100, 329, 355, 436, 457, 657, 720, 839}), "normal sorted");

        int[] a4 = {1, 12, 23, 34, 45, 56, 67, 78, 89, 90}; RadixSortLsd.radixSortLsd(a4, 10);
        check(arraysEqual(a4, new int[]{1, 12, 23, 34, 45, 56, 67, 78, 89, 90}), "already sorted stays sorted");

        int[] a5 = {90, 89, 78, 67, 56, 45, 34, 23, 12, 1}; RadixSortLsd.radixSortLsd(a5, 10);
        check(arraysEqual(a5, new int[]{1, 12, 23, 34, 45, 56, 67, 78, 89, 90}), "reverse sorted result");

        int[] a6 = {4, 2, 9, 1, 7, 3, 8, 0, 6, 5}; int w6 = RadixSortLsd.radixSortLsd(a6, 10);
        check(arraysEqual(a6, new int[]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}), "single-digit sorted"); checkEq(w6, 20, "single-digit writes");

        int[] a7 = {77, 77, 77, 77}; RadixSortLsd.radixSortLsd(a7, 4);
        check(arraysEqual(a7, new int[]{77, 77, 77, 77}), "all same value sorted");

        int[] a8 = {5, 45, 802, 3, 66, 913, 27, 8, 150, 999}; RadixSortLsd.radixSortLsd(a8, 10);
        check(arraysEqual(a8, new int[]{3, 5, 8, 27, 45, 66, 150, 802, 913, 999}), "mixed digit lengths sorted");

        int[] a9 = {0, 100, 0, 50}; RadixSortLsd.radixSortLsd(a9, 4);
        check(arraysEqual(a9, new int[]{0, 0, 50, 100}), "zero handled correctly");

        int[] a10 = {9999, 1, 5000, 2500, 100}; RadixSortLsd.radixSortLsd(a10, 5);
        check(arraysEqual(a10, new int[]{1, 100, 2500, 5000, 9999}), "4-digit values sorted");

        RadixSortLsd.main(new String[0]);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
