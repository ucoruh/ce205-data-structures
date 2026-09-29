/* Week 12 -- Strings: Structures and Algorithms
 * Suffix array: every starting position of text, sorted by the suffix beginning there, built here with
 * insertion sort over String.compareTo on substrings.
 * CEN207 Data Structures (formerly CE205)
 */
public class SuffixArray {
    static int compareSuffix(String text, int a, int b) {
        return text.substring(a).compareTo(text.substring(b));
    }

    static int[] buildSuffixArray(String text) {
        int n = text.length();
        int[] sa = new int[n];
        for (int i = 0; i < n; i++) sa[i] = i;   // start: unsorted, index order
        for (int i = 1; i < n; i++) {
            int key = sa[i], j = i - 1;
            while (j >= 0 && compareSuffix(text, sa[j], key) > 0) {
                sa[j + 1] = sa[j];
                j--;
            }
            sa[j + 1] = key;
        }
        return sa;
    }

    static void runScenario(String label, String text) {
        System.out.println("-- " + label + " --");
        System.out.println("text = \"" + text + "\" (" + text.length() + " letters)");
        int[] sa = buildSuffixArray(text);
        StringBuilder line = new StringBuilder("suffix array:");
        for (int v : sa) line.append(' ').append(v);
        System.out.println(line);
        for (int i = 0; i < sa.length; i++) System.out.println("  sa[" + i + "]=" + sa[i] + " -> \"" + text.substring(sa[i]) + "\"");
        System.out.println();
    }

    public static void main(String[] args) {
        runScenario("normal: MISSISSIPPI, many repeating suffixes", "MISSISSIPPI");
        runScenario("hard: ABABABABAB, near-ties throughout", "ABABABABAB");
        runScenario("edge: AAAAAAAAAA, every character identical", "AAAAAAAAAA");
        runScenario("edge: ABCDEFGHIJ, already ascending", "ABCDEFGHIJ");
        runScenario("edge: JIHGFEDCBA, descending, the most shifting", "JIHGFEDCBA");
    }
}
