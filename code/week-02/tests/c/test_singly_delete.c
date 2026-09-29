/* Unit tests for code/week-02/c/singly_delete.c: delete_value().
   Independent oracle: each expected list content below is hand-computed from the operation sequence. */
#define main program_main
#include "../../c/singly_delete.c"
#undef main
#include "../../../test_check.h"

static void assert_list(const char *label, Node *head, const int expected[], int n) {
    Node *cur = head;
    for (int i = 0; i < n; i++) {
        test_checks++;
        if (cur == NULL) { test_failures++; fprintf(stderr, "%s: list too short at %d\n", label, i); return; }
        if (cur->data != expected[i]) {
            test_failures++;
            fprintf(stderr, "%s: node %d = %d, expected %d\n", label, i, cur->data, expected[i]);
        }
        cur = cur->next;
    }
    test_checks++;
    if (cur != NULL) { test_failures++; fprintf(stderr, "%s: list longer than expected\n", label); }
}

static Node *build(const int vals[], int n) {
    Node *head = NULL;
    for (int i = 0; i < n; i++) head = insert_tail(head, vals[i]);
    return head;
}

int main(void) {
    bool removed;

    /* delete on an empty list: nothing to remove */
    Node *e = delete_value(NULL, 5, &removed);
    CHECK(removed == false);
    CHECK(e == NULL);

    /* single node: delete it (empties the list), then delete again from the now-empty list */
    Node *s = build((int[]){99}, 1);
    s = delete_value(s, 99, &removed);
    CHECK(removed == true);
    CHECK(s == NULL);
    s = delete_value(s, 99, &removed);
    CHECK(removed == false);
    CHECK(s == NULL);

    /* delete the head of a longer list */
    Node *h = build((int[]){1, 2, 3, 4, 5}, 5);
    h = delete_value(h, 1, &removed);
    CHECK(removed == true);
    assert_list("after deleting head", h, (int[]){2, 3, 4, 5}, 4);

    /* delete a middle node */
    h = delete_value(h, 3, &removed);
    CHECK(removed == true);
    assert_list("after deleting middle", h, (int[]){2, 4, 5}, 3);

    /* delete the tail */
    h = delete_value(h, 5, &removed);
    CHECK(removed == true);
    assert_list("after deleting tail", h, (int[]){2, 4}, 2);

    /* delete a value not present: list unchanged */
    h = delete_value(h, 12345, &removed);
    CHECK(removed == false);
    assert_list("unchanged after not-found delete", h, (int[]){2, 4}, 2);
    free_list(h);

    /* duplicates: only the FIRST occurrence is removed */
    Node *d = build((int[]){7, 7, 3, 7}, 4);
    d = delete_value(d, 7, &removed);
    CHECK(removed == true);
    assert_list("first duplicate removed", d, (int[]){7, 3, 7}, 3);
    d = delete_value(d, 7, &removed);        /* now removes the new first 7 */
    assert_list("second call removes the next 7", d, (int[]){3, 7}, 2);
    free_list(d);

    /* negative values and zero */
    Node *neg = build((int[]){-5, 0, -10, 3}, 4);
    neg = delete_value(neg, 0, &removed);
    CHECK(removed == true);
    assert_list("zero removed", neg, (int[]){-5, -10, 3}, 3);
    neg = delete_value(neg, -10, &removed);
    CHECK(removed == true);
    assert_list("negative value removed", neg, (int[]){-5, 3}, 2);
    free_list(neg);

    /* draining a list completely by repeated deletes, then one more (underflow-like: empty target) */
    Node *drain = build((int[]){1, 2, 3}, 3);
    drain = delete_value(drain, 1, &removed); CHECK(removed);
    drain = delete_value(drain, 2, &removed); CHECK(removed);
    drain = delete_value(drain, 3, &removed); CHECK(removed);
    CHECK(drain == NULL);
    drain = delete_value(drain, 3, &removed);
    CHECK(removed == false);
    CHECK(drain == NULL);

    TEST_SUMMARY();
}
