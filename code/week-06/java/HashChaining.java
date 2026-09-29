/* Week 6 -- Search and Hashing
 * Hash table with separate chaining: each bucket holds the head of a linked
 * list ("chain") of every key that hashed there. A collision grows the
 * chain instead of overwriting anything. Insertion is O(1); search walks
 * the chain, so its cost depends on the chain's length.
 * CEN207 Data Structures (formerly CE205)
 */
public class HashChaining {
    static class Node { int key; Node next; Node(int k, Node nx) { key = k; next = nx; } }

    static final int MAX_M = 16;
    static Node[] table = new Node[MAX_M];
    static int m;

    static int h(int key) { return ((key % m) + m) % m; }

    static void insert(int key) {
        int idx = h(key);
        table[idx] = new Node(key, table[idx]);   // new node becomes the head: O(1)
    }

    static int probesUsed;
    static boolean search(int key) {
        int idx = h(key);
        probesUsed = 0;
        for (Node cur = table[idx]; cur != null; cur = cur.next) {
            probesUsed++;
            if (cur.key == key) return true;
        }
        return false;
    }

    static void clearTable() { for (int i = 0; i < MAX_M; i++) table[i] = null; }

    static class Op { boolean isSearch; int value; Op(boolean s, int v) { isSearch = s; value = v; } }

    static void runScenario(String label, int mm, Op[] ops) {
        System.out.println("-- " + label + " --");
        System.out.println("m = " + mm);
        m = mm;
        clearTable();
        int inserted = 0;
        for (Op op : ops) {
            if (!op.isSearch) {
                int key = op.value;
                int idx = h(key);
                boolean collided = table[idx] != null;
                insert(key);
                inserted++;
                System.out.println("  insert(" + key + "): h(" + key + ") = " + idx
                        + (collided ? " -- collision, added at head of chain" : " -- empty bucket, new chain")
                        + " (load factor alpha = " + inserted + "/" + m + " = " + String.format("%.2f", (double) inserted / m) + ")");
            } else {
                int key = op.value;
                boolean found = search(key);
                System.out.println("  search(" + key + "): h(" + key + ") = " + h(key) + " -- " + (found ? "found" : "not found") + ", " + probesUsed + " probes");
            }
        }
        System.out.println("summary: " + inserted + " keys inserted, load factor alpha = " + String.format("%.2f", (double) inserted / m));
        System.out.println();
        clearTable();
    }

    public static void main(String[] args) {
        Op[] normal = {
            new Op(false, 23), new Op(false, 44), new Op(false, 15), new Op(false, 77), new Op(false, 8),
            new Op(false, 62), new Op(false, 31), new Op(false, 50), new Op(false, 19), new Op(false, 96),
            new Op(true, 23), new Op(true, 99), new Op(true, 96), new Op(true, 5)
        };
        Op[] hard = {
            new Op(false, 12), new Op(false, 27), new Op(false, 42), new Op(false, 7), new Op(false, 33),
            new Op(false, 18), new Op(false, 53), new Op(false, 9), new Op(false, 44), new Op(false, 21),
            new Op(false, 38), new Op(false, 16),
            new Op(true, 12), new Op(true, 100), new Op(true, 16), new Op(true, 61), new Op(true, 9)
        };
        Op[] singleBucket = {
            new Op(false, 5), new Op(false, 17), new Op(false, 29), new Op(false, 3), new Op(false, 41),
            new Op(false, 12), new Op(false, 8), new Op(false, 50), new Op(false, 23), new Op(false, 36),
            new Op(true, 36), new Op(true, 99)
        };
        Op[] highLoad = {
            new Op(false, 4), new Op(false, 10), new Op(false, 16), new Op(false, 22), new Op(false, 28),
            new Op(false, 34), new Op(false, 40), new Op(false, 46), new Op(false, 52), new Op(false, 58),
            new Op(false, 64), new Op(false, 70),
            new Op(true, 58), new Op(true, 100), new Op(true, 4)
        };

        runScenario("normal: m = 7, 10 inserts, 4 searches (hits and misses)", 7, normal);
        runScenario("hard: m = 5, 12 inserts: chains grow, 5 searches", 5, hard);
        runScenario("edge: m = 1, every key in one chain, search degrades to O(n)", 1, singleBucket);
        runScenario("edge: m = 3, 12 keys: load factor alpha = 4", 3, highLoad);
    }
}
