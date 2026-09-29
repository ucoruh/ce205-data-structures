/* Unit tests for week-04 java/DaryHeapExtract.java, mirroring tests/c/test_dary_heap_extract.c */
public class DaryHeapExtractTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static boolean isValidDaryHeap() {
        for (int i = 1; i < DaryHeapExtract.size; i++) {
            int p = (i - 1) / DaryHeapExtract.d;
            if (DaryHeapExtract.kindIsMax ? (DaryHeapExtract.heap[i] > DaryHeapExtract.heap[p]) : (DaryHeapExtract.heap[i] < DaryHeapExtract.heap[p])) return false;
        }
        return true;
    }

    static int[] remaining;
    static int remainingN;
    static void remainingInit(int[] values) { remaining = values.clone(); remainingN = values.length; }
    static int remainingBest() {
        int best = remaining[0];
        for (int i = 1; i < remainingN; i++) if (DaryHeapExtract.kindIsMax ? remaining[i] > best : remaining[i] < best) best = remaining[i];
        return best;
    }
    static void remainingRemoveOne(int v) {
        for (int i = 0; i < remainingN; i++) if (remaining[i] == v) { remaining[i] = remaining[--remainingN]; return; }
    }
    static void runAndCheck(int dVal, boolean isMax, int[] values, int extracts) {
        DaryHeapExtract.d = dVal;
        DaryHeapExtract.kindIsMax = isMax;
        DaryHeapExtract.heapifyPrepare(values);
        checkEq(DaryHeapExtract.size, values.length, "prepared size");
        check(isValidDaryHeap(), "prepared valid heap");
        remainingInit(values);
        for (int k = 0; k < extracts; k++) {
            int expected = remainingBest();
            int actual = DaryHeapExtract.extract();
            checkEq(actual, expected, "extract " + k);
            remainingRemoveOne(expected);
            checkEq(DaryHeapExtract.size, values.length - k - 1, "size after extract " + k);
            check(isValidDaryHeap(), "valid heap after extract " + k);
        }
    }

    public static void main(String[] args) {
        // -- single element, D=3 --
        DaryHeapExtract.d = 3; DaryHeapExtract.kindIsMax = false;
        DaryHeapExtract.heapifyPrepare(new int[]{42});
        checkEq(DaryHeapExtract.extract(), 42, "single extract");
        checkEq(DaryHeapExtract.size, 0, "single size after");

        // -- D=3, 4 elements, min-heap --
        DaryHeapExtract.d = 3; DaryHeapExtract.kindIsMax = false;
        DaryHeapExtract.heapifyPrepare(new int[]{9, 3, 7, 5});
        checkEq(DaryHeapExtract.heap[0], 3, "four heap[0]");
        check(isValidDaryHeap(), "four valid heap");

        // -- normal: D=3, min-heap, 3 extractions from 12 values --
        int[] normal = {15, 7, 22, 3, 18, 9, 30, 1, 25, 12, 20, 6};
        runAndCheck(3, false, normal, 3);

        // -- hard: D=4, max-heap, 5 extractions from 16 values --
        int[] hard = {40, 11, 27, 8, 33, 16, 45, 2, 19, 37, 24, 6, 50, 29, 3, 44};
        runAndCheck(4, true, hard, 5);

        // -- edge: D=3, drain fully -- ascending order expected --
        int[] drain = {31, 5, 17, 26, 9, 44, 13, 2, 38, 20};
        int[] sortedDrain = drain.clone();
        java.util.Arrays.sort(sortedDrain);
        DaryHeapExtract.d = 3; DaryHeapExtract.kindIsMax = false;
        DaryHeapExtract.heapifyPrepare(drain);
        for (int i = 0; i < 10; i++) checkEq(DaryHeapExtract.extract(), sortedDrain[i], "drain " + i);
        checkEq(DaryHeapExtract.size, 0, "drain final size");

        // -- edge: D=4, all duplicates --
        DaryHeapExtract.d = 4; DaryHeapExtract.kindIsMax = false;
        DaryHeapExtract.heapifyPrepare(new int[]{5, 5, 5, 5, 5});
        for (int i = 0; i < 5; i++) {
            checkEq(DaryHeapExtract.extract(), 5, "dup extract " + i);
            check(isValidDaryHeap(), "dup valid heap " + i);
        }
        checkEq(DaryHeapExtract.size, 0, "dup final size");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
