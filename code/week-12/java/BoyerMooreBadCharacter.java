/* Week 12 -- Strings: Structures and Algorithms
 * Boyer-Moore, bad-character rule only: compare the pattern to each window RIGHT to LEFT; on a mismatch, use
 * the mismatched character's last occurrence in the pattern to jump forward as far as safely possible.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BoyerMooreBadCharacter {
    static Map<Character, Integer> badCharTable(String pattern) {
        Map<Character, Integer> last = new HashMap<>();
        for (int j = 0; j < pattern.length(); j++) last.put(pattern.charAt(j), j);
        return last;
    }

    static List<Integer> boyerMooreBadChar(String text, String pattern, Map<Character, Integer> last) {
        int n = text.length(), m = pattern.length(), s = 0;
        List<Integer> occ = new ArrayList<>();
        while (s <= n - m) {
            int j = m - 1;
            while (j >= 0 && pattern.charAt(j) == text.charAt(s + j)) j--;   // compare RIGHT to LEFT
            if (j < 0) {
                occ.add(s);                 // full match at shift s
                s += 1;
            } else {
                int lo = last.getOrDefault(text.charAt(s + j), -1);
                int shift = j - lo;
                s += shift > 1 ? shift : 1; // always advance by at least 1
            }
        }
        return occ;
    }

    static void runScenario(String label, String text, String pattern) {
        System.out.println("-- " + label + " --");
        System.out.println("text = \"" + text + "\" (" + text.length() + " letters), pattern = \"" + pattern + "\" (" + pattern.length() + " letters)");
        Map<Character, Integer> last = badCharTable(pattern);
        List<Integer> occ = boyerMooreBadChar(text, pattern, last);
        System.out.print("occurrences (" + occ.size() + "): ");
        if (occ.isEmpty()) System.out.print("(none)");
        else {
            for (int i = 0; i < occ.size(); i++) System.out.print((i > 0 ? ", " : "") + occ.get(i));
        }
        System.out.println();
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: mixed-size jumps", "ABAAABCDAB", "ABC");
        runScenario("hard: low diversity, weak jumps", "AAAAAAAAAA", "AAAB");
        runScenario("edge: never found", "THEQUICKBROWNFOX", "ZEBRA");
        runScenario("edge: Z is not in the pattern -- the biggest possible jump every time", "ZZZZZZZZZZ", "ABC");
        runScenario("edge: the match is near the end", "XXXXXXXABC", "ABC");
    }
}
