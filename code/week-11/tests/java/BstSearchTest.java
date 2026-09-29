// Unit tests for code/week-11/java/BstSearch.java: bstSearch().
public class BstSearchTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }

    public static void main(String[] args) {
        BstSearch.Node root = null;
        int[] keys = {50, 30, 70, 20, 40, 60, 80};
        for (int k : keys) root = BstSearch.bstBuildInsert(root, k);

        check(BstSearch.bstSearch(root, 50), "found 50"); checkEq(BstSearch.probes, 1, "probes for root");
        check(BstSearch.bstSearch(root, 20), "found 20"); checkEq(BstSearch.probes, 3, "probes for deepest leaf");
        check(BstSearch.bstSearch(root, 80), "found 80");
        check(!BstSearch.bstSearch(root, 99), "not found 99");
        check(!BstSearch.bstSearch(root, -99), "not found -99");

        BstSearch.Node empty = null;
        check(!BstSearch.bstSearch(empty, 5), "empty tree");
        checkEq(BstSearch.probes, 0, "probes on empty tree");

        BstSearch.Node one = null;
        one = BstSearch.bstBuildInsert(one, 42);
        check(BstSearch.bstSearch(one, 42), "one element found");
        check(!BstSearch.bstSearch(one, 7), "one element not found");

        BstSearch.Node two = null;
        two = BstSearch.bstBuildInsert(two, 10);
        two = BstSearch.bstBuildInsert(two, 20);
        check(BstSearch.bstSearch(two, 10), "two elements first");
        check(BstSearch.bstSearch(two, 20), "two elements second");
        check(!BstSearch.bstSearch(two, 15), "two elements not found");

        BstSearch.Node dup = null;
        dup = BstSearch.bstBuildInsert(dup, 5);
        dup = BstSearch.bstBuildInsert(dup, 5);
        dup = BstSearch.bstBuildInsert(dup, 3);
        check(BstSearch.bstSearch(dup, 5), "duplicate insert, still found");
        check(BstSearch.bstSearch(dup, 3), "duplicate insert, sibling found");

        BstSearch.Node neg = null;
        int[] negs = {0, -5, 10, -10, 5};
        for (int k : negs) neg = BstSearch.bstBuildInsert(neg, k);
        check(BstSearch.bstSearch(neg, -10), "negative found -10");
        check(BstSearch.bstSearch(neg, -5), "negative found -5");
        check(!BstSearch.bstSearch(neg, 999), "negative tree not found 999");

        BstSearch.Node chain = null;
        for (int i = 1; i <= 6; i++) chain = BstSearch.bstBuildInsert(chain, i);
        check(BstSearch.bstSearch(chain, 6), "chain found last");
        checkEq(BstSearch.probes, 6, "chain worst-case probes");
        check(BstSearch.bstSearch(chain, 1), "chain found root");
        checkEq(BstSearch.probes, 1, "chain best-case probes");

        BstSearch.Node ext = null;
        ext = BstSearch.bstBuildInsert(ext, Integer.MAX_VALUE);
        ext = BstSearch.bstBuildInsert(ext, Integer.MIN_VALUE);
        check(BstSearch.bstSearch(ext, Integer.MAX_VALUE), "found INT_MAX");
        check(BstSearch.bstSearch(ext, Integer.MIN_VALUE), "found INT_MIN");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
