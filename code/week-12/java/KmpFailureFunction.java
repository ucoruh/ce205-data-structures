/* Week 12 -- Strings: Structures and Algorithms
 * KMP failure function (lps[]): for every prefix pattern[0..i], lps[i] is the length of the longest proper
 * prefix of that prefix that is also a suffix of it. Built in O(m) by comparing the pattern to itself.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class KmpFailureFunction {
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
                len = lps[len - 1];       // fall back, do NOT advance i
            } else {
                lps[i] = 0;
                i++;
            }
        }
        return lps;
    }

    static void runScenario(String label, String pattern) {
        System.out.println("-- " + label + " --");
        System.out.println("pattern = \"" + pattern + "\" (" + pattern.length() + " letters)");
        int[] lps = computeLps(pattern);
        StringBuilder line = new StringBuilder("lps:");
        for (int v : lps) line.append(' ').append(v);
        System.out.println(line);
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: mixed growth and fallback", "ABABCABABA");
        runScenario("hard: grows at every step, lps[i] = i", "AAAAAAAAAA");
        runScenario("edge: no repetition at all, lps is always 0", "ABCDEFGHIJ");
        runScenario("edge: a constantly oscillating pattern", "ABABABABAB");
        runScenario("edge: the fallback chases a chain (lps[len-1])", "AABAACAABAA");
    }
}
