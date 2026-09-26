/* Week 3 -- Stacks and Queues
 * Checking brackets with a stack.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
public class BracketChecker {
    static boolean matches(char open, char close) {
        return (open == '(' && close == ')') ||
               (open == '[' && close == ']') ||
               (open == '{' && close == '}');
    }

    boolean balanced(String s) {
        char[] st = new char[100]; int top = -1;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(' || c == '[' || c == '{') {
                st[++top] = c;                // opener: push
            } else if (c == ')' || c == ']' || c == '}') {
                if (top == -1) return false;  // nothing to match
                char o = st[top--];           // pop
                if (!matches(o, c)) return false;
            }
        }
        return top == -1;                     // all closed?
    }

    public static void main(String[] args) {
        BracketChecker checker = new BracketChecker();

        // normal: balanced, mixed characters (13 characters)
        System.out.println("-- normal: balanced, mixed characters --");
        System.out.println("balanced(\"a(b[c]d)e{f}g\") -> " + checker.balanced("a(b[c]d)e{f}g"));

        // hard: balanced, three groups, all three bracket kinds nested (29 characters)
        System.out.println();
        System.out.println("-- hard: balanced, three groups, all three bracket kinds nested --");
        System.out.println("balanced(\"(a[b]{c})+(d[e]{f})*(g[h]{i})\") -> "
                + checker.balanced("(a[b]{c})+(d[e]{f})*(g[h]{i})"));

        // edge: mismatch -- ( does not match ] (15 characters)
        System.out.println();
        System.out.println("-- edge: mismatch, ( does not match ] --");
        System.out.println("balanced(\"start(a[b)c]end\") -> " + checker.balanced("start(a[b)c]end"));
    }
}
