/* Week 1 -- Introduction to Data Structures
 * Preview of Week 2: the same values laid out as a contiguous array versus individually
 * allocated linked nodes; compare reaching element k: 1 step in the array vs k hops in the list.
 * Runs the same normal / hard / edge-case scenarios as the array-vs-linked-preview animation.
 * Real addresses vary from run to run (and between C and Java), so this prints a deterministic
 * stand-in instead: the array's byte OFFSET from its base (base + i*4, the real formula the
 * hardware uses) and the linked list's POSITION ("node #i"); the C and Java outputs are then
 * byte-identical and testable. The point -- one index calculation vs k pointer hops -- still holds.
 * CEN207 Data Structures (formerly CE205)
 */
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

static void run_scenario(const char *label, const int values[], int n, int k) {
    printf("-- %s --\n", label);

    int arr[64];
    for (int i = 0; i < n; i++) arr[i] = values[i];

    printf("array (contiguous, indexed access):\n");
    for (int i = 0; i < n; i++)
        printf("  arr[%d] = %d at base+%d\n", i, arr[i], (int) (i * sizeof arr[0]));
    printf("array access: arr[%d] = %d, ONE index calculation (base + %d*4). O(1).\n", k, arr[k], k);

    Node *head = NULL;
    for (int i = n - 1; i >= 0; i--) {
        Node *node = malloc(sizeof(Node));
        node->data = arr[i];
        node->next = head;
        head = node;
    }

    printf("linked list (separate nodes, connected by pointers):\n");
    int idx = 0;
    for (Node *p = head; p != NULL; p = p->next, idx++) {
        if (p->next != NULL)
            printf("  node #%d: data = %d, next -> node #%d\n", idx, p->data, idx + 1);
        else
            printf("  node #%d: data = %d, next -> NULL\n", idx, p->data);
    }

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
