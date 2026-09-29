/* Unit tests for week-04 java/LevelorderQueue.java, mirroring tests/c/test_levelorder_queue.c */
public class LevelorderQueueTest {
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
        checkEq(LevelorderQueue.visitedCount, n, "count");
        for (int i = 0; i < n && i < LevelorderQueue.visitedCount; i++)
            checkEq(LevelorderQueue.visited[i], expected[i], "element " + i);
    }

    public static void main(String[] args) {
        // -- enqueue/dequeue/isEmpty mechanics, FIFO order, three items --
        LevelorderQueue.front = 0; LevelorderQueue.rear = -1; LevelorderQueue.count = 0;
        check(LevelorderQueue.isEmpty(), "fresh queue empty");
        LevelorderQueue.Node a = new LevelorderQueue.Node(1), b = new LevelorderQueue.Node(2), c = new LevelorderQueue.Node(3);
        LevelorderQueue.enqueue(a); checkEq(LevelorderQueue.count, 1, "count after enqueue a"); check(!LevelorderQueue.isEmpty(), "not empty");
        LevelorderQueue.enqueue(b); LevelorderQueue.enqueue(c);
        checkEq(LevelorderQueue.count, 3, "count after 3 enqueues");
        check(LevelorderQueue.dequeue() == a, "dequeue -> a");
        check(LevelorderQueue.dequeue() == b, "dequeue -> b");
        checkEq(LevelorderQueue.count, 1, "count after 2 dequeues");
        check(LevelorderQueue.dequeue() == c, "dequeue -> c");
        check(LevelorderQueue.isEmpty(), "empty after draining");

        // -- empty tree --
        LevelorderQueue.runScenario("empty", null);
        checkEq(LevelorderQueue.visitedCount, 0, "empty count");

        // -- single node --
        LevelorderQueue.runScenario("single", new LevelorderQueue.Node(7));
        checkEq(LevelorderQueue.visitedCount, 1, "single count");
        checkEq(LevelorderQueue.visited[0], 7, "single value");

        // -- left-skewed chain: level order == insertion order --
        int[] leftValues = {88, 81, 74, 67, 60, 53, 46, 39, 32, 25};
        LevelorderQueue.runScenario("left chain", LevelorderQueue.buildLeftChain(leftValues));
        checkSequence(leftValues, 10);

        // -- right-skewed chain: same reasoning --
        int[] rightValues = {5, 13, 21, 29, 37, 45, 53, 61, 69, 77};
        LevelorderQueue.runScenario("right chain", LevelorderQueue.buildRightChain(rightValues));
        checkSequence(rightValues, 10);

        // -- normal: expected sequence is the array with the two SLOT_NONE entries removed --
        int[] normalArr = {50, 30, 70, 20, 40, 60, 80, 10, LevelorderQueue.SLOT_NONE, LevelorderQueue.SLOT_NONE, 45, 55};
        int[] normalExpected = {50, 30, 70, 20, 40, 60, 80, 10, 45, 55};
        LevelorderQueue.runScenario("normal", LevelorderQueue.buildTree(normalArr, 12, 0));
        checkSequence(normalExpected, 10);

        // -- duplicates --
        int[] dupArr = {7, 7, 7};
        int[] dupExpected = {7, 7, 7};
        LevelorderQueue.runScenario("duplicates", LevelorderQueue.buildTree(dupArr, 3, 0));
        checkSequence(dupExpected, 3);

        // -- extreme values --
        int[] extremeArr = {Integer.MAX_VALUE, 1, -1};
        LevelorderQueue.runScenario("extreme", LevelorderQueue.buildTree(extremeArr, 3, 0));
        checkSequence(extremeArr, 3);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
