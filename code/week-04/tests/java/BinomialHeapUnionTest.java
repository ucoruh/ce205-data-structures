/* Unit tests for week-04 java/BinomialHeapUnion.java, mirroring tests/c/test_binomial_heap_union.c */
public class BinomialHeapUnionTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static java.util.List<Integer> collected;
    static void collectKeys(BinomialHeapUnion.Node node) {
        if (node == null) return;
        collected.add(node.key);
        collectKeys(node.child);
        collectKeys(node.sibling);
    }
    // Counts only node's OWN subtree (itself + descendants through ->child chains); deliberately does
    // NOT walk node.sibling -- see the C test for why.
    static int countNodes(BinomialHeapUnion.Node node) {
        if (node == null) return 0;
        int total = 1;
        for (BinomialHeapUnion.Node c = node.child; c != null; c = c.sibling) total += countNodes(c);
        return total;
    }
    static boolean isValidBinomialTree(BinomialHeapUnion.Node node, int expectedOrder) {
        if (countNodes(node) != (1 << expectedOrder)) return false;
        int childOrder = expectedOrder - 1;
        for (BinomialHeapUnion.Node c = node.child; c != null; c = c.sibling) {
            if (BinomialHeapUnion.better(c.key, node.key)) return false;
            if (!isValidBinomialTree(c, childOrder)) return false;
            childOrder--;
        }
        return childOrder == -1;
    }
    static int extremeOf(int[] values, boolean wantMax) {
        int best = values[0];
        for (int v : values) if (wantMax ? v > best : v < best) best = v;
        return best;
    }
    static boolean multisetMatches(int[] a, int[] b) {
        if (a.length != b.length) return false;
        int[] sa = a.clone(), sb = b.clone();
        java.util.Arrays.sort(sa);
        java.util.Arrays.sort(sb);
        return java.util.Arrays.equals(sa, sb);
    }
    static void checkForest(BinomialHeapUnion.Node[] trees, int n) {
        for (int k = 0; k < BinomialHeapUnion.MAX_ORDER; k++) {
            boolean bitSet = ((n >> k) & 1) == 1;
            check((trees[k] != null) == bitSet, "order " + k + " presence for n=" + n);
            if (trees[k] != null) check(isValidBinomialTree(trees[k], k), "order " + k + " valid binomial tree for n=" + n);
        }
    }

    public static void main(String[] args) {
        // -- link(): the better root wins and the worse root becomes its new leftmost child --
        BinomialHeapUnion.kindIsMax = false;
        BinomialHeapUnion.Node t1 = new BinomialHeapUnion.Node(9), t2 = new BinomialHeapUnion.Node(4);
        BinomialHeapUnion.Node linked = BinomialHeapUnion.link(t1, t2);
        checkEq(linked.key, 4, "link winner key");
        checkEq(linked.order, 1, "link winner order");
        check(linked.child == t1, "link loser becomes child");
        checkEq(countNodes(linked), 2, "link node count");

        // -- A: 7 elements, min-heap -- orders present must be the set bits of 7 (0,1,2) --
        int[] aNormal = {5, 3, 8, 1, 9, 2, 4};
        BinomialHeapUnion.kindIsMax = false;
        BinomialHeapUnion.Node[] A = BinomialHeapUnion.buildFromValues(aNormal);
        checkForest(A, 7);
        collected = new java.util.ArrayList<>();
        for (int k = 0; k < BinomialHeapUnion.MAX_ORDER; k++) collectKeys(A[k]);
        check(multisetMatches(collected.stream().mapToInt(Integer::intValue).toArray(), aNormal), "A multiset preserved");

        // -- B: 5 elements -- orders present must be the set bits of 5 (0,2) --
        int[] bNormal = {12, 15, 11, 20, 7};
        BinomialHeapUnion.Node[] B = BinomialHeapUnion.buildFromValues(bNormal);
        checkForest(B, 5);

        // -- union(A, B): 12 elements total, orders = set bits of 12 (2,3) --
        BinomialHeapUnion.Node[] result = new BinomialHeapUnion.Node[BinomialHeapUnion.MAX_ORDER];
        BinomialHeapUnion.unionHeaps(A, B, result);
        checkForest(result, 12);
        collected = new java.util.ArrayList<>();
        for (int k = 0; k < BinomialHeapUnion.MAX_ORDER; k++) collectKeys(result[k]);
        checkEq(collected.size(), 12, "union collected count");
        int[] allNormal = {5, 3, 8, 1, 9, 2, 4, 12, 15, 11, 20, 7};
        check(multisetMatches(collected.stream().mapToInt(Integer::intValue).toArray(), allNormal), "union multiset preserved");
        int minBest = extremeOf(allNormal, false);
        boolean foundMin = false;
        for (int k = 0; k < BinomialHeapUnion.MAX_ORDER; k++) if (result[k] != null && result[k].key == minBest) foundMin = true;
        check(foundMin, "true minimum sits at some root");

        // -- hard: max-heap, A and B share orders 0/1/2 -- a carry forms at every order --
        int[] aHard = {10, 40, 25, 60, 15, 55, 30};
        int[] bHard = {70, 20, 90, 35, 80, 45, 65};
        BinomialHeapUnion.kindIsMax = true;
        BinomialHeapUnion.Node[] Ah = BinomialHeapUnion.buildFromValues(aHard);
        BinomialHeapUnion.Node[] Bh = BinomialHeapUnion.buildFromValues(bHard);
        BinomialHeapUnion.Node[] resh = new BinomialHeapUnion.Node[BinomialHeapUnion.MAX_ORDER];
        BinomialHeapUnion.unionHeaps(Ah, Bh, resh);
        checkForest(resh, 14);
        int[] allHard = {10, 40, 25, 60, 15, 55, 30, 70, 20, 90, 35, 80, 45, 65};
        int maxBest = extremeOf(allHard, true);
        boolean foundMax = false;
        for (int k = 0; k < BinomialHeapUnion.MAX_ORDER; k++) if (resh[k] != null && resh[k].key == maxBest) foundMax = true;
        check(foundMax, "true maximum sits at some root");
        checkEq(maxBest, 90, "hard max value");

        // -- edge: A is empty, union with B (11 elements) --
        int[] bEdge = {6, 19, 3, 27, 11, 8, 35, 14, 22, 9, 41};
        BinomialHeapUnion.kindIsMax = false;
        BinomialHeapUnion.Node[] Ae = BinomialHeapUnion.buildFromValues(new int[0]);
        BinomialHeapUnion.Node[] Be = BinomialHeapUnion.buildFromValues(bEdge);
        BinomialHeapUnion.Node[] rese = new BinomialHeapUnion.Node[BinomialHeapUnion.MAX_ORDER];
        BinomialHeapUnion.unionHeaps(Ae, Be, rese);
        checkForest(rese, 11);
        collected = new java.util.ArrayList<>();
        for (int k = 0; k < BinomialHeapUnion.MAX_ORDER; k++) collectKeys(rese[k]);
        check(multisetMatches(collected.stream().mapToInt(Integer::intValue).toArray(), bEdge), "edge multiset preserved");
        checkEq(extremeOf(bEdge, false), 3, "edge min value");

        // -- edge: single element --
        BinomialHeapUnion.Node[] single = BinomialHeapUnion.buildFromValues(new int[]{77});
        checkForest(single, 1);
        checkEq(single[0].key, 77, "single element key");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
