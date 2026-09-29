// Unit tests for code/week-11/java/TwoThreeTreeInsert.java: insert().
public class TwoThreeTreeInsertTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }
    static int countKeys(TwoThreeTreeInsert.Node n) {
        if (n == null) return 0;
        int total = n.nkeys;
        if (!TwoThreeTreeInsert.isLeaf(n)) for (int i = 0; i <= n.nkeys; i++) total += countKeys(n.child[i]);
        return total;
    }
    static boolean contains(TwoThreeTreeInsert.Node n, int key) {
        if (n == null) return false;
        for (int i = 0; i < n.nkeys; i++) if (n.key[i] == key) return true;
        if (TwoThreeTreeInsert.isLeaf(n)) return false;
        return contains(n.child[TwoThreeTreeInsert.childIndex(n, key)], key);
    }
    static int[] leafDepth = new int[1];
    static boolean checkShape(TwoThreeTreeInsert.Node n, int depth) {
        if (n == null) return true;
        if (n.nkeys < 1 || n.nkeys > 2) return false;
        if (TwoThreeTreeInsert.isLeaf(n)) {
            if (leafDepth[0] == -1) { leafDepth[0] = depth; return true; }
            return leafDepth[0] == depth;
        }
        for (int i = 0; i <= n.nkeys; i++) if (!checkShape(n.child[i], depth + 1)) return false;
        return true;
    }
    static boolean shapeOk(TwoThreeTreeInsert.Node root) { leafDepth[0] = -1; return checkShape(root, 0); }

    public static void main(String[] args) {
        TwoThreeTreeInsert.Node root = null;
        int[] keys = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        for (int k : keys) { root = TwoThreeTreeInsert.insert(root, k); check(shapeOk(root), "valid shape after insert(" + k + ")"); }
        checkEq(countKeys(root), 10, "normal preset key count");
        checkEq(TwoThreeTreeInsert.treeHeight(root), 2, "normal preset height");
        for (int k : keys) check(contains(root, k), "contains " + k);

        TwoThreeTreeInsert.Node hard = null;
        int[] hkeys = {50, 30, 70, 20, 40, 60, 80, 10, 90, 25, 35, 45, 55, 65};
        for (int k : hkeys) { hard = TwoThreeTreeInsert.insert(hard, k); check(shapeOk(hard), "valid shape (hard, " + k + ")"); }
        check(TwoThreeTreeInsert.treeHeight(hard) >= 1, "hard preset height grew");
        checkEq(countKeys(hard), 14, "hard preset key count");

        TwoThreeTreeInsert.Node dup = null;
        int[] dk = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
        for (int k : dk) dup = TwoThreeTreeInsert.insert(dup, k);
        checkEq(countKeys(dup), 4, "duplicates collapse to 4 distinct keys");
        check(contains(dup, 8), "contains 8"); check(contains(dup, 20), "contains 20");

        TwoThreeTreeInsert.Node desc = null;
        for (int i = 100; i >= 10; i -= 10) { desc = TwoThreeTreeInsert.insert(desc, i); check(shapeOk(desc), "valid shape (descending " + i + ")"); }
        checkEq(countKeys(desc), 10, "descending key count");

        TwoThreeTreeInsert.Node single = null;
        single = TwoThreeTreeInsert.insert(single, 7);
        checkEq(single.nkeys, 1, "single key nkeys");
        checkEq(single.key[0], 7, "single key value");
        checkEq(TwoThreeTreeInsert.treeHeight(single), 0, "single key height");

        TwoThreeTreeInsert.Node two = null;
        two = TwoThreeTreeInsert.insert(two, 5);
        two = TwoThreeTreeInsert.insert(two, 3);
        checkEq(two.nkeys, 2, "two keys fit in one node");
        checkEq(TwoThreeTreeInsert.treeHeight(two), 0, "two keys height");

        TwoThreeTreeInsert.Node ext = null;
        int[] ek = {0, -2147483647, 2147483647, -1000000, 1000000};
        for (int k : ek) { ext = TwoThreeTreeInsert.insert(ext, k); check(shapeOk(ext), "valid shape (extreme " + k + ")"); }
        check(contains(ext, -2147483647), "contains near-INT_MIN");
        check(contains(ext, 2147483647), "contains INT_MAX");
        checkEq(countKeys(ext), 5, "extreme values key count");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
