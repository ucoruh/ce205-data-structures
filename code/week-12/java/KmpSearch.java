/* Week 12 -- Strings: Structures and Algorithms
 * KMP search: uses the lps[] failure-function table so the text pointer i never moves backward. O(n + m).
 * CEN207 Data Structures (formerly CE205)
 */
import java.util.ArrayList;
import java.util.List;

public class KmpSearch {
    static int[] computeLps(String pattern) {
        int m = pattern.length();
        int[] lps = new int[m];
        int len = 0, i = 1;
        while (i < m) {
            if (pattern.charAt(i) == pattern.charAt(len)) {
                len++;
                lps[i] = len;
                i++;
            } else if (len != 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
        return lps;
    }

    static List<Integer> kmpSearch(String text, String pattern, int[] lps) {
        int n = text.length(), m = pattern.length(), i = 0, j = 0;
        List<Integer> occ = new ArrayList<>();
        if (m == 0) {                 // the empty pattern matches at every position, including n
            for (int s = 0; s <= n; s++) occ.add(s);
            return occ;
        }
        while (i < n) {
            if (text.charAt(i) == pattern.charAt(j)) {
                i++; j++;
                if (j == m) {
                    occ.add(i - m);              // occurrence found; keep scanning
                    j = lps[j - 1];
                }
            } else if (j > 0) {
                j = lps[j - 1];                  // fall back in the PATTERN; i never moves back
            } else {
                i++;
            }
        }
        return occ;
    }

    static void runScenario(String label, String text, String pattern) {
        System.out.println("-- " + label + " --");
        System.out.println("text = \"" + text + "\" (" + text.length() + " letters), pattern = \"" + pattern + "\" (" + pattern.length() + " letters)");
        int[] lps = computeLps(pattern);
        List<Integer> occ = kmpSearch(text, pattern, lps);
        System.out.print("occurrences (" + occ.size() + "): ");
        if (occ.isEmpty()) System.out.print("(none)");
        else {
            for (int i = 0; i < occ.size(); i++) System.out.print((i > 0 ? ", " : "") + occ.get(i));
        }
        System.out.println();
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: the classic CLRS-style example", "ABABDABACDABABCABAB", "ABABCABAB");
        runScenario("hard: many lps fallbacks", "AAAAAAAAAAAAAAAB", "AAAAB");
        runScenario("edge: never found", "THEQUICKBROWNFOX", "ZEBRA");
        runScenario("edge: overlapping matches", "AAAAAAAAAA", "AAA");
        runScenario("edge: text == pattern, one match, no fallback at all", "ALGORITHMS", "ALGORITHMS");
    }
}
