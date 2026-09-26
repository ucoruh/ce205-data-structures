/* Week 3 -- Stacks and Queues
 * Evaluating a prefix (Polish) expression with a stack, right to left.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

static bool is_number(const char *t) {
    return isdigit((unsigned char) t[0]);
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

int eval_prefix(char *tok[], int n, bool *error) {
    int st[100]; int top = -1;
    for (int i = n - 1; i >= 0; i--) {     /* right to left */
        char *t = tok[i];
        if (is_number(t)) {
            st[++top] = atoi(t);          /* number: push */
        } else {
            if (top < 1) { *error = true; return 0; }  /* too few operands */
            int a = st[top--];             /* left operand */
            int b = st[top--];             /* right operand */
            if (t[0] == '/' && b == 0) { *error = true; return 0; }  /* division by zero */
            st[++top] = apply(t[0], a, b);  /* integer division truncates toward zero */
        }
    }
    if (top != 0) { *error = true; return 0; }  /* too many operands left */
    return st[top];                       /* the answer */
}

static void run(const char *label, char *tok[], int n) {
    bool error = false;
    int result = eval_prefix(tok, n, &error);
    printf("-- %s --\n", label);
    if (error)
        printf("result = ERROR (invalid prefix expression)\n\n");
    else
        printf("result = %d\n\n", result);
}

int main(void) {
    /* normal: 11 tokens, no errors */
    char *normal[] = {"-", "+", "-", "*", "+", "5", "3", "8", "2", "6", "12"};
    run("normal: 11 tokens, no errors", normal, 11);

    /* hard: 14 tokens, all four operators */
    char *hard[] = {"*", "+", "-", "*", "+", "/", "12", "3", "4", "5", "20", "2", "7", "3"};
    run("hard: 14 tokens, all four operators", hard, 14);

    /* edge: too few operands -- an operator is last (processed first) */
    char *edge[] = {"+", "5", "3", "8", "2", "*", "9", "+", "6", "-", "7"};
    run("edge: too few operands (an operator is processed first)", edge, 11);

    return 0;
}
