/* Unit tests for week-04 c/preorder_recursive.c
 * Expected sequences are hand-derived from the tree shape (index arithmetic / chain order), independent
 * of preorder() itself. */
#define main program_main
#include "../../c/preorder_recursive.c"
#undef main
#include "../../../test_check.h"

static void check_sequence(const int *expected, int n) {
    CHECK_EQ_INT(visited_count, n);
    for (int i = 0; i < n && i < visited_count; i++) CHECK_EQ_INT(visited[i], expected[i]);
}

int main(void) {
    /* -- empty tree: nothing visited -- */
    visited_count = 0;
    preorder(NULL);
    CHECK_EQ_INT(visited_count, 0);

    /* -- single node -- */
    visited_count = 0;
    Node *one = new_node(7);
    preorder(one);
    CHECK_EQ_INT(visited_count, 1);
    CHECK_EQ_INT(visited[0], 7);
    free_tree(one);

    /* -- left-skewed chain: preorder (visit, left, right) on a chain visits root-to-tail, i.e. exactly
     *    the insertion order -- */
    int left_values[] = {88, 81, 74, 67, 60, 53, 46, 39, 32, 25};
    visited_count = 0;
    Node *left_chain = build_left_chain(left_values, 10);
    preorder(left_chain);
    check_sequence(left_values, 10);
    free_tree(left_chain);

    /* -- right-skewed chain: same reasoning, preorder also matches insertion order -- */
    int right_values[] = {5, 13, 21, 29, 37, 45, 53, 61, 69, 77};
    visited_count = 0;
    Node *right_chain = build_right_chain(right_values, 10);
    preorder(right_chain);
    check_sequence(right_values, 10);
    free_tree(right_chain);

    /* -- normal: 10-node tree with two missing children (indices 8, 9). Hand-traced preorder:
     *    50 -> [30 -> 20 -> 10, (no right); 30's right 40 -> (no left), 45] -> [70 -> 60 -> 55, (no
     *    right); 70's right 80] = 50,30,20,10,40,45,70,60,55,80 -- */
    int normal_arr[] = {50, 30, 70, 20, 40, 60, 80, 10, SLOT_NONE, SLOT_NONE, 45, 55};
    int normal_expected[] = {50, 30, 20, 10, 40, 45, 70, 60, 55, 80};
    visited_count = 0;
    Node *normal_tree = build_tree(normal_arr, 12, 0);
    preorder(normal_tree);
    check_sequence(normal_expected, 10);
    free_tree(normal_tree);

    /* -- duplicates: three equal values, still visited in structural (not value) order -- */
    int dup_arr[] = {7, 7, 7};
    int dup_expected[] = {7, 7, 7};
    visited_count = 0;
    Node *dup_tree = build_tree(dup_arr, 3, 0);
    preorder(dup_tree);
    check_sequence(dup_expected, 3);
    free_tree(dup_tree);

    /* -- INT_MIN / INT_MAX as real values must not be confused with SLOT_NONE (SLOT_NONE == INT_MIN is
     *    the sentinel, so a real INT_MIN payload cannot appear here, but INT_MAX must round-trip) -- */
    int extreme_arr[] = {INT_MAX, 1, -1};
    int extreme_expected[] = {INT_MAX, 1, -1};
    visited_count = 0;
    Node *extreme_tree = build_tree(extreme_arr, 3, 0);
    preorder(extreme_tree);
    check_sequence(extreme_expected, 3);
    free_tree(extreme_tree);

    TEST_SUMMARY();
}
