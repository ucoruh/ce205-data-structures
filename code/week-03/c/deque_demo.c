/* Week 3 -- Stacks and Queues
 * Double-ended queue (deque): push/pop at both front and back.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct DNode { int data; struct DNode *prev, *next; } DNode;
DNode *front = NULL, *rear = NULL;   /* empty deque */

void push_back(int x) {          /* add at rear: O(1) */
    DNode *n = malloc(sizeof(DNode));
    n->data = x; n->next = NULL; n->prev = rear;
    if (rear) rear->next = n; else front = n;
    rear = n;
}

void push_front(int x) {         /* add at front: O(1) */
    DNode *n = malloc(sizeof(DNode));
    n->data = x; n->prev = NULL; n->next = front;
    if (front) front->prev = n; else rear = n;
    front = n;
}

bool pop_back(int *out) {        /* remove at rear: O(1) */
    if (!rear) return false;     /* underflow */
    *out = rear->data;
    DNode *tmp = rear;
    rear = rear->prev;
    if (rear) rear->next = NULL; else front = NULL;
    free(tmp);
    return true;
}

bool pop_front(int *out) {       /* remove at front: O(1) */
    if (!front) return false;    /* underflow */
    *out = front->data;
    DNode *tmp = front;
    front = front->next;
    if (front) front->prev = NULL; else rear = NULL;
    free(tmp);
    return true;
}

/* "10" / "-3" -> push_back; "f5" / "f-3" -> push_front; "pb" -> pop_back; "pf" -> pop_front. */
static void run_token(const char *tok) {
    if (strcmp(tok, "pb") == 0) {
        int out = 0;
        bool ok = pop_back(&out);
        if (ok) printf("pop_back() -> true, out = %d\n", out);
        else printf("pop_back() -> false (deque is empty)\n");
    } else if (strcmp(tok, "pf") == 0) {
        int out = 0;
        bool ok = pop_front(&out);
        if (ok) printf("pop_front() -> true, out = %d\n", out);
        else printf("pop_front() -> false (deque is empty)\n");
    } else if (tok[0] == 'f') {
        int v = atoi(tok + 1);
        push_front(v);
        printf("push_front(%d)\n", v);
    } else {
        int v = atoi(tok);
        push_back(v);
        printf("push_back(%d)\n", v);
    }
}

static void print_state(void) {
    printf("deque (front to back):");
    for (DNode *n = front; n != NULL; n = n->next)
        printf(" %d", n->data);
    if (front == NULL) printf(" (empty)");
    printf("\n");
}

static void run_scenario(const char *label, const char *tokens[], int n) {
    printf("-- %s --\n", label);
    while (front != NULL) { int junk; pop_front(&junk); }  /* start each scenario empty */
    for (int i = 0; i < n; i++)
        run_token(tokens[i]);
    print_state();
    printf("\n");
}

int main(void) {
    /* normal: 10 operations, adding and removing at both ends */
    const char *normal[] = {"10", "20", "f5", "pb", "f-3", "pf", "30", "f8", "pb", "40"};
    run_scenario("normal: 10 operations at both ends", normal, 10);

    /* hard: 14 operations, with negative values, frequent alternation */
    const char *hard[] = {"5", "-8", "f12", "pb", "f-20", "pf", "15", "-3", "f7", "pb", "pf", "f-9", "22", "pb"};
    run_scenario("hard: 14 operations, negative values, frequent alternation", hard, 14);

    /* edge: only the back end -- the deque behaves like a stack */
    const char *edge[] = {"10", "20", "pb", "30", "40", "pb", "50", "60", "pb", "70"};
    run_scenario("edge: only the back end (deque behaves like a stack)", edge, 10);

    return 0;
}
