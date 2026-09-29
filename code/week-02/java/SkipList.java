/* Week 2 -- Linked Lists, Arrays and Matrices
 * Skip list: a sorted linked list with an extra "express lane". Levels are
 * given explicitly per key (a deterministic stand-in for a coin flip), not
 * chosen at random, so every run is repeatable. Matches the skip-list.js
 * animation (MAX_LEVEL = 2: level 0 is the full list, level 1 is the
 * express lane).
 * CEN207 Data Structures (formerly CE205)
 */
public class SkipList {
    static final int MAX_LEVEL = 2;   // level 0 = the full list, level 1 = the express lane
    static class Node { int value; Node[] forward = new Node[MAX_LEVEL]; Node(int v) { value = v; } }
    static class SList { Node header = new Node(Integer.MIN_VALUE); }   // header: sentinel, present at every level

    static class SearchResult { boolean found; int comparisons; }

    static void insert(SList sl, int value, int level, boolean verbose) {
        Node[] update = new Node[MAX_LEVEL];
        Node cur = sl.header;
        for (int i = MAX_LEVEL - 1; i >= 0; i--) {
            while (cur.forward[i] != null && cur.forward[i].value < value)
                cur = cur.forward[i];
            update[i] = cur;             // predecessor of the new node at level i
        }
        Node n = new Node(value);
        for (int i = 0; i < level; i++) {
            n.forward[i] = update[i].forward[i];
            update[i].forward[i] = n;
        }
        if (verbose) System.out.println("sl_insert(" + value + ", level=" + level + ")");
    }

    static SearchResult search(SList sl, int value) {
        Node cur = sl.header;
        SearchResult r = new SearchResult();
        for (int i = MAX_LEVEL - 1; i >= 0; i--) {
            while (cur.forward[i] != null && cur.forward[i].value < value) {
                cur = cur.forward[i];    // go right
                r.comparisons++;
            }
            // else: drop down one level
        }
        cur = cur.forward[0];
        r.comparisons++;
        r.found = cur != null && cur.value == value;
        return r;
    }

    static void printSorted(SList sl) {
        StringBuilder sb = new StringBuilder("sorted:");
        for (Node cur = sl.header.forward[0]; cur != null; cur = cur.forward[0]) sb.append(' ').append(cur.value);
        System.out.println(sb);
    }

    static void runScenario(String label, int[] values, int[] levels, int[] searches) {
        System.out.println("-- " + label + " --");
        SList sl = new SList();
        for (int i = 0; i < values.length; i++)
            insert(sl, values[i], levels[i], true);
        printSorted(sl);
        for (int q : searches) {
            SearchResult r = search(sl, q);
            System.out.println("sl_search(" + q + "): " + (r.found ? "found" : "not found") + ", comparisons " + r.comparisons);
        }
        System.out.println();
    }

    public static void main(String[] args) {
        // normal: 10 keys, every other one on the express lane, two searches
        int[] normalV = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        int[] normalL = {1, 2, 1, 2, 1, 2, 1, 2, 1, 2};
        runScenario("normal: 10 keys, every other one on the express lane, two searches", normalV, normalL, new int[]{80, 999});

        // hard: 14 keys (duplicates/negatives), inserted out of sorted order
        int[] hardV = {50, -20, 10, 10, 70, -20, 30, 90, 30, 0, 60, 40, 80, 20};
        int[] hardL = {1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1};
        runScenario("hard: 14 keys (duplicates/negatives), inserted out of sorted order", hardV, hardL, new int[]{30, -20, 1000});

        // edge: 10 keys, only ONE node on the express lane
        int[] oneExpressV = {5, 15, 25, 35, 45, 55, 65, 75, 85, 95};
        int[] oneExpressL = {1, 1, 1, 2, 1, 1, 1, 1, 1, 1};
        runScenario("edge: 10 keys, only ONE node on the express lane", oneExpressV, oneExpressL, new int[]{35, 90});

        // edge: 12 keys: the first key, the last key, and a value that is not present
        int[] flV = {8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96};
        int[] flL = {2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1};
        runScenario("edge: 12 keys: the first key, the last key, and a value that is not present", flV, flL, new int[]{8, 96, 200});
    }
}
