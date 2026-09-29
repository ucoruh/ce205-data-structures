/* Unit tests for week-12 java/BoyerMooreBadCharacter.java */
import java.util.List;
import java.util.Map;

public class BoyerMooreBadCharacterTest {
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
        Map<Character, Integer> last;
        List<Integer> occ;

        last = BoyerMooreBadCharacter.badCharTable("ABC");
        checkEq(last.get('A'), 0, "table A");
        checkEq(last.get('B'), 1, "table B");
        checkEq(last.get('C'), 2, "table C");
        check(!last.containsKey('Z'), "table missing Z");

        last = BoyerMooreBadCharacter.badCharTable("ABAC");
        checkEq(last.get('A'), 2, "table rightmost A");

        last = BoyerMooreBadCharacter.badCharTable("ABC");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("ABAAABCDAB", "ABC", last);
        checkEq(occ.size(), 1, "normal count");
        checkEq(occ.get(0), 4, "normal position");

        last = BoyerMooreBadCharacter.badCharTable("ZEBRA");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("THEQUICKBROWNFOX", "ZEBRA", last);
        checkEq(occ.size(), 0, "never found");

        last = BoyerMooreBadCharacter.badCharTable("ABC");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("ZZZZZZZZZZ", "ABC", last);
        checkEq(occ.size(), 0, "absent char big jump");

        last = BoyerMooreBadCharacter.badCharTable("ABC");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("XXXXXXXABC", "ABC", last);
        checkEq(occ.size(), 1, "match at end count");
        checkEq(occ.get(0), 7, "match at end position");

        last = BoyerMooreBadCharacter.badCharTable("AAAB");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("AAAAAAAAAA", "AAAB", last);
        checkEq(occ.size(), 0, "low diversity none found");

        last = BoyerMooreBadCharacter.badCharTable("HELLO");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("HELLO", "HELLO", last);
        checkEq(occ.size(), 1, "text==pattern count");
        checkEq(occ.get(0), 0, "text==pattern position");

        last = BoyerMooreBadCharacter.badCharTable("AAA");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("AAAAAAAAAA", "AAA", last);
        checkEq(occ.size(), 8, "overlapping count");

        last = BoyerMooreBadCharacter.badCharTable("ABC");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("ABCABC", "ABC", last);
        checkEq(occ.size(), 2, "two occurrences count");
        checkEq(occ.get(0), 0, "two occurrences[0]");
        checkEq(occ.get(1), 3, "two occurrences[1]");

        last = BoyerMooreBadCharacter.badCharTable("");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("HELLO", "", last);
        checkEq(occ.size(), 6, "empty pattern count");
        for (int i = 0; i <= 5; i++) checkEq(occ.get(i), i, "empty pattern[" + i + "]");

        last = BoyerMooreBadCharacter.badCharTable("AB");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("", "AB", last);
        checkEq(occ.size(), 0, "empty text count");

        last = BoyerMooreBadCharacter.badCharTable("");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("", "", last);
        checkEq(occ.size(), 1, "both empty count");
        checkEq(occ.get(0), 0, "both empty position");

        last = BoyerMooreBadCharacter.badCharTable("é");
        occ = BoyerMooreBadCharacter.boyerMooreBadChar("caféz", "é", last);
        checkEq(occ.size(), 1, "non-ASCII count");
        checkEq(occ.get(0), 3, "non-ASCII position");

        BoyerMooreBadCharacter.runScenario("unit-test integration", "ABAAABCDAB", "ABC");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
