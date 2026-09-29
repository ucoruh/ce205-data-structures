/* Unit tests for week-04 java/InorderRecursive.java, mirroring tests/c/test_inorder_recursive.c */
public class InorderRecursiveTest {
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
        checkEq(InorderRecursive.visitedCount, n, "count");
        for (int i = 0; i < n && i < InorderRecursive.visitedCount; i++)
            checkEq(InorderRecursive.visited[i], expected[i], "element " + i);
    }

    public static void main(String[] args) {
        // -- empty tree --
        InorderRecursive.visitedCount = 0;
        InorderRecursive.inorder(null);
        checkEq(InorderRecursive.visitedCount, 0, "empty count");

        // -- single node --
        InorderRecursive.visitedCount = 0;
        InorderRecursive.Node one = new InorderRecursive.Node(7);
        InorderRecursive.inorder(one);
        checkEq(InorderRecursive.visitedCount, 1, "single count");
        checkEq(InorderRecursive.visited[0], 7, "single value");

        // -- left-skewed chain: reverse of insertion order --
        int[] leftValues = {88, 81, 74, 67, 60, 53, 46, 39, 32, 25};
        int[] leftExpected = {25, 32, 39, 46, 53, 60, 67, 74, 81, 88};
        InorderRecursive.visitedCount = 0;
        InorderRecursive.inorder(InorderRecursive.buildLeftChain(leftValues));
        checkSequence(leftExpected, 10);

        // -- right-skewed chain: matches insertion order --
        int[] rightValues = {5, 13, 21, 29, 37, 45, 53, 61, 69, 77};
        InorderRecursive.visitedCount = 0;
        InorderRecursive.inorder(InorderRecursive.buildRightChain(rightValues));
        checkSequence(rightValues, 10);

        // -- normal: a valid BST, inorder must be sorted --
        int[] normalArr = {50, 30, 70, 20, 40, 60, 80, 10, InorderRecursive.SLOT_NONE, InorderRecursive.SLOT_NONE, 45, 55};
        int[] normalExpected = {10, 20, 30, 40, 45, 50, 55, 60, 70, 80};
        InorderRecursive.visitedCount = 0;
        InorderRecursive.inorder(InorderRecursive.buildTree(normalArr, 12, 0));
        checkSequence(normalExpected, 10);

        // -- duplicates --
        int[] dupArr = {7, 7, 7};
        int[] dupExpected = {7, 7, 7};
        InorderRecursive.visitedCount = 0;
        InorderRecursive.inorder(InorderRecursive.buildTree(dupArr, 3, 0));
        checkSequence(dupExpected, 3);

        // -- extreme values: root = MAX, left = 1, right = -1 -> inorder = 1, MAX, -1 --
        int[] extremeArr = {Integer.MAX_VALUE, 1, -1};
        int[] extremeExpected = {1, Integer.MAX_VALUE, -1};
        InorderRecursive.visitedCount = 0;
        InorderRecursive.inorder(InorderRecursive.buildTree(extremeArr, 3, 0));
        checkSequence(extremeExpected, 3);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
