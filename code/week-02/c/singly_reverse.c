/* Week 2 -- Linked Lists, Arrays and Matrices
 * Singly linked list: iterative reverse with three pointers (prev, curr,
 * next). Matches the singly-reverse.js animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node *reverse(Node *head) {
    Node *prev = NULL;
    Node *curr = head;
    while (curr != NULL) {
        Node *next = curr->next;   /* save the rest of the list */
        curr->next = prev;          /* flip this node's arrow */
        prev = curr;                 /* prev catches up */
        curr = next;                 /* curr moves on */
    }
    return prev;                     /* prev is the new head */
}

static Node *build_list(const int values[], int n) {
    Node *head = NULL, *tail = NULL;
    for (int i = 0; i < n; i++) {
        Node *node = malloc(sizeof(Node));
        node->data = values[i];
        node->next = NULL;
        if (tail == NULL) head = node; else tail->next = node;
        tail = node;
    }
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

static void run_scenario(const char *label, const int values[], int n) {
    printf("-- %s --\n", label);
    Node *head = build_list(values, n);
    print_list(head);
    head = reverse(head);
    printf("reverse():\n");
    print_list(head);
    printf("\n");
    free_list(head);
}

int main(void) {
    /* normal: 10 nodes */
    int normal[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    run_scenario("normal: 10 nodes", normal, 10);

    /* hard: 20 nodes (duplicates/negatives, two rows) */
    int hard[] = {5, -3, 5, 0, -3, 8, 8, -1, 2, -3, 100, -100, 7, 7, -50, 63, -8, 19, 0, 44};
    run_scenario("hard: 20 nodes (duplicates/negatives, two rows)", hard, 20);

    /* edge: empty list */
    run_scenario("edge: empty list", NULL, 0);

    /* edge: a single node */
    int one_node[] = {7};
    run_scenario("edge: a single node", one_node, 1);

    /* edge: two nodes */
    int two_nodes[] = {1, 2};
    run_scenario("edge: two nodes", two_nodes, 2);

    return 0;
}
