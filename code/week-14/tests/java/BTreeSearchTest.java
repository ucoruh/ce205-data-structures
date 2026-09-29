/* Unit tests for week-14 java/BTreeSearch.java */
public class BTreeSearchTest {
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
        BTreeSearch.Node root = new BTreeSearch.Node(true);
        int[] keys = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
        for (int k : keys)
            root = BTreeSearch.treeInsert(root, 4, k);

        int[] reads = {0};
        BTreeSearch.Node found = BTreeSearch.bTreeSearch(root, 17, reads);
        check(found != null, "found at root");
        checkEq(reads[0], 1, "root search cost");

        reads[0] = 0;
        found = BTreeSearch.bTreeSearch(root, 3, reads);
        check(found != null, "found deeper");
        check(reads[0] >= 2, "deeper search cost >= 2");

        reads[0] = 0;
        found = BTreeSearch.bTreeSearch(root, 999, reads);
        check(found == null, "absent value not found");
        check(reads[0] >= 1, "not-found still reads at least once");

        reads[0] = 0;
        found = BTreeSearch.bTreeSearch(root, -5, reads);
        check(found == null, "below every key not found");

        for (int k : keys) {
            reads[0] = 0;
            found = BTreeSearch.bTreeSearch(root, k, reads);
            check(found != null, "every inserted key findable: " + k);
        }

        BTreeSearch.Node single = new BTreeSearch.Node(true);
        int[] smallKeys = {23, 5, 41, 12, 38};
        for (int k : smallKeys)
            single = BTreeSearch.treeInsert(single, 12, k);
        reads[0] = 0;
        found = BTreeSearch.bTreeSearch(single, 41, reads);
        check(found != null, "single-node found");
        checkEq(reads[0], 1, "single-node search cost");
        reads[0] = 0;
        found = BTreeSearch.bTreeSearch(single, 100, reads);
        check(found == null, "single-node not found");
        checkEq(reads[0], 1, "single-node not-found cost");

        reads[0] = 0;
        found = BTreeSearch.bTreeSearch(null, 5, reads);
        check(found == null, "null root handled");
        checkEq(reads[0], 0, "null root cost");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
