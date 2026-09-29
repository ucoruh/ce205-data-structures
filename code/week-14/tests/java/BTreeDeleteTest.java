import java.util.Arrays;

/* Unit tests for week-14 java/BTreeDelete.java */
public class BTreeDeleteTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static BTreeDelete.Node build(int order, int[] keys) {
        BTreeDelete.Node root = new BTreeDelete.Node(true);
        for (int k : keys)
            root = BTreeDelete.treeInsert(root, order, k);
        return root;
    }

    /* Independent in-order reader: only reads the tree, used to compare against a brute-force
     * expected list below -- it never decides what "correct" is. */
    static void inOrder(BTreeDelete.Node node, int[] out, int[] count) {
        for (int i = 0; i < node.n; i++) {
            if (!node.leaf)
                inOrder(node.child[i], out, count);
            out[count[0]++] = node.keys[i];
        }
        if (!node.leaf)
            inOrder(node.child[node.n], out, count);
    }

    /* Independent B-tree structural validator (universal invariants of a B-tree of the given
     * order: sorted keys, size bounds, n+1 children with correct parent pointers, every leaf at
     * the same depth, every key strictly between its bounding separators). This checks the
     * RESULT against the definition of a B-tree, not against anything the delete method itself
     * returned. */
    static boolean validRec(BTreeDelete.Node node, int order, boolean isRoot, int lo, int hi,
                             int[] leafDepth, int depth) {
        int minK = BTreeDelete.minKeys(order);
        if (node.n > order - 1)
            return false;
        if (!isRoot && node.n < minK)
            return false;
        if (isRoot && !node.leaf && node.n < 1)
            return false;
        for (int i = 0; i < node.n; i++) {
            if (node.keys[i] <= lo || node.keys[i] >= hi)
                return false;
            if (i > 0 && node.keys[i - 1] >= node.keys[i])
                return false;
        }
        if (node.leaf) {
            if (leafDepth[0] == -1)
                leafDepth[0] = depth;
            return leafDepth[0] == depth;
        }
        for (int i = 0; i <= node.n; i++) {
            if (node.child[i] == null || node.child[i].parent != node)
                return false;
            int clo = (i == 0) ? lo : node.keys[i - 1];
            int chi = (i == node.n) ? hi : node.keys[i];
            if (!validRec(node.child[i], order, false, clo, chi, leafDepth, depth + 1))
                return false;
        }
        return true;
    }

    static boolean btValid(BTreeDelete.Node root, int order) {
        int[] leafDepth = {-1};
        return validRec(root, order, true, Integer.MIN_VALUE, Integer.MAX_VALUE, leafDepth, 0);
    }

    /* Brute-force oracle: remove `val` from a plain int list (no B-tree code involved). */
    static int[] removeVal(int[] arr, int n, int val) {
        int[] out = new int[n - 1];
        int w = 0;
        boolean removed = false;
        for (int i = 0; i < n; i++) {
            if (!removed && arr[i] == val) { removed = true; continue; }
            out[w++] = arr[i];
        }
        return out;
    }

    static void checkMatchesSorted(BTreeDelete.Node root, int[] expected) {
        int[] sortedExpected = expected.clone();
        Arrays.sort(sortedExpected);
        int[] got = new int[64];
        int[] count = {0};
        inOrder(root, got, count);
        checkEq(count[0], sortedExpected.length, "in-order length");
        int upto = Math.min(count[0], sortedExpected.length);
        for (int i = 0; i < upto; i++)
            checkEq(got[i], sortedExpected[i], "in-order[" + i + "]");
    }

    public static void main(String[] args) {
        BTreeDelete.Node n = new BTreeDelete.Node(true);
        n.keys[0] = 1; n.keys[1] = 2; n.keys[2] = 3; n.n = 3;
        BTreeDelete.removeAt(n, 1);
        checkEq(n.n, 2, "removeAt count");
        checkEq(n.keys[0], 1, "removeAt[0]");
        checkEq(n.keys[1], 3, "removeAt[1]");

        int[] baseKeys = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
        BTreeDelete.Node root = build(4, baseKeys);
        int[] fi = new int[1];
        check(BTreeDelete.findNode(root, 12, fi) != null, "findNode present");
        check(BTreeDelete.findNode(root, 999, fi) == null, "findNode absent");

        root = build(4, baseKeys);
        int[] deletes1 = {6, 12, 30};
        boolean[] found = new boolean[1];
        for (int d : deletes1) {
            root = BTreeDelete.bTreeDelete(root, 4, d, found);
            check(found[0], "normal delete found: " + d);
        }
        checkEq(BTreeDelete.nodeCount(root), 8, "normal node count");
        checkEq(BTreeDelete.treeHeight(root), 2, "normal height");
        check(btValid(root, 4), "normal tree valid");
        checkMatchesSorted(root, new int[] {10, 20, 5, 7, 17, 3, 25, 18, 15});

        int[] ascKeys = new int[14];
        for (int i = 0; i < 14; i++)
            ascKeys[i] = i + 1;
        root = build(3, ascKeys);
        int[] deletes2 = {1, 2, 3, 4};
        for (int d : deletes2) {
            root = BTreeDelete.bTreeDelete(root, 3, d, found);
            check(found[0], "ascending delete found: " + d);
        }
        checkEq(BTreeDelete.nodeCount(root), 8, "ascending node count");
        checkEq(BTreeDelete.treeHeight(root), 2, "ascending height");
        check(btValid(root, 3), "ascending tree valid");
        checkMatchesSorted(root, new int[] {5, 6, 7, 8, 9, 10, 11, 12, 13, 14});

        root = build(4, baseKeys);
        int beforeNodes = BTreeDelete.nodeCount(root), beforeHeight = BTreeDelete.treeHeight(root);
        root = BTreeDelete.bTreeDelete(root, 4, 999, found);
        check(!found[0], "absent delete not found");
        checkEq(BTreeDelete.nodeCount(root), beforeNodes, "absent delete shape unchanged (nodes)");
        checkEq(BTreeDelete.treeHeight(root), beforeHeight, "absent delete shape unchanged (height)");
        check(BTreeDelete.findNode(root, 6, fi) != null, "key still present after no-op delete");

        root = build(4, baseKeys);
        for (int i = 0; i < baseKeys.length; i++) {
            root = BTreeDelete.bTreeDelete(root, 4, baseKeys[i], found);
            check(found[0], "drain delete found: " + baseKeys[i]);
            check(btValid(root, 4), "drain step " + i + " tree valid");
            for (int j = i + 1; j < baseKeys.length; j++)
                check(BTreeDelete.findNode(root, baseKeys[j], fi) != null, "still findable: " + baseKeys[j]);
        }
        checkEq(root.n, 0, "drained root key count");
        check(root.leaf, "drained root is a leaf");

        int[] shrinkKeys = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110};
        root = build(3, shrinkKeys);
        int[] shrinkDel = {10, 20, 30, 40, 50, 60, 70};
        for (int d : shrinkDel) {
            root = BTreeDelete.bTreeDelete(root, 3, d, found);
            check(found[0], "shrink delete found: " + d);
            check(btValid(root, 3), "shrink step tree valid: " + d);
        }
        checkEq(BTreeDelete.nodeCount(root), 3, "shrink node count");
        checkEq(BTreeDelete.treeHeight(root), 1, "shrink height");
        checkMatchesSorted(root, new int[] {80, 90, 100, 110});

        /* ---- explicit coverage of every fixUnderflow branch (order=5, minKeys=2) ---- */
        int[] order5 = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
                         130, 140, 150, 160, 170, 180, 190, 200};

        /* A: borrow-from-right (deleted leaf is leftmost -> no left sibling; its right sibling
         * has a surplus key, 45, so the "right != null && right.n > minK" branch fires and
         * returns without freeing any node -- node count must stay unchanged). */
        {
            int[] keys = Arrays.copyOf(order5, 21);
            keys[20] = 45; /* gives the [40,50] leaf a 3rd key so it can lend */
            root = build(5, keys);
            int before = BTreeDelete.nodeCount(root);
            root = BTreeDelete.bTreeDelete(root, 5, 20, found);
            check(found[0], "A: borrow-right found");
            check(btValid(root, 5), "A: borrow-right tree valid");
            checkEq(BTreeDelete.nodeCount(root), before, "A: borrow-right node count unchanged");
            check(BTreeDelete.findNode(root, 20, fi) == null, "A: 20 gone");
            checkMatchesSorted(root, removeVal(keys, keys.length, 20));
        }

        /* B: borrow-from-left (deleted leaf's left sibling [40,45,50] has the surplus key, so
         * the "left != null && left.n > minK" branch fires first and returns; nothing freed). */
        {
            int[] keys = Arrays.copyOf(order5, 21);
            keys[20] = 45;
            root = build(5, keys);
            int before = BTreeDelete.nodeCount(root);
            root = BTreeDelete.bTreeDelete(root, 5, 70, found);
            check(found[0], "B: borrow-left found");
            check(btValid(root, 5), "B: borrow-left tree valid");
            checkEq(BTreeDelete.nodeCount(root), before, "B: borrow-left node count unchanged");
            check(BTreeDelete.findNode(root, 70, fi) == null, "B: 70 gone");
            checkMatchesSorted(root, removeVal(keys, keys.length, 70));
        }

        /* C: merge-with-left (deleting 40 leaves the [40,50] leaf with 1 key; both its siblings
         * are exactly at minKeys=2 so neither can lend, so "left != null" merges it into its
         * left sibling and frees this node -- exactly one node must disappear). */
        {
            root = build(5, order5);
            int before = BTreeDelete.nodeCount(root);
            root = BTreeDelete.bTreeDelete(root, 5, 40, found);
            check(found[0], "C: merge-left found");
            check(btValid(root, 5), "C: merge-left tree valid");
            checkEq(BTreeDelete.nodeCount(root), before - 1, "C: merge-left exactly one node freed");
            check(BTreeDelete.findNode(root, 40, fi) == null, "C: 40 gone");
            checkMatchesSorted(root, removeVal(order5, order5.length, 40));
        }

        /* D: merge-with-right (deleting 10 leaves the LEFTMOST leaf [10,20] with 1 key -> no
         * left sibling to check, and its right sibling is at minKeys too, so the final "else"
         * branch merges it into its right sibling instead -- again exactly one node freed). */
        {
            root = build(5, order5);
            int before = BTreeDelete.nodeCount(root);
            root = BTreeDelete.bTreeDelete(root, 5, 10, found);
            check(found[0], "D: merge-right found");
            check(btValid(root, 5), "D: merge-right tree valid");
            checkEq(BTreeDelete.nodeCount(root), before - 1, "D: merge-right exactly one node freed");
            check(BTreeDelete.findNode(root, 10, fi) == null, "D: 10 gone");
            checkMatchesSorted(root, removeVal(order5, order5.length, 10));
        }

        /* E: order=3 (tightest possible, minKeys=1) run of chained merges, checked after every
         * single delete against the brute-force removeVal() oracle -- catches a duplicate or
         * missing key left behind by any merge along the way. */
        {
            int[] keys = {2, 4, 6, 8, 10, 12, 14, 16, 18};
            root = build(3, keys);
            int[] expect = keys.clone();
            int expectLen = expect.length;
            int[] toDelete = {6, 8, 10, 12, 14};
            for (int d : toDelete) {
                root = BTreeDelete.bTreeDelete(root, 3, d, found);
                check(found[0], "E: delete found: " + d);
                check(btValid(root, 3), "E: tree valid after deleting " + d);
                expect = removeVal(expect, expectLen, d);
                expectLen = expect.length;
                checkMatchesSorted(root, expect);
            }
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
