/* Unit tests for week-03 java/LinkedStackPushPop.java */
public class LinkedStackPushPopTest {
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
        LinkedStackPushPop s = new LinkedStackPushPop();

        // -- empty stack --
        check(s.top == null, "fresh stack empty");
        check(s.pop() == null, "pop empty");

        // -- single push/pop round trip --
        s.push(42);
        check(s.top != null, "top set after push");
        checkEq(s.top.data, 42, "top.data after push");
        checkEq(s.pop(), 42, "pop -> 42");
        check(s.top == null, "empty again");

        // -- LIFO order --
        s.push(10); s.push(20); s.push(30);
        checkEq(s.pop(), 30, "lifo 1"); checkEq(s.pop(), 20, "lifo 2"); checkEq(s.pop(), 10, "lifo 3");

        // -- duplicates --
        s.push(9); s.push(9); s.push(9);
        checkEq(s.pop(), 9, "dup 1"); checkEq(s.pop(), 9, "dup 2"); checkEq(s.pop(), 9, "dup 3");

        // -- negative values --
        s.push(-5); s.push(-100);
        checkEq(s.pop(), -100, "neg 1"); checkEq(s.pop(), -5, "neg 2");

        // -- extreme values --
        s.push(Integer.MAX_VALUE); s.push(Integer.MIN_VALUE);
        checkEq(s.pop(), Integer.MIN_VALUE, "extreme 1"); checkEq(s.pop(), Integer.MAX_VALUE, "extreme 2");

        // -- unbounded: far more than any array-backed version (cap 12) in this chapter --
        for (int i = 0; i < 500; i++) s.push(i);
        int count = 0;
        while (s.top != null) { s.pop(); count++; }
        checkEq(count, 500, "unbounded stress count");
        check(s.top == null, "empty after stress");

        // -- pop after draining still reports null, not a crash --
        check(s.pop() == null, "underflow after drain");

        // -- integration: runScenario starts empty itself --
        LinkedStackPushPop.Op[] tiny = {
            new LinkedStackPushPop.Op(false, 1), new LinkedStackPushPop.Op(false, 2),
            new LinkedStackPushPop.Op(true, 0), new LinkedStackPushPop.Op(true, 0)
        };
        s.runScenario("unit-test integration", tiny);
        check(s.top == null, "integration ends empty");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
