/* Week 2 -- Linked Lists, Arrays and Matrices
 * XOR linked list: one field, npx, holds XOR(prev, next) instead of two
 * separate pointers. Matches the xor-linked-list.js animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    uintptr_t npx;      /* XOR of the addresses of prev and next */
} Node;

static uintptr_t addr(Node *p) { return (uintptr_t)p; }
static Node *xor_node(uintptr_t npx, Node *known) { return (Node *)(npx ^ addr(known)); }

Node *insert_head(Node *head, Node **tail, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    n->npx = addr(NULL) ^ addr(head);     /* prev = NULL, next = old head */
    if (head != NULL)
        head->npx = addr(n) ^ addr(xor_node(head->npx, NULL));  /* old head's prev becomes n */
    else
        *tail = n;                        /* first node is both head and tail */
    return n;
}

Node *insert_tail(Node **head, Node *tail, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    n->npx = addr(tail) ^ addr(NULL);     /* prev = old tail, next = NULL */
    if (tail != NULL)
        tail->npx = addr(xor_node(tail->npx, NULL)) ^ addr(n);  /* old tail's next becomes n */
    else
        *head = n;                        /* first node is both head and tail */
    return n;
}

void traverse_forward(Node *head) {
    Node *prev = NULL, *cur = head;
    while (cur != NULL) {
        printf(" %d", cur->data);
        Node *next = xor_node(cur->npx, prev);
        prev = cur; cur = next;
    }
}

void traverse_backward(Node *tail) {
    Node *next = NULL, *cur = tail;
    while (cur != NULL) {
        printf(" %d", cur->data);
        Node *prev = xor_node(cur->npx, next);
        next = cur; cur = prev;
    }
}

static void free_all(Node **pool, int count) {
    for (int i = 0; i < count; i++) free(pool[i]);
}

/* tokens: a plain number is insert_head(value); "tV" is insert_tail(value) */
static void run_scenario(const char *label, const char *ops[], int n) {
    printf("-- %s --\n", label);
    Node *head = NULL, *tail = NULL;
    Node *pool[32];
    int count = 0;
    for (int i = 0; i < n; i++) {
        const char *op = ops[i];
        if (op[0] == 't') {
            int v = atoi(op + 1);
            Node *node = insert_tail(&head, tail, v);
            tail = node;
            pool[count++] = node;
            printf("insert_tail(%d)\n", v);
        } else {
            int v = atoi(op);
            Node *node = insert_head(head, &tail, v);
            head = node;
            pool[count++] = node;
            printf("insert_head(%d)\n", v);
        }
    }
    printf("forward: ");
    traverse_forward(head);
    printf("\n");
    printf("backward:");
    traverse_backward(tail);
    printf("\n\n");
    free_all(pool, count);
}

int main(void) {
    /* normal: 10 nodes, inserted one by one with insert_head */
    const char *normal[] = {"100", "90", "80", "70", "60", "50", "40", "30", "20", "10"};
    run_scenario("normal: 10 nodes, inserted one by one with insert_head", normal, 10);

    /* hard: 12 nodes (duplicates/negatives) */
    const char *hard[] = {"-100", "100", "-3", "2", "-1", "8", "8", "-3", "0", "5", "-3", "5"};
    run_scenario("hard: 12 nodes (duplicates/negatives)", hard, 12);

    /* edge: 10 nodes, inserted one by one with insert_tail (FIFO order) */
    const char *tail_basic[] = {"t10", "t20", "t30", "t40", "t50", "t60", "t70", "t80", "t90", "t100"};
    run_scenario("edge: 10 nodes, inserted one by one with insert_tail (FIFO order)", tail_basic, 10);

    /* edge: 12 nodes, mixing insert_head and insert_tail */
    const char *mixed[] = {"10", "t20", "30", "t40", "50", "t60", "70", "t80", "90", "t100", "110", "t120"};
    run_scenario("edge: 12 nodes, mixing insert_head and insert_tail", mixed, 12);

    return 0;
}
