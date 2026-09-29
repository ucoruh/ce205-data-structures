/* Unit tests for week-12 java/LongestCommonSubsequence.java */
public class LongestCommonSubsequenceTest {
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
        int[][] dp;
        String out;

        dp = new int[4][4];
        checkEq(LongestCommonSubsequence.lcsLength("CAT", "CAT", dp), 3, "identical length");
        out = LongestCommonSubsequence.traceback("CAT", "CAT", dp);
        check(out.equals("CAT"), "identical LCS text");

        dp = new int[1][4];
        checkEq(LongestCommonSubsequence.lcsLength("", "ABC", dp), 0, "empty a length");
        dp = new int[4][1];
        checkEq(LongestCommonSubsequence.lcsLength("ABC", "", dp), 0, "empty b length");

        dp = new int[6][6];
        checkEq(LongestCommonSubsequence.lcsLength("ABCDE", "FGHIJ", dp), 0, "no shared letters length");
        out = LongestCommonSubsequence.traceback("ABCDE", "FGHIJ", dp);
        check(out.isEmpty(), "no shared letters LCS empty");

        dp = new int[8][7];
        checkEq(LongestCommonSubsequence.lcsLength("ABCBDAB", "BDCABA", dp), 4, "classic ABCBDAB length");
        out = LongestCommonSubsequence.traceback("ABCBDAB", "BDCABA", dp);
        checkEq(out.length(), 4, "classic ABCBDAB LCS length");

        dp = new int[7][8];
        checkEq(LongestCommonSubsequence.lcsLength("AGGTAB", "GXTXAYB", dp), 4, "classic AGGTAB length");
        out = LongestCommonSubsequence.traceback("AGGTAB", "GXTXAYB", dp);
        check(out.equals("GTAB"), "classic AGGTAB LCS text");

        dp = new int[5][9];
        checkEq(LongestCommonSubsequence.lcsLength("ACEG", "ABCDEFGH", dp), 4, "fully contained length");
        out = LongestCommonSubsequence.traceback("ACEG", "ABCDEFGH", dp);
        check(out.equals("ACEG"), "fully contained LCS text");

        dp = new int[8][7];
        LongestCommonSubsequence.lcsLength("ABCBDAB", "BDCABA", dp);
        out = LongestCommonSubsequence.traceback("ABCBDAB", "BDCABA", dp);
        int ai = 0;
        boolean isSubsequence = true;
        for (int oi = 0; oi < out.length(); oi++) {
            while (ai < 7 && "ABCBDAB".charAt(ai) != out.charAt(oi)) ai++;
            if (ai >= 7) { isSubsequence = false; break; }
            ai++;
        }
        check(isSubsequence, "traced LCS is a genuine subsequence of a");

        dp = new int[2][2];
        checkEq(LongestCommonSubsequence.lcsLength("A", "A", dp), 1, "single shared char");
        checkEq(LongestCommonSubsequence.lcsLength("A", "B", dp), 0, "single unshared char");

        dp = new int[7][8];
        int len1 = LongestCommonSubsequence.lcsLength("AGGTAB", "GXTXAYB", dp);
        dp = new int[8][7];
        int len2 = LongestCommonSubsequence.lcsLength("GXTXAYB", "AGGTAB", dp);
        checkEq(len1, len2, "symmetry");

        dp = new int[5][4];
        checkEq(LongestCommonSubsequence.lcsLength("café", "caf", dp), 3, "non-ASCII length");
        out = LongestCommonSubsequence.traceback("café", "caf", dp);
        check(out.equals("caf"), "non-ASCII LCS text");

        LongestCommonSubsequence.runScenario("unit-test integration", "ABCBDAB", "BDCABA");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
