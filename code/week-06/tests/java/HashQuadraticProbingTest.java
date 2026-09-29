/* Unit tests for week-06 java/HashQuadraticProbing.java, mirroring tests/c/test_hash_quadratic_probing.c */
public class HashQuadraticProbingTest {
    static int checks = 0, failures = 0;
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }

    static void checkOnProbeSequence() {
        int m = HashQuadraticProbing.m;
        for (int idx = 0; idx < m; idx++) {
            if (HashQuadraticProbing.state[idx] != HashQuadraticProbing.OCCUPIED) continue;
            int key = HashQuadraticProbing.table[idx];
            int home = ((key % m) + m) % m;
            boolean onSeq = false;
            for (int i = 0; i < m; i++) if ((home + i * i) % m == idx) { onSeq = true; break; }
            check(onSeq, "on probe sequence, key " + key + " at " + idx);
        }
    }

    public static void main(String[] args) {
        // -- (a) hand-traced: normal, m = 13 --
        {
            HashQuadraticProbing.m = 13;
            HashQuadraticProbing.clearTable();
            int[] probes = new int[1];
            probes[0] = 0; checkEq(HashQuadraticProbing.insert(7, probes), 7, "i7");   checkEq(probes[0], 1, "p7");
            probes[0] = 0; checkEq(HashQuadraticProbing.insert(20, probes), 8, "i20");  checkEq(probes[0], 2, "p20");
            probes[0] = 0; checkEq(HashQuadraticProbing.insert(33, probes), 11, "i33"); checkEq(probes[0], 3, "p33");
            probes[0] = 0; checkEq(HashQuadraticProbing.insert(14, probes), 1, "i14");  checkEq(probes[0], 1, "p14");
            probes[0] = 0; checkEq(HashQuadraticProbing.insert(29, probes), 3, "i29");  checkEq(probes[0], 1, "p29");
            probes[0] = 0; checkEq(HashQuadraticProbing.insert(41, probes), 2, "i41");  checkEq(probes[0], 1, "p41");
            probes[0] = 0; checkEq(HashQuadraticProbing.insert(56, probes), 4, "i56");  checkEq(probes[0], 1, "p56");
            checkOnProbeSequence();
            HashQuadraticProbing.clearTable();
        }

        // -- (b) structural checks --
        {
            HashQuadraticProbing.m = 13;
            HashQuadraticProbing.clearTable();
            int[] normal = {7, 20, 33, 14, 29, 41, 56, 68, 81, 95};
            int placed = 0;
            for (int k : normal) { int[] pr = {0}; if (HashQuadraticProbing.insert(k, pr) != -1) placed++; }
            checkEq(placed, 10, "normal placed");
            checkOnProbeSequence();
            for (int k : normal) {
                int seen = 0;
                for (int idx = 0; idx < 13; idx++) if (HashQuadraticProbing.state[idx] == HashQuadraticProbing.OCCUPIED && HashQuadraticProbing.table[idx] == k) seen++;
                checkEq(seen, 1, "multiset " + k);
            }
            HashQuadraticProbing.clearTable();
        }
        {
            HashQuadraticProbing.m = 11;
            HashQuadraticProbing.clearTable();
            int[] hard = {4, 15, 26, 37, 48, 9, 20, 31, 42, 53};
            int placed = 0;
            for (int k : hard) { int[] pr = {0}; if (HashQuadraticProbing.insert(k, pr) != -1) placed++; }
            checkOnProbeSequence();
            check(placed <= 10, "hard placed bound");
            HashQuadraticProbing.clearTable();
        }

        // -- (c) m = 8 cycle, independent residue check --
        {
            boolean[] seen = new boolean[8];
            int distinct = 0;
            for (int i = 0; i < 8; i++) { int r = (i * i) % 8; if (!seen[r]) { seen[r] = true; distinct++; } }
            checkEq(distinct, 3, "distinct residues mod 8");

            HashQuadraticProbing.m = 8;
            HashQuadraticProbing.clearTable();
            int[] cycle = {8, 9, 12, 26, 19, 5, 14, 16, 7, 24};
            boolean cycledSeen = false;
            for (int k : cycle) {
                int[] pr = {0};
                int idx = HashQuadraticProbing.insert(k, pr);
                if (idx == -1) {
                    int occ = HashQuadraticProbing.occupiedCount();
                    if (occ < HashQuadraticProbing.m) cycledSeen = true;
                }
            }
            check(cycledSeen, "cycle observed");
            checkOnProbeSequence();
            HashQuadraticProbing.clearTable();
        }

        // -- empty table --
        {
            HashQuadraticProbing.m = 13;
            HashQuadraticProbing.clearTable();
            checkOnProbeSequence();
        }

        // -- single key --
        {
            HashQuadraticProbing.m = 13;
            HashQuadraticProbing.clearTable();
            int[] pr = {0};
            checkEq(HashQuadraticProbing.insert(5, pr), 5, "single insert");
            checkEq(pr[0], 1, "single probes");
            HashQuadraticProbing.clearTable();
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
