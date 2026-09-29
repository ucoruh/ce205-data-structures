/* Unit tests for week-03 java/RecursionCountdown.java
 * countdown() only prints; captured via System.setOut() to a ByteArrayOutputStream
 * and checked against an independent, hand-built expectation. */
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;

public class RecursionCountdownTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(Object actual, Object expected, String label) {
        checks++;
        boolean eq = (actual == null) ? (expected == null) : actual.equals(expected);
        if (!eq) { failures++; System.out.println("FAIL: " + label + " = [" + actual + "], expected [" + expected + "]"); }
    }

    static String capture(int n) {
        PrintStream realOut = System.out;
        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        System.setOut(new PrintStream(buf, true, StandardCharsets.UTF_8));
        try {
            RecursionCountdown.countdown(n);
        } finally {
            System.setOut(realOut);
        }
        return buf.toString(StandardCharsets.UTF_8);
    }

    public static void main(String[] args) {
        String nl = System.lineSeparator();

        checkEq(capture(3), "3" + nl + "2" + nl + "1" + nl + "Liftoff!" + nl, "countdown(3)");
        checkEq(capture(1), "1" + nl + "Liftoff!" + nl, "countdown(1)");
        checkEq(capture(0), "Liftoff!" + nl, "countdown(0): straight to base case");
        checkEq(capture(-4), "Liftoff!" + nl, "countdown(-4): negative stops in one call");
        checkEq(capture(-1000000), "Liftoff!" + nl, "countdown(deeply negative): still one call");

        // -- the program's own "hard" preset: counts down 15..1, then Liftoff! --
        StringBuilder expected = new StringBuilder();
        for (int n = 15; n >= 1; n--) expected.append(n).append(nl);
        expected.append("Liftoff!").append(nl);
        checkEq(capture(15), expected.toString(), "countdown(15) hard preset");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
