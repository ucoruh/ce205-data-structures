/* Week 3 -- Stacks and Queues
 * Converting an infix expression to postfix (shunting-yard), with parentheses.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <ctype.h>
#include <stdio.h>

static int prec(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    return 0;
}

void to_postfix(const char *in, char *out) {
    char ops[100]; int top = -1, k = 0;
    for (int i = 0; in[i]; i++) {
        char c = in[i];
        if (isalnum(c)) {
            out[k++] = c;                  /* operand -> output */
        } else if (c == '(') {
            ops[++top] = c;                /* opener: push */
        } else if (c == ')') {
            while (ops[top] != '(')
                out[k++] = ops[top--];     /* flush to the matching ( */
            top--;                          /* discard the ( itself */
        } else {
            while (top >= 0 && ops[top] != '(' && prec(ops[top]) >= prec(c))
                out[k++] = ops[top--];     /* pop same-or-stronger ops */
            ops[++top] = c;                /* push operator */
        }
    }
    while (top >= 0) out[k++] = ops[top--]; /* flush what's left */
    out[k] = '\0';
}

static void run(const char *label, const char *expr) {
    char result[128];
    to_postfix(expr, result);
    printf("-- %s --\n%s -> %s\n\n", label, expr, result);
}

int main(void) {
    /* normal: 11 characters, a mix of single-letter operands */
    run("normal: 11 characters", "A+B*C-D+E*F");

    /* hard: parenthesized, mixed-precedence, 18 characters */
    run("hard: parenthesized, mixed precedence", "(A+B)*(C-D)/E+F*G");

    /* edge: a long chain of same-precedence operators (left-associativity) */
    run("edge: same-precedence chain (left-associativity)", "A+B+C+D+E+F+G+H+I+J");

    return 0;
}
