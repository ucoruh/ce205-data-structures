/* Week 6 -- Search and Hashing
 * Open addressing with quadratic probing: on a collision, probe
 * home+1^2, home+2^2, home+3^2, ... (mod m) instead of home+1, home+2,
 * home+3 (linear probing). This avoids primary clustering, but if m is not
 * prime (or the load factor is above 0.5) the i^2 sequence can revisit the
 * same few slots forever and never reach a free one, even though the table
 * is not full.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class HashQuadraticProbing {
    static final int EMPTY = 0, OCCUPIED = 1;
    static final int MAX_M = 16;
    static int[] state = new int[MAX_M];
    static int[] table = new int[MAX_M];
    static int m;

    static int h(int key) { return ((key % m) + m) % m; }

    static int insert(int key, int[] probesOut) {
        int home = h(key);
        for (int i = 0; i < m; i++) {
            int idx = (home + i * i) % m;          // quadratic probing: i^2 offsets
            probesOut[0]++;
            if (state[idx] != OCCUPIED) {
                table[idx] = key;
                state[idx] = OCCUPIED;
                return idx;
            }
        }
        return -1;   // m probes tried: table full, OR (m not prime / alpha > 0.5) the
                     // sequence cycled without ever reaching a free slot
    }

    static int occupiedCount() { int c = 0; for (int i = 0; i < m; i++) if (state[i] == OCCUPIED) c++; return c; }
    static void clearTable() { for (int i = 0; i < MAX_M; i++) { state[i] = EMPTY; table[i] = 0; } }

    static void runScenario(String label, int mm, int[] keys) {
        System.out.println("-- " + label + " --");
        System.out.println("m = " + mm);
        m = mm;
        clearTable();
        int placedCount = 0, cycledCount = 0;
        for (int key : keys) {
            int[] probes = {0};
            int idx = insert(key, probes);
            if (idx != -1) {
                placedCount++;
                System.out.println("  insert(" + key + "): home=" + h(key) + ", placed at " + idx + " (" + probes[0] + " probe" + (probes[0] == 1 ? "" : "s") + ")");
            } else {
                int occ = occupiedCount();
                boolean cycled = occ < m;
                if (cycled) {
                    int freeCells = m - occ;
                    cycledCount++;
                    System.out.println("  insert(" + key + "): home=" + h(key) + ", CYCLED -- " + freeCells + " cell" + (freeCells == 1 ? "" : "s") + " still empty but never reached");
                } else {
                    System.out.println("  insert(" + key + "): home=" + h(key) + ", table full");
                }
            }
        }
        System.out.println("summary: " + placedCount + "/" + keys.length + " inserts placed"
                + (cycledCount > 0 ? (cycledCount == 1 ? ", 1 cycled despite free space existing" : ", multiple cycled despite free space existing") : ""));
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {7, 20, 33, 14, 29, 41, 56, 68, 81, 95};
        int[] hard = {4, 15, 26, 37, 48, 9, 20, 31, 42, 53};
        int[] cycle = {8, 9, 12, 26, 19, 5, 14, 16, 7, 24};

        runScenario("normal: m = 13 (prime), 10 keys, a few i^2 jumps", 13, normal);
        runScenario("hard: m = 11, two groups share a home: clear i^2 patterns", 11, hard);
        runScenario("edge: m = 8 (a power of 2), the cycle never finds the free slot", 8, cycle);
    }
}
