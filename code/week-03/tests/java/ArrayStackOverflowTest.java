/* Unit tests for week-03 java/ArrayStackOverflow.java */
public class ArrayStackOverflowTest {
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
        ArrayStackOverflow s = new ArrayStackOverflow();

        // -- empty stack: pop is a clean underflow --
        check(s.pop() == null, "pop empty");

        // -- one element round trip --
        s = new ArrayStackOverflow();
        s.push(3);
        checkEq(s.pop(), 3, "single round trip");

        // -- two elements: LIFO --
        s = new ArrayStackOverflow();
        s.push(1); s.push(2);
        checkEq(s.pop(), 2, "lifo 1"); checkEq(s.pop(), 1, "lifo 2");

        // -- overflow: fill a 4-slot stack exactly, the 5th push is rejected --
        s = new ArrayStackOverflow();
        s.cap = 4;
        check(s.push(10) && s.push(20) && s.push(30) && s.push(40), "fill 4 slots");
        checkEq(s.top, 3, "top full");
        check(!s.push(50), "5th push rejected");
        checkEq(s.top, 3, "top unchanged after overflow");
        checkEq(s.data[3], 40, "slot 3 untouched");

        // -- room reappears after a pop --
        check(!s.push(60), "still rejected before pop");
        checkEq(s.pop(), 40, "pop makes room");
        check(s.push(60), "push succeeds after pop");

        // -- underflow after draining exactly cap elements --
        s = new ArrayStackOverflow();
        s.cap = 3;
        s.push(7); s.push(8); s.push(9);
        checkEq(s.pop(), 9, "drain 1"); checkEq(s.pop(), 8, "drain 2"); checkEq(s.pop(), 7, "drain 3");
        check(s.pop() == null, "underflow after drain");

        // -- both failures on a 1-slot stack --
        s = new ArrayStackOverflow();
        s.cap = 1;
        check(s.push(100), "push into 1-slot");
        check(!s.push(200), "overflow 1-slot");
        checkEq(s.pop(), 100, "pop 1-slot");
        check(s.pop() == null, "underflow 1-slot");

        // -- duplicates --
        s = new ArrayStackOverflow();
        s.push(5); s.push(5); s.push(5);
        checkEq(s.pop(), 5, "dup 1"); checkEq(s.pop(), 5, "dup 2"); checkEq(s.pop(), 5, "dup 3");

        // -- extreme values through a full 2-slot stack --
        s = new ArrayStackOverflow();
        s.cap = 2;
        check(s.push(Integer.MIN_VALUE), "push MIN");
        check(s.push(Integer.MAX_VALUE), "push MAX");
        check(!s.push(0), "overflow at cap 2");
        checkEq(s.pop(), Integer.MAX_VALUE, "pop MAX");
        checkEq(s.pop(), Integer.MIN_VALUE, "pop MIN");

        // -- integration: runScenario exercises the real overflow+underflow path --
        s = new ArrayStackOverflow();
        ArrayStackOverflow.Op[] edge = {
            new ArrayStackOverflow.Op(false, 1), new ArrayStackOverflow.Op(false, 2), new ArrayStackOverflow.Op(false, 3),
            new ArrayStackOverflow.Op(true, 0), new ArrayStackOverflow.Op(true, 0), new ArrayStackOverflow.Op(true, 0), new ArrayStackOverflow.Op(true, 0)
        };
        s.cap = 2;
        s.runScenario("unit-test integration", 2, edge);
        checkEq(s.top, -1, "integration final top");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
