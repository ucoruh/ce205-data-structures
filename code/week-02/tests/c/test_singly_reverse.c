/* Unit tests for code/week-02/c/singly_reverse.c: reverse().
   Independent oracle: the expected reversed content is the input array read backwards (hand-indexed),
   never produced by calling reverse() a second time to "check itself". */
#define main program_main
#include "../../c/singly_reverse.c"
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
    /* normal: 10 nodes */
    int normal[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    Node *h1 = build_list(normal, 10);
    h1 = reverse(h1);
    assert_list("normal reversed", h1, (int[]){100, 90, 80, 70, 60, 50, 40, 30, 20, 10}, 10);
    h1 = reverse(h1);   /* reversing twice must restore the original order */
    assert_list("double reverse restores original", h1, normal, 10);
    free_list(h1);

    /* hard: duplicates and negatives */
    int hard[] = {5, -3, 5, 0, -3, 8};
    Node *h2 = build_list(hard, 6);
    h2 = reverse(h2);
    assert_list("hard reversed", h2, (int[]){8, -3, 0, 5, -3, 5}, 6);
    free_list(h2);

    /* empty list: reverse of NULL is NULL */
    Node *h3 = reverse(NULL);
    CHECK(h3 == NULL);

    /* one node: unchanged */
    Node *h4 = build_list((int[]){7}, 1);
    h4 = reverse(h4);
    assert_list("single node reversed", h4, (int[]){7}, 1);
    free_list(h4);

    /* two nodes: order flips */
    Node *h5 = build_list((int[]){1, 2}, 2);
    h5 = reverse(h5);
    assert_list("two nodes reversed", h5, (int[]){2, 1}, 2);
    free_list(h5);

    /* INT_MIN/INT_MAX among the values */
    Node *h6 = build_list((int[]){2147483647, 0, -2147483648}, 3);
    h6 = reverse(h6);
    assert_list("extreme values reversed", h6, (int[]){-2147483648, 0, 2147483647}, 3);
    free_list(h6);

    TEST_SUMMARY();
}
