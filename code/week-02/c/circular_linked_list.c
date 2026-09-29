/* Week 2 -- Linked Lists, Arrays and Matrices
 * Circular linked list: insert at the tail (no separate head pointer --
 * tail->next IS the head), delete by value, and a traversal that wraps
 * around. Matches the circular-linked-list.js animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

static int list_size(Node *tail) {
    if (tail == NULL) return 0;
    int n = 1;
    for (Node *cur = tail->next; cur != tail; cur = cur->next) n++;
    return n;
}

/* 'tail' always points at the last-inserted node; tail->next is the head. */
Node *insert_tail(Node *tail, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    if (tail == NULL) {
        n->next = n;            /* a single node points at itself */
        return n;
    }
    n->next = tail->next;       /* new node -> old head */
    tail->next = n;             /* old tail -> new node */
    return n;                   /* new node is the new tail */
}

/* Deletes the FIRST node holding value, scanning forward from the head (no prev link to walk backward).
   Returns the (possibly updated) tail via the return value; *found reports success. */
Node *delete_value(Node *tail, int value, bool *found) {
    *found = false;
    if (tail == NULL) return NULL;               /* empty list */
    Node *prev = tail, *cur = tail->next;         /* cur starts at the head */
    int n = list_size(tail);
    for (int i = 0; i < n; i++) {
        if (cur->data == value) {
            *found = true;
            if (cur == cur->next) {               /* the only node in the list */
                free(cur);
                return NULL;                       /* list becomes empty */
            }
            prev->next = cur->next;                /* unlink cur */
            Node *new_tail = (cur == tail) ? prev : tail;
            free(cur);
            return new_tail;
        }
        prev = cur;
        cur = cur->next;
    }
    return tail;                                   /* not found: unchanged */
}

void traverse(Node *tail, int laps) {
    Node *head = tail->next;
    Node *cur = head;
    int steps = list_size(tail) * laps;
    for (int i = 0; i < steps; i++) {
        printf(" %d", cur->data);
        cur = cur->next;
    }
}

static void free_circle(Node *tail) {
    if (tail == NULL) return;
    Node *cur = tail->next;
    while (cur != tail) {
        Node *tmp = cur;
        cur = cur->next;
        free(tmp);
    }
    free(tail);
}

/* tokens: a plain number is insert_tail(value); "dV" deletes value V */
static void run_scenario(const char *label, const char *ops[], int n, int laps) {
    printf("-- %s --\n", label);
    Node *tail = NULL;
    for (int i = 0; i < n; i++) {
        const char *op = ops[i];
        if (op[0] == 'd') {
            int v = atoi(op + 1);
            bool found;
            tail = delete_value(tail, v, &found);
            printf("delete_value(%d): %s\n", v, found ? "removed" : "not found");
        } else {
            int v = atoi(op);
            tail = insert_tail(tail, v);
            printf("insert_tail(%d)\n", v);
        }
    }
    printf("size = %d\n", list_size(tail));
    if (tail != NULL) {
        printf("traverse(%d laps):", laps);
        traverse(tail, laps);
        printf("\n");
    } else {
        printf("traverse(%d laps): (empty)\n", laps);
    }
    printf("\n");
    free_circle(tail);
}

int main(void) {
    /* normal: 10 inserts, delete one value from the middle, 2 laps */
    const char *normal[] = {"10", "20", "30", "40", "50", "d30", "60", "70", "80", "90", "100"};
    run_scenario("normal: 10 inserts, delete one value from the middle, 2 laps", normal, 11, 2);

    /* hard: 12 inserts (duplicates), 2 deletes (one not found), 3 laps */
    const char *hard[] = {"5", "5", "20", "30", "d5", "5", "40", "50", "5", "60", "70", "d12345", "80", "5"};
    run_scenario("hard: 12 inserts (duplicates), 2 deletes (one not found), 3 laps", hard, 14, 3);

    /* edge: a single node: deleting it empties the list */
    const char *one_node[] = {"42", "d42"};
    run_scenario("edge: a single node: deleting it empties the list", one_node, 2, 5);

    /* edge: the first-inserted (head) node is deleted: tail->next changes */
    const char *delete_head[] = {"11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "d11"};
    run_scenario("edge: the first-inserted (head) node is deleted: tail->next changes", delete_head, 11, 2);

    /* edge: 10 inserts, an attempt to delete a value that is not in the list */
    const char *not_found[] = {"3", "6", "9", "12", "15", "18", "21", "24", "27", "30", "d999"};
    run_scenario("edge: 10 inserts, an attempt to delete a value that is not in the list", not_found, 11, 2);

    return 0;
}
