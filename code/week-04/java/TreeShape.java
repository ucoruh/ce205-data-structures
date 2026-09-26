/* Week 4 -- Trees, Heaps, and Huffman Coding
 * Binary tree shapes: full, complete, perfect, degenerate, height-balanced.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class TreeShape {
    static final int SLOT_NONE = Integer.MIN_VALUE;

    static class Node {
        int value;
        Node left, right;
        Node(int value) { this.value = value; }
    }

    static Node buildTree(int[] arr, int n, int i) {
        if (i >= n || arr[i] == SLOT_NONE) return null;
        Node node = new Node(arr[i]);
        node.left = buildTree(arr, n, 2 * i + 1);
        node.right = buildTree(arr, n, 2 * i + 2);
        return node;
    }

    static Node buildLeftChain(int[] values) {
        Node root = null, tail = null;
        for (int v : values) {
            Node node = new Node(v);
            if (root == null) root = node; else tail.left = node;
            tail = node;
        }
        return root;
    }

    // A full binary tree (every node 0 or 2 children) shaped like a caterpillar: at each spine level
    // one child is a leaf and the other continues the spine -- maximally unbalanced and far from
    // complete. Always has an ODD node count: 2*spine + 1.
    static Node buildFullCaterpillar(int spine, int start, int step) {
        int val = start;
        Node root = new Node(val); val += step;
        Node cur = root;
        for (int i = 0; i < spine; i++) {
            cur.left = new Node(val); val += step;     // one child is always a leaf
            cur.right = new Node(val); val += step;
            if (i != spine - 1) cur = cur.right;        // continue the spine, except on the last step
        }
        return root;
    }

    // full: every node has 0 or 2 children (never exactly 1)
    static boolean isFull(Node n) {
        if (n == null) return true;
        boolean hasL = n.left != null, hasR = n.right != null;
        if (hasL != hasR) return false;        // exactly one child: not full
        return isFull(n.left) && isFull(n.right);
    }

    // complete: walking level by level, once a null is seen no real node may follow it
    static boolean isComplete(Node root) {
        java.util.LinkedList<Node> queue = new java.util.LinkedList<>();  // ArrayDeque rejects null elements
        queue.add(root);
        boolean seenGap = false;
        while (!queue.isEmpty()) {
            Node n = queue.poll();
            if (n == null) { seenGap = true; continue; }
            if (seenGap) return false;          // a real node after a gap
            queue.add(n.left);
            queue.add(n.right);
        }
        return true;
    }

    // perfect: full AND every leaf on the same level
    static boolean isPerfect(Node n, int depth, int[] leafDepth) {
        if (n == null) return true;
        if (n.left == null && n.right == null) {
            if (leafDepth[0] == -1) leafDepth[0] = depth;
            return depth == leafDepth[0];
        }
        if (n.left == null || n.right == null) return false;    // not full
        return isPerfect(n.left, depth + 1, leafDepth) && isPerfect(n.right, depth + 1, leafDepth);
    }

    // degenerate: no node has two children (every node has 0 or 1)
    static boolean isDegenerate(Node n) {
        if (n == null) return true;
        if (n.left != null && n.right != null) return false;    // two children: not degenerate
        return isDegenerate(n.left) && isDegenerate(n.right);
    }

    // balanced: |height(left) - height(right)| <= 1 at every node; -1 means "unbalanced already found"
    static int checkBalance(Node n) {
        if (n == null) return 0;
        int hl = checkBalance(n.left);
        if (hl == -1) return -1;
        int hr = checkBalance(n.right);
        if (hr == -1) return -1;
        if (Math.abs(hl - hr) > 1) return -1;  // found an unbalanced node
        return 1 + Math.max(hl, hr);
    }

    static void classify(String label, Node root) {
        System.out.println("-- " + label + " --");
        int[] leafDepth = {-1};
        boolean full = isFull(root);
        boolean complete = isComplete(root);
        boolean perfect = isPerfect(root, 0, leafDepth);
        boolean degenerate = isDegenerate(root);
        int balance = checkBalance(root);
        System.out.println("full=" + full + ", complete=" + complete + ", perfect=" + perfect +
                            ", degenerate=" + degenerate + ", balanced=" + (balance != -1));
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 12 nodes, complete but not perfect
        int[] normalArr = {50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55};
        classify("normal: 12 nodes, complete but not perfect", buildTree(normalArr, 12, 0));

        // hard: 17 nodes, full but not complete and unbalanced -- a "caterpillar" tree
        classify("hard: 17 nodes, full but not complete -- a caterpillar tree", buildFullCaterpillar(8, 100, 5));

        // edge: a perfect tree, 15 nodes, 4 full levels
        int[] perfectArr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
        classify("edge: perfect tree, 15 nodes", buildTree(perfectArr, 15, 0));

        // edge: a left-leaning chain (degenerate), 10 nodes
        int[] chainValues = {90, 84, 78, 72, 66, 60, 54, 48, 42, 36};
        classify("edge: left-leaning chain (degenerate), 10 nodes", buildLeftChain(chainValues));

        // edge: complete but NOT full, 10 nodes
        int[] completeNotFullArr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        classify("edge: complete but NOT full, 10 nodes", buildTree(completeNotFullArr, 10, 0));

        // edge: balanced but NOT complete, 11 nodes
        int[] balancedNotCompleteArr = {1, 2, 3, 4, 5, 6, 7, 8, SLOT_NONE, 9, SLOT_NONE, 10, SLOT_NONE, 11};
        classify("edge: balanced but NOT complete, 11 nodes", buildTree(balancedNotCompleteArr, 14, 0));
    }
}
