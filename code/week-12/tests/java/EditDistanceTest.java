/* Unit tests for week-12 java/EditDistance.java */
import java.util.List;

public class EditDistanceTest {
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
        int[][] dp;
        List<String> ops;

        dp = new int[4][4];
        checkEq(EditDistance.editDistance("CAT", "CAT", dp), 0, "identical distance");
        ops = EditDistance.traceback("CAT", "CAT", dp);
        checkEq(ops.size(), 3, "identical op count");
        for (String op : ops) check(op.equals("match"), "identical op is match");

        dp = new int[1][4];
        checkEq(EditDistance.editDistance("", "ABC", dp), 3, "empty a distance");
        dp = new int[4][1];
        checkEq(EditDistance.editDistance("ABC", "", dp), 3, "empty b distance");

        dp = new int[7][8];
        checkEq(EditDistance.editDistance("KITTEN", "SITTING", dp), 3, "KITTEN/SITTING distance");

        dp = new int[10][10];
        checkEq(EditDistance.editDistance("INTENTION", "EXECUTION", dp), 5, "INTENTION/EXECUTION distance");

        dp = new int[6][6];
        checkEq(EditDistance.editDistance("ABCDE", "FGHIJ", dp), 5, "no shared letters distance");

        dp = new int[4][12];
        checkEq(EditDistance.editDistance("CAT", "CATERPILLAR", dp), 8, "pure insertion distance");
        ops = EditDistance.traceback("CAT", "CATERPILLAR", dp);
        checkEq(ops.size(), 11, "pure insertion op count");
        for (int i = 0; i < 3; i++) check(ops.get(i).equals("match"), "insertion prefix match " + i);
        for (int i = 3; i < 11; i++) check(ops.get(i).equals("insert"), "insertion suffix insert " + i);

        dp = new int[12][4];
        checkEq(EditDistance.editDistance("CATERPILLAR", "CAT", dp), 8, "pure deletion distance");

        dp = new int[4][4];
        checkEq(EditDistance.editDistance("CAT", "COT", dp), 1, "single substitution distance");

        dp = new int[7][8];
        EditDistance.editDistance("KITTEN", "SITTING", dp);
        ops = EditDistance.traceback("KITTEN", "SITTING", dp);
        int nonMatch = 0;
        for (String op : ops) if (!op.equals("match")) nonMatch++;
        checkEq(nonMatch, 3, "non-match ops equal distance");

        dp = new int[5][5];
        checkEq(EditDistance.editDistance("café", "café", dp), 0, "non-ASCII identical distance");
        dp = new int[5][4];
        checkEq(EditDistance.editDistance("café", "caf", dp), 1, "non-ASCII distance");

        EditDistance.runScenario("unit-test integration", "KITTEN", "SITTING");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
