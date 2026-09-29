/* Unit tests for week-06 java/Rehashing.java, mirroring tests/c/test_rehashing.c */
public class RehashingTest {
    static int checks = 0, failures = 0;
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }

    static void checkReachableAndMultiset(int[] keys) {
        checkEq(Rehashing.n, keys.length, "n matches key count");
        int occCount = 0;
        for (int idx = 0; idx < Rehashing.m; idx++) if (Rehashing.state[idx] == Rehashing.OCCUPIED) occCount++;
        checkEq(occCount, keys.length, "occupied count matches");
        for (int idx = 0; idx < Rehashing.m; idx++) {
            if (Rehashing.state[idx] != Rehashing.OCCUPIED) continue;
            int key = Rehashing.table[idx];
            int home = ((key % Rehashing.m) + Rehashing.m) % Rehashing.m;
            boolean found = false;
            int p = home;
            for (int i = 0; i < Rehashing.m; i++) {
                if (p == idx) { found = true; break; }
                if (Rehashing.state[p] == Rehashing.EMPTY) break;
                p = (p + 1) % Rehashing.m;
            }
            check(found, "reachable, key " + key);
        }
        for (int key : keys) {
            int seen = 0;
            for (int idx = 0; idx < Rehashing.m; idx++) if (Rehashing.state[idx] == Rehashing.OCCUPIED && Rehashing.table[idx] == key) seen++;
            checkEq(seen, 1, "multiset " + key);
        }
    }

    public static void main(String[] args) {
        // -- (a) isPrime --
        check(!Rehashing.isPrime(-5), "isPrime(-5)");
        check(!Rehashing.isPrime(0), "isPrime(0)");
        check(!Rehashing.isPrime(1), "isPrime(1)");
        check(Rehashing.isPrime(2), "isPrime(2)");
        check(Rehashing.isPrime(3), "isPrime(3)");
        check(!Rehashing.isPrime(4), "isPrime(4)");
        check(Rehashing.isPrime(5), "isPrime(5)");
        check(!Rehashing.isPrime(9), "isPrime(9)");
        check(Rehashing.isPrime(13), "isPrime(13)");
        check(!Rehashing.isPrime(21), "isPrime(21)");
        check(Rehashing.isPrime(29), "isPrime(29)");
        check(Rehashing.isPrime(97), "isPrime(97)");
        check(!Rehashing.isPrime(100), "isPrime(100)");

        // -- (a) nextPrime --
        checkEq(Rehashing.nextPrime(1), 2, "nextPrime(1)");
        checkEq(Rehashing.nextPrime(2), 2, "nextPrime(2)");
        checkEq(Rehashing.nextPrime(4), 5, "nextPrime(4)");
        checkEq(Rehashing.nextPrime(12), 13, "nextPrime(12)");
        checkEq(Rehashing.nextPrime(14), 17, "nextPrime(14)");
        checkEq(Rehashing.nextPrime(24), 29, "nextPrime(24)");
        checkEq(Rehashing.nextPrime(25), 29, "nextPrime(25)");

        // -- (b) hand-traced normal scenario via insertInto/rehash directly --
        {
            Rehashing.threshold = 0.8; Rehashing.m = 6; Rehashing.n = 0;
            Rehashing.state = new int[Rehashing.m];
            Rehashing.table = new int[Rehashing.m];
            checkEq(Rehashing.insertInto(Rehashing.state, Rehashing.table, Rehashing.m, 15), 3, "ins15"); Rehashing.n++;
            checkEq(Rehashing.insertInto(Rehashing.state, Rehashing.table, Rehashing.m, 22), 4, "ins22"); Rehashing.n++;
            checkEq(Rehashing.insertInto(Rehashing.state, Rehashing.table, Rehashing.m, 8), 2, "ins8");  Rehashing.n++;
            checkEq(Rehashing.insertInto(Rehashing.state, Rehashing.table, Rehashing.m, 31), 1, "ins31"); Rehashing.n++;
            checkEq(Rehashing.insertInto(Rehashing.state, Rehashing.table, Rehashing.m, 44), 5, "ins44"); Rehashing.n++;
            check((double) Rehashing.n / Rehashing.m > Rehashing.threshold, "5/6 exceeds threshold");
            Rehashing.rehash();
            checkEq(Rehashing.m, 13, "grew to 13");
            int idx31 = -1, idx8 = -1, idx15 = -1, idx22 = -1, idx44 = -1;
            for (int i = 0; i < Rehashing.m; i++) {
                if (Rehashing.state[i] != Rehashing.OCCUPIED) continue;
                if (Rehashing.table[i] == 31) idx31 = i;
                if (Rehashing.table[i] == 8) idx8 = i;
                if (Rehashing.table[i] == 15) idx15 = i;
                if (Rehashing.table[i] == 22) idx22 = i;
                if (Rehashing.table[i] == 44) idx44 = i;
            }
            checkEq(idx31, 5, "post-rehash 31");
            checkEq(idx8, 8, "post-rehash 8");
            checkEq(idx15, 2, "post-rehash 15");
            checkEq(idx22, 9, "post-rehash 22");
            checkEq(idx44, 6, "post-rehash 44");
        }

        // -- (b continued) full normal scenario through insert() --
        {
            int[] normal = {15, 22, 8, 31, 44, 3, 27, 56, 19, 40};
            Rehashing.threshold = 0.8; Rehashing.m = 6; Rehashing.n = 0;
            Rehashing.state = new int[Rehashing.m];
            Rehashing.table = new int[Rehashing.m];
            for (int k : normal) Rehashing.insert(k);
            checkEq(Rehashing.m, 13, "normal grows to 13");
            checkReachableAndMultiset(normal);
        }

        // -- (c) hard scenario --
        {
            int[] hard = {12, 18, 24, 30, 36, 7, 13, 19, 25, 31};
            Rehashing.threshold = 0.8; Rehashing.m = 6; Rehashing.n = 0;
            Rehashing.state = new int[Rehashing.m];
            Rehashing.table = new int[Rehashing.m];
            for (int k : hard) Rehashing.insert(k);
            checkReachableAndMultiset(hard);
        }

        // -- (c) edge: m0 = 2, grows twice --
        {
            int[] doubleRehash = {5, 12, 19, 26, 9, 16};
            Rehashing.threshold = 0.8; Rehashing.m = 2; Rehashing.n = 0;
            Rehashing.state = new int[Rehashing.m];
            Rehashing.table = new int[Rehashing.m];
            for (int k : doubleRehash) Rehashing.insert(k);
            check(Rehashing.m > 2, "grew at least once");
            checkReachableAndMultiset(doubleRehash);
        }

        // -- edge: single insert, no rehash --
        {
            Rehashing.threshold = 0.8; Rehashing.m = 6; Rehashing.n = 0;
            Rehashing.state = new int[Rehashing.m];
            Rehashing.table = new int[Rehashing.m];
            Rehashing.insert(42);
            checkEq(Rehashing.m, 6, "no rehash for single insert");
            checkEq(Rehashing.n, 1, "n==1");
            checkReachableAndMultiset(new int[]{42});
        }

        // -- edge: zero inserts --
        {
            Rehashing.threshold = 0.8; Rehashing.m = 6; Rehashing.n = 0;
            Rehashing.state = new int[Rehashing.m];
            Rehashing.table = new int[Rehashing.m];
            checkEq(Rehashing.m, 6, "empty m unchanged");
            checkEq(Rehashing.n, 0, "empty n==0");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
