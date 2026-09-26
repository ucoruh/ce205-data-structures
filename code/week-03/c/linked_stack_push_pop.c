/* Week 3 -- Stacks and Queues
 * Linked-list stack: push and pop.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;
Node *top = NULL;          /* empty stack */

typedef struct {
    bool is_pop;
    int value;
} Op;

void push(int x) {
    Node *n = malloc(sizeof(Node));
    n->data = x;
    n->next = top;
    top = n;
}

bool pop(int *out) {
    if (top == NULL) return false;
    Node *tmp = top;
    *out = tmp->data;
    top = top->next;
    free(tmp);
    return true;
}

static void print_stack(void) {
    printf("stack (top to bottom):");
    for (Node *n = top; n != NULL; n = n->next)
        printf(" %d", n->data);
    if (top == NULL)
        printf(" (empty)");
    printf("\n");
}

static void run_scenario(const char *label, const Op ops[], int n) {
    printf("-- %s --\n", label);
    while (top != NULL) { int junk; pop(&junk); }   /* start each scenario empty */
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
            push(ops[i].value);
            printf("push(%d)\n", ops[i].value);
        }
        print_stack();
    }
    printf("\n");
}

int main(void) {
    /* normal: 12 pushes, then 3 pops */
    Op normal[] = {
        {false, 12}, {false, 7}, {false, 25}, {false, 3}, {false, 18},
        {false, 9}, {false, 30}, {false, 14}, {false, 5}, {false, 21},
        {false, 16}, {false, 40}, {true, 0}, {true, 0}, {true, 0}
    };
    run_scenario("normal: 12 pushes, then 3 pops", normal, 15);

    /* hard: pop every node one by one -- even the last one is popped */
    Op hard[] = {
        {false, 4}, {false, 15}, {false, 8}, {false, 23}, {false, 6},
        {false, 31}, {false, 12}, {false, 27}, {false, 9}, {false, 18},
        {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0},
        {true, 0}, {true, 0}, {true, 0}, {true, 0}, {true, 0}
    };
    run_scenario("hard: pop every node one by one (10 pushes, 10 pops)", hard, 20);

    /* edge: pop on an empty stack, then 10 pushes */
    Op edge[] = {
        {true, 0}, {false, 7}, {false, 19}, {false, 3}, {false, 26},
        {false, 14}, {false, 8}, {false, 31}, {false, 22}, {false, 5}, {false, 17}, {true, 0}
    };
    run_scenario("edge: pop on an empty stack, then 10 pushes", edge, 12);

    return 0;
}
