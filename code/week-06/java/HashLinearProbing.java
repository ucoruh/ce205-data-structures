/* Week 6 -- Search and Hashing
 * Open addressing with linear probing: every key lives directly IN the
 * table. On a collision, probe the next slot, wrapping around, until an
 * empty (or deleted) slot is found. A deleted slot gets a tombstone marker,
 * not a plain empty mark, so search keeps walking past it.
 * CEN207 Data Structures (formerly CE205)
 */
public class HashLinearProbing {
    static final int EMPTY = 0, OCCUPIED = 1, DELETED = 2;
    static final int MAX_M = 16;
    static int[] state = new int[MAX_M];
    static int[] table = new int[MAX_M];
    static int m;

    static int h(int key) { return ((key % m) + m) % m; }

    static int probes;

    static int insert(int key) {
        int idx = h(key);
        for (int i = 0; i < m; i++) {
            probes++;
            if (state[idx] != OCCUPIED) {          // EMPTY or DELETED: reuse this slot
                table[idx] = key;
                state[idx] = OCCUPIED;
                return idx;
            }
            idx = (idx + 1) % m;                   // linear probing: try the next slot
        }
        return -1;                              // table full: m slots probed, none free
    }

    static int search(int key) {
        int idx = h(key);
        for (int i = 0; i < m; i++) {
            probes++;
            if (state[idx] == EMPTY) return -1;   // gap: key cannot be further
            if (state[idx] == OCCUPIED && table[idx] == key) return idx;
            idx = (idx + 1) % m;
        }
        return -1;
    }

    static int deleteKey(int key) {
        int idx = h(key);
        for (int i = 0; i < m; i++) {
            probes++;
            if (state[idx] == EMPTY) return -1;
            if (state[idx] == OCCUPIED && table[idx] == key) { state[idx] = DELETED; return idx; }
            idx = (idx + 1) % m;
        }
        return -1;
    }

    static class Op { int kind; int value; Op(int k, int v) { kind = k; value = v; } }  // kind: 0 insert, 1 search, 2 delete

    static void clearTable() { for (int i = 0; i < MAX_M; i++) { state[i] = EMPTY; table[i] = 0; } }

    static void runScenario(String label, int mm, Op[] ops) {
        System.out.println("-- " + label + " --");
        System.out.println("m = " + mm);
        m = mm;
        clearTable();
        int placedCount = 0, rejected = 0;
        for (Op op : ops) {
            probes = 0;
            if (op.kind == 0) {
                int key = op.value;
                int idx = insert(key);
                if (idx == -1) { rejected++; System.out.println("  insert(" + key + "): table full, rejected (" + probes + " probes)"); }
                else { placedCount++; System.out.println("  insert(" + key + "): placed at " + idx + " (" + probes + " probe" + (probes == 1 ? "" : "s") + ")"); }
            } else if (op.kind == 1) {
                int key = op.value;
                int idx = search(key);
                System.out.println("  search(" + key + "): " + (idx == -1 ? "not found" : "found") + " (" + probes + " probes)");
            } else {
                int key = op.value;
                int idx = deleteKey(key);
                System.out.println("  delete(" + key + "): " + (idx == -1 ? "not found" : "deleted, tombstone left") + " (" + probes + " probes)");
            }
        }
        System.out.println("summary: " + placedCount + "/" + (placedCount + rejected) + " inserts placed" + (rejected > 0 ? " (table full for the rest)" : ""));
        System.out.println();
    }

    public static void main(String[] args) {
        Op[] normal = {
            new Op(0, 23), new Op(0, 34), new Op(0, 45), new Op(0, 12), new Op(0, 56), new Op(0, 67),
            new Op(0, 18), new Op(0, 29), new Op(0, 40), new Op(0, 51),
            new Op(1, 45), new Op(2, 34), new Op(1, 34)
        };
        Op[] hard = {
            new Op(0, 11), new Op(0, 22), new Op(0, 33), new Op(0, 44), new Op(0, 55), new Op(0, 5),
            new Op(0, 16), new Op(0, 27), new Op(0, 38), new Op(0, 49),
            new Op(1, 49), new Op(2, 22), new Op(1, 33), new Op(1, 22)
        };
        Op[] tableFull = {
            new Op(0, 3), new Op(0, 11), new Op(0, 19), new Op(0, 27), new Op(0, 35), new Op(0, 43),
            new Op(0, 51), new Op(0, 59), new Op(0, 99), new Op(0, 67)
        };
        Op[] tombstone = {
            new Op(0, 15), new Op(0, 26), new Op(0, 37), new Op(0, 8), new Op(0, 19), new Op(0, 30),
            new Op(0, 41), new Op(0, 52), new Op(0, 63), new Op(0, 74),
            new Op(2, 26), new Op(1, 37), new Op(1, 26)
        };

        runScenario("normal: m = 11, 10 inserts, a search and a delete", 11, normal);
        runScenario("hard: m = 11, the keys collide into two big clusters", 11, hard);
        runScenario("edge: m = 8, 8 keys into the same cell: the table fills exactly, later inserts are rejected", 8, tableFull);
        runScenario("edge: search after a delete, why it would go wrong without a tombstone", 11, tombstone);
    }
}
