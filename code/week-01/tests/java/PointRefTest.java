/* Unit tests for week-01 java/PointRef.java. The whole program is main(); its output has no addresses,
 * so it is checked byte for byte after capturing stdout, plus the Point class's reference-aliasing
 * property is exercised directly with fresh values independent of what main() happens to use.
 */
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class PointRefTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    interface Action { void run(); }

    static String capture(Action a) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintStream old = System.out;
        System.setOut(new PrintStream(baos));
        try {
            a.run();
        } finally {
            System.out.flush();
            System.setOut(old);
        }
        return baos.toString();
    }

    public static void main(String[] args) {
        // the whole program's output, exactly, hand-written independent of the source
        // (println's line separator is platform-dependent -- CRLF on Windows -- so build the expected
        // string with System.lineSeparator() rather than a hard-coded "\n")
        {
            String out = capture(() -> PointRef.main(new String[0]));
            String nl = System.lineSeparator();
            check(out.equals(
                "a = (3, 4)" + nl
                + "p.x = 3 (same object as a, reached through p)" + nl
                + "after p.x = 10: a = (10, 4)" + nl), "exact output");
        }

        // individual lines, checked separately too
        {
            String out = capture(() -> PointRef.main(new String[0]));
            check(out.contains("a = (3, 4)"), "initial values");
            check(out.contains("p.x = 3 (same object as a, reached through p)"), "p sees the same value");
            check(out.contains("after p.x = 10: a = (10, 4)"), "writing through p changed a, not a.y");
        }

        // the Point class itself: reference aliasing with fresh, independent values
        {
            PointRef.Point a = new PointRef.Point(7, -2);
            PointRef.Point p = a; // same object, not a copy
            checkEq(a.x, 7, "fresh x");
            checkEq(a.y, -2, "fresh y");
            check(a == p, "p and a refer to the same object");
            p.x = 100;
            checkEq(a.x, 100, "writing through p changed a");
            checkEq(a.y, -2, "y untouched");
        }

        // two different Point objects are independent
        {
            PointRef.Point a = new PointRef.Point(1, 1);
            PointRef.Point b = new PointRef.Point(2, 2);
            check(a != b, "different objects are not ==");
            a.x = 999;
            checkEq(b.x, 2, "b untouched by writes to a");
        }

        // zero and negative coordinates
        {
            PointRef.Point p = new PointRef.Point(0, 0);
            p.x = -5;
            p.y = -9;
            checkEq(p.x, -5, "negative x");
            checkEq(p.y, -9, "negative y");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
