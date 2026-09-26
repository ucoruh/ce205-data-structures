/* Week 4 -- Trees, Heaps, and Huffman Coding
 * Leftist heap merge, the operation everything else (insert, extract) is
 * built from. The recursive form used here always keeps the shorter side
 * (by null path length, npl) on the right -- the leftist property.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class LeftistHeapMerge {
    static class Node {
        int key;
        int npl;                   // null path length: distance to the nearest missing child
        Node left, right;
        Node(int key) { this.key = key; }
    }

    static boolean kindIsMax;

    static boolean better(int a, int b) {
        return kindIsMax ? (a > b) : (a < b);
    }

    // null path length: null has npl -1
    static int npl(Node t) { return t != null ? t.npl : -1; }

    // merge: the better root wins, its right subtree absorbs the other heap;
    // then the leftist property is restored on the way back up
    static Node merge(Node t1, Node t2) {
        if (t1 == null) return t2;
        if (t2 == null) return t1;
        if (!better(t1.key, t2.key)) {
            Node tmp = t1; t1 = t2; t2 = tmp;   // t1 is now the better root
        }
        t1.right = merge(t1.right, t2);
        if (npl(t1.left) < npl(t1.right)) {
            Node tmp = t1.left; t1.left = t1.right; t1.right = tmp;
        }
        t1.npl = npl(t1.right) + 1;
        return t1;
    }

    static Node buildFromValues(int[] values) {
        Node h = null;
        for (int v : values) h = merge(h, new Node(v));
        return h;
    }

    static void printTree(Node node, int depth, StringBuilder sb) {
        if (node == null) return;
        for (int i = 0; i < depth; i++) sb.append("  ");
        sb.append(node.key).append(" (npl=").append(node.npl).append(")\n");
        printTree(node.left, depth + 1, sb);
        printTree(node.right, depth + 1, sb);
    }

    static class Counter { int count; int best; boolean haveBest; }

    static void countAndBest(Node node, Counter c) {
        if (node == null) return;
        c.count++;
        if (!c.haveBest || better(node.key, c.best)) { c.best = node.key; c.haveBest = true; }
        countAndBest(node.left, c);
        countAndBest(node.right, c);
    }

    // checks both the heap-order property (no child beats its parent) and the
    // leftist property (the right side's npl is never longer than the left's)
    static boolean isLeftist(Node node) {
        if (node == null) return true;
        if (node.left != null && better(node.left.key, node.key)) return false;
        if (node.right != null && better(node.right.key, node.key)) return false;
        if (npl(node.left) < npl(node.right)) return false;
        return isLeftist(node.left) && isLeftist(node.right);
    }

    static void runScenario(String label, boolean isMax, int[] aValues, int[] bValues) {
        System.out.println("-- " + label + " --");
        kindIsMax = isMax;

        Node a = buildFromValues(aValues);
        Node b = buildFromValues(bValues);
        StringBuilder sb = new StringBuilder();
        sb.append("heap A (").append(aValues.length).append(" elements):\n");
        printTree(a, 1, sb);
        sb.append("heap B (").append(bValues.length).append(" elements):\n");
        printTree(b, 1, sb);

        Node result = merge(a, b);
        sb.append("merge(A, B):\n");
        printTree(result, 1, sb);
        System.out.print(sb);

        Counter c = new Counter();
        countAndBest(result, c);
        System.out.println("total elements = " + c.count + ", best value = " + (c.haveBest ? c.best : 0) +
                            ", leftist property holds = " + isLeftist(result));
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: min, A (5 elements) merges with B (6 elements)
        int[] aNormal = {9, 5, 12, 3, 15};
        int[] bNormal = {7, 20, 2, 11, 18, 6};
        runScenario("normal: min, A (5) merges with B (6)", false, aNormal, bNormal);

        // hard: max, A ascending 8, B descending 7 -- a long right spine
        int[] aHard = {1, 2, 3, 4, 5, 6, 7, 8};
        int[] bHard = {30, 25, 20, 15, 10, 5, 1};
        runScenario("hard: max, A ascending 8, B descending 7", true, aHard, bHard);

        // edge: A is empty, merge with B (11 elements)
        int[] bEdge = {6, 19, 3, 27, 11, 8, 35, 14, 22, 9, 41};
        runScenario("edge: A is empty, merge with B (11 elements)", false, new int[0], bEdge);
    }
}
