/* Unit tests for week-04 java/PostorderRecursive.java, mirroring tests/c/test_postorder_recursive.c */
public class PostorderRecursiveTest {
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
        checkEq(PostorderRecursive.visitedCount, n, "count");
        for (int i = 0; i < n && i < PostorderRecursive.visitedCount; i++)
            checkEq(PostorderRecursive.visited[i], expected[i], "element " + i);
    }

    public static void main(String[] args) {
        // -- empty tree --
        PostorderRecursive.visitedCount = 0;
        PostorderRecursive.postorder(null);
        checkEq(PostorderRecursive.visitedCount, 0, "empty count");

        // -- single node --
        PostorderRecursive.visitedCount = 0;
        PostorderRecursive.Node one = new PostorderRecursive.Node(7);
        PostorderRecursive.postorder(one);
        checkEq(PostorderRecursive.visitedCount, 1, "single count");
        checkEq(PostorderRecursive.visited[0], 7, "single value");

        // -- left-skewed chain: reverse of insertion order --
        int[] leftValues = {88, 81, 74, 67, 60, 53, 46, 39, 32, 25};
        int[] leftExpected = {25, 32, 39, 46, 53, 60, 67, 74, 81, 88};
        PostorderRecursive.visitedCount = 0;
        PostorderRecursive.postorder(PostorderRecursive.buildLeftChain(leftValues));
        checkSequence(leftExpected, 10);

        // -- right-skewed chain: reverse of insertion order --
        int[] rightValues = {5, 13, 21, 29, 37, 45, 53, 61, 69, 77};
        int[] rightExpected = {77, 69, 61, 53, 45, 37, 29, 21, 13, 5};
        PostorderRecursive.visitedCount = 0;
        PostorderRecursive.postorder(PostorderRecursive.buildRightChain(rightValues));
        checkSequence(rightExpected, 10);

        // -- normal: hand-traced postorder = 10,20,45,40,30, 55,60,80,70, 50 --
        int[] normalArr = {50, 30, 70, 20, 40, 60, 80, 10, PostorderRecursive.SLOT_NONE, PostorderRecursive.SLOT_NONE, 45, 55};
        int[] normalExpected = {10, 20, 45, 40, 30, 55, 60, 80, 70, 50};
        PostorderRecursive.visitedCount = 0;
        PostorderRecursive.postorder(PostorderRecursive.buildTree(normalArr, 12, 0));
        checkSequence(normalExpected, 10);

        // -- duplicates --
        int[] dupArr = {7, 7, 7};
        int[] dupExpected = {7, 7, 7};
        PostorderRecursive.visitedCount = 0;
        PostorderRecursive.postorder(PostorderRecursive.buildTree(dupArr, 3, 0));
        checkSequence(dupExpected, 3);

        // -- extreme values: root = MAX, left = 1, right = -1 -> postorder = 1, -1, MAX --
        int[] extremeArr = {Integer.MAX_VALUE, 1, -1};
        int[] extremeExpected = {1, -1, Integer.MAX_VALUE};
        PostorderRecursive.visitedCount = 0;
        PostorderRecursive.postorder(PostorderRecursive.buildTree(extremeArr, 3, 0));
        checkSequence(extremeExpected, 3);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
