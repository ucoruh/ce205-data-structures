/* Week 11 -- Advanced Trees
 * Binary search tree (BST): insert. Duplicates are ignored (tree unchanged).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class BstInsert {
    static class Node {
        int key;
        Node left;
        Node right;
    }

    static Node bstInsert(Node root, int key) {
        Node cur = root, parent = null;
        while (cur != null) {
            parent = cur;
            if (key == cur.key) return root;               // duplicate: tree unchanged
            if (key < cur.key)  cur = cur.left;
            else                cur = cur.right;
        }
        Node n = new Node();
        n.key = key;
        n.left = null;
        n.right = null;
        if (parent == null) return n;                       // empty tree: n is the new root
        if (key < parent.key) parent.left = n;
        else                   parent.right = n;
        return root;
    }

    static int height(Node n) {
        if (n == null) return -1;
        int l = height(n.left), r = height(n.right);
        return 1 + Math.max(l, r);
    }

    static void printInorder(Node n, StringBuilder sb) {
        if (n == null) return;
        printInorder(n.left, sb);
        sb.append(' ').append(n.key);
        printInorder(n.right, sb);
    }

    static void runScenario(String label, int[] keys) {
        System.out.println("-- " + label + " --");
        Node root = null;
        for (int key : keys) {
            root = bstInsert(root, key);
            StringBuilder sb = new StringBuilder();
            printInorder(root, sb);
            System.out.println("insert(" + key + "): inorder =" + sb + "  height = " + height(root));
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {50, 30, 70, 20, 40, 60, 80, 35, 65, 90};
        runScenario("normal: 10 keys, a moderately mixed order", normal);

        int[] hard = {10, -5, 25, 10, -20, 5, 17, 30, -5, 3, 22, 40, -15, 12};
        runScenario("hard: 14 keys, negative values and a repeat", hard);

        int[] dup = {8, 8, 3, 8, 3, 15, 3, 8, 15, 8};
        runScenario("edge: 10 values, only 3 distinct keys", dup);

        int[] sorted = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        runScenario("edge: 10 keys in ascending order -- forms a near-chain", sorted);

        int[] single = {42};
        runScenario("edge: a single key", single);
    }
}
