/* Week 12 -- Strings: Structures and Algorithms
 * Naive (brute-force) substring search: try every shift, compare left to right until a mismatch or a full
 * match. Worst case O(n*m).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.ArrayList;
import java.util.List;

public class NaiveSearch {
    static List<Integer> naiveSearch(String text, String pattern) {
        int n = text.length(), m = pattern.length();
        List<Integer> occ = new ArrayList<>();
        for (int s = 0; s <= n - m; s++) {          // try every shift
            int j = 0;
            while (j < m && text.charAt(s + j) == pattern.charAt(j)) j++;   // compare left to right
            if (j == m) occ.add(s);                  // whole pattern matched: occurrence at s
        }
        return occ;
    }

    static void runScenario(String label, String text, String pattern) {
        System.out.println("-- " + label + " --");
        System.out.println("text = \"" + text + "\" (" + text.length() + " letters), pattern = \"" + pattern + "\" (" + pattern.length() + " letters)");
        List<Integer> occ = naiveSearch(text, pattern);
        System.out.print("occurrences (" + occ.size() + "): ");
        if (occ.isEmpty()) System.out.print("(none)");
        else {
            for (int i = 0; i < occ.size(); i++) System.out.print((i > 0 ? ", " : "") + occ.get(i));
        }
        System.out.println();
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: a few false starts", "ABABAABABC", "ABABC");
        runScenario("hard: worst case, fails late every time", "AAAAAAAAAA", "AAAB");
        runScenario("edge: never found, always fails early", "THEQUICKFOX", "ZEBRA");
        runScenario("edge: an overlapping match at every shift", "AAAAAAAAAA", "AAA");
        runScenario("edge: text == pattern, only one possible shift", "ALGORITHMS", "ALGORITHMS");
    }
}
