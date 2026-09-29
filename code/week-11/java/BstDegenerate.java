/* Week 11 -- Advanced Trees
 * Why balancing matters: inserting the SAME set of keys in different orders gives wildly different BST
 * shapes. Sorted input degenerates into a chain -- height n-1, every operation O(n).
 * CEN207 Data Structures (formerly CE205)
 */
public class BstDegenerate {
    static class Node {
        int key;
        Node left;
        Node right;
    }

    static Node bstInsert(Node root, int key) {
        Node cur = root, parent = null;
        while (cur != null) {
            parent = cur;
            if (key == cur.key) return root;
            if (key < cur.key)  cur = cur.left;
            else                cur = cur.right;
        }
        Node n = new Node();
        n.key = key; n.left = null; n.right = null;
        if (parent == null) return n;
        if (key < parent.key) parent.left = n;
        else                   parent.right = n;
        return root;
    }

    static int height(Node n) {
        if (n == null) return -1;
        int l = height(n.left), r = height(n.right);
        return 1 + Math.max(l, r);
    }

    static int ilog2(int n) {
        int h = 0;
        while (n > 1) { n /= 2; h++; }
        return h;
    }

    static void runScenario(String label, int[] keys) {
        System.out.println("-- " + label + " --");
        Node root = null;
        for (int i = 0; i < keys.length; i++) {
            root = bstInsert(root, keys[i]);
            System.out.println("insert(" + keys[i] + "): height = " + height(root)
                    + "  (ideal for " + (i + 1) + " nodes = " + ilog2(i + 1) + ")");
        }
        int h = height(root), ideal = ilog2(keys.length);
        System.out.println("final: n = " + keys.length + ", height = " + h + ", ideal = " + ideal);
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        runScenario("normal: 10 keys in ascending order -- forms a chain", normal);

        int[] hard = {140, 130, 120, 110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10};
        runScenario("hard: 14 keys in descending order -- a chain the other way", hard);

        int[] zigzag = {10, 20, 15, 30, 25, 40, 35, 50, 45, 60};
        runScenario("edge: nearly sorted with small zig-zags (still deep)", zigzag);

        int[] shuffled = {6, 9, 2, 10, 4, 8, 1, 7, 3, 5};
        runScenario("edge: the SAME 10 keys shuffled -- much shallower", shuffled);

        int[] single = {42};
        runScenario("edge: a single key, height 0", single);
    }
}
