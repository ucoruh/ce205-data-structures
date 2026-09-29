// Unit tests for code/week-11/java/RedBlackInsert.java: insert(), fixup().
public class RedBlackInsertTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }
    static int countNodes(RedBlackInsert.Node n) { return n == null ? 0 : 1 + countNodes(n.left) + countNodes(n.right); }
    static boolean contains(RedBlackInsert.Node n, int key) {
        if (n == null) return false;
        if (n.key == key) return true;
        return key < n.key ? contains(n.left, key) : contains(n.right, key);
    }
    static boolean noRedRed(RedBlackInsert.Node n) {
        if (n == null) return true;
        if (n.color == RedBlackInsert.RED) {
            if (n.left != null && n.left.color == RedBlackInsert.RED) return false;
            if (n.right != null && n.right.color == RedBlackInsert.RED) return false;
        }
        return noRedRed(n.left) && noRedRed(n.right);
    }
    static int blackHeightOk(RedBlackInsert.Node n) {
        if (n == null) return 1;
        int l = blackHeightOk(n.left), r = blackHeightOk(n.right);
        if (l < 0 || r < 0 || l != r) return -1;
        return l + (n.color == RedBlackInsert.BLACK ? 1 : 0);
    }
    static boolean isValidRb(RedBlackInsert.Node n) {
        return n == null || (n.color == RedBlackInsert.BLACK && noRedRed(n) && blackHeightOk(n) >= 0);
    }

    public static void main(String[] args) {
        int[] keys = {3, 69, 31, 88, 50, 58, 98, 29, 14, 75};
        RedBlackInsert.root = null;
        for (int k : keys) { RedBlackInsert.insert(k); check(isValidRb(RedBlackInsert.root), "valid RB after insert(" + k + ")"); }
        checkEq(countNodes(RedBlackInsert.root), 10, "normal preset node count");
        checkEq(RedBlackInsert.root.color, RedBlackInsert.BLACK, "root is black");

        RedBlackInsert.root = null;
        for (int i = 1; i <= 200; i++) { RedBlackInsert.insert(i); check(isValidRb(RedBlackInsert.root), "valid RB (ascending " + i + ")"); }
        checkEq(countNodes(RedBlackInsert.root), 200, "ascending node count");

        RedBlackInsert.root = null;
        for (int i = 200; i >= 1; i--) { RedBlackInsert.insert(i); check(isValidRb(RedBlackInsert.root), "valid RB (descending " + i + ")"); }
        checkEq(countNodes(RedBlackInsert.root), 200, "descending node count");

        RedBlackInsert.root = null;
        int[] dk = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
        for (int k : dk) RedBlackInsert.insert(k);
        checkEq(countNodes(RedBlackInsert.root), 4, "duplicates collapse to 4 distinct keys");
        check(contains(RedBlackInsert.root, 8), "contains 8"); check(contains(RedBlackInsert.root, 20), "contains 20");

        RedBlackInsert.root = null;
        check(RedBlackInsert.root == null, "empty tree");

        RedBlackInsert.root = null;
        RedBlackInsert.insert(42);
        checkEq(RedBlackInsert.root.key, 42, "single insert key");
        checkEq(RedBlackInsert.root.color, RedBlackInsert.BLACK, "single insert root is black");

        RedBlackInsert.root = null;
        RedBlackInsert.insert(5); RedBlackInsert.insert(1);
        check(isValidRb(RedBlackInsert.root), "two elements valid RB");
        checkEq(countNodes(RedBlackInsert.root), 2, "two elements node count");

        RedBlackInsert.root = null;
        RedBlackInsert.insert(0); RedBlackInsert.insert(Integer.MAX_VALUE); RedBlackInsert.insert(Integer.MIN_VALUE); RedBlackInsert.insert(-1000000);
        check(isValidRb(RedBlackInsert.root), "extreme values valid RB");
        check(contains(RedBlackInsert.root, Integer.MAX_VALUE), "contains INT_MAX");
        check(contains(RedBlackInsert.root, Integer.MIN_VALUE), "contains INT_MIN");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
