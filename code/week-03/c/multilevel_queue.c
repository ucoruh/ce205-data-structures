/* Week 3 -- Stacks and Queues
 * Multilevel queue scheduling: three priority classes, each its own FIFO queue.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>

#define QCAP 20
#define LEVELS 3

typedef struct {
    char name[8];
    int level;
} Process;

typedef struct {
    Process items[QCAP];
    int front, rear, count;
} Queue;

Queue q[LEVELS];  /* 0 = system, 1 = interactive, 2 = batch */

static void queue_reset(Queue *que) {
    que->front = 0; que->rear = -1; que->count = 0;
}

static void enqueue(Queue *que, Process p) {
    que->rear = (que->rear + 1) % QCAP;
    que->items[que->rear] = p;
    que->count++;
}

static Process dequeue(Queue *que) {
    Process p = que->items[que->front];
    que->front = (que->front + 1) % QCAP;
    que->count--;
    return p;
}

static int is_empty(const Queue *que) {
    return que->count == 0;
}

void admit(Process p) {
    enqueue(&q[p.level], p);         /* each class has its own queue */
}

int pick_next(Process *out) {
    for (int lvl = 0; lvl < LEVELS; lvl++)  /* highest priority first */
        if (!is_empty(&q[lvl])) {
            *out = dequeue(&q[lvl]);
            return 1;
        }
    return 0;                                /* all queues are empty */
}

static const char *level_name(int lvl) {
    return lvl == 0 ? "system" : lvl == 1 ? "interactive" : "batch";
}

static void run_scenario(const char *label, Process arrivals[], int n) {
    printf("-- %s --\n", label);
    for (int lvl = 0; lvl < LEVELS; lvl++) queue_reset(&q[lvl]);

    for (int i = 0; i < n; i++) {
        admit(arrivals[i]);
        printf("admit(%s, %s)\n", arrivals[i].name, level_name(arrivals[i].level));
    }

    printf("service order:");
    Process p;
    while (pick_next(&p))
        printf(" %s", p.name);
    printf("\n\n");
}

int main(void) {
    /* normal: 12 processes, evenly spread across three classes */
    Process normal[] = {
        {"P1", 1}, {"P2", 2}, {"P3", 0}, {"P4", 1},
        {"P5", 0}, {"P6", 2}, {"P7", 0}, {"P8", 1},
        {"P9", 2}, {"P10", 0}, {"P11", 1}, {"P12", 2}
    };
    run_scenario("normal: 12 processes, evenly spread across three classes", normal, 12);

    /* hard: 16 processes, back-to-back bursts within each class */
    Process hard[] = {
        {"P1", 1}, {"P2", 1}, {"P3", 1}, {"P4", 1},
        {"P5", 0}, {"P6", 0}, {"P7", 0}, {"P8", 0},
        {"P9", 2}, {"P10", 2}, {"P11", 2}, {"P12", 2},
        {"P13", 1}, {"P14", 1}, {"P15", 1}, {"P16", 1}
    };
    run_scenario("hard: 16 processes, back-to-back bursts within each class", hard, 16);

    /* edge: starvation risk -- 1 early batch process among 9 system+interactive ones */
    Process edge[] = {
        {"P1", 0}, {"P2", 2}, {"P3", 1}, {"P4", 0},
        {"P5", 1}, {"P6", 0}, {"P7", 1}, {"P8", 0},
        {"P9", 1}, {"P10", 0}
    };
    run_scenario("edge: starvation risk, 1 early batch process among 9 others", edge, 10);

    return 0;
}
