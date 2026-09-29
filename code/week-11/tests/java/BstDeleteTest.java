// Unit tests for code/week-11/java/BstDelete.java: bstDelete().
public class BstDeleteTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }
    static boolean contains(BstDelete.Node n, int key) {
        if (n == null) return false;
        if (n.key == key) return true;
        return key < n.key ? contains(n.left, key) : contains(n.right, key);
    }
    static int countNodes(BstDelete.Node n) { return n == null ? 0 : 1 + countNodes(n.left) + countNodes(n.right); }
    static boolean isBst(BstDelete.Node n, long lo, long hi) {
        if (n == null) return true;
        if (n.key <= lo || n.key >= hi) return false;
        return isBst(n.left, lo, n.key) && isBst(n.right, n.key, hi);
    }

    public static void main(String[] args) {
        BstDelete.Node root = null;
        int[] keys = {50, 30, 70, 20, 40, 60, 80, 35, 65, 90};
        for (int k : keys) root = BstDelete.bstBuildInsert(root, k);

        root = BstDelete.bstDelete(root, 35);
        check(!contains(root, 35), "leaf delete removed 35");
        checkEq(countNodes(root), 9, "count after leaf delete");
        check(isBst(root, Long.MIN_VALUE, Long.MAX_VALUE), "still a valid BST after leaf delete");

        root = BstDelete.bstDelete(root, 70);
        check(!contains(root, 70), "two-children delete removed 70");
        check(contains(root, 80), "successor 80 still present");
        check(contains(root, 60), "60 still present");
        checkEq(countNodes(root), 8, "count after two-children delete");
        check(isBst(root, Long.MIN_VALUE, Long.MAX_VALUE), "still a valid BST after two-children delete");

        root = BstDelete.bstDelete(root, 20);
        check(!contains(root, 20), "second leaf delete removed 20");
        checkEq(countNodes(root), 7, "count after second leaf delete");
        check(isBst(root, Long.MIN_VALUE, Long.MAX_VALUE), "still a valid BST after second leaf delete");

        BstDelete.Node oc = null;
        int[] ock = {10, 5, 15, 3};
        for (int k : ock) oc = BstDelete.bstBuildInsert(oc, k);
        oc = BstDelete.bstDelete(oc, 5);
        check(!contains(oc, 5), "one-child delete removed 5");
        check(contains(oc, 3), "one-child delete kept child 3");
        checkEq(countNodes(oc), 3, "count after one-child delete");
        check(isBst(oc, Long.MIN_VALUE, Long.MAX_VALUE), "still a valid BST after one-child delete");

        int before = countNodes(root);
        root = BstDelete.bstDelete(root, 999);
        checkEq(countNodes(root), before, "deleting a missing key is a no-op");

        BstDelete.Node empty = null;
        empty = BstDelete.bstDelete(empty, 5);
        check(empty == null, "deleting from an empty tree stays empty");

        BstDelete.Node single = null;
        single = BstDelete.bstBuildInsert(single, 7);
        single = BstDelete.bstDelete(single, 7);
        check(single == null, "deleting the only node empties the tree");

        BstDelete.Node two = null;
        two = BstDelete.bstBuildInsert(two, 10);
        two = BstDelete.bstBuildInsert(two, 5);
        two = BstDelete.bstDelete(two, 5);
        check(two != null, "two elements: one remains");
        checkEq(two.key, 10, "remaining key is 10");
        two = BstDelete.bstDelete(two, 10);
        check(two == null, "two elements: both deleted -> empty");

        BstDelete.Node all = null;
        int[] akeys = {5, 3, 8, 1, 4, 7, 9, 2, 6, 10};
        for (int k : akeys) all = BstDelete.bstBuildInsert(all, k);
        for (int k : akeys) {
            all = BstDelete.bstDelete(all, k);
            check(isBst(all, Long.MIN_VALUE, Long.MAX_VALUE), "valid BST while deleting all keys");
        }
        check(all == null, "deleting every key empties the tree");

        BstDelete.Node neg = null;
        int[] nk = {0, -5, 10, -10, 5, -5};
        for (int k : nk) neg = BstDelete.bstBuildInsert(neg, k);
        neg = BstDelete.bstDelete(neg, -10);
        check(!contains(neg, -10), "negative value deleted");
        checkEq(countNodes(neg), 4, "count after negative-value delete");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
