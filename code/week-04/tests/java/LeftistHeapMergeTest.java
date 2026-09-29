/* Unit tests for week-04 java/LeftistHeapMerge.java, mirroring tests/c/test_leftist_heap_merge.c */
public class LeftistHeapMergeTest {
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
    static void collectKeys(LeftistHeapMerge.Node node) {
        if (node == null) return;
        collected.add(node.key);
        collectKeys(node.left);
        collectKeys(node.right);
    }
    static boolean myIsValidLeftist(LeftistHeapMerge.Node node) {
        if (node == null) return true;
        if (node.left != null && LeftistHeapMerge.better(node.left.key, node.key)) return false;
        if (node.right != null && LeftistHeapMerge.better(node.right.key, node.key)) return false;
        if (LeftistHeapMerge.npl(node.left) < LeftistHeapMerge.npl(node.right)) return false;
        return myIsValidLeftist(node.left) && myIsValidLeftist(node.right);
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

    public static void main(String[] args) {
        // -- merge with null on either side is the identity --
        LeftistHeapMerge.kindIsMax = false;
        LeftistHeapMerge.Node lone = new LeftistHeapMerge.Node(5);
        check(LeftistHeapMerge.merge(null, null) == null, "merge null null");
        check(LeftistHeapMerge.merge(null, lone) == lone, "merge null lone");
        LeftistHeapMerge.Node lone2 = new LeftistHeapMerge.Node(6);
        check(LeftistHeapMerge.merge(lone2, null) == lone2, "merge lone2 null");

        // -- merge of two single-node heaps --
        LeftistHeapMerge.kindIsMax = false;
        LeftistHeapMerge.Node m = LeftistHeapMerge.merge(new LeftistHeapMerge.Node(9), new LeftistHeapMerge.Node(3));
        checkEq(m.key, 3, "two-node merge root");
        check(myIsValidLeftist(m), "two-node merge valid");
        collected = new java.util.ArrayList<>(); collectKeys(m);
        check(multisetMatches(collected.stream().mapToInt(Integer::intValue).toArray(), new int[]{9, 3}), "two-node merge multiset");

        // -- normal: min-heap, A (5 elements) merges with B (6 elements) --
        int[] aNormal = {9, 5, 12, 3, 15};
        int[] bNormal = {7, 20, 2, 11, 18, 6};
        LeftistHeapMerge.kindIsMax = false;
        LeftistHeapMerge.Node a = LeftistHeapMerge.buildFromValues(aNormal);
        LeftistHeapMerge.Node b = LeftistHeapMerge.buildFromValues(bNormal);
        check(myIsValidLeftist(a), "A valid leftist");
        check(myIsValidLeftist(b), "B valid leftist");
        LeftistHeapMerge.Node result = LeftistHeapMerge.merge(a, b);
        collected = new java.util.ArrayList<>(); collectKeys(result);
        checkEq(collected.size(), 11, "normal collected count");
        int[] allNormal = {9, 5, 12, 3, 15, 7, 20, 2, 11, 18, 6};
        check(multisetMatches(collected.stream().mapToInt(Integer::intValue).toArray(), allNormal), "normal multiset");
        checkEq(result.key, extremeOf(allNormal, false), "normal result root");
        check(myIsValidLeftist(result), "normal result valid");

        // -- hard: max, A ascending 8, B descending 7 --
        int[] aHard = {1, 2, 3, 4, 5, 6, 7, 8};
        int[] bHard = {30, 25, 20, 15, 10, 5, 1};
        LeftistHeapMerge.kindIsMax = true;
        LeftistHeapMerge.Node ah = LeftistHeapMerge.buildFromValues(aHard);
        LeftistHeapMerge.Node bh = LeftistHeapMerge.buildFromValues(bHard);
        LeftistHeapMerge.Node resh = LeftistHeapMerge.merge(ah, bh);
        collected = new java.util.ArrayList<>(); collectKeys(resh);
        checkEq(collected.size(), 15, "hard collected count");
        int[] allHard = {1, 2, 3, 4, 5, 6, 7, 8, 30, 25, 20, 15, 10, 5, 1};
        check(multisetMatches(collected.stream().mapToInt(Integer::intValue).toArray(), allHard), "hard multiset");
        checkEq(resh.key, 30, "hard result root");
        check(myIsValidLeftist(resh), "hard result valid");

        // -- edge: A is empty, merge with B (11 elements) --
        int[] bEdge = {6, 19, 3, 27, 11, 8, 35, 14, 22, 9, 41};
        LeftistHeapMerge.kindIsMax = false;
        LeftistHeapMerge.Node ae = LeftistHeapMerge.buildFromValues(new int[0]);
        LeftistHeapMerge.Node be = LeftistHeapMerge.buildFromValues(bEdge);
        check(ae == null, "empty A build is null");
        LeftistHeapMerge.Node rese = LeftistHeapMerge.merge(ae, be);
        check(rese == be, "merge with empty A returns B");
        collected = new java.util.ArrayList<>(); collectKeys(rese);
        check(multisetMatches(collected.stream().mapToInt(Integer::intValue).toArray(), bEdge), "edge multiset");
        checkEq(rese.key, extremeOf(bEdge, false), "edge result root");
        check(myIsValidLeftist(rese), "edge result valid");

        // -- edge: duplicates --
        int[] dup = {4, 4, 4, 4, 4, 4};
        LeftistHeapMerge.kindIsMax = true;
        LeftistHeapMerge.Node d = LeftistHeapMerge.buildFromValues(dup);
        check(myIsValidLeftist(d), "dup valid leftist");
        collected = new java.util.ArrayList<>(); collectKeys(d);
        checkEq(collected.size(), 6, "dup collected count");
        for (int v : collected) checkEq(v, 4, "dup value");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
