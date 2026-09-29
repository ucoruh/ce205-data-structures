/* Unit tests for week-04 java/BuildHeap.java, mirroring tests/c/test_build_heap.c */
public class BuildHeapTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static boolean isValidHeapOf(int[] a, int cnt) {
        for (int i = 1; i < cnt; i++) {
            int p = (i - 1) / 2;
            if (BuildHeap.kindIsMax ? (a[i] > a[p]) : (a[i] < a[p])) return false;
        }
        return true;
    }
    static boolean multisetMatches(int[] a, int[] expected, int cnt) {
        int[] sa = java.util.Arrays.copyOf(a, cnt), se = java.util.Arrays.copyOf(expected, cnt);
        java.util.Arrays.sort(sa);
        java.util.Arrays.sort(se);
        return java.util.Arrays.equals(sa, se);
    }

    public static void main(String[] args) {
        // -- empty array --
        int[] emptyArr = new int[1];
        BuildHeap.kindIsMax = true;
        BuildHeap.buildHeap(emptyArr, 0);
        check(true, "empty build_heap does not crash");

        // -- single element --
        int[] one = { 77 };
        BuildHeap.kindIsMax = false;
        BuildHeap.buildHeap(one, 1);
        checkEq(one[0], 77, "single root");
        check(isValidHeapOf(one, 1), "single valid heap");

        // -- two elements --
        int[] two = { 3, 9 };
        BuildHeap.kindIsMax = true;
        BuildHeap.buildHeap(two, 2);
        checkEq(two[0], 9, "two root");
        check(isValidHeapOf(two, 2), "two valid heap");

        // -- normal: max-heap, 10 values in arbitrary order --
        int[] normal = {4, 1, 3, 2, 16, 9, 10, 14, 8, 7};
        int[] normalOrig = normal.clone();
        BuildHeap.kindIsMax = true;
        BuildHeap.buildHeap(normal, 10);
        checkEq(normal[0], 16, "normal root");
        check(isValidHeapOf(normal, 10), "normal valid heap");
        check(multisetMatches(normal, normalOrig, 10), "normal multiset preserved");

        // -- hard: min-heap, 14 values in REVERSE order --
        int[] hard = {14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
        int[] hardOrig = hard.clone();
        BuildHeap.kindIsMax = false;
        BuildHeap.buildHeap(hard, 14);
        checkEq(hard[0], 1, "hard root");
        check(isValidHeapOf(hard, 14), "hard valid heap");
        check(multisetMatches(hard, hardOrig, 14), "hard multiset preserved");

        // -- edge: input already a valid max-heap --
        int[] alreadyHeap = {30, 25, 22, 18, 20, 9, 12, 1, 3, 7, 15};
        int[] alreadyOrig = alreadyHeap.clone();
        BuildHeap.kindIsMax = true;
        BuildHeap.buildHeap(alreadyHeap, 11);
        checkEq(alreadyHeap[0], 30, "already-heap root");
        check(isValidHeapOf(alreadyHeap, 11), "already-heap valid heap");
        check(multisetMatches(alreadyHeap, alreadyOrig, 11), "already-heap multiset preserved");

        // -- edge: already sorted ascending, built as a min-heap --
        int[] ascending = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int[] ascendingOrig = ascending.clone();
        BuildHeap.kindIsMax = false;
        BuildHeap.buildHeap(ascending, 10);
        checkEq(ascending[0], 1, "ascending root");
        check(isValidHeapOf(ascending, 10), "ascending valid heap");
        check(multisetMatches(ascending, ascendingOrig, 10), "ascending multiset preserved");

        // -- edge: all duplicates --
        int[] dup = {6, 6, 6, 6, 6, 6};
        BuildHeap.kindIsMax = true;
        BuildHeap.buildHeap(dup, 6);
        checkEq(dup[0], 6, "dup root");
        check(isValidHeapOf(dup, 6), "dup valid heap");
        for (int i = 0; i < 6; i++) checkEq(dup[i], 6, "dup element " + i);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
