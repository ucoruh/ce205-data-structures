/* Unit tests for code/week-02/c/xor_linked_list.c: insert_head(), insert_tail().
   Independent oracle: the expected forward/backward VALUE sequences are hand-derived from insert_head =
   LIFO / insert_tail = FIFO semantics, computed before any call into the program. Reading the sequence back
   out of the XOR-encoded chain necessarily uses xor_node() (there is no other way to recover "next" from a
   single combined field) -- this walks the SAME way traverse_forward/traverse_backward do, but the checked
   VALUES are the independent part, not a call into insert_head/insert_tail feeding its own trace back. */
#define main program_main
#include "../../c/xor_linked_list.c"
#undef main
#include "../../../test_check.h"

static int walk_forward(Node *head, int out[]) {
    int n = 0;
    Node *prev = NULL, *cur = head;
    while (cur != NULL) {
        out[n++] = cur->data;
        Node *next = xor_node(cur->npx, prev);
        prev = cur; cur = next;
    }
    return n;
}

static int walk_backward(Node *tail, int out[]) {
    int n = 0;
    Node *next = NULL, *cur = tail;
    while (cur != NULL) {
        out[n++] = cur->data;
        Node *prev = xor_node(cur->npx, next);
        next = cur; cur = prev;
    }
    return n;
}

static void assert_sequence(const char *label, const int actual[], int actual_n, const int expected[], int expected_n) {
    test_checks++;
    if (actual_n != expected_n) { test_failures++; fprintf(stderr, "%s: length %d, expected %d\n", label, actual_n, expected_n); return; }
    for (int i = 0; i < expected_n; i++) {
        test_checks++;
        if (actual[i] != expected[i]) { test_failures++; fprintf(stderr, "%s: [%d] = %d, expected %d\n", label, i, actual[i], expected[i]); }
    }
}

int main(void) {
    int buf[32];

    /* insert_head three times: LIFO order forward, FIFO order (insertion order) backward */
    Node *head = NULL, *tail = NULL;
    Node *pool[32]; int count = 0;
    Node *n1 = insert_head(head, &tail, 10); head = n1; pool[count++] = n1;
    Node *n2 = insert_head(head, &tail, 20); head = n2; pool[count++] = n2;
    Node *n3 = insert_head(head, &tail, 30); head = n3; pool[count++] = n3;
    assert_sequence("insert_head forward (LIFO)", buf, walk_forward(head, buf), (int[]){30, 20, 10}, 3);
    assert_sequence("insert_head backward (insertion order)", buf, walk_backward(tail, buf), (int[]){10, 20, 30}, 3);
    CHECK(head == n3); CHECK(tail == n1);
    free_all(pool, count);

    /* insert_tail three times: FIFO order forward, LIFO order backward */
    head = NULL; tail = NULL; count = 0;
    Node *t1 = insert_tail(&head, tail, 1); tail = t1; pool[count++] = t1;
    Node *t2 = insert_tail(&head, tail, 2); tail = t2; pool[count++] = t2;
    Node *t3 = insert_tail(&head, tail, 3); tail = t3; pool[count++] = t3;
    assert_sequence("insert_tail forward (FIFO)", buf, walk_forward(head, buf), (int[]){1, 2, 3}, 3);
    assert_sequence("insert_tail backward (reverse)", buf, walk_backward(tail, buf), (int[]){3, 2, 1}, 3);
    CHECK(head == t1); CHECK(tail == t3);
    free_all(pool, count);

    /* single node via insert_head: head == tail, forward and backward agree */
    head = NULL; tail = NULL; count = 0;
    Node *s = insert_head(head, &tail, 77); head = s; pool[count++] = s;
    CHECK(head == tail);
    assert_sequence("single node forward", buf, walk_forward(head, buf), (int[]){77}, 1);
    assert_sequence("single node backward", buf, walk_backward(tail, buf), (int[]){77}, 1);
    free_all(pool, count);

    /* single node via insert_tail: symmetric case */
    head = NULL; tail = NULL; count = 0;
    Node *s2 = insert_tail(&head, tail, 88); tail = s2; pool[count++] = s2;
    CHECK(head == tail);
    assert_sequence("single tail-inserted node", buf, walk_forward(head, buf), (int[]){88}, 1);
    free_all(pool, count);

    /* mixed head/tail inserts: hand-traced order */
    head = NULL; tail = NULL; count = 0;
    Node *m;
    m = insert_head(head, &tail, 5);  head = m; pool[count++] = m;   /* [5] */
    m = insert_tail(&head, tail, 6);  tail = m; pool[count++] = m;   /* [5,6] */
    m = insert_head(head, &tail, 4);  head = m; pool[count++] = m;   /* [4,5,6] */
    m = insert_tail(&head, tail, 7);  tail = m; pool[count++] = m;   /* [4,5,6,7] */
    assert_sequence("mixed forward", buf, walk_forward(head, buf), (int[]){4, 5, 6, 7}, 4);
    assert_sequence("mixed backward", buf, walk_backward(tail, buf), (int[]){7, 6, 5, 4}, 4);
    free_all(pool, count);

    /* duplicates and negative values */
    head = NULL; tail = NULL; count = 0;
    m = insert_tail(&head, tail, -3); tail = m; pool[count++] = m;
    m = insert_tail(&head, tail, -3); tail = m; pool[count++] = m;
    m = insert_tail(&head, tail, 0);  tail = m; pool[count++] = m;
    assert_sequence("duplicates/negatives forward", buf, walk_forward(head, buf), (int[]){-3, -3, 0}, 3);
    free_all(pool, count);

    TEST_SUMMARY();
}
