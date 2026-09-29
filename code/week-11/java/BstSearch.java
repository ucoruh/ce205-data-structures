/* Week 11 -- Advanced Trees
 * Binary search tree (BST): search.
 * CEN207 Data Structures (formerly CE205)
 */
public class BstSearch {
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

    static int probes;

    static boolean bstSearch(Node root, int key) {
        Node cur = root;
        probes = 0;
        while (cur != null) {
            probes++;
            if (key == cur.key) return true;
            if (key < cur.key) cur = cur.left;
            else                cur = cur.right;
        }
        return false;
    }

    static void runScenario(String label, int[] keys, int[] finds) {
        System.out.println("-- " + label + " --");
        Node root = null;
        for (int key : keys) root = bstBuildInsert(root, key);
        System.out.println("tree built from " + keys.length + " keys");
        for (int f : finds) {
            boolean found = bstSearch(root, f);
            System.out.println("search(" + f + "): " + (found ? "found" : "not found") + ", " + probes + " probes");
        }
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normalKeys = {50, 30, 70, 20, 40, 60, 80, 35, 65, 90};
        int[] normalFinds = {65, 20, 90, 55, 100};
        runScenario("normal: 10 keys, 3 hits and 2 misses", normalKeys, normalFinds);

        int[] hardKeys = {10, -5, 25, 40, -20, 5, 17, 30, 45, 3, 22, -15, 12, 60};
        int[] hardFinds = {-20, 60, 0, -5, 99};
        runScenario("hard: 14 keys with negative values, 5 searches", hardKeys, hardFinds);

        int[] boundKeys = {50, 30, 70, 20, 40, 60, 80, 10, 45, 90};
        int[] boundFinds = {-1000, 1000, 50};
        runScenario("edge: searching below the minimum and above the maximum", boundKeys, boundFinds);

        int[] chainKeys = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int[] chainFinds = {10, 1, 11};
        runScenario("edge: searching for the last key in a chain built from ascending inserts (O(n))", chainKeys, chainFinds);

        int[] singleKeys = {7};
        int[] singleFinds = {7, 3};
        runScenario("edge: a single node, search the root and a missing value", singleKeys, singleFinds);
    }
}
