/* Week 3 -- Stacks and Queues
 * Recursion and the call stack: fact(n), and a real 32-bit int overflow bug.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>

int fact(int n) {
    if (n == 0)              /* base case */
        return 1;
    /* Plain `n * fact(n - 1)` signed-overflows for n >= 13 -- undefined behavior in C, not just a
     * wrong answer. Multiplying as `unsigned` gives the identical wraparound bit pattern with
     * well-defined semantics, so the lesson (a silent wrong answer, no crash, no warning) still
     * shows up exactly as described below, without triggering a sanitizer abort. */
    return (int) ((unsigned) n * (unsigned) fact(n - 1));
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
