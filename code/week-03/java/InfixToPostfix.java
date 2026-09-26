/* Week 3 -- Stacks and Queues
 * Converting an infix expression to postfix (shunting-yard), with parentheses.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class InfixToPostfix {
    static int prec(char op) {
        if (op == '+' || op == '-') return 1;
        if (op == '*' || op == '/') return 2;
        return 0;
    }

    String toPostfix(String in) {
        char[] ops = new char[100]; int top = -1; StringBuilder out = new StringBuilder();
        for (int i = 0; i < in.length(); i++) {
            char c = in.charAt(i);
            if (Character.isLetterOrDigit(c)) {
                out.append(c);                 // operand -> output
            } else if (c == '(') {
                ops[++top] = c;                // opener: push
            } else if (c == ')') {
                while (ops[top] != '(')
                    out.append(ops[top--]);    // flush to the matching (
                top--;                          // discard the ( itself
            } else {
                while (top >= 0 && ops[top] != '(' && prec(ops[top]) >= prec(c))
                    out.append(ops[top--]);    // pop same-or-stronger ops
                ops[++top] = c;                // push operator
            }
        }
        while (top >= 0) out.append(ops[top--]); // flush what's left
        return out.toString();
    }

    void run(String label, String expr) {
        System.out.println("-- " + label + " --");
        System.out.println(expr + " -> " + toPostfix(expr));
        System.out.println();
    }

    public static void main(String[] args) {
        InfixToPostfix conv = new InfixToPostfix();

        // normal: 11 characters, a mix of single-letter operands
        conv.run("normal: 11 characters", "A+B*C-D+E*F");

        // hard: parenthesized, mixed-precedence, 18 characters
        conv.run("hard: parenthesized, mixed precedence", "(A+B)*(C-D)/E+F*G");

        // edge: a long chain of same-precedence operators (left-associativity)
        conv.run("edge: same-precedence chain (left-associativity)", "A+B+C+D+E+F+G+H+I+J");
    }
}
