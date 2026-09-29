/* Unit tests for week-03 java/ArrayStackPushPop.java */
public class ArrayStackPushPopTest {
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
        // -- starts empty --
        ArrayStackPushPop s = new ArrayStackPushPop();
        checkEq(s.top, -1, "fresh stack top");

        // -- pop on an empty stack: underflow, must not crash --
        check(s.pop() == null, "pop empty -> null");

        // -- single push/pop round trip --
        s = new ArrayStackPushPop();
        check(s.push(42), "push(42)");
        checkEq(s.top, 0, "top after push(42)");
        checkEq(s.data[0], 42, "data[0] after push(42)");
        Integer out = s.pop();
        check(out != null && out == 42, "pop -> 42");
        checkEq(s.top, -1, "top after pop");

        // -- LIFO order over a known sequence --
        s = new ArrayStackPushPop();
        s.push(10); s.push(20); s.push(30);
        checkEq(s.top, 2, "top after 3 pushes");
        checkEq(s.pop(), 30, "pop 1");
        checkEq(s.pop(), 20, "pop 2");
        checkEq(s.pop(), 10, "pop 3");
        checkEq(s.top, -1, "top after draining");

        // -- duplicates --
        s = new ArrayStackPushPop();
        s.push(9); s.push(9); s.push(9);
        checkEq(s.pop(), 9, "dup 1"); checkEq(s.pop(), 9, "dup 2"); checkEq(s.pop(), 9, "dup 3");

        // -- negative values --
        s = new ArrayStackPushPop();
        s.push(-5); s.push(-100);
        checkEq(s.pop(), -100, "neg 1"); checkEq(s.pop(), -5, "neg 2");

        // -- Integer.MIN_VALUE / MAX_VALUE round-trip --
        s = new ArrayStackPushPop();
        s.push(Integer.MAX_VALUE); s.push(Integer.MIN_VALUE);
        checkEq(s.pop(), Integer.MIN_VALUE, "extreme 1");
        checkEq(s.pop(), Integer.MAX_VALUE, "extreme 2");

        // -- overflow: a 3-slot stack rejects the 4th push --
        s = new ArrayStackPushPop();
        s.cap = 3;
        check(s.push(1), "push 1/3");
        check(s.push(2), "push 2/3");
        check(s.push(3), "push 3/3");
        checkEq(s.top, 2, "top full");
        check(!s.push(4), "push 4/3 rejected (overflow)");
        checkEq(s.top, 2, "top unchanged after overflow");
        checkEq(s.data[2], 3, "slot 2 untouched after overflow");

        // -- one-slot stack: full and empty are adjacent --
        s = new ArrayStackPushPop();
        s.cap = 1;
        check(s.push(55), "push into 1-slot");
        check(!s.push(66), "overflow 1-slot");
        checkEq(s.pop(), 55, "pop 1-slot");
        check(s.pop() == null, "underflow 1-slot");

        // -- integration: runScenario drives the real push/pop path --
        s = new ArrayStackPushPop();
        ArrayStackPushPop.Op[] tiny = {
            new ArrayStackPushPop.Op(false, 1), new ArrayStackPushPop.Op(false, 2), new ArrayStackPushPop.Op(true, 0)
        };
        s.runScenario("unit-test integration", 5, tiny);
        checkEq(s.top, 0, "integration final top");
        checkEq(s.data[0], 1, "integration final data[0]");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
