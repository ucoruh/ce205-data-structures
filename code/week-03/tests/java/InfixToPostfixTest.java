/* Unit tests for week-03 java/InfixToPostfix.java
 * Expected postfix strings are hand-traced against the shunting-yard rules
 * (precedence table + left-associative pop-on-equal), not copied from the
 * program's own output -- see test_infix_to_postfix.c for the same derivations. */
public class InfixToPostfixTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }
    static void checkEq(Object actual, Object expected, String label) {
        checks++;
        boolean eq = (actual == null) ? (expected == null) : actual.equals(expected);
        if (!eq) { failures++; System.out.println("FAIL: " + label + " = " + actual + ", expected " + expected); }
    }

    public static void main(String[] args) {
        InfixToPostfix c = new InfixToPostfix();

        checkEq(c.toPostfix(""), "", "empty input");
        checkEq(c.toPostfix("A"), "A", "single operand");
        checkEq(c.toPostfix("A+B"), "AB+", "one operator");
        checkEq(c.toPostfix("A*B+C"), "AB*C+", "precedence: A*B+C");
        checkEq(c.toPostfix("A+B*C"), "ABC*+", "precedence: A+B*C");
        checkEq(c.toPostfix("A-B-C"), "AB-C-", "left-associativity");
        checkEq(c.toPostfix("(A+B)*C"), "AB+C*", "parens override precedence");
        checkEq(c.toPostfix("(A)"), "A", "redundant parens");

        checkEq(c.toPostfix("A+B*C-D+E*F"), "ABC*+D-EF*+", "normal preset");
        checkEq(c.toPostfix("(A+B)*(C-D)/E+F*G"), "AB+CD-*E/FG*+", "hard preset");
        checkEq(c.toPostfix("A+B+C+D+E+F+G+H+I+J"), "AB+C+D+E+F+G+H+I+J+", "edge preset");

        check(c.toPostfix("(") == null, "unbalanced: lone opener");
        check(c.toPostfix("A+B") != null, "sanity: well-formed still returns non-null");
        check(c.toPostfix("A+(B") == null, "unbalanced: missing close");
        check(c.toPostfix("A+(B*C-(D+E)*F") == null, "abnormal preset: missing close");

        check(c.toPostfix(")") == null, "unbalanced: lone closer");
        check(c.toPostfix("A+B)") == null, "unbalanced: extra close");
        check(c.toPostfix("A+B*C)-D+E*F") == null, "abnormal preset: extra close");

        // -- a well-formed expression right after a failed one must still work --
        checkEq(c.toPostfix("A+B"), "AB+", "recovers after failure");

        checkEq(InfixToPostfix.prec('+'), 1, "prec +");
        checkEq(InfixToPostfix.prec('-'), 1, "prec -");
        checkEq(InfixToPostfix.prec('*'), 2, "prec *");
        checkEq(InfixToPostfix.prec('/'), 2, "prec /");
        checkEq(InfixToPostfix.prec('('), 0, "prec (");

        // -- integration --
        c.run("unit-test integration", "A+B*C");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
