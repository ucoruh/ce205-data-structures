/* Week 3 -- Stacks and Queues
 * Evaluating a prefix (Polish) expression with a stack, right to left.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class PrefixEvaluator {
    static boolean isNumber(String t) {
        return Character.isDigit(t.charAt(0));
    }

    static int apply(char op, int a, int b) {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return a / b;
            default:  return 0;
        }
    }

    int evalPrefix(String[] tok, boolean[] error) {
        int[] st = new int[100]; int top = -1;
        for (int i = tok.length - 1; i >= 0; i--) {  // right to left
            String t = tok[i];
            if (isNumber(t)) {
                st[++top] = Integer.parseInt(t);   // number: push
            } else {
                if (top < 1) { error[0] = true; return 0; }  // too few operands
                int a = st[top--];             // left operand
                int b = st[top--];             // right operand
                if (t.equals("/") && b == 0) { error[0] = true; return 0; }  // division by zero
                st[++top] = apply(t.charAt(0), a, b);  // integer division truncates toward zero
            }
        }
        if (top != 0) { error[0] = true; return 0; }  // too many operands left
        return st[top];                       // the answer
    }

    void run(String label, String[] tok) {
        boolean[] error = {false};
        int result = evalPrefix(tok, error);
        System.out.println("-- " + label + " --");
        if (error[0])
            System.out.println("result = ERROR (invalid prefix expression)");
        else
            System.out.println("result = " + result);
        System.out.println();
    }

    public static void main(String[] args) {
        PrefixEvaluator ev = new PrefixEvaluator();

        // normal: 11 tokens, no errors
        String[] normal = {"-", "+", "-", "*", "+", "5", "3", "8", "2", "6", "12"};
        ev.run("normal: 11 tokens, no errors", normal);

        // hard: 14 tokens, all four operators
        String[] hard = {"*", "+", "-", "*", "+", "/", "12", "3", "4", "5", "20", "2", "7", "3"};
        ev.run("hard: 14 tokens, all four operators", hard);

        // edge: too few operands -- an operator is last (processed first)
        String[] edge = {"+", "5", "3", "8", "2", "*", "9", "+", "6", "-", "7"};
        ev.run("edge: too few operands (an operator is processed first)", edge);
    }
}
