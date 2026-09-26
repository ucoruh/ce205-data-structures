/* Week 3 -- Stacks and Queues
 * Evaluating a postfix expression with a stack (with error handling).
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

int eval_postfix(char *tok[], int n, bool *error) {
    int st[100]; int top = -1;
    for (int i = 0; i < n; i++) {
        char *t = tok[i];
        if (is_number(t)) {
            st[++top] = atoi(t);          /* number: push */
        } else {
            if (top < 1) { *error = true; return 0; }  /* too few operands */
            int b = st[top--];             /* right operand */
            int a = st[top--];             /* left operand */
            if (t[0] == '/' && b == 0) { *error = true; return 0; }  /* division by zero */
            st[++top] = apply(t[0], a, b);  /* integer division truncates toward zero */
        }
    }
    if (top != 0) { *error = true; return 0; }  /* too many operands left */
    return st[top];                       /* the answer */
}

static void run(const char *label, char *tok[], int n) {
    bool error = false;
    int result = eval_postfix(tok, n, &error);
    printf("-- %s --\n", label);
    if (error)
        printf("result = ERROR (invalid postfix expression)\n\n");
    else
        printf("result = %d\n\n", result);
}

int main(void) {
    /* normal: 11 tokens, no errors */
    char *normal[] = {"5", "3", "+", "8", "2", "-", "*", "6", "+", "12", "-"};
    run("normal: 11 tokens, no errors", normal, 11);

    /* hard: 15 tokens, all four operators */
    char *hard[] = {"12", "3", "/", "4", "*", "5", "+", "20", "-", "2", "*", "7", "+", "3", "*"};
    run("hard: 15 tokens, all four operators", hard, 15);

    /* edge: division by zero */
    char *edge[] = {"9", "3", "-", "6", "*", "0", "/", "5", "+", "8", "-", "2", "*"};
    run("edge: division by zero", edge, 13);

    return 0;
}
