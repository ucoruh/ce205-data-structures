/* Week 2 -- Linked Lists, Arrays and Matrices
 * Singly linked list: insert at head, at tail (no tail pointer -- walks the
 * list), and after a given node. Matches the singly-insert.js animation.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node *insert_head(Node *head, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    n->next = head;      /* new node points at the old head */
    return n;            /* new node is the head now */
}

Node *insert_tail(Node *head, int value) {   /* no tail pointer here: walks the list */
    Node *n = malloc(sizeof(Node));
    n->data = value;
    n->next = NULL;
    if (head == NULL)
        return n;
    Node *cur = head;
    while (cur->next != NULL)   /* walk to the last node: O(n) */
        cur = cur->next;
    cur->next = n;
    return head;
}

void insert_after(Node *prev, int value) {
    Node *n = malloc(sizeof(Node));
    n->data = value;
    n->next = prev->next;   /* STEP 1: new node first */
    prev->next = n;         /* STEP 2: then link prev to it */
}

Node *find(Node *head, int value) {
    for (Node *cur = head; cur != NULL; cur = cur->next)
        if (cur->data == value)
            return cur;
    return NULL;
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

/* op tokens: "hV" = insert_head(V); "tV" = insert_tail(V); "aX:V" = insert_after(find(X), V) */
static Node *run_scenario(const char *label, const char *ops[], int n) {
    printf("-- %s --\n", label);
    Node *head = NULL;
    print_list(head);
    for (int i = 0; i < n; i++) {
        const char *op = ops[i];
        if (op[0] == 'h') {
            int v = atoi(op + 1);
            head = insert_head(head, v);
            printf("insert_head(%d)\n", v);
        } else if (op[0] == 't') {
            int v = atoi(op + 1);
            head = insert_tail(head, v);
            printf("insert_tail(%d)\n", v);
        } else if (op[0] == 'a') {
            int target, v;
            sscanf(op + 1, "%d:%d", &target, &v);
            Node *prev = find(head, target);
            insert_after(prev, v);
            printf("insert_after(find(%d), %d)\n", target, v);
        }
        print_list(head);
    }
    printf("\n");
    return head;
}

int main(void) {
    /* normal: 5 inserts at head, 5 at tail, then one after a node */
    const char *normal[] = {"h7", "h3", "h9", "h1", "h8", "t2", "t10", "t4", "t6", "t5", "a8:777"};
    Node *l1 = run_scenario("normal: 5 inserts at head, 5 at tail, then one after a node", normal, 11);

    /* hard: 12 values (duplicates/negatives), insert after the FIRST match of a duplicate target */
    const char *hard[] = {"t5", "t-3", "t5", "t0", "t-3", "t8", "t8", "t-1", "t2", "t-3", "t100", "t-100", "a-3:777"};
    Node *l2 = run_scenario("hard: 12 values (duplicates/negatives), insert after the FIRST match of a duplicate target", hard, 13);

    /* edge: insert into an empty list at the head */
    const char *into_empty[] = {"h42"};
    Node *l3 = run_scenario("edge: insert into an empty list at the head", into_empty, 1);

    /* edge: insert right after the head and right after the tail (position k = 0 and k = last) */
    const char *after_head_tail[] = {"t10", "t20", "t30", "t40", "t50", "t60", "t70", "t80", "t90", "t100", "a10:111", "a100:222"};
    Node *l4 = run_scenario("edge: insert right after the head and right after the tail (position k = 0 and k = last)", after_head_tail, 12);

    free_list(l1);
    free_list(l2);
    free_list(l3);
    free_list(l4);
    return 0;
}
