/* Week 11 -- Advanced Trees
 * AVL tree: the four rebalancing cases (LL, RR, LR, RL). insert() is the standard recursive AVL insert;
 * rebalance() decides the case from the balance factors (not from the just-inserted key) and records which
 * one fired in lastCase, purely so this program can print it.
 * CEN207 Data Structures (formerly CE205)
 */
public class AvlRotations {
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

    static String lastCase;

    static Node rebalance(Node n) {
        int bf = height(n.left) - height(n.right);
        if (bf > 1  && height(n.left.left)  >= height(n.left.right))  { lastCase = "LL"; return rotateRight(n); }
        if (bf > 1)  { n.left  = rotateLeft(n.left);   lastCase = "LR"; return rotateRight(n); }
        if (bf < -1 && height(n.right.right) >= height(n.right.left)) { lastCase = "RR"; return rotateLeft(n); }
        if (bf < -1) { n.right = rotateRight(n.right); lastCase = "RL"; return rotateLeft(n); }
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

    static void runScenario(String label, int[] keys) {
        System.out.println("-- " + label + " --");
        Node root = null;
        for (int key : keys) {
            lastCase = "none";
            root = avlInsert(root, key);
            int bf = height(root.left) - height(root.right);
            System.out.printf("insert(%d): case = %-4s  root = %d  bf(root) = %d  height = %d%n",
                    key, lastCase, root.key, bf, height(root));
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] ll = {50, 30, 70, 20, 40, 60, 80, 10, 45, 5};
        runScenario("LL case: a single right rotation", ll);

        int[] rr = {50, 30, 70, 20, 40, 60, 80, 55, 90, 95};
        runScenario("RR case: a single left rotation", rr);

        int[] lr = {50, 70, 30, 80, 60, 40, 20, 55, 35, 36};
        runScenario("LR case: a double rotation (left-right)", lr);

        int[] rl = {50, 30, 70, 20, 40, 60, 80, 45, 65, 41};
        runScenario("RL case: a double rotation (right-left)", rl);

        int[] none = {50, 30, 70, 20, 40, 60, 80, 10, 90, 25};
        runScenario("edge: an insertion that needs no rotation at all", none);
    }
}
