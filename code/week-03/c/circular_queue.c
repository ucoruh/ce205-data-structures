/* Week 3 -- Stacks and Queues
 * Circular queue: index arithmetic wraps with (i + 1) % cap.
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
int front = 0, rear = -1, count = 0;
int cap = MAX_CAP;          /* capacity used by the current scenario */

bool enqueue(int x) {
    if (count == cap)          /* full? */
        return false;          /* overflow */
    rear = (rear + 1) % cap;   /* wrap around */
    q[rear] = x;
    count++;
    return true;
}

bool dequeue(int *out) {
    if (count == 0)            /* empty? */
        return false;          /* underflow */
    *out = q[front];
    front = (front + 1) % cap;
    count--;
    return true;
}

static void print_state(void) {
    printf("front = %d, rear = %d, count = %d\n", front, rear, count);
}

static void run_scenario(const char *label, int scenario_cap, const Op ops[], int n) {
    printf("-- %s --\n", label);
    front = 0; rear = -1; count = 0; cap = scenario_cap;
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
    /* normal: moderate mixing in 10 cells, one wrap-around */
    Op normal[] = {
        {false, 4}, {false, 15}, {false, 8}, {false, 23}, {false, 6}, {false, 31},
        {true, 0}, {true, 0}, {true, 0},
        {false, 12}, {false, 27}, {false, 9}, {false, 18}, {false, 33}
    };
    run_scenario("normal: moderate mixing in 10 cells, one wrap-around (cap 10)", 10, normal, 14);

    /* hard: long mixing in 9 cells, several wrap-arounds */
    Op hard[] = {
        {false, 7}, {false, 19}, {false, 3}, {false, 26}, {true, 0}, {true, 0},
        {false, 11}, {false, 34}, {false, 8}, {false, 22}, {true, 0}, {true, 0}, {true, 0},
        {false, 15}, {false, 29}, {false, 6}, {false, 17}, {true, 0}, {true, 0}, {true, 0}, {true, 0},
        {false, 21}, {false, 9}, {false, 32}
    };
    run_scenario("hard: long mixing in 9 cells, several wrap-arounds (cap 9)", 9, hard, 24);

    /* edge: completely full, a real overflow */
    Op edge[] = {
        {false, 5}, {false, 13}, {false, 8}, {false, 21}, {false, 34},
        {false, 2}, {false, 17}, {false, 29}, {false, 41}, {false, 50}
    };
    run_scenario("edge: completely full, a real overflow (cap 8)", 8, edge, 10);

    return 0;
}
