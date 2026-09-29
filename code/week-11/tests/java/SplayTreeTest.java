// Unit tests for code/week-11/java/SplayTree.java: accessKey(), splay().
public class SplayTreeTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }
    static int countNodes(SplayTree.Node n) { return n == null ? 0 : 1 + countNodes(n.left) + countNodes(n.right); }
    static boolean contains(SplayTree.Node n, int key) {
        if (n == null) return false;
        if (n.key == key) return true;
        return key < n.key ? contains(n.left, key) : contains(n.right, key);
    }
    static boolean isBst(SplayTree.Node n, long lo, long hi) {
        if (n == null) return true;
        if (n.key <= lo || n.key >= hi) return false;
        return isBst(n.left, lo, n.key) && isBst(n.right, n.key, hi);
    }

    public static void main(String[] args) {
        SplayTree.root = null;
        int[] keys = {50, 30, 70, 20, 40, 60, 80, 10, 45, 20, 80, 10};
        for (int k : keys) {
            SplayTree.Node last = SplayTree.accessKey(k);
            check(SplayTree.root == last, "root is the just-accessed node");
            checkEq(SplayTree.root.key, k, "root key matches accessed key");
            check(isBst(SplayTree.root, -2000000000L, 2000000000L), "still a valid BST");
        }
        checkEq(countNodes(SplayTree.root), 9, "9 distinct keys among the 12 accesses");

        // zig-zig, exact shape: access(50), access(30) [zig], access(70) [zig-zig, right-right chain].
        // Hand-worked: 30-50-70 is a straight right-right chain before the third access, so the zig-zig
        // rotation must lift 70 to the root with 50 as its left child and 30 as 50's left child.
        SplayTree.root = null;
        SplayTree.accessKey(50); SplayTree.accessKey(30); SplayTree.accessKey(70);
        checkEq(SplayTree.root.key, 70, "zig-zig: root is 70");
        check(SplayTree.root.left != null && SplayTree.root.left.key == 50, "zig-zig: root.left is 50");
        check(SplayTree.root.left.left != null && SplayTree.root.left.left.key == 30, "zig-zig: root.left.left is 30");
        check(SplayTree.root.right == null, "zig-zig: root.right is empty");
        check(SplayTree.root.left.right == null, "zig-zig: root.left.right is empty");
        check(SplayTree.root.left.left.left == null && SplayTree.root.left.left.right == null, "zig-zig: 30 is a leaf");

        // zig-zag, exact shape: access(50), access(70) [zig], access(60) [zig-zag: 60 is between 50 and 70].
        // Hand-worked: the zig-zag rotation must lift 60 to the root with 50 and 70 as its two leaf children
        // (BST order: 50 < 60 < 70, so 50 goes left and 70 goes right).
        SplayTree.root = null;
        SplayTree.accessKey(50); SplayTree.accessKey(70); SplayTree.accessKey(60);
        checkEq(SplayTree.root.key, 60, "zig-zag: root is 60");
        check(SplayTree.root.left != null && SplayTree.root.left.key == 50, "zig-zag: root.left is 50");
        check(SplayTree.root.right != null && SplayTree.root.right.key == 70, "zig-zag: root.right is 70");
        check(SplayTree.root.left.left == null && SplayTree.root.left.right == null, "zig-zag: 50 is a leaf");
        check(SplayTree.root.right.left == null && SplayTree.root.right.right == null, "zig-zag: 70 is a leaf");

        SplayTree.root = null;
        SplayTree.accessKey(5);
        SplayTree.accessKey(5);
        checkEq(SplayTree.root.key, 5, "re-accessing the root stays the root");
        checkEq(countNodes(SplayTree.root), 1, "no growth from re-access");

        SplayTree.root = null;
        SplayTree.accessKey(50); SplayTree.accessKey(30); SplayTree.accessKey(70);
        SplayTree.accessKey(999);
        checkEq(SplayTree.root.key, 999, "missing key inserted and splayed to root");
        check(contains(SplayTree.root, 50), "still contains 50");
        check(contains(SplayTree.root, 30), "still contains 30");
        check(contains(SplayTree.root, 70), "still contains 70");
        checkEq(countNodes(SplayTree.root), 4, "node count after inserting a missing key");

        SplayTree.root = null;
        SplayTree.accessKey(7);
        check(SplayTree.root != null, "single access creates the root");
        checkEq(SplayTree.root.key, 7, "single access root key");
        checkEq(countNodes(SplayTree.root), 1, "single access node count");

        SplayTree.root = null;
        SplayTree.accessKey(10); SplayTree.accessKey(5);
        checkEq(SplayTree.root.key, 5, "two elements: second access is root");
        SplayTree.accessKey(10);
        checkEq(SplayTree.root.key, 10, "two elements: re-access moves root back");
        checkEq(countNodes(SplayTree.root), 2, "two elements node count");

        SplayTree.root = null;
        int[] neg = {0, -10, 10, -20, -5, 5, 20, -20, -20};
        for (int k : neg) SplayTree.accessKey(k);
        checkEq(SplayTree.root.key, -20, "negative-values final root");
        check(isBst(SplayTree.root, -2000000000L, 2000000000L), "negative-values still a valid BST");
        checkEq(countNodes(SplayTree.root), 7, "negative-values node count");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
