/* Unit tests for week-03 java/BracketChecker.java */
public class BracketCheckerTest {
    static int checks = 0, failures = 0;
    static void check(boolean cond, String label) {
        checks++;
        if (!cond) { failures++; System.out.println("FAIL: " + label); }
    }

    public static void main(String[] args) {
        BracketChecker c = new BracketChecker();

        check(c.balanced(""), "empty vacuously balanced");
        check(c.balanced("x"), "single non-bracket char");
        check(c.balanced("hello world"), "plain text");

        check(!c.balanced("("), "lone opener");
        check(!c.balanced(")"), "lone closer, no crash");

        check(c.balanced("()"), "matched ()");
        check(c.balanced("[]"), "matched []");
        check(c.balanced("{}"), "matched {}");
        check(c.balanced("()[]{}"), "all three kinds");

        check(c.balanced("([{}])"), "properly nested");
        check(c.balanced("((((()))))"), "ten deep");

        check(c.balanced("a(b[c]d)e{f}g"), "normal example");
        check(c.balanced("(a[b]{c})+(d[e]{f})*(g[h]{i})"), "hard example");

        check(!c.balanced("(]"), "wrong closer type");
        check(!c.balanced("start(a[b)c]end"), "program's own edge example");
        check(!c.balanced("([)]"), "interleaved brackets");

        check(!c.balanced("()) "), "extra closer");
        check(!c.balanced("a)b"), "extra closer amid text");

        check(!c.balanced("(a"), "unclosed opener");
        check(!c.balanced("a(b[c]d"), "unclosed opener amid text");

        check(BracketChecker.matches('(', ')'), "matches ()");
        check(BracketChecker.matches('[', ']'), "matches []");
        check(BracketChecker.matches('{', '}'), "matches {}");
        check(!BracketChecker.matches('(', ']'), "mismatch");
        check(!BracketChecker.matches('{', ')'), "mismatch 2");

        System.out.println(checks + " checks, " + failures + " failures");
        System.exit(failures == 0 ? 0 : 1);
    }
}
