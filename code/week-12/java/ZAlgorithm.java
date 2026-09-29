/* Week 12 -- Strings: Structures and Algorithms
 * The Z-algorithm: Z[i] is how many characters S[i..] shares with S itself from the start. For
 * S = pattern + '#' + text, positions in the text part with Z[i] >= |pattern| mark occurrences. O(n + m).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.ArrayList;
import java.util.List;

public class ZAlgorithm {
    static int[] zArray(String s) {
        int n = s.length();
        int[] z = new int[n];
        int l = 0, r = 0;
        for (int i = 1; i < n; i++) {
            if (i < r)
                z[i] = Math.min(r - i, z[i - l]);   // reuse the [l,r) window
            while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i]))
                z[i]++;                              // extend by direct comparison
            if (i + z[i] > r) { l = i; r = i + z[i]; }   // window grew: remember it
        }
        return z;
    }

    static List<Integer> zSearch(String pattern, String text) {
        int m = pattern.length(), n = text.length();
        List<Integer> occ = new ArrayList<>();
        if (m == 0) {                 // the empty pattern matches at every position, including n
            for (int s = 0; s <= n; s++) occ.add(s);
            return occ;
        }
        String s = pattern + "#" + text;                          // combined string
        int[] z = zArray(s);
        for (int i = m + 1; i < m + 1 + n; i++)
            if (z[i] >= m) occ.add(i - (m + 1));                    // Z[i] >= m: a full match
        return occ;
    }

    static void runScenario(String label, String pattern, String text) {
        System.out.println("-- " + label + " --");
        System.out.println("pattern = \"" + pattern + "\" (" + pattern.length() + " letters), text = \"" + text + "\" (" + text.length() + " letters)");
        List<Integer> occ = zSearch(pattern, text);
        System.out.print("occurrences (" + occ.size() + "): ");
        if (occ.isEmpty()) System.out.print("(none)");
        else {
            for (int i = 0; i < occ.size(); i++) System.out.print((i > 0 ? ", " : "") + occ.get(i));
        }
        System.out.println();
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: a periodic Z array", "AB", "ABABABABAB");
        runScenario("hard: the window is reused constantly", "AAA", "AAAAAAAAAA");
        runScenario("edge: no match at all, Z stays small", "XYZ", "ABCDEFGHIJ");
        runScenario("edge: matches only at the very first position", "ABC", "ABCDEFGHIJ");
        runScenario("edge: the m=1 boundary case, many matches", "A", "BABABABABA");
    }
}
