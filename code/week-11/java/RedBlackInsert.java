/* Week 11 -- Advanced Trees
 * Red-black tree: insert (recoloring and rotations, the three cases named).
 * CEN207 Data Structures (formerly CE205)
 */
public class RedBlackInsert {
    static final int RED = 0;
    static final int BLACK = 1;

    static class Node {
        int key;
        int color;
        Node left;
        Node right;
        Node parent;
    }

    static Node root;

    static void rotateLeft(Node x) {
        Node y = x.right;
        x.right = y.left;
        if (y.left != null) y.left.parent = x;
        y.parent = x.parent;
        if (x.parent == null)          root = y;
        else if (x == x.parent.left)   x.parent.left  = y;
        else                           x.parent.right = y;
        y.left = x;
        x.parent = y;
    }

    static void rotateRight(Node y) {
        Node x = y.left;
        y.left = x.right;
        if (x.right != null) x.right.parent = y;
        x.parent = y.parent;
        if (y.parent == null)           root = x;
        else if (y == y.parent.left)    y.parent.left  = x;
        else                            y.parent.right = x;
        x.right = y;
        y.parent = x;
    }

    static void fixup(Node z) {
        while (z.parent != null && z.parent.color == RED) {
            Node p = z.parent, g = p.parent;
            Node u = (p == g.left) ? g.right : g.left;
            if (u != null && u.color == RED) {                          // case 1: red uncle
                p.color = BLACK; u.color = BLACK; g.color = RED; z = g; continue;
            }
            if (p == g.left) {
                if (z == p.right) { z = p; rotateLeft(z); p = z.parent; }        // case 2: triangle
                p.color = BLACK; g.color = RED; rotateRight(g);                  // case 3: line
            } else {
                if (z == p.left)   { z = p; rotateRight(z); p = z.parent; }
                p.color = BLACK; g.color = RED; rotateLeft(g);
            }
            break;
        }
        root.color = BLACK;
    }

    static void insert(int key) {
        Node y = null, x = root;
        while (x != null) {
            if (key == x.key) return;                       // duplicate: unchanged
            y = x;
            x = (key < x.key) ? x.left : x.right;
        }
        Node z = new Node();
        z.key = key; z.color = RED; z.left = null; z.right = null; z.parent = y;
        if (y == null) root = z;
        else if (key < y.key) y.left = z;
        else                  y.right = z;
        fixup(z);
    }

    static int blackHeight(Node n) {
        if (n == null) return 0;
        int l = blackHeight(n.left), r = blackHeight(n.right);
        int add = (n.color == BLACK) ? 1 : 0;
        return Math.max(l, r) + add;
    }

    static void printInorderColor(Node n, StringBuilder sb) {
        if (n == null) return;
        printInorderColor(n.left, sb);
        sb.append(' ').append(n.key).append(n.color == RED ? 'R' : 'B');
        printInorderColor(n.right, sb);
    }

    static void runScenario(String label, int[] keys) {
        System.out.println("-- " + label + " --");
        root = null;
        for (int key : keys) {
            insert(key);
            StringBuilder sb = new StringBuilder();
            printInorderColor(root, sb);
            System.out.println("insert(" + key + "): root = " + root.key + ", bh = " + blackHeight(root) + ", inorder =" + sb);
        }
        System.out.println();
        root = null;
    }

    public static void main(String[] args) {
        int[] normal = {3, 69, 31, 88, 50, 58, 98, 29, 14, 75};
        runScenario("normal: 10 keys, all three cases (1, 2, 3) occur", normal);

        int[] hard = {50, 40, 60, 30, 45, 55, 70, 20, 35, 42, 48, 80, 75, 10};
        runScenario("hard: 14 keys, includes rotation cases (2 and 3)", hard);

        int[] asc = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        runScenario("edge: 10 keys in ascending order -- red-black still stays balanced", asc);

        int[] desc = {100, 90, 80, 70, 60, 50, 40, 30, 20, 10};
        runScenario("edge: 10 keys in descending order", desc);

        int[] dup = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
        runScenario("edge: 10 values, many repeats", dup);
    }
}
