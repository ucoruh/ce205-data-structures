/* Week 3 -- Stacks and Queues
 * Converting an infix expression to prefix: reverse the input (swapping
 * parentheses), run shunting-yard with the strict precedence rule, then
 * reverse the result.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <ctype.h>
#include <stdio.h>
#include <string.h>

static int prec(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    return 0;
}

static char swap_paren(char c) {
    if (c == '(') return ')';
    if (c == ')') return '(';
    return c;
}

static void reverse_and_swap_parens(const char *in, char *rev) {
    int n = (int) strlen(in);
    for (int i = 0; i < n; i++)
        rev[i] = swap_paren(in[n - 1 - i]);
    rev[n] = '\0';
}

static void reverse(const char *tmp, int k, char *out) {
    for (int i = 0; i < k; i++)
        out[i] = tmp[k - 1 - i];
    out[k] = '\0';
}

void to_prefix(const char *in, char *out) {
    char rev[100];
    reverse_and_swap_parens(in, rev);       /* 1) reverse, ( <-> ) */
    char ops[100]; int top = -1, k = 0; char tmp[100];
    for (int i = 0; rev[i]; i++) {          /* 2) shunting-yard, strict rule */
        char c = rev[i];
        if (isalnum(c)) { tmp[k++] = c; continue; }
        if (c == '(') { ops[++top] = c; continue; }
        if (c == ')') {
            while (ops[top] != '(') tmp[k++] = ops[top--];
            top--; continue;
        }
        while (top >= 0 && ops[top] != '(' && prec(ops[top]) > prec(c))
            tmp[k++] = ops[top--];           /* strictly stronger only */
        ops[++top] = c;
    }
    while (top >= 0) tmp[k++] = ops[top--];
    reverse(tmp, k, out);                    /* 3) reverse again */
}

static void run(const char *label, const char *expr) {
    char result[128];
    to_prefix(expr, result);
    printf("-- %s --\n%s -> %s\n\n", label, expr, result);
}

int main(void) {
    /* normal: 11 characters, a mix of single-letter operands */
    run("normal: 11 characters", "A+B*C-D+E*F");

    /* hard: parenthesized, mixed-precedence, 18 characters */
    run("hard: parenthesized, mixed precedence", "(A+B)*(C-D)/E+F*G");

    /* edge: a long chain of same-precedence operators (right-associativity check) */
    run("edge: same-precedence chain (right-associativity check)", "A+B+C+D+E+F+G+H+I+J");

    return 0;
}
