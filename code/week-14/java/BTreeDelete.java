/* Week 14 -- File Organisation II
 * B-tree delete (order m): remove a key, then fix underflow by BORROWING a key from a sibling
 * through the parent, or MERGING with a sibling when no sibling can spare one.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class BTreeDelete {
    static class Node {
        int[] keys = new int[16];
        int n;
        Node[] child = new Node[17];
        boolean leaf;
        Node parent;

        Node(boolean leaf) { this.leaf = leaf; }
    }

    static int minKeys(int order) { return (order + 1) / 2 - 1; }

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

    static void removeAt(Node node, int idx) {
        for (int i = idx; i < node.n - 1; i++)
            node.keys[i] = node.keys[i + 1];
        node.n--;
    }

    static int childIndex(Node parent, Node child) {
        int i = 0;
        while (parent.child[i] != child)
            i++;
        return i;
    }

    static void fixUnderflow(Node node, int order) {
        int minK = minKeys(order);
        while (node.parent != null && node.n < minK) {
            Node parent = node.parent;
            int idx = childIndex(parent, node);
            Node left = idx > 0 ? parent.child[idx - 1] : null;
            Node right = idx < parent.n ? parent.child[idx + 1] : null;

            if (left != null && left.n > minK) {
                for (int i = node.n; i > 0; i--)
                    node.keys[i] = node.keys[i - 1];
                node.keys[0] = parent.keys[idx - 1];
                node.n++;
                parent.keys[idx - 1] = left.keys[left.n - 1];
                left.n--;
                if (!node.leaf) {
                    for (int i = node.n; i > 0; i--)
                        node.child[i] = node.child[i - 1];
                    node.child[0] = left.child[left.n + 1];
                    node.child[0].parent = node;
                }
                return;
            }
            if (right != null && right.n > minK) {
                node.keys[node.n++] = parent.keys[idx];
                parent.keys[idx] = right.keys[0];
                removeAt(right, 0);
                if (!node.leaf) {
                    node.child[node.n] = right.child[0];
                    node.child[node.n].parent = node;
                    for (int i = 0; i < right.n + 1; i++)
                        right.child[i] = right.child[i + 1];
                }
                return;
            }
            if (left != null) {
                left.keys[left.n++] = parent.keys[idx - 1];
                for (int i = 0; i < node.n; i++)
                    left.keys[left.n++] = node.keys[i];
                if (!node.leaf)
                    for (int i = 0; i <= node.n; i++) {
                        left.child[left.n - node.n + i] = node.child[i];
                        left.child[left.n - node.n + i].parent = left;
                    }
                for (int i = idx - 1; i < parent.n - 1; i++)
                    parent.keys[i] = parent.keys[i + 1];
                for (int i = idx; i < parent.n; i++)
                    parent.child[i] = parent.child[i + 1];
                parent.n--;
                node = parent;
            } else {
                node.keys[node.n++] = parent.keys[idx];
                for (int i = 0; i < right.n; i++)
                    node.keys[node.n++] = right.keys[i];
                if (!node.leaf)
                    for (int i = 0; i <= right.n; i++) {
                        node.child[node.n - right.n + i] = right.child[i];
                        node.child[node.n - right.n + i].parent = node;
                    }
                for (int i = idx; i < parent.n - 1; i++)
                    parent.keys[i] = parent.keys[i + 1];
                for (int i = idx + 1; i < parent.n; i++)
                    parent.child[i] = parent.child[i + 1];
                parent.n--;
                node = parent;
            }
        }
    }

    static Node findNode(Node root, int key, int[] outIdx) {
        Node node = root;
        while (node != null) {
            int i = 0;
            while (i < node.n && key > node.keys[i])
                i++;
            if (i < node.n && key == node.keys[i]) {
                outIdx[0] = i;
                return node;
            }
            if (node.leaf)
                return null;
            node = node.child[i];
        }
        return null;
    }

    static Node bTreeDelete(Node root, int order, int key, boolean[] found) {
        int[] idx = new int[1];
        Node node = findNode(root, key, idx);
        found[0] = node != null;
        if (!found[0])
            return root;
        if (node.leaf) {
            removeAt(node, idx[0]);
            fixUnderflow(node, order);
        } else {
            Node pred = node.child[idx[0]];
            while (!pred.leaf)
                pred = pred.child[pred.n];
            node.keys[idx[0]] = pred.keys[pred.n - 1];
            removeAt(pred, pred.n - 1);
            fixUnderflow(pred, order);
        }
        if (!root.leaf && root.n == 0) {
            Node newRoot = root.child[0];
            newRoot.parent = null;
            root = newRoot;
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

    static void runScenario(String label, int order, int[] keys, int[] deletes) {
        System.out.println("-- " + label + " --");
        System.out.println("ORDER=" + order + " MIN_KEYS=" + minKeys(order));
        Node root = new Node(true);
        for (int key : keys)
            root = treeInsert(root, order, key);

        for (int key : deletes) {
            boolean[] found = new boolean[1];
            root = bTreeDelete(root, order, key, found);
            System.out.println("delete(" + key + ") -> " + (found[0] ? "removed" : "not present"));
        }
        System.out.println("nodes=" + nodeCount(root) + " height=" + treeHeight(root));
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
        int[] normalDel = {6, 12, 30};
        runScenario("normal: order=4, 12 keys, 3 deletes", 4, normalKeys, normalDel);

        int[] hardKeys = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};
        int[] hardDel = {1, 2, 3, 4};
        runScenario("hard: order=3, 14 ascending keys, chained merges", 3, hardKeys, hardDel);

        int[] nfKeys = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 18, 15};
        int[] nfDel = {999, 6};
        runScenario("edge: deleting a key that is not present", 4, nfKeys, nfDel);

        int[] shrinkKeys = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110};
        int[] shrinkDel = {10, 20, 30, 40, 50, 60, 70};
        runScenario("edge: delete until the root shrinks", 3, shrinkKeys, shrinkDel);
    }
}
