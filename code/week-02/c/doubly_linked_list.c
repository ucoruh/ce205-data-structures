/* Week 2 -- Linked Lists, Arrays and Matrices
 * Doubly linked list: insert at the front, at the back and after a given
 * value, delete anywhere by value, and traverse backwards. Matches the
 * doubly-linked-list.js animation.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *prev;
    struct Node *next;
} Node;
typedef struct { Node *head; Node *tail; } List;

void insert_head(List *list, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value; n->prev = NULL; n->next = list->head;
    if (list->head != NULL) list->head->prev = n;  /* old head now has a prev */
    list->head = n;
    if (list->tail == NULL) list->tail = n;
}

void insert_tail(List *list, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value; n->next = NULL; n->prev = list->tail;
    if (list->tail != NULL) list->tail->next = n;  /* old tail now has a next */
    list->tail = n;
    if (list->head == NULL) list->head = n;
}

bool insert_after(List *list, int target, int value) {
    for (Node *cur = list->head; cur != NULL; cur = cur->next) {
        if (cur->data == target) {
            Node *n = malloc(sizeof(Node));
            n->data = value; n->prev = cur; n->next = cur->next;
            if (cur->next != NULL) cur->next->prev = n; else list->tail = n;  /* cur was the tail */
            cur->next = n;
            return true;
        }
    }
    return false;                                    /* target not found */
}

bool delete_value(List *list, int value) {
    for (Node *cur = list->head; cur != NULL; cur = cur->next) {
        if (cur->data == value) {
            if (cur->prev != NULL) cur->prev->next = cur->next; else list->head = cur->next;
            if (cur->next != NULL) cur->next->prev = cur->prev; else list->tail = cur->prev;
            free(cur);
            return true;
        }
    }
    return false;
}

void print_backward(List *list) {
    for (Node *cur = list->tail; cur != NULL; cur = cur->prev)
        printf(" %d", cur->data);
}

static void print_forward(List *list) {
    printf("forward: ");
    for (Node *cur = list->head; cur != NULL; cur = cur->next)
        printf(" %d", cur->data);
    printf("\n");
}

static void free_list(List *list) {
    Node *cur = list->head;
    while (cur != NULL) {
        Node *tmp = cur;
        cur = cur->next;
        free(tmp);
    }
    list->head = list->tail = NULL;
}

/* tokens: "hV" = insert_head(V); "tV" = insert_tail(V); "aX:V" = insert_after(X, V);
 * "dV" = delete_value(V); "b" = print backward */
static void run_scenario(const char *label, const char *ops[], int n) {
    printf("-- %s --\n", label);
    List list = { NULL, NULL };
    for (int i = 0; i < n; i++) {
        const char *op = ops[i];
        if (op[0] == 'h') {
            int v = atoi(op + 1);
            insert_head(&list, v);
            printf("insert_head(%d)\n", v);
        } else if (op[0] == 't') {
            int v = atoi(op + 1);
            insert_tail(&list, v);
            printf("insert_tail(%d)\n", v);
        } else if (op[0] == 'a') {
            int target, v;
            sscanf(op + 1, "%d:%d", &target, &v);
            bool ok = insert_after(&list, target, v);
            printf("insert_after(%d, %d): %s\n", target, v, ok ? "inserted" : "not found");
        } else if (op[0] == 'd') {
            int v = atoi(op + 1);
            bool ok = delete_value(&list, v);
            printf("delete_value(%d): %s\n", v, ok ? "removed" : "not found");
        } else if (op[0] == 'b') {
            printf("backward:");
            print_backward(&list);
            printf("\n");
            continue;
        }
        print_forward(&list);
    }
    printf("\n");
    free_list(&list);
}

int main(void) {
    /* normal: 10 nodes (alternating front/back), delete a middle node, traverse backward */
    const char *normal[] = {"t10", "h20", "t30", "h40", "t50", "h60", "t70", "h80", "t90", "h100", "d50", "b"};
    run_scenario("normal: 10 nodes (alternating front/back), delete a middle node, traverse backward", normal, 12);

    /* hard: 12 nodes, duplicates/negatives; the FIRST match of a duplicate -3 is deleted */
    const char *hard[] = {"t5", "h-3", "t5", "h0", "t-3", "h8", "t8", "h-1", "t2", "h-3", "t100", "h-100", "d-3", "b"};
    run_scenario("hard: 12 nodes, duplicates/negatives; the FIRST match of a duplicate -3 is deleted", hard, 14);

    /* edge: a single node: insert it, then delete it (the list is empty again) */
    const char *single_element[] = {"h5", "d5", "b"};
    run_scenario("edge: a single node: insert it, then delete it (the list is empty again)", single_element, 3);

    /* edge: insert after the node tail points to: the new node becomes the new tail */
    const char *insert_after_tail[] = {"t10", "t20", "t30", "t40", "t50", "t60", "t70", "t80", "t90", "t100", "a100:105", "b"};
    run_scenario("edge: insert after the node tail points to: the new node becomes the new tail", insert_after_tail, 12);

    /* edge: trying to insert after a value that is not in the list */
    const char *insert_after_not_found[] = {"t10", "t20", "t30", "t40", "t50", "t60", "t70", "t80", "t90", "t100", "a99999:1", "b"};
    run_scenario("edge: trying to insert after a value that is not in the list", insert_after_not_found, 12);

    return 0;
}
