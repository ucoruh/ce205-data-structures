/* Unit tests for week-04 java/InorderStack.java, mirroring tests/c/test_inorder_stack.c */
public class InorderStackTest {
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
        checkEq(InorderStack.visitedCount, n, "count");
        for (int i = 0; i < n && i < InorderStack.visitedCount; i++)
            checkEq(InorderStack.visited[i], expected[i], "element " + i);
    }

    public static void main(String[] args) {
        // -- push/pop/isEmpty mechanics, LIFO order, three items --
        InorderStack.top = -1;
        check(InorderStack.isEmpty(), "fresh stack empty");
        InorderStack.Node a = new InorderStack.Node(1), b = new InorderStack.Node(2), c = new InorderStack.Node(3);
        InorderStack.push(a); checkEq(InorderStack.top, 0, "top after push a"); check(!InorderStack.isEmpty(), "not empty after push");
        InorderStack.push(b); InorderStack.push(c);
        checkEq(InorderStack.top, 2, "top after 3 pushes");
        check(InorderStack.pop() == c, "pop -> c");
        check(InorderStack.pop() == b, "pop -> b");
        checkEq(InorderStack.top, 0, "top after 2 pops");
        check(InorderStack.pop() == a, "pop -> a");
        check(InorderStack.isEmpty(), "empty after draining");

        // -- empty tree --
        InorderStack.runScenario("empty", null);
        checkEq(InorderStack.visitedCount, 0, "empty count");

        // -- single node --
        InorderStack.runScenario("single", new InorderStack.Node(7));
        checkEq(InorderStack.visitedCount, 1, "single count");
        checkEq(InorderStack.visited[0], 7, "single value");

        // -- left-skewed chain: reverse of insertion order --
        int[] leftValues = {88, 81, 74, 67, 60, 53, 46, 39, 32, 25};
        int[] leftExpected = {25, 32, 39, 46, 53, 60, 67, 74, 81, 88};
        InorderStack.runScenario("left chain", InorderStack.buildLeftChain(leftValues));
        checkSequence(leftExpected, 10);

        // -- right-skewed chain: matches insertion order --
        int[] rightValues = {5, 13, 21, 29, 37, 45, 53, 61, 69, 77};
        InorderStack.runScenario("right chain", InorderStack.buildRightChain(rightValues));
        checkSequence(rightValues, 10);

        // -- normal: a valid BST, inorder must be sorted --
        int[] normalArr = {50, 30, 70, 20, 40, 60, 80, 10, InorderStack.SLOT_NONE, InorderStack.SLOT_NONE, 45, 55};
        int[] normalExpected = {10, 20, 30, 40, 45, 50, 55, 60, 70, 80};
        InorderStack.runScenario("normal", InorderStack.buildTree(normalArr, 12, 0));
        checkSequence(normalExpected, 10);

        // -- duplicates --
        int[] dupArr = {7, 7, 7};
        int[] dupExpected = {7, 7, 7};
        InorderStack.runScenario("duplicates", InorderStack.buildTree(dupArr, 3, 0));
        checkSequence(dupExpected, 3);

        // -- extreme values --
        int[] extremeArr = {Integer.MAX_VALUE, 1, -1};
        int[] extremeExpected = {1, Integer.MAX_VALUE, -1};
        InorderStack.runScenario("extreme", InorderStack.buildTree(extremeArr, 3, 0));
        checkSequence(extremeExpected, 3);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
