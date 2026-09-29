// Unit tests for code/week-11/java/BstDegenerate.java: bstInsert(), height(), ilog2().
public class BstDegenerateTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }

    public static void main(String[] args) {
        checkEq(BstDegenerate.ilog2(1), 0, "ilog2(1)");
        checkEq(BstDegenerate.ilog2(2), 1, "ilog2(2)");
        checkEq(BstDegenerate.ilog2(3), 1, "ilog2(3)");
        checkEq(BstDegenerate.ilog2(4), 2, "ilog2(4)");
        checkEq(BstDegenerate.ilog2(7), 2, "ilog2(7)");
        checkEq(BstDegenerate.ilog2(8), 3, "ilog2(8)");
        checkEq(BstDegenerate.ilog2(1024), 10, "ilog2(1024)");

        BstDegenerate.Node asc = null;
        for (int i = 1; i <= 10; i++) asc = BstDegenerate.bstInsert(asc, i);
        checkEq(BstDegenerate.height(asc), 9, "ascending insert height");

        BstDegenerate.Node desc = null;
        for (int i = 10; i >= 1; i--) desc = BstDegenerate.bstInsert(desc, i);
        checkEq(BstDegenerate.height(desc), 9, "descending insert height");

        BstDegenerate.Node single = null;
        single = BstDegenerate.bstInsert(single, 42);
        checkEq(BstDegenerate.height(single), 0, "single key height");

        BstDegenerate.Node two = null;
        two = BstDegenerate.bstInsert(two, 5);
        two = BstDegenerate.bstInsert(two, 9);
        checkEq(BstDegenerate.height(two), 1, "two keys height");

        checkEq(BstDegenerate.height(null), -1, "empty tree height");

        BstDegenerate.Node shuf = null;
        int[] shuffled = {6, 9, 2, 10, 4, 8, 1, 7, 3, 5};
        for (int k : shuffled) shuf = BstDegenerate.bstInsert(shuf, k);
        check(BstDegenerate.height(shuf) < BstDegenerate.height(asc), "shuffled shallower than ascending");
        check(BstDegenerate.height(shuf) <= 5, "shuffled height bounded");

        BstDegenerate.Node dup = null;
        int[] dk = {5, 5, 5, 5};
        for (int k : dk) dup = BstDegenerate.bstInsert(dup, k);
        checkEq(BstDegenerate.height(dup), 0, "duplicates do not add height");

        BstDegenerate.Node ext = null;
        ext = BstDegenerate.bstInsert(ext, 0);
        ext = BstDegenerate.bstInsert(ext, Integer.MAX_VALUE);
        ext = BstDegenerate.bstInsert(ext, Integer.MIN_VALUE);
        checkEq(BstDegenerate.height(ext), 1, "extreme values height");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
