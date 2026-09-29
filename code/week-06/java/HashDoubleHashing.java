/* Week 6 -- Search and Hashing
 * Open addressing with double hashing: the probe step itself depends on the
 * key, via a second hash function h2. probe(i) = (h1(key) + i * h2(key))
 * mod m. Two keys that collide at the same home cell usually follow
 * different paths from there, unlike linear or quadratic probing where
 * every colliding key retraces the same path.
 * h2(key) = r - (key mod r) for a prime r < m: always in [1..r], so the
 * step is never 0 (a 0 step would reprobe the same cell forever).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class HashDoubleHashing {
    static final int EMPTY = 0, OCCUPIED = 1;
    static final int MAX_M = 16;
    static int[] state = new int[MAX_M];
    static int[] table = new int[MAX_M];
    static int m, r;

    static int h1(int key) { return ((key % m) + m) % m; }
    static int h2(int key) { return r - (((key % r) + r) % r); } // r prime, r < m: h2 in [1..r], never 0

    static int insert(int key, int[] probesOut) {
        int idx = h1(key), step = h2(key);
        for (int i = 0; i < m; i++) {
            probesOut[0]++;
            if (state[idx] != OCCUPIED) {
                table[idx] = key;
                state[idx] = OCCUPIED;
                return idx;
            }
            idx = (idx + step) % m;                          // every collision uses THIS key's own step
        }
        return -1;
    }

    /* For the closing comparison ONLY: what linear probing would have done on the same keys.
     * Not used for correctness anywhere -- a separate, simpler simulation. */
    static int simulateLinear(int[] keys, int mm, int[] totalOut) {
        boolean[] lstate = new boolean[MAX_M];
        int placed = 0;
        totalOut[0] = 0;
        for (int key : keys) {
            int idx = ((key % mm) + mm) % mm;
            for (int i = 0; i < mm; i++) {
                totalOut[0]++;
                if (!lstate[idx]) { lstate[idx] = true; placed++; break; }
                idx = (idx + 1) % mm;
            }
        }
        return placed;
    }

    static void clearTable() { for (int i = 0; i < MAX_M; i++) { state[i] = EMPTY; table[i] = 0; } }
    static int occupiedCount() { int c = 0; for (int i = 0; i < m; i++) if (state[i] == OCCUPIED) c++; return c; }

    static void runScenario(String label, int mm, int rr, int[] keys) {
        System.out.println("-- " + label + " --");
        System.out.println("m = " + mm + ", R = " + rr);
        m = mm; r = rr;
        clearTable();
        int placedCount = 0, totalProbes = 0;
        for (int key : keys) {
            int[] probes = {0};
            int idx = insert(key, probes);
            totalProbes += probes[0];
            if (idx != -1) {
                placedCount++;
                System.out.println("  insert(" + key + "): h1=" + h1(key) + " h2=" + h2(key) + ", placed at " + idx + " (" + probes[0] + " probe" + (probes[0] == 1 ? "" : "s") + ")");
            } else {
                int occ = occupiedCount();
                boolean cycled = occ < m;
                if (cycled) {
                    int freeCells = m - occ;
                    System.out.println("  insert(" + key + "): h1=" + h1(key) + " h2=" + h2(key) + ", CYCLED -- " + freeCells + " cell" + (freeCells == 1 ? "" : "s") + " still empty but never reached");
                } else {
                    System.out.println("  insert(" + key + "): h1=" + h1(key) + " h2=" + h2(key) + ", table full");
                }
            }
        }
        int[] linTotal = {0};
        int linPlaced = simulateLinear(keys, m, linTotal);
        System.out.println("summary: " + placedCount + "/" + keys.length + " inserts, " + totalProbes + " probes in total. Linear probing on the same keys places "
                + linPlaced + "/" + keys.length + ", taking " + linTotal[0] + " probes.");
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {7, 20, 33, 14, 29, 41, 56, 68, 81, 95};
        int[] hard = {4, 17, 30, 43, 56, 8, 21, 34, 47, 60};
        int[] cycle = {13, 16, 10, 9, 2, 3, 5, 6, 4, 17};

        runScenario("normal: m = 13, R = 11, 10 keys: colliding keys use different steps", 13, 11, normal);
        runScenario("hard: m = 13, R = 11, many keys share a home", 13, 11, hard);
        runScenario("edge: m = 9 (not prime), the step shares a factor with m, a cycle forms", 9, 7, cycle);
    }
}
