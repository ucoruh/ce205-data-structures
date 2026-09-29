/* Week 11 -- Advanced Trees
 * Splay tree: every access moves the accessed key to the root (zig, zig-zig, zig-zag).
 * CEN207 Data Structures (formerly CE205)
 */
public class SplayTree {
    static class Node {
        int key;
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

    static void rotateUp(Node x) {
        if (x == x.parent.left) rotateRight(x.parent); else rotateLeft(x.parent);
    }

    static void splay(Node x) {
        while (x.parent != null) {
            Node p = x.parent, g = p.parent;
            if (g == null)                                    { rotateUp(x); }
            else if ((x == p.left) == (p == g.left))           { rotateUp(p); rotateUp(x); }
            else                                                { rotateUp(x); rotateUp(x); }
        }
    }

    static Node accessKey(int key) {
        Node cur = root, parent = null;
        while (cur != null && cur.key != key) { parent = cur; cur = (key < cur.key) ? cur.left : cur.right; }
        if (cur == null) {
            cur = new Node();
            cur.key = key; cur.left = null; cur.right = null; cur.parent = parent;
            if (parent == null)         root = cur;
            else if (key < parent.key)  parent.left  = cur;
            else                        parent.right = cur;
        }
        splay(cur);
        return cur;
    }

    static void printInorder(Node n, StringBuilder sb) {
        if (n == null) return;
        printInorder(n.left, sb);
        sb.append(' ').append(n.key);
        printInorder(n.right, sb);
    }

    static void runScenario(String label, int[] ops) {
        System.out.println("-- " + label + " --");
        root = null;
        for (int op : ops) {
            accessKey(op);
            StringBuilder sb = new StringBuilder();
            printInorder(root, sb);
            System.out.println("access(" + op + "): root = " + root.key + ", inorder =" + sb);
        }
        System.out.println();
        root = null;
    }

    public static void main(String[] args) {
        int[] normal = {50, 30, 70, 20, 40, 60, 80, 10, 45, 20, 80, 10};
        runScenario("normal: 12 accesses: zig, zig-zig, and zig-zag all occur", normal);

        int[] hard = {64, 32, 96, 16, 48, 80, 112, 8, 24, 8, 96, 8, 40, 96, 8, 112};
        runScenario("hard: 16 accesses with repeats (locality)", hard);

        int[] rootAccess = {50, 30, 70, 20, 40, 50, 50, 60, 80, 50};
        runScenario("edge: accessing the root again (no rotation)", rootAccess);

        int[] newKey = {50, 30, 70, 20, 40, 60, 80, 35, 999, -999};
        runScenario("edge: accessing a missing key inserts it and splays it", newKey);

        int[] single = {7};
        runScenario("edge: a single access on an empty tree", single);
    }
}
