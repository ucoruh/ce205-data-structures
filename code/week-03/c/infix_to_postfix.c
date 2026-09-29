/* Week 3 -- Stacks and Queues
 * Converting an infix expression to postfix (shunting-yard), with parentheses.
 * CEN207 Data Structures (formerly CE205)
 */
#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>

static int prec(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    return 0;
}

/* Returns false (leaving *out unspecified) when the input has unbalanced parentheses:
 * an extra ')' with no '(' left to match, or a '(' that is never closed. */
bool to_postfix(const char *in, char *out) {
    char ops[100]; int top = -1, k = 0;
    for (int i = 0; in[i]; i++) {
        char c = in[i];
        if (isalnum(c)) {
            out[k++] = c;                  /* operand -> output */
        } else if (c == '(') {
            ops[++top] = c;                /* opener: push */
        } else if (c == ')') {
            while (top >= 0 && ops[top] != '(')
                out[k++] = ops[top--];     /* flush to the matching ( */
            if (top < 0) return false;     /* unbalanced: nothing left to match this ) */
            top--;                          /* discard the ( itself */
        } else {
            while (top >= 0 && ops[top] != '(' && prec(ops[top]) >= prec(c))
                out[k++] = ops[top--];     /* pop same-or-stronger ops */
            ops[++top] = c;                /* push operator */
        }
    }
    while (top >= 0) {
        if (ops[top] == '(') return false;  /* unbalanced: this ( was never closed */
        out[k++] = ops[top--];              /* flush what's left */
    }
    out[k] = '\0';
    return true;
}

static void run(const char *label, const char *expr) {
    char result[128];
    bool ok = to_postfix(expr, result);
    printf("-- %s --\n%s -> %s\n\n", label, expr, ok ? result : "ERROR (unbalanced parentheses)");
}

int main(void) {
    /* normal: 11 characters, a mix of single-letter operands */
    run("normal: 11 characters", "A+B*C-D+E*F");

    /* hard: parenthesized, mixed-precedence, 18 characters */
    run("hard: parenthesized, mixed precedence", "(A+B)*(C-D)/E+F*G");

    /* edge: a long chain of same-precedence operators (left-associativity) */
    run("edge: same-precedence chain (left-associativity)", "A+B+C+D+E+F+G+H+I+J");

    /* abnormal: a closing parenthesis is missing -- the ( after C-( is never closed */
    run("abnormal: unbalanced, a closing parenthesis is missing", "A+(B*C-(D+E)*F");

    /* abnormal: an extra closing parenthesis -- no ( was ever pushed to match it */
    run("abnormal: unbalanced, an extra closing parenthesis", "A+B*C)-D+E*F");

    return 0;
}
