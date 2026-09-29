/* Unit tests for week-14 java/BTreeInsert.java */
public class BTreeInsertTest {
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
        BTreeInsert.Node n = new BTreeInsert.Node(true);
        BTreeInsert.insertSorted(n, 5);
        BTreeInsert.insertSorted(n, 1);
        BTreeInsert.insertSorted(n, 3);
        checkEq(n.n, 3, "insertSorted count");
        checkEq(n.keys[0], 1, "insertSorted[0]");
        checkEq(n.keys[1], 3, "insertSorted[1]");
        checkEq(n.keys[2], 5, "insertSorted[2]");

        BTreeInsert.Node n2 = new BTreeInsert.Node(true);
        BTreeInsert.insertSorted(n2, 4);
        BTreeInsert.insertSorted(n2, 4);
        checkEq(n2.n, 2, "insertSorted duplicate count");
        checkEq(n2.keys[0], 4, "insertSorted duplicate[0]");
        checkEq(n2.keys[1], 4, "insertSorted duplicate[1]");

        BTreeInsert.Node leaf = new BTreeInsert.Node(true);
        leaf.keys[0] = 10; leaf.keys[1] = 20; leaf.keys[2] = 30; leaf.keys[3] = 40; leaf.n = 4;
        int[] median = new int[1];
        BTreeInsert.Node right = BTreeInsert.split(leaf, median);
        checkEq(median[0], 30, "split median");
        checkEq(leaf.n, 2, "split left count");
        checkEq(leaf.keys[0], 10, "split left[0]");
        checkEq(leaf.keys[1], 20, "split left[1]");
        checkEq(right.n, 1, "split right count");
        checkEq(right.keys[0], 40, "split right[0]");

        BTreeInsert.Node root = new BTreeInsert.Node(true);
        int[] neverKeys = {23, 5, 41, 12, 38, 7, 29, 16, 44, 3};
        for (int k : neverKeys)
            root = BTreeInsert.bTreeInsert(root, 12, k);
        checkEq(BTreeInsert.nodeCount(root), 1, "never-splits node count");
        checkEq(BTreeInsert.treeHeight(root), 0, "never-splits height");
        checkEq(root.n, 10, "never-splits key count");
        for (int i = 1; i < root.n; i++)
            check(root.keys[i - 1] < root.keys[i], "never-splits sorted at " + i);

        root = new BTreeInsert.Node(true);
        for (int i = 1; i <= 14; i++)
            root = BTreeInsert.bTreeInsert(root, 3, i);
        check(BTreeInsert.treeHeight(root) >= 2, "order-3 ascending height >= 2");
        checkEq(BTreeInsert.nodeCount(root), 11, "order-3 ascending node count");

        root = new BTreeInsert.Node(true);
        root = BTreeInsert.bTreeInsert(root, 4, 99);
        check(root.leaf, "single key stays a leaf");
        checkEq(root.n, 1, "single key count");
        checkEq(root.keys[0], 99, "single key value");

        root = new BTreeInsert.Node(true);
        int[] fourKeys = {10, 20, 30, 40};
        for (int k : fourKeys)
            root = BTreeInsert.bTreeInsert(root, 4, k);
        check(!root.leaf, "root split: now internal");
        checkEq(root.n, 1, "root split key count");
        checkEq(root.keys[0], 30, "root split median");
        checkEq(BTreeInsert.nodeCount(root), 3, "root split node count");
        checkEq(BTreeInsert.treeHeight(root), 1, "root split height");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
