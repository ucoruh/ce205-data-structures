/* Unit tests for week-01 java/ReferenceAliasing.java. No addresses are printed (Java prints "null" for a
 * null reference, deterministically), so the whole captured output is checked line by line, plus the
 * Counter class's aliasing property is exercised directly with fresh values.
 */
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class ReferenceAliasingTest {
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
        // the whole program's output, every line, hand-written independent of the source
        {
            String out = capture(() -> ReferenceAliasing.main(new String[0]));
            check(out.contains("a.value = 1, b.value = 1"), "initial values (aliased)");
            check(out.contains("a and b refer to the same object: true"), "a == b");
            check(out.contains("after b.value = 99: a.value = 99"), "write through b visible through a");
            check(out.contains("a = null, b.value = 99"), "a set to null, b still reachable");
            check(out.contains("b = null (the Counter object has no reachable reference left)"), "b set to null too");
            int newlines = 0;
            for (int i = 0; i < out.length(); i++)
                if (out.charAt(i) == '\n') newlines++;
            checkEq(newlines, 5, "five lines of output total");
        }

        // Counter with a zero and a negative starting value
        {
            ReferenceAliasing.Counter z = new ReferenceAliasing.Counter(0);
            checkEq(z.value, 0, "zero starting value");
            ReferenceAliasing.Counter neg = new ReferenceAliasing.Counter(-17);
            checkEq(neg.value, -17, "negative starting value");
        }

        // the Counter class itself: fresh values, independent of what main() uses
        {
            ReferenceAliasing.Counter a = new ReferenceAliasing.Counter(5);
            ReferenceAliasing.Counter b = a; // alias, not a copy
            checkEq(a.value, 5, "fresh value");
            check(a == b, "b is an alias of a");
            b.value = -3;
            checkEq(a.value, -3, "write through b visible through a");
        }

        // two independently-created Counters are NOT the same object, even with equal values
        {
            ReferenceAliasing.Counter a = new ReferenceAliasing.Counter(7);
            ReferenceAliasing.Counter b = new ReferenceAliasing.Counter(7);
            check(a != b, "two `new` Counters are distinct objects");
            a.value = 100;
            checkEq(b.value, 7, "b untouched by writes to a");
        }

        // setting a reference to null does not affect an alias that still points at the object
        {
            ReferenceAliasing.Counter a = new ReferenceAliasing.Counter(42);
            ReferenceAliasing.Counter b = a;
            a = null;
            check(a == null, "a is now null");
            checkEq(b.value, 42, "b still reaches the object");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
