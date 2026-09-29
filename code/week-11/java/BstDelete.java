/* Week 11 -- Advanced Trees
 * Binary search tree (BST): delete (leaf / one child / two children with successor).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class BstDelete {
    static class Node {
        int key;
        Node left;
        Node right;
    }

    static Node bstBuildInsert(Node root, int key) {
        Node cur = root, parent = null;
        while (cur != null) {
            parent = cur;
            if (key == cur.key) return root;
            if (key < cur.key) cur = cur.left; else cur = cur.right;
        }
        Node n = new Node();
        n.key = key; n.left = null; n.right = null;
        if (parent == null) return n;
        if (key < parent.key) parent.left = n; else parent.right = n;
        return root;
    }

    static Node bstDelete(Node root, int key) {
        Node cur = root, parent = null;
        while (cur != null && key != cur.key) {
            parent = cur;
            cur = (key < cur.key) ? cur.left : cur.right;
        }
        if (cur == null) return root;                      // not found: no-op
        if (cur.left != null && cur.right != null) {
            Node succ = cur.right, succParent = cur;
            while (succ.left != null) { succParent = succ; succ = succ.left; }
            cur.key = succ.key;                             // copy successor key up
            parent = succParent;
            cur = succ;                                     // now splice out succ: <= 1 child
        }
        Node child = (cur.left != null) ? cur.left : cur.right;
        if (parent == null)            root = child;
        else if (parent.left == cur)   parent.left  = child;
        else                           parent.right = child;
        return root;
    }

    static void printInorder(Node n, StringBuilder sb) {
        if (n == null) return;
        printInorder(n.left, sb);
        sb.append(' ').append(n.key);
        printInorder(n.right, sb);
    }

    static void runScenario(String label, int[] keys, int[] dels) {
        System.out.println("-- " + label + " --");
        Node root = null;
        for (int key : keys) root = bstBuildInsert(root, key);
        StringBuilder sb0 = new StringBuilder();
        printInorder(root, sb0);
        System.out.println("tree built from " + keys.length + " keys, inorder =" + sb0);
        for (int d : dels) {
            root = bstDelete(root, d);
            StringBuilder sb = new StringBuilder();
            printInorder(root, sb);
            System.out.println("delete(" + d + "): inorder =" + sb);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {50, 30, 70, 20, 40, 60, 80, 35, 65, 90};
        int[] normalDels = {35, 70, 50, 20};
        runScenario("normal: 10 keys, 4 deletes (a mix of leaf, one-child, two-children)", normalKeys, normalDels);

        int[] hardKeys = {10, -5, 25, 40, -20, 5, 17, 30, 45, 3, 22, -15, 12, 60};
        int[] hardDels = {-5, 40, 10, 17, 60, 3};
        runScenario("hard: 14 keys with negative values, 6 deletes (including the root)", hardKeys, hardDels);

        int[] nfKeys = {50, 30, 70, 20, 40, 60, 80, 10, 45, 90};
        int[] nfDels = {999, 30, -1000};
        runScenario("edge: trying to delete a key that is not there (no-op)", nfKeys, nfDels);

        int[] emptyKeys = {5, 3, 8, 1, 4, 7, 9, 2, 6, 10};
        int[] emptyDels = {10, 6, 2, 9, 7, 4, 1, 8, 3, 5};
        runScenario("edge: delete every key, down to an empty tree", emptyKeys, emptyDels);

        int[] singleKeys = {7};
        int[] singleDels = {7};
        runScenario("edge: delete the only node", singleKeys, singleDels);
    }
}
