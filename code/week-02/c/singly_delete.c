/* Week 2 -- Linked Lists, Arrays and Matrices
 * Singly linked list: delete by value (head, a middle node, the tail, a
 * value not present, and deleting from an empty list). Matches the
 * singly-delete.js animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node *delete_value(Node *head, int value, bool *removed) {
    *removed = false;
    if (head == NULL)
        return NULL;

    if (head->data == value) {         /* removing the head itself */
        Node *tmp = head;
        head = head->next;
        free(tmp);
        *removed = true;
        return head;
    }

    Node *prev = head;
    Node *cur = head->next;
    while (cur != NULL) {
        if (cur->data == value) {
            prev->next = cur->next;    /* skip over cur: the bypass arrow */
            free(cur);
            *removed = true;
            return head;
        }
        prev = cur;
        cur = cur->next;
    }
    return head;                       /* value not found */
}

static Node *insert_tail(Node *head, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    n->next = NULL;
    if (head == NULL)
        return n;
    Node *cur = head;
    while (cur->next != NULL)
        cur = cur->next;
    cur->next = n;
    return head;
}

static void print_list(Node *head) {
    printf("list:");
    for (Node *cur = head; cur != NULL; cur = cur->next)
        printf(" %d", cur->data);
    printf("\n");
}

static void free_list(Node *head) {
    while (head != NULL) {
        Node *tmp = head;
        head = head->next;
        free(tmp);
    }
}

/* tokens: a plain number inserts it at the tail while building the list; "dV" deletes value V */
static Node *run_scenario(const char *label, const char *ops[], int n) {
    printf("-- %s --\n", label);
    Node *head = NULL;
    int removed_count = 0, not_found_count = 0;
    for (int i = 0; i < n; i++) {
        const char *op = ops[i];
        if (op[0] == 'd') {
            int v = atoi(op + 1);
            bool removed;
            head = delete_value(head, v, &removed);
            if (removed) { removed_count++; printf("delete_value(%d): removed\n", v); }
            else { not_found_count++; printf("delete_value(%d): not found\n", v); }
        } else {
            int v = atoi(op);
            head = insert_tail(head, v);
            printf("insert_tail(%d)\n", v);
        }
        print_list(head);
    }
    printf("removed=%d, not_found=%d\n\n", removed_count, not_found_count);
    return head;
}

int main(void) {
    /* normal: 10 nodes, delete the head, then delete a middle node */
    const char *normal[] = {"10", "20", "30", "40", "50", "60", "70", "80", "90", "100", "d10", "d60"};
    Node *l1 = run_scenario("normal: 10 nodes, delete the head, then delete a middle node", normal, 12);

    /* hard: 12 nodes with duplicate 5s: the head copy goes first, then a middle copy */
    const char *hard[] = {"5", "5", "20", "30", "5", "40", "50", "5", "60", "70", "80", "5", "d5", "d5"};
    Node *l2 = run_scenario("hard: 12 nodes with duplicate 5s: the head copy goes first, then a middle copy", hard, 14);

    /* edge: a single node: delete it, then delete again from the now-empty list */
    const char *single_then_empty[] = {"99", "d99", "d99"};
    Node *l3 = run_scenario("edge: a single node: delete it, then delete again from the now-empty list", single_then_empty, 3);

    /* edge: 10 nodes: delete the tail, then delete a value that is not present */
    const char *tail_and_missing[] = {"10", "20", "30", "40", "50", "60", "70", "80", "90", "100", "d100", "d12345"};
    Node *l4 = run_scenario("edge: 10 nodes: delete the tail, then delete a value that is not present", tail_and_missing, 12);

    free_list(l1);
    free_list(l2);
    free_list(l3);
    free_list(l4);
    return 0;
}
