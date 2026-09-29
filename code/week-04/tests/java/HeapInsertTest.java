/* Unit tests for week-04 java/HeapInsert.java, mirroring tests/c/test_heap_insert.c */
public class HeapInsertTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static boolean isValidHeap() {
        for (int i = 1; i < HeapInsert.size; i++) {
            int p = (i - 1) / 2;
            if (HeapInsert.kindIsMax ? (HeapInsert.heap[i] > HeapInsert.heap[p]) : (HeapInsert.heap[i] < HeapInsert.heap[p])) return false;
        }
        return true;
    }
    static boolean multisetMatches(int[] expected, int n) {
        int[] sortedHeap = new int[n], sortedExp = new int[n];
        for (int i = 0; i < n; i++) { sortedHeap[i] = HeapInsert.heap[i]; sortedExp[i] = expected[i]; }
        java.util.Arrays.sort(sortedHeap);
        java.util.Arrays.sort(sortedExp);
        return java.util.Arrays.equals(sortedHeap, sortedExp);
    }

    public static void main(String[] args) {
        // -- normal: min-heap, track the running minimum by hand after every single insert --
        int[] normal = {15, 7, 22, 3, 18, 9, 30, 1, 25, 12};
        int[] runningMin = {15, 7, 7, 3, 3, 3, 3, 1, 1, 1};
        HeapInsert.size = 0; HeapInsert.kindIsMax = false;
        for (int i = 0; i < 10; i++) {
            HeapInsert.insert(normal[i]);
            checkEq(HeapInsert.size, i + 1, "size after insert " + i);
            checkEq(HeapInsert.heap[0], runningMin[i], "root after insert " + i);
            check(isValidHeap(), "valid heap after insert " + i);
        }
        check(multisetMatches(normal, 10), "normal multiset preserved");

        // -- single insert into a fresh heap --
        HeapInsert.size = 0; HeapInsert.kindIsMax = true;
        HeapInsert.insert(99);
        checkEq(HeapInsert.size, 1, "single size");
        checkEq(HeapInsert.heap[0], 99, "single root");

        // -- small hand-traced max-heap: insert 1, 2, 3 --
        HeapInsert.size = 0; HeapInsert.kindIsMax = true;
        HeapInsert.insert(1); HeapInsert.insert(2); HeapInsert.insert(3);
        checkEq(HeapInsert.heap[0], 3, "trace heap[0]");
        checkEq(HeapInsert.heap[1], 1, "trace heap[1]");
        checkEq(HeapInsert.heap[2], 2, "trace heap[2]");
        check(isValidHeap(), "trace valid heap");

        // -- hard: max-heap, 14 ascending values --
        int[] hard = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
        HeapInsert.size = 0; HeapInsert.kindIsMax = true;
        for (int v : hard) HeapInsert.insert(v);
        checkEq(HeapInsert.size, 14, "hard size");
        checkEq(HeapInsert.heap[0], 14, "hard root");
        check(isValidHeap(), "hard valid heap");
        check(multisetMatches(hard, 14), "hard multiset preserved");

        // -- edge: all equal values --
        int[] allEqual = {7, 7, 7, 7, 7, 7, 7, 7, 7, 7};
        HeapInsert.size = 0; HeapInsert.kindIsMax = false;
        for (int v : allEqual) HeapInsert.insert(v);
        checkEq(HeapInsert.size, 10, "all-equal size");
        checkEq(HeapInsert.heap[0], 7, "all-equal root");
        check(isValidHeap(), "all-equal valid heap");
        for (int i = 0; i < 10; i++) checkEq(HeapInsert.heap[i], 7, "all-equal element " + i);

        // -- edge: extreme values, min-heap --
        int[] extreme = {2147483647, -2147483648, 0, 1000000, -1000000, 5, -5, 2147483646, -2147483647, 1, -1};
        HeapInsert.size = 0; HeapInsert.kindIsMax = false;
        for (int v : extreme) HeapInsert.insert(v);
        checkEq(HeapInsert.size, 11, "extreme size");
        checkEq(HeapInsert.heap[0], -2147483648, "extreme root");
        check(isValidHeap(), "extreme valid heap");
        check(multisetMatches(extreme, 11), "extreme multiset preserved");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
