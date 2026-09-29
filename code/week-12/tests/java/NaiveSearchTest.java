/* Unit tests for week-12 java/NaiveSearch.java */
import java.util.List;

public class NaiveSearchTest {
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
        List<Integer> occ;

        occ = NaiveSearch.naiveSearch("ABABAABABC", "ABABC");
        checkEq(occ.size(), 1, "one match count");
        checkEq(occ.get(0), 5, "one match position");

        occ = NaiveSearch.naiveSearch("THEQUICKFOX", "ZEBRA");
        checkEq(occ.size(), 0, "not found");

        occ = NaiveSearch.naiveSearch("AAAAAAAAAA", "AAAB");
        checkEq(occ.size(), 0, "worst case none found");

        occ = NaiveSearch.naiveSearch("AAAAAAAAAA", "AAA");
        checkEq(occ.size(), 8, "overlapping count");
        for (int i = 0; i < 8; i++) checkEq(occ.get(i), i, "overlapping[" + i + "]");

        occ = NaiveSearch.naiveSearch("HELLO", "HELLO");
        checkEq(occ.size(), 1, "text==pattern count");
        checkEq(occ.get(0), 0, "text==pattern position");

        occ = NaiveSearch.naiveSearch("AB", "ABCDE");
        checkEq(occ.size(), 0, "pattern longer than text");

        occ = NaiveSearch.naiveSearch("BANANA", "A");
        checkEq(occ.size(), 3, "single-char count");
        checkEq(occ.get(0), 1, "single-char[0]");
        checkEq(occ.get(1), 3, "single-char[1]");
        checkEq(occ.get(2), 5, "single-char[2]");

        occ = NaiveSearch.naiveSearch("XXXXXABC", "ABC");
        checkEq(occ.size(), 1, "last shift count");
        checkEq(occ.get(0), 5, "last shift position");

        occ = NaiveSearch.naiveSearch("ABCABC", "ABC");
        checkEq(occ.size(), 2, "two occurrences count");
        checkEq(occ.get(0), 0, "two occurrences[0]");
        checkEq(occ.get(1), 3, "two occurrences[1]");

        occ = NaiveSearch.naiveSearch("HELLO", "");
        checkEq(occ.size(), 6, "empty pattern count");
        for (int i = 0; i <= 5; i++) checkEq(occ.get(i), i, "empty pattern[" + i + "]");

        occ = NaiveSearch.naiveSearch("", "AB");
        checkEq(occ.size(), 0, "empty text count");

        occ = NaiveSearch.naiveSearch("", "");
        checkEq(occ.size(), 1, "both empty count");
        checkEq(occ.get(0), 0, "both empty position");

        occ = NaiveSearch.naiveSearch("caféz", "é");
        checkEq(occ.size(), 1, "non-ASCII count");
        checkEq(occ.get(0), 3, "non-ASCII position");

        NaiveSearch.runScenario("unit-test integration", "ABABAABABC", "ABABC");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
