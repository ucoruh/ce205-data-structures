/* Week 11 -- Advanced Trees
 * AVL tree: insert, with the balance factor bf = height(left) - height(right) shown for every step.
 * CEN207 Data Structures (formerly CE205)
 */
public class AvlInsert {
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
        if (key == root.key) return root;                  // duplicate: unchanged
        if (key < root.key) root.left  = avlInsert(root.left, key);
        else                 root.right = avlInsert(root.right, key);
        updateHeight(root);
        return rebalance(root);
    }

    static void printInorderBf(Node n, StringBuilder sb) {
        if (n == null) return;
        printInorderBf(n.left, sb);
        sb.append(' ').append(n.key).append("(bf=").append(height(n.left) - height(n.right)).append(')');
        printInorderBf(n.right, sb);
    }

    static void runScenario(String label, int[] keys) {
        System.out.println("-- " + label + " --");
        Node root = null;
        for (int key : keys) {
            root = avlInsert(root, key);
            StringBuilder sb = new StringBuilder();
            printInorderBf(root, sb);
            System.out.println("insert(" + key + "): height = " + height(root) + ", inorder(bf) =" + sb);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {6, 74, 51, 56, 26, 66, 98, 2, 9, 72};
        runScenario("normal: 10 keys, includes two double rotations (LR, RL)", normal);

        int[] hard = {71, 5, 59, 157, 87, 56, 131, 141, -44, 159, -14, -18, 158, -48};
        runScenario("hard: 14 keys with negative values, all four cases (LL/RR/LR/RL) occur", hard);

        int[] asc = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        runScenario("edge: 10 keys in ascending order -- AVL still stays balanced", asc);

        int[] desc = {100, 90, 80, 70, 60, 50, 40, 30, 20, 10};
        runScenario("edge: 10 keys in descending order", desc);

        int[] dup = {8, 8, 3, 8, 15, 3, 20, 3, 15, 8};
        runScenario("edge: 10 values, many repeats", dup);
    }
}
