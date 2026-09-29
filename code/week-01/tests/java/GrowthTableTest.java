/* Unit tests for week-01 java/GrowthTable.java: printRow()/runScenario() only print, so stdout is
 * captured. Expected numbers are hand-verified constants (2^n via an INDEPENDENT BigInteger.pow(), a
 * different code path from printRow's own BigInteger.ONE.shiftLeft()).
 */
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.math.BigInteger;

public class GrowthTableTest {
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
        // n = 1: log2(1) = 0, 1*log2(1) = 0, 1^2 = 1, 2^1 = 2
        {
            String out = capture(() -> GrowthTable.printRow(1));
            check(out.contains("n=1 "), "n=1 label");
            check(out.contains("log2(n)=0 "), "n=1 log2n");
            check(out.contains("n*log2(n)=0 "), "n=1 nlogn");
            check(out.contains("n^2=1 "), "n=1 nsq");
            check(out.contains("2^n=2"), "n=1 pow2n");
        }

        // n = 512 (the table's largest n): n^2 = 262144, 2^512 = the well-known 155-digit constant
        {
            String out = capture(() -> GrowthTable.printRow(512));
            check(out.contains("n^2=262144"), "n=512 nsq");
            check(out.contains("2^n=134078079299425970995740249982058461274793658205923933777235614437217640300"
                    + "73546976801874298166903427690031858186486050853753882811946569946433649006084096"), "n=512 pow2n");
        }

        // n = 64: 2^64, beyond a 64-bit long, must still be exact
        {
            String out = capture(() -> GrowthTable.printRow(64));
            check(out.contains("2^n=18446744073709551616"), "n=64 pow2n exact");
        }

        // independent oracle: for every n the scenarios actually use, BigInteger.valueOf(2).pow(n)
        // (a totally different algorithm from shiftLeft) must match what printRow prints
        {
            long[] ns = {1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 3, 5, 9, 14, 20, 27, 35, 44, 54};
            for (long n : ns) {
                String out = capture(() -> GrowthTable.printRow(n));
                String expected = "2^n=" + BigInteger.valueOf(2).pow((int) n).toString();
                check(out.contains(expected), "oracle match n=" + n);
            }
        }

        // n^2 as an independent long computation (n * n, not read from the program)
        {
            long[] ns = {1, 2, 4, 8, 16, 32, 64, 128, 256, 512};
            for (long n : ns) {
                String out = capture(() -> GrowthTable.printRow(n));
                check(out.contains("n^2=" + (n * n) + " "), "n^2 for n=" + n);
            }
        }

        // runScenario prints the label banner once, then one row per n, then a trailing blank line
        {
            long[] ns = {1, 3, 5};
            String out = capture(() -> GrowthTable.runScenario("test scenario", ns));
            check(out.contains("-- test scenario --"), "scenario banner");
            check(out.contains("n=1 "), "scenario row n=1");
            check(out.contains("n=3 "), "scenario row n=3");
            check(out.contains("n=5 "), "scenario row n=5");
            int newlines = 0;
            for (int i = 0; i < out.length(); i++)
                if (out.charAt(i) == '\n') newlines++;
            checkEq(newlines, 5, "scenario newline count (banner + 3 rows + trailing blank line)");
        }

        // single-value scenario (the note's own edge case)
        {
            String out = capture(() -> GrowthTable.runScenario("edge: a single value, n = 1", new long[] {1}));
            check(out.contains("-- edge: a single value, n = 1 --"), "single value banner");
            check(out.contains("2^n=2"), "single value pow2n");
        }

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
