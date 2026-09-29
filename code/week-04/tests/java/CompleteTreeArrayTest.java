/* Unit tests for week-04 java/CompleteTreeArray.java, mirroring tests/c/test_complete_tree_array.c */
public class CompleteTreeArrayTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        // -- parent/left/right index formulas --
        checkEq(CompleteTreeArray.parent(0), 0, "parent(0)");   // (0-1)/2 truncates toward zero: -1/2 == 0
        checkEq(CompleteTreeArray.parent(1), 0, "parent(1)");
        checkEq(CompleteTreeArray.parent(2), 0, "parent(2)");
        checkEq(CompleteTreeArray.parent(3), 1, "parent(3)");
        checkEq(CompleteTreeArray.parent(4), 1, "parent(4)");
        checkEq(CompleteTreeArray.parent(11), 5, "parent(11)");
        checkEq(CompleteTreeArray.left(0), 1, "left(0)");
        checkEq(CompleteTreeArray.right(0), 2, "right(0)");
        checkEq(CompleteTreeArray.left(5), 11, "left(5)");
        checkEq(CompleteTreeArray.right(5), 12, "right(5)");
        checkEq(CompleteTreeArray.left(11), 23, "left(11)");

        // -- empty array: 0 real nodes, vacuously complete --
        int[] emptyArr = { CompleteTreeArray.EMPTY, CompleteTreeArray.EMPTY, CompleteTreeArray.EMPTY };
        checkEq(CompleteTreeArray.lastRealIndex(emptyArr, 3), -1, "empty last real");
        checkEq(CompleteTreeArray.countReal(emptyArr, 3), 0, "empty count");
        check(CompleteTreeArray.isComplete(emptyArr, 3, -1) == true, "empty complete");

        // -- single real node --
        int[] singleArr = { 5 };
        checkEq(CompleteTreeArray.lastRealIndex(singleArr, 1), 0, "single last real");
        checkEq(CompleteTreeArray.countReal(singleArr, 1), 1, "single count");
        check(CompleteTreeArray.isComplete(singleArr, 1, 0) == true, "single complete");

        // -- normal: 12 nodes, no gaps -- complete --
        int[] normalArr = {8, 4, 15, 2, 6, 11, 20, 1, 3, 5, 7, 9};
        checkEq(CompleteTreeArray.lastRealIndex(normalArr, 12), 11, "normal last real");
        checkEq(CompleteTreeArray.countReal(normalArr, 12), 12, "normal count");
        check(CompleteTreeArray.isComplete(normalArr, 12, 11) == true, "normal complete");

        // -- hard: 19 nodes, no gaps -- complete --
        int[] hardArr = {
            50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85, 5, 15, 22, 28
        };
        checkEq(CompleteTreeArray.lastRealIndex(hardArr, 19), 18, "hard last real");
        checkEq(CompleteTreeArray.countReal(hardArr, 19), 19, "hard count");
        check(CompleteTreeArray.isComplete(hardArr, 19, 18) == true, "hard complete");

        // -- edge: NOT complete -- gap at index 9-10, index 11 filled --
        int[] gapArr = {9, 4, 12, 2, 6, 10, 15, 1, 3, CompleteTreeArray.EMPTY, CompleteTreeArray.EMPTY, 7};
        checkEq(CompleteTreeArray.lastRealIndex(gapArr, 12), 11, "gap last real");
        checkEq(CompleteTreeArray.countReal(gapArr, 12), 10, "gap count");
        check(CompleteTreeArray.isComplete(gapArr, 12, 11) == false, "gap complete");

        // -- edge: gap right at the start -- not complete --
        int[] gapAtStart = { CompleteTreeArray.EMPTY, 5 };
        checkEq(CompleteTreeArray.lastRealIndex(gapAtStart, 2), 1, "gap-start last real");
        checkEq(CompleteTreeArray.countReal(gapAtStart, 2), 1, "gap-start count");
        check(CompleteTreeArray.isComplete(gapAtStart, 2, 1) == false, "gap-start complete");

        // -- duplicates --
        int[] dupArr = { 7, 7, 7, 7 };
        checkEq(CompleteTreeArray.countReal(dupArr, 4), 4, "dup count");
        check(CompleteTreeArray.isComplete(dupArr, 4, 3) == true, "dup complete");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
