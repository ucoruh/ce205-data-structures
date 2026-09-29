/* Unit tests for week-04 c/inorder_stack.c
 * Expected sequences are hand-derived from the tree shape (same reasoning as inorder_recursive.c),
 * independent of the iterative stack loop under test. */
#define main program_main
#include "../../c/inorder_stack.c"
#undef main
#include "../../../test_check.h"

static void check_sequence(const int *expected, int n) {
    CHECK_EQ_INT(visited_count, n);
    for (int i = 0; i < n && i < visited_count; i++) CHECK_EQ_INT(visited[i], expected[i]);
}

int main(void) {
    /* -- push/pop/is_empty mechanics on their own, LIFO order, three items -- */
    top = -1;
    CHECK(is_empty());
    Node a = {1, NULL, NULL}, b = {2, NULL, NULL}, c = {3, NULL, NULL};
    push(&a); CHECK_EQ_INT(top, 0); CHECK(!is_empty());
    push(&b); push(&c);
    CHECK_EQ_INT(top, 2);
    CHECK(pop() == &c);
    CHECK(pop() == &b);
    CHECK_EQ_INT(top, 0);
    CHECK(pop() == &a);
    CHECK(is_empty());

    /* -- empty tree: nothing visited -- */
    run_scenario("empty", NULL);
    CHECK_EQ_INT(visited_count, 0);

    /* -- single node -- */
    run_scenario("single", new_node(7));
    CHECK_EQ_INT(visited_count, 1);
    CHECK_EQ_INT(visited[0], 7);

    /* -- left-skewed chain: inorder visits the deepest node first, i.e. reverse of insertion order -- */
    int left_values[] = {88, 81, 74, 67, 60, 53, 46, 39, 32, 25};
    int left_expected[] = {25, 32, 39, 46, 53, 60, 67, 74, 81, 88};
    run_scenario("left chain", build_left_chain(left_values, 10));
    check_sequence(left_expected, 10);

    /* -- right-skewed chain: matches insertion order -- */
    int right_values[] = {5, 13, 21, 29, 37, 45, 53, 61, 69, 77};
    run_scenario("right chain", build_right_chain(right_values, 10));
    check_sequence(right_values, 10);

    /* -- normal: a valid BST, inorder must be sorted order -- */
    int normal_arr[] = {50, 30, 70, 20, 40, 60, 80, 10, SLOT_NONE, SLOT_NONE, 45, 55};
    int normal_expected[] = {10, 20, 30, 40, 45, 50, 55, 60, 70, 80};
    run_scenario("normal", build_tree(normal_arr, 12, 0));
    check_sequence(normal_expected, 10);

    /* -- duplicates -- */
    int dup_arr[] = {7, 7, 7};
    int dup_expected[] = {7, 7, 7};
    run_scenario("duplicates", build_tree(dup_arr, 3, 0));
    check_sequence(dup_expected, 3);

    /* -- extreme values: root = INT_MAX, left = 1, right = -1 -> inorder = 1, INT_MAX, -1 -- */
    int extreme_arr[] = {INT_MAX, 1, -1};
    int extreme_expected[] = {1, INT_MAX, -1};
    run_scenario("extreme", build_tree(extreme_arr, 3, 0));
    check_sequence(extreme_expected, 3);

    TEST_SUMMARY();
}
