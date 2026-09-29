/* Week 12 -- Strings: Structures and Algorithms
 * Longest common subsequence (LCS): the longest sequence of characters appearing, in order, in both a and b.
 * A DP table plus a traceback that reconstructs one actual longest common subsequence.
 * CEN207 Data Structures (formerly CE205)
 */
public class LongestCommonSubsequence {
    static int lcsLength(String a, String b, int[][] dp) {
        int n = a.length(), m = b.length();
        for (int i = 0; i <= n; i++) dp[i][0] = 0;
        for (int j = 0; j <= m; j++) dp[0][j] = 0;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1))
                    dp[i][j] = dp[i - 1][j - 1] + 1;         // extend the diagonal by one
                else
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);   // better neighbor
            }
        }
        return dp[n][m];
    }

    static String traceback(String a, String b, int[][] dp) {
        int i = a.length(), j = b.length(), k = dp[i][j];
        char[] out = new char[k];
        while (i > 0 && j > 0) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) { out[--k] = a.charAt(i - 1); i--; j--; }   // part of the LCS
            else if (dp[i - 1][j] >= dp[i][j - 1]) i--;                                          // came from above
            else j--;                                                                             // came from the left
        }
        return new String(out);
    }

    static void runScenario(String label, String a, String b) {
        System.out.println("-- " + label + " --");
        System.out.println("a = \"" + a + "\" (" + a.length() + " letters), b = \"" + b + "\" (" + b.length() + " letters)");
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        int length = lcsLength(a, b, dp);
        String out = traceback(a, b, dp);
        System.out.println("lcs_length = " + length + ", one LCS = \"" + out + "\"");
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: the classic example, length 4", "ABCBDAB", "BDCABA");
        runScenario("hard: the bioinformatics classic, length 4", "AGGTAB", "GXTXAYB");
        runScenario("edge: no shared letters at all, length 0", "ABCDE", "FGHIJ");
        runScenario("edge: identical strings, the LCS is the whole string", "ALGORITHM", "ALGORITHM");
        runScenario("edge: ACEG is entirely a subsequence of ABCDEFGH", "ACEG", "ABCDEFGH");
    }
}
