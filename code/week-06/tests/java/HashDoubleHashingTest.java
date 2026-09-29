/* Unit tests for week-06 java/HashDoubleHashing.java, mirroring tests/c/test_hash_double_hashing.c */
public class HashDoubleHashingTest {
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
        int m = HashDoubleHashing.m, r = HashDoubleHashing.r;
        for (int idx = 0; idx < m; idx++) {
            if (HashDoubleHashing.state[idx] != HashDoubleHashing.OCCUPIED) continue;
            int key = HashDoubleHashing.table[idx];
            int home = ((key % m) + m) % m;
            int step = r - (((key % r) + r) % r);
            boolean onSeq = false;
            for (int i = 0; i < m; i++) if ((home + i * step) % m == idx) { onSeq = true; break; }
            check(onSeq, "on probe sequence, key " + key + " at " + idx);
        }
    }

    static int gcd(int a, int b) { while (b != 0) { int t = a % b; a = b; b = t; } return a; }

    public static void main(String[] args) {
        // -- (a) hand-traced: normal, m = 13, R = 11 --
        {
            HashDoubleHashing.m = 13; HashDoubleHashing.r = 11;
            HashDoubleHashing.clearTable();
            int[] probes = new int[1];
            probes[0] = 0; checkEq(HashDoubleHashing.insert(7, probes), 7, "i7");    checkEq(probes[0], 1, "p7");
            probes[0] = 0; checkEq(HashDoubleHashing.insert(20, probes), 9, "i20");   checkEq(probes[0], 2, "p20");
            probes[0] = 0; checkEq(HashDoubleHashing.insert(33, probes), 5, "i33");   checkEq(probes[0], 2, "p33");
            probes[0] = 0; checkEq(HashDoubleHashing.insert(14, probes), 1, "i14");   checkEq(probes[0], 1, "p14");
            probes[0] = 0; checkEq(HashDoubleHashing.insert(29, probes), 3, "i29");   checkEq(probes[0], 1, "p29");
            probes[0] = 0; checkEq(HashDoubleHashing.insert(41, probes), 2, "i41");   checkEq(probes[0], 1, "p41");
            probes[0] = 0; checkEq(HashDoubleHashing.insert(56, probes), 4, "i56");   checkEq(probes[0], 1, "p56");
            probes[0] = 0; checkEq(HashDoubleHashing.insert(68, probes), 12, "i68");  checkEq(probes[0], 2, "p68");
            probes[0] = 0; checkEq(HashDoubleHashing.insert(81, probes), 10, "i81");  checkEq(probes[0], 2, "p81");
            probes[0] = 0; checkEq(HashDoubleHashing.insert(95, probes), 8, "i95");   checkEq(probes[0], 2, "p95");
            checkOnProbeSequence();
            int[] keys = {7, 20, 33, 14, 29, 41, 56, 68, 81, 95};
            for (int k : keys) {
                int seen = 0;
                for (int idx = 0; idx < 13; idx++) if (HashDoubleHashing.state[idx] == HashDoubleHashing.OCCUPIED && HashDoubleHashing.table[idx] == k) seen++;
                checkEq(seen, 1, "multiset " + k);
            }
            HashDoubleHashing.clearTable();
        }

        // -- (b) structural: hard scenario --
        {
            HashDoubleHashing.m = 13; HashDoubleHashing.r = 11;
            HashDoubleHashing.clearTable();
            int[] hard = {4, 17, 30, 43, 56, 8, 21, 34, 47, 60};
            int placed = 0;
            for (int k : hard) { int[] pr = {0}; if (HashDoubleHashing.insert(k, pr) != -1) placed++; }
            checkOnProbeSequence();
            check(placed <= 10, "hard placed bound");
            HashDoubleHashing.clearTable();
        }

        // -- (c) independent gcd proof, m = 9, R = 7 cycle --
        {
            checkEq(gcd(3, 9), 3, "gcd(3,9)");
            int home = ((4 % 9) + 9) % 9;
            boolean[] seen = new boolean[9];
            int distinct = 0;
            for (int i = 0; i < 9; i++) { int idx = (home + i * 3) % 9; if (!seen[idx]) { seen[idx] = true; distinct++; } }
            checkEq(distinct, 3, "distinct reachable slots");

            HashDoubleHashing.m = 9; HashDoubleHashing.r = 7;
            HashDoubleHashing.clearTable();
            int[] cycle = {13, 16, 10, 9, 2, 3, 5, 6, 4, 17};
            boolean cycledSeen = false;
            for (int k : cycle) {
                int[] pr = {0};
                int idx = HashDoubleHashing.insert(k, pr);
                if (idx == -1) {
                    int occ = HashDoubleHashing.occupiedCount();
                    if (occ < HashDoubleHashing.m) cycledSeen = true;
                }
            }
            check(cycledSeen, "cycle observed");
            checkOnProbeSequence();
            HashDoubleHashing.clearTable();
        }

        // -- empty table --
        {
            HashDoubleHashing.m = 13; HashDoubleHashing.r = 11;
            HashDoubleHashing.clearTable();
            checkOnProbeSequence();
        }

        // -- single key --
        {
            HashDoubleHashing.m = 13; HashDoubleHashing.r = 11;
            HashDoubleHashing.clearTable();
            int[] pr = {0};
            checkEq(HashDoubleHashing.insert(5, pr), 5, "single insert");
            checkEq(pr[0], 1, "single probes");
            HashDoubleHashing.clearTable();
        }

        // -- h2 never zero for prime R < m --
        {
            HashDoubleHashing.m = 13; HashDoubleHashing.r = 11;
            for (int key = -30; key <= 30; key++) {
                int step = HashDoubleHashing.r - (((key % HashDoubleHashing.r) + HashDoubleHashing.r) % HashDoubleHashing.r);
                check(step >= 1 && step <= HashDoubleHashing.r, "step range " + key);
                check(step != 0, "step nonzero " + key);
            }
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
