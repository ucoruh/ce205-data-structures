/* Unit tests for week-14 java/BPlusTree.java */
import java.util.List;

public class BPlusTreeTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static BPlusTree.Node build(int order, int[] keys) {
        BPlusTree.Node root = new BPlusTree.Node(true);
        for (int k : keys)
            root = BPlusTree.bPlusInsert(root, order, k);
        return root;
    }

    public static void main(String[] args) {
        int[] keys = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
        BPlusTree.Node root = build(4, keys);

        int[] seen = new int[32];
        int sn = 0;
        for (BPlusTree.Node leaf = BPlusTree.firstLeaf(root); leaf != null; leaf = leaf.next)
            for (int i = 0; i < leaf.n; i++)
                seen[sn++] = leaf.keys[i];
        checkEq(sn, 12, "leaf chain visits every key once");
        for (int i = 1; i < sn; i++)
            check(seen[i - 1] < seen[i], "leaf chain ascending at " + i);

        boolean foundAll = true;
        for (int k : keys) {
            boolean f = false;
            for (int i = 0; i < sn; i++)
                if (seen[i] == k)
                    f = true;
            if (!f)
                foundAll = false;
        }
        check(foundAll, "leaf-chain keys match the input multiset");

        List<Integer> out = BPlusTree.rangeQuery(root, 6, 18);
        checkEq(out.size(), 7, "range 6..18 count");
        for (int v : out) {
            check(v >= 6, "range lower bound: " + v);
            check(v <= 18, "range upper bound: " + v);
        }

        checkEq(BPlusTree.rangeQuery(root, 15, 15).size(), 1, "single-key existing range");
        checkEq(BPlusTree.rangeQuery(root, 14, 14).size(), 0, "single-key missing range");
        checkEq(BPlusTree.rangeQuery(root, -1000, 1000).size(), 12, "whole range");
        checkEq(BPlusTree.rangeQuery(root, 1000, 2000).size(), 0, "empty range above");
        checkEq(BPlusTree.rangeQuery(root, -50, -1).size(), 0, "empty range below");

        for (int k : keys)
            checkEq(BPlusTree.rangeQuery(root, k, k).size(), 1, "own-key range: " + k);

        BPlusTree.Node single = new BPlusTree.Node(true);
        single = BPlusTree.bPlusInsert(single, 15, 1);
        single = BPlusTree.bPlusInsert(single, 15, 2);
        check(single.leaf, "small tree stays a leaf");
        check(single.next == null, "small tree has no chain neighbour");
        checkEq(BPlusTree.rangeQuery(single, 1, 2).size(), 2, "small tree range query");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
