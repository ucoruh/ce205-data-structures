// Unit tests for code/week-11/java/SegmentTree.java: build(), query().
public class SegmentTreeTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }
    static long brute(int[] arr, int l, int r) {
        long s = 0;
        for (int i = l; i <= r; i++) s += arr[i];
        return s;
    }

    public static void main(String[] args) {
        int[] a = {5, 3, 8, 2, 9, 1, 7, 4, 6, 10};
        SegmentTree.build(1, 0, 9, a);
        checkEq(SegmentTree.query(1, 0, 9, 0, 9), brute(a, 0, 9), "full range");
        checkEq(SegmentTree.query(1, 0, 9, 2, 5), brute(a, 2, 5), "partial range");
        checkEq(SegmentTree.query(1, 0, 9, 7, 7), a[7], "single point");
        checkEq(SegmentTree.query(1, 0, 9, 0, 0), a[0], "first element");
        checkEq(SegmentTree.query(1, 0, 9, 9, 9), a[9], "last element");

        int[] b = {4, -7, 12, 3, -2, 9, -5, 8, 1, -3, 6, 0, -9, 11};
        SegmentTree.build(1, 0, 13, b);
        checkEq(SegmentTree.query(1, 0, 13, 0, 13), brute(b, 0, 13), "negative values full range");
        checkEq(SegmentTree.query(1, 0, 13, 3, 8), brute(b, 3, 8), "negative values partial range");
        checkEq(SegmentTree.query(1, 0, 13, 6, 6), b[6], "negative values single point");

        int[] c = {5, 5, 5, 5, 5, 5, 5, 5, 5, 5};
        SegmentTree.build(1, 0, 9, c);
        checkEq(SegmentTree.query(1, 0, 9, 0, 9), 50, "all-equal full range");
        checkEq(SegmentTree.query(1, 0, 9, 3, 3), 5, "all-equal single point");

        int[] single = {42};
        SegmentTree.build(1, 0, 0, single);
        checkEq(SegmentTree.query(1, 0, 0, 0, 0), 42, "single-element array");

        int[] two = {10, -3};
        SegmentTree.build(1, 0, 1, two);
        checkEq(SegmentTree.query(1, 0, 1, 0, 1), 7, "two-element array full range");
        checkEq(SegmentTree.query(1, 0, 1, 0, 0), 10, "two-element array first");
        checkEq(SegmentTree.query(1, 0, 1, 1, 1), -3, "two-element array second");

        int[] ext = {2147483647, -2147483647, 0, 100000, -100000, 1, -1, 2, -2, 3};
        SegmentTree.build(1, 0, 9, ext);
        checkEq(SegmentTree.query(1, 0, 9, 0, 1), 0, "extreme values near-cancel");
        checkEq(SegmentTree.query(1, 0, 9, 0, 9), brute(ext, 0, 9), "extreme values full range");
        checkEq(SegmentTree.query(1, 0, 9, 2, 9), brute(ext, 2, 9), "extreme values partial range A");
        checkEq(SegmentTree.query(1, 0, 9, 5, 9), brute(ext, 5, 9), "extreme values partial range B");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
