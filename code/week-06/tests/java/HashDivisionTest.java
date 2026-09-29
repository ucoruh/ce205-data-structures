/* Unit tests for week-06 java/HashDivision.java, mirroring tests/c/test_hash_division.c */
public class HashDivisionTest {
    static int checks = 0, failures = 0;
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }

    public static void main(String[] args) {
        checkEq(HashDivision.hashDivision(23, 11), 1, "23 mod 11");
        checkEq(HashDivision.hashDivision(44, 11), 0, "44 mod 11");
        checkEq(HashDivision.hashDivision(15, 11), 4, "15 mod 11");
        checkEq(HashDivision.hashDivision(77, 11), 0, "77 mod 11");
        checkEq(HashDivision.hashDivision(8, 11), 8, "8 mod 11");
        checkEq(HashDivision.hashDivision(62, 11), 7, "62 mod 11");

        checkEq(HashDivision.hashDivision(11, 11), 0, "key==m");
        checkEq(HashDivision.hashDivision(22, 11), 0, "key==2m");

        checkEq(HashDivision.hashDivision(0, 11), 0, "zero key");
        checkEq(HashDivision.hashDivision(0, 1), 0, "zero key, m=1");
        checkEq(HashDivision.hashDivision(5, 1), 0, "m=1");
        checkEq(HashDivision.hashDivision(-5, 1), 0, "m=1 negative");
        checkEq(HashDivision.hashDivision(999999, 1), 0, "m=1 large");

        checkEq(HashDivision.hashDivision(-3, 11), 8, "-3 mod 11");
        checkEq(HashDivision.hashDivision(-15, 11), 7, "-15 mod 11");
        checkEq(HashDivision.hashDivision(-11, 11), 0, "-11 mod 11");
        checkEq(HashDivision.hashDivision(-1, 11), 10, "-1 mod 11");
        checkEq(HashDivision.hashDivision(-22, 11), 0, "-22 mod 11");

        for (int k = 10; k <= 110; k += 10) checkEq(HashDivision.hashDivision(k, 10), 0, "power-of-10 clustering " + k);

        checkEq(HashDivision.hashDivision(10, 13), 10, "10 mod 13");
        checkEq(HashDivision.hashDivision(20, 13), 7, "20 mod 13");
        checkEq(HashDivision.hashDivision(30, 13), 4, "30 mod 13");
        checkEq(HashDivision.hashDivision(110, 13), 6, "110 mod 13");

        for (int m = 1; m <= 17; m++) {
            for (int k = -50; k <= 50; k++) {
                int r = HashDivision.hashDivision(k, m);
                check(r >= 0 && r < m, "range " + k + "," + m);
                int expected = k % m;
                while (expected < 0) expected += m;
                while (expected >= m) expected -= m;
                checkEq(r, expected, "sweep " + k + "," + m);
            }
        }

        checkEq(HashDivision.hashDivision(2147483647, 11), 2147483647 % 11, "INT_MAX mod 11");
        {
            int r = HashDivision.hashDivision(Integer.MIN_VALUE, 11);
            check(r >= 0 && r < 11, "INT_MIN range");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
