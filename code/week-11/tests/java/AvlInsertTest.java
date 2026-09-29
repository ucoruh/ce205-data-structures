// Unit tests for code/week-11/java/AvlInsert.java: avlInsert().
public class AvlInsertTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }
    static boolean checkAvl(AvlInsert.Node n) {
        if (n == null) return true;
        int bf = AvlInsert.height(n.left) - AvlInsert.height(n.right);
        if (bf < -1 || bf > 1) return false;
        return checkAvl(n.left) && checkAvl(n.right);
    }
    static int countNodes(AvlInsert.Node n) { return n == null ? 0 : 1 + countNodes(n.left) + countNodes(n.right); }
    static boolean contains(AvlInsert.Node n, int key) {
        if (n == null) return false;
        if (n.key == key) return true;
        return key < n.key ? contains(n.left, key) : contains(n.right, key);
    }

    public static void main(String[] args) {
        AvlInsert.Node normal = null;
        int[] nk = {6, 74, 51, 56, 26, 66, 98, 2, 9, 72};
        for (int k : nk) normal = AvlInsert.avlInsert(normal, k);
        check(checkAvl(normal), "normal preset balanced");
        checkEq(countNodes(normal), 10, "normal preset node count");

        AvlInsert.Node asc = null;
        for (int i = 1; i <= 200; i++) asc = AvlInsert.avlInsert(asc, i);
        check(checkAvl(asc), "ascending stays balanced");
        check(AvlInsert.height(asc) <= 12, "ascending height bounded");
        checkEq(countNodes(asc), 200, "ascending node count");

        AvlInsert.Node desc = null;
        for (int i = 200; i >= 1; i--) desc = AvlInsert.avlInsert(desc, i);
        check(checkAvl(desc), "descending stays balanced");
        checkEq(countNodes(desc), 200, "descending node count");

        AvlInsert.Node dup = null;
        int[] dk = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
        for (int k : dk) dup = AvlInsert.avlInsert(dup, k);
        checkEq(countNodes(dup), 4, "duplicates collapse to 4 distinct keys");
        check(contains(dup, 8), "contains 8"); check(contains(dup, 3), "contains 3"); check(contains(dup, 20), "contains 20");

        checkEq(AvlInsert.height(null), -1, "empty tree height");

        AvlInsert.Node single = null;
        single = AvlInsert.avlInsert(single, 5);
        checkEq(AvlInsert.height(single), 0, "single element height");

        AvlInsert.Node two = null;
        two = AvlInsert.avlInsert(two, 5);
        two = AvlInsert.avlInsert(two, 1);
        check(checkAvl(two), "two elements balanced");
        checkEq(AvlInsert.height(two), 1, "two elements height");

        AvlInsert.Node ext = null;
        ext = AvlInsert.avlInsert(ext, 0);
        ext = AvlInsert.avlInsert(ext, Integer.MAX_VALUE);
        ext = AvlInsert.avlInsert(ext, Integer.MIN_VALUE);
        ext = AvlInsert.avlInsert(ext, -1000000);
        check(checkAvl(ext), "extreme values balanced");
        check(contains(ext, Integer.MAX_VALUE), "contains INT_MAX");
        check(contains(ext, Integer.MIN_VALUE), "contains INT_MIN");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
