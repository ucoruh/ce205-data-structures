#define main program_main
#include "../../c/b_tree_insert.c"
#undef main
#include "../../../test_check.h"

int main(void) {
    /* insert_sorted: builds an ascending run from arbitrary insert order */
    Node n = {0};
    insert_sorted(&n, 5);
    insert_sorted(&n, 1);
    insert_sorted(&n, 3);
    CHECK_EQ_INT(n.n, 3);
    CHECK_EQ_INT(n.keys[0], 1);
    CHECK_EQ_INT(n.keys[1], 3);
    CHECK_EQ_INT(n.keys[2], 5);

    /* insert_sorted: duplicate-safe insertion position (ties keep first-inserted first) */
    Node n2 = {0};
    insert_sorted(&n2, 4);
    insert_sorted(&n2, 4);
    CHECK_EQ_INT(n2.n, 2);
    CHECK_EQ_INT(n2.keys[0], 4);
    CHECK_EQ_INT(n2.keys[1], 4);

    /* split: an order-4 leaf with 4 keys splits into a 2/1 pair around the median */
    Node leaf = {0};
    leaf.leaf = true;
    leaf.keys[0] = 10; leaf.keys[1] = 20; leaf.keys[2] = 30; leaf.keys[3] = 40; leaf.n = 4;
    int median;
    Node *right = split(&leaf, &median);
    CHECK_EQ_INT(median, 30);
    CHECK_EQ_INT(leaf.n, 2);
    CHECK_EQ_INT(leaf.keys[0], 10);
    CHECK_EQ_INT(leaf.keys[1], 20);
    CHECK_EQ_INT(right->n, 1);
    CHECK_EQ_INT(right->keys[0], 40);
    free(right);

    /* b_tree_insert: never splits when order is large relative to n */
    next_id = 0;
    Node *root = new_node(true);
    int never_keys[] = {23, 5, 41, 12, 38, 7, 29, 16, 44, 3};
    for (int i = 0; i < 10; i++)
        root = b_tree_insert(root, 12, never_keys[i]);
    CHECK_EQ_INT(node_count(root), 1);
    CHECK_EQ_INT(tree_height(root), 0);
    CHECK_EQ_INT(root->n, 10);
    /* keys must come out sorted */
    for (int i = 1; i < root->n; i++)
        CHECK(root->keys[i - 1] < root->keys[i]);
    free_tree(root);

    /* b_tree_insert: order=3 ascending is the classic worst case, grows to height >= 2 */
    next_id = 0;
    root = new_node(true);
    for (int i = 1; i <= 14; i++)
        root = b_tree_insert(root, 3, i);
    CHECK(tree_height(root) >= 2);
    CHECK_EQ_INT(node_count(root), 11); /* matches the animation's own reference for this exact input */
    free_tree(root);

    /* b_tree_insert: a single key never needs a split */
    next_id = 0;
    root = new_node(true);
    root = b_tree_insert(root, 4, 99);
    CHECK_EQ_INT(root->leaf, true);
    CHECK_EQ_INT(root->n, 1);
    CHECK_EQ_INT(root->keys[0], 99);
    free_tree(root);

    /* b_tree_insert: order=4, exactly 4 keys forces the very first (root) split */
    next_id = 0;
    root = new_node(true);
    int four_keys[] = {10, 20, 30, 40};
    for (int i = 0; i < 4; i++)
        root = b_tree_insert(root, 4, four_keys[i]);
    CHECK_EQ_INT(root->leaf, false); /* root split: it is now internal */
    CHECK_EQ_INT(root->n, 1);
    CHECK_EQ_INT(root->keys[0], 30);
    CHECK_EQ_INT(node_count(root), 3);
    CHECK_EQ_INT(tree_height(root), 1);
    free_tree(root);

    TEST_SUMMARY();
}
