/* Unit tests for week-09 java/UnionFind.java */
public class UnionFindTest {
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
        UnionFind.makeSet(0);
        checkEq(UnionFind.parentOf[0], 0, "makeSet parent");
        checkEq(UnionFind.rankOf[0], 0, "makeSet rank");

        checkEq(UnionFind.find(0), 0, "find singleton");

        UnionFind.makeSet(0); UnionFind.makeSet(1);
        UnionFind.unionSets(0, 1);
        checkEq(UnionFind.find(0), UnionFind.find(1), "union same root");
        checkEq(UnionFind.find(1), 0, "union tie winner");
        checkEq(UnionFind.rankOf[0], 1, "union tie rank increases");

        UnionFind.unionSets(0, 1);
        checkEq(UnionFind.rankOf[0], 1, "idempotent union no rank change");

        UnionFind.makeSet(0); UnionFind.makeSet(1); UnionFind.makeSet(2);
        UnionFind.unionSets(0, 1);
        UnionFind.unionSets(2, 0);
        checkEq(UnionFind.find(2), 0, "lower rank hangs under taller");
        checkEq(UnionFind.rankOf[0], 1, "taller tree rank unchanged");

        UnionFind.makeSet(0); UnionFind.makeSet(1); UnionFind.makeSet(2); UnionFind.makeSet(3);
        UnionFind.unionSets(0, 1);
        UnionFind.unionSets(2, 3);
        UnionFind.unionSets(0, 2);
        checkEq(UnionFind.parentOf[3], 2, "not yet compressed");
        checkEq(UnionFind.find(3), 0, "find compresses to root");
        checkEq(UnionFind.parentOf[3], 0, "parent points directly at root after find");

        for (int i = 0; i < 5; i++) UnionFind.makeSet(i);
        UnionFind.unionSets(0, 1); UnionFind.unionSets(1, 2); UnionFind.unionSets(2, 3); UnionFind.unionSets(3, 4);
        int root = UnionFind.find(0);
        for (int i = 1; i < 5; i++) checkEq(UnionFind.find(i), root, "chain all in one set: " + i);

        for (int i = 0; i < 4; i++) UnionFind.makeSet(i);
        UnionFind.unionSets(0, 1);
        UnionFind.unionSets(2, 3);
        check(UnionFind.find(0) != UnionFind.find(2), "disjoint pairs stay disjoint");
        UnionFind.unionSets(1, 3);
        checkEq(UnionFind.find(0), UnionFind.find(2), "disjoint pairs merge");

        for (int i = 0; i < 4; i++) UnionFind.makeSet(i);
        UnionFind.unionSets(0, 1);
        UnionFind.unionSets(2, 0);
        checkEq(UnionFind.rankOf[0], 1, "rank unchanged after lower-rank merge 1");
        UnionFind.unionSets(3, 0);
        checkEq(UnionFind.rankOf[0], 1, "rank unchanged after lower-rank merge 2");
        checkEq(UnionFind.find(3), 0, "3 merged into root 0");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
