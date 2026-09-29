// Unit tests for code/week-11/java/AvlRotations.java: avlInsert(), rebalance(), lastCase.
public class AvlRotationsTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }
    static boolean checkAvl(AvlRotations.Node n) {
        if (n == null) return true;
        int bf = AvlRotations.height(n.left) - AvlRotations.height(n.right);
        if (bf < -1 || bf > 1) return false;
        return checkAvl(n.left) && checkAvl(n.right);
    }
    static int countNodes(AvlRotations.Node n) { return n == null ? 0 : 1 + countNodes(n.left) + countNodes(n.right); }

    public static void main(String[] args) {
        AvlRotations.Node ll = null;
        int[] llk = {50, 30, 70, 20, 40, 60, 80, 10, 45, 5};
        for (int k : llk) { AvlRotations.lastCase = "none"; ll = AvlRotations.avlInsert(ll, k); }
        check("LL".equals(AvlRotations.lastCase), "LL case fired");
        check(checkAvl(ll), "LL result still balanced");

        AvlRotations.Node rr = null;
        int[] rrk = {50, 30, 70, 20, 40, 60, 80, 55, 90, 95};
        for (int k : rrk) { AvlRotations.lastCase = "none"; rr = AvlRotations.avlInsert(rr, k); }
        check("RR".equals(AvlRotations.lastCase), "RR case fired");
        check(checkAvl(rr), "RR result still balanced");

        AvlRotations.Node lr = null;
        int[] lrk = {50, 70, 30, 80, 60, 40, 20, 55, 35, 36};
        for (int k : lrk) { AvlRotations.lastCase = "none"; lr = AvlRotations.avlInsert(lr, k); }
        check("LR".equals(AvlRotations.lastCase), "LR case fired");
        check(checkAvl(lr), "LR result still balanced");

        AvlRotations.Node rl = null;
        int[] rlk = {50, 30, 70, 20, 40, 60, 80, 45, 65, 41};
        for (int k : rlk) { AvlRotations.lastCase = "none"; rl = AvlRotations.avlInsert(rl, k); }
        check("RL".equals(AvlRotations.lastCase), "RL case fired");
        check(checkAvl(rl), "RL result still balanced");

        AvlRotations.Node asc = null;
        for (int i = 1; i <= 100; i++) asc = AvlRotations.avlInsert(asc, i);
        check(checkAvl(asc), "ascending sequence stays balanced");
        check(AvlRotations.height(asc) <= 10, "ascending sequence height bounded");
        checkEq(countNodes(asc), 100, "ascending sequence node count");

        AvlRotations.Node dup = null;
        dup = AvlRotations.avlInsert(dup, 5);
        dup = AvlRotations.avlInsert(dup, 5);
        dup = AvlRotations.avlInsert(dup, 5);
        checkEq(countNodes(dup), 1, "duplicates ignored");

        AvlRotations.Node single = null;
        single = AvlRotations.avlInsert(single, 7);
        check(single != null, "single insert creates a node");
        checkEq(single.key, 7, "single insert key");
        checkEq(AvlRotations.height(single), 0, "single insert height");

        AvlRotations.Node two = null;
        two = AvlRotations.avlInsert(two, 1);
        two = AvlRotations.avlInsert(two, 2);
        check(checkAvl(two), "two elements balanced");
        checkEq(AvlRotations.height(two), 1, "two elements height");

        AvlRotations.Node neg = null;
        int[] nk = {0, -10, 10, -20, -5, 5, 20};
        for (int k : nk) neg = AvlRotations.avlInsert(neg, k);
        check(checkAvl(neg), "negative values balanced");
        checkEq(countNodes(neg), 7, "negative values node count");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
