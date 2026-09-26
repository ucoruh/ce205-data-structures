/* Week 3 -- Stacks and Queues
 * Array-backed stack: push and pop.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>

#define MAX_CAP 12

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

static void print_stack(void) {
    printf("stack (bottom to top):");
    for (int i = 0; i <= top; i++)
        printf(" %d", data[i]);
    if (top == -1)
        printf(" (empty)");
    printf("  [top = %d]\n", top);
}

static void run_scenario(const char *label, int scenario_cap, const Op ops[], int n) {
    printf("-- %s --\n", label);
    top = -1;
    cap = scenario_cap;
    print_stack();
    for (int i = 0; i < n; i++) {
        if (ops[i].is_pop) {
            int out = 0;
            bool ok = pop(&out);
            if (ok)
                printf("pop() -> true, out = %d\n", out);
            else
                printf("pop() -> false (stack is empty)\n");
        } else {
            bool ok = push(ops[i].value);
            printf("push(%d) -> %s\n", ops[i].value, ok ? "true" : "false");
        }
        print_stack();
    }
    printf("\n");
}

int main(void) {
    /* normal: 10 pushes, then 4 pops */
    Op normal[] = {
        {false, 12}, {false, 7}, {false, 25}, {false, 3}, {false, 18},
        {false, 9}, {false, 30}, {false, 14}, {false, 5}, {false, 21},
        {true, 0}, {true, 0}, {true, 0}, {true, 0}
    };
    run_scenario("normal: 10 pushes, then 4 pops (cap 12)", 12, normal, 14);

    /* hard: 18 mixed operations */
    Op hard[] = {
        {false, 40}, {false, 11}, {true, 0}, {false, 27}, {false, 8},
        {false, 33}, {true, 0}, {true, 0}, {false, 16}, {false, 2},
        {false, 45}, {false, 19}, {true, 0}, {false, 7}, {false, 38},
        {false, 23}, {false, 10}, {true, 0}
    };
    run_scenario("hard: 18 mixed operations (cap 12)", 12, hard, 18);

    /* edge: overflow -- 11 pushes into a 10-cell stack */
    Op edge[] = {
        {false, 4}, {false, 15}, {false, 8}, {false, 16}, {false, 23},
        {false, 42}, {false, 11}, {false, 6}, {false, 29}, {false, 37},
        {false, 50}, {true, 0}
    };
    run_scenario("edge: overflow, 11 pushes into a 10-cell stack (cap 10)", 10, edge, 12);

    return 0;
}
