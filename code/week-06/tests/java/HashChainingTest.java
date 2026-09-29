/* Unit tests for week-06 java/HashChaining.java, mirroring tests/c/test_hash_chaining.c */
public class HashChainingTest {
    static int checks = 0, failures = 0;
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static final int MIR_MAX = 64;
    static int[][] mirKeys = new int[HashChaining.MAX_M][MIR_MAX];
    static int[] mirCount = new int[HashChaining.MAX_M];

    static void mirClear() { for (int i = 0; i < HashChaining.MAX_M; i++) mirCount[i] = 0; }
    static void mirInsert(int key, int m) {
        int idx = ((key % m) + m) % m;
        mirKeys[idx][mirCount[idx]++] = key;
    }
    static boolean[] mirFoundOut = new boolean[1];
    static int mirSearch(int key, int m, int[] probesOut) {
        int idx = ((key % m) + m) % m;
        int p = 0;
        for (int i = mirCount[idx] - 1; i >= 0; i--) {
            p++;
            if (mirKeys[idx][i] == key) { probesOut[0] = p; return 1; }
        }
        probesOut[0] = p;
        return 0;
    }

    static class TOp { boolean isSearch; int value; TOp(boolean s, int v) { isSearch = s; value = v; } }

    static void runAndCheck(String label, int m, TOp[] ops) {
        HashChaining.m = m;
        HashChaining.clearTable();
        mirClear();
        for (TOp op : ops) {
            if (!op.isSearch) {
                HashChaining.insert(op.value);
                mirInsert(op.value, m);
            } else {
                boolean found = HashChaining.search(op.value);
                int probes = HashChaining.probesUsed;
                int[] mprobes = new int[1];
                int mfound = mirSearch(op.value, m, mprobes);
                checkEq(found ? 1 : 0, mfound, label + " found " + op.value);
                checkEq(probes, mprobes[0], label + " probes " + op.value);
            }
        }
        HashChaining.clearTable();
    }

    public static void main(String[] args) {
        // -- empty table --
        {
            HashChaining.m = 7;
            HashChaining.clearTable();
            boolean found = HashChaining.search(42);
            checkEq(found ? 1 : 0, 0, "empty table not found");
            checkEq(HashChaining.probesUsed, 0, "empty table 0 probes");
            HashChaining.clearTable();
        }

        TOp[] normal = {
            new TOp(false, 23), new TOp(false, 44), new TOp(false, 15), new TOp(false, 77), new TOp(false, 8),
            new TOp(false, 62), new TOp(false, 31), new TOp(false, 50), new TOp(false, 19), new TOp(false, 96),
            new TOp(true, 23), new TOp(true, 99), new TOp(true, 96), new TOp(true, 5)
        };
        runAndCheck("normal", 7, normal);

        TOp[] hard = {
            new TOp(false, 12), new TOp(false, 27), new TOp(false, 42), new TOp(false, 7), new TOp(false, 33),
            new TOp(false, 18), new TOp(false, 53), new TOp(false, 9), new TOp(false, 44), new TOp(false, 21),
            new TOp(false, 38), new TOp(false, 16),
            new TOp(true, 12), new TOp(true, 100), new TOp(true, 16), new TOp(true, 61), new TOp(true, 9)
        };
        runAndCheck("hard", 5, hard);

        TOp[] single = {
            new TOp(false, 5), new TOp(false, 17), new TOp(false, 29), new TOp(false, 3), new TOp(false, 41),
            new TOp(false, 12), new TOp(false, 8), new TOp(false, 50), new TOp(false, 23), new TOp(false, 36),
            new TOp(true, 36), new TOp(true, 99)
        };
        runAndCheck("single-bucket", 1, single);

        TOp[] high = {
            new TOp(false, 4), new TOp(false, 10), new TOp(false, 16), new TOp(false, 22), new TOp(false, 28),
            new TOp(false, 34), new TOp(false, 40), new TOp(false, 46), new TOp(false, 52), new TOp(false, 58),
            new TOp(false, 64), new TOp(false, 70),
            new TOp(true, 58), new TOp(true, 100), new TOp(true, 4)
        };
        runAndCheck("high-load", 3, high);

        // -- duplicate key inserted twice --
        {
            HashChaining.m = 7;
            HashChaining.clearTable();
            HashChaining.insert(23);
            HashChaining.insert(30);
            HashChaining.insert(23);
            boolean found = HashChaining.search(23);
            checkEq(found ? 1 : 0, 1, "duplicate found");
            checkEq(HashChaining.probesUsed, 1, "duplicate probes==1");
            HashChaining.clearTable();
        }

        TOp[] neg = {
            new TOp(false, -3), new TOp(false, -15), new TOp(false, -27), new TOp(false, 5), new TOp(false, 18),
            new TOp(true, -3), new TOp(true, -27), new TOp(true, 999)
        };
        runAndCheck("negative keys", 11, neg);

        TOp[] miss = {
            new TOp(false, 1), new TOp(false, 2), new TOp(false, 3), new TOp(false, 4), new TOp(false, 5),
            new TOp(true, 6), new TOp(true, 100), new TOp(true, -1)
        };
        runAndCheck("misses only", 4, miss);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
