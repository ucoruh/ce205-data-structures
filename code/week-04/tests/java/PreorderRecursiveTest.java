/* Unit tests for week-04 java/PreorderRecursive.java, mirroring tests/c/test_preorder_recursive.c */
public class PreorderRecursiveTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static void checkSequence(int[] expected, int n) {
        checkEq(PreorderRecursive.visitedCount, n, "count");
        for (int i = 0; i < n && i < PreorderRecursive.visitedCount; i++)
            checkEq(PreorderRecursive.visited[i], expected[i], "element " + i);
    }

    public static void main(String[] args) {
        // -- empty tree --
        PreorderRecursive.visitedCount = 0;
        PreorderRecursive.preorder(null);
        checkEq(PreorderRecursive.visitedCount, 0, "empty count");

        // -- single node --
        PreorderRecursive.visitedCount = 0;
        PreorderRecursive.Node one = new PreorderRecursive.Node(7);
        PreorderRecursive.preorder(one);
        checkEq(PreorderRecursive.visitedCount, 1, "single count");
        checkEq(PreorderRecursive.visited[0], 7, "single value");

        // -- left-skewed chain: preorder matches insertion order --
        int[] leftValues = {88, 81, 74, 67, 60, 53, 46, 39, 32, 25};
        PreorderRecursive.visitedCount = 0;
        PreorderRecursive.preorder(PreorderRecursive.buildLeftChain(leftValues));
        checkSequence(leftValues, 10);

        // -- right-skewed chain: same reasoning --
        int[] rightValues = {5, 13, 21, 29, 37, 45, 53, 61, 69, 77};
        PreorderRecursive.visitedCount = 0;
        PreorderRecursive.preorder(PreorderRecursive.buildRightChain(rightValues));
        checkSequence(rightValues, 10);

        // -- normal: hand-traced preorder = 50,30,20,10,40,45,70,60,55,80 --
        int[] normalArr = {50, 30, 70, 20, 40, 60, 80, 10, PreorderRecursive.SLOT_NONE, PreorderRecursive.SLOT_NONE, 45, 55};
        int[] normalExpected = {50, 30, 20, 10, 40, 45, 70, 60, 55, 80};
        PreorderRecursive.visitedCount = 0;
        PreorderRecursive.preorder(PreorderRecursive.buildTree(normalArr, 12, 0));
        checkSequence(normalExpected, 10);

        // -- duplicates --
        int[] dupArr = {7, 7, 7};
        int[] dupExpected = {7, 7, 7};
        PreorderRecursive.visitedCount = 0;
        PreorderRecursive.preorder(PreorderRecursive.buildTree(dupArr, 3, 0));
        checkSequence(dupExpected, 3);

        // -- extreme values --
        int[] extremeArr = {Integer.MAX_VALUE, 1, -1};
        int[] extremeExpected = {Integer.MAX_VALUE, 1, -1};
        PreorderRecursive.visitedCount = 0;
        PreorderRecursive.preorder(PreorderRecursive.buildTree(extremeArr, 3, 0));
        checkSequence(extremeExpected, 3);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
