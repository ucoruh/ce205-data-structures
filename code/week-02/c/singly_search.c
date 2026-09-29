/* Week 2 -- Linked Lists, Arrays and Matrices
 * Singly linked list: linear search with a comparison count. Matches the
 * singly-search.js animation.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

int search(Node *head, int value, int *comparisons) {
    int index = 0;
    *comparisons = 0;
    for (Node *cur = head; cur != NULL; cur = cur->next) {
        (*comparisons)++;
        if (cur->data == value)
            return index;      /* found at this position */
        index++;
    }
    return -1;                 /* not found */
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

static void free_list(Node *head) {
    while (head != NULL) {
        Node *tmp = head;
        head = head->next;
        free(tmp);
    }
}

static void run_scenario(const char *label, const int values[], int n, const int queries[], int qn) {
    printf("-- %s --\n", label);
    Node *head = build_list(values, n);
    printf("list:");
    for (int i = 0; i < n; i++) printf(" %d", values[i]);
    printf("\n");
    for (int q = 0; q < qn; q++) {
        int comparisons;
        int index = search(head, queries[q], &comparisons);
        printf("search(%d) = index %d, comparisons %d\n", queries[q], index, comparisons);
    }
    printf("\n");
    free_list(head);
}

int main(void) {
    /* normal: 10 values, the target is in the middle */
    int normal[] = {12, 45, 3, 78, 23, 56, 89, 1, 67, 34};
    int normal_q[] = {23};
    run_scenario("normal: 10 values, the target is in the middle", normal, 10, normal_q, 1);

    /* hard: 12 values with duplicates -- the first match wins */
    int hard[] = {8, 15, 8, 22, 40, 8, 55, 61, 8, 70, 80, 90};
    int hard_q[] = {8};
    run_scenario("hard: 12 values with duplicates -- the first match wins", hard, 12, hard_q, 1);

    /* edge: the first element, the last element, and a value that is not present */
    int first_last[] = {12, 45, 3, 78, 23, 56, 89, 1, 67, 34};
    int first_last_q[] = {12, 34, 999};
    run_scenario("edge: the first element, the last element, and a value that is not present", first_last, 10, first_last_q, 3);

    /* edge: search on an empty list */
    int empty[] = {0};
    int empty_q[] = {1};
    run_scenario("edge: search on an empty list", empty, 0, empty_q, 1);

    return 0;
}
