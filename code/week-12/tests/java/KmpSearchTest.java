/* Unit tests for week-12 java/KmpSearch.java */
import java.util.List;

public class KmpSearchTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(long actual, long expected, String label) {
        checks++;
        if (actual != expected) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        int[] lps;
        List<Integer> occ;

        lps = KmpSearch.computeLps("ABABCABAB");
        occ = KmpSearch.kmpSearch("ABABDABACDABABCABAB", "ABABCABAB", lps);
        checkEq(occ.size(), 1, "classic count");
        checkEq(occ.get(0), 10, "classic position");

        lps = KmpSearch.computeLps("ZEBRA");
        occ = KmpSearch.kmpSearch("THEQUICKBROWNFOX", "ZEBRA", lps);
        checkEq(occ.size(), 0, "not found");

        lps = KmpSearch.computeLps("AAA");
        occ = KmpSearch.kmpSearch("AAAAAAAAAA", "AAA", lps);
        checkEq(occ.size(), 8, "overlapping count");
        for (int i = 0; i < 8; i++) checkEq(occ.get(i), i, "overlapping[" + i + "]");

        lps = KmpSearch.computeLps("HELLO");
        occ = KmpSearch.kmpSearch("HELLO", "HELLO", lps);
        checkEq(occ.size(), 1, "text==pattern count");
        checkEq(occ.get(0), 0, "text==pattern position");

        lps = KmpSearch.computeLps("A");
        occ = KmpSearch.kmpSearch("BANANA", "A", lps);
        checkEq(occ.size(), 3, "single-char count");
        checkEq(occ.get(0), 1, "single-char[0]");
        checkEq(occ.get(1), 3, "single-char[1]");
        checkEq(occ.get(2), 5, "single-char[2]");

        lps = KmpSearch.computeLps("ABCDE");
        occ = KmpSearch.kmpSearch("AB", "ABCDE", lps);
        checkEq(occ.size(), 0, "pattern longer than text");

        lps = KmpSearch.computeLps("AAAAB");
        occ = KmpSearch.kmpSearch("AAAAAAAAAAAAAAAB", "AAAAB", lps);
        checkEq(occ.size(), 1, "fallback-heavy count");
        checkEq(occ.get(0), 11, "fallback-heavy position");

        lps = KmpSearch.computeLps("ABC");
        occ = KmpSearch.kmpSearch("ABCABC", "ABC", lps);
        checkEq(occ.size(), 2, "two occurrences count");
        checkEq(occ.get(0), 0, "two occurrences[0]");
        checkEq(occ.get(1), 3, "two occurrences[1]");

        lps = KmpSearch.computeLps("");
        occ = KmpSearch.kmpSearch("HELLO", "", lps);
        checkEq(occ.size(), 6, "empty pattern count");
        for (int i = 0; i <= 5; i++) checkEq(occ.get(i), i, "empty pattern[" + i + "]");

        lps = KmpSearch.computeLps("AB");
        occ = KmpSearch.kmpSearch("", "AB", lps);
        checkEq(occ.size(), 0, "empty text count");

        lps = KmpSearch.computeLps("");
        occ = KmpSearch.kmpSearch("", "", lps);
        checkEq(occ.size(), 1, "both empty count");
        checkEq(occ.get(0), 0, "both empty position");

        lps = KmpSearch.computeLps("é");
        occ = KmpSearch.kmpSearch("caféz", "é", lps);
        checkEq(occ.size(), 1, "non-ASCII count");
        checkEq(occ.get(0), 3, "non-ASCII position");

        KmpSearch.runScenario("unit-test integration", "ABABDABACDABABCABAB", "ABABCABAB");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
