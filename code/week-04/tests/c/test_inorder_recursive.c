/* Unit tests for week-04 c/inorder_recursive.c
 * Expected sequences are hand-derived from the tree shape, independent of inorder() itself. */
#define main program_main
#include "../../c/inorder_recursive.c"
#undef main
#include "../../../test_check.h"

static void check_sequence(const int *expected, int n) {
    CHECK_EQ_INT(visited_count, n);
    for (int i = 0; i < n && i < visited_count; i++) CHECK_EQ_INT(visited[i], expected[i]);
}

int main(void) {
    /* -- empty tree -- */
    visited_count = 0;
    inorder(NULL);
    CHECK_EQ_INT(visited_count, 0);

    /* -- single node -- */
    visited_count = 0;
    Node *one = new_node(7);
    inorder(one);
    CHECK_EQ_INT(visited_count, 1);
    CHECK_EQ_INT(visited[0], 7);
    free_tree(one);

    /* -- left-skewed chain: inorder (left, visit, right) on a pure left chain visits the DEEPEST node
     *    first, i.e. the reverse of insertion order -- */
    int left_values[] = {88, 81, 74, 67, 60, 53, 46, 39, 32, 25};
    int left_expected[] = {25, 32, 39, 46, 53, 60, 67, 74, 81, 88};
    visited_count = 0;
    Node *left_chain = build_left_chain(left_values, 10);
    inorder(left_chain);
    check_sequence(left_expected, 10);
    free_tree(left_chain);

    /* -- right-skewed chain: with no left subtree ever, inorder matches insertion order (same as
     *    preorder would on this shape) -- */
    int right_values[] = {5, 13, 21, 29, 37, 45, 53, 61, 69, 77};
    visited_count = 0;
    Node *right_chain = build_right_chain(right_values, 10);
    inorder(right_chain);
    check_sequence(right_values, 10);
    free_tree(right_chain);

    /* -- normal: this array is a valid BST, so inorder must produce SORTED order -- */
    int normal_arr[] = {50, 30, 70, 20, 40, 60, 80, 10, SLOT_NONE, SLOT_NONE, 45, 55};
    int normal_expected[] = {10, 20, 30, 40, 45, 50, 55, 60, 70, 80};
    visited_count = 0;
    Node *normal_tree = build_tree(normal_arr, 12, 0);
    inorder(normal_tree);
    check_sequence(normal_expected, 10);
    free_tree(normal_tree);

    /* -- duplicates -- */
    int dup_arr[] = {7, 7, 7};
    int dup_expected[] = {7, 7, 7};
    visited_count = 0;
    Node *dup_tree = build_tree(dup_arr, 3, 0);
    inorder(dup_tree);
    check_sequence(dup_expected, 3);
    free_tree(dup_tree);

    /* -- extreme values: root = INT_MAX, left = 1, right = -1 -> inorder = 1, INT_MAX, -1 -- */
    int extreme_arr[] = {INT_MAX, 1, -1};
    int extreme_expected[] = {1, INT_MAX, -1};
    visited_count = 0;
    Node *extreme_tree = build_tree(extreme_arr, 3, 0);
    inorder(extreme_tree);
    check_sequence(extreme_expected, 3);
    free_tree(extreme_tree);

    TEST_SUMMARY();
}
