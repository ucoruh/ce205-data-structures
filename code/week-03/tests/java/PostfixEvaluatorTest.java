/* Unit tests for week-03 java/PostfixEvaluator.java */
public class PostfixEvaluatorTest {
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
        PostfixEvaluator ev = new PostfixEvaluator();
        boolean[] err;

        err = new boolean[]{false};
        checkEq(ev.evalPostfix(new String[]{"5"}, err), 5, "single number");
        check(!err[0], "no error 1");

        err = new boolean[]{false};
        checkEq(ev.evalPostfix(new String[]{"3", "4", "+"}, err), 7, "3 4 +");

        err = new boolean[]{false};
        checkEq(ev.evalPostfix(new String[]{"10", "3", "-"}, err), 7, "10 3 - (order matters)");

        err = new boolean[]{false};
        checkEq(ev.evalPostfix(new String[]{"6", "7", "*"}, err), 42, "6 7 *");

        err = new boolean[]{false};
        checkEq(ev.evalPostfix(new String[]{"7", "2", "/"}, err), 3, "7 2 / truncates");

        err = new boolean[]{false};
        checkEq(ev.evalPostfix(new String[]{"5", "3", "+", "8", "2", "-", "*"}, err), 48, "(5+3)*(8-2)");

        // -- the program's own normal preset: ((5+3)*(8-2)+6)-12 = 42 --
        err = new boolean[]{false};
        String[] normal = {"5", "3", "+", "8", "2", "-", "*", "6", "+", "12", "-"};
        checkEq(ev.evalPostfix(normal, err), 42, "normal preset");
        check(!err[0], "no error normal");

        // -- the program's own hard preset, hand-computed step by step to 27 --
        err = new boolean[]{false};
        String[] hard = {"12", "3", "/", "4", "*", "5", "+", "20", "-", "2", "*", "7", "+", "3", "*"};
        checkEq(ev.evalPostfix(hard, err), 27, "hard preset");
        check(!err[0], "no error hard");

        // -- division by zero --
        err = new boolean[]{false};
        ev.evalPostfix(new String[]{"4", "0", "/"}, err);
        check(err[0], "division by zero");

        // -- the program's own division-by-zero abnormal preset --
        err = new boolean[]{false};
        String[] edge = {"9", "3", "-", "6", "*", "0", "/", "5", "+", "8", "-", "2", "*"};
        ev.evalPostfix(edge, err);
        check(err[0], "abnormal preset: division by zero");

        // -- too few operands --
        err = new boolean[]{false};
        ev.evalPostfix(new String[]{"5", "+"}, err);
        check(err[0], "too few operands (1)");
        err = new boolean[]{false};
        ev.evalPostfix(new String[]{"+"}, err);
        check(err[0], "too few operands (0)");

        // -- too many operands left over --
        err = new boolean[]{false};
        ev.evalPostfix(new String[]{"3", "4"}, err);
        check(err[0], "too many operands left");

        // -- empty input --
        err = new boolean[]{false};
        ev.evalPostfix(new String[]{}, err);
        check(err[0], "empty input is an error");

        // -- negative results --
        err = new boolean[]{false};
        checkEq(ev.evalPostfix(new String[]{"3", "10", "-"}, err), -7, "negative result");
        check(!err[0], "negative result is not an error");

        checkEq(PostfixEvaluator.apply('+', 2, 3), 5, "apply +");
        checkEq(PostfixEvaluator.apply('-', 2, 3), -1, "apply -");
        checkEq(PostfixEvaluator.apply('*', 2, 3), 6, "apply *");
        checkEq(PostfixEvaluator.apply('/', 7, 2), 3, "apply /");
        check(PostfixEvaluator.isNumber("5"), "isNumber true");
        check(!PostfixEvaluator.isNumber("+"), "isNumber false");

        // -- integration --
        ev.run("unit-test integration", new String[]{"3", "4", "+"});

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
