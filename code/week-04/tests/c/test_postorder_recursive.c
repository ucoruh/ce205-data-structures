/* Unit tests for week-04 c/postorder_recursive.c
 * Expected sequences are hand-derived from the tree shape, independent of postorder() itself. */
#define main program_main
#include "../../c/postorder_recursive.c"
#undef main
#include "../../../test_check.h"

static void check_sequence(const int *expected, int n) {
    CHECK_EQ_INT(visited_count, n);
    for (int i = 0; i < n && i < visited_count; i++) CHECK_EQ_INT(visited[i], expected[i]);
}

int main(void) {
    /* -- empty tree -- */
    visited_count = 0;
    postorder(NULL);
    CHECK_EQ_INT(visited_count, 0);

    /* -- single node -- */
    visited_count = 0;
    Node *one = new_node(7);
    postorder(one);
    CHECK_EQ_INT(visited_count, 1);
    CHECK_EQ_INT(visited[0], 7);
    free_tree(one);

    /* -- left-skewed chain: postorder (left, right, visit) on a pure left chain also visits the deepest
     *    node first (no right subtrees to reorder anything), i.e. the reverse of insertion order -- */
    int left_values[] = {88, 81, 74, 67, 60, 53, 46, 39, 32, 25};
    int left_expected[] = {25, 32, 39, 46, 53, 60, 67, 74, 81, 88};
    visited_count = 0;
    Node *left_chain = build_left_chain(left_values, 10);
    postorder(left_chain);
    check_sequence(left_expected, 10);
    free_tree(left_chain);

    /* -- right-skewed chain: postorder walks all the way down the right spine before visiting anything,
     *    so the result is the reverse of insertion order -- */
    int right_values[] = {5, 13, 21, 29, 37, 45, 53, 61, 69, 77};
    int right_expected[] = {77, 69, 61, 53, 45, 37, 29, 21, 13, 5};
    visited_count = 0;
    Node *right_chain = build_right_chain(right_values, 10);
    postorder(right_chain);
    check_sequence(right_expected, 10);
    free_tree(right_chain);

    /* -- normal: hand-traced postorder = 10,20,45,40,30, 55,60,80,70, 50 -- */
    int normal_arr[] = {50, 30, 70, 20, 40, 60, 80, 10, SLOT_NONE, SLOT_NONE, 45, 55};
    int normal_expected[] = {10, 20, 45, 40, 30, 55, 60, 80, 70, 50};
    visited_count = 0;
    Node *normal_tree = build_tree(normal_arr, 12, 0);
    postorder(normal_tree);
    check_sequence(normal_expected, 10);
    free_tree(normal_tree);

    /* -- duplicates -- */
    int dup_arr[] = {7, 7, 7};
    int dup_expected[] = {7, 7, 7};
    visited_count = 0;
    Node *dup_tree = build_tree(dup_arr, 3, 0);
    postorder(dup_tree);
    check_sequence(dup_expected, 3);
    free_tree(dup_tree);

    /* -- extreme values: root = INT_MAX, left = 1, right = -1 -> postorder = 1, -1, INT_MAX -- */
    int extreme_arr[] = {INT_MAX, 1, -1};
    int extreme_expected[] = {1, -1, INT_MAX};
    visited_count = 0;
    Node *extreme_tree = build_tree(extreme_arr, 3, 0);
    postorder(extreme_tree);
    check_sequence(extreme_expected, 3);
    free_tree(extreme_tree);

    TEST_SUMMARY();
}
