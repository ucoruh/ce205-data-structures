/* Week 3 -- Stacks and Queues
 * Linked-list queue: enqueue and dequeue.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct QNode {
    int data;
    struct QNode *next;
} QNode;
QNode *front = NULL, *rear = NULL;    /* empty queue */

typedef struct {
    bool is_deq;
    int value;
} Op;

void enqueue(int x) {
    QNode *n = malloc(sizeof(QNode));
    n->data = x; n->next = NULL;
    if (rear == NULL) front = rear = n;   /* first node */
    else { rear->next = n; rear = n; }
}

bool dequeue(int *out) {
    if (front == NULL) return false;    /* underflow */
    QNode *tmp = front;
    *out = tmp->data;
    front = front->next;
    if (front == NULL) rear = NULL;     /* became empty */
    free(tmp);
    return true;
}

static void run_scenario(const char *label, const Op ops[], int n) {
    printf("-- %s --\n", label);
    while (front != NULL) { int junk; dequeue(&junk); }  /* start each scenario empty */
    for (int i = 0; i < n; i++) {
        if (ops[i].is_deq) {
            int out = 0;
            bool ok = dequeue(&out);
            if (ok)
                printf("dequeue() -> true, out = %d\n", out);
            else
                printf("dequeue() -> false (queue is empty)\n");
        } else {
            enqueue(ops[i].value);
            printf("enqueue(%d)\n", ops[i].value);
        }
    }
    printf("\n");
}

int main(void) {
    /* normal: 12 enqueues, 3 dequeues along the way */
    Op normal[] = {
        {false, 15}, {false, 23}, {false, 8}, {false, 42}, {false, 19}, {true, 0},
        {false, 31}, {false, 7}, {false, 56}, {true, 0},
        {false, 12}, {false, 44}, {true, 0}, {false, 9}, {false, 27}
    };
    run_scenario("normal: 12 enqueues, 3 dequeues along the way", normal, 15);

    /* hard: 17 enqueues, 3 dequeues */
    Op hard[] = {
        {false, 5}, {false, 12}, {false, 33}, {false, 8}, {false, 19}, {true, 0},
        {false, 27}, {false, 41}, {false, 3}, {false, 55}, {false, 16}, {true, 0},
        {false, 38}, {false, 9}, {false, 22}, {false, 47}, {false, 14}, {true, 0},
        {false, 6}, {false, 29}
    };
    run_scenario("hard: 17 enqueues, 3 dequeues", hard, 20);

    /* edge: drain to empty -- rear becomes NULL too, then it restarts */
    Op edge[] = {
        {false, 10}, {false, 20}, {false, 30}, {false, 40}, {false, 50},
        {false, 60}, {false, 70}, {false, 80}, {false, 90}, {false, 100},
        {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0},
        {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0},
        {false, 999}
    };
    run_scenario("edge: drain to empty, then restart", edge, 21);

    return 0;
}
