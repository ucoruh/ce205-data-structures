/* Week 3 -- Stacks and Queues
 * Checking brackets with a stack.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>

static bool matches(char open, char close) {
    return (open == '(' && close == ')') ||
           (open == '[' && close == ']') ||
           (open == '{' && close == '}');
}

bool balanced(const char *s) {
    char st[100]; int top = -1;
    for (int i = 0; s[i] != '\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            st[++top] = c;                /* opener: push */
        } else if (c == ')' || c == ']' || c == '}') {
            if (top == -1) return false;  /* nothing to match */
            char o = st[top--];           /* pop */
            if (!matches(o, c)) return false;
        }
    }
    return top == -1;                     /* all closed? */
}

int main(void) {
    /* normal: balanced, mixed characters (13 characters) */
    printf("-- normal: balanced, mixed characters --\n");
    printf("balanced(\"a(b[c]d)e{f}g\") -> %s\n", balanced("a(b[c]d)e{f}g") ? "true" : "false");

    /* hard: balanced, three groups, all three bracket kinds nested (29 characters) */
    printf("\n-- hard: balanced, three groups, all three bracket kinds nested --\n");
    printf("balanced(\"(a[b]{c})+(d[e]{f})*(g[h]{i})\") -> %s\n",
           balanced("(a[b]{c})+(d[e]{f})*(g[h]{i})") ? "true" : "false");

    /* edge: mismatch -- ( does not match ] (15 characters) */
    printf("\n-- edge: mismatch, ( does not match ] --\n");
    printf("balanced(\"start(a[b)c]end\") -> %s\n", balanced("start(a[b)c]end") ? "true" : "false");

    return 0;
}
