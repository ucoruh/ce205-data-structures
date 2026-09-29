/* Unit tests for week-01 java/ReferenceBasics.java. No addresses are printed, so the whole captured
 * output is checked, plus the array-aliasing-vs-primitive-copy distinction is exercised directly.
 */
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class ReferenceBasicsTest {
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
        // the whole program's output, hand-written independent of the source
        {
            String out = capture(() -> ReferenceBasics.main(new String[0]));
            check(out.contains("x = 3"), "plain int value");
            check(out.contains("box[0] = 3 (box holds a reference to the array)"), "array element");
            check(out.contains("after alias[0] = 5: box[0] = 5"), "write through alias visible through box");
            check(out.contains("after y = 99: x = 3 (unchanged, x and y are independent)"), "primitive copy is independent");
            int newlines = 0;
            for (int i = 0; i < out.length(); i++)
                if (out.charAt(i) == '\n') newlines++;
            checkEq(newlines, 4, "four lines of output");
        }

        // array reference aliasing, exercised directly with fresh values (arrays are reference types)
        {
            int[] box = {10};
            int[] alias = box; // same array, not a copy
            alias[0] = 20;
            checkEq(box[0], 20, "write through alias visible through box (fresh values)");
        }

        // two independently-created arrays with equal content are NOT the same reference
        {
            int[] a = {1, 2, 3};
            int[] b = {1, 2, 3};
            check(a != b, "distinct array objects");
            a[0] = 99;
            checkEq(b[0], 1, "b untouched by writes to a");
        }

        // primitive int assignment always copies the value
        {
            int x = 7;
            int y = x;
            y = 500;
            checkEq(x, 7, "x unaffected by reassigning y");
            checkEq(y, 500, "y holds its own new value");
        }

        // a longer array: aliasing holds for every index, not just index 0
        {
            int[] box = {1, 2, 3, 4, 5};
            int[] alias = box;
            for (int i = 0; i < box.length; i++)
                alias[i] = alias[i] * 10;
            for (int i = 0; i < box.length; i++)
                checkEq(box[i], (i + 1) * 10, "index " + i + " visible through box");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
