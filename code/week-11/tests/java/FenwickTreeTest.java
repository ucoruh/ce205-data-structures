// Unit tests for code/week-11/java/FenwickTree.java: update(), query().
public class FenwickTreeTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("CHECK failed: " + label); }
    }
    static void checkEq(int actual, int expected, String label) {
        check(actual == expected, label + " (got " + actual + ", expected " + expected + ")");
    }
    static void reset(int size) {
        FenwickTree.n = size;
        for (int i = 0; i <= FenwickTree.n; i++) FenwickTree.bit[i] = 0;
    }

    public static void main(String[] args) {
        reset(10);
        FenwickTree.update(3, 5);
        checkEq(FenwickTree.query(10), 5, "prefix after one update");
        checkEq(FenwickTree.query(2), 0, "prefix stops before index 3");
        checkEq(FenwickTree.query(3), 5, "prefix exactly at index 3");
        FenwickTree.update(7, 2);
        checkEq(FenwickTree.query(10), 7, "prefix after two updates");
        checkEq(FenwickTree.query(6), 5, "prefix stops before index 7");
        checkEq(FenwickTree.query(7), 7, "prefix exactly at index 7");

        reset(10);
        int[] deltas = {3, -1, 4, 1, -5, 9, 2, -6, 5, 3};
        int total = 0;
        for (int i = 1; i <= 10; i++) { FenwickTree.update(i, deltas[i - 1]); total += deltas[i - 1]; }
        checkEq(FenwickTree.query(10), total, "full array equals sum of deltas");
        checkEq(FenwickTree.query(1), deltas[0], "first element");

        reset(16);
        FenwickTree.update(1, 7);
        checkEq(FenwickTree.query(16), 7, "update(1) reaches query(16)");
        checkEq(FenwickTree.query(1), 7, "update(1) reaches query(1)");
        checkEq(FenwickTree.query(15), 7, "update(1) reaches query(15)");

        reset(16);
        FenwickTree.update(16, 100);
        checkEq(FenwickTree.query(15), 0, "update(16) does not affect query(15)");
        checkEq(FenwickTree.query(16), 100, "update(16) affects query(16)");

        reset(10);
        FenwickTree.update(4, -9);
        FenwickTree.update(8, 2);
        checkEq(FenwickTree.query(10), -7, "negative deltas sum below zero");
        FenwickTree.update(1, -3);
        checkEq(FenwickTree.query(4), -12, "negative deltas partial prefix");
        checkEq(FenwickTree.query(10), -10, "negative deltas full prefix");

        reset(10);
        FenwickTree.update(5, 1);
        FenwickTree.update(5, 1);
        FenwickTree.update(5, 1);
        checkEq(FenwickTree.query(10), 3, "repeated updates accumulate");
        checkEq(FenwickTree.query(4), 0, "repeated updates do not leak left");

        reset(1);
        FenwickTree.update(1, 9);
        checkEq(FenwickTree.query(1), 9, "n = 1 smallest Fenwick tree");

        reset(10);
        FenwickTree.update(5, 8);
        checkEq(FenwickTree.query(0), 0, "query(0) is the empty prefix");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
