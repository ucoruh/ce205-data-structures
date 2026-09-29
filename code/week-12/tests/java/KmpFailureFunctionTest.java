/* Unit tests for week-12 java/KmpFailureFunction.java */
public class KmpFailureFunctionTest {
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
        int[] lps;

        lps = KmpFailureFunction.computeLps("A");
        checkEq(lps[0], 0, "single char");

        lps = KmpFailureFunction.computeLps("ABCDE");
        for (int i = 0; i < 5; i++) checkEq(lps[i], 0, "no repeat[" + i + "]");

        lps = KmpFailureFunction.computeLps("AAAA");
        checkEq(lps[0], 0, "AAAA[0]");
        checkEq(lps[1], 1, "AAAA[1]");
        checkEq(lps[2], 2, "AAAA[2]");
        checkEq(lps[3], 3, "AAAA[3]");

        lps = KmpFailureFunction.computeLps("ABABCABAB");
        int[] expect1 = {0, 0, 1, 2, 0, 1, 2, 3, 4};
        for (int i = 0; i < 9; i++) checkEq(lps[i], expect1[i], "classic[" + i + "]");

        lps = KmpFailureFunction.computeLps("ABABAB");
        int[] expect2 = {0, 0, 1, 2, 3, 4};
        for (int i = 0; i < 6; i++) checkEq(lps[i], expect2[i], "oscillating[" + i + "]");

        lps = KmpFailureFunction.computeLps("AABAACAABAA");
        int[] expect3 = {0, 1, 0, 1, 2, 0, 1, 2, 3, 4, 5};
        for (int i = 0; i < 11; i++) checkEq(lps[i], expect3[i], "chain[" + i + "]");

        lps = KmpFailureFunction.computeLps("AB");
        checkEq(lps[0], 0, "AB[0]");
        checkEq(lps[1], 0, "AB[1]");

        lps = KmpFailureFunction.computeLps("AA");
        checkEq(lps[0], 0, "AA[0]");
        checkEq(lps[1], 1, "AA[1]");

        lps = KmpFailureFunction.computeLps("AABAACAABAA");
        for (int i = 0; i < 11; i++) check(lps[i] < i + 1, "proper prefix at " + i);

        lps = KmpFailureFunction.computeLps("");   // empty pattern: no characters to compare, must not crash
        checkEq(lps.length, 0, "empty pattern length");

        lps = KmpFailureFunction.computeLps("éABé");   // non-ASCII: e-acute, A, B, e-acute
        checkEq(lps[0], 0, "non-ASCII[0]");
        checkEq(lps[1], 0, "non-ASCII[1]");
        checkEq(lps[2], 0, "non-ASCII[2]");
        checkEq(lps[3], 1, "non-ASCII[3]");   // the trailing e-acute reuses the leading one

        KmpFailureFunction.runScenario("unit-test integration", "ABABCABABA");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
