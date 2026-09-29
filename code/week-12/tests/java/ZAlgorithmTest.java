/* Unit tests for week-12 java/ZAlgorithm.java */
import java.util.List;

public class ZAlgorithmTest {
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
        int[] z;
        List<Integer> occ;

        z = ZAlgorithm.zArray("AAAA");
        checkEq(z[1], 3, "AAAA z1");
        checkEq(z[2], 2, "AAAA z2");
        checkEq(z[3], 1, "AAAA z3");

        z = ZAlgorithm.zArray("ABCDE");
        checkEq(z[1], 0, "ABCDE z1");
        checkEq(z[4], 0, "ABCDE z4");

        z = ZAlgorithm.zArray("ABABAB");
        checkEq(z[2], 4, "ABABAB z2");
        checkEq(z[4], 2, "ABABAB z4");

        occ = ZAlgorithm.zSearch("AB", "ABABABABAB");
        checkEq(occ.size(), 5, "normal count");
        checkEq(occ.get(0), 0, "normal[0]");
        checkEq(occ.get(1), 2, "normal[1]");

        occ = ZAlgorithm.zSearch("AAA", "AAAAAAAAAA");
        checkEq(occ.size(), 8, "overlapping count");

        occ = ZAlgorithm.zSearch("XYZ", "ABCDEFGHIJ");
        checkEq(occ.size(), 0, "no match");

        occ = ZAlgorithm.zSearch("ABC", "ABCDEFGHIJ");
        checkEq(occ.size(), 1, "match at start count");
        checkEq(occ.get(0), 0, "match at start position");

        occ = ZAlgorithm.zSearch("A", "BABABABABA");
        checkEq(occ.size(), 5, "single-char count");
        checkEq(occ.get(0), 1, "single-char[0]");
        checkEq(occ.get(1), 3, "single-char[1]");

        occ = ZAlgorithm.zSearch("HELLO", "HELLO");
        checkEq(occ.size(), 1, "text==pattern count");
        checkEq(occ.get(0), 0, "text==pattern position");

        occ = ZAlgorithm.zSearch("ABC", "ABCABC");
        checkEq(occ.size(), 2, "two occurrences count");
        checkEq(occ.get(0), 0, "two occurrences[0]");
        checkEq(occ.get(1), 3, "two occurrences[1]");

        occ = ZAlgorithm.zSearch("", "HELLO");
        checkEq(occ.size(), 6, "empty pattern count");
        for (int i = 0; i <= 5; i++) checkEq(occ.get(i), i, "empty pattern[" + i + "]");

        occ = ZAlgorithm.zSearch("AB", "");
        checkEq(occ.size(), 0, "empty text count");

        occ = ZAlgorithm.zSearch("", "");
        checkEq(occ.size(), 1, "both empty count");
        checkEq(occ.get(0), 0, "both empty position");

        occ = ZAlgorithm.zSearch("é", "caféz");
        checkEq(occ.size(), 1, "non-ASCII count");
        checkEq(occ.get(0), 3, "non-ASCII position");

        ZAlgorithm.runScenario("unit-test integration", "AB", "ABABABABAB");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
