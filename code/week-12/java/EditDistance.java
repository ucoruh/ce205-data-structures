/* Week 12 -- Strings: Structures and Algorithms
 * Edit distance (Levenshtein distance): the fewest insertions, deletions and substitutions to turn a into b,
 * a DP table plus a traceback that reconstructs one shortest edit sequence.
 * CEN207 Data Structures (formerly CE205)
 */
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class EditDistance {
    static int editDistance(String a, String b, int[][] dp) {
        int n = a.length(), m = b.length();
        for (int i = 0; i <= n; i++) dp[i][0] = i;            // delete all of a[0..i)
        for (int j = 0; j <= m; j++) dp[0][j] = j;            // insert all of b[0..j)
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1))
                    dp[i][j] = dp[i - 1][j - 1];               // match: no cost
                else {
                    int sub = dp[i - 1][j - 1], del = dp[i - 1][j], ins = dp[i][j - 1];
                    int best = Math.min(sub, Math.min(del, ins));
                    dp[i][j] = 1 + best;                        // substitute, delete or insert
                }
            }
        }
        return dp[n][m];
    }

    static List<String> traceback(String a, String b, int[][] dp) {
        int i = a.length(), j = b.length();
        List<String> ops = new ArrayList<>();
        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && a.charAt(i - 1) == b.charAt(j - 1) && dp[i][j] == dp[i - 1][j - 1]) {
                ops.add("match");
                i--; j--;
            } else if (i > 0 && j > 0 && dp[i][j] == dp[i - 1][j - 1] + 1) {
                ops.add("substitute");
                i--; j--;
            } else if (i > 0 && dp[i][j] == dp[i - 1][j] + 1) {
                ops.add("delete");
                i--;
            } else {
                ops.add("insert");
                j--;
            }
        }
        Collections.reverse(ops);
        return ops;
    }

    static void runScenario(String label, String a, String b) {
        System.out.println("-- " + label + " --");
        System.out.println("a = \"" + a + "\" (" + a.length() + " letters), b = \"" + b + "\" (" + b.length() + " letters)");
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        int distance = editDistance(a, b, dp);
        List<String> ops = traceback(a, b, dp);
        System.out.println("edit_distance = " + distance);
        StringBuilder line = new StringBuilder("ops:");
        for (String op : ops) line.append(' ').append(op);
        System.out.println(line);
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: the classic example, distance 3", "KITTEN", "SITTING");
        runScenario("hard: a big table, distance 5", "INTENTION", "EXECUTION");
        runScenario("edge: identical strings, distance 0", "ALGORITHM", "ALGORITHM");
        runScenario("edge: no shared letters, every position a substitution", "ABCDE", "FGHIJ");
        runScenario("edge: pure insertion", "CAT", "CATERPILLAR");
    }
}
