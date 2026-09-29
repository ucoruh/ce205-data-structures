/* Unit tests for week-12 java/SuffixArray.java */
public class SuffixArrayTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }
    static void checkSorted(String text, int[] sa) {
        for (int i = 0; i + 1 < sa.length; i++)
            check(text.substring(sa[i]).compareTo(text.substring(sa[i + 1])) < 0, "sorted at " + i);
    }

    public static void main(String[] args) {
        int[] sa;

        // -- one character --
        sa = SuffixArray.buildSuffixArray("A");
        checkEq(sa[0], 0, "single char");

        // -- two characters, already ascending --
        sa = SuffixArray.buildSuffixArray("AB");
        checkEq(sa[0], 0, "AB[0]");
        checkEq(sa[1], 1, "AB[1]");

        // -- two characters, descending --
        sa = SuffixArray.buildSuffixArray("BA");
        checkEq(sa[0], 1, "BA[0]");
        checkEq(sa[1], 0, "BA[1]");

        // -- classic example: BANANA --
        sa = SuffixArray.buildSuffixArray("BANANA");
        checkEq(sa[0], 5, "BANANA[0]");
        checkEq(sa[1], 3, "BANANA[1]");
        checkEq(sa[2], 1, "BANANA[2]");
        checkEq(sa[3], 0, "BANANA[3]");
        checkEq(sa[4], 4, "BANANA[4]");
        checkEq(sa[5], 2, "BANANA[5]");
        checkSorted("BANANA", sa);

        // -- every character identical --
        sa = SuffixArray.buildSuffixArray("AAAA");
        checkEq(sa[0], 3, "AAAA[0]");
        checkEq(sa[3], 0, "AAAA[3]");

        // -- already ascending --
        sa = SuffixArray.buildSuffixArray("ABCDE");
        for (int i = 0; i < 5; i++) checkEq(sa[i], i, "ascending[" + i + "]");

        // -- descending: maximal shifting --
        sa = SuffixArray.buildSuffixArray("EDCBA");
        checkSorted("EDCBA", sa);
        checkEq(sa[0], 4, "descending smallest");
        checkEq(sa[4], 0, "descending largest");

        // -- compareSuffix sign --
        check(SuffixArray.compareSuffix("BANANA", 0, 5) > 0, "BANANA > A");
        check(SuffixArray.compareSuffix("BANANA", 5, 0) < 0, "A < BANANA");
        checkEq(SuffixArray.compareSuffix("BANANA", 0, 0), 0, "self compare");

        // -- longer, realistic case --
        sa = SuffixArray.buildSuffixArray("MISSISSIPPI");
        checkSorted("MISSISSIPPI", sa);
        checkEq(sa[0], 10, "MISSISSIPPI smallest");
        checkEq(sa[10], 2, "MISSISSIPPI largest");

        // -- empty text: nothing to sort, must not crash --
        sa = SuffixArray.buildSuffixArray("");
        checkEq(sa.length, 0, "empty text length");

        // -- non-ASCII: String.compareTo compares UTF-16 code units, any value sorts correctly --
        sa = SuffixArray.buildSuffixArray("café");
        checkSorted("café", sa);

        // -- integration --
        SuffixArray.runScenario("unit-test integration", "ABAB");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
