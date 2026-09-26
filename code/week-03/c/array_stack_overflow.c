/* Week 3 -- Stacks and Queues
 * Array-backed stack: overflow and underflow.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>

#define MAX_CAP 10

typedef struct {
    bool is_pop;
    int value;
} Op;

int data[MAX_CAP];
int top = -1;          /* empty stack */
int cap = MAX_CAP;      /* capacity used by the current scenario */

bool push(int x) {
    if (top == cap - 1)  /* full? */
        return false;     /* overflow */
    top = top + 1;
    data[top] = x;
    return true;
}

bool pop(int *out) {
    if (top == -1)        /* empty? */
        return false;      /* underflow */
    *out = data[top];
    top = top - 1;
    return true;
}

static void run_scenario(const char *label, int scenario_cap, const Op ops[], int n) {
    printf("-- %s --\n", label);
    top = -1;
    cap = scenario_cap;
    for (int i = 0; i < n; i++) {
        if (ops[i].is_pop) {
            int out = 0;
            bool ok = pop(&out);
            if (ok)
                printf("pop() -> true, out = %d\n", out);
            else
                printf("pop() -> false  (UNDERFLOW: the stack is empty)\n");
        } else {
            bool ok = push(ops[i].value);
            printf("push(%d) -> %s", ops[i].value, ok ? "true" : "false");
            if (!ok)
                printf("  (OVERFLOW: the stack is full)");
            printf("\n");
        }
    }
    printf("\n");
}

int main(void) {
    /* normal: 11 pushes into a 10-cell stack -- overflow on the last one */
    Op normal[] = {
        {false, 4}, {false, 15}, {false, 8}, {false, 23}, {false, 6},
        {false, 31}, {false, 12}, {false, 27}, {false, 9}, {false, 18}, {false, 40}
    };
    run_scenario("normal: 11 pushes into a 10-cell stack (overflow)", 10, normal, 11);

    /* hard: 10 pushes, then 13 pops -- underflow after draining */
    Op hard[] = {
        {false, 7}, {false, 19}, {false, 3}, {false, 26}, {false, 14},
        {false, 8}, {false, 31}, {false, 22}, {false, 5}, {false, 17},
        {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0},
        {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0}
    };
    run_scenario("hard: 10 pushes, then 13 pops (underflow after draining)", 10, hard, 23);

    /* edge: both failures in one run on a small stack (cap 6) */
    Op edge[] = {
        {false, 3}, {false, 9}, {false, 14}, {false, 2}, {false, 21}, {false, 6},
        {false, 17}, {false, 8}, {false, 25}, {false, 11},
        {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0}
    };
    run_scenario("edge: overflow and underflow in one run (cap 6)", 6, edge, 19);

    return 0;
}
