/* Week 11 -- Advanced Trees
 * 2-3 tree: insert (growing upward via node splits).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.ArrayDeque;
import java.util.Queue;

public class TwoThreeTreeInsert {
    static class Node {
        int nkeys;                 // 1 or 2 (briefly 3 mid-overflow, before it is split)
        int[] key = new int[3];
        Node[] child = new Node[4]; // nkeys + 1 children, or none if a leaf (briefly 4 mid-overflow)
    }

    static Node makeLeaf(int key) {
        Node n = new Node();
        n.nkeys = 1; n.key[0] = key;
        return n;
    }

    static boolean isLeaf(Node n) { return n.child[0] == null; }

    static int childIndex(Node n, int key) {
        int i = 0;
        while (i < n.nkeys && key > n.key[i]) i++;
        return i;
    }

    static boolean leafHas(Node n, int key) {
        for (int i = 0; i < n.nkeys; i++) if (n.key[i] == key) return true;
        return false;
    }

    static void insertSorted(Node n, int key) {
        n.key[n.nkeys] = key;
        n.nkeys++;
        for (int i = n.nkeys - 1; i > 0 && n.key[i] < n.key[i - 1]; i--) {
            int tmp = n.key[i]; n.key[i] = n.key[i - 1]; n.key[i - 1] = tmp;
        }
    }

    static class Split { Node left, right; int promoted; }

    static Split splitNode(Node node) {
        int k0 = node.key[0], k1 = node.key[1], k2 = node.key[2];
        Split s = new Split();
        if (isLeaf(node)) {
            s.left = makeLeaf(k0);
            s.right = makeLeaf(k2);
        } else {
            s.left = new Node();
            s.left.nkeys = 1; s.left.key[0] = k0;
            s.left.child[0] = node.child[0]; s.left.child[1] = node.child[1];
            s.right = new Node();
            s.right.nkeys = 1; s.right.key[0] = k2;
            s.right.child[0] = node.child[2]; s.right.child[1] = node.child[3];
        }
        s.promoted = k1;
        return s;
    }

    static void replaceWithSplit(Node parent, Node old, int promoted, Node left, Node right) {
        int idx = 0;
        while (parent.child[idx] != old) idx++;
        for (int i = parent.nkeys; i > idx; i--) parent.child[i + 1] = parent.child[i];
        for (int i = parent.nkeys - 1; i >= idx; i--) parent.key[i + 1] = parent.key[i];
        parent.key[idx] = promoted;
        parent.child[idx] = left;
        parent.child[idx + 1] = right;
        parent.nkeys++;
    }

    static Node insert(Node root, int key) {
        if (root == null) return makeLeaf(key);
        Node[] path = new Node[32]; int depth = 0;
        Node cur = root;
        while (cur.child[0] != null) {                      // walk down to the right leaf
            path[depth++] = cur;
            int i = childIndex(cur, key);
            if (i < cur.nkeys && cur.key[i] == key) return root;   // duplicate: unchanged
            cur = cur.child[i];
        }
        if (leafHas(cur, key)) return root;                  // duplicate: unchanged
        insertSorted(cur, key);                              // leaf now has 2 or 3 keys
        Node node = cur;
        while (node.nkeys == 3) {                            // overflow: split and promote the middle key
            Split s = splitNode(node);
            if (depth == 0) {
                Node nr = new Node();
                nr.nkeys = 1; nr.key[0] = s.promoted;
                nr.child[0] = s.left; nr.child[1] = s.right;
                return nr;                                    // root split: height + 1
            }
            Node parent = path[--depth];
            replaceWithSplit(parent, node, s.promoted, s.left, s.right);
            node = parent;
        }
        return root;
    }

    static void printNode(Node n, StringBuilder sb) {
        sb.append('[');
        for (int i = 0; i < n.nkeys; i++) { if (i > 0) sb.append(','); sb.append(n.key[i]); }
        sb.append("] ");
    }

    static void printLevelOrder(Node root, StringBuilder sb) {
        Queue<Node> q = new ArrayDeque<>();
        q.add(root);
        while (!q.isEmpty()) {
            Node n = q.poll();
            printNode(n, sb);
            if (!isLeaf(n)) for (int i = 0; i <= n.nkeys; i++) q.add(n.child[i]);
        }
    }

    static int treeHeight(Node n) {
        if (n == null || isLeaf(n)) return 0;
        return 1 + treeHeight(n.child[0]);
    }

    static void runScenario(String label, int[] keys) {
        System.out.println("-- " + label + " --");
        Node root = null;
        for (int key : keys) {
            root = insert(root, key);
            StringBuilder sb = new StringBuilder();
            printLevelOrder(root, sb);
            System.out.println("insert(" + key + "): height = " + treeHeight(root) + ", level-order = " + sb);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        runScenario("normal: 10 keys in ascending order -- a few splits", normal);

        int[] hard = {50, 30, 70, 20, 40, 60, 80, 10, 90, 25, 35, 45, 55, 65};
        runScenario("hard: 14 keys, the root splits and the height grows", hard);

        int[] dup = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
        runScenario("edge: 10 values, many repeats", dup);

        int[] desc = {100, 90, 80, 70, 60, 50, 40, 30, 20, 10};
        runScenario("edge: 10 keys in descending order", desc);

        int[] single = {7};
        runScenario("edge: a single key", single);
    }
}
