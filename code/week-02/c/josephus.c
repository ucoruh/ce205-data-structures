/* Week 2 -- Linked Lists, Arrays and Matrices
 * The Josephus problem: n people in a circle, every k-th one eliminated,
 * who survives? Solved with a circular linked list. Matches the josephus.js
 * animation.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int id; struct Node *next; } Node;

static Node *build_circle(int n) {
    Node *head = NULL, *tail = NULL;
    for (int i = 1; i <= n; i++) {
        Node *node = malloc(sizeof(Node));
        node->id = i;
        node->next = NULL;
        if (tail == NULL) head = node; else tail->next = node;
        tail = node;
    }
    tail->next = head;   /* close the circle */
    return head;
}

int josephus(int n, int k) {
    Node *head = build_circle(n);
    Node *prev = head;
    while (prev->next != head)   /* find the node before head */
        prev = prev->next;

    Node *cur = head;
    int remaining = n;
    while (remaining > 1) {
        for (int step = 1; step < k; step++) {   /* count k-1 steps forward */
            prev = cur;
            cur = cur->next;
        }
        printf("eliminate %d\n", cur->id);
        prev->next = cur->next;   /* remove cur from the circle */
        free(cur);
        cur = prev->next;
        remaining--;
    }
    int survivor = cur->id;
    free(cur);
    return survivor;                /* the sole survivor */
}

static void run_scenario(const char *label, int n, int k) {
    printf("-- %s --\n", label);
    printf("n=%d k=%d\n", n, k);
    int survivor = josephus(n, k);
    printf("survivor = %d\n\n", survivor);
}

int main(void) {
    /* normal: n = 10, k = 3 */
    run_scenario("normal: n = 10, k = 3", 10, 3);

    /* hard: n = 12, k = 5 */
    run_scenario("hard: n = 12, k = 5", 12, 5);

    /* edge: n = 10, k = 1: eliminate in plain order */
    run_scenario("edge: n = 10, k = 1: eliminate in plain order", 10, 1);

    /* edge: n = 1: nobody to eliminate */
    run_scenario("edge: n = 1: nobody to eliminate", 1, 3);

    return 0;
}
