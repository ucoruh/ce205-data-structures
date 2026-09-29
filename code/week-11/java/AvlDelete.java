/* Week 11 -- Advanced Trees
 * AVL tree: delete. Splicing is exactly BstDelete.java's leaf / one-child / two-children (successor) logic;
 * afterwards rebalance() is applied at EVERY ancestor on the way back up (a delete can rotate more than
 * once, unlike an insert).
 * CEN207 Data Structures (formerly CE205)
 */
public class AvlDelete {
    static class Node {
        int key;
        Node left;
        Node right;
        int height;
    }

    static int height(Node n) { return n == null ? -1 : n.height; }
    static void updateHeight(Node n) { n.height = 1 + Math.max(height(n.left), height(n.right)); }

    static Node rotateRight(Node y) {
        Node x = y.left;
        y.left = x.right;
        x.right = y;
        updateHeight(y);
        updateHeight(x);
        return x;
    }

    static Node rotateLeft(Node x) {
        Node y = x.right;
        x.right = y.left;
        y.left = x;
        updateHeight(x);
        updateHeight(y);
        return y;
    }

    static Node rebalance(Node n) {
        if (n == null) return null;
        int bf = height(n.left) - height(n.right);
        if (bf > 1  && height(n.left.left)  >= height(n.left.right))  return rotateRight(n);
        if (bf > 1)  { n.left  = rotateLeft(n.left);   return rotateRight(n); }
        if (bf < -1 && height(n.right.right) >= height(n.right.left)) return rotateLeft(n);
        if (bf < -1) { n.right = rotateRight(n.right); return rotateLeft(n); }
        return n;
    }

    static Node makeLeaf(int key) {
        Node n = new Node();
        n.key = key; n.left = null; n.right = null; n.height = 0;
        return n;
    }

    static Node avlInsert(Node root, int key) {
        if (root == null) return makeLeaf(key);
        if (key == root.key) return root;
        if (key < root.key) root.left  = avlInsert(root.left, key);
        else                 root.right = avlInsert(root.right, key);
        updateHeight(root);
        return rebalance(root);
    }

    static Node avlDelete(Node root, int key) {
        if (root == null) return null;                       // not found: no-op
        if (key < root.key)      root.left  = avlDelete(root.left, key);
        else if (key > root.key) root.right = avlDelete(root.right, key);
        else {
            if (root.left == null)  { Node r = root.right; return rebalance(r); }
            if (root.right == null) { Node l = root.left;  return rebalance(l); }
            Node succ = root.right;
            while (succ.left != null) succ = succ.left;
            root.key = succ.key;
            root.right = avlDelete(root.right, succ.key);
        }
        updateHeight(root);
        return rebalance(root);
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
        for (int key : keys) root = avlInsert(root, key);
        System.out.println("built from " + keys.length + " keys, height = " + height(root));
        for (int d : dels) {
            root = avlDelete(root, d);
            StringBuilder sb = new StringBuilder();
            printInorder(root, sb);
            System.out.println("delete(" + d + "): height = " + height(root) + ", inorder =" + sb);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 90};
        int[] normalDels = {10, 25, 90, 50};
        runScenario("normal: 12 keys, 4 deletes (a mix of leaf/one-child/two-children)", normalKeys, normalDels);

        int[] hardKeys = {50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85, 90};
        int[] hardDels = {90, 85, 80, 75, 55, 45};
        runScenario("hard: 16 keys, 6 deletes, rebalancing cascades", hardKeys, hardDels);

        int[] nfKeys = {50, 30, 70, 20, 40, 60, 80, 10, 45, 90};
        int[] nfDels = {999, 30, -1000};
        runScenario("edge: deleting a key that is not there (no-op)", nfKeys, nfDels);

        int[] emptyKeys = {5, 3, 8, 1, 4, 7, 9, 2, 6, 10};
        int[] emptyDels = {10, 6, 2, 9, 7, 4, 1, 8, 3, 5};
        runScenario("edge: delete every key, down to empty (stays balanced at every step)", emptyKeys, emptyDels);

        int[] singleKeys = {7};
        int[] singleDels = {7};
        runScenario("edge: delete the only node", singleKeys, singleDels);
    }
}
