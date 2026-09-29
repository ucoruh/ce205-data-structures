/* Unit tests for code/week-02/c/circular_linked_list.c: insert_tail(), delete_value(), list_size().
   Independent oracle: each expected ring content below is hand-computed from the operation sequence; the
   wraparound is checked structurally (walking list_size(tail) steps from the head must land back on the
   head), not by calling traverse() (which only prints). */
#define main program_main
#include "../../c/circular_linked_list.c"
#undef main
#include "../../../test_check.h"

static void assert_ring(const char *label, Node *tail, const int expected[], int n) {
    test_checks++;
    if (list_size(tail) != n) {
        test_failures++;
        fprintf(stderr, "%s: list_size = %d, expected %d\n", label, list_size(tail), n);
        return;
    }
    if (n == 0) { CHECK(tail == NULL); return; }
    Node *head = tail->next;
    Node *cur = head;
    for (int i = 0; i < n; i++) {
        test_checks++;
        if (cur->data != expected[i]) {
            test_failures++;
            fprintf(stderr, "%s: node %d = %d, expected %d\n", label, i, cur->data, expected[i]);
        }
        cur = cur->next;
    }
    test_checks++;                                  /* wraps back to the head after exactly n steps */
    if (cur != head) { test_failures++; fprintf(stderr, "%s: ring did not close after %d steps\n", label, n); }
}

int main(void) {
    bool found;

    /* insert_tail into an empty ring: a single self-pointing node */
    Node *r1 = insert_tail(NULL, 10);
    assert_ring("single node", r1, (int[]){10}, 1);
    CHECK(r1->next == r1);

    /* more tails: order preserved */
    r1 = insert_tail(r1, 20);
    r1 = insert_tail(r1, 30);
    r1 = insert_tail(r1, 40);
    assert_ring("four tails", r1, (int[]){10, 20, 30, 40}, 4);

    /* delete a middle node */
    r1 = delete_value(r1, 20, &found);
    CHECK(found == true);
    assert_ring("after deleting middle", r1, (int[]){10, 30, 40}, 3);

    /* delete the tail node itself: new tail becomes the previous node */
    r1 = delete_value(r1, 40, &found);
    CHECK(found == true);
    assert_ring("after deleting old tail", r1, (int[]){10, 30}, 2);
    CHECK(r1->data == 30);                           /* tail pointer now names the new last node */

    /* delete the head node: tail->next must change to the new head */
    r1 = delete_value(r1, 10, &found);
    CHECK(found == true);
    assert_ring("after deleting head", r1, (int[]){30}, 1);
    CHECK(r1->next == r1);

    /* delete the only remaining node: ring becomes empty */
    r1 = delete_value(r1, 30, &found);
    CHECK(found == true);
    CHECK(r1 == NULL);

    /* delete from an empty ring */
    Node *empty_result = delete_value(NULL, 1, &found);
    CHECK(found == false);
    CHECK(empty_result == NULL);

    /* delete a value not present: ring unchanged, tail unchanged */
    Node *r2 = insert_tail(NULL, 1);
    r2 = insert_tail(r2, 2);
    r2 = insert_tail(r2, 3);
    Node *before = r2;
    r2 = delete_value(r2, 999, &found);
    CHECK(found == false);
    CHECK(r2 == before);
    assert_ring("unchanged after not-found delete", r2, (int[]){1, 2, 3}, 3);

    /* duplicates: only the FIRST occurrence (scanning forward from the head) is removed */
    Node *r3 = insert_tail(NULL, 5);
    r3 = insert_tail(r3, 8);
    r3 = insert_tail(r3, 5);
    r3 = insert_tail(r3, 8);
    r3 = delete_value(r3, 5, &found);
    CHECK(found == true);
    assert_ring("first duplicate removed", r3, (int[]){8, 5, 8}, 3);

    /* negative values */
    Node *r4 = insert_tail(NULL, -5);
    r4 = insert_tail(r4, -10);
    r4 = insert_tail(r4, 0);
    assert_ring("negative values", r4, (int[]){-5, -10, 0}, 3);

    free_circle(r2);
    free_circle(r3);
    free_circle(r4);

    TEST_SUMMARY();
}
