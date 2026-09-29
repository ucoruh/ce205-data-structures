/* Unit tests for week-14 java/LinearHashing.java */
public class LinearHashingTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    static LinearHashing.Hash withN0(int n0) {
        LinearHashing.Hash h = new LinearHashing.Hash();
        for (int i = 0; i < n0; i++)
            h.buckets.add(new java.util.ArrayList<>());
        return h;
    }

    public static void main(String[] args) {
        checkEq(LinearHashing.address(7, 4, 0, 0), 3, "address(7,4,0,0)");
        checkEq(LinearHashing.address(8, 4, 0, 0), 0, "address(8,4,0,0)");
        checkEq(LinearHashing.address(11, 4, 0, 0), 3, "address(11,4,0,0)");
        checkEq(LinearHashing.address(1, 4, 0, 2), 1, "address stays when a>=n");
        checkEq(LinearHashing.address(0, 4, 0, 2), 0, "address bumps when a<n (0)");
        checkEq(LinearHashing.address(4, 4, 0, 2), 4, "address bumps when a<n (4)");

        LinearHashing.Hash h = withN0(4);
        LinearHashing.insertKey(h, 4, 2, 1);
        LinearHashing.insertKey(h, 4, 2, 5);
        checkEq(h.buckets.get(1).size(), 2, "bucket 1 filled to capacity");
        checkEq(h.level, 0, "level still 0");
        checkEq(h.n, 0, "n still 0");

        LinearHashing.insertKey(h, 4, 2, 9);
        checkEq(h.buckets.get(1).size(), 3, "overflowing bucket itself untouched");
        checkEq(h.n, 1, "bucket 0 (not bucket 1) was split");
        int total = 0;
        for (java.util.List<Integer> b : h.buckets)
            total += b.size();
        checkEq(total, 3, "no key lost");

        LinearHashing.Hash h2 = withN0(10);
        int[] oneKeys = {0, 11, 22, 33, 44, 55, 66, 77, 88, 99};
        for (int k : oneKeys)
            LinearHashing.insertKey(h2, 10, 2, k);
        checkEq(h2.level, 0, "one-per-bucket level");
        checkEq(h2.n, 0, "one-per-bucket n");
        for (int b = 0; b < 10; b++)
            checkEq(h2.buckets.get(b).size(), 1, "one-per-bucket load: " + b);

        LinearHashing.Hash h3 = withN0(2);
        int[] tightKeys = {5, 3, 8, 2, 7, 4, 9, 6, 11, 10};
        for (int k : tightKeys)
            LinearHashing.insertKey(h3, 2, 1, k);
        int total3 = 0;
        for (java.util.List<Integer> b : h3.buckets)
            total3 += b.size();
        checkEq(total3, 10, "tight scenario keeps every key");
        check(h3.level >= 1, "tight scenario triggers a full round");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
