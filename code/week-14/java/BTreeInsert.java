/* Week 14 -- File Organisation II
 * B-tree insert (order m): every node is one disk page; overflow splits a page in two and
 * pushes its median key up, growing the tree upward when the root itself splits.
 * CEN207 Data Structures (formerly CE205)
 */
import java.util.ArrayList;
import java.util.List;

public class BTreeInsert {
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

    static Node bTreeInsert(Node root, int order, int key) {
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

    static int treeHeight(Node node) {
        if (node.leaf)
            return 0;
        int best = 0;
        for (int i = 0; i <= node.n; i++)
            best = Math.max(best, treeHeight(node.child[i]));
        return best + 1;
    }

    static int nodeCount(Node node) {
        if (node.leaf)
            return 1;
        int count = 1;
        for (int i = 0; i <= node.n; i++)
            count += nodeCount(node.child[i]);
        return count;
    }

    static void printLevelOrder(Node root) {
        List<Node> queue = new ArrayList<>();
        queue.add(root);
        int levelEnd = 1, level = 0, i = 0;
        StringBuilder line = new StringBuilder("level 0:");
        while (i < queue.size()) {
            Node node = queue.get(i++);
            line.append(" [");
            for (int k = 0; k < node.n; k++)
                line.append(k > 0 ? "," : "").append(node.keys[k]);
            line.append(']');
            if (!node.leaf)
                for (int k = 0; k <= node.n; k++)
                    queue.add(node.child[k]);
            if (i == levelEnd && queue.size() > i) {
                System.out.println(line);
                level++;
                line = new StringBuilder("level " + level + ":");
                levelEnd = queue.size();
            }
        }
        System.out.println(line);
    }

    static void runScenario(String label, int order, int[] keys) {
        System.out.println("-- " + label + " --");
        System.out.println("ORDER=" + order);
        Node root = new Node(true);
        for (int key : keys)
            root = bTreeInsert(root, order, key);
        printLevelOrder(root);
        System.out.println("nodes=" + nodeCount(root) + " height=" + treeHeight(root));
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
        runScenario("normal: order=4, 12 mixed keys", 4, normalKeys);

        int[] hardKeys = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
        runScenario("hard: order=3, 14 ascending keys (worst case)", 3, hardKeys);

        int[] descKeys = {95, 85, 75, 65, 55, 45, 35, 25, 15, 5};
        runScenario("edge: order=3, 10 descending keys", 3, descKeys);

        int[] neverKeys = {23, 5, 41, 12, 38, 7, 29, 16, 44, 3};
        runScenario("edge: order=12, 10 keys -- never splits", 12, neverKeys);
    }
}
