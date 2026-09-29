/* Unit tests for week-03 java/RecursionCallStack.java
 * Java's int overflow is well-defined (silent 2's-complement wraparound), so unlike
 * the C version there is no UB concern here -- this test just confirms fact(13)
 * reproduces the documented wraparound value, 1932053504. */
public class RecursionCallStackTest {
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
        checkEq(RecursionCallStack.fact(0), 1, "base case");
        checkEq(RecursionCallStack.fact(1), 1, "fact(1)");
        checkEq(RecursionCallStack.fact(2), 2, "fact(2)");
        checkEq(RecursionCallStack.fact(3), 6, "fact(3)");
        checkEq(RecursionCallStack.fact(4), 24, "fact(4)");
        checkEq(RecursionCallStack.fact(5), 120, "fact(5)");

        // -- against an independent iterative oracle for n = 0..12 --
        for (int n = 0; n <= 12; n++) {
            long oracle = 1;
            for (int i = 2; i <= n; i++) oracle *= i;
            checkEq(RecursionCallStack.fact(n), oracle, "oracle n=" + n);
        }

        checkEq(RecursionCallStack.fact(10), 3628800, "preset 10");
        checkEq(RecursionCallStack.fact(12), 479001600, "preset 12");

        // -- 13! = 6227020800, mod 2^32 = 1932053504: the documented wraparound --
        checkEq(RecursionCallStack.fact(13), 1932053504, "fact(13) wraparound");

        // -- one call further still returns cleanly --
        RecursionCallStack.fact(14);
        check(true, "fact(14) returns without incident");

        // -- integration --
        RecursionCallStack.run("unit-test integration", 5);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
