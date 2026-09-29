/* Unit tests for week-03 java/PrefixEvaluator.java
 * Prefix scans right to left; expected values are independently hand-derived via a
 * left-to-right recursive-descent parse of the prefix tree (see
 * test_prefix_evaluator.c for the full worked derivation of the "normal" preset,
 * where an initial guess of 42 by loose analogy with the postfix evaluator was
 * caught and corrected to the real answer, 56). */
public class PrefixEvaluatorTest {
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
        PrefixEvaluator ev = new PrefixEvaluator();
        boolean[] err;

        err = new boolean[]{false};
        checkEq(ev.evalPrefix(new String[]{"5"}, err), 5, "single number");

        err = new boolean[]{false};
        checkEq(ev.evalPrefix(new String[]{"+", "3", "4"}, err), 7, "+ 3 4");

        err = new boolean[]{false};
        checkEq(ev.evalPrefix(new String[]{"-", "10", "3"}, err), 7, "- 10 3 means 10-3");

        err = new boolean[]{false};
        checkEq(ev.evalPrefix(new String[]{"*", "6", "7"}, err), 42, "* 6 7");

        err = new boolean[]{false};
        checkEq(ev.evalPrefix(new String[]{"/", "7", "2"}, err), 3, "/ 7 2 means 7/2, truncates");

        err = new boolean[]{false};
        checkEq(ev.evalPrefix(new String[]{"*", "+", "2", "3", "4"}, err), 20, "(2+3)*4");

        // -- the program's own normal preset. Recursive-descent parse tree:
        //    -( +( -( *( +(5,3), 8 ), 2 ), 6 ), 12 ) = -( +( -(64,2), 6 ), 12 )
        //    = -( +(62, 6), 12 ) = -(68, 12) = 56 --
        err = new boolean[]{false};
        String[] normal = {"-", "+", "-", "*", "+", "5", "3", "8", "2", "6", "12"};
        checkEq(ev.evalPrefix(normal, err), 56, "normal preset");
        check(!err[0], "no error normal");

        // -- too few operands: an operator as the last (first-processed) token --
        err = new boolean[]{false};
        ev.evalPrefix(new String[]{"+", "5"}, err);
        check(err[0], "too few operands (1)");
        err = new boolean[]{false};
        ev.evalPrefix(new String[]{"+"}, err);
        check(err[0], "too few operands (0)");

        // -- the program's own too-few-operands abnormal preset --
        err = new boolean[]{false};
        String[] edge = {"+", "5", "3", "8", "2", "*", "9", "+", "6", "-", "7"};
        ev.evalPrefix(edge, err);
        check(err[0], "abnormal preset: too few operands");

        // -- division by zero --
        err = new boolean[]{false};
        ev.evalPrefix(new String[]{"/", "4", "0"}, err);
        check(err[0], "division by zero");

        // -- too many operands left over --
        err = new boolean[]{false};
        ev.evalPrefix(new String[]{"3", "4"}, err);
        check(err[0], "too many operands left");

        // -- empty input --
        err = new boolean[]{false};
        ev.evalPrefix(new String[]{}, err);
        check(err[0], "empty input is an error");

        // -- negative results --
        err = new boolean[]{false};
        checkEq(ev.evalPrefix(new String[]{"-", "3", "10"}, err), -7, "negative result");
        check(!err[0], "negative result is not an error");

        checkEq(PrefixEvaluator.apply('+', 2, 3), 5, "apply +");
        checkEq(PrefixEvaluator.apply('-', 2, 3), -1, "apply -");
        checkEq(PrefixEvaluator.apply('*', 2, 3), 6, "apply *");
        checkEq(PrefixEvaluator.apply('/', 7, 2), 3, "apply /");
        check(PrefixEvaluator.isNumber("5"), "isNumber true");
        check(!PrefixEvaluator.isNumber("-"), "isNumber false");

        // -- integration --
        ev.run("unit-test integration", new String[]{"+", "3", "4"});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
