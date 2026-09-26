/* Week 3 -- Stacks and Queues
 * Recursion: countdown, with a corrected base case (n <= 0).
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

void countdown(int n) {
    if (n <= 0) {                /* base case: fixed, was `n == 0` */
        printf("Liftoff!\n");
        return;
    }
    printf("%d\n", n);
    countdown(n - 1);            /* recursive case */
}

static void run(const char *label, int n) {
    printf("-- %s --\n", label);
    countdown(n);
    printf("\n");
}

int main(void) {
    run("normal: countdown from 10", 10);
    run("hard: countdown from 15, a deeper call stack", 15);
    run("edge: n = 0, straight to the base case", 0);
    run("edge: n = -4, negative input still stops in one call", -4);

    return 0;
}
