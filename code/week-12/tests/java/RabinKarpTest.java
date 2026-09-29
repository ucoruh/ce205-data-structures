/* Unit tests for week-12 java/RabinKarp.java */
public class RabinKarpTest {
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
        RabinKarp.Result r;

        r = RabinKarp.rabinKarp("HELLOWORLD", "WORLD", 31, 101);
        checkEq(r.occurrences.size(), 1, "normal count");
        checkEq(r.occurrences.get(0), 5, "normal position");
        checkEq(r.spurious, 0, "normal spurious");

        r = RabinKarp.rabinKarp("AADBDDBCDBB", "AAD", 4, 7);
        checkEq(r.occurrences.size(), 1, "hard count");
        checkEq(r.occurrences.get(0), 0, "hard position");
        checkEq(r.spurious, 2, "hard spurious");

        r = RabinKarp.rabinKarp("DBCADADABDC", "BAD", 4, 7);
        checkEq(r.occurrences.size(), 0, "no genuine match");
        checkEq(r.spurious, 3, "3 spurious hits");

        r = RabinKarp.rabinKarp("AAAAAAAAAA", "AAA", 31, 101);
        checkEq(r.occurrences.size(), 8, "overlapping count");
        checkEq(r.spurious, 0, "overlapping spurious");

        r = RabinKarp.rabinKarp("ALGORITHMS", "RITHM", 31, 1000000007L);
        checkEq(r.occurrences.size(), 1, "large mod count");
        checkEq(r.occurrences.get(0), 4, "large mod position");
        checkEq(r.spurious, 0, "large mod spurious");

        r = RabinKarp.rabinKarp("HELLO", "HELLO", 31, 101);
        checkEq(r.occurrences.size(), 1, "text==pattern count");
        checkEq(r.occurrences.get(0), 0, "text==pattern position");

        r = RabinKarp.rabinKarp("THEQUICKFOX", "ZEBRA", 31, 1000000007L);
        checkEq(r.occurrences.size(), 0, "not found");
        checkEq(r.spurious, 0, "not found spurious");

        long direct = RabinKarp.windowHash("ORLD", 4, 31, 101);
        check(direct >= 0 && direct < 101, "windowHash in range");

        r = RabinKarp.rabinKarp("BANANA", "A", 31, 101);
        checkEq(r.occurrences.size(), 3, "single-char count");
        checkEq(r.occurrences.get(0), 1, "single-char[0]");
        checkEq(r.occurrences.get(1), 3, "single-char[1]");
        checkEq(r.occurrences.get(2), 5, "single-char[2]");

        r = RabinKarp.rabinKarp("HELLO", "", 31, 101);
        checkEq(r.occurrences.size(), 6, "empty pattern count");
        checkEq(r.spurious, 0, "empty pattern spurious");
        for (int i = 0; i <= 5; i++) checkEq(r.occurrences.get(i), i, "empty pattern[" + i + "]");

        r = RabinKarp.rabinKarp("", "AB", 31, 101);
        checkEq(r.occurrences.size(), 0, "empty text count");

        r = RabinKarp.rabinKarp("AB", "ABCDE", 31, 101);
        checkEq(r.occurrences.size(), 0, "pattern longer than non-empty text");
        checkEq(r.spurious, 0, "pattern longer than non-empty text spurious");

        r = RabinKarp.rabinKarp("", "", 31, 101);
        checkEq(r.occurrences.size(), 1, "both empty count");
        checkEq(r.occurrences.get(0), 0, "both empty position");

        RabinKarp.runScenario("unit-test integration", "HELLOWORLD", "WORLD", 31, 101);

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
