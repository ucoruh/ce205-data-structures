/* Unit tests for week-04 c/tree_shape.c
 * Every expected true/false below is hand-derived from the array layout (index arithmetic 2i+1/2i+2),
 * not by re-running is_full/is_complete/is_perfect/is_degenerate/check_balance on themselves. */
#define main program_main
#include "../../c/tree_shape.c"
#undef main
#include "../../../test_check.h"

static bool balanced(Node *n) { return check_balance(n) != -1; }

int main(void) {
    int leaf_depth;
    Node *root;

    /* -- empty tree: root itself is NULL -- */
    int empty_arr[] = { SLOT_NONE };
    root = build_tree(empty_arr, 1, 0);
    CHECK(root == NULL);
    CHECK(is_full(root) == true);
    CHECK(is_complete(root) == true);
    leaf_depth = -1; CHECK(is_perfect(root, 0, &leaf_depth) == true);
    CHECK(is_degenerate(root) == true);
    CHECK(balanced(root) == true);

    /* -- single node: trivially every shape property holds -- */
    int single_arr[] = { 42 };
    root = build_tree(single_arr, 1, 0);
    CHECK(is_full(root) == true);
    CHECK(is_complete(root) == true);
    leaf_depth = -1; CHECK(is_perfect(root, 0, &leaf_depth) == true);
    CHECK_EQ_INT(leaf_depth, 0);
    CHECK(is_degenerate(root) == true);
    CHECK(balanced(root) == true);
    free_tree(root);

    /* -- normal: 12 nodes, complete BUT: node "60" (index 5) has only a left child (55, index 11) and no
     *    right child (index 12 is past the end) -- so NOT full, hence not perfect; no node has exactly one
     *    child elsewhere and two nodes (20, 40) have two children, so degenerate is false; the tree is
     *    still height-balanced (recomputed by hand: heights 30->3, 70->3 from the root). -- */
    int normal_arr[] = {50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55};
    root = build_tree(normal_arr, 12, 0);
    CHECK(is_full(root) == false);
    CHECK(is_complete(root) == true);
    leaf_depth = -1; CHECK(is_perfect(root, 0, &leaf_depth) == false);
    CHECK(is_degenerate(root) == false);
    CHECK(balanced(root) == true);
    free_tree(root);

    /* -- hard: a full caterpillar, 17 nodes -- every internal node (the right spine) has exactly two
     *    children (one leaf, one continuing the spine), so FULL is true; the level-order scan hits real
     *    nodes far past the first gaps, so NOT complete; leaves sit at depths 1..8, not perfect; every
     *    node has 0 or 2 children (never exactly 1), so NOT degenerate; the two children of the root
     *    (a depth-1 leaf and a depth-7 subtree) differ far more than 1 in height, so NOT balanced. -- */
    root = build_full_caterpillar(8, 100, 5);
    CHECK(is_full(root) == true);
    CHECK(is_complete(root) == false);
    leaf_depth = -1; CHECK(is_perfect(root, 0, &leaf_depth) == false);
    CHECK(is_degenerate(root) == false);
    CHECK(balanced(root) == false);
    free_tree(root);

    /* -- edge: a perfect tree, 15 nodes (4 full levels: 1+2+4+8) -- */
    int perfect_arr[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15};
    root = build_tree(perfect_arr, 15, 0);
    CHECK(is_full(root) == true);
    CHECK(is_complete(root) == true);
    leaf_depth = -1; CHECK(is_perfect(root, 0, &leaf_depth) == true);
    CHECK_EQ_INT(leaf_depth, 3);
    CHECK(is_degenerate(root) == false);
    CHECK(balanced(root) == true);
    free_tree(root);

    /* -- edge: a left-leaning chain (degenerate), 10 nodes -- every node has exactly one (left) child,
     *    so it is the textbook degenerate shape, and maximally unbalanced. -- */
    int chain_values[] = {90, 84, 78, 72, 66, 60, 54, 48, 42, 36};
    root = build_left_chain(chain_values, 10);
    CHECK(is_full(root) == false);
    CHECK(is_complete(root) == false);
    CHECK(is_degenerate(root) == true);
    CHECK(balanced(root) == false);
    CHECK_EQ_INT(root->value, 90);
    CHECK_EQ_INT(root->left->left->value, 78);   /* third node down the chain */
    CHECK(root->right == NULL);
    free_tree(root);

    /* -- edge: complete but NOT full, 10 nodes -- node "5" (index 4) has only a left child (10, index 9),
     *    every other internal node has two, so is_full is false while is_complete (no gaps) is true. -- */
    int complete_not_full_arr[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    root = build_tree(complete_not_full_arr, 10, 0);
    CHECK(is_full(root) == false);
    CHECK(is_complete(root) == true);
    CHECK(is_degenerate(root) == false);
    CHECK(balanced(root) == true);
    free_tree(root);

    /* -- edge: balanced but NOT complete, 11 nodes -- indices 8, 10, 12 are gaps but 9, 11, 13 (later
     *    indices) hold real nodes, so NOT complete; every left/right height still differs by <= 1
     *    everywhere (hand-traced: the four depth-2 nodes each hang one depth-3 leaf), so balanced. -- */
    int balanced_not_complete_arr[] = {1, 2, 3, 4, 5, 6, 7, 8, SLOT_NONE, 9, SLOT_NONE, 10, SLOT_NONE, 11};
    root = build_tree(balanced_not_complete_arr, 14, 0);
    CHECK(is_complete(root) == false);
    CHECK(is_degenerate(root) == false);
    CHECK(balanced(root) == true);
    free_tree(root);

    TEST_SUMMARY();
}
