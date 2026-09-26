/* Week 1 -- Introduction to Data Structures
 * Preview of Week 2: the same values laid out as a contiguous array versus individually
 * allocated linked nodes; compare reaching element k: 1 step in the array vs k hops in the list.
 * Runs the same normal / hard / edge-case scenarios as the array-vs-linked-preview animation.
 * Real addresses are printed (yours will differ) -- only the array's fixed 4-byte stride and the
 * "1 step vs k hops" access-cost story are guaranteed to match.
 * CEN207 Data Structures (CS50-style lecture notes)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

static void run_scenario(const char *label, const int values[], int n, int k) {
    printf("-- %s (k = %d) --\n", label, k);

    int arr[64];
    for (int i = 0; i < n; i++) arr[i] = values[i];

    printf("array (contiguous):\n");
    for (int i = 0; i < n; i++)
        printf("  arr[%d] = %d at %p\n", i, arr[i], (void *) &arr[i]);
    printf("array access: arr[%d] = %d, ONE calculation (base + %d*4). O(1).\n", k, arr[k], k);

    Node *head = NULL;
    for (int i = n - 1; i >= 0; i--) {
        Node *node = malloc(sizeof(Node));
        node->data = arr[i];
        node->next = head;
        head = node;
    }

    printf("linked list (scattered, connected by pointers):\n");
    for (Node *p = head; p != NULL; p = p->next)
        printf("  node at %p: data = %d, next = %p\n", (void *) p, p->data, (void *) p->next);

    Node *reached = head;
    int hops = 0;
    for (int h = 0; h < k; h++) { reached = reached->next; hops++; }
    printf("linked access: reached node with data = %d after %d hop%s. O(n).\n\n",
           reached->data, hops, hops == 1 ? "" : "s");

    for (Node *n2 = head; n2 != NULL;) {
        Node *tmp = n2;
        n2 = n2->next;
        free(tmp);
    }
}

int main(void) {
    /* normal: 10 values, k = 4 (in the middle) */
    int normal[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    run_scenario("normal: 10 values, k = 4 (in the middle)", normal, 10, 4);

    /* hard: 16 values, k = 13 (near the end) */
    int hard[] = {11, 22, 33, 44, 55, 66, 77, 88, 99, 111, 122, 133, 144, 155, 166, 177};
    run_scenario("hard: 16 values, k = 13 (near the end)", hard, 16, 13);

    /* edge: k = 0, the first element */
    int first[] = {7, 14, 21, 28, 35, 42, 49, 56, 63, 70};
    run_scenario("edge: k = 0, the first element", first, 10, 0);

    /* edge: k = the last index, the most hops */
    int last[] = {3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36};
    run_scenario("edge: k = the last index, the most hops", last, 12, 11);

    return 0;
}
