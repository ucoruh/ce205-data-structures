/* Week 3 -- Stacks and Queues
 * Queue in a plain array and the drift problem.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>

#define MAX_CAP 12

typedef struct {
    bool is_deq;
    int value;
} Op;

int q[MAX_CAP];
int front = 0, rear = -1;
int cap = MAX_CAP;         /* capacity used by the current scenario */

bool enqueue(int x) {
    if (rear == cap - 1) return false;   /* "full"? */
    q[++rear] = x;
    return true;
}

bool dequeue(int *out) {
    if (front > rear) return false;      /* empty */
    *out = q[front++];
    return true;
}

static void print_state(void) {
    printf("front = %d, rear = %d\n", front, rear);
}

static void run_scenario(const char *label, int scenario_cap, const Op ops[], int n) {
    printf("-- %s --\n", label);
    front = 0; rear = -1; cap = scenario_cap;
    for (int i = 0; i < n; i++) {
        if (ops[i].is_deq) {
            int out = 0;
            bool ok = dequeue(&out);
            if (ok)
                printf("dequeue() -> %d\n", out);
            else
                printf("dequeue() -> false (queue is empty)\n");
        } else {
            bool ok = enqueue(ops[i].value);
            printf("enqueue(%d) -> %s\n", ops[i].value, ok ? "true" : "false");
        }
    }
    print_state();
    printf("\n");
}

int main(void) {
    /* normal: fill 8 cells, remove 3, it still overflows (cap 8) */
    Op normal[] = {
        {false, 5}, {false, 12}, {false, 7}, {false, 19}, {false, 3},
        {false, 27}, {false, 14}, {false, 8}, {true, 0}, {true, 0}, {true, 0},
        {false, 99}, {false, 42}
    };
    run_scenario("normal: fill 8 cells, remove 3, it still overflows (cap 8)", 8, normal, 13);

    /* hard: 15 mixed operations, drift builds up gradually (cap 6) */
    Op hard[] = {
        {false, 3}, {false, 8}, {false, 12}, {true, 0}, {false, 15}, {true, 0},
        {false, 22}, {false, 6}, {true, 0}, {false, 31}, {true, 0}, {true, 0},
        {false, 99}, {false, 44}, {false, 77}
    };
    run_scenario("hard: 15 mixed operations, drift builds up gradually (cap 6)", 6, hard, 15);

    /* edge: dequeue on an empty queue, then 10 enqueues (cap 12) */
    Op edge[] = {
        {true, 0}, {true, 0}, {false, 5}, {false, 11}, {false, 3}, {false, 18},
        {false, 9}, {false, 24}, {false, 7}, {false, 15}, {false, 2}, {false, 30},
        {true, 0}, {true, 0}
    };
    run_scenario("edge: dequeue on an empty queue, then 10 enqueues (cap 12)", 12, edge, 14);

    return 0;
}
