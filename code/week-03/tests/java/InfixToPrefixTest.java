/* Unit tests for week-03 java/InfixToPrefix.java
 * Expected prefix strings are hand-derived independently, by fully parenthesizing
 * the infix expression per the standard precedence/associativity rules and then
 * moving each operator in front of its two operands -- see test_infix_to_prefix.c
 * for the full derivations (including the recursive-descent parse-tree check that
 * caught an arithmetic mistake in the prefix EVALUATOR test, a related but
 * different program). */
public class InfixToPrefixTest {
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
        InfixToPrefix c = new InfixToPrefix();

        checkEq(c.toPrefix("A"), "A", "single operand");
        checkEq(c.toPrefix("A+B"), "+AB", "one operator");
        checkEq(c.toPrefix("A*B+C"), "+*ABC", "precedence: A*B+C is (A*B)+C");
        checkEq(c.toPrefix("A-B-C"), "--ABC", "left-associativity: A-B-C is (A-B)-C");
        checkEq(c.toPrefix("(A)"), "A", "redundant parens");

        checkEq(c.toPrefix("A+B*C-D+E*F"), "+-+A*BCD*EF", "normal preset");
        checkEq(c.toPrefix("(A+B)*(C-D)/E+F*G"), "+/*+AB-CDE*FG", "hard preset");
        checkEq(c.toPrefix("A+B+C+D+E+F+G+H+I+J"), "+++++++++ABCDEFGHIJ", "edge preset");

        check(c.toPrefix(")") == null, "unbalanced: lone closer");
        check(c.toPrefix("A+B)") == null, "unbalanced: extra close");
        check(c.toPrefix("A+B*C)-D+E*F") == null, "abnormal preset: extra close");

        check(c.toPrefix("(") == null, "unbalanced: lone opener");
        check(c.toPrefix("A+(B") == null, "unbalanced: missing close");
        check(c.toPrefix("A+(B*C-(D+E)*F") == null, "abnormal preset: missing close");

        checkEq(c.toPrefix("A+B"), "+AB", "recovers after failure");

        checkEq(InfixToPrefix.swapParen('('), ')', "swapParen (");
        checkEq(InfixToPrefix.swapParen(')'), '(', "swapParen )");
        checkEq(InfixToPrefix.swapParen('A'), 'A', "swapParen non-paren");
        checkEq(InfixToPrefix.reverseAndSwapParens("A(B"), "B)A", "reverseAndSwapParens");

        // -- integration --
        c.run("unit-test integration", "A+B*C");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
