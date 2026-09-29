/* Unit tests for code/week-02/c/singly_insert.c: insert_head(), insert_tail(), insert_after(), find().
   Independent oracle: each expected list content below is hand-computed from the operation sequence.
   insert_after's documented precondition is prev != NULL (found via find()); every call here respects it. */
#define main program_main
#include "../../c/singly_insert.c"
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

int main(void) {
    /* insert_head into an empty list, then more heads (LIFO order) */
    Node *h = NULL;
    h = insert_head(h, 10);
    assert_list("single head", h, (int[]){10}, 1);
    h = insert_head(h, 20);
    h = insert_head(h, 30);
    assert_list("three heads (LIFO)", h, (int[]){30, 20, 10}, 3);
    free_list(h);

    /* insert_tail into an empty list, then more tails (FIFO order, walks to the end) */
    Node *t = NULL;
    t = insert_tail(t, 1);
    assert_list("single tail", t, (int[]){1}, 1);
    t = insert_tail(t, 2);
    t = insert_tail(t, 3);
    assert_list("three tails (FIFO)", t, (int[]){1, 2, 3}, 3);
    free_list(t);

    /* mixing head and tail inserts */
    Node *m = NULL;
    m = insert_head(m, 5);       /* [5] */
    m = insert_tail(m, 6);       /* [5,6] */
    m = insert_head(m, 4);       /* [4,5,6] */
    m = insert_tail(m, 7);       /* [4,5,6,7] */
    assert_list("mixed head/tail", m, (int[]){4, 5, 6, 7}, 4);

    /* find(): head, middle, last, and a value not present */
    CHECK(find(m, 4) == m);
    CHECK(find(m, 6)->data == 6);
    CHECK(find(m, 7)->next == NULL);
    CHECK(find(m, 999) == NULL);
    CHECK(find(NULL, 1) == NULL);           /* find on an empty list */

    /* insert_after right after the head */
    insert_after(find(m, 4), 100);
    assert_list("insert_after head", m, (int[]){4, 100, 5, 6, 7}, 5);

    /* insert_after right before the tail (prev holds the last node): new node becomes the new tail */
    insert_after(find(m, 7), 200);
    assert_list("insert_after tail", m, (int[]){4, 100, 5, 6, 7, 200}, 6);
    CHECK(find(m, 200)->next == NULL);

    /* insert_after in the middle */
    insert_after(find(m, 5), 300);
    assert_list("insert_after middle", m, (int[]){4, 100, 5, 300, 6, 7, 200}, 7);
    free_list(m);

    /* duplicates: find() returns the FIRST occurrence */
    Node *d = NULL;
    d = insert_tail(d, 8);
    d = insert_tail(d, 3);
    d = insert_tail(d, 8);
    d = insert_tail(d, 3);
    CHECK(find(d, 8) != NULL && find(d, 8)->next->data == 3);   /* first 8, i.e. index 0 */
    insert_after(find(d, 3), 999);      /* after the FIRST 3 (index 1) */
    assert_list("insert_after with duplicate target", d, (int[]){8, 3, 999, 8, 3}, 5);
    free_list(d);

    /* negative values */
    Node *n = NULL;
    n = insert_head(n, -5);
    n = insert_tail(n, -10);
    n = insert_head(n, 0);
    assert_list("negative values", n, (int[]){0, -5, -10}, 3);
    CHECK(find(n, -10) != NULL);
    free_list(n);

    TEST_SUMMARY();
}
