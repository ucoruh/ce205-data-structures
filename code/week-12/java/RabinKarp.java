/* Week 12 -- Strings: Structures and Algorithms
 * Rabin-Karp search: compare a rolling hash of each window against the pattern's hash; a hash match is only
 * a candidate and must be VERIFIED character by character (a "spurious hit" is a hash match that fails
 * verification).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
import java.util.ArrayList;
import java.util.List;

public class RabinKarp {
    static long windowHash(String s, int m, long base, long mod) {
        long h = 0;
        for (int k = 0; k < m; k++) h = (h * base + (s.charAt(k) - 'A')) % mod;
        return h;
    }

    static class Result {
        List<Integer> occurrences = new ArrayList<>();
        int spurious = 0;
    }

    static Result rabinKarp(String text, String pattern, long base, long mod) {
        int n = text.length(), m = pattern.length();
        Result r = new Result();
        if (m == 0) {                 // the empty pattern matches at every position, including n
            for (int s = 0; s <= n; s++) r.occurrences.add(s);
            return r;
        }
        if (n < m) return r;          // pattern longer than the text: no window fits, nothing to hash
        long pHash = windowHash(pattern, m, base, mod);
        long hPow = 1;
        for (int k = 0; k < m - 1; k++) hPow = (hPow * base) % mod;
        long tHash = windowHash(text, m, base, mod);        // first window, computed directly
        for (int s = 0; s <= n - m; s++) {
            if (s > 0)
                tHash = ((tHash - (text.charAt(s - 1) - 'A') * hPow % mod + mod) * base + (text.charAt(s + m - 1) - 'A')) % mod;
            if (tHash == pHash) {                            // candidate: VERIFY before counting it
                if (text.regionMatches(s, pattern, 0, m)) r.occurrences.add(s);
                else r.spurious++;
            }
        }
        return r;
    }

    static void runScenario(String label, String text, String pattern, long base, long mod) {
        System.out.println("-- " + label + " --");
        System.out.println("text = \"" + text + "\" (" + text.length() + " letters), pattern = \"" + pattern + "\" (" + pattern.length() + " letters), base=" + base + ", mod=" + mod);
        Result r = rabinKarp(text, pattern, base, mod);
        System.out.print("occurrences (" + r.occurrences.size() + "): ");
        if (r.occurrences.isEmpty()) System.out.print("(none)");
        else {
            for (int i = 0; i < r.occurrences.size(); i++) System.out.print((i > 0 ? ", " : "") + r.occurrences.get(i));
        }
        System.out.println(", spurious hits: " + r.spurious);
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: mod=101, no spurious hits", "HELLOWORLD", "WORLD", 31, 101);
        runScenario("hard: mod=7 (small), 1 genuine + 2 spurious hits", "AADBDDBCDBB", "AAD", 4, 7);
        runScenario("edge: mod=7, no genuine match but 3 spurious collisions", "DBCADADABDC", "BAD", 4, 7);
        runScenario("edge: a genuine overlapping match everywhere", "AAAAAAAAAA", "AAA", 31, 101);
        runScenario("edge: mod=1000000007 (large prime), a spurious hit is practically impossible", "ALGORITHMS", "RITHM", 31, 1000000007L);
    }
}
