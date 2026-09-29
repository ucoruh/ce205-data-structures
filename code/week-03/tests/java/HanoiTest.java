/* Unit tests for week-03 java/Hanoi.java */
public class HanoiTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        Hanoi h = new Hanoi();

        Hanoi.moveCount = 0;
        h.towerOfHanoi(0, 'A', 'C', 'B');
        checkEq(Hanoi.moveCount, 0, "0 disks: no moves");

        Hanoi.moveCount = 0;
        h.towerOfHanoi(1, 'A', 'C', 'B');
        checkEq(Hanoi.moveCount, 1, "1 disk: 1 move");

        Hanoi.moveCount = 0;
        h.towerOfHanoi(2, 'A', 'C', 'B');
        checkEq(Hanoi.moveCount, 3, "2 disks: 3 moves");

        // -- 2^n - 1 for n = 1..10, computed independently --
        for (int n = 1; n <= 10; n++) {
            Hanoi.moveCount = 0;
            h.towerOfHanoi(n, 'A', 'C', 'B');
            int expected = 1;
            for (int i = 0; i < n; i++) expected *= 2;
            expected -= 1;
            checkEq(Hanoi.moveCount, expected, "2^" + n + " - 1");
        }

        // -- the program's own three presets --
        Hanoi.moveCount = 0; h.towerOfHanoi(4, 'A', 'C', 'B'); checkEq(Hanoi.moveCount, 15, "preset 4 disks");
        Hanoi.moveCount = 0; h.towerOfHanoi(5, 'A', 'C', 'B'); checkEq(Hanoi.moveCount, 31, "preset 5 disks");
        Hanoi.moveCount = 0; h.towerOfHanoi(1, 'A', 'C', 'B'); checkEq(Hanoi.moveCount, 1, "preset 1 disk");

        // -- moveDisk increments the shared counter once per call --
        Hanoi.moveCount = 0;
        Hanoi.moveDisk(3, 'A', 'C');
        checkEq(Hanoi.moveCount, 1, "moveDisk once");
        Hanoi.moveDisk(2, 'A', 'B');
        checkEq(Hanoi.moveCount, 2, "moveDisk twice");

        // -- the largest disk moves exactly once per call, for every n --
        for (int n = 1; n <= 8; n++) {
            Hanoi.moveCount = 0; h.towerOfHanoi(n, 'A', 'C', 'B');
            int total = Hanoi.moveCount;
            Hanoi.moveCount = 0; h.towerOfHanoi(n - 1, 'A', 'C', 'B');
            int sub = Hanoi.moveCount;
            checkEq(total - 2 * sub, 1, "largest-disk-once invariant n=" + n);
        }

        // -- integration: run() resets moveCount itself --
        h.run("unit-test integration", 3);
        checkEq(Hanoi.moveCount, 7, "integration 2^3 - 1");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
