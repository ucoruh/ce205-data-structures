/* Week 14 -- File Organisation II
 * B+-tree: every key lives in a LEAF (internal nodes only route); leaves are linked into a
 * chain, so a range query descends once and then just walks the chain.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.ArrayList;
import java.util.List;

public class BPlusTree {
    static class Node {
        int[] keys = new int[16];
        int n;
        Node[] child = new Node[17];
        boolean leaf;
        Node parent;
        Node next; // leaf chain; null for internal nodes and the last leaf

        Node(boolean leaf) { this.leaf = leaf; }
    }

    static void insertSorted(Node node, int key) {
        int i = node.n - 1;
        while (i >= 0 && node.keys[i] > key) {
            node.keys[i + 1] = node.keys[i];
            i--;
        }
        node.keys[i + 1] = key;
        node.n++;
    }

    static Node insertIntoParent(Node left, int key, Node right) {
        if (left.parent == null) {
            Node newRoot = new Node(false);
            newRoot.keys[newRoot.n++] = key;
            newRoot.child[0] = left;
            newRoot.child[1] = right;
            left.parent = newRoot;
            right.parent = newRoot;
            return newRoot;
        }
        Node parent = left.parent;
        insertSorted(parent, key);
        int pos = 0;
        while (parent.child[pos] != left)
            pos++;
        for (int i = parent.n; i > pos + 1; i--)
            parent.child[i] = parent.child[i - 1];
        parent.child[pos + 1] = right;
        right.parent = parent;
        return null; // not a new root
    }

    static Node bPlusInsert(Node root, int order, int key) {
        Node node = root;
        while (!node.leaf) {
            int i = 0;
            while (i < node.n && key >= node.keys[i])
                i++;
            node = node.child[i];
        }
        insertSorted(node, key);
        if (node.n != order)
            return root;

        int mid = (node.n + 1) / 2;
        int copyUp = node.keys[mid];
        Node right = new Node(true);
        for (int i = mid; i < node.n; i++)
            right.keys[right.n++] = node.keys[i];
        right.next = node.next;
        node.next = right;
        node.n = mid;
        Node newRoot = insertIntoParent(node, copyUp, right);
        if (newRoot != null)
            root = newRoot;

        Node cur = node.parent;
        while (cur != null && cur.n == order) {
            int mid2 = cur.n / 2;
            int pushUp = cur.keys[mid2];
            Node rightI = new Node(false);
            for (int i = mid2 + 1; i < cur.n; i++)
                rightI.keys[rightI.n++] = cur.keys[i];
            for (int i = mid2 + 1; i <= cur.n; i++) {
                rightI.child[i - mid2 - 1] = cur.child[i];
                rightI.child[i - mid2 - 1].parent = rightI;
            }
            cur.n = mid2;
            Node newRoot2 = insertIntoParent(cur, pushUp, rightI);
            if (newRoot2 != null) {
                root = newRoot2;
                break;
            }
            cur = cur.parent;
        }
        return root;
    }

    static Node firstLeaf(Node node) {
        while (!node.leaf)
            node = node.child[0];
        return node;
    }

    // Descend once to the first leaf that could hold lo, then follow the LEAF CHAIN.
    static List<Integer> rangeQuery(Node root, int lo, int hi) {
        Node node = root;
        while (!node.leaf) {
            int i = 0;
            while (i < node.n && lo >= node.keys[i])
                i++;
            node = node.child[i];
        }
        List<Integer> out = new ArrayList<>();
        while (node != null) {
            for (int i = 0; i < node.n; i++)
                if (node.keys[i] >= lo && node.keys[i] <= hi)
                    out.add(node.keys[i]);
            if (node.n > 0 && node.keys[node.n - 1] > hi)
                break; // past hi: stop
            node = node.next; // follow the chain, no re-descent
        }
        return out;
    }

    static void runScenario(String label, int order, int[] keys, int[][] ranges) {
        System.out.println("-- " + label + " --");
        System.out.println("ORDER=" + order);
        Node root = new Node(true);
        for (int key : keys)
            root = bPlusInsert(root, order, key);

        StringBuilder leavesLine = new StringBuilder("leaves:");
        for (Node leaf = firstLeaf(root); leaf != null; leaf = leaf.next) {
            leavesLine.append(" [");
            for (int i = 0; i < leaf.n; i++)
                leavesLine.append(i > 0 ? "," : "").append(leaf.keys[i]);
            leavesLine.append(']');
        }
        System.out.println(leavesLine);

        for (int[] rg : ranges) {
            List<Integer> out = rangeQuery(root, rg[0], rg[1]);
            StringBuilder sb = new StringBuilder("range(" + rg[0] + "," + rg[1] + ") ->");
            for (int v : out)
                sb.append(' ').append(v);
            if (out.isEmpty())
                sb.append(" (none)");
            System.out.println(sb);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
        int[][] normalRanges = {{6, 18}, {26, 100}, {15, 15}};
        runScenario("normal: order=4, 12 keys, 3 range queries", 4, normalKeys, normalRanges);

        int[] hardKeys = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
        int[][] hardRanges = {{3, 11}, {50, 60}};
        runScenario("hard: order=3, 14 keys, a long chain walk", 3, hardKeys, hardRanges);

        int[] wholeKeys = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
        int[][] wholeRanges = {{0, 999}};
        runScenario("edge: a range covering every key", 4, wholeKeys, wholeRanges);

        int[] emptyKeys = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
        int[][] emptyRanges = {{1000, 2000}, {-50, -1}};
        runScenario("edge: a range matching no key", 4, emptyKeys, emptyRanges);
    }
}
