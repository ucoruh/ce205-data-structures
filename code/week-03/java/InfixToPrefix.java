/* Week 3 -- Stacks and Queues
 * Converting an infix expression to prefix: reverse the input (swapping
 * parentheses), run shunting-yard with the strict precedence rule, then
 * reverse the result.
 * CEN207 Data Structures (formerly CE205)
 */
public class InfixToPrefix {
    static int prec(char op) {
        if (op == '+' || op == '-') return 1;
        if (op == '*' || op == '/') return 2;
        return 0;
    }

    static char swapParen(char c) {
        if (c == '(') return ')';
        if (c == ')') return '(';
        return c;
    }

    static String reverseAndSwapParens(String in) {
        StringBuilder rev = new StringBuilder();
        for (int i = in.length() - 1; i >= 0; i--)
            rev.append(swapParen(in.charAt(i)));
        return rev.toString();
    }

    // Returns null when the input has unbalanced parentheses: an extra ')' with no '('
    // left to match, or a '(' that is never closed.
    String toPrefix(String in) {
        String rev = reverseAndSwapParens(in);      // 1) reverse, ( <-> )
        char[] ops = new char[100]; int top = -1; StringBuilder tmp = new StringBuilder();
        for (int i = 0; i < rev.length(); i++) {     // 2) shunting-yard, strict rule
            char c = rev.charAt(i);
            if (Character.isLetterOrDigit(c)) { tmp.append(c); continue; }
            if (c == '(') { ops[++top] = c; continue; }
            if (c == ')') {
                while (top >= 0 && ops[top] != '(') tmp.append(ops[top--]);
                if (top < 0) return null;            // unbalanced: nothing left to match this )
                top--; continue;
            }
            while (top >= 0 && ops[top] != '(' && prec(ops[top]) > prec(c))
                tmp.append(ops[top--]);              // strictly stronger only
            ops[++top] = c;
        }
        while (top >= 0) {
            if (ops[top] == '(') return null;        // unbalanced: this ( was never closed
            tmp.append(ops[top--]);
        }
        return tmp.reverse().toString();             // 3) reverse again
    }

    void run(String label, String expr) {
        System.out.println("-- " + label + " --");
        String result = toPrefix(expr);
        System.out.println(expr + " -> " + (result != null ? result : "ERROR (unbalanced parentheses)"));
        System.out.println();
    }

    public static void main(String[] args) {
        InfixToPrefix conv = new InfixToPrefix();

        // normal: 11 characters, a mix of single-letter operands
        conv.run("normal: 11 characters", "A+B*C-D+E*F");

        // hard: parenthesized, mixed-precedence, 18 characters
        conv.run("hard: parenthesized, mixed precedence", "(A+B)*(C-D)/E+F*G");

        // edge: a long chain of same-precedence operators (right-associativity check)
        conv.run("edge: same-precedence chain (right-associativity check)", "A+B+C+D+E+F+G+H+I+J");

        // abnormal: a closing parenthesis is missing -- the ( after C-( is never closed
        conv.run("abnormal: unbalanced, a closing parenthesis is missing", "A+(B*C-(D+E)*F");

        // abnormal: an extra closing parenthesis -- no ( was ever pushed to match it
        conv.run("abnormal: unbalanced, an extra closing parenthesis", "A+B*C)-D+E*F");
    }
}
