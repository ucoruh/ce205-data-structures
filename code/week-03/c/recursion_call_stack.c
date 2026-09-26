/* Week 3 -- Stacks and Queues
 * Recursion and the call stack: fact(n), and a real 32-bit int overflow bug.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

int fact(int n) {
    if (n == 0)              /* base case */
        return 1;
    return n * fact(n - 1);
}

static void run(const char *label, int n) {
    int result = fact(n);    /* WARNING: int overflows silently for n >= 13 */
    printf("-- %s --\nfact(%d) = %d\n\n", label, n, result);
}

int main(void) {
    run("normal: call stack 10 deep", 10);
    run("hard: 12 deep, one step from overflow", 12);
    run("edge: int overflow at 13!", 13);
    run("edge: base case, fact(0)", 0);

    return 0;
}
