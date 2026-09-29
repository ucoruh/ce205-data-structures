// Unit tests for code/week-11/java/AvlDelete.java: avlDelete().
public class AvlDeleteTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }
    static boolean checkAvl(AvlDelete.Node n) {
        if (n == null) return true;
        int bf = AvlDelete.height(n.left) - AvlDelete.height(n.right);
        if (bf < -1 || bf > 1) return false;
        return checkAvl(n.left) && checkAvl(n.right);
    }
    static int countNodes(AvlDelete.Node n) { return n == null ? 0 : 1 + countNodes(n.left) + countNodes(n.right); }
    static boolean contains(AvlDelete.Node n, int key) {
        if (n == null) return false;
        if (n.key == key) return true;
        return key < n.key ? contains(n.left, key) : contains(n.right, key);
    }

    public static void main(String[] args) {
        AvlDelete.Node root = null;
        int[] keys = {50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 90};
        for (int k : keys) root = AvlDelete.avlInsert(root, k);

        root = AvlDelete.avlDelete(root, 10);
        check(!contains(root, 10), "leaf deleted");
        check(checkAvl(root), "balanced after leaf delete");
        checkEq(countNodes(root), 11, "count after leaf delete");

        root = AvlDelete.avlDelete(root, 70);
        check(!contains(root, 70), "two-children node deleted");
        check(checkAvl(root), "balanced after two-children delete");
        checkEq(countNodes(root), 10, "count after two-children delete");

        AvlDelete.Node big = null;
        for (int i = 1; i <= 30; i++) big = AvlDelete.avlInsert(big, i);
        for (int i = 1; i <= 30; i++) {
            big = AvlDelete.avlDelete(big, i);
            check(checkAvl(big), "balanced while deleting all 30 keys");
        }
        check(big == null, "empty after deleting every key");

        AvlDelete.Node nf = null;
        int[] nfk = {5, 3, 8};
        for (int k : nfk) nf = AvlDelete.avlInsert(nf, k);
        int before = countNodes(nf);
        nf = AvlDelete.avlDelete(nf, 999);
        checkEq(countNodes(nf), before, "deleting a missing key is a no-op");
        check(checkAvl(nf), "still balanced after no-op delete");

        AvlDelete.Node empty = null;
        empty = AvlDelete.avlDelete(empty, 5);
        check(empty == null, "deleting from an empty tree stays empty");

        AvlDelete.Node single = null;
        single = AvlDelete.avlInsert(single, 7);
        single = AvlDelete.avlDelete(single, 7);
        check(single == null, "deleting the only node empties the tree");

        AvlDelete.Node two = null;
        two = AvlDelete.avlInsert(two, 5);
        two = AvlDelete.avlInsert(two, 1);
        two = AvlDelete.avlDelete(two, 1);
        check(two != null, "two elements: one remains");
        checkEq(two.key, 5, "remaining key is 5");
        two = AvlDelete.avlDelete(two, 5);
        check(two == null, "two elements: both deleted -> empty");

        AvlDelete.Node neg = null;
        int[] nk = {0, -10, 10, -20, -5, 5, 20};
        for (int k : nk) neg = AvlDelete.avlInsert(neg, k);
        neg = AvlDelete.avlDelete(neg, -20);
        check(!contains(neg, -20), "negative value deleted");
        check(checkAvl(neg), "balanced after negative-value delete");
        checkEq(countNodes(neg), 6, "count after negative-value delete");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
