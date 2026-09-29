/* Unit tests for week-06 java/HashLinearProbing.java, mirroring tests/c/test_hash_linear_probing.c */
public class HashLinearProbingTest {
    static int checks = 0, failures = 0;
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }

    static void checkReachableFromHome() {
        int m = HashLinearProbing.m;
        for (int idx = 0; idx < m; idx++) {
            if (HashLinearProbing.state[idx] != HashLinearProbing.OCCUPIED) continue;
            int key = HashLinearProbing.table[idx];
            int home = ((key % m) + m) % m;
            boolean found = false;
            int p = home;
            for (int i = 0; i < m; i++) {
                if (p == idx) { found = true; break; }
                if (HashLinearProbing.state[p] == HashLinearProbing.EMPTY) break;
                p = (p + 1) % m;
            }
            check(found, "reachable from home, key " + key + " at " + idx);
        }
    }

    static class TOp { int kind; int value; TOp(int k, int v) { kind = k; value = v; } }

    public static void main(String[] args) {
        // -- (a) hand-traced "normal" scenario, m = 11 --
        {
            HashLinearProbing.m = 11;
            HashLinearProbing.clearTable();
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(23), 1, "ins23"); checkEq(HashLinearProbing.probes, 1, "p23");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(34), 2, "ins34"); checkEq(HashLinearProbing.probes, 2, "p34");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(45), 3, "ins45"); checkEq(HashLinearProbing.probes, 3, "p45");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(12), 4, "ins12"); checkEq(HashLinearProbing.probes, 4, "p12");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(56), 5, "ins56"); checkEq(HashLinearProbing.probes, 5, "p56");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(67), 6, "ins67"); checkEq(HashLinearProbing.probes, 6, "p67");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(18), 7, "ins18"); checkEq(HashLinearProbing.probes, 1, "p18");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(29), 8, "ins29"); checkEq(HashLinearProbing.probes, 2, "p29");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(40), 9, "ins40"); checkEq(HashLinearProbing.probes, 3, "p40");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(51), 10, "ins51"); checkEq(HashLinearProbing.probes, 4, "p51");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.search(45), 3, "search45"); checkEq(HashLinearProbing.probes, 3, "sp45");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.deleteKey(34), 2, "del34"); checkEq(HashLinearProbing.probes, 2, "dp34");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.search(34), -1, "search34gone"); checkEq(HashLinearProbing.probes, 11, "sp34gone");
            checkReachableFromHome();
            HashLinearProbing.clearTable();
        }

        // -- (a) hand-traced table-full, m = 8 --
        {
            HashLinearProbing.m = 8;
            HashLinearProbing.clearTable();
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(3), 3, "ins3"); checkEq(HashLinearProbing.probes, 1, "pp3");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(11), 4, "ins11"); checkEq(HashLinearProbing.probes, 2, "pp11");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(19), 5, "ins19"); checkEq(HashLinearProbing.probes, 3, "pp19");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(27), 6, "ins27"); checkEq(HashLinearProbing.probes, 4, "pp27");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(35), 7, "ins35"); checkEq(HashLinearProbing.probes, 5, "pp35");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(43), 0, "ins43"); checkEq(HashLinearProbing.probes, 6, "pp43");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(51), 1, "ins51b"); checkEq(HashLinearProbing.probes, 7, "pp51b");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(59), 2, "ins59"); checkEq(HashLinearProbing.probes, 8, "pp59");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(99), -1, "ins99full"); checkEq(HashLinearProbing.probes, 8, "pp99full");
            HashLinearProbing.probes = 0; checkEq(HashLinearProbing.insert(67), -1, "ins67full"); checkEq(HashLinearProbing.probes, 8, "pp67full");
            checkReachableFromHome();
            HashLinearProbing.clearTable();
        }

        // -- (b) structural checks: hard scenario --
        {
            HashLinearProbing.m = 11;
            HashLinearProbing.clearTable();
            TOp[] hard = {
                new TOp(0, 11), new TOp(0, 22), new TOp(0, 33), new TOp(0, 44), new TOp(0, 55), new TOp(0, 5),
                new TOp(0, 16), new TOp(0, 27), new TOp(0, 38), new TOp(0, 49),
                new TOp(1, 49), new TOp(2, 22), new TOp(1, 33), new TOp(1, 22)
            };
            int placed = 0;
            for (TOp op : hard) {
                if (op.kind == 0) { if (HashLinearProbing.insert(op.value) != -1) placed++; }
                else if (op.kind == 1) HashLinearProbing.search(op.value);
                else HashLinearProbing.deleteKey(op.value);
            }
            checkEq(placed, 10, "hard placed count");
            checkReachableFromHome();
            HashLinearProbing.clearTable();
        }

        // -- (b) structural + hand-traced tombstone scenario --
        {
            HashLinearProbing.m = 11;
            HashLinearProbing.clearTable();
            int[] tombstone = {15, 26, 37, 8, 19, 30, 41, 52, 63, 74};
            for (int k : tombstone) HashLinearProbing.insert(k);
            HashLinearProbing.probes = 0;
            checkEq(HashLinearProbing.deleteKey(26), 5, "delete 26");
            checkEq(HashLinearProbing.probes, 2, "delete 26 probes");
            HashLinearProbing.probes = 0;
            checkEq(HashLinearProbing.search(37), 6, "search 37 after delete");
            checkEq(HashLinearProbing.probes, 3, "search 37 probes");
            checkReachableFromHome();
            HashLinearProbing.clearTable();
        }

        // -- empty table search/delete --
        {
            HashLinearProbing.m = 11;
            HashLinearProbing.clearTable();
            HashLinearProbing.probes = 0;
            checkEq(HashLinearProbing.search(5), -1, "empty search");
            checkEq(HashLinearProbing.probes, 1, "empty search probes");
            HashLinearProbing.probes = 0;
            checkEq(HashLinearProbing.deleteKey(5), -1, "empty delete");
            checkEq(HashLinearProbing.probes, 1, "empty delete probes");
        }

        // -- m = 1 --
        {
            HashLinearProbing.m = 1;
            HashLinearProbing.clearTable();
            HashLinearProbing.probes = 0;
            checkEq(HashLinearProbing.insert(5), 0, "m1 insert");
            HashLinearProbing.probes = 0;
            checkEq(HashLinearProbing.insert(9), -1, "m1 reject");
            checkEq(HashLinearProbing.probes, 1, "m1 reject probes");
            HashLinearProbing.probes = 0;
            checkEq(HashLinearProbing.search(5), 0, "m1 search");
            HashLinearProbing.clearTable();
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
