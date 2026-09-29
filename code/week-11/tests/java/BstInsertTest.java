// Unit tests for code/week-11/java/BstInsert.java: bstInsert().
public class BstInsertTest {
    static int checks = 0, failures = 0;

    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }

    static boolean contains(BstInsert.Node n, int key) {
        if (n == null) return false;
        if (n.key == key) return true;
        return key < n.key ? contains(n.left, key) : contains(n.right, key);
    }
    static int countNodes(BstInsert.Node n) { return n == null ? 0 : 1 + countNodes(n.left) + countNodes(n.right); }

    public static void main(String[] args) {
        BstInsert.Node root = null;
        int[] keys = {50, 30, 70, 20, 40, 60, 80};
        for (int k : keys) root = BstInsert.bstInsert(root, k);
        check(contains(root, 50), "contains 50");
        check(contains(root, 20), "contains 20");
        check(contains(root, 80), "contains 80");
        check(!contains(root, 99), "does not contain 99");
        checkEq(countNodes(root), 7, "node count");
        checkEq(BstInsert.height(root), 2, "height");

        root = BstInsert.bstInsert(root, 50);
        checkEq(countNodes(root), 7, "duplicate: node count unchanged");

        BstInsert.Node r2 = null;
        r2 = BstInsert.bstInsert(r2, 5);
        check(r2 != null, "empty tree insert creates root");
        checkEq(r2.key, 5, "root key");
        checkEq(BstInsert.height(r2), 0, "single node height");

        r2 = BstInsert.bstInsert(r2, 5);
        checkEq(countNodes(r2), 1, "one element, duplicate ignored");

        r2 = BstInsert.bstInsert(r2, 3);
        checkEq(countNodes(r2), 2, "two elements");
        check(contains(r2, 3), "contains 3");

        BstInsert.Node r3 = null;
        int[] negs = {0, -5, 10, -10, 5};
        for (int k : negs) r3 = BstInsert.bstInsert(r3, k);
        check(contains(r3, -10), "contains -10");
        check(contains(r3, -5), "contains -5");
        check(!contains(r3, 999), "does not contain 999");
        checkEq(countNodes(r3), 5, "negative-values node count");

        BstInsert.Node r4 = null;
        for (int i = 1; i <= 6; i++) r4 = BstInsert.bstInsert(r4, i);
        checkEq(BstInsert.height(r4), 5, "ascending insert height");
        checkEq(r4.key, 1, "ascending insert root key");
        check(r4.left == null, "ascending insert root has no left child");
        check(r4.right != null, "ascending insert root has a right child");

        BstInsert.Node r5 = null;
        for (int i = 6; i >= 1; i--) r5 = BstInsert.bstInsert(r5, i);
        checkEq(BstInsert.height(r5), 5, "descending insert height");
        check(r5.right == null, "descending insert root has no right child");

        BstInsert.Node r6 = null;
        r6 = BstInsert.bstInsert(r6, Integer.MAX_VALUE);
        r6 = BstInsert.bstInsert(r6, Integer.MIN_VALUE);
        r6 = BstInsert.bstInsert(r6, 0);
        check(contains(r6, Integer.MAX_VALUE), "contains INT_MAX");
        check(contains(r6, Integer.MIN_VALUE), "contains INT_MIN");
        checkEq(countNodes(r6), 3, "extreme-values node count");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
