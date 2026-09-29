/* Unit tests for code/week-02/c/doubly_linked_list.c: insert_head(), insert_tail(), insert_after(),
   delete_value(). Independent oracle: each expected content below is hand-computed from the operation
   sequence; backward traversal is checked structurally against the SAME expected array read backwards
   (never by calling print_backward(), which only prints), and head->prev / tail->next boundaries are
   asserted explicitly every time. */
#define main program_main
#include "../../c/doubly_linked_list.c"
#undef main
#include "../../../test_check.h"

static void assert_list(const char *label, List *list, const int expected[], int n) {
    test_checks++;
    if (n == 0) {
        if (list->head != NULL || list->tail != NULL) { test_failures++; fprintf(stderr, "%s: expected empty list\n", label); }
        return;
    }
    /* forward traversal must match expected[] and head->prev must be NULL */
    Node *cur = list->head;
    CHECK(list->head->prev == NULL);
    for (int i = 0; i < n; i++) {
        test_checks++;
        if (cur == NULL) { test_failures++; fprintf(stderr, "%s: forward too short at %d\n", label, i); return; }
        if (cur->data != expected[i]) { test_failures++; fprintf(stderr, "%s: fwd node %d = %d, expected %d\n", label, i, cur->data, expected[i]); }
        cur = cur->next;
    }
    test_checks++;
    if (cur != NULL) { test_failures++; fprintf(stderr, "%s: forward longer than expected\n", label); }

    /* backward traversal must match expected[] reversed and tail->next must be NULL */
    CHECK(list->tail->next == NULL);
    cur = list->tail;
    for (int i = n - 1; i >= 0; i--) {
        test_checks++;
        if (cur == NULL) { test_failures++; fprintf(stderr, "%s: backward too short at %d\n", label, i); return; }
        if (cur->data != expected[i]) { test_failures++; fprintf(stderr, "%s: bwd node %d = %d, expected %d\n", label, i, cur->data, expected[i]); }
        cur = cur->prev;
    }
    test_checks++;
    if (cur != NULL) { test_failures++; fprintf(stderr, "%s: backward longer than expected\n", label); }
}

int main(void) {
    List list = { NULL, NULL };

    /* build with insert_head and insert_tail, alternating */
    insert_head(&list, 5);                 /* [5] */
    assert_list("single node", &list, (int[]){5}, 1);
    insert_tail(&list, 6);                 /* [5,6] */
    insert_head(&list, 4);                 /* [4,5,6] */
    insert_tail(&list, 7);                 /* [4,5,6,7] */
    assert_list("mixed head/tail", &list, (int[]){4, 5, 6, 7}, 4);

    /* insert_after an existing target: middle */
    CHECK(insert_after(&list, 5, 100) == true);
    assert_list("insert_after middle", &list, (int[]){4, 5, 100, 6, 7}, 5);

    /* insert_after the current tail: new node becomes the new tail */
    CHECK(insert_after(&list, 7, 200) == true);
    assert_list("insert_after tail", &list, (int[]){4, 5, 100, 6, 7, 200}, 6);
    CHECK(list.tail->data == 200);

    /* insert_after the current head */
    CHECK(insert_after(&list, 4, 300) == true);
    assert_list("insert_after head", &list, (int[]){4, 300, 5, 100, 6, 7, 200}, 7);

    /* insert_after a value not present: rejected, list unchanged */
    CHECK(insert_after(&list, 99999, 1) == false);
    assert_list("unchanged after not-found insert_after", &list, (int[]){4, 300, 5, 100, 6, 7, 200}, 7);

    /* delete a middle node, then the head, then the tail */
    CHECK(delete_value(&list, 100) == true);
    assert_list("after deleting middle", &list, (int[]){4, 300, 5, 6, 7, 200}, 6);
    CHECK(delete_value(&list, 4) == true);
    assert_list("after deleting head", &list, (int[]){300, 5, 6, 7, 200}, 5);
    CHECK(delete_value(&list, 200) == true);
    assert_list("after deleting tail", &list, (int[]){300, 5, 6, 7}, 4);

    /* delete a value not present */
    CHECK(delete_value(&list, 999999) == false);
    assert_list("unchanged after not-found delete", &list, (int[]){300, 5, 6, 7}, 4);

    free_list(&list);
    assert_list("freed list is empty", &list, (int[]){0}, 0);

    /* single node: insert then delete empties both head and tail */
    List single = { NULL, NULL };
    insert_head(&single, 42);
    CHECK(delete_value(&single, 42) == true);
    assert_list("single node deleted -> empty", &single, (int[]){0}, 0);

    /* duplicates: delete_value removes the FIRST occurrence (scanning from the head) */
    List dup = { NULL, NULL };
    insert_tail(&dup, 8); insert_tail(&dup, 3); insert_tail(&dup, 8); insert_tail(&dup, 3);
    CHECK(delete_value(&dup, 8) == true);
    assert_list("first duplicate removed", &dup, (int[]){3, 8, 3}, 3);
    free_list(&dup);

    /* negative values and zero */
    List neg = { NULL, NULL };
    insert_tail(&neg, -5); insert_tail(&neg, 0); insert_tail(&neg, -10);
    assert_list("negative values", &neg, (int[]){-5, 0, -10}, 3);
    free_list(&neg);

    TEST_SUMMARY();
}
