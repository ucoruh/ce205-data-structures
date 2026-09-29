/* Unit tests for week-04 java/HeapExtract.java, mirroring tests/c/test_heap_extract.c */
public class HeapExtractTest {
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
        for (int i = 1; i < HeapExtract.size; i++) {
            int p = (i - 1) / 2;
            if (HeapExtract.kindIsMax ? (HeapExtract.heap[i] > HeapExtract.heap[p]) : (HeapExtract.heap[i] < HeapExtract.heap[p])) return false;
        }
        return true;
    }

    static int[] remaining;
    static int remainingN;
    static void remainingInit(int[] values) {
        remaining = values.clone();
        remainingN = values.length;
    }
    static int remainingBest() {
        int best = remaining[0];
        for (int i = 1; i < remainingN; i++) if (HeapExtract.kindIsMax ? remaining[i] > best : remaining[i] < best) best = remaining[i];
        return best;
    }
    static void remainingRemoveOne(int v) {
        for (int i = 0; i < remainingN; i++) {
            if (remaining[i] == v) { remaining[i] = remaining[--remainingN]; return; }
        }
    }
    static void runAndCheck(boolean isMax, int[] values, int extracts) {
        HeapExtract.kindIsMax = isMax;
        HeapExtract.heapifyPrepare(values);
        checkEq(HeapExtract.size, values.length, "prepared size");
        check(isValidHeap(), "prepared valid heap");
        remainingInit(values);
        for (int k = 0; k < extracts; k++) {
            int expected = remainingBest();
            int actual = HeapExtract.extract();
            checkEq(actual, expected, "extract " + k);
            remainingRemoveOne(expected);
            checkEq(HeapExtract.size, values.length - k - 1, "size after extract " + k);
            check(isValidHeap(), "valid heap after extract " + k);
        }
    }

    public static void main(String[] args) {
        // -- single element --
        HeapExtract.kindIsMax = false;
        HeapExtract.heapifyPrepare(new int[]{42});
        checkEq(HeapExtract.extract(), 42, "single extract");
        checkEq(HeapExtract.size, 0, "single size after");

        // -- two elements, min-heap --
        HeapExtract.kindIsMax = false;
        HeapExtract.heapifyPrepare(new int[]{9, 3});
        checkEq(HeapExtract.heap[0], 3, "two heap[0]");
        checkEq(HeapExtract.extract(), 3, "two extract 1");
        checkEq(HeapExtract.size, 1, "two size after 1");
        checkEq(HeapExtract.extract(), 9, "two extract 2");
        checkEq(HeapExtract.size, 0, "two size after 2");

        // -- normal: min-heap, 3 extractions from 12 values --
        int[] normal = {15, 7, 22, 3, 18, 9, 30, 1, 25, 12, 20, 6};
        runAndCheck(false, normal, 3);

        // -- hard: max-heap, 5 extractions from 16 values --
        int[] hard = {40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29, 3, 44};
        runAndCheck(true, hard, 5);

        // -- edge: drain fully -- extracted sequence must be sorted ascending --
        int[] drain = {31, 5, 17, 26, 9, 44, 13, 2, 38, 20};
        int[] sortedDrain = drain.clone();
        java.util.Arrays.sort(sortedDrain);
        HeapExtract.kindIsMax = false;
        HeapExtract.heapifyPrepare(drain);
        for (int i = 0; i < 10; i++) checkEq(HeapExtract.extract(), sortedDrain[i], "drain " + i);
        checkEq(HeapExtract.size, 0, "drain final size");

        // -- edge: all duplicates --
        HeapExtract.kindIsMax = false;
        HeapExtract.heapifyPrepare(new int[]{5, 5, 5, 5, 5});
        for (int i = 0; i < 5; i++) {
            checkEq(HeapExtract.extract(), 5, "dup extract " + i);
            check(isValidHeap(), "dup valid heap " + i);
        }
        checkEq(HeapExtract.size, 0, "dup final size");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
