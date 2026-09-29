/* Week 6 -- Search and Hashing
 * Rehashing: open addressing (linear probing) works only while the table
 * has room. When the load factor n/m goes past a threshold, we allocate a
 * bigger table -- size = the next prime at least 2*m -- and reinsert every
 * key into it from scratch (every key's index can change, since the
 * modulus changed). This keeps the average probe length bounded as the
 * table grows.
 * CEN207 Data Structures (formerly CE205)
 */
public class Rehashing {
    static final int EMPTY = 0, OCCUPIED = 1;
    static double threshold = 0.8;
    static int[] state; static int[] table; static int m, n;   // current table, its size, and how many keys are in it

    static boolean isPrime(int x) {
        if (x < 2) return false;
        for (int i = 2; (long) i * i <= x; i++) if (x % i == 0) return false;
        return true;
    }
    static int nextPrime(int x) { while (!isPrime(x)) x++; return x; }

    static int insertInto(int[] st, int[] tb, int mm, int key) {         // returns the index used
        int idx = ((key % mm) + mm) % mm;
        for (int i = 0; i < mm; i++) {
            if (st[idx] != OCCUPIED) { tb[idx] = key; st[idx] = OCCUPIED; return idx; }
            idx = (idx + 1) % mm;
        }
        return -1;
    }

    static void rehash() {
        int newM = nextPrime(2 * m);
        int[] newState = new int[newM], newTable = new int[newM];
        System.out.println("  rehash: alpha exceeded " + String.format("%.2f", threshold) + ", growing table " + m + " -> " + newM);
        for (int i = 0; i < m; i++) {
            if (state[i] == OCCUPIED) {
                int newIdx = insertInto(newState, newTable, newM, table[i]);
                System.out.println("    move key " + table[i] + ": old index " + i + " -> new index " + newIdx);
            }
        }
        state = newState; table = newTable; m = newM;
    }

    static void insert(int key) {
        int idx = insertInto(state, table, m, key);
        n++;
        System.out.println("  insert(" + key + "): placed at " + idx + ", n=" + n + ", m=" + m + ", alpha=" + String.format("%.2f", (double) n / m));
        if ((double) n / m > threshold) rehash();
    }

    static void runScenario(String label, int m0, double thr, int[] keys) {
        System.out.println("-- " + label + " --");
        System.out.println("m0 = " + m0 + ", threshold = " + String.format("%.2f", thr));
        threshold = thr;
        m = m0; n = 0;
        state = new int[m];
        table = new int[m];
        for (int key : keys) insert(key);
        System.out.println("summary: " + n + " keys inserted, table grew from " + m0 + " to " + m + ", final alpha=" + String.format("%.2f", (double) n / m));
        System.out.println();
    }

    public static void main(String[] args) {
        int[] normal = {15, 22, 8, 31, 44, 3, 27, 56, 19, 40};
        int[] hard = {12, 18, 24, 30, 36, 7, 13, 19, 25, 31};
        int[] doubleRehash = {5, 12, 19, 26, 9, 16};

        runScenario("normal: m0 = 6, 10 keys: grows once", 6, 0.8, normal);
        runScenario("hard: m0 = 6, keys cluster at the same home, growing relieves it", 6, 0.8, hard);
        runScenario("edge: m0 = 2, a tiny table grows twice in a row", 2, 0.8, doubleRehash);
    }
}
