/* Unit tests for week-04 c/levelorder_queue.c
 * Expected sequences are hand-derived: this array format IS already level order by construction, so the
 * expected sequence is simply the input array with SLOT_NONE entries removed (for a chain, every node is
 * alone on its own level, so level order also matches insertion order) -- independent of the queue loop
 * under test. */
#define main program_main
#include "../../c/levelorder_queue.c"
#undef main
#include "../../../test_check.h"

static void check_sequence(const int *expected, int n) {
    CHECK_EQ_INT(visited_count, n);
    for (int i = 0; i < n && i < visited_count; i++) CHECK_EQ_INT(visited[i], expected[i]);
}

int main(void) {
    /* -- enqueue/dequeue/is_empty mechanics on their own, FIFO order, three items -- */
    front = 0; rear = -1; count = 0;
    CHECK(is_empty());
    Node a = {1, NULL, NULL}, b = {2, NULL, NULL}, c = {3, NULL, NULL};
    enqueue(&a); CHECK_EQ_INT(count, 1); CHECK(!is_empty());
    enqueue(&b); enqueue(&c);
    CHECK_EQ_INT(count, 3);
    CHECK(dequeue() == &a);       /* FIFO: first in, first out */
    CHECK(dequeue() == &b);
    CHECK_EQ_INT(count, 1);
    CHECK(dequeue() == &c);
    CHECK(is_empty());

    /* -- empty tree: nothing enqueued, nothing visited -- */
    run_scenario("empty", NULL);
    CHECK_EQ_INT(visited_count, 0);

    /* -- single node -- */
    run_scenario("single", new_node(7));
    CHECK_EQ_INT(visited_count, 1);
    CHECK_EQ_INT(visited[0], 7);

    /* -- left-skewed chain: each node is alone on its own level, so level order == insertion order -- */
    int left_values[] = {88, 81, 74, 67, 60, 53, 46, 39, 32, 25};
    run_scenario("left chain", build_left_chain(left_values, 10));
    check_sequence(left_values, 10);

    /* -- right-skewed chain: same reasoning -- */
    int right_values[] = {5, 13, 21, 29, 37, 45, 53, 61, 69, 77};
    run_scenario("right chain", build_right_chain(right_values, 10));
    check_sequence(right_values, 10);

    /* -- normal: the array IS the level-order layout; the expected sequence is the array with the two
     *    SLOT_NONE entries (indices 8, 9) removed -- */
    int normal_arr[] = {50, 30, 70, 20, 40, 60, 80, 10, SLOT_NONE, SLOT_NONE, 45, 55};
    int normal_expected[] = {50, 30, 70, 20, 40, 60, 80, 10, 45, 55};
    run_scenario("normal", build_tree(normal_arr, 12, 0));
    check_sequence(normal_expected, 10);

    /* -- duplicates -- */
    int dup_arr[] = {7, 7, 7};
    int dup_expected[] = {7, 7, 7};
    run_scenario("duplicates", build_tree(dup_arr, 3, 0));
    check_sequence(dup_expected, 3);

    /* -- extreme values: level order == array order == INT_MAX, 1, -1 -- */
    int extreme_arr[] = {INT_MAX, 1, -1};
    run_scenario("extreme", build_tree(extreme_arr, 3, 0));
    check_sequence(extreme_arr, 3);

    TEST_SUMMARY();
}
