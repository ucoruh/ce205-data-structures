/* Week 14 -- File Organisation II
 * B-tree search (order m): descend from the root comparing the target against each page's
 * keys; every page visited is one disk read.
 * CEN207 Data Structures (formerly CE205)
 */
public class BTreeSearch {
    static class Node {
        int[] keys = new int[16];
        int n;
        Node[] child = new Node[17];
        boolean leaf;
        Node parent;

        Node(boolean leaf) { this.leaf = leaf; }
    }

    static void insertSorted(Node node, int key) {
        int i = node.n - 1;
        while (i >= 0 && node.keys[i] > key) {
            node.keys[i + 1] = node.keys[i];
            i--;
        }
        node.keys[i + 1] = key;
        node.n++;
    }

    static Node split(Node node, int[] medianOut) {
        int mid = node.n / 2;
        medianOut[0] = node.keys[mid];
        Node right = new Node(node.leaf);
        for (int i = mid + 1; i < node.n; i++)
            right.keys[right.n++] = node.keys[i];
        if (!node.leaf)
            for (int i = mid + 1; i <= node.n; i++) {
                right.child[i - mid - 1] = node.child[i];
                right.child[i - mid - 1].parent = right;
            }
        node.n = mid;
        return right;
    }

    static Node treeInsert(Node root, int order, int key) {
        Node leaf = root;
        while (!leaf.leaf) {
            int i = 0;
            while (i < leaf.n && key > leaf.keys[i])
                i++;
            leaf = leaf.child[i];
        }
        insertSorted(leaf, key);
        Node cur = leaf;
        while (cur.n == order) {
            int[] median = new int[1];
            Node right = split(cur, median);
            if (cur.parent == null) {
                Node newRoot = new Node(false);
                newRoot.keys[newRoot.n++] = median[0];
                newRoot.child[0] = cur;
                newRoot.child[1] = right;
                cur.parent = newRoot;
                right.parent = newRoot;
                return newRoot;
            }
            insertSorted(cur.parent, median[0]);
            Node parent = cur.parent;
            int pos = 0;
            while (parent.child[pos] != cur)
                pos++;
            for (int i = parent.n; i > pos + 1; i--)
                parent.child[i] = parent.child[i - 1];
            parent.child[pos + 1] = right;
            right.parent = parent;
            cur = parent;
        }
        return root;
    }

    // Returns the node containing `key`, or null if absent. reads[0] counts pages visited.
    static Node bTreeSearch(Node node, int key, int[] reads) {
        while (node != null) {
            reads[0]++;
            int i = 0;
            while (i < node.n && key > node.keys[i])
                i++;
            if (i < node.n && key == node.keys[i])
                return node;
            if (node.leaf)
                return null;
            node = node.child[i];
        }
        return null;
    }

    static void runScenario(String label, int order, int[] keys, int[] queries) {
        System.out.println("-- " + label + " --");
        System.out.println("ORDER=" + order);
        Node root = new Node(true);
        for (int key : keys)
            root = treeInsert(root, order, key);

        int totalReads = 0;
        for (int q : queries) {
            int[] reads = {0};
            Node found = bTreeSearch(root, q, reads);
            totalReads += reads[0];
            String unit = reads[0] == 1 ? "read" : "reads";
            System.out.println("search(" + q + ") -> " + (found != null ? "found" : "not found") + " (" + reads[0] + " " + unit + ")");
        }
        System.out.println("total reads: " + totalReads);
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
        int[] normalQ = {17, 99, 3};
        runScenario("normal: order=4, 12 keys, 3 searches", 4, normalKeys, normalQ);

        int[] hardKeys = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
        int[] hardQ = {1, 14, 7, 100};
        runScenario("hard: order=3, 14 ascending keys, 4 searches", 3, hardKeys, hardQ);

        int[] rootKeys = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
        int[] rootQ = {12};
        runScenario("edge: a key found right at the root", 4, rootKeys, rootQ);

        int[] neverKeys = {23, 5, 41, 12, 38, 7, 29, 16, 44, 3};
        int[] neverQ = {41, 100, 3};
        runScenario("edge: order=12, single node, every search is 1 read", 12, neverKeys, neverQ);
    }
}
